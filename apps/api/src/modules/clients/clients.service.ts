import prisma from "../../lib/prisma";
import { GetClientsParams } from "@repo/shared";

export const getAllClients = async ({
  page = 1,
  limit = 10,
  search,
}: GetClientsParams) => {
  const skip = (page - 1) * limit;

  const whereCondition = search
    ? {
        clientName: {
          contains: search,
          mode: "insensitive" as const,
        },
      }
    : {};

  const [data, total] = await Promise.all([
    prisma.dailyClientDetails.findMany({
      where: whereCondition,
      skip,
      take: limit,
      orderBy: {
        createdAt: "desc",
      },
    }),

    prisma.dailyClientDetails.count({
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

export const getCommissionDetails = async (
    clientId: string
  ) => {
    const scan =
      await prisma.commissionScan.findUnique({
        where: {
          clientId,
        },

        include: {
          client: true,

          branch: true,

          scanner: true,

          commissionTransactions: {
            include: {
              sourceAgent: true,
              receiverAgent: true,
              commissionRule: true,
            },

            orderBy: {
              createdAt: "asc",
            },
          },
        },
      });

    if (!scan) {
      throw new Error(
        "Commission details not found"
      );
    }

    return scan;
  };