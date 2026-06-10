import { GetUsersParams } from "@repo/shared";
import prisma from "../../lib/prisma";

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