import prisma from "../../lib/prisma";

import {
  RegisterAgentSchema,
  GetPendingAgentParams,
  GetMasterlistParams,
  GetTransactionParams,
  CheckUniqueInfoParams,
  CheckUniqueInfoResponse,
  TransactionHistParams,
  UpdateAgentAccSchema,
  GetRemainingSalesResponse,
  UpdateAdminAccSchema,
  AgentEditDetails,
  UpdateAgentDetailsPayload,
} from "@repo/shared";

import {
  generateTemporaryPassword
} from "./utils/agents.temppass"

import bcrypt from "bcryptjs";
import { AgentLevel, AgentStatus,NotificationType } from "../../../generated/prisma";
import { sendAgentApprovalEmail } from "./utils/email.service";

import {
  emitAdminReactivationApproval,
  emitUplineReactivationApproval,
} from "../../socket/socketEmitter";
import { formatDateForResponse, normalizeNullableString, parseAgentGender, parseNullableDate } from "./helper/agent.helper";




export const getUniqueInfo = async (
  params: CheckUniqueInfoParams
): Promise<CheckUniqueInfoResponse> => {

  const {
    username,
    email,
    telephone,
  } = params;

  const conditions = [];

  if (username) {
    conditions.push({
      username: {
        equals: username,
        mode: "insensitive" as const,
      },
    });
  }

  if (email) {
    conditions.push({
      email: {
        equals: email,
        mode: "insensitive" as const,
      },
    });
  }

  if (telephone) {
    conditions.push({
      telephone: {
        equals: telephone,
      },
    });
  }

  const existingAgent =
    await prisma.agent.findFirst({
      where: {
        OR: conditions,
      },

      select: {
        username: true,
        email: true,
        telephone: true,
      },
    });

  return {
    usernameExists:
      existingAgent?.username?.toLowerCase() ===
      username?.toLowerCase(),

    emailExists:
      existingAgent?.email?.toLowerCase() ===
      email?.toLowerCase(),

    telephoneExists:
      existingAgent?.telephone ===
      telephone,
  };
};

export const searchAgentsReactivate = async (
  search?: string
) => {
if (!search?.trim()) {
    return [];
  }

  const agents = await prisma.agent.findMany({
    where: {
      fullName: {
        contains: search.trim(),
        mode: "insensitive",
      },

      deletedAt: null,

      status: {
        notIn: [
          "PENDING",
          "REJECTED",
          "ACTIVE",
          "PROBATION",
        ],
      },
    },

    orderBy: {
      fullName: "asc",
    },

    take: 10,
  });

  return agents;
};


export const searchAgents = async (
  search?: string,
) => {
  if (!search?.trim()) {
    return [];
  }

  const agents = await prisma.agent.findMany({
    where: {
      fullName: {
        contains: search.trim(),
        mode: "insensitive",
      },

      deletedAt: null,

      level: {
        in: ["L1", "L2"],
      },

      status: {
        notIn: [
          "PENDING",
          "REJECTED",
          "DROPPED",
          "SUSPENDED",
        ],
      },
    },

    orderBy: {
      fullName: "asc",
    },

    take: 10,
  });

  return agents;
};

export const searchBranchs = async (
  search?: string
) => {

  if (!search) {
    return [];
  }

  const branches =
    await prisma.branch.findMany({

      where: {
        companyName: {
          contains: search,
          mode: "insensitive",
        },

        deletedAt: null,
      },

      take: 10,
    });

  return branches.map((branch) => {

    return {

      branchCode:
        branch.branchCode,

      companyName:
        branch.companyName,

    };
  });
};



