-- CreateEnum
CREATE TYPE "NotificationEntityType" AS ENUM ('REACTIVATION_REQUEST', 'PROCEED_PAYMENT', 'WITHDRAWAL_REQUEST', 'AGENT_REASSIGNMENT');

-- AlterTable
ALTER TABLE "agent_notifications" ADD COLUMN     "entityId" TEXT,
ADD COLUMN     "entityType" "NotificationEntityType";
