import {
  Request,
  Response,
} from "express";

import {
  agentMasterlist,
  agentTransactions,
  getAgentDetails,
  getAllPendingReg,
  getUniqueInfo,
  registerAgent,
  searchAgents,
  searchBranchs,
  updateAgentRegistration,
  agentTransactionsHist,
  readAllNotif,
  droppedOrSuspendedAgentService,
  updateAgentAccountService,
  getAgentRemainingSales,
} from "./agents.service";

import {
  registrationAgentSchema,
  updateAccSchema,
} from "@repo/shared";

export const searchBranchController = 
    async(
        req:Request,
        res:Response
    ) => {
        try {
            const {search}=
                req.query;

            const result = await searchBranchs(
                typeof search == "string" ? search : undefined
            );
            return res.status(200).json(result);
        } catch (error) {
            console.error(
                "Search Agents Error:",
                error
            );
            return res
            .status(500)
            .json({
            message:
                "Failed to search branches",
            });
        }
    }

export const searchAgentsController =
  async (
    req: Request,
    res: Response
  ) => {
    try {

      const {
        search,
        branchCodes,
      } = req.query;

      let parsedBranchCodes:
        string[] | undefined;

      if (
        typeof branchCodes === "string"
      ) {

        parsedBranchCodes =
          branchCodes.split(",");

      } else if (
        Array.isArray(branchCodes)
      ) {

        parsedBranchCodes =
          branchCodes.filter(
            (
              item
            ): item is string =>
              typeof item ===
              "string"
          );
      }

      const result =
        await searchAgents(
          typeof search ===
            "string"
            ? search
            : undefined,

          parsedBranchCodes
        );

      return res
        .status(200)
        .json(result);

    } catch (error) {

      console.error(
        "Search Agents Error:",
        error
      );

      return res
        .status(500)
        .json({
          message:
            "Failed to search agents",
        });
    }
  };



export const checkUniqueInfoController =
  async (
    req: Request,
    res: Response
  ) => {

    try {

      const {
        username,
        email,
        telephone,
      } = req.body;

      const result =
        await getUniqueInfo({
          username,
          email,
          telephone,
        });

      return res.status(200).json({
        message:
          "Unique check completed",
        data: result,
      });

    } catch (error) {

      console.error(
        "CHECK UNIQUE INFO ERROR:",
        error
      );

      return res.status(500).json({
        message:
          "Failed to check unique info",
      });
    }
  };

export const registerAgentController =
  async (
    req: Request,
    res: Response
  ) => {

    try {

      const validatedData =
        registrationAgentSchema.parse(
          req.body
        );

      const result =
        await registerAgent(
          validatedData
        );

      return res
        .status(201)
        .json({
          message:
            "Agent registered successfully",
          data: result,
        });

    } catch (error: unknown) {

      console.error(
        "REGISTER AGENT ERROR:",
        error
      );

      if (error instanceof Error) {

        return res
          .status(400)
          .json({
            message:
              error.message,
          });
      }

      return res
        .status(500)
        .json({
          message:
            "Failed to register agent",
        });
    }
};

export const getAgentTransactionsController =
  async (
    req: Request,
    res: Response
  ) => {

    try {

      const {
        page,
        limit,
      } = req.query;

      const {
        agentId,
      } = req.params;

      const result =
        await agentTransactions({

          agentId,

          page:
            page
              ? Number(page)
              : 1,

          limit:
            limit
              ? Number(limit)
              : 10,
        });

      return res
        .status(200)
        .json(result);

    } catch (error) {

      console.error(
        "GET AGENT TRANSACTIONS ERROR:",
        error
      );

      return res
        .status(500)
        .json({
          message:
            "Failed to fetch transactions",
        });
    }
  };

export const getAgentTransactionsHistController =
  async (
    req: Request,
    res: Response
  ) => {

    try {

      const {
        agentId,
      } = req.params;

      const {
        limit,
        month,
        year,
      } = req.query;

      const result =
        await agentTransactionsHist({
          agentId,

          limit:
            limit
              ? Number(limit)
              : 2,

          month:
            month
              ? Number(month)
              : undefined,

          year:
            year
              ? Number(year)
              : undefined,
        });

      return res
        .status(200)
        .json(result);

    } catch (error) {

      console.error(
        "GET AGENT TRANSACTIONS ERROR:",
        error
      );

      return res
        .status(500)
        .json({
          message:
            "Failed to fetch transactions",
        });
    }
  };

