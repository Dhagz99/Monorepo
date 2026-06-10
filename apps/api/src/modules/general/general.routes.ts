import { Router } from "express";
import { getAllUsersController, getCommissionSettingsController } from "./general.controller";


const router = Router();

router.get(
  "/settings",
  getCommissionSettingsController
);

router.get("/getUsers", getAllUsersController);



export default router;
