import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import {
  mothersTable,
  checkinsTable,
  alertsTable,
} from "@workspace/db";
import { eq, desc, gte, sql } from "drizzle-orm";

const router: IRouter = Router();

router.get("/dashboard/stats", async (req, res): Promise<void> => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Total patients
    const [{ count: totalPatients }] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(mothersTable);

    // Alerts today
    const [{ count: alertsToday }] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(alertsTable)
      .where(gte(alertsTable.createdAt, today));

    // Check-ins today
    const [{ count: checkinsToday }] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(checkinsTable)
      .where(gte(checkinsTable.createdAt, today));

    // Risk breakdown — latest checkin per mother
    const mothers = await db.select({ id: mothersTable.id }).from(mothersTable);

    const riskCounts = { low: 0, mid: 0, high: 0, none: 0 };

    await Promise.all(
      mothers.map(async (m) => {
        const [latest] = await db
          .select({ risk_level: checkinsTable.riskLevel })
          .from(checkinsTable)
          .where(eq(checkinsTable.motherId, m.id))
          .orderBy(desc(checkinsTable.createdAt))
          .limit(1);
        const level = latest?.risk_level ?? "none";
        riskCounts[level as keyof typeof riskCounts]++;
      })
    );

    res.json({
      total_patients: totalPatients,
      high_risk_count: riskCounts.high,
      alerts_today: alertsToday,
      checkins_today: checkinsToday,
      risk_breakdown: {
        low: riskCounts.low,
        mid: riskCounts.mid,
        high: riskCounts.high,
      },
    });
  } catch (err) {
    req.log.error({ err }, "Failed to get dashboard stats");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/dashboard/recent-alerts", async (req, res): Promise<void> => {
  try {
    const { clinic_id, limit } = req.query as { clinic_id?: string; limit?: string };
    const limitNum = limit ? parseInt(limit, 10) : 10;

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
      .orderBy(desc(alertsTable.createdAt))
      .limit(limitNum);

    let result = rows;
    if (clinic_id) result = result.filter((r) => r.clinic_id === clinic_id);

    res.json(result);
  } catch (err) {
    req.log.error({ err }, "Failed to get recent alerts");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
