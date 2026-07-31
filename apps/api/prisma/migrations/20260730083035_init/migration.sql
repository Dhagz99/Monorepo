-- CreateEnum
CREATE TYPE "ApprovalStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'SKIPPED');

-- CreateEnum
CREATE TYPE "ApprovalAction" AS ENUM ('APPROVED', 'REJECTED', 'RETURNED', 'CANCELLED');

-- CreateTable
CREATE TABLE "users" (
    "user_id" SERIAL NOT NULL,
    "name" VARCHAR(150) NOT NULL,
    "username" VARCHAR(100) NOT NULL,
    "email" VARCHAR(191),
    "password" VARCHAR(255) NOT NULL,
    "abrev" VARCHAR(20),
    "mobile_number" VARCHAR(20),
    "signature_path" VARCHAR(500),
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "is_branch_acct" BOOLEAN NOT NULL DEFAULT false,
    "position_id" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("user_id")
);

-- CreateTable
CREATE TABLE "roles" (
    "role_id" SERIAL NOT NULL,
    "role_name" VARCHAR(100) NOT NULL,
    "description" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "roles_pkey" PRIMARY KEY ("role_id")
);

-- CreateTable
CREATE TABLE "user_roles" (
    "user_id" INTEGER NOT NULL,
    "role_id" INTEGER NOT NULL,
    "assigned_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_roles_pkey" PRIMARY KEY ("user_id","role_id")
);

-- CreateTable
CREATE TABLE "permissions" (
    "permission_id" SERIAL NOT NULL,
    "code" TEXT NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "module" VARCHAR(50) NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "permissions_pkey" PRIMARY KEY ("permission_id")
);

-- CreateTable
CREATE TABLE "role_permissions" (
    "roleId" INTEGER NOT NULL,
    "permissionId" INTEGER NOT NULL,

    CONSTRAINT "role_permissions_pkey" PRIMARY KEY ("roleId","permissionId")
);

-- CreateTable
CREATE TABLE "company_positions" (
    "position_id" SERIAL NOT NULL,
    "position_name" VARCHAR(150) NOT NULL,
    "description" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "company_positions_pkey" PRIMARY KEY ("position_id")
);

-- CreateTable
CREATE TABLE "ApprovalFlow" (
    "approval_flow_id" SERIAL NOT NULL,
    "name" VARCHAR(150) NOT NULL,
    "description" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ApprovalFlow_pkey" PRIMARY KEY ("approval_flow_id")
);

-- CreateTable
CREATE TABLE "ApprovalFlowStep" (
    "approval_flow_step_id" SERIAL NOT NULL,
    "flowId" INTEGER NOT NULL,
    "stepNumber" INTEGER NOT NULL,
    "positionId" INTEGER NOT NULL,
    "required" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "ApprovalFlowStep_pkey" PRIMARY KEY ("approval_flow_step_id")
);

-- CreateTable
CREATE TABLE "ApprovalCondition" (
    "approval_condition_id" SERIAL NOT NULL,
    "stepId" INTEGER NOT NULL,
    "minimumAmount" DECIMAL(12,2),
    "maximumAmount" DECIMAL(12,2),
    "branchId" INTEGER,
    "departmentId" INTEGER,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "ApprovalCondition_pkey" PRIMARY KEY ("approval_condition_id")
);

-- CreateTable
CREATE TABLE "ApprovalProcess" (
    "approval_process_id" SERIAL NOT NULL,
    "businessObjectId" INTEGER NOT NULL,
    "flowId" INTEGER NOT NULL,
    "status" "ApprovalStatus" NOT NULL DEFAULT 'PENDING',
    "currentStep" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "ApprovalProcess_pkey" PRIMARY KEY ("approval_process_id")
);

-- CreateTable
CREATE TABLE "ApprovalProcessStep" (
    "approval_process_step_id" SERIAL NOT NULL,
    "processId" INTEGER NOT NULL,
    "flowStepId" INTEGER NOT NULL,
    "assignedUserId" INTEGER,
    "status" "ApprovalStatus" NOT NULL DEFAULT 'PENDING',
    "approvedAt" TIMESTAMP(3),
    "remarks" TEXT,

    CONSTRAINT "ApprovalProcessStep_pkey" PRIMARY KEY ("approval_process_step_id")
);

-- CreateTable
CREATE TABLE "ApprovalHistory" (
    "approval_history_id" SERIAL NOT NULL,
    "processStepId" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,
    "action" "ApprovalAction" NOT NULL,
    "remarks" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ApprovalHistory_pkey" PRIMARY KEY ("approval_history_id")
);

-- CreateTable
CREATE TABLE "BusinessObject" (
    "business_object_id" SERIAL NOT NULL,
    "documentNumber" TEXT NOT NULL,
    "documentModule" VARCHAR(50) NOT NULL,
    "created_by_user_id" INTEGER NOT NULL,
    "branchId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BusinessObject_pkey" PRIMARY KEY ("business_object_id")
);

-- CreateTable
CREATE TABLE "checklists" (
    "checklist_id" SERIAL NOT NULL,
    "businessObjectId" INTEGER NOT NULL,
    "technical_visit_date" DATE,
    "registration_number" VARCHAR(20) NOT NULL,
    "previous_odometer" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "current_odometer" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "trip_ticket_odometer" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "personal_use_odometer" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "calculated_use_odometer" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "remarks" TEXT,
    "action_taken" TEXT,
    "is_roadworthy" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "checklists_pkey" PRIMARY KEY ("checklist_id")
);

