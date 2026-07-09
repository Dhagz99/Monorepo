-- AddForeignKey
ALTER TABLE "CreditWithdrawalRequest" ADD CONSTRAINT "CreditWithdrawalRequest_agentId_fkey" FOREIGN KEY ("agentId") REFERENCES "agents"("id") ON DELETE CASCADE ON UPDATE CASCADE;
