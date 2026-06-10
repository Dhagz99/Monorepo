import { Router } from "express";
import { authenticateToken } from "../auth/auth.middleware";
import { searchAgentsController, getMasterlistController, searchBranchController, registerAgentController,getAllPendingAgentController, updateAgentRegistrationController, getAgentDetailsController, getAgentTransactionsController, checkUniqueInfoController,getAgentTransactionsHistController, readAllNotifController, droppedOrSuspendedAgentController, updateAgentAccountController} from "./agents.controller";


const router = Router();

router.get("/searchAgent", searchAgentsController);
router.get("/searchBranch", searchBranchController);
router.get("/details/:agentId", getAgentDetailsController);
router.get("/details/:agentId/transactions", getAgentTransactionsController);
router.get("/transactions/:agentId/history", getAgentTransactionsHistController);

router.post("/registerAgent", registerAgentController);
router.post("/getPendingAgent", getAllPendingAgentController);
router.post("/getMasterlist", getMasterlistController);
router.post("/checkUniqueInfo",checkUniqueInfoController);


router.patch("/updateRegistration", updateAgentRegistrationController);
router.patch("/droppedorSuspendedAgent", droppedOrSuspendedAgentController);
router.patch("/read-all/:agentId", readAllNotifController);


router.patch("/update-account",authenticateToken,updateAgentAccountController);

export default router;
