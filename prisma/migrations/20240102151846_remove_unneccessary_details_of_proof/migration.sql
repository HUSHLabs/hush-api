/*
  Warnings:

  - You are about to drop the column `circuitPubInput` on the `Proof` table. All the data in the column will be lost.
  - You are about to drop the column `msgHash` on the `Proof` table. All the data in the column will be lost.
  - You are about to drop the column `r` on the `Proof` table. All the data in the column will be lost.
  - You are about to drop the column `rV` on the `Proof` table. All the data in the column will be lost.
  - Added the required column `publicInputs` to the `Proof` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Proof" DROP COLUMN "circuitPubInput",
DROP COLUMN "msgHash",
DROP COLUMN "r",
DROP COLUMN "rV",
ADD COLUMN     "publicInputs" TEXT NOT NULL;