export const getMasterlistController = async (
  req:Request,
  res:Response
) =>{
    try {
      const {
        page,
        limit,
        search,
        status,
      } = req.query;

      const user = req.user;

      console.log(JSON.stringify(req.user, null, 2));

      const isBranchAccount =
      user?.roles?.includes("BRANCH_ACC") ?? false;

      console.log(user?.branchCode)
      const result = await agentMasterlist({
        page: page
          ? Number(page)
          : 1,
  
        limit: limit
          ? Number(limit)
          : 10,
  
        search:
          typeof search === "string"
            ? search
            : undefined,
  
        status:
          typeof status === "string"
            ? status
            : undefined,

        branchCode:
          isBranchAccount && user?.branchCode
            ? user.branchCode
            : undefined,
          });
  
      return res.status(200).json(result);
  
    } catch (error) {
      console.error(
        "Get Agent Error:",
        error
      );
  
      return res.status(500).json({
        message:
          "Failed to fetch agents",
      });
    }
}

export const getAllPendingAgentController = async (
  req:Request,
  res:Response
) =>{
    try {
      const {
        page,
        limit,
        search,
        status,
      } = req.query;

  
      const result = await getAllPendingReg({
        page: page
          ? Number(page)
          : 1,
  
        limit: limit
          ? Number(limit)
          : 10,
  
        search:
          typeof search === "string"
            ? search
            : undefined,
  
        status:
          typeof status === "string"
            ? status
            : undefined,
      });
  
      return res.status(200).json(result);
  
    } catch (error) {
      console.error(
        "Get Agent Error:",
        error
      );
  
      return res.status(500).json({
        message:
          "Failed to fetch agents",
      });
    }
}

export const updateAgentRegistrationController = async(
  req:Request,
  res:Response
) => {
  try {
    const {
      agentId,
      status
    } = req.body;

    const result = await updateAgentRegistration(
      agentId,status
    );

    return res.status(200).json({
      message:
      "Agent status updated successfully",
      data:result,
    })

  }catch(error){
      console.error(
        "UPDATE AGENT STATUS ERROR:",
        error
      );

      return res.status(500).json({
        message:
          "Failed to update agent status",
      });
  };
};

export const droppedOrSuspendedAgentController = async (
  req: Request,
  res: Response
) => {
  try {

    const {
      agentId,
      status,
    } = req.body;

    if (!agentId) {
      return res.status(400).json({
        message: "Agent ID is required",
      });
    }

    if (
      status !== "DROPPED" &&
      status !== "SUSPENDED"
    ) {
      return res.status(400).json({
        message:
          "Status must be DROPPED or SUSPENDED",
      });
    }

    const result =
      await droppedOrSuspendedAgentService(
        agentId,
        status
      );

    return res.status(200).json({
      message:
        `Agent ${status.toLowerCase()} successfully`,
      data: result,
    });

  }catch(error: any){
  console.error(error);

  return res.status(500).json({
    message: error.message,
  });

  }
};


export const readAllNotifController = async (
  req: Request,
  res: Response
)  => {
  try{
    const {agentId} = req.params

    const result =
      await readAllNotif(
        agentId
      )
    return res.status(200).json({
        success: true,
        updatedCount: result.count,
      });
    } catch (error) {
      console.error(error);

      return res.status(500).json({
        success: false,
        message:
          "Failed to update notifications",
      });
    }
};




  export const getAgentDetailsController =
  async (
    req: Request,
    res: Response
  ) => {

    try {

      const { agentId } =
        req.params;

      const result =
        await getAgentDetails(
          agentId
        );

      return res
        .status(200)
        .json(result);

    } catch (error) {

      console.error(
        "GET AGENT DETAILS ERROR:",
        error
      );

      if (
        error instanceof Error
      ) {

        return res
          .status(404)
          .json({
            message:
              error.message,
          });
      }

      return res
        .status(500)
        .json({
          message:
            "Failed to fetch agent details",
        });
    }
  };


  export const updateAgentAccountController =
  async (
    req: Request,
    res: Response
  ) => {
    try {

      const parsed =
        updateAccSchema.safeParse(
          req.body
        );

      if (!parsed.success) {
        return res.status(400).json({
          errors:
            parsed.error.flatten(),
        });
      }

      const userId =
        (req as any).user.id;

      const result =
        await updateAgentAccountService(
          userId,
          parsed.data
        );

      return res.status(200).json({
        message:
          "Account updated successfully",
        data: result,
      });

    } catch (error) {

      console.error(error);

      return res.status(500).json({
        message:
          "Failed to update account",
      });
    }
  };


export const getRemainingSalesController =
  async (
    req: Request,
    res: Response
  ) => {

    try {

      const { agentId } =
        req.params;

      const result =
        await getAgentRemainingSales(
          agentId
        );

      return res.status(200).json(
        result
      );

    } catch (error) {

      return res.status(500).json({
        message:
          "Failed to get remaining sales",
      });
    }
  };
