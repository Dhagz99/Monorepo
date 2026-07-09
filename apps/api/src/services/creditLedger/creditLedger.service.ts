import prisma from "../../lib/prisma";

export const getAgentAvailableCredit = async (
  agentId: string
) => {
  const ledger =
    await prisma.agentWithdrawalLedger.groupBy({
      by: ["type"],
      where: {
        agentId,
      },
      _sum: {
        amount: true,
      },
    });

  const getTotal = (type: string) =>
    Number(
      ledger.find((row) => row.type === type)?._sum.amount ?? 0
    );

  const credits = getTotal("CREDIT");
  const debits = getTotal("DEBIT");
  const reserved = getTotal("RESERVE");
  const released = getTotal("RELEASE");

  const available =
    credits - debits - reserved + released;

  return {
    credits,
    debits,
    reserved,
    released,
    available,
  };
};


export const syncAgentCreditScore = async (
  tx: any,
  agentId: string
) => {
  const ledger =
    await tx.agentWithdrawalLedger.groupBy({
      by: ["type"],
      where: {
        agentId,
      },
      _sum: {
        amount: true,
      },
    });

  const getTotal = (type: string) =>
    Number(
      ledger.find((row: any) => row.type === type)?._sum.amount ?? 0
    );

  const credits = getTotal("CREDIT");
  const debits = getTotal("DEBIT");
  const reserved = getTotal("RESERVE");
  const released = getTotal("RELEASE");

  const available =
    credits - debits - reserved + released;

  await tx.agent.update({
    where: {
      id: agentId,
    },
    data: {
      creditScore: Math.floor(available),
    },
  });

  return available;
};