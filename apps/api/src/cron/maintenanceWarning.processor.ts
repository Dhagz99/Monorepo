import {   NotificationType, ReactivationRequestStatus, ReactivationType } from "../../generated/prisma";
import prisma from "../lib/prisma";
import {
  emitNotification,
} from "../socket/socketEmitter";
import { sendDownlineEmail, sendExpiringAgentEmail } from "./maintenance.helper";


function getDaysFromExpiredAt(expiredAt: Date) {
  const now = new Date();

  const diffMs =
    now.getTime() - expiredAt.getTime();

  return Math.floor(
    diffMs / (1000 * 60 * 60 * 24)
  );
}

// export async function processDeactivationWarning() {
//   const expiredAgentsWithLatestExpiredCycle =
//     await prisma.agent.findMany({
//       where: {
//         status: "EXPIRED",
//       },
//       select: {
//         id: true,
//         status: true,
//         level: true,
//         parentAgentId: true,

//         maintenanceCycles: {
//           where: {
//             status: "EXPIRED",
//             expiredAt: {
//               not: null,
//             },
//           },
//           orderBy: {
//             expiredAt: "desc",
//           },
//           take: 1,
//           select: {
//             id: true,
//             expiredAt: true,
//             status: true,
//           },
//         },
//       },
//     });

//   for (const expiredAgent of expiredAgentsWithLatestExpiredCycle) {
//     const latestExpiredCycle =
//       expiredAgent.maintenanceCycles[0];

//     if (!latestExpiredCycle?.expiredAt) {
//       continue;
//     }

//     const expiredDays =
//       getDaysFromExpiredAt(
//         latestExpiredCycle.expiredAt
//       );

//     try {
//       const notification =
//         await prisma.$transaction(
//           async (tx) => {
//             if (
//               expiredDays === 150 ||
//               expiredDays === 166 ||
//               expiredDays === 174
//             ) {
//               const existingNotification =
//                 await tx.agentNotification.findFirst({
//                   where: {
//                     agentId: expiredAgent.id,
//                     type: NotificationType.MAINTENANCE_WARNING,
//                     title: `WARNING PERMANENT DEACTIVATION - Day ${expiredDays}`,
//                   },
//                 });

//               if (existingNotification) {
//                 return null;
//               }

//               return tx.agentNotification.create({
//                 data: {
//                   agentId: expiredAgent.id,
//                   type: NotificationType.MAINTENANCE_WARNING,
//                   title: `WARNING PERMANENT DEACTIVATION - Day ${expiredDays}`,
//                   message:
//                     `You are now at ${expiredDays} days since your account expired. Please complete your sales requirements or request reactivation to avoid permanent deactivation.`,
//                 },
//               });
//             }

//             if (expiredDays >= 181) {
//               const existingDroppedNotification =
//                 await tx.agentNotification.findFirst({
//                   where: {
//                     agentId: expiredAgent.id,
//                     type: NotificationType.MAINTENANCE_DROPPED,
//                     title: "Account Permanently Deactivated",
//                   },
//                 });

//               await tx.agent.update({
//                 where: {
//                   id: expiredAgent.id,
//                 },
//                 data: {
//                   status: "DROPPED",
//                 },
//               });

//               if (existingDroppedNotification) {
//                 return null;
//               }

//               return tx.agentNotification.create({
//                 data: {
//                   agentId: expiredAgent.id,
//                   type: NotificationType.MAINTENANCE_DROPPED,
//                   title: "Account Permanently Deactivated",
//                   message:
//                     "Your account has been permanently deactivated because it remained expired for 181 days without successful reactivation.",
//                 },
//               });
//             }

//             return null;
//           }
//         );

