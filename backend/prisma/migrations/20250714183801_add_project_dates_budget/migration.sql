-- AlterTable
ALTER TABLE "projects" ADD COLUMN     "budget" DECIMAL(15,2),
ADD COLUMN     "endDate" TIMESTAMP(3),
ADD COLUMN     "startDate" TIMESTAMP(3);
