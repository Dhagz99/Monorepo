

// import { Request, Response } from "express";
// import { checkSelfReactivationEligibility, selfReactivateAgent } from "./reactivate.service";



// export async function checkReactivationController(
//   req: Request,
//   res: Response
// ) {
//   try {


//     const userId = (req as any).user.id


//     if (!userId) {
//       return res.status(400).json({
//         message: "No agent account linked.",
//       });
//     }

//     const result =
//       await checkSelfReactivationEligibility(
//         userId
//       );

//     return res.status(200).json(result);
//   } catch (error) {
//     return res.status(500).json({
//       message:
//         error instanceof Error
//           ? error.message
//           : "Failed to check reactivation.",
//     });
//   }
// }

// export async function selfReactivateController(
//   req: Request,
//   res: Response
// ) {
//   try {
   
//     const userId = (req as any).user.id


//     if (!userId) {
//       return res.status(400).json({
//         message: "No agent account linked.",
//       });
//     }

//     const result =
//       await selfReactivateAgent(userId);

//     return res.status(200).json(result);
//   } catch (error) {
//     return res.status(400).json({
//       message:
//         error instanceof Error
//           ? error.message
//           : "Failed to reactivate account.",
//     });
//   }
// }



import { NextFunction, Request, Response } from "express";
import fs from "fs/promises";
import {
  adminReactivationApprovalService,
  checkSelfReactivationEligibility,
  getMyReactivationApprovalProgressService,
  getMyReactivationApprovalsService,
  getReactivationRequestDetailsService,
  rejectReactivationApprovalService,
  selfReactivateAgent,
  submitAdminReactivationRequestService,
  submitReactivationRequestService,
} from "./reactivate.service";

export async function checkReactivationController(
  req: Request,
  res: Response
) {
  try {
    const userId =
      (req as any).user.id;

    if (!userId) {
      return res.status(401).json({
        message: "Unauthorized user.",
      });
    }

    const result =
      await checkSelfReactivationEligibility(
        userId
      );

    return res.status(200).json(result);

  } catch (error) {
    return res.status(500).json({
      message:
        error instanceof Error
          ? error.message
          : "Failed to check reactivation.",
    });
  }
}

export async function selfReactivateController(
  req: Request,
  res: Response
) {
  try {
    const userId =
      (req as any).user.id;

    if (!userId) {
      return res.status(401).json({
        message: "Unauthorized user.",
      });
    }

    const result =
      await selfReactivateAgent(
        userId
      );

    return res.status(200).json(result);

  } catch (error) {
    return res.status(400).json({
      message:
        error instanceof Error
          ? error.message
          : "Failed to reactivate account.",
    });
  }
}




  export const submitAdminReactivationRequestController =
  async (
    req: Request,
    res: Response
  ) => {
    try {
      const userId =
        (req as any).user.id;

      const file =
        req.file;

      if (!file) {
        return res.status(400).json({
          message:
            "Formal written reactivation request file is required.",
        });
      }

      const result =
        await submitAdminReactivationRequestService(
          userId,
          file
        );

      return res.status(201).json({
        message:
          "Admin reactivation request submitted successfully.",
        data: result,
      });

    } catch (error) {
      if (req.file?.path) {
        try {
          await fs.unlink(req.file.path);
        } catch (unlinkError) {
          console.error(
            "FAILED TO DELETE UPLOADED FILE:",
            unlinkError
          );
        }
      }

      return res.status(400).json({
        message:
          error instanceof Error
            ? error.message
            : "Failed to submit admin reactivation request.",
      });
    }
  };

 export const submitReactivationRequestController = async (
  req: Request,
  res: Response
) => {
  try {
    const userId = req.user?.id;
    const agentCode = req.body.agentCode;
    const file = req.file;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized user.",
      });
    }

    if (
      typeof agentCode !== "string" ||
      !agentCode.trim()
    ) {
      return res.status(400).json({
        success: false,
        message: "Agent code is required.",
      });
    }

    if (!file) {
      return res.status(400).json({
        success: false,
        message:
          "Formal written reactivation request file is required.",
      });
    }

    const result =
      await submitReactivationRequestService(
        userId,
        agentCode.trim(),
        file
      );

    return res.status(201).json({
      success: true,
      message:
        "Admin reactivation request submitted successfully.",
      data: result,
    });
  } catch (error) {
    if (req.file?.path) {
      try {
        await fs.unlink(req.file.path);
      } catch (unlinkError) {
        console.error(
          "FAILED TO DELETE UPLOADED FILE:",
          unlinkError
        );
      }
    }

    return res.status(400).json({
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Failed to submit admin reactivation request.",
    });
  }
};