//       if (notification) {
//         emitNotification(
//           expiredAgent.id,
//           notification
//         );
//       }
//     } catch (error) {
//       console.error(
//         `Failed deactivation warning for agent ${expiredAgent.id}`,
//         error
//       );
//     }
//   }
// }
export async function processDeactivationWarning() {
  const expiredAgentsWithLatestExpiredCycle =
    await prisma.agent.findMany({
      where: {
        status: "EXPIRED",
      },
      select: {
        id: true,
        status: true,
        level: true,
        parentAgentId: true,
        fullName: true,
        email: true,

        downlines: {
          select: {
            id: true,
            fullName: true,
            email: true,
          },
        },

        maintenanceCycles: {
          where: {
            status: "EXPIRED",
            expiredAt: {
              not: null,
            },
          },
          orderBy: {
            expiredAt: "desc",
          },
          take: 1,
          select: {
            id: true,
            expiredAt: true,
            status: true,
          },
        },
      },
    });

  for (const expiredAgent of expiredAgentsWithLatestExpiredCycle) {
    const latestExpiredCycle =
      expiredAgent.maintenanceCycles[0];

    if (!latestExpiredCycle?.expiredAt) {
      continue;
    }

    const expiredDays = getDaysFromExpiredAt(
      latestExpiredCycle.expiredAt
    );

    try {
      const notifications =
        await prisma.$transaction(async (tx) => {
          const createdNotifications = [];

          if (
            expiredDays === 150 ||
            expiredDays === 166 ||
            expiredDays === 174
          ) {
            const agentTitle = `WARNING PERMANENT DEACTIVATION - Day ${expiredDays}`;

            const existingAgentNotification =
              await tx.agentNotification.findFirst({
                where: {
                  agentId: expiredAgent.id,
                  type: NotificationType.MAINTENANCE_WARNING,
                  title: agentTitle,
                },
              });

            if (!existingAgentNotification) {
              const agentNotification =
                await tx.agentNotification.create({
                  data: {
                    agentId: expiredAgent.id,
                    type: NotificationType.MAINTENANCE_WARNING,
                    title: agentTitle,
                    message: `You are now at ${expiredDays} days since your account expired. Please complete your sales requirements or request reactivation to avoid permanent deactivation.`,
                  },
                });

              createdNotifications.push(agentNotification);
            }

            for (const downline of expiredAgent.downlines) {
              const downlineTitle = `UPLINE DEACTIVATION WARNING - Day ${expiredDays}`;

              const existingDownlineNotification =
                await tx.agentNotification.findFirst({
                  where: {
                    agentId: downline.id,
                    type: NotificationType.MAINTENANCE_WARNING,
                    title: downlineTitle,
                  },
                });

              if (existingDownlineNotification) {
                continue;
              }

              const downlineNotification =
                await tx.agentNotification.create({
                  data: {
                    agentId: downline.id,
                    type: NotificationType.MAINTENANCE_WARNING,
                    title: downlineTitle,
                    message: `Your upline ${expiredAgent.fullName} is now at ${expiredDays} days since account expiration and may be permanently deactivated soon.`,
                  },
                });

              createdNotifications.push(downlineNotification);
            }
          }

          if (expiredDays >= 181) {
            await tx.agent.update({
              where: {
                id: expiredAgent.id,
              },
              data: {
                status: "DROPPED",
              },
            });

            const existingDroppedNotification =
              await tx.agentNotification.findFirst({
                where: {
                  agentId: expiredAgent.id,
                  type: NotificationType.MAINTENANCE_DROPPED,
                  title: "Account Permanently Deactivated",
                },
              });

            if (!existingDroppedNotification) {
              const droppedNotification =
                await tx.agentNotification.create({
                  data: {
                    agentId: expiredAgent.id,
                    type: NotificationType.MAINTENANCE_DROPPED,
                    title: "Account Permanently Deactivated",
                    message:
                      "Your account has been permanently deactivated because it remained expired for 181 days without successful reactivation.",
                  },
                });

              createdNotifications.push(droppedNotification);
            }

            for (const downline of expiredAgent.downlines) {
              const downlineDroppedTitle =
                "Upline Permanently Deactivated";

              const existingDownlineDroppedNotification =
                await tx.agentNotification.findFirst({
                  where: {
                    agentId: downline.id,
                    type: NotificationType.MAINTENANCE_DROPPED,
                    title: downlineDroppedTitle,
                  },
                });

              if (existingDownlineDroppedNotification) {
                continue;
              }

              const downlineDroppedNotification =
                await tx.agentNotification.create({
                  data: {
                    agentId: downline.id,
                    type: NotificationType.MAINTENANCE_DROPPED,
                    title: downlineDroppedTitle,
                    message: `Your upline ${expiredAgent.fullName} has been permanently deactivated.`,
                  },
                });

              createdNotifications.push(downlineDroppedNotification);
            }
          }

          return createdNotifications;
        });

      for (const notification of notifications) {
        emitNotification(
          notification.agentId,
          notification
        );

        if (
          notification.agentId === expiredAgent.id &&
          notification.type === NotificationType.MAINTENANCE_WARNING &&
          expiredAgent.email
        ) {
          await sendExpiringAgentEmail(
            expiredAgent.email,
            expiredDays,
            expiredAgent.fullName
          );
        }

        const notifiedDownline =
          expiredAgent.downlines.find(
            (downline) =>
              downline.id === notification.agentId
          );

        if (
          notifiedDownline &&
          notification.type === NotificationType.MAINTENANCE_WARNING &&
          notifiedDownline.email
        ) {
          await sendDownlineEmail(
            notifiedDownline.email,
            expiredAgent.fullName,
            expiredDays,
            notifiedDownline.fullName
          );
        }
      }
    } catch (error) {
      console.error(
        `Failed deactivation warning for agent ${expiredAgent.id}`,
        error
      );
    }
  }
}


