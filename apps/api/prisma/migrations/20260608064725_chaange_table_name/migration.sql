/*
  Warnings:

  - You are about to drop the `OverridCommissionRule` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "OverridCommissionRule";

-- CreateTable
CREATE TABLE "OverrideCommissionRule" (
    "id" TEXT NOT NULL,
    "receiverLevel" "AgentLevel" NOT NULL,
    "sourceLevel" "AgentLevel" NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OverrideCommissionRule_pkey" PRIMARY KEY ("id")
);
