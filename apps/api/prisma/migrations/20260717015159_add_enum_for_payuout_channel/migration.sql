/*
  Warnings:

  - The `payoutChannel` column on the `CreditWithdrawalRequest` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "PayoutChannel" AS ENUM ('GCASH', 'CHECK');

-- AlterTable
ALTER TABLE "CreditWithdrawalRequest" DROP COLUMN "payoutChannel",
ADD COLUMN     "payoutChannel" "PayoutChannel" NOT NULL DEFAULT 'CHECK';
