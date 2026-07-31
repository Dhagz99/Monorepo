import { GetUsersParams, OverrideRulePayload } from "@repo/shared";
import prisma from "../../lib/prisma";
import { Agent } from "http";
import { AgentLevel, AgentStatus } from "../../../generated/prisma";
import { Prisma } from "@prisma/client";
import { OverrideCommissionRulePayload, validateOverrideRulePayload } from "./validation/overrideCommissionRule.validation";


export const getCommissionSettingsService =
  async () => {

    const [
      commissionRules,
      overrideRules,
      // users
    ] = await prisma.$transaction([

      prisma.commissionRule.findMany({
        where: {
          isActive: true,
        },
      }),

      prisma.overrideCommissionRule.findMany({
        where: {
          isActive: true,
        },
      }),

      // prisma.user.findMany({
      //   where: {
      //     isActive: true,
      //   },

      //   select: {
      //     id: true,
      //     username: true,
      //     name: true,
      //     isActive:true,
      //     email: true,
      //   },

      //   orderBy: {
      //     username: "asc",
      //   },
      // }),
    ]);

    return {
      // users,
      commissionRules,
      overrideRules,
    };
};


export const getAllUsers = async ({
  page= 1,
  limit=5,
  search,
  status,
}:GetUsersParams) => {
    const skip = (page - 1) * limit;
    
    const whereCondition = {
      ...(status && {
        isActive: status === "active",
      }),

      ...(search && {
        OR: [
          {
            name: {
              contains: search,
              mode: "insensitive" as const,
            },
          },
          {
            username: {
              contains: search,
              mode: "insensitive" as const,
            },
          },
          {
            email: {
              contains: search,
              mode: "insensitive" as const,
            },
          },
        ],
      }),
    };

      const [data, total] = await Promise.all([
    prisma.user.findMany({
      where: whereCondition,

      skip,

      take: limit,

      orderBy: {
        createdAt: "desc",
      },


    }),

    prisma.user.count({
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
}

export const getRolesService = async () => {
    return prisma.role.findMany({
      orderBy:{
        name:"asc"
      },
      select:{
        id:true,
        name: true
      }
    });
}

export const getBranchesService = async () => {
    return prisma.branch.findMany({
        where: {
            deletedAt: null,
        },
        orderBy: {
            branchCode: "asc",
        },
        select: {
            branchCode: true,
            companyName: true,
        },
    });
};



export const searchEligibleAgentsService =
  async (search?: string) => {
    const normalizedSearch =
      search?.trim() ?? "";

    if (normalizedSearch.length < 2) {
      return {
        data: [],
      };
    }

    const excludedStatuses: AgentStatus[] = [
      AgentStatus.REJECTED,
      AgentStatus.PENDING,
      AgentStatus.DROPPED,
      AgentStatus.SUSPENDED,
    ];

    const agents =
      await prisma.agent.findMany({
        where: {
          status: {
            notIn: excludedStatuses,
          },

          OR: [
            {
              agentCode: {
                contains: normalizedSearch,
                mode: "insensitive",
              },
            },
            {
              fullName: {
                contains: normalizedSearch,
                mode: "insensitive",
              },
            },
          ],
        },

        take: 20,

        orderBy: {
          fullName: "asc",
        },

        select: {
          id: true,
          agentCode: true,
          fullName: true,
          level: true,
          status: true,
        },
      });

    return {
      data: agents,
    };
  };





export async function createOverrideCommissionRuleService(
  payload: OverrideCommissionRulePayload
) {
  const validated =
    validateOverrideRulePayload(
      payload
    );

  const existingRule =
    await prisma.overrideCommissionRule.findFirst({
      where: {
        receiverLevel:
          validated.receiverLevel,

        sourceLevel:
          validated.sourceLevel,
      },

      select: {
        id: true,
      },
    });

  if (existingRule) {
    throw new Error(
      "An override rule already exists for these levels."
    );
  }

  return prisma.overrideCommissionRule.create({
    data: {
      receiverLevel:
        validated.receiverLevel,

      sourceLevel:
        validated.sourceLevel,

      amount:
        validated.amount,
    },
  });
}

export async function updateOverrideCommissionRuleService(
  id: string,
  payload: OverrideCommissionRulePayload
) {
  const validated =
    validateOverrideRulePayload(
      payload
    );

  const existingRule =
    await prisma.overrideCommissionRule.findUnique({
      where: {
        id,
      },

      select: {
        id: true,
      },
    });

  if (!existingRule) {
    throw new Error(
      "Override commission rule not found."
    );
  }

  const duplicateRule =
    await prisma.overrideCommissionRule.findFirst({
      where: {
        receiverLevel:
          validated.receiverLevel,

        sourceLevel:
          validated.sourceLevel,

        NOT: {
          id,
        },
      },

      select: {
        id: true,
      },
    });

  if (duplicateRule) {
    throw new Error(
      "Another override rule already exists for these levels."
    );
  }

  return prisma.overrideCommissionRule.update({
    where: {
      id,
    },

    data: {
      receiverLevel:
        validated.receiverLevel,

      sourceLevel:
        validated.sourceLevel,

      amount:
        validated.amount,
    },
  });
}

export async function deleteOverrideCommissionRuleService(
  id: string
) {
  const existingRule =
    await prisma.overrideCommissionRule.findUnique({
      where: {
        id,
      },

      select: {
        id: true,
      },
    });

  if (!existingRule) {
    throw new Error(
      "Override commission rule not found."
    );
  }

  await prisma.overrideCommissionRule.delete({
    where: {
      id,
    },
  });

  return {
    id,
  };
}