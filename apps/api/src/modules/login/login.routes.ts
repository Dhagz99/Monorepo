import { Router } from "express";
import { createUserController, getPermissionController, getRoleController, getUsersController, loginController, updateRolePermissionsController, updateUserController } from "./login.controller";
import { authenticateToken } from "../auth/auth.middleware";
import { logout, me } from "../auth/auth.controller";

const router = Router();

router.post("/login", loginController);
router.post("/signup", createUserController);
router.get("/roles", getRoleController)
router.get("/permissions", getPermissionController)
router.get("/users", getUsersController)
router.put(
    "/roles/:id/permissions",
    updateRolePermissionsController
  )

  router.put(
    "/users/:id",
    updateUserController
  )

  router.get("/me", authenticateToken, me);
router.post("/logout", authenticateToken, logout);

export default router;
