/*
  Warnings:

  - Added the required column `status` to the `Membership` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "Status" AS ENUM ('PENDING', 'PROCESS', 'FINISHED');

-- AlterTable
ALTER TABLE "Membership" ADD COLUMN     "status" "Status" NOT NULL;
