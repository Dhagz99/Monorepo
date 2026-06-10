-- DropForeignKey
ALTER TABLE "agent_branches" DROP CONSTRAINT "agent_branches_agentId_fkey";

-- DropForeignKey
ALTER TABLE "commission_transactions" DROP CONSTRAINT "commission_transactions_receiverAgentId_fkey";

-- DropForeignKey
ALTER TABLE "commission_transactions" DROP CONSTRAINT "commission_transactions_sourceAgentId_fkey";

-- AddForeignKey
ALTER TABLE "agent_branches" ADD CONSTRAINT "agent_branches_agentId_fkey" FOREIGN KEY ("agentId") REFERENCES "agents"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "commission_transactions" ADD CONSTRAINT "commission_transactions_sourceAgentId_fkey" FOREIGN KEY ("sourceAgentId") REFERENCES "agents"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "commission_transactions" ADD CONSTRAINT "commission_transactions_receiverAgentId_fkey" FOREIGN KEY ("receiverAgentId") REFERENCES "agents"("id") ON DELETE CASCADE ON UPDATE CASCADE;
