-- CreateTable
CREATE TABLE "project_costs" (
    "id" UUID NOT NULL,
    "projectId" UUID NOT NULL,
    "amount" DECIMAL(15,2) NOT NULL,
    "description" TEXT,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "project_costs_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "project_costs" ADD CONSTRAINT "project_costs_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;