export const registerAgent = async (
  payload: RegisterAgentSchema
) => {

  const existingUsername =
    await prisma.agent.findUnique({
      where: {
        username: payload.username,
      },
    });

  if (existingUsername) {
    throw new Error(
      "Username already exists"
    );
  }

  const existingQR =
    await prisma.agent.findUnique({
      where: {
        agentCode:
          payload.agentQrCode,
      },
    });

  if (existingQR) {
    throw new Error(
      "QR Code already exists. Please generate again."
    );
  }

  const now = new Date();

  const currentDay =
    now.getDate();

  const isGracePeriod =
    currentDay > 12;

  return prisma.$transaction(
    async (tx) => {

      const agent =
        await tx.agent.create({
          data: {
            agentCode:
              payload.agentQrCode || "",

            username:
              payload.username,

            fullName:
              payload.agentName
                .trim()
                .toLowerCase()
                .replace(
                  /\b\w/g,
                  (char) =>
                    char.toUpperCase()
                ),

            gender:
              payload.agentGender,

            birthDate:
              payload.dateBirth,

            address:
              payload.agentAdd,

            email:
              payload.email,

            telephone:
              payload.agentTel,

            SecondaryTel:
                payload.agentSecTel,

            status:
              AgentStatus.PENDING,

            level:
              payload.selectedAgentLevel as AgentLevel,

            parentAgentId:
              payload.parentAgentId || null,

          },

        });


      await tx.agentNotification.create({
        data: {
          agentId:
            agent.id,

          type:
            NotificationType.AGENT_REGISTRATION,

          title:
            "NEW AGENT",

          message:
            isGracePeriod
              ? "You're now registered as an agent. Your account is currently under grace period. Your first active maintenance cycle will start next month."
              : "You're now registered as an agent. Your maintenance cycle is now active for this month.",
        },
      });

      return {
        agent,
      };
    }
  );
};

export const agentTransactions = async ({
  agentId,
  page = 1,
  limit = 10,
}: GetTransactionParams) => {

  const skip =
    (page - 1) * limit;

  const whereCondition = {
    receiverAgentId: agentId,
  };

  const [data, total] =
    await Promise.all([

      prisma.commissionTransaction.findMany({

        where: whereCondition,

        skip,

        take: limit,

        orderBy: {
          createdAt: "desc",
        },

        include: {

          sourceAgent: {
            select: {
              id: true,
              fullName: true,
              level: true,
              agentCode: true,
            },
          },

          receiverAgent: {
            select: {
              id: true,
              fullName: true,
              level: true,
              agentCode: true,
            },
          },

          commissionRule: true,
        },
      }),

      prisma.commissionTransaction.count({
        where: whereCondition,
      }),
    ]);

  return {

    data,

    total,

    page,

    limit,

    totalPages:
      Math.ceil(total / limit),
  };
};


export const agentTransactionsHist = async ({
  agentId,
  limit = 2,
  month,
  year,
}: TransactionHistParams) => {
  const dateFilter: any = {};

  if (month && year) {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 1);

    dateFilter.createdAt = {
      gte: startDate,
      lt: endDate,
    };
  }

  const withdrawalDateFilter: any = {};

  if (month && year) {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 1);

    withdrawalDateFilter.createdAt = {
      gte: startDate,
      lt: endDate,
    };
  }

  const [commissions, withdrawals] =
    await Promise.all([
      prisma.commissionTransaction.findMany({
        where: {
          receiverAgentId: agentId,
          ...dateFilter,
        },
        orderBy: {
          createdAt: "desc",
        },
        include: {
          sourceAgent: {
            select: {
              id: true,
              fullName: true,
              level: true,
              agentCode: true,
            },
          },
          receiverAgent: {
            select: {
              id: true,
              fullName: true,
              level: true,
              agentCode: true,
            },
          },
          commissionRule: true,
        },
      }),

      prisma.creditWithdrawalRequest.findMany({
        where: {
          agentId,
          ...withdrawalDateFilter,
        },
        orderBy: {
          createdAt: "desc",
        },
      }),
    ]);

  const commissionItems = commissions.map((item) => ({
    id: item.id,
    type: "COMMISSION" as const,
    transactionType: item.commissionType,
    amount: Number(item.commissionAmount),
    status: "COMPLETED",
    remarks: item.remarks,
    createdAt: item.createdAt,

    sourceAgent: item.sourceAgent,
    receiverAgent: item.receiverAgent,

    raw: item,
  }));

  const withdrawalItems = withdrawals.map((item) => ({
    id: item.id,
    type: "WITHDRAWAL" as const,
    transactionType: "GCASH_WITHDRAWAL",
    amount: Number(item.amount),
    status: item.status,
    remarks: item.remarks,
    createdAt: item.createdAt,

    sourceAgent: null,
    receiverAgent: null,

    accountName: item.accountName,
    accountNumber: item.accountNumber,
    payoutChannel: item.payoutChannel,

    raw: item,
  }));

  const merged = [
    ...commissionItems,
    ...withdrawalItems,
  ].sort(
    (a, b) =>
      new Date(b.createdAt).getTime() -
      new Date(a.createdAt).getTime()
  );

  const data = merged.slice(0, limit);

  return {
    data,
    total: merged.length,
    limit,
    totalPages: Math.ceil(merged.length / limit),
  };
};

