/*
  Warnings:

  - You are about to drop the column `profile_picture` on the `agents` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "agents" DROP COLUMN "profile_picture",
ADD COLUMN     "profilePicture" TEXT;
