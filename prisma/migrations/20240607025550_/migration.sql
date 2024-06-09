/*
  Warnings:

  - You are about to drop the column `location` on the `Membership` table. All the data in the column will be lost.
  - Added the required column `locationDistance` to the `Membership` table without a default value. This is not possible if the table is not empty.
  - Added the required column `address` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Membership" DROP COLUMN "location",
ADD COLUMN     "locationDistance" DOUBLE PRECISION NOT NULL;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "address" TEXT NOT NULL;
