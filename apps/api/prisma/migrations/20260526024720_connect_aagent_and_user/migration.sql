/*
  Warnings:

  - A unique constraint covering the columns `[agentId]` on the table `user` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "user" ADD COLUMN     "agentId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "user_agentId_key" ON "user"("agentId");

-- AddForeignKey
ALTER TABLE "user" ADD CONSTRAINT "user_agentId_fkey" FOREIGN KEY ("agentId") REFERENCES "agents"("id") ON DELETE SET NULL ON UPDATE CASCADE;
