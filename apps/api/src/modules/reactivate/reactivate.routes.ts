// routes/reactivation.route.ts

import express from "express";
import { checkReactivationController, getMyReactivationApprovalProgressController, getMyReactivationApprovalsController, reviewReactivationApprovalController, selfReactivateController, submitAdminReactivationRequestController } from "./reactivate.controller";
import { authenticateToken } from "../auth/auth.middleware";
import { uploadReactivationRequest } from "../agents/utils/upload.middleware";



const router = express.Router();

router.get(
  "/check",
  authenticateToken,
  checkReactivationController
);
router.get(
  "/reactivation-approvals/my",
  authenticateToken,
  getMyReactivationApprovalsController
);
router.get(
  "/my-requests/:requestId/progress",
  authenticateToken,
  getMyReactivationApprovalProgressController
);

router.patch(
  "/reactivation-approvals/review",
  authenticateToken,
  reviewReactivationApprovalController
);

router.post(
  "/self",
  authenticateToken,
  selfReactivateController
);
router.post(
  "/admin-reactivation-request",
  authenticateToken,
  uploadReactivationRequest.single(
    "formalRequestFile"
  ),
  submitAdminReactivationRequestController
);


export default router;