export async function processMaintenanceWarnings() {

  const now = new Date();

  const currentMonth =
    now.getMonth() + 1;

  const currentYear =
    now.getFullYear();

  const lastDay =
    new Date(
      currentYear,
      currentMonth,
      0
    ).getDate();

  const today =
    now.getDate();

  const remainingDays =
    lastDay - today;

  let warningType:
    | "7"
    | "3"
    | "1"
    | null = null;

  let title = "";

  let message = "";

  if (remainingDays <= 7) {

    warningType = "7";

    title =
      "Maintenance Reminder";

    message =
      "You have 7 days remaining to complete your sales maintenance.";

  }

  if (remainingDays <= 3) {

    warningType = "3";

    title =
      "Maintenance Warning";

    message =
      "You only have 3 days remaining to complete your sales maintenance.";

  }

  if (remainingDays <= 1) {

    warningType = "1";

    title =
      "Final Maintenance Notice";

    message =
      "Today is the final day to complete your sales maintenance.";
  }

  if (!warningType) {
    return;
  }

  const cycles =
    await prisma.agentMaintenanceCycle.findMany({
      where: {
        status: "ACTIVE",

        cycleMonth:
          currentMonth,

        cycleYear:
          currentYear,
      },
    });

  for (const cycle of cycles) {

    try {

      const shouldSend =
        (warningType === "7" &&
          !cycle.sevenDayWarningSent) ||

        (warningType === "3" &&
          !cycle.threeDayWarningSent) ||

        (warningType === "1" &&
          !cycle.oneDayWarningSent);

      if (!shouldSend) {
        continue;
      }

      const notification =
        await prisma.$transaction(
          async (tx) => {

            const created =
              await tx.agentNotification.create({
                data: {
                  agentId:
                    cycle.agentId,

                  type:
                    "MAINTENANCE_WARNING",

                  title,

                  message,
                },
              });

            const updateData: any =
              {};

            if (
              warningType === "7"
            ) {
              updateData.sevenDayWarningSent =
                true;
            }

            if (
              warningType === "3"
            ) {
              updateData.threeDayWarningSent =
                true;
            }

            if (
              warningType === "1"
            ) {
              updateData.oneDayWarningSent =
                true;
            }

            await tx.agentMaintenanceCycle.update({
              where: {
                id: cycle.id,
              },

              data:
                updateData,
            });

            return created;
          }
        );

      emitNotification(
        cycle.agentId,
        notification
      );

    } catch (error) {

      console.error(
        `Failed warning for cycle ${cycle.id}`,
        error
      );
    }
  }
}

// export async function processProbationRequests() {

//   const now = new Date();

//   const currentMonth =
//     now.getMonth() + 1;

//   const currentYear =
//     now.getFullYear();

//   const currentDay =
//     now.getDate();

//   const isGracePeriod =
//     currentDay > 12;

//   const cycleStartDate =
//     new Date(
//       currentYear,
//       currentMonth - 1,
//       1
//     );

//   const cycleEndDate =
//     new Date(
//       currentYear,
//       currentMonth,
//       0,
//       23,
//       59,
//       59
//     );

//   const probationRequests =
//     await prisma.agentReactivationRequest.findMany({
//       where: {
//         status:
//           ReactivationRequestStatus.PROBATION,

//         probationEndsAt: {
//           lte: now,
//         },
//       },
//     });

//   for (const request of probationRequests) {

//     try {

//       const completed =
//         request.completedSales >=
//         request.requiredSales;

//       const notification =
//         await prisma.$transaction(
//           async (tx) => {

//             if (completed) {

//               await tx.agentReactivationRequest.update({
//                 where: {
//                   id: request.id,
//                 },

//                 data: {
//                   status:
//                     ReactivationRequestStatus.COMPLETED,

//                   completedAt:
//                     now,

//                   isCompleted:
//                     true,
//                 },
//               });

//               await tx.agent.update({
//                 where: {
//                   id: request.agentId,
//                 },

