import { NearExpiryParams, ReportPaginationParams } from "@repo/shared";
import prisma from "../../lib/prisma";



const getMonthRange = (month?: string) => {
  const now = new Date();

  if (!month) {
    return {
      startOfMonth: new Date(
        now.getFullYear(),
        now.getMonth(),
        1
      ),
      endOfMonth: new Date(
        now.getFullYear(),
        now.getMonth() + 1,
        1
      ),
    };
  }

  const [year, monthNumber] = month.split("-").map(Number);

  if (!year || !monthNumber) {
    throw new Error("Invalid month format. Use YYYY-MM.");
  }

  return {
    startOfMonth: new Date(year, monthNumber - 1, 1),
    endOfMonth: new Date(year, monthNumber, 1),
  };
};

const getPagination = (page = 1, limit = 10) => {
  const safePage = Math.max(Number(page) || 1, 1);
  const safeLimit = Math.max(Number(limit) || 10, 1);

  return {
    page: safePage,
    limit: safeLimit,
    skip: (safePage - 1) * safeLimit,
  };
};
export const getReportsAnalyticsService = async (
  month?: string
) => {
  const now = new Date();

  const { startOfMonth, endOfMonth } = getMonthRange(month);

  const nearExpiryWhere = {
    status: "ACTIVE" as const,
    cycleStartDate: {
      gte: startOfMonth,
      lt: endOfMonth,
    },
    OR: [
      {
        remainingSales: {
          gt: 0,
        },
      },
      {
        isCompleted: false,
      },
    ],
  };

  const [
    completedWithdrawals,
    pendingWithdrawals,
    companyExpenses,
    commissions,
    availableCredits,
    recentPayments,
    recentWithdrawals,
    monthlyExpenses,
    agentsNearExpiry,
    agentsNearMaintenanceCount,
    paymentFeeds,
    withdrawalFeeds,
  ] = await Promise.all([
    prisma.creditWithdrawalRequest.aggregate({
      where: {
        status: "COMPLETED",
        completedAt: {
          gte: startOfMonth,
          lt: endOfMonth,
        },
      },
      _sum: {
        amount: true,
      },
      _count: {
        id: true,
      },
    }),

    prisma.creditWithdrawalRequest.count({
      where: {
        status: "PENDING",
      },
    }),

    prisma.companyExpenseLog.aggregate({
      where: {
        createdAt: {
          gte: startOfMonth,
          lt: endOfMonth,
        },
      },
      _sum: {
        amount: true,
      },
      _count: {
        id: true,
      },
    }),

    prisma.commissionTransaction.aggregate({
      where: {
        createdAt: {
          gte: startOfMonth,
          lt: endOfMonth,
        },
      },
      _sum: {
        commissionAmount: true,
      },
      _count: {
        id: true,
      },
    }),

    prisma.agent.aggregate({
      where: {
        deletedAt: null,
      },
      _sum: {
        creditScore: true,
      },
    }),

    prisma.agentReactivationPayment.findMany({
      take: 5,
      orderBy: {
        updatedAt: "desc",
      },
      include: {
        agent: {
          select: {
            fullName: true,
            agentCode: true,
          },
        },
      },
    }),

    prisma.creditWithdrawalRequest.findMany({
      take: 5,
      orderBy: {
        updatedAt: "desc",
      },
      include: {
        agent: {
          select: {
            fullName: true,
            agentCode: true,
          },
        },
      },
    }),

    prisma.companyExpenseLog.groupBy({
      by: ["type"],
      where: {
        createdAt: {
          gte: startOfMonth,
          lt: endOfMonth,
        },
      },
      _sum: {
        amount: true,
      },
      _count: {
        id: true,
      },
    }),

    prisma.agentMaintenanceCycle.findMany({
      where: nearExpiryWhere,
      take: 10,
      orderBy: {
        cycleEndDate: "asc",
      },
      include: {
        agent: {
          select: {
            fullName: true,
            agentCode: true,
            level: true,
          },
        },
      },
    }),

    prisma.agentMaintenanceCycle.count({
      where: nearExpiryWhere,
    }),

    prisma.agentReactivationPayment.findMany({
      take: 8,
      orderBy: {
        updatedAt: "desc",
      },
      include: {
        agent: {
          select: {
            id: true,
            fullName: true,
            agentCode: true,
            level: true,
          },
        },
      },
    }),

    prisma.creditWithdrawalRequest.findMany({
      take: 8,
      orderBy: {
        updatedAt: "desc",
      },
      include: {
        agent: {
          select: {
            id: true,
            fullName: true,
            agentCode: true,
            level: true,
          },
        },
      },
    }),
  ]);

  const totalCompletedWithdrawals =
    Number(completedWithdrawals._sum.amount ?? 0);

  const totalCompanyExpenses =
    Number(companyExpenses._sum.amount ?? 0);

  const totalCommissionGenerated =
    Number(commissions._sum.commissionAmount ?? 0);

  const totalAvailableCredits =
    Number(availableCredits._sum.creditScore ?? 0);

  const activityFeeds = [
    ...paymentFeeds.map((payment) => ({
      id: payment.id,
      type: "REACTIVATION_PAYMENT" as const,
      title: "Reactivation Payment",
      description: `${payment.agent.fullName} has a ${payment.status} reactivation payment.`,
      amount: Number(payment.amount),
      status: payment.status,
      createdAt: payment.updatedAt,
      agent: payment.agent,
    })),

    ...withdrawalFeeds.map((withdrawal) => ({
      id: withdrawal.id,
      type: "WITHDRAWAL" as const,
      title: "Withdrawal Request",
      description: `${withdrawal.agent.fullName} has a ${withdrawal.status} withdrawal request.`,
      amount: Number(withdrawal.amount),
      status: withdrawal.status,
      createdAt: withdrawal.updatedAt,
      agent: withdrawal.agent,
    })),
  ]
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() -
        new Date(a.createdAt).getTime()
    )
    .slice(0, 8);

  return {
    summary: {
      totalCommissionGenerated,
      totalCompletedWithdrawals,
      totalAvailableCredits,
      totalCompanyExpenses,
      pendingWithdrawalsCount: pendingWithdrawals,
      agentsNearMaintenanceCount,
    },

    recentPayments,
    recentWithdrawals,

    monthlyExpenses: monthlyExpenses.map((item) => ({
      type: item.type,
      total: Number(item._sum.amount ?? 0),
      count: item._count.id,
    })),

    agentsNearExpiry,
    activityFeeds,
  };
};

