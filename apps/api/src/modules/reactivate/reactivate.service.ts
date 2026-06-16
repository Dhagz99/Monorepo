// // services/reactivation.service.ts

// import  prisma  from "../../lib/prisma";

// const SELF_REACTIVATION_LIMIT_DAYS = 90;

// function getDaysFromExpiredAt(expiredAt: Date) {
//   const now = new Date();

//   const diffMs =
//     now.getTime() - expiredAt.getTime();

//   return Math.floor(
//     diffMs / (1000 * 60 * 60 * 24)
//   );
// }

// export async function checkSelfReactivationEligibility(
//   userId: number
// ) {
//   const user = await prisma.user.findUnique({
//     where: {
//       id: userId,
//     },
//     select: {
//       agentId: true,
//     },
//   });

//   if (!user) {
//     throw new Error("User not found.");
//   }

//   if (!user.agentId) {
//     throw new Error("User is not linked to an agent.");
//   }

//   const agent = await prisma.agent.findUnique({
//     where: {
//       id: user.agentId,
//     },
//   });

//   if (!agent) {
//     throw new Error("Agent not found.");
//   }

//   if (agent.status !== "EXPIRED") {
//     return {
//       eligible: false,
//       agentStatus: agent.status,
//       message:
//         "Only expired agents can request reactivation.",
//     };
//   }

//   const latestExpiredCycle =
//     await prisma.agentMaintenanceCycle.findFirst({
//       where: {
//         agentId: agent.id,
//         status: "EXPIRED",
//         expiredAt: {
//           not: null,
//         },
//       },
//       orderBy: {
//         expiredAt: "desc",
//       },
//     });

//   if (!latestExpiredCycle?.expiredAt) {
//     return {
//       eligible: false,
//       agentStatus: agent.status,
//       message:
//         "No expired maintenance cycle found.",
//     };
//   }

//   const daysExpired = getDaysFromExpiredAt(
//     latestExpiredCycle.expiredAt
//   );

//   const remainingDays =
//     SELF_REACTIVATION_LIMIT_DAYS - daysExpired;

//   const eligible =
//     daysExpired >= 0 &&
//     daysExpired <= SELF_REACTIVATION_LIMIT_DAYS;

//   return {
//     eligible,
//     agentStatus: agent.status,
//     expiredAt: latestExpiredCycle.expiredAt,
//     daysExpired,
//     remainingDays:
//       remainingDays > 0 ? remainingDays : 0,
//     phase: eligible
//       ? "SELF_REACTIVATION"
//       : "NOT_ELIGIBLE",
//     message: eligible
//       ? "Agent is eligible for self reactivation."
//       : "Self reactivation period has already expired.",
//   };
// }

// export async function selfReactivateAgent(
//   userId: number
// ) {
//   const eligibility =
//     await checkSelfReactivationEligibility(
//       userId
//     );

//   if (!eligibility.eligible) {
//     throw new Error(eligibility.message);
//   }

//    const user = await prisma.user.findUnique({
//         where: {
//         id: userId,
//         },
//         select: {
//         agentId: true,
//         },
//     });


//     if (!user) {
//             throw new Error("User not found.");
//         }

//     if (!user.agentId) {
//             throw new Error("User is not linked to an agent.");
//         }

//     const agent = await prisma.agent.findUnique({
//             where: {
//             id: user.agentId,
//             },
//         });

//         if (!agent) {
//             throw new Error("Agent not found.");
//         }


//   const now = new Date();

//   const currentMonth =
//     now.getMonth() + 1;

//   const currentYear =
//     now.getFullYear();

//   return prisma.$transaction(async (tx) => {
//     await tx.agent.update({
//       where: {
//         id: agent.id,
//       },
//       data: {
//         status: "ACTIVE",
//       },
//     });

//     const existingActiveCycle =
//       await tx.agentMaintenanceCycle.findFirst({
//         where: {
//           agentId:agent.id,
//           cycleMonth: currentMonth,
//           cycleYear: currentYear,
//         },
//       });

//     if (!existingActiveCycle) {
//       await tx.agentMaintenanceCycle.create({
//         data: {
//           agentId:agent.id,
//           cycleMonth: currentMonth,
//           cycleYear: currentYear,
//           cycleStartDate: new Date(
//             currentYear,
//             currentMonth - 1,
//             1
//           ),
//           cycleEndDate: new Date(
//             currentYear,
//             currentMonth,
//             0
//           ),
//           requiredSales: 1,
//           completedSales: 0,
//           remainingSales: 1,
//           isCompleted: false,
//           status: "ACTIVE",
//         },
//       });
//     }

//     const notification =
//       await tx.agentNotification.create({
//         data: {
//           agentId:agent.id,
//           type: "MAINTENANCE_REACTIVATE",
//           title: "Account Reactivated",
//           message:
//             "Your agent account has been successfully reactivated.",
//         },
//       });

