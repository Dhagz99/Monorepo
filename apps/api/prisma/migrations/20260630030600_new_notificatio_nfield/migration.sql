-- CreateEnum
CREATE TYPE "ActionType" AS ENUM ('PAYMENT_COMPLETED', 'WITHDRAWAL_COMPLETED');

-- AlterTable
ALTER TABLE "agent_notifications" ADD COLUMN     "actionType" "ActionType";
