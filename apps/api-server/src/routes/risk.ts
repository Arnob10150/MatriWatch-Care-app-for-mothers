import { Router, type IRouter } from "express";
import { calculateRisk } from "../lib/risk";

const router: IRouter = Router();

router.post("/risk/calculate", async (req, res): Promise<void> => {
  try {
    const { bp_systolic, bp_diastolic, blood_sugar, body_temp, heart_rate } = req.body;

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
    res.json(result);
  } catch (err) {
    req.log.error({ err }, "Failed to calculate risk");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
