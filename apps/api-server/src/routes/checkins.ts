import { sendServerError } from "../lib/http-errors";
import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import {
  pool,
  checkinsTable,
  mothersTable,
  alertsTable,
} from "@workspace/db";
import { eq, desc } from "drizzle-orm";
import { calculateRisk } from "../lib/risk";

const router: IRouter = Router();

type ApiRiskLevel = "low" | "mid" | "high";
type DbRiskLevel = "Low" | "Mid" | "High";

let riskEnumLabels: Set<string> | null = null;

async function getRiskEnumLabels(): Promise<Set<string>> {
  if (riskEnumLabels) return riskEnumLabels;

  const result = await pool.query<{ enumlabel: string }>(
    "select e.enumlabel from pg_enum e join pg_type t on t.oid = e.enumtypid where t.typname = 'risk_level'",
  );
  riskEnumLabels = new Set(result.rows.map((row) => row.enumlabel));
  return riskEnumLabels;
}

function toSupabaseRiskLevel(level: ApiRiskLevel): DbRiskLevel {
  if (level === "high") return "High";
  if (level === "mid") return "Mid";
  return "Low";
}

async function toDbRiskLevel(level: ApiRiskLevel): Promise<string> {
  const labels = await getRiskEnumLabels();
  const supabaseValue = toSupabaseRiskLevel(level);

  if (labels.has(supabaseValue)) return supabaseValue;
  if (labels.has(level)) return level;
  return supabaseValue;
}

function toApiRiskLevel(level: string | null | undefined): ApiRiskLevel | null {
  const normalized = level?.toLowerCase();
  if (normalized === "high" || normalized === "mid" || normalized === "low") return normalized;
  return null;
}

function toApiRiskScore(score: number | null | undefined): number | null {
  if (score == null) return null;
  return score > 1 ? score / 100 : score;
}

router.get("/checkins", async (req, res): Promise<void> => {
  try {
    const { mother_id, limit } = req.query as { mother_id?: string; limit?: string };
    const limitNum = limit ? parseInt(limit, 10) : 50;

    let query = db
      .select({
        id: checkinsTable.id,
        mother_id: checkinsTable.motherId,
        bp_systolic: checkinsTable.bpSystolic,
        bp_diastolic: checkinsTable.bpDiastolic,
        blood_sugar: checkinsTable.bloodSugar,
        body_temp: checkinsTable.bodyTemp,
        heart_rate: checkinsTable.heartRate,
        symptoms: checkinsTable.symptoms,
        notes: checkinsTable.notes,
        risk_score: checkinsTable.riskScore,
        risk_level: checkinsTable.riskLevel,
        created_at: checkinsTable.createdAt,
        mother_name: mothersTable.name,
      })
      .from(checkinsTable)
      .leftJoin(mothersTable, eq(checkinsTable.motherId, mothersTable.id))
      .orderBy(desc(checkinsTable.createdAt))
      .limit(limitNum)
      .$dynamic();

    if (mother_id) {
      const { eq: drizzleEq } = await import("drizzle-orm");
      query = query.where(drizzleEq(checkinsTable.motherId, mother_id));
    }

    const rows = await query;
    res.json(rows.map((r) => ({
      ...r,
      symptoms: r.symptoms ?? [],
      risk_score: toApiRiskScore(r.risk_score),
      risk_level: toApiRiskLevel(r.risk_level),
    })));
  } catch (err) {
    req.log.error({ err }, "Failed to list checkins");
    sendServerError(res, err);
  }
});

router.post("/checkins", async (req, res): Promise<void> => {
  try {
    const {
      mother_id,
      bp_systolic,
      bp_diastolic,
      blood_sugar,
      body_temp,
      heart_rate,
      symptoms,
      notes,
    } = req.body;

    if (!mother_id) {
      res.status(400).json({ error: "mother_id is required" });
      return;
    }

    // Get mother for clinic_id
    const [mother] = await db
      .select()
      .from(mothersTable)
      .where(eq(mothersTable.id, mother_id))
      .limit(1);

    // Calculate risk
    let riskLevel: ApiRiskLevel = "low";
    let riskScore = 0.1;
    const triggeredBy: string[] = [];

    if (bp_systolic && bp_diastolic && blood_sugar && body_temp && heart_rate) {
      const result = calculateRisk({
        bp_systolic,
        bp_diastolic,
        blood_sugar,
        body_temp,
        heart_rate,
      });
      riskLevel = result.risk_level;
      riskScore = result.risk_score;
      triggeredBy.push(...result.triggered_by);
    }

    const [checkin] = await db
      .insert(checkinsTable)
      .values({
        motherId: mother_id,
        bpSystolic: bp_systolic ?? null,
        bpDiastolic: bp_diastolic ?? null,
        bloodSugar: blood_sugar ?? null,
        bodyTemp: body_temp ?? null,
        heartRate: heart_rate ?? null,
        symptoms: symptoms ?? [],
        notes: notes ?? null,
        riskScore: Math.round(riskScore * 100),
        riskLevel: (await toDbRiskLevel(riskLevel)) as never,
      })
      .returning();

    // If high risk, insert alert
    if (riskLevel === "high" && mother?.clinicId) {
      const triggerDesc = triggeredBy
        .map((t) => t.replace(/_/g, " "))
        .join(", ");
      await db.insert(alertsTable).values({
        motherId: mother_id,
        clinicId: mother.clinicId,
        alertType: "maternal_risk",
        message: `High risk vitals detected for ${mother.name}: ${triggerDesc || "risk threshold crossed"}`,
        isRead: false,
      });
    }

    res.status(201).json({
      id: checkin.id,
      mother_id: checkin.motherId,
      mother_name: mother?.name ?? null,
      bp_systolic: checkin.bpSystolic,
      bp_diastolic: checkin.bpDiastolic,
      blood_sugar: checkin.bloodSugar,
      body_temp: checkin.bodyTemp,
      heart_rate: checkin.heartRate,
      symptoms: checkin.symptoms ?? [],
      notes: checkin.notes,
      risk_score: toApiRiskScore(checkin.riskScore),
      risk_level: toApiRiskLevel(checkin.riskLevel),
      created_at: checkin.createdAt,
    });
  } catch (err) {
    req.log.error({ err }, "Failed to create checkin");
    sendServerError(res, err);
  }
});

router.get("/checkins/:id", async (req, res): Promise<void> => {
  try {
    const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;

    const [row] = await db
      .select({
        id: checkinsTable.id,
        mother_id: checkinsTable.motherId,
        bp_systolic: checkinsTable.bpSystolic,
        bp_diastolic: checkinsTable.bpDiastolic,
        blood_sugar: checkinsTable.bloodSugar,
        body_temp: checkinsTable.bodyTemp,
        heart_rate: checkinsTable.heartRate,
        symptoms: checkinsTable.symptoms,
        notes: checkinsTable.notes,
        risk_score: checkinsTable.riskScore,
        risk_level: checkinsTable.riskLevel,
        created_at: checkinsTable.createdAt,
        mother_name: mothersTable.name,
      })
      .from(checkinsTable)
      .leftJoin(mothersTable, eq(checkinsTable.motherId, mothersTable.id))
      .where(eq(checkinsTable.id, raw));

    if (!row) {
      res.status(404).json({ error: "Checkin not found" });
      return;
    }

    res.json({
      ...row,
      symptoms: row.symptoms ?? [],
      risk_score: toApiRiskScore(row.risk_score),
      risk_level: toApiRiskLevel(row.risk_level),
    });
  } catch (err) {
    req.log.error({ err }, "Failed to get checkin");
    sendServerError(res, err);
  }
});

export default router;
