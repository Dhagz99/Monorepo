// routes/reactivation.route.ts

import express from "express";
import { checkReactivationController, selfReactivateController } from "./reactivate.controller";
import { authenticateToken } from "../auth/auth.middleware";



const router = express.Router();

router.get(
  "/check",
  authenticateToken,
  checkReactivationController
);

router.post(
  "/self",
  authenticateToken,
  selfReactivateController
);

export default router;