import { NextFunction, Request, Response } from "express";
import { createBranchService, createOverrideCommissionRuleService, deleteBranchService, deleteOverrideCommissionRuleService, getAllBranches, getAllUsers, getBranchesService, getCommissionSettingsService, getCompanyOptionsService, getRolesService, DeleteUserService, searchEligibleAgentsService, updateBranchService, updateOverrideCommissionRuleService, getAllCompanies, createCompanyService, updateCompanyService } from "./general.service";

export const getCommissionSettingsController =
  async (
    req: Request,
    res: Response
  ) => {
    try {

      const result =
        await getCommissionSettingsService();

      return res.status(200).json({
        message:
          "Commission settings fetched successfully",
        data: result,
      });

    } catch (error) {

      console.error(
        "GET COMMISSION SETTINGS ERROR:",
        error
      );

      return res.status(500).json({
        message:
          "Failed to fetch commission settings",
      });
    }
  };

export const getAllUsersController = async (
  req:Request,
  res:Response
) => {

     try {
          const {
            page,
            limit,
            search,
            status,
          } = req.query;
    
      
          const result = await getAllUsers({
            page: page
              ? Number(page)
              : 1,
      
            limit: limit
              ? Number(limit)
              : 5,
      
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
            "Get Users Error:",
            error
          );
      
          return res.status(500).json({
            message:
              "Failed to fetch users",
          });
        }

}


export const BranchesController = async (
  req:Request,
  res:Response
) => {

     try {
          const {
            page,
            limit,
            search,
          } = req.query;
    
      
          const result = await getAllBranches({
            page: page
              ? Number(page)
              : 1,
      
            limit: limit
              ? Number(limit)
              : 5,
      
            search:
              typeof search === "string"
                ? search
                : undefined,
      
          });
      
          return res.status(200).json(result);
      
        } catch (error) {
          console.error(
            "Get Branches Error:",
            error
          );
      
          return res.status(500).json({
            message:
              "Failed to fetch branches",
          });
        }

}

export const CompaniesController = async (
  req:Request,
  res:Response
) => {

     try {
          const {
            page,
            limit,
            search,
          } = req.query;
    
      
          const result = await getAllCompanies({
            page: page
              ? Number(page)
              : 1,
      
            limit: limit
              ? Number(limit)
              : 5,
      
            search:
              typeof search === "string"
                ? search
                : undefined,
      
          });
      
          return res.status(200).json(result);
      
        } catch (error) {
          console.error(
            "Get Companies Error:",
            error
          );
      
          return res.status(500).json({
            message:
              "Failed to fetch companies",
          });
        }

}

export const getCompanyOptionsController =
  async (
    req: Request,
    res: Response
  ) => {
    try {
      const companies =
        await getCompanyOptionsService();

      return res.status(200).json({
        data: companies,
      });
    } catch (error) {
      console.error(
        "GET COMPANY OPTIONS ERROR:",
        error
      );

      return res.status(500).json({
        message:
          "Failed to fetch companies.",
      });
    }
  };


export const createCompanyController = 
  async (
    req:Request,
    res:Response,
    next: NextFunction
  ) => {
    try{
      const{
        companyCode,
        companyName
      } = req.body;
      if (
        !companyCode ||
        !companyName
      ){
        return res
          .status(400)
          .json({
            message:
              "Company code and company name are required.",
          });
      }
      const result =
        await createCompanyService({
          companyCode,
          companyName,
        });
    
      return res
        .status(201)
        .json({
          message:
            "Company created successfully.",
          data: result,
        });

    }catch(error){
      next(error);
    }
  }


export const createBranchController =
  async (
    req: Request,
    res: Response
  ) => {
    try {
      const {
        branchCode,
        companyId,
        location,
      } = req.body;

      if (
        !branchCode ||
        !companyId ||
        !location
      ) {
        return res
          .status(400)
          .json({
            message:
              "Branch code, company, and location are required.",
          });
      }

      const result =
        await createBranchService({
          branchCode,
          companyId,
          location,
        });

      return res
        .status(201)
        .json({
          message:
            "Branch created successfully.",
          data: result,
        });

    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Failed to create branch.";

      return res
        .status(400)
        .json({
          message,
        });
    }
  };

export const updateCompanyController =
  async (
    req:Request,
    res:Response,
    next:NextFunction
  )=>{
    try{
      const {
        companyCode,
      } = req.params

      const {
        actionType,
        companyName
      } = req.body

      if (
        actionType !== "EDIT" &&
        actionType !== "DELETE"
      ) {
        return res 
          .status(400)
          .json({
            message:
              "Invalid action type.",
          });
      }

      const result =
        await updateCompanyService(
          companyCode,
          actionType === "EDIT" 
              ? {
                actionType: 
                  "EDIT",
                companyName,
              }
              :{
                actionType:
                "DELETE",
              }
        );


        return res.status(200).json({
          message:
            actionType === "DELETE"
              ? "Company deleted successfully."
              : "Company updated successfully",
          data: result,
        })

    }catch(error){
      next(error)
    }
  }

export const updateBranchController =
  async (
    req: Request,
    res: Response
  ) => {
    try {
      const {
        branchCode,
      } = req.params;

      const result =
        await updateBranchService(
          branchCode,
          req.body
        );

      return res.status(200).json({
        message:
          "Branch updated successfully.",
        data: result,
      });
    } catch (error) {
      return res.status(400).json({
        message:
          error instanceof Error
            ? error.message
            : "Failed to update branch.",
      });
    }
  };

export const deleteBranchController =
  async (
    req: Request,
    res: Response,
  ) => {
    try {
      const {
        branchCode,
      } = req.params;

      await deleteBranchService(
        branchCode
      );

      return res.status(200).json({
        message:
          "Branch deleted successfully.",
      });
    } catch (error) {
      return res.status(400).json({
        message:
          error instanceof Error
            ? error.message
            : "Failed to delete branch.",
      });
    }
  };

export const DeleteUserController = async (
  req:Request,
  res:Response,
  next: NextFunction
) => {
  try{
    const {
      userId,
    } = req.params

    await DeleteUserService(
      Number(userId)
    );
    return res.status(200).json({
      message:
      "User Permanently Deleted Successfully."
    });

  } catch (error) {
    next(error);
  }
};

export const getRolesController = async (
  req:Request,
  res:Response,
  next: NextFunction
) => {
  try{
    const data = await getRolesService();

    return res.status(200).json({
      success:true,
      data,
    });

  } catch (error) {
    next(error);
  }
}

export const getBranchesController = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const data = await getBranchesService();

        return res.json({
            success: true,
            data,
        });
    } catch (err) {
        next(err);
    }
};