export const agentMasterlist = async ({
  page = 1,
  limit = 10,
  search,
  status,
}: GetMasterlistParams) => {
  const skip = (page - 1) * limit;

  const whereCondition = {
    ...(status
      ? {
          status: status as AgentStatus,
        }
      : {
          status: {
            notIn: [
              AgentStatus.PENDING,
              AgentStatus.REJECTED,
            ],
          },
        }),

    ...(search?.trim() && {
      fullName: {
        contains: search.trim(),
        mode: "insensitive" as const,
      },
    }),

  };

  const [data, total] = await Promise.all([
    prisma.agent.findMany({
      where: whereCondition,
      skip,
      take: limit,
      orderBy: {
        createdAt: "desc",
      }
    }),

    prisma.agent.count({
      where: whereCondition,
    }),
  ]);

  return {
    data,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
};

export const getAllPendingReg = async ({
  page = 1,
  limit = 10,
  search,
}: GetPendingAgentParams) => {

  const skip =
    (page - 1) * limit;

  const whereCondition = {
    status: "PENDING" as const,

    ...(search && {
      fullName: {
        contains: search,
        mode: "insensitive" as const,
      },
    }),
  };

  const [data, total] =
    await Promise.all([

      prisma.agent.findMany({
        where: whereCondition,

        skip,

        take: limit,

        orderBy: {
          createdAt: "desc",
        },

   
      }),

      prisma.agent.count({
        where: whereCondition,
      }),
    ]);

  return {
    data,
    total,
    page,
    limit,
    totalPages: Math.ceil(
      total / limit
    ),
  };
};


export const updateAgentRegistration = async (
  agentId: string,
  status: "ACTIVE" | "REJECTED"
) => {


  
  const now = new Date();

  const currentMonth =
    now.getMonth() + 1;

  const currentYear =
    now.getFullYear();

  const currentDay =
    now.getDate();

  const isGracePeriod =
    currentDay > 12;

  const cycleStartDate =
    new Date(
      currentYear,
      currentMonth - 1,
      1
    );

  const cycleEndDate =
    new Date(
      currentYear,
      currentMonth,
      0,
      23,
      59,
      59
    );
  return prisma.$transaction(
    async (tx) => {

      const agent =
        await tx.agent.update({
          where: {
            id: agentId,
          },
          data: {
            status,
          },
        });


      if (
        status === "ACTIVE" &&
        ["L1", "L2"].includes(agent.level)
      ) {

        const existingUser =
          await tx.user.findUnique({
            where: {
              agentId: agent.id,
            },
          });

     
        if (existingUser) {

          await tx.user.update({
            where: {
              agentId: agent.id,
            },
            data: {
              isActive: true,
            },
          });

          await tx.agentNotification.create({
            data: {
              agentId: agent.id,
              type: existingUser
                    ? NotificationType.REACTIVATION_REQUEST
                    : NotificationType.AGENT_REGISTRATION,
              title: "ACCOUNT APPROVED",
              message: existingUser
                ? "Your account has been reactivated."
                : `Your account has been approved. Username: ${agent.username}`,
            },
          });

        } else {

          const agentRole =
            await tx.role.findUnique({
              where: {
                name: "AGENT_ACC",
              },
            });

          if (!agentRole) {
            throw new Error(
              "AGENT_ACC role not found"
            );
          }

          const temporaryPassword =
              generateTemporaryPassword(8);

          const hashedPassword =
            await bcrypt.hash(
              temporaryPassword,
              10
            );

          await tx.user.create({
            data: {
              email: agent.email,

              name: agent.fullName,

              username:
                agent.username,

              password:
                hashedPassword,

              isActive: true,

              agentId: agent.id,

              roles: {
                create: [
                  {
                    roleId:
                      agentRole.id,
                  },
                ],
              },
            },
          });

          if (agent.email) {
            await sendAgentApprovalEmail(
              agent.email,
              agent.fullName,
              agent.username,
              temporaryPassword
            );
          }

          await tx.agentNotification.create({
            data: {
              agentId: agent.id,

              type:
                NotificationType.AGENT_REGISTRATION,

              title:
                "ACCOUNT APPROVED",

              message:
                `Your account has been approved. Username: ${agent.username}`,
            },
          });
          
        }
      }else{
         await tx.agentNotification.create({
            data: {
              agentId: agent.id,

              type:
                NotificationType.AGENT_REGISTRATION,

              title:
                "AGENT REGISTERED",

              message:
                `You're now registered as an Agent.`,
            },
          });
      }

    await tx.agentMaintenanceCycle.create({
        data: {
          agentId:
            agent.id,

          cycleMonth:
            currentMonth,

          cycleYear:
            currentYear,

          cycleStartDate,

          cycleEndDate,

          requiredSales:
            isGracePeriod
              ? 0
              : 1,

          completedSales: 0,

          remainingSales:
            isGracePeriod
              ? 0
              : 1,

          isCompleted:
            isGracePeriod,

          isFirstCycle:
            true,

          status:
            isGracePeriod
              ? "GRACE"
              : "ACTIVE",
        },
      });


      return agent;
    }
  );
};

export const droppedOrSuspendedAgentService = async (
  agentId: string,
  status: "DROPPED" | "SUSPENDED"
) => {
  return prisma.$transaction(async (tx) => {

    const agent =
      await tx.agent.update({
        where: {
          id: agentId,
        },
        data: {
          status,
        },
      });

    await tx.user.update({
      where: {
        agentId: agent.id,
      },
      data: {
        isActive: false,
      },
    });

    const isDropped =
      status === "DROPPED";

    await tx.agentNotification.create({
      data: {
        agentId: agent.id,

        type: isDropped
          ? NotificationType.MAINTENANCE_DROPPED
          : NotificationType.MAINTENANCE_SUSPENDED,

        title: isDropped
          ? "ACCOUNT DROPPED"
          : "ACCOUNT SUSPENDED",

        message: isDropped
          ? `Your account has been dropped. Username: ${agent.username}`
          : `Your account has been suspended. Username: ${agent.username}`,
      },
    });

    return agent;
  });
};


export const getAgentDetails = async (
  agentId: string
) => {
  const currentDate = new Date();

  const currentMonth =
    currentDate.getMonth() + 1;

  const currentYear =
    currentDate.getFullYear();

  const agent =
    await prisma.agent.findUnique({
      where: {
        id: agentId,
      },

      include: {
        /* =========================================
           PARENT
        ========================================= */
        parentAgent: {
          select: {
            id: true,
            fullName: true,
            level: true,
            agentCode: true,
          },
        },

        /* =========================================
           DIRECT DOWNLINES

           L1 -> direct L2 agents
           L2 -> direct L3 agents

           Also retrieve each direct downline's
           downlines so an L1 can receive its L3
           descendants.
        ========================================= */
        downlines: {
          select: {
            id: true,
            fullName: true,
            level: true,
            status: true,

            downlines: {
              select: {
                id: true,
                fullName: true,
                level: true,
                status: true,
              },

              orderBy: {
                fullName: "asc",
              },
            },
          },

          orderBy: {
            fullName: "asc",
          },
        },

        /* =========================================
           COMMISSIONS
        ========================================= */
        commissionsEarned: {
          include: {
            sourceAgent: {
              select: {
                fullName: true,
                level: true,
              },
            },

            commissionRule: true,
          },

          orderBy: {
            createdAt: "desc",
          },
        },

        /* =========================================
           CURRENT MAINTENANCE
        ========================================= */
        maintenanceCycles: {
          where: {
            cycleMonth: currentMonth,
            cycleYear: currentYear,
          },

          orderBy: {
            createdAt: "desc",
          },

          take: 1,
        },

        /* =========================================
           NOTIFICATIONS
        ========================================= */
        notifications: {
          orderBy: {
            createdAt: "desc",
          },

          take: 20,
        },
      },
    });

  if (!agent) {
    throw new Error("Agent not found");
  }

  /*
   * Remove the nested `downlines` property from
   * every direct downline.
   */
  const directDownlines =
    agent.downlines.map(
      ({
        downlines: nestedDownlines,
        ...downline
      }) => downline
    );

  /*
   * Only an L1 agent needs the indirect L3 agents.
   *
   * L1
   * ├── L2
   * │   ├── L3
   * │   └── L3
   * └── L2
   *     └── L3
   */
  const indirectL3Downlines =
    agent.level === "L1"
      ? agent.downlines.flatMap(
          (level2Agent) =>
            level2Agent.downlines
        )
      : [];

  /*
   * L1 gets L2 + L3.
   * L2 gets only its direct L3 agents.
   * L3 normally gets no downlines.
   */
  const combinedDownlines =
    agent.level === "L1"
      ? [
          ...directDownlines,
          ...indirectL3Downlines,
        ]
      : directDownlines;

  /*
   * Optional protection against duplicate agents.
   */
  const uniqueDownlines = Array.from(
    new Map(
      combinedDownlines.map((downline) => [
        downline.id,
        downline,
      ])
    ).values()
  ).sort((first, second) =>
    first.fullName.localeCompare(
      second.fullName
    )
  );

  return {
    ...agent,

    /*
     * Override Prisma's nested result with the
     * flattened response expected by the frontend.
     */
    downlines: uniqueDownlines,
  };
};

export const readAllNotif = async (
  agentId: string
) => {
  const result = await prisma.agentNotification.updateMany({
    where:{
      agentId,
      isRead:false,
    },
    data: {
      isRead: true,
    },
  });

  return result;
}


export const updateAgentAccountService =
  async (
    userId: number,
    payload: UpdateAgentAccSchema
  ) => {

    const user =
      await prisma.user.findUnique({
        where: {
          id: userId,
        },
        include: {
          agent: true,
        },
      });

    if (!user) {
      throw new Error(
        "USER_NOT_FOUND"
      );
    }

    if (!user.agentId) {
      throw new Error(
        "AGENT_NOT_FOUND"
      );
    }

    const updateUserData: any = {};

    const updateAgentData: any = {};

    if (payload.email) {
      updateUserData.email =
        payload.email;

      updateAgentData.email =
        payload.email;
    }

    if (payload.agentTel) {
      updateAgentData.telephone =
        payload.agentTel;
    }

    if (
      payload.password &&
      payload.password.trim() !== ""
    ) {
      updateUserData.password =
        await bcrypt.hash(
          payload.password,
          10
        );
    }

    return prisma.$transaction(
      async (tx) => {

        await tx.user.update({
          where: {
            id: userId,
          },
          data: updateUserData,
        });

        const agent =
          await tx.agent.update({
            where: {
              id: user.agentId!,
            },
            data: updateAgentData,
          });



        return agent;
      }
    );
  };


export const updateAdminAccountService =
  async (
    userId: number,
    payload: UpdateAdminAccSchema
  ) => {
    const user =
      await prisma.user.findUnique({
        where: {
          id: userId,
        },
        select: {
          id: true,
        },
      });

    if (!user) {
      throw new Error(
        "USER_NOT_FOUND"
      );
    }

    const updateUserData: {
      email?: string;
      password?: string;
    } = {};

    if (payload.email?.trim()) {
      updateUserData.email =
        payload.email.trim();
    }

    if (
      payload.password?.trim()
    ) {
      updateUserData.password =
        await bcrypt.hash(
          payload.password,
          10
        );
    }

    if (
      Object.keys(updateUserData).length === 0
    ) {
      throw new Error(
        "NO_FIELDS_TO_UPDATE"
      );
    }

    return prisma.user.update({
      where: {
        id: userId,
      },
      data: updateUserData,
      select: {
        id: true,
        email: true,
        username: true,
      },
    });
  };


export const getAgentRemainingSales = async (
  agentId: string
): Promise<GetRemainingSalesResponse> => {

  const agent =
    await prisma.agent.findUnique({
      where: {
        id: agentId,
      },

      select: {
        id: true,
        status: true,
      },
    });

  if (!agent) {
    throw new Error(
      "Agent not found"
    );
  }

  if (agent.status === "ACTIVE") {

    const activeCycle =
      await prisma.agentMaintenanceCycle.findFirst({
        where: {
          agentId: agent.id,
          status: "ACTIVE",
        },

        orderBy: {
          createdAt: "desc",
        },
      });

    return {
      status: agent.status,
      remainingSales:
        activeCycle?.remainingSales ?? 0,
    };
  }

  if (agent.status === "PROBATION") {

    const probationRequest =
      await prisma.agentReactivationRequest.findFirst({
        where: {
          agentId: agent.id,

          status: "PROBATION",
        },

        orderBy: {
          createdAt: "desc",
        },
      });

    if (!probationRequest) {
      return {
        status: agent.status,
        remainingSales: 0,
      };
    }

    return {
      status: agent.status,

      remainingSales:
        Math.max(
          probationRequest.requiredSales -
          probationRequest.completedSales,
          0
        ),
    };
  }

  return {
    status: agent.status,
    remainingSales: 0,
  };
};





// Edit Agent 

export async function getAgentEditDetailsService(
  agentId: string
): Promise<AgentEditDetails> {
  const agent =
    await prisma.agent.findUnique({
      where: {
        id:
          agentId,
      },

      select: {
        id:
          true,

        fullName:
          true,

        agentCode:
          true,

        level:
          true,

        status:
          true,

        gender:
          true,

        birthDate:
          true,

        address:
          true,

        email:
          true,

        telephone:
          true,

        SecondaryTel:
          true,

        user: {
          select: {
            username:
              true,
          },
        },
      },
    });

  if (!agent) {
    throw new Error(
      "Agent not found."
    );
  }

  return {
    id:
      agent.id,

    fullName:
      agent.fullName,

    agentCode:
      agent.agentCode,

    username:
      agent.user?.username ??
      null,

    level:
      agent.level,

    status:
      agent.status,

    gender:
      parseAgentGender(
        agent.gender
      ),

    birthDate:
      formatDateForResponse(
        agent.birthDate
      ),

    address:
      agent.address,

    email:
      agent.email,

    telephone:
      agent.telephone,

    secondaryTel:
      agent.SecondaryTel,
  };
}

export async function updateAgentDetailsService(
  agentId: string,
  payload: UpdateAgentDetailsPayload
): Promise<AgentEditDetails> {
  const fullName =
    payload.fullName.trim();

  const username =
    normalizeNullableString(
      payload.username
    );

  const email =
    normalizeNullableString(
      payload.email
    );

  const telephone =
    normalizeNullableString(
      payload.telephone
    );

  const secondaryTel =
    normalizeNullableString(
      payload.secondaryTel
    );

  const address =
    normalizeNullableString(
      payload.address
    );

  if (!fullName) {
    throw new Error(
      "Agent full name is required."
    );
  }

  if (
    !Object.values(
      AgentLevel
    ).includes(
      payload.level as AgentLevel
    )
  ) {
    throw new Error(
      "Invalid agent level."
    );
  }

  if (
    !Object.values(
      AgentStatus
    ).includes(
      payload.status as AgentStatus
    )
  ) {
    throw new Error(
      "Invalid agent status."
    );
  }

  const gender =
  parseAgentGender(
    payload.gender
  );

  const existingAgent =
    await prisma.agent.findUnique({
      where: {
        id:
          agentId,
      },

      select: {
        id:
          true,
      },
    });

  if (!existingAgent) {
    throw new Error(
      "Agent not found."
    );
  }

  if (
    username &&
    existingAgent.id
  ) {
    const existingUsername =
      await prisma.user.findFirst({
        where: {
          username,

          NOT: {
            agentId:
              existingAgent.id,
          },
        },

        select: {
          id:
            true,
        },
      });

    if (existingUsername) {
      throw new Error(
        "Username is already in use."
      );
    }
  }

  if (email) {
    const existingEmail =
      await prisma.agent.findFirst({
        where: {
          email,

          NOT: {
            id:
              agentId,
          },
        },

        select: {
          id:
            true,
        },
      });

    if (existingEmail) {
      throw new Error(
        "Email is already assigned to another agent."
      );
    }
  }

  await prisma.$transaction(
    async (tx) => {
      await tx.agent.update({
        where: {
          id:
            agentId,
        },

        data: {
          fullName,

          level:
            payload.level as AgentLevel,

          status:
            payload.status as AgentStatus,

          gender,

          birthDate:
            parseNullableDate(
              payload.birthDate
            ),

          address,
          email,
          telephone,

          SecondaryTel:
            secondaryTel,
        },
      });

      if (
        existingAgent.id &&
        username
      ) {
        await tx.user.update({
          where: {
            agentId:
              existingAgent.id,
          },

          data: {
            username,
          },
        });
      }
    }
  );

  return getAgentEditDetailsService(
    agentId
  );
}