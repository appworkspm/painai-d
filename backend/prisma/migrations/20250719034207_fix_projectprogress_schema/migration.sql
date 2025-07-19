/*
  Warnings:

  - You are about to drop the `project_team_members` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "project_team_members" DROP CONSTRAINT "project_team_members_projectId_fkey";

-- DropForeignKey
ALTER TABLE "project_team_members" DROP CONSTRAINT "project_team_members_userId_fkey";

-- AlterTable
ALTER TABLE "project_timelines" ADD COLUMN     "dueDate" TIMESTAMP(3);

-- DropTable
DROP TABLE "project_team_members";

-- CreateTable
CREATE TABLE "ProjectTeamMember" (
    "id" UUID NOT NULL,
    "projectId" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'MEMBER',
    "position" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "ProjectTeamMember_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "project_progresses" (
    "id" UUID NOT NULL,
    "projectId" UUID NOT NULL,
    "progress" INTEGER NOT NULL DEFAULT 0,
    "planned" INTEGER,
    "actual" INTEGER,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" TEXT NOT NULL DEFAULT 'ON_TRACK',
    "milestone" TEXT,
    "description" TEXT,
    "reportedBy" UUID NOT NULL,
    "reportedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "project_progresses_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ProjectTeamMember_projectId_userId_key" ON "ProjectTeamMember"("projectId", "userId");

-- AddForeignKey
ALTER TABLE "ProjectTeamMember" ADD CONSTRAINT "ProjectTeamMember_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectTeamMember" ADD CONSTRAINT "ProjectTeamMember_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "project_progresses" ADD CONSTRAINT "project_progresses_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "project_progresses" ADD CONSTRAINT "project_progresses_reportedBy_fkey" FOREIGN KEY ("reportedBy") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
