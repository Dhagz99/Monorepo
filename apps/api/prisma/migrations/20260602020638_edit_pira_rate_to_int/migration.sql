/*
  Warnings:

  - You are about to alter the column `piraRate` on the `commission_rules` table. The data in that column could be lost. The data in that column will be cast from `Decimal(5,2)` to `Integer`.

*/
-- AlterTable
ALTER TABLE "commission_rules" ALTER COLUMN "piraRate" SET DATA TYPE INTEGER;
