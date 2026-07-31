import { Router } from "express";
import {
  handleXenditPayoutWebhookController,
} from "./webhooks.controller";

const router = Router();

router.post(
  "/xendit/payout",
  handleXenditPayoutWebhookController
);

export default router;