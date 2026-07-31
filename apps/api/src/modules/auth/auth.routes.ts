import { Router } from "express";
import { authenticateToken } from "./auth.middleware";
import { me, logout } from "./auth.controller";

const router = Router();



export default router;
