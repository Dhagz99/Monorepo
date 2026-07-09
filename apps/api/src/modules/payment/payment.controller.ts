import { Request, Response, NextFunction } from "express";
import {
  createMyReactivationPaymentSessionService,
  createReactivationPaymentSessionService,
  handleXenditWebhookService,
} from "./payment.service";
import { xenditConfig } from "../../config/xendit.config";

export const createMyReactivationPaymentSessionController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = (req as any).user.id;
    const { requestId } = req.body;

    if (!requestId || typeof requestId !== "string") {
      return res.status(400).json({
        success: false,
        message: "Reactivation request ID is required.",
      });
    }

    const result =
      await createMyReactivationPaymentSessionService(userId, requestId);

    return res.status(200).json({
      success: true,
      message: result.alreadyPaid
        ? "This reactivation payment is already paid."
        : "Reactivation payment session ready.",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const createReactivationPaymentSessionController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = (req as any).user.id;
    const { requestId } = req.params;

    const result =
      await createReactivationPaymentSessionService(userId, requestId);

    return res.status(200).json({
      success: true,
      message: result.alreadyPaid
        ? "This reactivation payment is already paid."
        : "Reactivation payment session ready.",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const handleXenditWebhookController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const callbackToken =
      req.headers["x-callback-token"];

    const token =
      Array.isArray(callbackToken)
        ? callbackToken[0]
        : callbackToken;

    if (
      !token ||
      token !== xenditConfig.webhookToken
    ) {
      return res.status(401).json({
        message: "Invalid Xendit webhook token.",
      });
    }

    const result =
      await handleXenditWebhookService(req.body);

    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};