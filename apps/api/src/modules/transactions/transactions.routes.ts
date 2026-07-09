import { Router } from "express";
import { authenticateToken } from "../auth/auth.middleware";
import { getAdminReactivationPaymentsController, getAdminWithdrawalsController } from "./transactions.controller";


const router = Router();

router.get(
  "/reactivation/payments",
  authenticateToken,
  getAdminReactivationPaymentsController
);

router.get(
  "/withdrawals",
  authenticateToken,
  getAdminWithdrawalsController
);

export default router;