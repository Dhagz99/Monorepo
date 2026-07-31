import { Router } from "express";
import { authenticateToken } from "../auth/auth.middleware";
import {
  approveWithdrawalRequestController,
  createMyWithdrawalRequestController,
  // handleWithdrawalWebhookController,
  rejectWithdrawalController,
  retryWithdrawalRequestController,
} from "./withdraw.controller";

const router = Router();

router.post(
  "/my",
  authenticateToken,
  createMyWithdrawalRequestController
);

router.post(
  "/admin/:withdrawalId/approve",
  authenticateToken,
  approveWithdrawalRequestController
);

router.post(
  "/admin/:withdrawalId/retry",
  authenticateToken,
  retryWithdrawalRequestController
);

router.post(
  "/admin/:withdrawalId/reject",
  authenticateToken,
  rejectWithdrawalController
);

// NO authenticateToken here. Xendit will not send your JWT.
// router.post(
//   "/webhooks/xendit",
//   handleWithdrawalWebhookController
// );

export default router;