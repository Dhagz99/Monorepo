/*
  Warnings:

  - You are about to drop the column `companyCycle` on the `companydetails` table. All the data in the column will be lost.
  - You are about to drop the column `isDisburse` on the `companydetails` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "companydetails" DROP COLUMN "companyCycle",
DROP COLUMN "isDisburse";
