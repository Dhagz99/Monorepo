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
import { NotificationType, NotificationActionType, ActionResult  } from "../../../generated/prisma";

import {
  Prisma,
} from "@prisma/client";
import { emitAdminPaymentUpdated, emitAdminReactivationApproval, emitNotification, emitUplineReactivationApproval } from "../../socket/socketEmitter";

const SELF_REACTIVATION_LIMIT_DAYS = 90;
const ADMIN_REACTIVATION_LIMIT_DAYS = 180;
const MAX_SLOT = 10;


function getDaysFromDateAt(
  dateAt: Date
) {
  const now = new Date();

  const diffMs =
    now.getTime() -
    dateAt.getTime();

  return Math.floor(
    diffMs /
      (1000 * 60 * 60 * 24)
  );
}
function getDaysUntil(date: Date) {
  const now = new Date();

  const diffMs = date.getTime() - now.getTime();

  return Math.ceil(
    diffMs / (1000 * 60 * 60 * 24)
  );
}
function getProbationDays(
  probationStartedAt: Date,
  probationEndAt: Date
) {
  const diffMs =
    probationEndAt.getTime() -
    probationStartedAt.getTime();

  return Math.floor(
    diffMs / (1000 * 60 * 60 * 24)
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
export async function checkSelfReactivationEligibility(userId: number) {
  const user = await prisma.user.findUnique({
    where: {
      id: userId,
    },
    select: {
      agentId: true,
    },
  });

  if (!user) {
    throw new Error("User not found.");
  }

  if (!user.agentId) {
    throw new Error("User is not linked to an agent.");
  }

  const agent = await prisma.agent.findUnique({
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
    throw new Error("Agent not found.");
  }

  

  if (agent.status === "ACTIVE") {
    return {
      eligible: false,
      agentStatus: agent.status,
      phase: "NOT_EXPIRED",
      message: "Only expired agents can request reactivation.",
    };
  }

  const now = new Date();

  const latestExpiredCycle = await prisma.agentMaintenanceCycle.findFirst({
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
      message: "No expired maintenance cycle found.",
    };
  }

  const daysExpired = getDaysFromDateAt(latestExpiredCycle.expiredAt);

  const selfReactivationRemainingDays = Math.max(
    SELF_REACTIVATION_LIMIT_DAYS - daysExpired,
    0
  );

  const adminReactivationRemainingDays = Math.max(
    ADMIN_REACTIVATION_LIMIT_DAYS - daysExpired,
    0
  );

  const withinSelfReactivationPeriod =
    daysExpired >= 0 && daysExpired <= SELF_REACTIVATION_LIMIT_DAYS;

  const withinAdminReactivationPeriod =
    daysExpired > SELF_REACTIVATION_LIMIT_DAYS &&
    daysExpired <= ADMIN_REACTIVATION_LIMIT_DAYS;

  // const shouldAutoDeactivate = daysExpired > ADMIN_REACTIVATION_LIMIT_DAYS;



  const activeReactivationRequest =
    await prisma.agentReactivationRequest.findFirst({
      where: {
        agentId: agent.id,
        status: {
          in: ["PENDING", "PROBATION"],
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });
    
  const daysProbation =
    activeReactivationRequest?.status === "PROBATION" &&
    activeReactivationRequest.probationStartedAt
      ? getDaysFromDateAt(
          activeReactivationRequest.probationStartedAt
        )
      : 0;

  const remainingProbation =
    activeReactivationRequest?.status === "PROBATION" &&
    activeReactivationRequest.probationStartedAt &&
    activeReactivationRequest.probationEndsAt
      ? Math.max(
          getProbationDays(
            activeReactivationRequest.probationStartedAt,
            activeReactivationRequest.probationEndsAt
          ) - daysProbation,
          0
        )
      : 0;

  if (activeReactivationRequest) {
    return {
      eligible: false,
      agentStatus: agent.status,
      daysExpired,
      daysProbation,
      remainingProbation,
      remainingDays: withinSelfReactivationPeriod
        ? selfReactivationRemainingDays
        : adminReactivationRemainingDays,
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

  const latestFailedRequest = await prisma.agentReactivationRequest.findFirst({
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

  const cooldownDays = latestFailedRequest?.cooldownUntil
    ? Math.max(
        getDaysUntil(
          latestFailedRequest.cooldownUntil
        ),
        0
      )
    : 0;
  if (
    latestFailedRequest?.cooldownUntil &&
    latestFailedRequest.cooldownUntil > now
  ) {
    return {
      eligible: false,
      agentStatus: agent.status,
      phase: "COOLDOWN_PERIOD",
      daysExpired,
      cooldownDays, 
      remainingDays: withinSelfReactivationPeriod
        ? selfReactivationRemainingDays
        : adminReactivationRemainingDays,
      cooldownUntil: latestFailedRequest.cooldownUntil,
      message:
        "You must wait until your cooldown period is complete before requesting reactivation again.",
    };
  }

  // if (shouldAutoDeactivate) {
  //   await prisma.agent.update({
  //     where: {
  //       id: agent.id,
  //     },
  //     data: {
  //       status: "DEACTIVATED",
  //     },
  //   });

  //   return {
  //     eligible: false,
  //     agentStatus: "DEACTIVATED",
  //     expiredAt: latestExpiredCycle.expiredAt,
  //     daysExpired,
  //     remainingDays: 0,
  //     phase: "AUTOMATIC_DEACTIVATION",
  //     message:
  //       "Your account has been automatically deactivated because the reactivation period has ended.",
  //   };
  // }

  if (withinAdminReactivationPeriod) {
    return {
      eligible: false,
      agentStatus: agent.status,
      expiredAt: latestExpiredCycle.expiredAt,
      daysExpired,
      remainingDays: adminReactivationRemainingDays,
      phase: "REACTIVATION_VIA_ADMIN",
      message:
        "The self-reactivation window has ended. You may now request reactivation through admin approval.",
    };
  }

  if (!withinSelfReactivationPeriod) {
    return {
      eligible: false,
      agentStatus: agent.status,
      expiredAt: latestExpiredCycle.expiredAt,
      daysExpired,
      remainingDays: 0,
      phase: "INVALID_REACTIVATION_PERIOD",
      message: "Invalid reactivation period.",
    };
  }

  try {
    await prisma.$transaction(async (tx) => {
      await validateReactivationSlot(tx, agent);
    });
  } catch (error) {
    return {
      eligible: false,
      agentStatus: agent.status,
      expiredAt: latestExpiredCycle.expiredAt,
      daysExpired,
      remainingDays: selfReactivationRemainingDays,
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
    expiredAt: latestExpiredCycle.expiredAt,
    daysExpired,
    remainingDays: selfReactivationRemainingDays,
    phase: "SELF_REACTIVATION",
    message: "Agent is eligible for self reactivation.",
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

        await tx.agent.update({
          where: {
            id: agent.id,
          },
          data: {
            status: "PROBATION",
          },
        });

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





// export const submitAdminReactivationRequestService =
//   async (
//     userId: number,
//     file: Express.Multer.File
//   ) => {
//     const user =
//       await prisma.user.findUnique({
//         where: {
//           id: userId,
//         },
//         include: {
//           agent: true,
//         },
//       });


//     if (!user) {
//       throw new Error("User not found.");
//     }

//     if (!user.agentId || !user.agent) {
//       throw new Error(
//         "User is not linked to an agent."
//       );
//     }

//     const agent = user.agent;

    
//     const parentAcc = await prisma.user.findFirst({
//       where:{
//         agentId: agent.parentAgentId
//       }, 
//       include: {
//           agent: true,
//         },
//     })


//     if (agent.status !== "EXPIRED") {
//       throw new Error(
//         "Only expired agents can request admin reactivation."
//       );
//     }

//     if (!file) {
//       throw new Error(
//         "Formal written reactivation request file is required."
//       );
//     }

//     const existingActiveRequest =
//       await prisma.agentReactivationRequest.findFirst({
//         where: {
//           agentId: agent.id,
//           requestType: "ADMIN_APPROVAL",
//           status: {
//             in: [
//               "PENDING",
//               "PROBATION",
//             ],
//           },
//         },
//       });

//     if (existingActiveRequest) {
//       throw new Error(
//         "You already have an active admin reactivation request."
//       );
//     }

//     return prisma.$transaction(
//       async (tx) => {
//         const request =
//           await tx.agentReactivationRequest.create({
//             data: {
//               agentId: agent.id,
//               requestType: "ADMIN_APPROVAL",
//               status: "PENDING",
//               reason:
//                 "Formal written reactivation request submitted for admin approval.",

//               attachments: {
//                 create: {
//                   fileName: file.originalname,
//                   filePath: `/uploads/reactivation-requests/${file.filename}`,
//                   fileType: file.mimetype,
//                   fileSize: file.size,
//                 },
//               },

//               approvals: {
//                 create: [
//                   ...(agent.parentAgentId
//                     ? [
//                         {
//                           reviewerUserId: parentAcc?.id,
//                           reviewerType:
//                             "UPLINE_AGENT" as const,
//                           reviewerAgentId:
//                             agent.parentAgentId,
//                           status:
//                             "PENDING" as const,
//                           approvalOrder: 1,
//                           isRequired: true,

//                         },
//                       ]
//                     : []),

//                   {
//                     reviewerType:
//                       "ADMIN" as const,
//                     status:
//                       "PENDING" as const,
//                     approvalOrder: agent.parentAgentId ? 2 : 1,
//                     isRequired: true,
//                   },
//                 ],
//               },
//             },

//             include: {
//               attachments: true,
//               approvals: true,
//             },
//           });

//           const adminApproval =
//             request.approvals.find(
//               (approval) =>
//                 approval.reviewerType === "ADMIN"
//             );

//           const uplineApproval =
//             request.approvals.find(
//               (approval) =>
//                 approval.reviewerType === "UPLINE_AGENT"
//             );

//           if (adminApproval) {
//             emitAdminReactivationApproval({
//               requestId: request.id,
//               approvalId: adminApproval.id,
//               agentId: agent.id,
//               agentName: agent.fullName,
//               reviewerType: "ADMIN",
//               title: "New Reactivation Approval",
//               message: `${agent.fullName} submitted a reactivation request for admin approval.`,
//               createdAt: new Date(),
//             });
//           }

//           if (
//             uplineApproval &&
//             uplineApproval.reviewerAgentId
//           ) {
//             emitUplineReactivationApproval(
//               uplineApproval.reviewerAgentId,
//               {
//                 requestId: request.id,
//                 approvalId: uplineApproval.id,
//                 agentId: agent.id,
//                 agentName: agent.fullName,
//                 reviewerType: "UPLINE_AGENT",
//                 title: "New Reactivation Approval",
//                 message: `${agent.fullName} submitted a reactivation request requiring your approval.`,
//                 createdAt: new Date(),
//               }
//             );
//           }

//         await tx.agentNotification.create({
//           data: {
//             agentId: agent.id,
//             type:
//               NotificationType.MAINTENANCE_CREATED,
//             title:
//               "ADMIN REACTIVATION REQUEST SUBMITTED",
//             message:
//               "Your formal written reactivation request has been submitted and is waiting for approval.",
//           },
//         });

//         return request;
//       }
//     );
//   };


export const submitAdminReactivationRequestService =
  async (
    userId: number,
    file: Express.Multer.File
  ) => {
    const user = await prisma.user.findUnique({
      where: {
        id: userId,
      },
      include: {
        agent: true,
      },
    });

    if (!user) {
      throw new Error("User not found.");
    }

    if (!user.agentId || !user.agent) {
      throw new Error(
        "User is not linked to an agent."
      );
    }

    const agent = user.agent;

    if (agent.status !== "EXPIRED") {
      throw new Error(
        "Only expired agents can request admin reactivation."
      );
    }

    if (!file) {
      throw new Error(
        "Formal written reactivation request file is required."
      );
    }

    const parentAcc = agent.parentAgentId
      ? await prisma.user.findFirst({
          where: {
            agentId: agent.parentAgentId,
          },
          include: {
            agent: true,
          },
        })
      : null;

    const existingActiveRequest =
      await prisma.agentReactivationRequest.findFirst({
        where: {
          agentId: agent.id,
          requestType: "ADMIN_APPROVAL",
          status: {
            in: [
              "PENDING",
              "PROBATION",
            ],
          },
        },
      });

    if (existingActiveRequest) {
      throw new Error(
        "You already have an active admin reactivation request."
      );
    }

    return prisma.$transaction(async (tx) => {
      const request =
        await tx.agentReactivationRequest.create({
          data: {
            agentId: agent.id,
            requestType: "ADMIN_APPROVAL",
            status: "PENDING",
            reason:
              "Formal written reactivation request submitted for admin approval.",

            attachments: {
              create: {
                fileName: file.originalname,
                filePath: `/uploads/reactivation-requests/${file.filename}`,
                fileType: file.mimetype,
                fileSize: file.size,
              },
            },

            approvals: {
              create: [
                ...(agent.parentAgentId
                  ? [
                      {
                        reviewerUserId:
                          parentAcc?.id,
                        reviewerType:
                          "UPLINE_AGENT" as const,
                        reviewerAgentId:
                          agent.parentAgentId,
                        status:
                          "PENDING" as const,
                        approvalOrder: 1,
                        isRequired: true,
                      },
                    ]
                  : []),

                {
                  reviewerType:
                    "ADMIN" as const,
                  status:
                    "PENDING" as const,
                  approvalOrder:
                    agent.parentAgentId ? 2 : 1,
                  isRequired: true,
                },
              ],
            },
          },

          include: {
            attachments: true,
            approvals: true,
          },
        });

      const adminApproval =
        request.approvals.find(
          (approval) =>
            approval.reviewerType === "ADMIN"
        );

      const uplineApproval =
        request.approvals.find(
          (approval) =>
            approval.reviewerType === "UPLINE_AGENT"
        );

      /**
       * If request has upline approval:
       * notify only the upline first.
       */
      if (
        uplineApproval &&
        uplineApproval.reviewerAgentId
      ) {
        emitUplineReactivationApproval(
          uplineApproval.reviewerAgentId,
          {
            requestId: request.id,
            approvalId: uplineApproval.id,
            agentId: agent.id,
            agentName: agent.fullName,
            reviewerType: "UPLINE_AGENT",
            title: "New Reactivation Approval",
            message: `${agent.fullName} submitted a reactivation request requiring your approval.`,
            createdAt: new Date(),
          }
        );
      }

      /**
       * If request has no upline approval:
       * notify admin immediately.
       */
      if (
        !uplineApproval &&
        adminApproval
      ) {
        emitAdminReactivationApproval({
          requestId: request.id,
          approvalId: adminApproval.id,
          agentId: agent.id,
          agentName: agent.fullName,
          reviewerType: "ADMIN",
          title: "New Reactivation Approval",
          message: `${agent.fullName} submitted a reactivation request for admin approval.`,
          createdAt: new Date(),
        });
      }

      await tx.agentNotification.create({
        data: {
          agentId: agent.id,
          type:
            NotificationType.REACTIVATION_REQUEST,
          title:
            "ADMIN REACTIVATION REQUEST SUBMITTED",
          entityId: request.id,
          message:
            "Your formal written reactivation request has been submitted and is waiting for approval.",
        },
      });

      return request;
    });
  };

export const getMyReactivationApprovalsService =
  async (
    userId: number,
    {
      page = 1,
      limit = 5,
      search,
      status,
    }: {
      page?: number;
      limit?: number;
      search?: string;
      status?: string;
    }
  ) => {
    const user = await prisma.user.findUnique({
      where: {
        id: userId,
      },
      include: {
        agent: true,
        roles: {
          include: {
            role: true,
          },
        },
      },
    });

    if (!user) {
      throw new Error("User not found.");
    }

    const isAdmin = user.roles.some(
      (userRole) => userRole.role.name === "ADMIN"
    );

    const searchCondition = search?.trim()
      ? {
          request: {
            agent: {
              OR: [
                {
                  fullName: {
                    contains: search.trim(),
                    mode: "insensitive" as const,
                  },
                },
                {
                  agentCode: {
                    contains: search.trim(),
                    mode: "insensitive" as const,
                  },
                },
              ],
            },
          },
        }
      : {};

    const statusCondition = status
      ? {
          status: status as "PENDING" | "APPROVED" | "REJECTED",
        }
      : {};

    const accessCondition = {
      OR: [
        ...(isAdmin
          ? [
              {
                reviewerType: "ADMIN" as const,
              },
            ]
          : []),

        ...(user.agentId
          ? [
              {
                reviewerType: "UPLINE_AGENT" as const,
                reviewerAgentId: user.agentId,
              },
            ]
          : []),
      ],
    };

    const whereCondition = {
      ...statusCondition,
      ...accessCondition,
      ...searchCondition,
    };

    const allData =
      await prisma.agentReactivationApproval.findMany({
        where: whereCondition,
        include: {
          request: {
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
              attachments: true,
              approvals: {
                where: {
                  isRequired: true,
                },
                orderBy: {
                  approvalOrder: "asc",
                },
              },
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      });

    const filteredData = allData.filter((approval) => {
      if (approval.reviewerType !== "ADMIN") {
        return true;
      }

      const previousRequiredApprovals =
        approval.request.approvals.filter(
          (item) =>
            item.approvalOrder < approval.approvalOrder
        );

      return previousRequiredApprovals.every(
        (item) => item.status === "APPROVED"
      );
    });

    const total = filteredData.length;

    const data = filteredData.slice(
      (page - 1) * limit,
      page * limit
    );

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  };



// export const reviewReactivationApprovalService =
//   async (
//     userId: number,
//     payload: {
//       approvalId: string;
//       status: "APPROVED" | "REJECTED";
//       remarks?: string;
//     }
//   ) => {
//     const user =
//       await prisma.user.findUnique({
//         where: {
//           id: userId,
//         },
//         include: {
//           roles: {
//             include: {
//               role: true,
//             },
//           },
//           agent: true,
//         },
//       });

//     if (!user) {
//       throw new Error("User not found.");
//     }

//     const isAdmin =
//       user.roles.some(
//         (userRole) =>
//           userRole.role.name === "ADMIN"
//       );

//     const approval =
//       await prisma.agentReactivationApproval.findUnique({
//         where: {
//           id: payload.approvalId,
//         },
//         include: {
//           request: {
//             include: {
//               agent: true,
//             },
//           },
//         },
//       });

//     if (!approval) {
//       throw new Error(
//         "Approval request not found."
//       );
//     }

//     if (approval.status !== "PENDING") {
//       throw new Error(
//         "This approval request has already been reviewed."
//       );
//     }

//     if (
//       approval.reviewerType === "ADMIN" &&
//       !isAdmin
//     ) {
//       throw new Error(
//         "Only admin can approve this request."
//       );
//     }

//     if (
//       approval.reviewerType === "UPLINE_AGENT" &&
//       approval.reviewerAgentId !== user.agentId
//     ) {
//       throw new Error(
//         "Only the assigned upline agent can approve this request."
//       );
//     }

//     const pendingPreviousApproval =
//       await prisma.agentReactivationApproval.findFirst({
//         where: {
//           requestId: approval.requestId,
//           approvalOrder: {
//             lt: approval.approvalOrder,
//           },
//           isRequired: true,
//           status: {
//             not: "APPROVED",
//           },
//         },
//       });

//     if (pendingPreviousApproval) {
//       throw new Error(
//         "Previous approval step must be completed first."
//       );
//     }

//     return prisma.$transaction(
//       async (tx) => {
//         const updatedApproval =
//           await tx.agentReactivationApproval.update({
//             where: {
//               id: approval.id,
//             },
//             data: {
//               status: payload.status,
//               remarks: payload.remarks,
//               reviewedAt: new Date(),

//               ...(approval.reviewerType === "ADMIN" && {
//                 reviewerUserId: user.id,
//               }),
//             },
//           });

//         if (payload.status === "REJECTED") {
//           const request =
//             await tx.agentReactivationRequest.update({
//               where: {
//                 id: approval.requestId,
//               },
//               data: {
//                 status: "FAILED",
//                 failedAt: new Date(),
//                 remarks:
//                   payload.remarks ??
//                   "Reactivation request rejected.",
//               },
//             });

//           await tx.agentNotification.create({
//             data: {
//               agentId: approval.request.agentId,
//               type: NotificationType.MAINTENANCE_REJECTED,
//               title: "REACTIVATION REQUEST REJECTED",
//               message:
//                 "Your admin reactivation request has been rejected.",
//             },
//           });

//           return {
//             approvalId: updatedApproval.id,
//             requestId: request.id,
//             approvalStatus: updatedApproval.status,
//             requestStatus: request.status,
//           };
//         }

//         const approvals =
//           await tx.agentReactivationApproval.findMany({
//             where: {
//               requestId: approval.requestId,
//               isRequired: true,
//             },
//           });

//         const allApproved =
//           approvals.every(
//             (item) =>
//               item.id === approval.id
//                 ? payload.status === "APPROVED"
//                 : item.status === "APPROVED"
//           );

//         if (!allApproved) {
//           return {
//             approvalId: updatedApproval.id,
//             requestId: approval.requestId,
//             approvalStatus: updatedApproval.status,
//             requestStatus: approval.request.status,
//           };
//         }

//         const now = new Date();

//         const probationEndsAt =
//           new Date(now);

//         probationEndsAt.setDate(
//           probationEndsAt.getDate() + 60
//         );

//         const request =
//           await tx.agentReactivationRequest.update({
//             where: {
//               id: approval.requestId,
//             },
//             data: {
//               status: "PROBATION",
//               requiredSales: 3,
//               approvedAt: now,
//               probationStartedAt: now,
//               probationEndsAt,
//             },
//           });

        
//         await tx.agent.update({
//           where: {
//             id: approval.request.agentId,
//           },
//           data: {
//             status: "PROBATION",
//           },
//         });

//         await tx.agentNotification.create({
//           data: {
//             agentId: approval.request.agentId,
//             type: NotificationType.MAINTENANCE_PROBATION,
//             title: "REACTIVATION REQUEST APPROVED",
//             message:
//               "Your admin reactivation request has been approved. You are now under probation period.",
//           },
//         });

//         return {
//           approvalId: updatedApproval.id,
//           requestId: request.id,
//           approvalStatus: updatedApproval.status,
//           requestStatus: request.status,
//         };
//       }
//     );
//   };



// export const reviewReactivationApprovalService =
//   async (
//     userId: number,
//     payload: {
//       approvalId: string;
//       status: "APPROVED" | "REJECTED";
//       remarks?: string;
//     }
//   ) => {
//     const user = await prisma.user.findUnique({
//       where: {
//         id: userId,
//       },
//       include: {
//         roles: {
//           include: {
//             role: true,
//           },
//         },
//         agent: true,
//       },
//     });

//     if (!user) {
//       throw new Error("User not found.");
//     }

//     const isAdmin = user.roles.some(
//       (userRole) => userRole.role.name === "ADMIN"
//     );

//     const approval =
//       await prisma.agentReactivationApproval.findUnique({
//         where: {
//           id: payload.approvalId,
//         },
//         include: {
//           request: {
//             include: {
//               agent: true,
//             },
//           },
//         },
//       });

//     if (!approval) {
//       throw new Error("Approval request not found.");
//     }

//     if (approval.status !== "PENDING") {
//       throw new Error(
//         "This approval request has already been reviewed."
//       );
//     }

//     if (
//       approval.reviewerType === "ADMIN" &&
//       !isAdmin
//     ) {
//       throw new Error(
//         "Only admin can approve this request."
//       );
//     }

//     if (
//       approval.reviewerType === "UPLINE_AGENT" &&
//       approval.reviewerAgentId !== user.agentId
//     ) {
//       throw new Error(
//         "Only the assigned upline agent can approve this request."
//       );
//     }

//     const pendingPreviousApproval =
//       await prisma.agentReactivationApproval.findFirst({
//         where: {
//           requestId: approval.requestId,
//           approvalOrder: {
//             lt: approval.approvalOrder,
//           },
//           isRequired: true,
//           status: {
//             not: "APPROVED",
//           },
//         },
//       });

//     if (pendingPreviousApproval) {
//       throw new Error(
//         "Previous approval step must be completed first."
//       );
//     }

//     return prisma.$transaction(async (tx) => {
//       const now = new Date();

//       const updatedApproval =
//         await tx.agentReactivationApproval.update({
//           where: {
//             id: approval.id,
//           },
//           data: {
//             status: payload.status,
//             remarks: payload.remarks,
//             reviewedAt: now,

//             ...(approval.reviewerType === "ADMIN" && {
//               reviewerUserId: user.id,
//             }),
//           },
//         });

//       if (payload.status === "REJECTED") {
//         const request =
//           await tx.agentReactivationRequest.update({
//             where: {
//               id: approval.requestId,
//             },
//             data: {
//               status: "FAILED",
//               failedAt: now,
//               remarks:
//                 payload.remarks ??
//                 "Reactivation request rejected.",
//             },
//           });

//         const notification =
//           await tx.agentNotification.create({
//             data: {
//               agentId: approval.request.agentId,
//               type: NotificationType.MAINTENANCE_REJECTED,
//               title: "REACTIVATION REQUEST REJECTED",
//               message:
//                 "Your admin reactivation request has been rejected.",
//             },
//           });

//         emitNotification(
//           approval.request.agentId,
//           notification
//         );

//         return {
//           approvalId: updatedApproval.id,
//           requestId: request.id,
//           approvalStatus: updatedApproval.status,
//           requestStatus: request.status,
//         };
//       }

//       const approvals =
//         await tx.agentReactivationApproval.findMany({
//           where: {
//             requestId: approval.requestId,
//             isRequired: true,
//           },
//         });

//       const allApproved =
//         approvals.every((item) =>
//           item.id === approval.id
//             ? payload.status === "APPROVED"
//             : item.status === "APPROVED"
//         );

//       /**
//        * UPLINE approved, but admin is still pending.
//        * Emit the request to admin room now.
//        */
//       if (
//         !allApproved &&
//         approval.reviewerType === "UPLINE_AGENT" &&
//         payload.status === "APPROVED"
//       ) {
//         const adminApproval =
//           await tx.agentReactivationApproval.findFirst({
//             where: {
//               requestId: approval.requestId,
//               reviewerType: "ADMIN",
//               status: "PENDING",
//             },
//           });

//         if (adminApproval) {
//           emitAdminReactivationApproval({
//             requestId: approval.requestId,
//             approvalId: adminApproval.id,
//             agentId: approval.request.agentId,
//             agentName: approval.request.agent.fullName,
//             reviewerType: "ADMIN",
//             title: "New Reactivation Approval",
//             message: `${approval.request.agent.fullName}'s reactivation request is now ready for admin approval.`,
//             createdAt: now,
//           });
//         }

//         return {
//           approvalId: updatedApproval.id,
//           requestId: approval.requestId,
//           approvalStatus: updatedApproval.status,
//           requestStatus: approval.request.status,
//         };
//       }

//       if (!allApproved) {
//         return {
//           approvalId: updatedApproval.id,
//           requestId: approval.requestId,
//           approvalStatus: updatedApproval.status,
//           requestStatus: approval.request.status,
//         };
//       }

//       const probationEndsAt = new Date(now);

//       probationEndsAt.setDate(
//         probationEndsAt.getDate() + 60
//       );

//       const request =
//         await tx.agentReactivationRequest.update({
//           where: {
//             id: approval.requestId,
//           },
//           data: {
//             status: "PROBATION",
//             requiredSales: 3,
//             approvedAt: now,
//             probationStartedAt: now,
//             probationEndsAt,
//           },
//         });

//       await tx.agent.update({
//         where: {
//           id: approval.request.agentId,
//         },
//         data: {
//           status: "PROBATION",
//         },
//       });

//       const notification =
//         await tx.agentNotification.create({
//           data: {
//             agentId: approval.request.agentId,
//             type: NotificationType.MAINTENANCE_PROBATION,
//             title: "REACTIVATION REQUEST APPROVED",
//             message:
//               "Your admin reactivation request has been approved. You are now under probation period.",
//           },
//         });

//       emitNotification(
//         approval.request.agentId,
//         notification
//       );

//       return {
//         approvalId: updatedApproval.id,
//         requestId: request.id,
//         approvalStatus: updatedApproval.status,
//         requestStatus: request.status,
//       };
//     });
//   };


export const reviewReactivationApprovalService = async (
  userId: number,
  payload: {
    approvalId: string;
    status: "APPROVED" | "REJECTED";
    remarks?: string;
  }
) => {
  const user = await prisma.user.findUnique({
    where: {
      id: userId,
    },
    include: {
      roles: {
        include: {
          role: true,
        },
      },
      agent: true,
    },
  });

  if (!user) {
    throw new Error("User not found.");
  }

  const isAdmin = user.roles.some(
    (userRole) => userRole.role.name === "ADMIN"
  );

  const approval =
    await prisma.agentReactivationApproval.findUnique({
      where: {
        id: payload.approvalId,
      },
      include: {
        request: {
          include: {
            agent: true,
          },
        },
      },
    });

  if (!approval) {
    throw new Error("Approval request not found.");
  }

  if (approval.status !== "PENDING") {
    throw new Error(
      "This approval request has already been reviewed."
    );
  }

  if (
    approval.reviewerType === "ADMIN" &&
    !isAdmin
  ) {
    throw new Error(
      "Only admin can approve this request."
    );
  }

  if (
    approval.reviewerType === "UPLINE_AGENT" &&
    approval.reviewerAgentId !== user.agentId
  ) {
    throw new Error(
      "Only the assigned upline agent can approve this request."
    );
  }

  const pendingPreviousApproval =
    await prisma.agentReactivationApproval.findFirst({
      where: {
        requestId: approval.requestId,
        approvalOrder: {
          lt: approval.approvalOrder,
        },
        isRequired: true,
        status: {
          not: "APPROVED",
        },
      },
    });

  if (pendingPreviousApproval) {
    throw new Error(
      "Previous approval step must be completed first."
    );
  }

  const result = await prisma.$transaction(async (tx) => {
    const now = new Date();

    const updatedApproval =
      await tx.agentReactivationApproval.update({
        where: {
          id: approval.id,
        },
        data: {
          status: payload.status,
          remarks: payload.remarks,
          reviewedAt: now,

          ...(approval.reviewerType === "ADMIN" && {
            reviewerUserId: user.id,
          }),
        },
      });

      if (payload.status === "REJECTED") {
        const rejectionMessage =
          approval.reviewerType === "UPLINE_AGENT"
            ? "Your upline agent rejected your reactivation request."
            : "Your admin reactivation request has been rejected.";

        const request =
          await tx.agentReactivationRequest.update({
            where: {
              id: approval.requestId,
            },
            data: {
              status: "FAILED",
              failedAt: now,
              remarks:
                payload.remarks ??
                "Reactivation request rejected.",
            },
          });

        await tx.agentReactivationApproval.updateMany({
          where: {
            requestId: approval.requestId,
            id: {
              not: approval.id,
            },
            status: "PENDING",
          },
          data: {
            status: "REJECTED",
            remarks:
              approval.reviewerType === "UPLINE_AGENT"
                ? "Auto-rejected because the upline agent rejected the request."
                : "Auto-rejected because the admin rejected the request.",
            reviewedAt: now,
          },
        });

        const notification =
          await tx.agentNotification.create({
            data: {
              agentId: approval.request.agentId,
              type: NotificationType.REACTIVATION_REQUEST,
              title: "REACTIVATION REQUEST REJECTED",
              message: rejectionMessage,
            },
          });

        return {
          approvalId: updatedApproval.id,
          requestId: request.id,
          approvalStatus: updatedApproval.status,
          requestStatus: request.status,
          notifications: [notification],
          adminApprovalPayload: null,
          adminPaymentPayload: null,
        };
      }

    const approvals =
      await tx.agentReactivationApproval.findMany({
        where: {
          requestId: approval.requestId,
          isRequired: true,
        },
      });

    const allApproved = approvals.every((item) =>
      item.id === approval.id
        ? payload.status === "APPROVED"
        : item.status === "APPROVED"
    );

    if (
      !allApproved &&
      approval.reviewerType === "UPLINE_AGENT" &&
      payload.status === "APPROVED"
    ) {
      const adminApproval =
        await tx.agentReactivationApproval.findFirst({
          where: {
            requestId: approval.requestId,
            reviewerType: "ADMIN",
            status: "PENDING",
          },
        });

      return {
        approvalId: updatedApproval.id,
        requestId: approval.requestId,
        approvalStatus: updatedApproval.status,
        requestStatus: approval.request.status,
        notifications: [],
        adminApprovalPayload: adminApproval
          ? {
              requestId: approval.requestId,
              approvalId: adminApproval.id,
              agentId: approval.request.agentId,
              agentName: approval.request.agent.fullName,
              reviewerType: "ADMIN" as const,
              title: "New Reactivation Approval",
              message: `${approval.request.agent.fullName}'s reactivation request is now ready for admin approval.`,
              createdAt: now,
            }
          : null,
      };
    }

    if (!allApproved) {
      return {
        approvalId: updatedApproval.id,
        requestId: approval.requestId,
        approvalStatus: updatedApproval.status,
        requestStatus: approval.request.status,
        notifications: [],
        adminApprovalPayload: null,
      };
    }

    const request = await tx.agentReactivationRequest.update({
      where: {
        id: approval.requestId,
      },
      data: {
        status: "APPROVED_WAITING_PAYMENT",
        approvedAt: now,
        remarks:
          payload.remarks ??
          "Reactivation request approved. Waiting for payment.",
      },
    });

    const payment = await tx.agentReactivationPayment.upsert({
      where: {
        requestId: request.id,
      },
      update: {},
      create: {
        requestId: request.id,
        agentId: approval.request.agentId,
        amount: 500,
        currency: "PHP",
        provider: "XENDIT",
        status: "PENDING",
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
        request: {
          select: {
            id: true,
            status: true,
            requestType: true,
            requestedAt: true,
          },
        },
      },
    });

    const notification =
      await tx.agentNotification.create({
        data: {
          agentId: approval.request.agentId,
          type: NotificationType.REACTIVATION_PAYMENT,
          title: "REACTIVATION REQUEST APPROVED",
          actionType: NotificationActionType.PROCEED_PAYMENT,
          entityId: request.id,
          actionResult: ActionResult.PAYMENT_PENDING,
          message:
            "Your admin reactivation request has been approved. Pay ₱500 to continue reactivation.",
        },
      });

    return {
      approvalId: updatedApproval.id,
      requestId: request.id,
      approvalStatus: updatedApproval.status,
      requestStatus: request.status,
      notifications: [notification],
      adminApprovalPayload: null,
      adminPaymentPayload: {
        paymentId: payment.id,
        requestId: payment.requestId,
        agentId: payment.agentId,
        status: payment.status,
        title: "New Reactivation Payment",
        message: `${payment.agent.fullName} has a pending reactivation payment.`,
        createdAt: now,
      },
    };
  });

  for (const notification of result.notifications) {
    emitNotification(notification.agentId, {
      id: notification.id,
      title: notification.title,
      message: notification.message,
      type: notification.type,
      isRead: notification.isRead,
      createdAt: notification.createdAt,
      entityId: notification.entityId,
      actionType: notification.actionType,
      actionResult:notification.actionResult
      
    });
  }


  if (result.adminApprovalPayload) {
    emitAdminReactivationApproval(
      result.adminApprovalPayload
    );
  }

  if (result.adminPaymentPayload) {
    emitAdminPaymentUpdated(result.adminPaymentPayload);
  }


  return {
    approvalId: result.approvalId,
    requestId: result.requestId,
    approvalStatus: result.approvalStatus,
    requestStatus: result.requestStatus,
  };
};


export const getMyReactivationApprovalProgressService = async (
  userId: number,
  requestId: string
) => {
  const user = await prisma.user.findUnique({
    where: {
      id: userId,
    },
    include: {
      agent: true,
    },
  });

  if (!user?.agent) {
    throw new Error("Agent account not found.");
  }

  const request =
    await prisma.agentReactivationRequest.findFirst({
      where: {
        id: requestId,
        agentId: user.agent.id,
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
        approvals: {
          orderBy: {
            approvalOrder: "asc",
          },
          include: {
            reviewerUser: {
              select: {
                id: true,
                name: true,
              },
            },
            reviewerAgent: {
              select: {
                id: true,
                fullName: true,
                agentCode: true,
                level: true,
              },
            },
          },
        },
      },
    });

  if (!request) {
    throw new Error("Reactivation request not found.");
  }

  return {
    requestId: request.id,
    requestStatus: request.status,
    requestedAt: request.requestedAt,
    approvedAt: request.approvedAt,
    failedAt: request.failedAt,
    remarks: request.remarks,
    agent: request.agent,
    approvals: request.approvals,
  };
};