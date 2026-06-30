import { sendServerError } from "../lib/http-errors";
import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { clinicsTable } from "@workspace/db";
import { desc } from "drizzle-orm";

const router: IRouter = Router();

router.get("/clinics", async (req, res): Promise<void> => {
  try {
    const rows = await db.select().from(clinicsTable).orderBy(desc(clinicsTable.createdAt));
    res.json(rows);
  } catch (err) {
    req.log.error({ err }, "Failed to list clinics");
    sendServerError(res, err);
  }
});

router.post("/clinics", async (req, res): Promise<void> => {
  try {
    const { name, location, contact } = req.body;
    if (!name) {
      res.status(400).json({ error: "name is required" });
      return;
    }

    const [clinic] = await db
      .insert(clinicsTable)
      .values({ name, location: location ?? null, contact: contact ?? null })
      .returning();

    res.status(201).json(clinic);
  } catch (err) {
    req.log.error({ err }, "Failed to create clinic");
    sendServerError(res, err);
  }
});

export default router;