export const getMyReactivationApprovalsController =
  async (
    req: Request,
    res: Response
  ) => {
    try {
      const userId =
        (req as any).user.id;

      const {
        page,
        limit,
        search,
        status,
      } = req.query;

      const result =
        await getMyReactivationApprovalsService(
          userId,
          {
            page: page ? Number(page) : 1,
            limit: limit ? Number(limit) : 5,

            search:
              typeof search === "string"
                ? search
                : undefined,

            status:
              typeof status === "string"
                ? status
                : undefined,
          }
        );

      return res.status(200).json(result);
    } catch (error) {
      return res.status(400).json({
        message:
          error instanceof Error
            ? error.message
            : "Failed to fetch reactivation approvals.",
      });
    }
  };

export const reviewReactivationApprovalController = async (
  req: Request,
  res: Response
) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized user.",
      });
    }

    const {
      approvalId,
      status,
      remarks,
      requiredSales,
      probationStartDate,
      probationEndDate,
    } = req.body;

    if (
      typeof approvalId !== "string" ||
      !approvalId.trim()
    ) {
      return res.status(400).json({
        success: false,
        message: "Approval ID is required.",
      });
    }

    if (
      status !== "APPROVED" &&
      status !== "REJECTED"
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Status must be APPROVED or REJECTED.",
      });
    }

    if (status === "APPROVED") {
      const parsedRequiredSales =
        Number(requiredSales);

      if (
        !Number.isInteger(parsedRequiredSales) ||
        parsedRequiredSales <= 0
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Required sales must be a positive whole number.",
        });
      }

      if (
        typeof probationStartDate !== "string" ||
        !probationStartDate.trim()
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Probation start date is required.",
        });
      }

      if (
        typeof probationEndDate !== "string" ||
        !probationEndDate.trim()
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Probation end date is required.",
        });
      }

      const startDate = new Date(
        `${probationStartDate}T00:00:00`
      );

      const endDate = new Date(
        `${probationEndDate}T23:59:59.999`
      );

      if (
        Number.isNaN(startDate.getTime()) ||
        Number.isNaN(endDate.getTime())
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid probation date format.",
        });
      }

      if (endDate < startDate) {
        return res.status(400).json({
          success: false,
          message:
            "Probation end date cannot be earlier than the start date.",
        });
      }

      if (
        typeof remarks !== "string" ||
        !remarks.trim()
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Approval remarks are required.",
        });
      }

      const result =
        await adminReactivationApprovalService(
          userId,
          {
            approvalId:
              approvalId.trim(),
            status,
            requiredSales:
              parsedRequiredSales,
            probationStartDate:
              probationStartDate.trim(),
            probationEndDate:
              probationEndDate.trim(),
            remarks:
              remarks.trim(),
          }
        );

      return res.status(200).json({
        success: true,
        message:
          "Reactivation request approved successfully.",
        data: result,
      });
    }

    const result =
      await rejectReactivationApprovalService(
        userId,
        {
          approvalId:
            approvalId.trim(),
          status,
          remarks:
            typeof remarks === "string"
              ? remarks.trim()
              : undefined,
        }

        
      );

    return res.status(200).json({
      success: true,
      message:
        "Reactivation request rejected successfully.",
      data: result,
    });
  } catch (error) {
    console.error(
      "Review reactivation approval error:",
      error
    );

    return res.status(400).json({
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Failed to review reactivation request.",
    });
  }
};


export const getReactivationRequestDetailsController =
  async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { requestId } = req.params;

      if (
        typeof requestId !== "string" ||
        !requestId.trim()
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Request ID is required.",
        });
      }

      const data =
        await getReactivationRequestDetailsService(
          requestId
        );

      return res.status(200).json({
        success: true,
        data,
      });
    } catch (error) {
      next(error);
    }
  };

export const getMyReactivationApprovalProgressController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = (req as any).user.id;
    const { requestId } = req.params;

    const result =
      await getMyReactivationApprovalProgressService(
        userId,
        requestId
      );

    return res.status(200).json({
      success: true,
      message:
        "Reactivation approval progress fetched successfully.",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};