//     return {
//       message:
//         "Agent account reactivated successfully.",
//       notification,
//     };
//   });
// }


import prisma from "../../lib/prisma";

import {
  Prisma,
} from "@prisma/client";

const SELF_REACTIVATION_LIMIT_DAYS = 90;
const MAX_SLOT = 10;

function getDaysFromExpiredAt(
  expiredAt: Date
) {
  const now = new Date();

  const diffMs =
    now.getTime() -
    expiredAt.getTime();

  return Math.floor(
    diffMs /
      (1000 * 60 * 60 * 24)
  );
}

async function validateReactivationSlot(
  tx: Prisma.TransactionClient,
  agent: {
    id: string;
    level: "L1" | "L2" | "L3";
    parentAgentId: string | null;
  }
) {
  if (agent.level === "L1") {
    const branches =
      await tx.agentBranch.findMany({
        where: {
          agentId: agent.id,
          isActive: true,
        },
      });

    if (branches.length === 0) {
      throw new Error(
        "Reactivation failed. Agent has no active branch assignment."
      );
    }

    for (const branch of branches) {
      const activeL1Count =
        await tx.agentBranch.count({
          where: {
            branchId: branch.branchId,
            isActive: true,
            agent: {
              id: {
                not: agent.id,
              },
              level: "L1",
              status: "ACTIVE",
              deletedAt: null,
            },
          },
        });

      if (activeL1Count >= MAX_SLOT) {
        throw new Error(
          "Reactivation failed. The branch you are assigned to does not have an available L1 slot."
        );
      }
    }

    return;
  }

  if (!agent.parentAgentId) {
    throw new Error(
      "Reactivation failed. Agent has no parent agent assigned."
    );
  }

  const activeDownlineCount =
    await tx.agent.count({
      where: {
        parentAgentId:
          agent.parentAgentId,
        id: {
          not: agent.id,
        },
        status: "ACTIVE",
        deletedAt: null,
      },
    });

  if (activeDownlineCount >= MAX_SLOT) {
    throw new Error(
      "Reactivation failed. Your assigned parent agent does not have an available downline slot."
    );
  }
}

export async function checkSelfReactivationEligibility(
  userId: number
) {
  const user =
    await prisma.user.findUnique({
      where: {
        id: userId,
      },
      select: {
        agentId: true,
      },
    });

  if (!user) {
    throw new Error(
      "User not found."
    );
  }

  if (!user.agentId) {
    throw new Error(
      "User is not linked to an agent."
    );
  }

  const agent =
    await prisma.agent.findUnique({
      where: {
        id: user.agentId,
      },
      select: {
        id: true,
        status: true,
        level: true,
        parentAgentId: true,
      },
    });

  if (!agent) {
    throw new Error(
      "Agent not found."
    );
  }

  if (agent.status !== "EXPIRED") {
    return {
      eligible: false,
      agentStatus: agent.status,
      phase: "NOT_EXPIRED",
      message:
        "Only expired agents can request reactivation.",
    };
  }

    const now = new Date();

    const latestExpiredCycle =
        await prisma.agentMaintenanceCycle.findFirst({
            where: {
            agentId: agent.id,
            status: "EXPIRED",
            expiredAt: {
                not: null,
            },
            },
            orderBy: {
            expiredAt: "desc",
            },
        });

        



    if (!latestExpiredCycle?.expiredAt) {
        return {
        eligible: false,
        agentStatus: agent.status,
        phase: "NO_EXPIRED_CYCLE",
        message:
            "No expired maintenance cycle found.",
        };
    }

    const daysExpired =
        getDaysFromExpiredAt(
        latestExpiredCycle.expiredAt
        );

    const remainingDays =
        SELF_REACTIVATION_LIMIT_DAYS -
        daysExpired;

    const withinSelfReactivationPeriod =
        daysExpired >= 0 &&
        daysExpired <=
        SELF_REACTIVATION_LIMIT_DAYS;

    

    const activeReactivationRequest =
    await prisma.agentReactivationRequest.findFirst({
        where: {
        agentId: agent.id,
        status: {
            in: [
            "PENDING",
            "PROBATION",
            ],
        },
        },
        orderBy: {
        createdAt: "desc",
        },
    });

    if (activeReactivationRequest) {
    return {
        eligible: false,
        agentStatus: agent.status,
        daysExpired,
        remainingDays:
            remainingDays > 0
            ? remainingDays
            : 0,
        phase:
        activeReactivationRequest.status === "PROBATION"
            ? "PROBATION_PERIOD"
            : "PENDING_REQUEST",
        message:
        activeReactivationRequest.status === "PROBATION"
            ? "Complete your probationary period to successfully reactivate your account."
            : "You already have a pending reactivation request.",
    };
    }

    const latestFailedRequest =
    await prisma.agentReactivationRequest.findFirst({
        where: {
        agentId: agent.id,
        status: "FAILED",
        cooldownUntil: {
            not: null,
        },
        },
        orderBy: {
        failedAt: "desc",
        },
    });

    if (
    latestFailedRequest?.cooldownUntil &&
    latestFailedRequest.cooldownUntil > now
    ) {
    return {
        eligible: false,
        agentStatus: agent.status,
        phase: "COOLDOWN_PERIOD",
           daysExpired,
      remainingDays:
        remainingDays > 0
          ? remainingDays
          : 0,
        cooldownUntil:
        latestFailedRequest.cooldownUntil,
        message:
        "You must wait until your cooldown period is complete before requesting reactivation again.",
    };
    }



  if (!withinSelfReactivationPeriod) {
    return {
      eligible: false,
      agentStatus: agent.status,
      expiredAt:
        latestExpiredCycle.expiredAt,
      daysExpired,
      remainingDays: 0,
      phase: "REACTIVATION_VIA_ADMIN",
      message:
        "The self-reactivation window has ended. You may now request reactivation through admin approval.",
    };
  }

  try {
    await prisma.$transaction(
      async (tx) => {
        await validateReactivationSlot(
          tx,
          agent
        );
      }
    );
  } catch (error) {
    return {
      eligible: false,
      agentStatus: agent.status,
      expiredAt:
        latestExpiredCycle.expiredAt,
      daysExpired,
      remainingDays:
        remainingDays > 0
          ? remainingDays
          : 0,
      phase: "NO_SLOT_AVAILABLE",
      message:
        error instanceof Error
          ? error.message
          : "No slot available for reactivation.",
    };
  }

  return {
    eligible: true,
    agentStatus: agent.status,
    expiredAt:
      latestExpiredCycle.expiredAt,
    daysExpired,
    remainingDays:
      remainingDays > 0
        ? remainingDays
        : 0,
    phase: "SELF_REACTIVATION",
    message:
      "Agent is eligible for self reactivation.",
  };
}

