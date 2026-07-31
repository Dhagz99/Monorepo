

import { CreditLedgerType, CreditSource, CreditWithdrawalRequest, WithdrawalStatus } from "../../../generated/prisma";
import prisma from "../../lib/prisma";
import { syncAgentCreditScore } from "../../services/creditLedger/creditLedger.service";

type ProcessWithdrawalWebhookInput = {
  payout: CreditWithdrawalRequest;
  payload: any;
  referenceId: string;
};

export const processWithdrawalPayoutWebhook =
  async ({
    payout,
    payload,
    referenceId,
  }: ProcessWithdrawalWebhookInput) => {
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

                completedAt:
                  new Date(),

                failureCode:
                  null,

                failureMessage:
                  null,

                rawWebhook:
                  payload,
              },
            });

          await tx.agentWithdrawalLedger.create({
            data: {
              agentId:
                payout.agentId,

              type:
                CreditLedgerType.RELEASE,

              amount:
                payout.amount,

              sourceType:
                CreditSource.WITHDRAWAL,

              sourceId:
                payout.id,

              description:
                "Withdrawal reserve released after completion",
            },
          });

          await tx.agentWithdrawalLedger.create({
            data: {
              agentId:
                payout.agentId,

              type:
                CreditLedgerType.DEBIT,

              amount:
                payout.amount,

              sourceType:
                CreditSource.WITHDRAWAL,

              sourceId:
                payout.id,

              description:
                "Withdrawal completed",
            },
          });

          await syncAgentCreditScore(
            tx,
            payout.agentId
          );

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

          await tx.agentWithdrawalLedger.create({
            data: {
              agentId:
                payout.agentId,

              type:
                CreditLedgerType.RELEASE,

              amount:
                payout.amount,

              sourceType:
                CreditSource.WITHDRAWAL,

              sourceId:
                payout.id,

              description:
                "Withdrawal reserve released after failure",
            },
          });

          await syncAgentCreditScore(
            tx,
            payout.agentId
          );

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