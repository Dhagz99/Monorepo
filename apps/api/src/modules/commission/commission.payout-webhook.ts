
import { CompanyExpenseSource, CompanyExpenseType, CreditWithdrawalRequest, WithdrawalStatus } from "../../../generated/prisma";
import prisma from "../../lib/prisma";

type ProcessCommissionWebhookInput = {
  payout: CreditWithdrawalRequest;
  payload: any;
  referenceId: string;
};

const XENDIT_PAYOUT_FEE_RATE = 0.023;

const calculateCompanyPayoutFee = (amount: number) => {
  return Number((amount * XENDIT_PAYOUT_FEE_RATE).toFixed(2));
};

export const processDirectCommissionPayoutWebhook =
  async ({
    payout,
    payload,
    referenceId,
  }: ProcessCommissionWebhookInput) => {
    const data =
      payload.data ?? payload;

    const status =
      data.status;

    if (
      payout.status ===
        WithdrawalStatus.COMPLETED ||
      payout.status ===
        WithdrawalStatus.FAILED ||
      payout.status ===
        WithdrawalStatus.REJECTED
    ) {
      return {
        alreadyProcessed: true,
        payoutId:
          payout.id,
        status:
          payout.status,
      };
    }

    const nextStatus =
      status === "SUCCEEDED" ||
      status === "COMPLETED"
        ? WithdrawalStatus.COMPLETED
        : status === "FAILED"
        ? WithdrawalStatus.FAILED
        : WithdrawalStatus.PROCESSING;

    if (
      nextStatus ===
      WithdrawalStatus.COMPLETED
    ) {
      return prisma.$transaction(
        async (tx) => {
          const updated =
            await tx.creditWithdrawalRequest.update({
              where: {
                id:
                  payout.id,
              },
              data: {
                status:
                  WithdrawalStatus.COMPLETED,

                xenditExternalId:
                  payout.xenditExternalId ??
                  referenceId,

                xenditDisbursementId:
                  data.id ??
                  payout.xenditDisbursementId,

                failureCode:
                  null,

                failureMessage:
                  null,

                completedAt:
                  new Date(),

                rawWebhook:
                  payload,
              },
            });

          if (
            payout.commissionTransactionId
          ) {
            await tx.commissionTransaction.update({
              where: {
                id:
                  payout.commissionTransactionId,
              },
              data: {
                remarks:
                  "Direct commission payout completed through GCASH",
              },
            });
          }
          const payoutAmount =
        Number(payout.amount);

        const companyFee =
            calculateCompanyPayoutFee(
            payoutAmount
            );

        const existingExpense =
            await tx.convenienceFee.findFirst({
            where: {
                type:
                CompanyExpenseType.XENDIT_PAYOUT_FEE,

                sourceType:
                CompanyExpenseSource.WITHDRAWAL,

                sourceId:
                payout.id,
            },
            });

        if (!existingExpense) {
            await tx.convenienceFee.create({
            data: {
                type:
                CompanyExpenseType.XENDIT_PAYOUT_FEE,

                sourceType:
                CompanyExpenseSource.WITHDRAWAL,

                sourceId:
                payout.id,

                amount:
                companyFee,

                rate:
                XENDIT_PAYOUT_FEE_RATE,

                description:
                `Xendit payout fee for direct commission ${payout.id}`,

                rawData: {
                payoutAmount,
                agentId:
                    payout.agentId,

                payoutPurpose:
                    payout.purpose,

                xenditExternalId:
                    referenceId,

                xenditDisbursementId:
                    data.id ??
                    payout.xenditDisbursementId,
                },
            },
            });
        }
          return updated;
        }
      );
    }

    if (
      nextStatus ===
      WithdrawalStatus.FAILED
    ) {
      return prisma.$transaction(
        async (tx) => {
          const updated =
            await tx.creditWithdrawalRequest.update({
              where: {
                id:
                  payout.id,
              },
              data: {
                status:
                  WithdrawalStatus.FAILED,

                xenditExternalId:
                  payout.xenditExternalId ??
                  referenceId,

                xenditDisbursementId:
                  data.id ??
                  payout.xenditDisbursementId,

                failureCode:
                  data.failure_code ??
                  null,

                failureMessage:
                  data.failure_message ??
                  data.failure_reason ??
                  "Xendit payout failed.",

                rawWebhook:
                  payload,
              },
            });

          if (
            payout.commissionTransactionId
          ) {
            await tx.commissionTransaction.update({
              where: {
                id:
                  payout.commissionTransactionId,
              },
              data: {
                remarks:
                  "Direct commission GCash payout failed",
              },
            });
          }

          return updated;
        }
      );
    }

    return prisma.creditWithdrawalRequest.update({
      where: {
        id:
          payout.id,
      },
      data: {
        status:
          WithdrawalStatus.PROCESSING,

        xenditExternalId:
          payout.xenditExternalId ??
          referenceId,

        xenditDisbursementId:
          data.id ??
          payout.xenditDisbursementId,

        rawWebhook:
          payload,
      },
    });
  };