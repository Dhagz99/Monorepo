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


// export const searchAgents = async (
//   search?: string
// ) => {

//   if (!search) {
//     return [];
//   }

//   const agents =
//     await prisma.agent.findMany({
//       where: {
//         fullName: {
//           contains: search,
//           mode: "insensitive",
//         },

//         deletedAt: null,
//       },

//       select: {
//         id: true,
//         fullName: true,
//         level: true,
//         status: true,
//         agentCode: true,
//       },

//       take: 10,
//     });

//   return agents;
// };

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


export const searchAgents = async (
  search?: string,
  branchCodes?: string[]
) => {

  if (!search) {
    return [];
  }

  const agents =
    await prisma.agent.findMany({

      where: {

        fullName: {
          contains: search,
          mode: "insensitive",
        },

        deletedAt: null,

        ...(branchCodes &&
          branchCodes.length > 0 && {

          branches: {
            some: {
              branchId: {
                in: branchCodes,
              },

              isActive: true,
            },
          },
        }),
      },

      include: {

        parentAgent: {
          select: {
            id: true,
            fullName: true,
            level: true,
            agentCode: true,
          },
        },

        downlines: {
          select: {
            id: true,
            level: true,
          },
        },
      },

      take: 10,
    });

  return agents;
};

// export const searchBranchs = async (
//     search?: string
// ) => {
//     if(!search){
//         return[];
//     }
//     const branches =
//         await prisma.branch.findMany({
//             where:{
//                 companyName:{
//                     contains: search,
//                     mode: "insensitive"
//                 },

//                 deletedAt: null,
//             },
//             select:{
//                 branchCode:true,
//                 companyName:true,
//             },
//             take: 10
//         });
//     return branches;
// }

export const searchBranchs = async (
  search?: string
) => {

  if (!search) {
    return [];
  }

  const MAX_L1 = 10;

  const MAX_L2_PER_L1 = 10;

  const MAX_L3_PER_L2 = 10;

  const branches =
    await prisma.branch.findMany({

      where: {
        companyName: {
          contains: search,
          mode: "insensitive",
        },

        deletedAt: null,
      },

      include: {

        agents: {

          where: {
            isActive: true,
          },

          include: {

            agent: {

              include: {

                downlines: {
                  where: {
                    deletedAt: null,
                  },
                },
              },
            },
          },
        },
      },

      take: 10,
    });

  return branches.map((branch) => {

    const agents =
      branch.agents.map(
        (a) => a.agent
      );

    /* =====================================
       BRANCH COUNTS
       ONLY L1 IS BRANCH-BASED
    ===================================== */

    const l1Agents =
      agents.filter(
        (a) => a.level === "L1"
      );

    const l2Agents =
      agents.filter(
        (a) => a.level === "L2"
      );

    const l3Agents =
      agents.filter(
        (a) => a.level === "L3"
      );

    /* =====================================
       GLOBAL UPLINE VACANCY
       NOT BRANCH-BASED
    ===================================== */

    const availableUplines =
      agents
        .filter(
          (agent) =>
            agent.level === "L1" ||
            agent.level === "L2"
        )
        .map((agent) => {

          /* =========================
             GLOBAL DOWNLINE COUNTS
          ========================= */

          const l2Count =
            agent.downlines.filter(
              (d) =>
                d.level === "L2"
            ).length;

          const l3Count =
            agent.downlines.filter(
              (d) =>
                d.level === "L3"
            ).length;

          /* =========================
             GLOBAL SLOT REMAINING
          ========================= */

          const availableL2Slots =
            agent.level === "L1"
              ? MAX_L2_PER_L1 - l2Count
              : 0;

          const availableL3Slots =
            agent.level === "L2"
              ? MAX_L3_PER_L2 - l3Count
              : 0;

          const hasVacancy =
            agent.level === "L1"
              ? availableL2Slots > 0
              : availableL3Slots > 0;

          return {

            id: agent.id,

            fullName:
              agent.fullName,

            level:
              agent.level,

            agentCode:
              agent.agentCode,

            l2Count,

            l3Count,

            availableL2Slots,

            availableL3Slots,

            hasVacancy,
          };
        })
        .filter(
          (upline) =>
            upline.hasVacancy
        );

    return {

      branchCode:
        branch.branchCode,

      companyName:
        branch.companyName,

      /* =====================================
         ONLY L1 CAPACITY IS BRANCH-BASED
      ===================================== */

      capacity: {

        totalL1:
          l1Agents.length,

        totalL2:
          l2Agents.length,

        totalL3:
          l3Agents.length,

        availableL1Slots:
          MAX_L1 -
          l1Agents.length,
      },

      /* =====================================
         GLOBAL MLM UPLINES
      ===================================== */

      availableUplines,
    };
  });
};



