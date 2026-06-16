import {   NotificationType, ReactivationRequestStatus } from "../../generated/prisma";
import prisma from "../lib/prisma";

import {
  emitNotification,
} from "../socket/socketEmitter";


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

export async function processProbationRequests() {

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

  const probationRequests =
    await prisma.agentReactivationRequest.findMany({
      where: {
        status:
          ReactivationRequestStatus.PROBATION,

        probationEndsAt: {
          lte: now,
        },
      },
    });

  for (const request of probationRequests) {

    try {

      const completed =
        request.completedSales >=
        request.requiredSales;

      const notification =
        await prisma.$transaction(
          async (tx) => {

            if (completed) {

              await tx.agentReactivationRequest.update({
                where: {
                  id: request.id,
                },

                data: {
                  status:
                    ReactivationRequestStatus.COMPLETED,

                  completedAt:
                    now,

                  isCompleted:
                    true,
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
                  agentId:
                    request.agentId,

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



              return tx.agentNotification.create({
                data: {
                  agentId:
                    request.agentId,

                  type:
                    NotificationType.MAINTENANCE_REACTIVATE,

                  title:
                    "PROBATION COMPLETED",

                  message:
                    "You have successfully completed your probation period and your account has been reactivated.",
                },
              });
            }

            const cooldownUntil =
              new Date(now);

            cooldownUntil.setDate(
              cooldownUntil.getDate() + 30
            );

            await tx.agentReactivationRequest.update({
              where: {
                id: request.id,
              },

              data: {
                status:
                  ReactivationRequestStatus.FAILED,

                failedAt:
                  now,

                cooldownUntil,
              },
            });

            return tx.agentNotification.create({
              data: {
                agentId:
                  request.agentId,

                type:
                  NotificationType.MAINTENANCE_PROBATION,

                title:
                  "PROBATION FAILED",

                message:
                  "Your probation period has ended and the required sales target was not completed. You may submit another reactivation request after 30 days.",
              },
            });
          }
        );

      emitNotification(
        request.agentId,
        notification
      );

    } catch (error) {

      console.error(
        `Failed probation processing for request ${request.id}`,
        error
      );
    }
  }
}