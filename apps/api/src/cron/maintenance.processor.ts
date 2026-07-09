import prisma from "../lib/prisma";

import {
  emitNotification,
} from "../socket/socketEmitter";

import {
  createNextCycle,
} from "./maintenance.helper";

export async function processMaintenanceCycles() {

  console.log(
    "Processing maintenance cycles..."
  );

  const now = new Date();

  const overdueCycles =
    await prisma.agentMaintenanceCycle.findMany({
      where: {
       status: {
          in: [
            "ACTIVE",
            "GRACE"
          ],
        },

        cycleEndDate: {
          lt: now,
        },
      },

      orderBy: [
        {
          cycleYear: "asc",
        },
        {
          cycleMonth: "asc",
        },
      ],
    });

  for (const cycle of overdueCycles) {

    try {

      const completed =
        cycle.status === "GRACE" ||
        cycle.completedSales >= cycle.requiredSales;

      const notification =
        await prisma.$transaction(
          async (tx) => {

          if (completed) {

             const notification =
              await tx.agentNotification.create({
                data: {
                  agentId: cycle.agentId,
                  type: "MAINTENANCE_COMPLETED",
                  title:
                    cycle.status === "GRACE"
                      ? "Grace Period Completed"
                      : "Maintenance Completed",
                  message:
                    cycle.status === "GRACE"
                      ? "Your grace period has ended. Your account remains active."
                      : "You successfully completed your sales maintenance.",
                },
              });
            await tx.agentMaintenanceCycle.update({
              where: {
                id: cycle.id,
              },
              data: {
                status: "COMPLETED",
                isCompleted: true,
                completedAt: now,
              },
            });

            await tx.agent.update({
              where: {
                id: cycle.agentId,
              },
              data: {
                status: "ACTIVE",
              },
            });

           
            await createNextCycle(tx, cycle);

            return notification;
          } else {

              await tx.agentMaintenanceCycle.update({
                where: {
                  id: cycle.id,
                },

                data: {
                  status: "EXPIRED",

                  expiredAt: now,
                },
              });

              await tx.agent.update({
                where: {
                  id: cycle.agentId,
                },

                data: {
                  status: "EXPIRED",
                },
              });

              const notification =
                await tx.agentNotification.create({
                  data: {
                    agentId:
                      cycle.agentId,

                    type:
                      "MAINTENANCE_EXPIRED",

                    title:
                      "Maintenance Expired",

                    message:
                      "You failed to complete your required sales maintenance.",
                  },
                });

              // no next cycle create for now wait for confirmation.
              // await createNextCycle(
              //   tx,
              //   cycle
              // );

              return notification;
            }
          }
        );

      emitNotification(
        cycle.agentId,
        notification
      );

    } catch (error) {

      console.error(
        `Failed processing maintenance cycle ${cycle.id}`,
        error
      );
    }
  }

  console.log(
    "Maintenance processing complete."
  );
}