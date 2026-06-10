-- AlterTable
ALTER TABLE "agent_maintenance_cycles" ADD COLUMN     "oneDayWarningSent" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "sevenDayWarningSent" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "threeDayWarningSent" BOOLEAN NOT NULL DEFAULT false;