// export const registerAgent =
//   async (
//     payload: RegisterAgentSchema
//   ) => {

//     const existingUsername =
//       await prisma.agent.findUnique({
//         where: {
//           username:
//             payload.username,
//         },
//       });

//     if (existingUsername) {
//       throw new Error(
//         "Username Already Exists"
//       );
//     }

   
//     const existingQR =
//       await prisma.agent.findUnique({
//         where: {
//           agentCode:
//             payload.agentQrCode,
//         },
//       });

//     if (existingQR) {
//       throw new Error(
//         "QR Code already exists Please Generate again"
//       );
//     }


//     const temporaryPassword =
//       generateTemporaryPassword(8);

//     const hashedPassword =
//       await bcrypt.hash(
//         temporaryPassword,
//         10
//       );


//     const agent =
//       await prisma.agent.create({
//         data: {

   
//           agentCode:
//             payload.agentQrCode || "",

//           username:
//             payload.username,

//           password:
//             hashedPassword,

//           fullName:
//             payload.agentName,

//           gender:
//             payload.agentGender,

//           birthDate:
//             payload.dateBirth,

//           address:
//             payload.agentAdd,

//           email:
//             payload.email,

//           telephone:
//             payload.agentTel,

//           status:
//             AgentStatus.PENDING,

//           accountType:
//             payload.agentAccType as AccType,

//           level:
//             payload.selectedAgentLevel as AgentLevel,

//           mustChangePassword:
//             true,

//           parentAgentId:
//             payload.parentAgentId || null,

//           branches: {
//             create:
//               payload.branches.map(
//                 (branch) => ({
//                   branchId:
//                     branch.branchCode || "",
//                 })
//               ),
//           },
//         },

//         include: {
//           branches: {
//             include: {
//               branch: true,
//             },
//           },
//         },
//       });

//     return agent;
//   };

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

            status:
              AgentStatus.PENDING,

            level:
              payload.selectedAgentLevel as AgentLevel,

            parentAgentId:
              payload.parentAgentId || null,

            branches: {
              create:
                payload.branches.map(
                  (branch) => ({
                    branchId:
                      branch.branchCode || "",
                  })
                ),
            },
          },

          include: {
            branches: {
              include: {
                branch: true,
              },
            },
          },
        });

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


// export const agentTransactionsHist = async ({
//   agentId,
//   limit = 5,
//   month,
//   year,
// }: TransactionHistParams) => {

//   const whereCondition: any = {
//     receiverAgentId: agentId,
//   };

//   if (month && year) {

//     const startDate =
//       new Date(year, month - 1, 1);

//     const endDate =
//       new Date(year, month, 1);

//     whereCondition.createdAt = {
//       gte: startDate,
//       lt: endDate,
//     };
//   }

//   const [data, total] =
//     await Promise.all([
//       prisma.commissionTransaction.findMany({
//         where: whereCondition,

//         take: limit,

//         orderBy: {
//           createdAt: "desc",
//         },

//         include: {
//           sourceAgent: {
//             select: {
//               id: true,
//               fullName: true,
//               level: true,
//               agentCode: true,
//             },
//           },

//           receiverAgent: {
//             select: {
//               id: true,
//               fullName: true,
//               level: true,
//               agentCode: true,
//             },
//           },

//           commissionRule: true,
//         },
//       }),

//       prisma.commissionTransaction.count({
//         where: whereCondition,
//       }),
//     ]);

//   return {
//     data,
//     total,
//     limit,
//     totalPages:
//       Math.ceil(total / limit),
//   };
// };

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
  branchCode,
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

    ...(branchCode && {
          branches: {
        some: {
          isActive: true,
          branch: {
            branchCode,
          },
        },
      }
    }),
  };

  const [data, total] = await Promise.all([
    prisma.agent.findMany({
      where: whereCondition,
      skip,
      take: limit,
      orderBy: {
        createdAt: "desc",
      },
      include: {
        branches: {
          include: {
            branch: true,
          },
        },
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

        include: {
          branches: {
            include: {
              branch: true,
            },
          },
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


      if (status === "ACTIVE") {

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
      }

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

  const currentDate =
    new Date();

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
           DOWNLINES
        ========================================= */
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

        /* =========================================
           BRANCHES
        ========================================= */
        branches: {

          where: {
            isActive: true,
          },

          include: {
            branch: true,
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
            cycleMonth:
              currentMonth,

            cycleYear:
              currentYear,
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

    throw new Error(
      "Agent not found"
    );
  }

  return agent;
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