export const getTopEarningAgentsService = async ({
  page = 1,
  limit = 10,
  month,
}: ReportPaginationParams) => {
  const pagination = getPagination(page, limit);

  const now = new Date();

  const { startOfMonth, endOfMonth } = getMonthRange(month);

  const groupedAgents =
    await prisma.commissionTransaction.groupBy({
      by: ["receiverAgentId"],
      where: {
        createdAt: {
          gte: startOfMonth,
          lt: endOfMonth,
        },
      },
      _sum: {
        commissionAmount: true,
      },
      orderBy: {
        _sum: {
          commissionAmount: "desc",
        },
      },
    });

  const total = groupedAgents.length;

  const paginatedAgents = groupedAgents.slice(
    pagination.skip,
    pagination.skip + pagination.limit
  );

  const agentIds = paginatedAgents.map(
    (item) => item.receiverAgentId
  );

  const agents = await prisma.agent.findMany({
    where: {
      id: {
        in: agentIds,
      },
    },
    select: {
      id: true,
      fullName: true,
      agentCode: true,
      level: true,
    },
  });

  const agentsById = Object.fromEntries(
    agents.map((agent) => [agent.id, agent])
  );

  const data = paginatedAgents.map((item) => ({
    agent: agentsById[item.receiverAgentId] ?? null,
    totalCommission: Number(
      item._sum.commissionAmount ?? 0
    ),
  }));

  return {
    data,
    page: pagination.page,
    limit: pagination.limit,
    total,
    totalPages: Math.ceil(total / pagination.limit),
  };
};



export const getAgentsNearMaintenanceExpiryService = async ({
  page = 1,
  limit = 10,
  month,
}: NearExpiryParams & { month?: string }) => {
  const pagination = getPagination(page, limit);

  const {startOfMonth, endOfMonth} = getMonthRange(month);

  const where = {

    cycleStartDate: {
      gte: startOfMonth,
      lt: endOfMonth,
    },

    OR: [
      {
        remainingSales: {
          gt: 0,
        },
      },
      {
        isCompleted: false,
      },
    ],
  };

  const [data, total] = await prisma.$transaction([
    prisma.agentMaintenanceCycle.findMany({
      where,
      skip: pagination.skip,
      take: pagination.limit,
      orderBy: {
        cycleEndDate: "asc",
      },
      include: {
        agent: {
          select: {
            id: true,
            fullName: true,
            agentCode: true,
            level: true,
            status: true,
          },
        },
      },
    }),

    prisma.agentMaintenanceCycle.count({
      where,
    }),
  ]);

  return {
    data,
    page: pagination.page,
    limit: pagination.limit,
    total,
    totalPages: Math.ceil(total / pagination.limit),
  };
};