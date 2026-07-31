import { NextFunction, Request, Response } from "express";
import { createOverrideCommissionRuleService, deleteOverrideCommissionRuleService, getAllUsers, getBranchesService, getCommissionSettingsService, getRolesService, searchEligibleAgentsService, updateOverrideCommissionRuleService } from "./general.service";

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