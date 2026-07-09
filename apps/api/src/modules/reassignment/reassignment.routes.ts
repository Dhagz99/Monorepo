import { Router } from "express";
import { authenticateToken } from "../auth/auth.middleware";
import {
  getDroppedAgentsController,
  getDroppedAgentDownlinesController,
  getAvailableReassignmentUplinesController,
  reassignDownlinesController,
} from "./reassignment.controller";

const router = Router();

router.get(
  "/dropped-agents",
  authenticateToken,
  getDroppedAgentsController
);

router.get(
  "/dropped-agents/:droppedAgentId/downlines",
  authenticateToken,
  getDroppedAgentDownlinesController
);

router.get(
  "/dropped-agents/:droppedAgentId/available-uplines",
  authenticateToken,
  getAvailableReassignmentUplinesController
);

router.post(
  "/reassign-downlines",
  authenticateToken,
  reassignDownlinesController
);

export default router;