//                 data: {
//                   status: "ACTIVE",
//                 },
//               });

//               await tx.agentMaintenanceCycle.create({
//                 data: {
//                   agentId:
//                     request.agentId,

//                   cycleMonth:
//                     currentMonth,

//                   cycleYear:
//                     currentYear,

//                   cycleStartDate,

//                   cycleEndDate,

//                   requiredSales:
//                     isGracePeriod
//                       ? 0
//                       : 1,

//                   completedSales: 0,

//                   remainingSales:
//                     isGracePeriod
//                       ? 0
//                       : 1,

//                   isCompleted:
//                     isGracePeriod,

//                   isFirstCycle:
//                     true,

//                   status:
//                     isGracePeriod
//                       ? "GRACE"
//                       : "ACTIVE",
//                 },
//               });



//               return tx.agentNotification.create({
//                 data: {
//                   agentId:
//                     request.agentId,

//                   type:
//                     NotificationType.MAINTENANCE_REACTIVATE,

//                   title:
//                     "PROBATION COMPLETED",

//                   message:
//                     "You have successfully completed your probation period and your account has been reactivated.",
//                 },
//               });
//             }

//             const cooldownUntil =
//               new Date(now);

//             cooldownUntil.setDate(
//               cooldownUntil.getDate() + 30
//             );

//             await tx.agentReactivationRequest.update({
//               where: {
//                 id: request.id,
//               },

//               data: {
//                 status:
//                   ReactivationRequestStatus.FAILED,

//                 failedAt:
//                   now,

//                 cooldownUntil,
//               },
//             });

//             return tx.agentNotification.create({
//               data: {
//                 agentId:
//                   request.agentId,

//                 type:
//                   NotificationType.MAINTENANCE_PROBATION,

//                 title:
//                   "PROBATION FAILED",

//                 message:
//                   "Your probation period has ended and the required sales target was not completed. You may submit another reactivation request after 30 days.",
//               },
//             });
//           }
//         );

//       emitNotification(
//         request.agentId,
//         notification
//       );

//     } catch (error) {

//       console.error(
//         `Failed probation processing for request ${request.id}`,
//         error
//       );
//     }
//   }
// }


async function completeProbation(
  tx: any,
  params: {
    request: any;
    now: Date;
    currentMonth: number;
    currentYear: number;
    cycleStartDate: Date;
    cycleEndDate: Date;
    isGracePeriod: boolean;
  }
) {
  const {
    request,
    now,
    currentMonth,
    currentYear,
    cycleStartDate,
    cycleEndDate,
    isGracePeriod,
  } = params;

  await tx.agentReactivationRequest.update({
    where: {
      id: request.id,
    },
    data: {
      status: ReactivationRequestStatus.COMPLETED,
      completedAt: now,
      isCompleted: true,
    },
  });

  await tx.agent.update({
    where: {
      id: request.agentId,
    },
    data: {
      status: "ACTIVE",
    },
  });

  await tx.agentMaintenanceCycle.create({
    data: {
      agentId: request.agentId,
      cycleMonth: currentMonth,
      cycleYear: currentYear,
      cycleStartDate,
      cycleEndDate,
      requiredSales: isGracePeriod ? 0 : 1,
      completedSales: 0,
      remainingSales: isGracePeriod ? 0 : 1,
      isCompleted: isGracePeriod,
      isFirstCycle: true,
      status: isGracePeriod ? "GRACE" : "ACTIVE",
    },
  });

  return tx.agentNotification.create({
    data: {
      agentId: request.agentId,
      type: NotificationType.MAINTENANCE_PROBATION,
      title: "PROBATION COMPLETED",
      message:
        "You have successfully completed your probation period and your account has been reactivated.",
    },
  });
}


