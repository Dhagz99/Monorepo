-- CreateTable
CREATE TABLE "OverridCommissionRule" (
    "id" TEXT NOT NULL,
    "receiverLevel" "AgentLevel" NOT NULL,
    "sourceLevel" "AgentLevel" NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OverridCommissionRule_pkey" PRIMARY KEY ("id")
);
