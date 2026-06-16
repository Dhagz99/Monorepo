import { CreateCommissionPayload, UpdateCommissionRules, UpdateOverrideRules } from "@repo/shared";
import prisma from "../../lib/prisma";
import { calculateDirectCommission } from "./utils/commission.direct";
import { getAgentUplines } from "./utils/commission.fetchUpline";
import generateSaleReference from "./utils/commission.saleRef";

export const scannedAgent = async (
  agentCode: string,
  clientId: string
) => {



  const agent = await prisma.agent.findFirst({
    where: {
      agentCode,
    },

    include: {
      branches: {
        where: {
          isActive: true,
        },

        include: {
          branch: true,
        },
      },

      parentAgent: {
        include: {
          parentAgent: true,
        },
      },
    },
  });

  if (!agent) {
    throw new Error(
      "Agent not found"
    );
  }


  const client =
    await prisma.dailyClientDetails.findUnique({
      where: {
        id: clientId,
      },
    });

  if (!client) {
    throw new Error(
      "Client not found"
    );
  }

  const commissionRule =
    await prisma.commissionRule.findFirst({
      where: {
        agentStatus:
          agent.status,
        isActive: true,
      },
    });

  if (!commissionRule) {
    throw new Error(
      "Commission rule not found"
    );
  }



  const commissionAmount =
    calculateDirectCommission({
      treshold: Number(
        commissionRule.sspAmount
      ),

      formulaType:
        commissionRule.formulaType,

      installmentAmount:
        Number(
          client.loanAmount
        ),

      term:
        client.term,

      piraRate:
        commissionRule.piraRate,
    });



  const uplines = getAgentUplines(agent);




  const overrideRules =
    await prisma.overrideCommissionRule.findMany({
      where: {
        sourceLevel:
          agent.level,

        isActive: true,
      },
    });




  const overrideCommissions = uplines.map((upline) => {
    const rule = overrideRules.find(
      (r) => r.receiverLevel === upline.level
    );

    let blocked = false;
    let reason: string | null = null;


    // L3 EXPIRED -> block all uplines
    if (agent.level === "L3" && agent.status === "EXPIRED") {
      blocked = true;
      reason = "Source agent L3 is expired";
    }

    // L2 EXPIRED -> block L1
    else if (
      upline.level === "L1" &&
      uplines.some(
        (u) =>
          u.level === "L2" &&
          u.status === "EXPIRED"
      )
    ) {
      blocked = true;
      reason = "Blocked by expired L2";
    }

    // Expired L1 earns nothing
    else if (
      upline.level === "L1" &&
      upline.status === "EXPIRED"
    ) {
      blocked = true;
      reason = "L1 is expired";
    }

    return {
      agent: {
        id: upline.id,
        agentCode: upline.agentCode,
        fullName: upline.fullName,
        level: upline.level,
        status: upline.status,
      },

      amount: blocked
        ? 0
        : Number(rule?.amount ?? 0),

      blocked,

      reason,

      ruleId: rule?.id ?? null,
    };
  });


  return {
    agent,

    client,

    directCommission: {
      amount:
        commissionAmount,

      rule: commissionRule,
    },

    uplines,

    overrideCommissions,
  };
};







