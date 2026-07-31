// routes/reactivation.route.ts

import express from "express";
import { checkReactivationController, getMyReactivationApprovalProgressController, getMyReactivationApprovalsController, getReactivationRequestDetailsController, reviewReactivationApprovalController, selfReactivateController, submitAdminReactivationRequestController, submitReactivationRequestController } from "./reactivate.controller";
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

router.get(
  "/requests/:requestId/details",authenticateToken,
  getReactivationRequestDetailsController
)

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

router.post(
  "/reactivation-request",
  authenticateToken,
  uploadReactivationRequest.single(
    "formalRequestFile"
  ),
  submitReactivationRequestController
);




export default router;