/*
  Warnings:

  - You are about to drop the column `entityType` on the `agent_notifications` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "NotificationActionType" AS ENUM ('PROCEED_PAYMENT', 'CONFIRMED_PAYMENT', 'CONFIRMED_WITHDRAWAL', 'AGENT_REASSIGNMENT');

-- AlterTable
ALTER TABLE "agent_notifications" DROP COLUMN "entityType",
ADD COLUMN     "actionType" "NotificationActionType";

-- DropEnum
DROP TYPE "NotificationEntityType";
