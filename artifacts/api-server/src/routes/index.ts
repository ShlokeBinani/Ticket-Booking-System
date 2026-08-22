import { Router, type IRouter } from "express";
import healthRouter from "./health";
import ticketingRouter from "./ticketing";

const router: IRouter = Router();

router.use(healthRouter);
router.use(ticketingRouter);

export default router;
