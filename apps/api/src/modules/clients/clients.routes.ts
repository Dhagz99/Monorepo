import { Router } from "express";
import { getAllClientsController,
    getCommissionDetailsController,
} from "./clients.controller";


const router = Router();

router.post("/getClients", getAllClientsController);


router.get("/commission/details/:clientId", getCommissionDetailsController);

export default router;
