import { Router, type IRouter } from "express";
import healthRouter from "./health";
import orderInquiriesRouter from "./order-inquiries";

const router: IRouter = Router();

router.use(healthRouter);
router.use(orderInquiriesRouter);

export default router;
