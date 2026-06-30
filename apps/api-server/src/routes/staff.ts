import { sendServerError } from "../lib/http-errors";
import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { staffTable, clinicsTable } from "@workspace/db";
import { eq, desc } from "drizzle-orm";

const router: IRouter = Router();

router.get("/staff", async (req, res): Promise<void> => {
  try {
    const { clinic_id, role } = req.query as { clinic_id?: string; role?: string };

    const rows = await db
      .select({
        id: staffTable.id,
        user_id: staffTable.userId,
        name: staffTable.name,
        role: staffTable.role,
        clinic_id: staffTable.clinicId,
        clinic_name: clinicsTable.name,
        created_at: staffTable.createdAt,
      })
      .from(staffTable)
      .leftJoin(clinicsTable, eq(staffTable.clinicId, clinicsTable.id))
      .orderBy(desc(staffTable.createdAt));

    let result = rows;
    if (clinic_id) result = result.filter((r) => r.clinic_id === clinic_id);
    if (role) result = result.filter((r) => r.role === role);

    res.json(result);
  } catch (err) {
    req.log.error({ err }, "Failed to list staff");
    sendServerError(res, err);
  }
});

router.post("/staff", async (req, res): Promise<void> => {
  try {
    const { name, role, clinic_id } = req.body;
    if (!name || !role) {
      res.status(400).json({ error: "name and role are required" });
      return;
    }

    const [staff] = await db
      .insert(staffTable)
      .values({ name, role, clinicId: clinic_id ?? null })
      .returning();

    res.status(201).json({ ...staff, clinic_name: null });
  } catch (err) {
    req.log.error({ err }, "Failed to create staff member");
    sendServerError(res, err);
  }
});

router.delete("/staff/:id", async (req, res): Promise<void> => {
  try {
    const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const [deleted] = await db.delete(staffTable).where(eq(staffTable.id, raw)).returning();

    if (!deleted) {
      res.status(404).json({ error: "Staff member not found" });
      return;
    }

    res.status(204).end();
  } catch (err) {
    req.log.error({ err }, "Failed to delete staff member");
    sendServerError(res, err);
  }
});

export default router;
