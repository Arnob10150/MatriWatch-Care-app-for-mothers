import { sendServerError } from "../lib/http-errors";
import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import {
  checkinsTable,
  mothersTable,
  alertsTable,
} from "@workspace/db";
import { eq, desc } from "drizzle-orm";
import { calculateRisk } from "../lib/risk";

const router: IRouter = Router();

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
    res.json(rows.map((r) => ({ ...r, symptoms: r.symptoms ?? [] })));
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
    let riskLevel: "low" | "mid" | "high" = "low";
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
        riskScore,
        riskLevel,
      })
      .returning();

    // If high risk, insert alert
    if (riskLevel === "high" && mother) {
      const triggerDesc = triggeredBy
        .map((t) => t.replace(/_/g, " "))
        .join(", ");
      await db.insert(alertsTable).values({
        motherId: mother_id,
        clinicId: mother.clinicId!,
        alertType: "high_risk_vitals",
        message: `High risk vitals detected for ${mother.name}: ${triggerDesc}`,
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
      risk_score: checkin.riskScore,
      risk_level: checkin.riskLevel,
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

    res.json({ ...row, symptoms: row.symptoms ?? [] });
  } catch (err) {
    req.log.error({ err }, "Failed to get checkin");
    sendServerError(res, err);
  }
});

export default router;
