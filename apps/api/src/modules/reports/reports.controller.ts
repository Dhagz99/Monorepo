import { Request, Response, NextFunction } from "express";
import {
  getAgentCommissionDetailsPrintService,
  getAgentCommissionDetailsService,
    getAgentCommissionReportService,
    getAgentsNearMaintenanceExpiryService,
  getCommissionPrintService,
  getCommissionReportService,
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


// export const getAgentCommissionReportController = async (
//   req: Request,
//   res: Response,
//   next: NextFunction
// ) => {
//   try {
//     const reportType =
//       typeof req.query.reportType === "string"
//         ? req.query.reportType
//         : undefined;

//     const startPeriod =
//       typeof req.query.startPeriod === "string"
//         ? req.query.startPeriod
//         : undefined;

//     const endPeriod =
//       typeof req.query.endPeriod === "string"
//         ? req.query.endPeriod
//         : undefined;

    
//     const searchName =
//       typeof req.query.searchName === "string"
//         ? req.query.searchName.trim()
//         : undefined;

//     const page = Number(req.query.page ?? 1);
//     const limit = Number(req.query.limit ?? 10);

//     if (
//       reportType !== "AGENT" &&
//       reportType !== "BRANCH"
//     ) {
//       return res.status(400).json({
//         success: false,
//         message:
//           "Report type must be AGENT or BRANCH.",
//       });
//     }

//     if (!startPeriod || !endPeriod) {
//       return res.status(400).json({
//         success: false,
//         message:
//           "Start period and end period are required.",
//       });
//     }

//     if (
//       !Number.isInteger(page) ||
//       page < 1 ||
//       !Number.isInteger(limit) ||
//       limit < 1
//     ) {
//       return res.status(400).json({
//         success: false,
//         message:
//           "Page and limit must be positive integers.",
//       });
//     }

//     const data =
//       await getAgentCommissionReportService({
//         reportType,
//         startPeriod,
//         endPeriod,
//         searchName:
//             searchName || undefined,
//         page,
//         limit,
//       });

//     return res.status(200).json({
//       success: true,
//       data,
//     });
//   } catch (error) {
//     next(error);
//   }
// };

export const getCommissionReportController =
  async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const reportType =
        typeof req.query.reportType === "string"
          ? req.query.reportType
          : undefined;

      const startPeriod =
        typeof req.query.startPeriod === "string"
          ? req.query.startPeriod
          : undefined;

      const endPeriod =
        typeof req.query.endPeriod === "string"
          ? req.query.endPeriod
          : undefined;

      const searchName =
        typeof req.query.searchName === "string"
          ? req.query.searchName.trim()
          : undefined;

      const page = Number(
        req.query.page ?? 1
      );

      const limit = Number(
        req.query.limit ?? 10
      );

      if (
        reportType !== "AGENT" &&
        reportType !== "BRANCH"
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Report type must be AGENT or BRANCH.",
        });
      }

      if (!startPeriod || !endPeriod) {
        return res.status(400).json({
          success: false,
          message:
            "Start period and end period are required.",
        });
      }

      if (startPeriod > endPeriod) {
        return res.status(400).json({
          success: false,
          message:
            "Start period cannot be later than end period.",
        });
      }

      if (
        !Number.isInteger(page) ||
        page < 1 ||
        !Number.isInteger(limit) ||
        limit < 1
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Page and limit must be positive integers.",
        });
      }

      const data =
        await getCommissionReportService({
          reportType,
          startPeriod,
          endPeriod,
          searchName:
            searchName || undefined,
          page,
          limit,
        });

      return res.status(200).json({
        success: true,
        data,
      });
    } catch (error) {
      next(error);
    }
  };

export const getAgentCommissionDetailsController =
  async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const agentId = req.params.agentId;

      const detailType =
        typeof req.query.detailType === "string"
          ? req.query.detailType
          : undefined;

      const startPeriod =
        typeof req.query.startPeriod === "string"
          ? req.query.startPeriod
          : undefined;

      const endPeriod =
        typeof req.query.endPeriod === "string"
          ? req.query.endPeriod
          : undefined;

      const page = Number(req.query.page ?? 1);
      const limit = Number(req.query.limit ?? 5);

      if (
        detailType !== "DIRECT" &&
        detailType !== "OVERRIDE_L2" &&
        detailType !== "OVERRIDE_L3"
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid commission detail type.",
        });
      }

      if (!startPeriod || !endPeriod) {
        return res.status(400).json({
          success: false,
          message:
            "Start and end periods are required.",
        });
      }

      if (
        !Number.isInteger(page) ||
        page < 1 ||
        !Number.isInteger(limit) ||
        limit < 1
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Page and limit must be positive integers.",
        });
      }

      const data =
        await getAgentCommissionDetailsService({
          agentId,
          detailType,
          startPeriod,
          endPeriod,
          page,
          limit,
        });

      return res.status(200).json({
        success: true,
        data,
      });
    } catch (error) {
      next(error);
    }
  };




  export const getCommissionPrintController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const reportType =
      typeof req.query.reportType === "string"
        ? req.query.reportType
        : undefined;

    const startPeriod =
      typeof req.query.startPeriod === "string"
        ? req.query.startPeriod
        : undefined;

    const endPeriod =
      typeof req.query.endPeriod === "string"
        ? req.query.endPeriod
        : undefined;

    const searchName =
      typeof req.query.searchName === "string"
        ? req.query.searchName.trim()
        : undefined;

    if (
      reportType !== "AGENT" &&
      reportType !== "BRANCH"
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Report type must be AGENT or BRANCH.",
      });
    }

    if (!startPeriod || !endPeriod) {
      return res.status(400).json({
        success: false,
        message:
          "Start period and end period are required.",
      });
    }

    if (startPeriod > endPeriod) {
      return res.status(400).json({
        success: false,
        message:
          "Start period cannot be later than end period.",
      });
    }

    const data = await getCommissionPrintService({
      reportType,
      startPeriod,
      endPeriod,
      searchName:
        searchName || undefined,
    });

    return res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    next(error);
  }
};





export const getAgentCommissionDetailsPrintController =
  async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const agentId =
        req.params.agentId;

      const detailType =
        typeof req.query.detailType ===
        "string"
          ? req.query.detailType
          : undefined;

      const startPeriod =
        typeof req.query.startPeriod ===
        "string"
          ? req.query.startPeriod
          : undefined;

      const endPeriod =
        typeof req.query.endPeriod ===
        "string"
          ? req.query.endPeriod
          : undefined;

      if (
        detailType !== "DIRECT" &&
        detailType !== "OVERRIDE_L2" &&
        detailType !== "OVERRIDE_L3"
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid commission detail type.",
        });
      }

      if (!startPeriod || !endPeriod) {
        return res.status(400).json({
          success: false,
          message:
            "Start and end periods are required.",
        });
      }

      const data =
        await getAgentCommissionDetailsPrintService({
          agentId,
          detailType,
          startPeriod,
          endPeriod,
        });

      return res.status(200).json({
        success: true,
        data,
      });
    } catch (error) {
      next(error);
    }
  };