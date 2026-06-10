/*
  Warnings:

  - A unique constraint covering the columns `[clientId]` on the table `commission_scans` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "commission_scans_clientId_key" ON "commission_scans"("clientId");
