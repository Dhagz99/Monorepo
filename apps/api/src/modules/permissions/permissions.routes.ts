import { Router } from "express";
import { authenticateToken } from "../auth/auth.middleware";
import { getPermissionManagementController ,updateRolePermissionsSettingController} from "./permissions.controller";



const router = Router();

router.get(
  "/permissions",
  authenticateToken,
  getPermissionManagementController
);

router.put(
  "/role-permissions",
  authenticateToken,
  updateRolePermissionsSettingController
);

export default router;