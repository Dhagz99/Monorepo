/*
  Warnings:

  - You are about to drop the column `actionType` on the `agent_notifications` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "ActionResult" AS ENUM ('PAYMENT_COMPLETED', 'WITHDRAWAL_COMPLETED');

-- AlterTable
ALTER TABLE "agent_notifications" DROP COLUMN "actionType",
ADD COLUMN     "actionResult" "ActionResult";

-- DropEnum
DROP TYPE "ActionType";
