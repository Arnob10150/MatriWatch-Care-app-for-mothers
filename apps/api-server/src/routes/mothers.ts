import { sendServerError } from "../lib/http-errors";
import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import {
  mothersTable,
  clinicsTable,
  checkinsTable,
} from "@workspace/db";
import { eq, desc, sql } from "drizzle-orm";
import { logger } from "../lib/logger";

const router: IRouter = Router();

router.get("/mothers", async (req, res): Promise<void> => {
  try {
    const { clinic_id, risk_level } = req.query as { clinic_id?: string; risk_level?: string };

    // Get mothers with latest checkin risk level
    const rows = await db
      .select({
        id: mothersTable.id,
        user_id: mothersTable.userId,
        name: mothersTable.name,
        age: mothersTable.age,
        gestational_age: mothersTable.gestationalAge,
        clinic_id: mothersTable.clinicId,
        due_date: mothersTable.dueDate,
        created_at: mothersTable.createdAt,
        clinic_name: clinicsTable.name,
      })
      .from(mothersTable)
      .leftJoin(clinicsTable, eq(mothersTable.clinicId, clinicsTable.id))
      .orderBy(mothersTable.createdAt);

    // Enrich with latest checkin info
    const enriched = await Promise.all(
      rows.map(async (m) => {
        const [latest] = await db
          .select({
            risk_level: checkinsTable.riskLevel,
            created_at: checkinsTable.createdAt,
          })
          .from(checkinsTable)
          .where(eq(checkinsTable.motherId, m.id))
          .orderBy(desc(checkinsTable.createdAt))
          .limit(1);

        return {
          ...m,
          current_risk_level: latest?.risk_level ?? null,
          last_checkin_at: latest?.created_at ?? null,
        };
      })
    );

    let result = enriched;
    if (clinic_id) result = result.filter((m) => m.clinic_id === clinic_id);
    if (risk_level) result = result.filter((m) => m.current_risk_level === risk_level);

    res.json(result);
  } catch (err) {
    req.log.error({ err }, "Failed to list mothers");
    sendServerError(res, err);
  }
});

router.post("/mothers", async (req, res): Promise<void> => {
  try {
    const { name, age, gestational_age, clinic_id, due_date } = req.body;
    if (!name || !age) {
      res.status(400).json({ error: "name and age are required" });
      return;
    }

    const [mother] = await db
      .insert(mothersTable)
      .values({
        name,
        age,
        gestationalAge: gestational_age ?? null,
        clinicId: clinic_id ?? null,
        dueDate: due_date ?? null,
      })
      .returning();

    res.status(201).json({
      ...mother,
      clinic_name: null,
      current_risk_level: null,
      last_checkin_at: null,
    });
  } catch (err) {
    req.log.error({ err }, "Failed to create mother");
    sendServerError(res, err);
  }
});

router.get("/mothers/:id", async (req, res): Promise<void> => {
  try {
    const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;

    const [row] = await db
      .select({
        id: mothersTable.id,
        user_id: mothersTable.userId,
        name: mothersTable.name,
        age: mothersTable.age,
        gestational_age: mothersTable.gestationalAge,
        clinic_id: mothersTable.clinicId,
        due_date: mothersTable.dueDate,
        created_at: mothersTable.createdAt,
        clinic_name: clinicsTable.name,
      })
      .from(mothersTable)
      .leftJoin(clinicsTable, eq(mothersTable.clinicId, clinicsTable.id))
      .where(eq(mothersTable.id, raw));

    if (!row) {
      res.status(404).json({ error: "Mother not found" });
      return;
    }

    const [latest] = await db
      .select({ risk_level: checkinsTable.riskLevel, created_at: checkinsTable.createdAt })
      .from(checkinsTable)
      .where(eq(checkinsTable.motherId, raw))
      .orderBy(desc(checkinsTable.createdAt))
      .limit(1);

    const recentCheckins = await db
      .select()
      .from(checkinsTable)
      .where(eq(checkinsTable.motherId, raw))
      .orderBy(desc(checkinsTable.createdAt))
      .limit(10);

    res.json({
      ...row,
      current_risk_level: latest?.risk_level ?? null,
      last_checkin_at: latest?.created_at ?? null,
      recent_checkins: recentCheckins.map((c) => ({
        id: c.id,
        mother_id: c.motherId,
        mother_name: row.name,
        bp_systolic: c.bpSystolic,
        bp_diastolic: c.bpDiastolic,
        blood_sugar: c.bloodSugar,
        body_temp: c.bodyTemp,
        heart_rate: c.heartRate,
        symptoms: c.symptoms ?? [],
        notes: c.notes,
        risk_score: c.riskScore,
        risk_level: c.riskLevel,
        created_at: c.createdAt,
      })),
      epds_responses: [],
    });
  } catch (err) {
    req.log.error({ err }, "Failed to get mother");
    sendServerError(res, err);
  }
});

router.patch("/mothers/:id", async (req, res): Promise<void> => {
  try {
    const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const { name, age, gestational_age, clinic_id, due_date } = req.body;

    const updates: Record<string, unknown> = {};
    if (name != null) updates.name = name;
    if (age != null) updates.age = age;
    if (gestational_age !== undefined) updates.gestationalAge = gestational_age;
    if (clinic_id !== undefined) updates.clinicId = clinic_id;
    if (due_date !== undefined) updates.dueDate = due_date;

    const [updated] = await db
      .update(mothersTable)
      .set(updates)
      .where(eq(mothersTable.id, raw))
      .returning();

    if (!updated) {
      res.status(404).json({ error: "Mother not found" });
      return;
    }

    res.json({ ...updated, clinic_name: null, current_risk_level: null, last_checkin_at: null });
  } catch (err) {
    req.log.error({ err }, "Failed to update mother");
    sendServerError(res, err);
  }
});

router.delete("/mothers/:id", async (req, res): Promise<void> => {
  try {
    const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const [deleted] = await db.delete(mothersTable).where(eq(mothersTable.id, raw)).returning();

    if (!deleted) {
      res.status(404).json({ error: "Mother not found" });
      return;
    }

    res.status(204).end();
  } catch (err) {
    req.log.error({ err }, "Failed to delete mother");
    sendServerError(res, err);
  }
});

export default router;
