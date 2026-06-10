import { Router } from "express";
import { createCommissionScanController, scannedAgentController, updateCommissionRuleController } from "./commission.controller";


const router = Router();

router.put("/commission-rule",updateCommissionRuleController);


router.get("/scannedAgent", scannedAgentController);


router.post("/create",createCommissionScanController);


export default router;
