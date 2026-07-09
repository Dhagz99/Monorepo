

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
  checkSelfReactivationEligibility,
  getMyReactivationApprovalProgressService,
  getMyReactivationApprovalsService,
  reviewReactivationApprovalService,
  selfReactivateAgent,
  submitAdminReactivationRequestService,
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


export const reviewReactivationApprovalController =
  async (
    req: Request,
    res: Response
  ) => {
    try {
      const userId =
        (req as any).user.id;

      const {
        approvalId,
        status,
        remarks,
      } = req.body;

      if (!approvalId) {
        return res.status(400).json({
          message: "Approval ID is required.",
        });
      }

      if (
        status !== "APPROVED" &&
        status !== "REJECTED"
      ) {
        return res.status(400).json({
          message:
            "Status must be APPROVED or REJECTED.",
        });
      }

      const result =
        await reviewReactivationApprovalService(
          userId,
          {
            approvalId,
            status,
            remarks,
          }
        );

      return res.status(200).json({
        message:
          status === "APPROVED"
            ? "Reactivation request approved successfully."
            : "Reactivation request rejected successfully.",
        data: result,
      });

    } catch (error) {
      return res.status(400).json({
        message:
          error instanceof Error
            ? error.message
            : "Failed to review reactivation request.",
      });
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