async function failProbation(tx: any,
  params: {
    request: any;
    now: Date;
    currentMonth: number;
    currentYear: number;
    cycleStartDate: Date;
    cycleEndDate: Date;
    isGracePeriod: boolean;
  }
) {

  const {
    request,
    now,
    currentMonth,
    currentYear,
    cycleStartDate,
    cycleEndDate,
    isGracePeriod,
  } = params;

  const cooldownUntil = new Date(now);
  cooldownUntil.setDate(cooldownUntil.getDate() + 30);

  await tx.agentReactivationRequest.update({
    where: {
      id: request.id,
    },
    data: {
      status: ReactivationRequestStatus.FAILED,
      failedAt: now,
      cooldownUntil,
      isCompleted: false,
    },
  });

  await tx.agent.update({
    where: {
      id: request.agentId,
    },
    data: {
      status: "EXPIRED",
    },
  });

  await tx.agentMaintenanceCycle.create({
    data: {
      agentId: request.agentId,
      cycleMonth: currentMonth,
      cycleYear: currentYear,
      cycleStartDate,
      cycleEndDate,
      requiredSales: 0,
      completedSales: 0,
      remainingSales: 0,
      isCompleted: false,
      status: "EXPIRED",
      expiredAt: now
    },
  });

  return tx.agentNotification.create({
    data: {
      agentId: request.agentId,
      type: NotificationType.MAINTENANCE_PROBATION,
      title: "PROBATION FAILED",
      message:
        "Your probation period has ended and the required sales target was not completed. You may submit another reactivation request after 30 days.",
    },
  });
}


const SELF_REQUIRED_SALES = 1;
const ADMIN_FIRST_MONTH_REQUIRED_SALES = 2;
const ADMIN_TOTAL_REQUIRED_SALES = 3;

export async function processProbationRequests() {
  const now = new Date();

  const currentMonth = now.getMonth() + 1;
  const currentYear = now.getFullYear();
  const currentDay = now.getDate();

  const isGracePeriod = currentDay > 12;

  const cycleStartDate = new Date(currentYear, currentMonth - 1, 1);
  const cycleEndDate = new Date(currentYear, currentMonth, 0, 23, 59, 59);

  const probationRequests =
    await prisma.agentReactivationRequest.findMany({
      where: {
        status: ReactivationRequestStatus.PROBATION,
        probationStartedAt: {
          not: null,
        },
        probationEndsAt: {
          not: null,
        },
      },
    });

  for (const request of probationRequests) {
    try {
      const notification = await prisma.$transaction(async (tx) => {
        const probationStart = request.probationStartedAt!;
        const probationEnd = request.probationEndsAt!;

        const firstMonthEnd = new Date(probationStart);
        firstMonthEnd.setMonth(firstMonthEnd.getMonth() + 1);

        const isSelfReactivation =
          request.requestType ===
          ReactivationType.SELF_REACTIVATION;

        const isAdminApproval =
          request.requestType ===
          ReactivationType.ADMIN_APPROVAL;

        if (isSelfReactivation) {
          if (now < probationEnd) {
            return null;
          }

          if (request.completedSales >= SELF_REQUIRED_SALES) {
            return completeProbation(tx, {
              request,
              now,
              currentMonth,
              currentYear,
              cycleStartDate,
              cycleEndDate,
              isGracePeriod,
            });
          }

          return failProbation(tx, {
                request,
                now,
                currentMonth,
                currentYear,
                cycleStartDate,
                cycleEndDate,
                isGracePeriod,
              });
        }

        if (isAdminApproval) {
          /**
           * ADMIN APPROVAL RULE:
           * - 2 months probation
           * - First month requires 2 sales
           * - Second month requires 1 additional sale
           * - Total required sales = 3
           */

          if (request.completedSales >= ADMIN_TOTAL_REQUIRED_SALES) {
            return completeProbation(tx, {
              request,
              now,
              currentMonth,
              currentYear,
              cycleStartDate,
              cycleEndDate,
              isGracePeriod,
            });
          }

          const firstMonthAlreadyEnded = now >= firstMonthEnd;
          const probationAlreadyEnded = now >= probationEnd;

          if (
            firstMonthAlreadyEnded &&
            !probationAlreadyEnded &&
            request.completedSales < ADMIN_FIRST_MONTH_REQUIRED_SALES
          ) {
            return failProbation(tx, {
                request,
                now,
                currentMonth,
                currentYear,
                cycleStartDate,
                cycleEndDate,
                isGracePeriod,
              });
          }

          if (probationAlreadyEnded) {
            if (request.completedSales >= ADMIN_TOTAL_REQUIRED_SALES) {
              return completeProbation(tx, {
                request,
                now,
                currentMonth,
                currentYear,
                cycleStartDate,
                cycleEndDate,
                isGracePeriod,
              });
            }

            return failProbation(tx, {
                request,
                now,
                currentMonth,
                currentYear,
                cycleStartDate,
                cycleEndDate,
                isGracePeriod,
              });
          }

          return null;
        }

        return null;
      });

      if (notification) {
        emitNotification(request.agentId, notification);
      }
    } catch (error) {
      console.error(
        `Failed probation processing for request ${request.id}`,
        error
      );
    }
  }
}