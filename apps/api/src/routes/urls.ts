import { Router} from 'express';


import loginRoutes from "../modules/login/login.routes"
import clientsRoutes from "../modules/clients/clients.routes"
import agentsRoutes from "../modules/agents/agents.routes"
import generalRoutes from "../modules/general/general.routes"
import commissionRoutes from "../modules/commission/commission.routes"
import reactivateRoutes from "../modules/reactivate/reactivate.routes"


const router = Router();



router.use("/auth", loginRoutes);
router.use("/clients", clientsRoutes);
router.use("/agents",agentsRoutes);
router.use("/general", generalRoutes);
router.use("/commission",commissionRoutes);
router.use("/reactivation",reactivateRoutes);


export default router;