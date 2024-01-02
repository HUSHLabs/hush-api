/*
  Warnings:

  - You are about to drop the column `publicInputs` on the `Proof` table. All the data in the column will be lost.
  - Added the required column `publicInput` to the `Proof` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Proof" DROP COLUMN "publicInputs",
ADD COLUMN     "publicInput" TEXT NOT NULL;
