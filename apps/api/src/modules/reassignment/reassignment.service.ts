import {
  DroppedAgentItem,
  GetReassignmentParams,
  GetDroppedAgentsResponse,
  GetDroppedAgentDownlinesResponse,
  GetAvailableReassignmentUplinesResponse,
  ReassignDownlinesPayload,
  ReassignDownlinesResponse,
} from "@repo/shared";

import prisma from "../../lib/prisma";
import { NotificationType } from "../../../generated/prisma";
import { emitNotification } from "../../socket/socketEmitter";

function canUplineAcceptDownline(
  uplineLevel: string,
  downlineLevel: string
) {
  return (
    (uplineLevel === "L1" && downlineLevel === "L2") ||
    (uplineLevel === "L2" && downlineLevel === "L3")
  );
}

export const getDroppedAgents = async ({
  page = 1,
  limit = 10,
  search,
}: GetReassignmentParams): Promise<GetDroppedAgentsResponse> => {
  const skip = (page - 1) * limit;

  const whereCondition = {
    status: "DROPPED" as const,

    downlines: {
      some: {},
    },

    ...(search?.trim() && {
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
    }),
  };

  const [droppedAgents, total] = await prisma.$transaction([
    prisma.agent.findMany({
      where: whereCondition,
      skip,
      take: limit,
      orderBy: {
        updatedAt: "desc",
      },
      select: {
        id: true,
        agentCode: true,
        fullName: true,
        level: true,
        status: true,
        updatedAt: true,

        downlines: {
          select: {
            id: true,
          },
        },
      },
    }),

    prisma.agent.count({
      where: whereCondition,
    }),
  ]);

  const data: DroppedAgentItem[] = droppedAgents.map((agent) => ({
    id: agent.id,
    agentCode: agent.agentCode,
    fullName: agent.fullName,
    level: agent.level,
    status: agent.status,
    updatedAt: agent.updatedAt,
    downlinesCount: agent.downlines.length,
  }));

  return {
    data,
    meta: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};

export const getDroppedAgentDownlines = async (
  droppedAgentId: string
): Promise<GetDroppedAgentDownlinesResponse> => {
  const droppedAgent = await prisma.agent.findUnique({
    where: {
      id: droppedAgentId,
    },
    select: {
      id: true,
      agentCode: true,
      fullName: true,
      status: true,
      downlines: {
        select: {
          id: true,
          agentCode: true,
          fullName: true,
          level: true,
          status: true,
        },
        orderBy: {
          fullName: "asc",
        },
      },
    },
  });

  if (!droppedAgent) {
    throw new Error("Dropped agent not found.");
  }

  if (droppedAgent.status !== "DROPPED") {
    throw new Error("Agent is not dropped.");
  }

  return {
    droppedAgent: {
      id: droppedAgent.id,
      agentCode: droppedAgent.agentCode,
      fullName: droppedAgent.fullName,
    },
    downlines: droppedAgent.downlines,
  };
};

export const getAvailableReassignmentUplines = async (
  droppedAgentId: string,
  downlineAgentIds: string[] = []
): Promise<GetAvailableReassignmentUplinesResponse> => {
  const selectedDownlines =
    downlineAgentIds.length > 0
      ? await prisma.agent.findMany({
          where: {
            id: {
              in: downlineAgentIds,
            },
            parentAgentId: droppedAgentId,
          },
          select: {
            id: true,
            level: true,
          },
        })
      : [];

  const uplines = await prisma.agent.findMany({
    where: {
      id: {
        notIn: [
          droppedAgentId,
          ...downlineAgentIds,
        ],
      },
      status: {
        notIn: ["DROPPED", "EXPIRED", "SUSPENDED", "PENDING"],
      },
      level: {
        in: ["L1", "L2"],
      },
    },
    select: {
      id: true,
      agentCode: true,
      fullName: true,
      level: true,
      status: true,
    },
    orderBy: {
      fullName: "asc",
    },
  });

  const data = uplines.filter((upline) => {
    if (selectedDownlines.length === 0) {
      return true;
    }

    return selectedDownlines.every((downline) =>
      canUplineAcceptDownline(
        upline.level,
        downline.level
      )
    );
  });

  return {
    data,
  };
};

export const reassignDownlines = async (
  payload: ReassignDownlinesPayload & {
    reassignedById: number;
  }
): Promise<ReassignDownlinesResponse> => {
  const {
    droppedAgentId,
    newUplineId,
    downlineAgentIds,
    reassignedById,
    reason,
  } = payload;

  const result = await prisma.$transaction(async (tx) => {
    const droppedAgent = await tx.agent.findUnique({
      where: {
        id: droppedAgentId,
      },
      select: {
        id: true,
        status: true,
      },
    });

    if (!droppedAgent) {
      throw new Error("Dropped agent not found.");
    }

    if (droppedAgent.status !== "DROPPED") {
      throw new Error("Only dropped agents can be reassigned.");
    }

    const newUpline = await tx.agent.findUnique({
      where: {
        id: newUplineId,
      },
      select: {
        id: true,
        fullName: true,
        status: true,
        level: true,
        downlines: {
          select: {
            id: true,
            level: true,
          },
        },
      },
    });

    if (!newUpline) {
      throw new Error("New upline not found.");
    }

    if (!["ACTIVE", "PROBATION"].includes(newUpline.status)) {
      throw new Error(
        "New upline must be ACTIVE or PROBATION."
      );
    }

    if (
      newUpline.level !== "L1" &&
      newUpline.level !== "L2"
    ) {
      throw new Error(
        "Only L1 and L2 agents can be selected as new uplines."
      );
    }

    const downlines = await tx.agent.findMany({
      where: {
        id: {
          in: downlineAgentIds,
        },
        parentAgentId: droppedAgentId,
      },
      select: {
        id: true,
        parentAgentId: true,
        fullName: true,
        level: true,
      },
    });

    if (downlines.length !== downlineAgentIds.length) {
      throw new Error(
        "Some selected downlines do not belong to this dropped agent."
      );
    }

    const invalidDownline = downlines.find(
      (downline) =>
        !canUplineAcceptDownline(
          newUpline.level,
          downline.level
        )
    );

    if (invalidDownline) {
      throw new Error(
        `A ${newUpline.level} upline cannot accept a ${invalidDownline.level} downline.`
      );
    }

    
    await tx.agent.updateMany({
      where: {
        id: {
          in: downlineAgentIds,
        },
        parentAgentId: droppedAgentId,
      },
      data: {
        parentAgentId: newUplineId,
      },
    });

    const downlineNotifications = await Promise.all(
      downlines.map((downline) =>
        tx.agentNotification.create({
          data: {
            agentId: downline.id,
            type: NotificationType.AGENT_REASSIGNMENT,
            title: "UPLINE REASSIGNMENT",
            message: `You have been reassigned to ${newUpline.fullName} as your new upline.`,
          },
        })
      )
    );

    const downlineNames = downlines.map(
      (downline) => downline.fullName
    );

    const previewNames = downlineNames
      .slice(0, 5)
      .join(", ");

    const newUplineMessage =
      downlineNames.length === 1
        ? `The following agent has been reassigned under your supervision: ${downlineNames[0]}.`
        : downlineNames.length <= 5
          ? `The following agents have been reassigned under your supervision: ${previewNames}.`
          : `The following agents have been reassigned under your supervision: ${previewNames}, and ${downlineNames.length - 5} more.`;

    const newUplineNotification =
      await tx.agentNotification.create({
        data: {
          agentId: newUpline.id,
          type: NotificationType.AGENT_REASSIGNMENT,
          title: "NEW DOWNLINE ASSIGNMENT",
          message: newUplineMessage,
        },
      });

    const notifications = [
      ...downlineNotifications,
      newUplineNotification,
    ];

    await tx.agentReassignmentLog.createMany({
      data: downlines.map((downline) => ({
        droppedAgentId,
        oldUplineId: downline.parentAgentId,
        newUplineId,
        downlineAgentId: downline.id,
        reassignedById,
        reason,
      })),
    });

    return {
      success: true,
      reassignedCount: downlines.length,
      notifications,
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
    });
  }

  return {
    success: result.success,
    reassignedCount: result.reassignedCount,
  };
};