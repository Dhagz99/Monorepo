
import { XenditWebhookPayload } from "@repo/shared";
import { PayoutPurpose } from "../../../generated/prisma";
import prisma from "../../lib/prisma";
import { processDirectCommissionPayoutWebhook } from "../commission/commission.payout-webhook";
import { processWithdrawalPayoutWebhook } from "../withdraw/withdraw.payout-webhook";


const extractPayoutId = (
  referenceId: string
) => {
  if (
    referenceId.startsWith(
      "withdrawal_retry_"
    )
  ) {
    return referenceId
      .replace(
        "withdrawal_retry_",
        ""
      )
      .split("_")[0];
  }

  if (
    referenceId.startsWith(
      "withdrawal_"
    )
  ) {
    return referenceId.replace(
      "withdrawal_",
      ""
    );
  }

  if (
    referenceId.startsWith(
      "direct_commission_"
    )
  ) {
    return referenceId.replace(
      "direct_commission_",
      ""
    );
  }

  return null;
};

export const handleXenditPayoutWebhookService =
  async (
    payload: XenditWebhookPayload
  ) => {
    const data =
      payload.data ?? payload;

    const referenceId =
      data.reference_id ??
      data.external_id;

    if (!referenceId) {
      throw new Error(
        "Missing payout reference ID."
      );
    }

    const payoutId =
      extractPayoutId(referenceId);

    const payout =
      await prisma.creditWithdrawalRequest.findFirst({
        where: {
          OR: [
            {
              xenditExternalId:
                referenceId,
            },

            ...(payoutId
              ? [
                  {
                    id:
                      payoutId,
                  },
                ]
              : []),
          ],
        },
      });

    if (!payout) {
      throw new Error(
        "Payout request not found."
      );
    }

    switch (payout.purpose) {
      case PayoutPurpose.WITHDRAWAL:
        return processWithdrawalPayoutWebhook({
          payout,
          payload,
          referenceId,
        });

      case PayoutPurpose.DIRECT_COMMISSION:
        return processDirectCommissionPayoutWebhook({
          payout,
          payload,
          referenceId,
        });

      default:
        throw new Error(
          `Unsupported payout purpose: ${payout.purpose}`
        );
    }
  };