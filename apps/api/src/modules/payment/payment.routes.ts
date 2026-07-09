import { Router } from "express";
import { createReactivationPaymentSessionController,createMyReactivationPaymentSessionController, handleXenditWebhookController } from "./payment.controller";
import { authenticateToken } from "../auth/auth.middleware";

const router = Router();

router.post(
  "/reactivation/pay",
  authenticateToken,
  createMyReactivationPaymentSessionController
);

router.post(
  "/reactivation/:requestId/pay",
  authenticateToken,
  createReactivationPaymentSessionController
);


router.post(
  "/webhooks/xendit",
  handleXenditWebhookController
);

export default router;