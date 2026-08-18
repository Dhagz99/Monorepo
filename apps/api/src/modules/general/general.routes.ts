import { Router } from "express";
import { BranchesController, createBranchController, createOverrideCommissionRuleController, deleteBranchController, deleteOverrideCommissionRuleController, getAllUsersController, getBranchesController, getCommissionSettingsController, getCompanyOptionsController, getRolesController, DeleteUserController, searchEligibleAgentsController, updateBranchController, updateOverrideCommissionRuleController, CompaniesController, createCompanyController, updateCompanyController } from "./general.controller";
import { authenticateToken } from "../auth/auth.middleware";


const router = Router();

router.get("/settings",getCommissionSettingsController);
router.get("/getUsers", getAllUsersController);
router.get("/getBranchesSetting", BranchesController);
router.get("/getCompaniesSetting", CompaniesController);
router.get("/searchEligibleAgents",searchEligibleAgentsController);
router.get("/getRoles", authenticateToken, getRolesController);
router.get("/getBranches",authenticateToken,getBranchesController);
router.get("/companies/options",getCompanyOptionsController);

router.post("/create-override-rules",createOverrideCommissionRuleController);
router.post("/branches",authenticateToken,createBranchController);
router.post("/company",authenticateToken,createCompanyController);

router.put("/update-override-rules/:id",updateOverrideCommissionRuleController);
router.put("/delete-user/:userId", DeleteUserController);
router.patch("/branches/:branchCode",updateBranchController);
router.patch("/company/:companyCode",updateCompanyController);

router.delete("/branches/:branchCode",deleteBranchController);
router.delete("/delete-override-rules/:id",deleteOverrideCommissionRuleController);


export default router;
