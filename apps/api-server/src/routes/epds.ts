import { sendServerError } from "../lib/http-errors";
import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { epdsResponsesTable, mothersTable, alertsTable } from "@workspace/db";
import { eq, desc } from "drizzle-orm";

const router: IRouter = Router();

router.post("/epds", async (req, res): Promise<void> => {
  try {
    const { mother_id, responses, total_score, ppd_flagged } = req.body;
    if (!mother_id || responses == null || total_score == null) {
      res.status(400).json({ error: "mother_id, responses, and total_score are required" });
      return;
    }

    const flagged = ppd_flagged ?? total_score > 12;

    const [record] = await db
      .insert(epdsResponsesTable)
      .values({
        motherId: mother_id,
        responses,
        totalScore: total_score,
        ppdFlagged: flagged,
      })
      .returning();

    if (flagged) {
      const [mother] = await db
        .select()
        .from(mothersTable)
        .where(eq(mothersTable.id, mother_id))
        .limit(1);

      if (mother?.clinicId) {
        await db.insert(alertsTable).values({
          motherId: mother_id,
          clinicId: mother.clinicId,
          alertType: "ppd",
          message: `${mother.name}'s mood check flagged possible postpartum depression (EPDS score ${total_score}/30)`,
          isRead: false,
        });
      }
    }

    res.status(201).json({
      id: record.id,
      mother_id: record.motherId,
      responses: record.responses,
      total_score: record.totalScore,
      ppd_flagged: record.ppdFlagged,
      created_at: record.createdAt,
    });
  } catch (err) {
    req.log.error({ err }, "Failed to submit EPDS");
    sendServerError(res, err);
  }
});

router.get("/epds/:mother_id", async (req, res): Promise<void> => {
  try {
    const raw = Array.isArray(req.params.mother_id) ? req.params.mother_id[0] : req.params.mother_id;

    const rows = await db
      .select()
      .from(epdsResponsesTable)
      .where(eq(epdsResponsesTable.motherId, raw))
      .orderBy(desc(epdsResponsesTable.createdAt));

    res.json(
      rows.map((r) => ({
        id: r.id,
        mother_id: r.motherId,
        responses: r.responses,
        total_score: r.totalScore,
        ppd_flagged: r.ppdFlagged,
        created_at: r.createdAt,
      }))
    );
  } catch (err) {
    req.log.error({ err }, "Failed to list EPDS responses");
    sendServerError(res, err);
  }
});

export default router;