-- CreateTable
CREATE TABLE "ChecklistInspection" (
    "checklist_inspection_id" SERIAL NOT NULL,
    "checklistId" INTEGER NOT NULL,
    "itemId" INTEGER NOT NULL,
    "previousStatus" VARCHAR(100),
    "currentStatus" VARCHAR(100),
    "remarks" TEXT,

    CONSTRAINT "ChecklistInspection_pkey" PRIMARY KEY ("checklist_inspection_id")
);

-- CreateTable
CREATE TABLE "ChecklistItem" (
    "checklist_item_id" SERIAL NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "description" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "ChecklistItem_pkey" PRIMARY KEY ("checklist_item_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_username_key" ON "users"("username");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "users_position_id_idx" ON "users"("position_id");

-- CreateIndex
CREATE UNIQUE INDEX "roles_role_name_key" ON "roles"("role_name");

-- CreateIndex
CREATE INDEX "user_roles_role_id_idx" ON "user_roles"("role_id");

-- CreateIndex
CREATE UNIQUE INDEX "permissions_code_key" ON "permissions"("code");

-- CreateIndex
CREATE UNIQUE INDEX "permissions_name_key" ON "permissions"("name");

-- CreateIndex
CREATE UNIQUE INDEX "company_positions_position_name_key" ON "company_positions"("position_name");

-- CreateIndex
CREATE UNIQUE INDEX "ApprovalFlow_name_key" ON "ApprovalFlow"("name");

-- CreateIndex
CREATE UNIQUE INDEX "ApprovalFlowStep_flowId_stepNumber_key" ON "ApprovalFlowStep"("flowId", "stepNumber");

-- CreateIndex
CREATE UNIQUE INDEX "ApprovalProcess_businessObjectId_key" ON "ApprovalProcess"("businessObjectId");

-- CreateIndex
CREATE UNIQUE INDEX "BusinessObject_documentNumber_key" ON "BusinessObject"("documentNumber");

-- CreateIndex
CREATE UNIQUE INDEX "checklists_businessObjectId_key" ON "checklists"("businessObjectId");

-- CreateIndex
CREATE UNIQUE INDEX "ChecklistInspection_checklistId_itemId_key" ON "ChecklistInspection"("checklistId", "itemId");

-- CreateIndex
CREATE UNIQUE INDEX "ChecklistItem_name_key" ON "ChecklistItem"("name");

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_position_id_fkey" FOREIGN KEY ("position_id") REFERENCES "company_positions"("position_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_roles" ADD CONSTRAINT "user_roles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_roles" ADD CONSTRAINT "user_roles_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "roles"("role_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "role_permissions" ADD CONSTRAINT "role_permissions_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "roles"("role_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "role_permissions" ADD CONSTRAINT "role_permissions_permissionId_fkey" FOREIGN KEY ("permissionId") REFERENCES "permissions"("permission_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ApprovalFlowStep" ADD CONSTRAINT "ApprovalFlowStep_flowId_fkey" FOREIGN KEY ("flowId") REFERENCES "ApprovalFlow"("approval_flow_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ApprovalFlowStep" ADD CONSTRAINT "ApprovalFlowStep_positionId_fkey" FOREIGN KEY ("positionId") REFERENCES "company_positions"("position_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ApprovalCondition" ADD CONSTRAINT "ApprovalCondition_stepId_fkey" FOREIGN KEY ("stepId") REFERENCES "ApprovalFlowStep"("approval_flow_step_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ApprovalProcess" ADD CONSTRAINT "ApprovalProcess_businessObjectId_fkey" FOREIGN KEY ("businessObjectId") REFERENCES "BusinessObject"("business_object_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ApprovalProcess" ADD CONSTRAINT "ApprovalProcess_flowId_fkey" FOREIGN KEY ("flowId") REFERENCES "ApprovalFlow"("approval_flow_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ApprovalProcessStep" ADD CONSTRAINT "ApprovalProcessStep_processId_fkey" FOREIGN KEY ("processId") REFERENCES "ApprovalProcess"("approval_process_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ApprovalProcessStep" ADD CONSTRAINT "ApprovalProcessStep_flowStepId_fkey" FOREIGN KEY ("flowStepId") REFERENCES "ApprovalFlowStep"("approval_flow_step_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ApprovalProcessStep" ADD CONSTRAINT "ApprovalProcessStep_assignedUserId_fkey" FOREIGN KEY ("assignedUserId") REFERENCES "users"("user_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ApprovalHistory" ADD CONSTRAINT "ApprovalHistory_processStepId_fkey" FOREIGN KEY ("processStepId") REFERENCES "ApprovalProcessStep"("approval_process_step_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ApprovalHistory" ADD CONSTRAINT "ApprovalHistory_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BusinessObject" ADD CONSTRAINT "BusinessObject_created_by_user_id_fkey" FOREIGN KEY ("created_by_user_id") REFERENCES "users"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "checklists" ADD CONSTRAINT "checklists_businessObjectId_fkey" FOREIGN KEY ("businessObjectId") REFERENCES "BusinessObject"("business_object_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChecklistInspection" ADD CONSTRAINT "ChecklistInspection_checklistId_fkey" FOREIGN KEY ("checklistId") REFERENCES "checklists"("checklist_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChecklistInspection" ADD CONSTRAINT "ChecklistInspection_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "ChecklistItem"("checklist_item_id") ON DELETE RESTRICT ON UPDATE CASCADE;
