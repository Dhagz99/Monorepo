/*
  Warnings:

  - The values [WITHDRAWAL_REQUEST] on the enum `NotificationEntityType` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "ActionResult" ADD VALUE 'PAYMENT_PENDING';
ALTER TYPE "ActionResult" ADD VALUE 'WITHDRAWAL_NOT_CONFIRM';

-- AlterEnum
BEGIN;
CREATE TYPE "NotificationEntityType_new" AS ENUM ('REACTIVATION_REQUEST', 'PROCEED_PAYMENT', 'CONFIRMED_PAYMENT', 'CONFIRMED_WITHDRAWAL', 'AGENT_REASSIGNMENT');
ALTER TABLE "agent_notifications" ALTER COLUMN "entityType" TYPE "NotificationEntityType_new" USING ("entityType"::text::"NotificationEntityType_new");
ALTER TYPE "NotificationEntityType" RENAME TO "NotificationEntityType_old";
ALTER TYPE "NotificationEntityType_new" RENAME TO "NotificationEntityType";
DROP TYPE "public"."NotificationEntityType_old";
COMMIT;
