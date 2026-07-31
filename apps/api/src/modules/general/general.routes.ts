import { Router } from "express";
import { createOverrideCommissionRuleController, deleteOverrideCommissionRuleController, getAllUsersController, getBranchesController, getCommissionSettingsController, getRolesController, searchEligibleAgentsController, updateOverrideCommissionRuleController } from "./general.controller";
import { authenticateToken } from "../auth/auth.middleware";


const router = Router();

router.get(
  "/settings",
  getCommissionSettingsController
);

router.get("/getUsers", getAllUsersController);
router.get("/searchEligibleAgents",searchEligibleAgentsController);
router.get("/getRoles", authenticateToken, getRolesController);
router.get("/getBranches",authenticateToken,getBranchesController);


router.post(
  "/create-override-rules",
  createOverrideCommissionRuleController
);

router.put(
  "/update-override-rules/:id",
  updateOverrideCommissionRuleController
);

router.delete(
  "/delete-override-rules/:id",
  deleteOverrideCommissionRuleController
);

export default router;
