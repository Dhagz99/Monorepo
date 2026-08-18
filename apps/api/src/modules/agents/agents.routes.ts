import { Router } from "express";
import { authenticateToken } from "../auth/auth.middleware";
import { searchAgentsController, getMasterlistController, searchBranchController,searchAgentsReactivateController, registerAgentController,getAllPendingAgentController, updateAgentRegistrationController, getAgentDetailsController, getAgentTransactionsController, checkUniqueInfoController,getAgentTransactionsHistController, readAllNotifController, droppedOrSuspendedAgentController, updateAgentAccountController, getRemainingSalesController, updateAdminAccountController, getAgentEditDetailsController, updateAgentDetailsController} from "./agents.controller";
import { uploadAgentProfile } from "../../middleware/uploadProfile.middleware";



const router = Router();

router.get("/searchAgent", searchAgentsController);
router.get("/searchAgentReactivate", searchAgentsReactivateController);
router.get("/searchBranch", searchBranchController);
router.get("/details/:agentId", getAgentDetailsController);
router.get("/details/:agentId/transactions", getAgentTransactionsController);
router.get("/transactions/:agentId/history", getAgentTransactionsHistController);
router.get("/remaining-sales/:agentId",getRemainingSalesController);
router.get("/:agentId/edit-details",authenticateToken,getAgentEditDetailsController);

router.post("/registerAgent",uploadAgentProfile.single(
    "profilePhoto"
  ), registerAgentController);
router.post("/getPendingAgent", getAllPendingAgentController);
router.post("/getMasterlist",authenticateToken, getMasterlistController);
router.post("/checkUniqueInfo",checkUniqueInfoController);


router.patch("/updateRegistration", updateAgentRegistrationController);
router.patch("/droppedorSuspendedAgent", droppedOrSuspendedAgentController);
router.patch("/read-all/:agentId", readAllNotifController);


router.patch("/update-account",authenticateToken,updateAgentAccountController);
router.patch("/update-admin-account",authenticateToken,updateAdminAccountController);
router.patch("/:agentId/edit-details",authenticateToken,updateAgentDetailsController);


export default router;
