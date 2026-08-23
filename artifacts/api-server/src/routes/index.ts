// @ts-nocheck
import { Router, type IRouter } from "express";
import healthRouter from "./health.js";
import ticketingRouter from "./ticketing.js";
import authRouter from "./auth.js";

const router: IRouter = Router();

router.use(healthRouter);
router.use("/auth", authRouter);
router.use(ticketingRouter);

export default router;