export const createCommissionScan = async ({
  clientId,
  agentId,
  branchId,
  scannedBy,
}: CreateCommissionPayload) => {

  const agent =
    await prisma.agent.findUnique({
      where: {
        id: agentId,
      },
    });

  if (!agent) {
    throw new Error(
      "Agent not found"
    );
  }

  const scanData =
    await scannedAgent(
      agent.agentCode,
      clientId
    );

  const saleReference =
    generateSaleReference("SCAN");

  return prisma.$transaction(
    async (tx) => {


      const commissionScan =
        await tx.commissionScan.create({
          data: {
            clientId,
            claimedByAgentId: agentId,
            branchId,
            scannedBy,
            saleReference,
            AgentScannedStatus:
              scanData.agent.status,
          },
        });


      const creditUpdates =
        new Map<string, number>();


      await tx.commissionTransaction.create({
        data: {
          sourceAgentId:
            scanData.agent.id,

          receiverAgentId:
            scanData.agent.id,

          commissionRuleId:
            scanData.directCommission.rule.id,

          overrideCommissionRuleId:
            null,

          commissionScanId:
            commissionScan.id,

          commissionType:
            "DIRECT",

          saleAmount: Number(
            scanData.client.loanAmount ?? 0
          ),

          commissionAmount:
            scanData.directCommission.amount,

          percentage:
            scanData.directCommission.rule.piraRate,

          sourceLevel:
            scanData.agent.level,

          receiverLevel:
            scanData.agent.level,

          remarks:
            "Direct Commission",
        },
      });

      // add direct commission to score
      creditUpdates.set(
        scanData.agent.id,
        scanData.directCommission.amount
      );



      console.log(
        JSON.stringify(
          scanData.overrideCommissions,
          null,
          2
        )
      );

      for (const override of scanData.overrideCommissions) {

        await tx.commissionTransaction.create({
          data: {
            sourceAgentId:
              scanData.agent.id,

            receiverAgentId:
              override.agent.id,

            commissionRuleId:
              null,

            overrideCommissionRuleId:
              override.ruleId,

            commissionScanId:
              commissionScan.id,

            commissionType:
              "DOWNLINE",

            saleAmount: Number(
              scanData.client.loanAmount ?? 0
            ),

            commissionAmount:
              override.amount,

            sourceLevel:
              scanData.agent.level,

            receiverLevel:
              override.agent.level,

            remarks:
              override.blocked
                ? `BLOCKED: ${override.reason}`
                : "Override Commission",
          },
        });

        // blocked commissions don't earn score
        if (override.blocked) {
          continue;
        }

        const currentScore =
          creditUpdates.get(
            override.agent.id
          ) ?? 0;

        creditUpdates.set(
          override.agent.id,
          currentScore +
            override.amount
        );
      }


      for (const [
        receiverAgentId,
        score,
      ] of creditUpdates.entries()) {

        await tx.agent.update({
          where: {
            id: receiverAgentId,
          },
          data: {
            creditScore: {
              increment:
                Math.floor(score),
            },
          },
        });
      }


      const activeCycle =
        await tx.agentMaintenanceCycle.findFirst({
          where: {
            agentId: scanData.agent.id,
            status: "ACTIVE",
          },
        });

      if (!activeCycle) {
        throw new Error(
          "No active maintenance cycle found"
        );
      }

      const newRequiredSales =
        Math.max(
          activeCycle.requiredSales - 1,
          0
        );

      await tx.agentMaintenanceCycle.update({
        where: {
          id: activeCycle.id,
        },
        data: {
          requiredSales:
            newRequiredSales,

          completedSales:
            activeCycle.completedSales + 1,

          remainingSales:
            newRequiredSales,
        },
      });


      await tx.dailyClientDetails.update({
        where: {
          id: clientId,
        },
        data: {
          clientStatus:
            "SCANNED",
        },
      });



      return commissionScan;
    }
  );
};

// export const updateOverrideRuleService = async (
//   data:UpdateOverrideRules
// ) => {
//   const rule = 
//   await prisma.overrideCommissionRule.update({
//     where:{
//       id:data.id,
//     },
//     data:{
//         receiverLevel: data.receiverLevel,
//         sourceLevel: data.sourceLevel,

//     }
//   })
// }

export const updateCommissionRuleService = async (
  data: UpdateCommissionRules
) => {
  const rule =
    await prisma.commissionRule.update({
      where: {
        id: data.id,
      },

      data: {
        ...(data.sspAmount !== undefined && {
          sspAmount: data.sspAmount,
        }),

        ...(data.piraRate !== undefined && {
          piraRate: data.piraRate,
        }),
      },
    });

  return rule;
};