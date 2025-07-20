-- AlterTable
ALTER TABLE "project_costs" ADD COLUMN     "costRequestId" UUID;

-- CreateTable
CREATE TABLE "cost_requests" (
    "id" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "amount" DECIMAL(15,2) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'THB',
    "category" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "requestedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "approvedAt" TIMESTAMP(3),
    "rejectedAt" TIMESTAMP(3),
    "rejectionReason" TEXT,
    "projectId" UUID NOT NULL,
    "requesterId" UUID NOT NULL,
    "approverId" UUID,

    CONSTRAINT "cost_requests_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "project_costs" ADD CONSTRAINT "project_costs_costRequestId_fkey" FOREIGN KEY ("costRequestId") REFERENCES "cost_requests"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cost_requests" ADD CONSTRAINT "cost_requests_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cost_requests" ADD CONSTRAINT "cost_requests_requesterId_fkey" FOREIGN KEY ("requesterId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cost_requests" ADD CONSTRAINT "cost_requests_approverId_fkey" FOREIGN KEY ("approverId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
