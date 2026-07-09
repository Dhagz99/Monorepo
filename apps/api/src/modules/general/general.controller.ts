import { NextFunction, Request, Response } from "express";
import { getAllUsers, getBranchesService, getCommissionSettingsService, getRolesService } from "./general.service";

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