export async function selfReactivateAgent(
  userId: number
) {
  const eligibility =
    await checkSelfReactivationEligibility(
      userId
    );

  if (!eligibility.eligible) {
    throw new Error(
      eligibility.message
    );
  }

  const now = new Date();

  const probationEndsAt =
        new Date(now);

  probationEndsAt.setDate(
        probationEndsAt.getDate() + 30
        );


  return prisma.$transaction(
    async (tx) => {
      const user =
        await tx.user.findUnique({
          where: {
            id: userId,
          },
          select: {
            agentId: true,
          },
        });

      if (!user) {
        throw new Error(
          "User not found."
        );
      }

      if (!user.agentId) {
        throw new Error(
          "User is not linked to an agent."
        );
      }

      const agent =
        await tx.agent.findUnique({
          where: {
            id: user.agentId,
          },
          select: {
            id: true,
            status: true,
            level: true,
            parentAgentId: true,
          },
        });

      if (!agent) {
        throw new Error(
          "Agent not found."
        );
      }

      if (agent.status !== "EXPIRED") {
        throw new Error(
          "Only expired agents can reactivate."
        );
      }

      await validateReactivationSlot(
        tx,
        agent
      );

    //   await tx.agent.update({
    //     where: {
    //       id: agent.id,
    //     },
    //     data: {
    //       status: "ACTIVE",
    //     },
    //   });

      const existingActiveReactivation =
        await tx.agentReactivationRequest.findFirst(
          {
            where: {
              agentId: agent.id,
              status: "PROBATION"
            },
          }
        );

       
        if (!existingActiveReactivation) {
        await tx.agentReactivationRequest.create({
            data: {
            agentId: agent.id,

            requestType:
                "SELF_REACTIVATION",

            probationStartedAt:
                now,

            probationEndsAt,

            requiredSales: 1,

            completedSales: 0,

            isCompleted: false,

            status: "PROBATION",
            },
        });
        }

    //   const notification =
    //     await tx.agentNotification.create({
    //       data: {
    //         agentId: agent.id,
    //         type: "MAINTENANCE_REACTIVATE",
    //         title:
    //           "Account Reactivated",
    //         message:
    //           "Your agent account has been successfully reactivated.",
    //       },
    //     });

    const notification =
        await tx.agentNotification.create({
          data: {
            agentId: agent.id,
            type: "MAINTENANCE_PROBATION",
            title:
              "Account Reactivation",
            message:
              "Complete your probationary period successfully to regain active status.",
          },
        });

      return {
        message:
          "Complete your probationary period successfully to regain active status.",
        notification,
      };
    }
  );
}