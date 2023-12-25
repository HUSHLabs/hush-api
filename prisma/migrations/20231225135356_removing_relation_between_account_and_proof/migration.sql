/*
  Warnings:

  - You are about to drop the column `proofId` on the `Account` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Account" DROP CONSTRAINT "Account_proofId_fkey";

-- AlterTable
ALTER TABLE "Account" DROP COLUMN "proofId";

-- AlterTable
ALTER TABLE "Proof" ADD COLUMN     "addresses" TEXT[];
