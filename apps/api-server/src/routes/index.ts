import { Router, type IRouter } from "express";
import healthRouter from "./health";
import mothersRouter from "./mothers";
import checkinsRouter from "./checkins";
import alertsRouter from "./alerts";
import epdsRouter from "./epds";
import dashboardRouter from "./dashboard";
import riskRouter from "./risk";
import staffRouter from "./staff";
import clinicsRouter from "./clinics";
import authRouter from "./auth";

const router: IRouter = Router();

router.use(healthRouter);
router.use(authRouter);
router.use(mothersRouter);
router.use(checkinsRouter);
router.use(alertsRouter);
router.use(epdsRouter);
router.use(dashboardRouter);
router.use(riskRouter);
router.use(staffRouter);
router.use(clinicsRouter);

export default router;
