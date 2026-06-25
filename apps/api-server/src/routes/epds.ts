import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { epdsResponsesTable } from "@workspace/db";
import { eq, desc } from "drizzle-orm";

const router: IRouter = Router();

router.post("/epds", async (req, res): Promise<void> => {
  try {
    const { mother_id, responses, total_score, ppd_flagged } = req.body;
    if (!mother_id || responses == null || total_score == null) {
      res.status(400).json({ error: "mother_id, responses, and total_score are required" });
      return;
    }

    const [record] = await db
      .insert(epdsResponsesTable)
      .values({
        motherId: mother_id,
        responses,
        totalScore: total_score,
        ppdFlagged: ppd_flagged ?? total_score > 12,
      })
      .returning();

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
    res.status(500).json({ error: "Internal server error" });
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
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
