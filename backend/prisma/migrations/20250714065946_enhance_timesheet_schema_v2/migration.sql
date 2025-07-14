/*
  Warnings:

  - The primary key for the `projects` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `id` column on the `projects` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The primary key for the `timesheets` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `activityType` on the `timesheets` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `timesheets` table. All the data in the column will be lost.
  - You are about to drop the column `duration` on the `timesheets` table. All the data in the column will be lost.
  - You are about to drop the column `endTime` on the `timesheets` table. All the data in the column will be lost.
  - You are about to drop the column `isActive` on the `timesheets` table. All the data in the column will be lost.
  - You are about to drop the column `projectId` on the `timesheets` table. All the data in the column will be lost.
  - You are about to drop the column `startTime` on the `timesheets` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `timesheets` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `timesheets` table. All the data in the column will be lost.
  - The `id` column on the `timesheets` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The primary key for the `users` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `id` column on the `users` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - A unique constraint covering the columns `[user_id,project_id,date,work_type,sub_work_type]` on the table `timesheets` will be added. If there are existing duplicate values, this will fail.
  - Changed the type of `managerId` on the `projects` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Added the required column `date` to the `timesheets` table without a default value. This is not possible if the table is not empty.
  - Added the required column `hours_worked` to the `timesheets` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "projects" DROP CONSTRAINT "projects_managerId_fkey";

-- DropForeignKey
ALTER TABLE "timesheets" DROP CONSTRAINT "timesheets_projectId_fkey";

-- DropForeignKey
ALTER TABLE "timesheets" DROP CONSTRAINT "timesheets_userId_fkey";

-- AlterTable
ALTER TABLE "projects" DROP CONSTRAINT "projects_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
DROP COLUMN "managerId",
ADD COLUMN     "managerId" UUID NOT NULL,
ADD CONSTRAINT "projects_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "timesheets" DROP CONSTRAINT "timesheets_pkey",
DROP COLUMN "activityType",
DROP COLUMN "createdAt",
DROP COLUMN "duration",
DROP COLUMN "endTime",
DROP COLUMN "isActive",
DROP COLUMN "projectId",
DROP COLUMN "startTime",
DROP COLUMN "updatedAt",
DROP COLUMN "userId",
ADD COLUMN     "activity" VARCHAR(100),
ADD COLUMN     "approved_at" TIMESTAMP(6),
ADD COLUMN     "approved_by" UUID,
ADD COLUMN     "billable" BOOLEAN DEFAULT true,
ADD COLUMN     "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "date" DATE NOT NULL,
ADD COLUMN     "hourly_rate" DECIMAL(10,2),
ADD COLUMN     "hours_worked" DECIMAL(4,2) NOT NULL,
ADD COLUMN     "overtime_hours" DECIMAL(4,2) DEFAULT 0,
ADD COLUMN     "project_id" UUID,
ADD COLUMN     "rejection_reason" TEXT,
ADD COLUMN     "status" VARCHAR(20) DEFAULT 'draft',
ADD COLUMN     "sub_work_type" VARCHAR(20) DEFAULT 'SOFTWARE',
ADD COLUMN     "submitted_at" TIMESTAMP(6),
ADD COLUMN     "updated_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "user_id" UUID,
ADD COLUMN     "work_type" VARCHAR(20) DEFAULT 'PROJECT',
DROP COLUMN "id",
ADD COLUMN     "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
ADD CONSTRAINT "timesheets_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "users" DROP CONSTRAINT "users_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
ADD CONSTRAINT "users_pkey" PRIMARY KEY ("id");

-- CreateIndex
CREATE INDEX "idx_timesheets_date_range" ON "timesheets"("date");

-- CreateIndex
CREATE INDEX "idx_timesheets_project" ON "timesheets"("project_id");

-- CreateIndex
CREATE INDEX "idx_timesheets_status" ON "timesheets"("status");

-- CreateIndex
CREATE INDEX "idx_timesheets_user_date" ON "timesheets"("user_id", "date");

-- CreateIndex
CREATE UNIQUE INDEX "timesheets_user_id_project_id_date_work_type_sub_work_type_key" ON "timesheets"("user_id", "project_id", "date", "work_type", "sub_work_type");

-- AddForeignKey
ALTER TABLE "projects" ADD CONSTRAINT "projects_managerId_fkey" FOREIGN KEY ("managerId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "timesheets" ADD CONSTRAINT "timesheets_approved_by_fkey" FOREIGN KEY ("approved_by") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "timesheets" ADD CONSTRAINT "timesheets_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "timesheets" ADD CONSTRAINT "timesheets_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION;
