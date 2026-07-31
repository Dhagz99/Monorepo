import { Request, Response, NextFunction } from "express";
import { getAdminReactivationPaymentsService, getAdminWithdrawalsService } from "./transactions.service";

export const getAdminReactivationPaymentsController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const result = await getAdminReactivationPaymentsService({
      page: req.query.page ? Number(req.query.page) : 1,
      limit: req.query.limit ? Number(req.query.limit) : 10,
      search:
        typeof req.query.search === "string"
          ? req.query.search
          : undefined,
      status:
        typeof req.query.status === "string"
          ? req.query.status
          : undefined,
    });

    return res.status(200).json({
      success: true,
      message: "Reactivation payments fetched successfully.",
      ...result,
    });
  } catch (error) {
    next(error);
  }
};

export const getAdminWithdrawalsController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized user.",
      });
    }
    const result = await getAdminWithdrawalsService({
      userId,
      page: req.query.page ? Number(req.query.page) : 1,
      limit: req.query.limit ? Number(req.query.limit) : 10,
      search:
        typeof req.query.search === "string"
          ? req.query.search
          : undefined,
      status:
        typeof req.query.status === "string"
          ? req.query.status
          : undefined,
    });

    return res.status(200).json({
      success: true,
      message: "Withdrawal requests fetched successfully.",
      ...result,
    });
  } catch (error) {
    next(error);
  }
};