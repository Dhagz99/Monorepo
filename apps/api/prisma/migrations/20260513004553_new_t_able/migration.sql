-- CreateEnum
CREATE TYPE "ClientStatus" AS ENUM ('New', 'Pending', 'Approved');

-- CreateTable
CREATE TABLE "DailyClientDetails" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "clientName" TEXT NOT NULL,
    "loanAmount" DECIMAL(10,2),
    "clientStatus" "ClientStatus" NOT NULL,

    CONSTRAINT "DailyClientDetails_pkey" PRIMARY KEY ("id")
);
