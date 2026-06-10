import { Prisma } from "@prisma/client";

export async function createNextCycle(
  tx: Prisma.TransactionClient,

  cycle: {
    agentId: string;
    cycleMonth: number;
    cycleYear: number;
  }
) {

  const nextDate =
    new Date(
      cycle.cycleYear,
      cycle.cycleMonth,
      1
    );

  const nextMonth =
    nextDate.getMonth() + 1;

  const nextYear =
    nextDate.getFullYear();

  const existingCycle =
    await tx.agentMaintenanceCycle.findFirst({
      where: {
        agentId:
          cycle.agentId,

        cycleMonth:
          nextMonth,

        cycleYear:
          nextYear,
      },
    });

  if (existingCycle) {
    return;
  }

  await tx.agentMaintenanceCycle.create({
    data: {

      agentId:
        cycle.agentId,

      cycleMonth:
        nextMonth,

      cycleYear:
        nextYear,

      cycleStartDate:
        new Date(
          nextYear,
          nextMonth - 1,
          1
        ),

      cycleEndDate:
        new Date(
          nextYear,
          nextMonth,
          0
        ),

      requiredSales: 1,

      completedSales: 0,

      remainingSales: 1,

      isCompleted: false,

      status: "ACTIVE",
    },
  });
}