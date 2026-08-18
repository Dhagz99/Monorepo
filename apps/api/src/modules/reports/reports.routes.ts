import { Router } from "express";
import { authenticateToken } from "../auth/auth.middleware";
import {
  getAgentCommissionDetailsController,
    getAgentCommissionDetailsPrintController,
    getAgentsNearMaintenanceExpiryController,
  getCommissionPrintController,
  getCommissionReportController,
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

router.get(
  "/agent-commission",
  authenticateToken,
  getCommissionReportController
);

router.get(
  "/branch-commission",
  authenticateToken,
  getCommissionReportController
);

router.get(
  "/agent-commission/:agentId/details",
  authenticateToken,
  getAgentCommissionDetailsController
);


router.get(
  "/commission/print",
  authenticateToken,
  getCommissionPrintController
);


router.get(
  "/agent-commission/:agentId/details/print",
  authenticateToken,
  getAgentCommissionDetailsPrintController
);

export default router;