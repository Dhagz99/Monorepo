
import { Router } from "express";
import loginRoutes from "../modules/login/login.routes"

const router = Router();
router.use("/auth", loginRoutes);



export default router;