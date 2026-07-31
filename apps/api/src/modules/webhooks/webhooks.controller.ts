import {
    NextFunction,
  Request,
  Response,
} from "express";
import { handleXenditPayoutWebhookService } from "./xendit-payout-webhooks.service";
import { xenditConfig } from "../../config/xendit.config";


export const handleXenditPayoutWebhookController =
  async (
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
        token !==
          xenditConfig.webhookToken
      ) {
        return res.status(401).json({
          success: false,
          message:
            "Invalid Xendit webhook token.",
        });
      }

      const result =
        await handleXenditPayoutWebhookService(
          req.body
        );

      return res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };