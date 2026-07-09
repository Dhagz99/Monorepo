import { Router } from "express";
import { authenticateToken } from "../auth/auth.middleware";
import {
    getAgentsNearMaintenanceExpiryController,
  getReportsAnalyticsController,
  getTopEarningAgentsController,
} from "./reports.controller";

const router = Router();

router.get(
  "/analytics",
  authenticateToken,
  getReportsAnalyticsController
);

router.get(
  "/top-agents",
  authenticateToken,
  getTopEarningAgentsController
);

router.get(
  "/maintenance-near-expiry",
  authenticateToken,
  getAgentsNearMaintenanceExpiryController
);

export default router;