export const searchEligibleAgentsController =
  async (
    req: Request,
    res: Response
  ) => {
    try {
      const search =
        typeof req.query.search ===
        "string"
          ? req.query.search
          : "";

      const result =
        await searchEligibleAgentsService(
          search
        );

      return res.status(200).json(
        result
      );
    } catch (error) {
      console.error(
        "SEARCH ELIGIBLE AGENTS ERROR:",
        error
      );

      return res.status(500).json({
        message:
          error instanceof Error
            ? error.message
            : "Failed to search agents.",
      });
    }
  };


export async function createOverrideCommissionRuleController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const result =
      await createOverrideCommissionRuleService({
        receiverLevel:
          req.body.receiverLevel,

        sourceLevel:
          req.body.sourceLevel,

        amount:
          Number(
            req.body.amount
          ),
      });

    return res.status(201).json({
      success: true,

      message:
        "Override commission rule created successfully.",

      data:
        result,
    });
  } catch (error) {
    next(error);
  }
}

export async function updateOverrideCommissionRuleController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const id =
      req.params.id;

    if (!id) {
      return res.status(400).json({
        success: false,
        message:
          "Override rule ID is required.",
      });
    }

    const result =
      await updateOverrideCommissionRuleService(
        id,
        {
          receiverLevel:
            req.body.receiverLevel,

          sourceLevel:
            req.body.sourceLevel,

          amount:
            Number(
              req.body.amount
            ),
        }
      );

    return res.status(200).json({
      success: true,

      message:
        "Override commission rule updated successfully.",

      data:
        result,
    });
  } catch (error) {
    next(error);
  }
}

export async function deleteOverrideCommissionRuleController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const id =
      req.params.id;

    if (!id) {
      return res.status(400).json({
        success: false,
        message:
          "Override rule ID is required.",
      });
    }

    const result =
      await deleteOverrideCommissionRuleService(
        id
      );

    return res.status(200).json({
      success: true,

      message:
        "Override commission rule deleted successfully.",

      data:
        result,
    });
  } catch (error) {
    next(error);
  }
}