import { sendServerError } from "../lib/http-errors";
import { Router, type IRouter } from "express";
import { calculateRisk } from "../lib/risk";

const router: IRouter = Router();

router.post("/risk/calculate", async (req, res): Promise<void> => {
  try {
    // Accept both snake_case (REST clients) and camelCase (CheckInInput from mobile/web).
    const body = req.body ?? {};
    const bp_systolic = body.bp_systolic ?? body.bpSystolic;
    const bp_diastolic = body.bp_diastolic ?? body.bpDiastolic;
    const blood_sugar = body.blood_sugar ?? body.bloodSugar;
    const body_temp = body.body_temp ?? body.bodyTemp;
    const heart_rate = body.heart_rate ?? body.heartRate;

    if (
      bp_systolic == null ||
      bp_diastolic == null ||
      blood_sugar == null ||
      body_temp == null ||
      heart_rate == null
    ) {
      res.status(400).json({ error: "All vital fields are required" });
      return;
    }

    const result = calculateRisk({ bp_systolic, bp_diastolic, blood_sugar, body_temp, heart_rate });
    res.json({
      level: result.risk_level === "high" ? "High" : result.risk_level === "mid" ? "Mid" : "Low",
      score: Math.round(result.risk_score * 100),
      reasons: result.triggered_by.length > 0 ? result.triggered_by.map((t) => t.replace(/_/g, " ")) : ["Vitals within configured thresholds"],
      model: "api-server-rule-engine-v1",
    });
  } catch (err) {
    req.log.error({ err }, "Failed to calculate risk");
    sendServerError(res, err);
  }
});

export default router;
