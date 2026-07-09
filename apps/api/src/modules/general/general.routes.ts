import { Router } from "express";
import { getAllUsersController, getBranchesController, getCommissionSettingsController, getRolesController } from "./general.controller";
import { authenticateToken } from "../auth/auth.middleware";


const router = Router();

router.get(
  "/settings",
  getCommissionSettingsController
);

router.get("/getUsers", getAllUsersController);

router.get("/getRoles", authenticateToken, getRolesController);
router.get("/getBranches",authenticateToken,getBranchesController);


export default router;
