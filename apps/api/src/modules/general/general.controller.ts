import { Request, Response } from "express";
import { getAllUsers, getCommissionSettingsService } from "./general.service";

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