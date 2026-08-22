import { Router, type IRouter } from "express";
import healthRouter from "./health";
import ticketingRouter from "./ticketing";
import authRouter from "./auth";

const router: IRouter = Router();

router.use(healthRouter);
router.use("/auth", authRouter);
router.use(ticketingRouter);

export default router;
