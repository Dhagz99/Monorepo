import { Request, Response, NextFunction } from "express";
import { approveWithdrawalRequestService, createMyWithdrawalRequestService, handleXenditDisbursementWebhook, rejectWithdrawalService, retryWithdrawalRequestService } from "./withdraw.service";
import { xenditConfig } from "../../config/xendit.config";


export const createMyWithdrawalRequestController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = (req as any).user.id;

    const result =
      await createMyWithdrawalRequestService(
        userId,
        req.body
      );

    return res.status(201).json({
      success: true,
      message: "Withdrawal request submitted successfully.",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const approveWithdrawalRequestController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const adminId = (req as any).user.id;
    const { withdrawalId } = req.params;

    const result =
      await approveWithdrawalRequestService(
        adminId,
        withdrawalId
      );

    return res.status(200).json({
      success: true,
      message:
        "Withdrawal request approved and payout is now processing.",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};


export const retryWithdrawalRequestController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const adminId = (req as any).user.id;
    const { withdrawalId } = req.params;

    const result =
      await retryWithdrawalRequestService(
        adminId,
        withdrawalId
      );

    return res.status(200).json({
      success: true,
      message: "Withdrawal retry started.",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const rejectWithdrawalController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const adminId = (req as any).user.id;
    const { withdrawalId } = req.params;
    const { remarks } = req.body;

    if (!remarks?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Remarks are required.",
      });
    }

    const result =
      await rejectWithdrawalService(
        adminId,
        withdrawalId,
        req.body.remarks
      );

    return res.status(200).json({
      success: true,
      message: "Withdrawal rejected.",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};



export const handleWithdrawalWebhookController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const callbackToken = req.headers["x-callback-token"];

    const token = Array.isArray(callbackToken)
      ? callbackToken[0]
      : callbackToken;

    if (!token || token !== xenditConfig.webhookToken) {
      return res.status(401).json({
        message: "Invalid Xendit webhook token.",
      });
    }

    const result = await handleXenditDisbursementWebhook(req.body);

    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};