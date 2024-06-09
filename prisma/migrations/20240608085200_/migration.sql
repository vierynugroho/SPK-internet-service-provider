/*
  Warnings:

  - You are about to drop the `ImportantCase` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "ImportantCase" DROP CONSTRAINT "ImportantCase_membershipId_fkey";

-- DropForeignKey
ALTER TABLE "ImportantCase" DROP CONSTRAINT "ImportantCase_userId_fkey";

-- DropTable
DROP TABLE "ImportantCase";

-- CreateTable
CREATE TABLE "Ahp" (
    "id" TEXT NOT NULL,
    "membershipId" TEXT NOT NULL,
    "ci" DOUBLE PRECISION NOT NULL,
    "cr" DOUBLE PRECISION NOT NULL,
    "rankScore" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "Ahp_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Ahp_membershipId_key" ON "Ahp"("membershipId");

-- AddForeignKey
ALTER TABLE "Ahp" ADD CONSTRAINT "Ahp_membershipId_fkey" FOREIGN KEY ("membershipId") REFERENCES "Membership"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
