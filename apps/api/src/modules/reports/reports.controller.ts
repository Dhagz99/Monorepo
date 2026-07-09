import { Request, Response, NextFunction } from "express";
import {
    getAgentsNearMaintenanceExpiryService,
  getReportsAnalyticsService,
  getTopEarningAgentsService,
} from "./reports.service";

export const getReportsAnalyticsController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const month =
      typeof req.query.month === "string"
        ? req.query.month
        : undefined;
    const data = await getReportsAnalyticsService(month);

    return res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    next(error);
  }
};

export const getTopEarningAgentsController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const month =
      typeof req.query.month === "string"
        ? req.query.month
        : undefined;
    const data = await getTopEarningAgentsService({
      page: Number(req.query.page ?? 1),
      limit: Number(req.query.limit ?? 10),
      month: String(month)
    });

    return res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    next(error);
  }
};

export const getAgentsNearMaintenanceExpiryController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const month =
      typeof req.query.month === "string"
        ? req.query.month
        : undefined;
    const data =
      await getAgentsNearMaintenanceExpiryService({
        page: Number(req.query.page ?? 1),
        limit: Number(req.query.limit ?? 10),
        month: String(month)
      });

    return res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    next(error);
  }
};