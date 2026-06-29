import { sendServerError } from "../lib/http-errors";
import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { alertsTable, mothersTable } from "@workspace/db";
import { eq, desc } from "drizzle-orm";

const router: IRouter = Router();

router.get("/alerts", async (req, res): Promise<void> => {
  try {
    const { clinic_id, is_read } = req.query as { clinic_id?: string; is_read?: string };

    const rows = await db
      .select({
        id: alertsTable.id,
        mother_id: alertsTable.motherId,
        clinic_id: alertsTable.clinicId,
        alert_type: alertsTable.alertType,
        message: alertsTable.message,
        is_read: alertsTable.isRead,
        created_at: alertsTable.createdAt,
        mother_name: mothersTable.name,
      })
      .from(alertsTable)
      .leftJoin(mothersTable, eq(alertsTable.motherId, mothersTable.id))
      .orderBy(desc(alertsTable.createdAt));

    let result = rows;
    if (clinic_id) result = result.filter((a) => a.clinic_id === clinic_id);
    if (is_read === "true") result = result.filter((a) => a.is_read === true);
    if (is_read === "false") result = result.filter((a) => a.is_read === false);

    res.json(result);
  } catch (err) {
    req.log.error({ err }, "Failed to list alerts");
    sendServerError(res, err);
  }
});

router.patch("/alerts/:id/read", async (req, res): Promise<void> => {
  try {
    const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;

    const [updated] = await db
      .update(alertsTable)
      .set({ isRead: true })
      .where(eq(alertsTable.id, raw))
      .returning();

    if (!updated) {
      res.status(404).json({ error: "Alert not found" });
      return;
    }

    res.json({
      id: updated.id,
      mother_id: updated.motherId,
      clinic_id: updated.clinicId,
      alert_type: updated.alertType,
      message: updated.message,
      is_read: updated.isRead,
      created_at: updated.createdAt,
    });
  } catch (err) {
    req.log.error({ err }, "Failed to mark alert read");
    sendServerError(res, err);
  }
});

export default router;
