/*
  Warnings:

  - You are about to drop the column `time_of_incident` on the `Membership` table. All the data in the column will be lost.
  - Added the required column `timeOfIncident` to the `Membership` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Membership" DROP COLUMN "time_of_incident",
ADD COLUMN     "timeOfIncident" TIMESTAMP(3) NOT NULL;
