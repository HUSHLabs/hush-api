/*
  Warnings:

  - You are about to drop the column `circuitPubInputMerkleRoot` on the `Proof` table. All the data in the column will be lost.
  - You are about to drop the column `circuitPubInputTx` on the `Proof` table. All the data in the column will be lost.
  - You are about to drop the column `circuitPubInputTy` on the `Proof` table. All the data in the column will be lost.
  - You are about to drop the column `circuitPubInputUx` on the `Proof` table. All the data in the column will be lost.
  - You are about to drop the column `circuitPubInputUy` on the `Proof` table. All the data in the column will be lost.
  - Added the required column `circuitPubInput` to the `Proof` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Proof" DROP COLUMN "circuitPubInputMerkleRoot",
DROP COLUMN "circuitPubInputTx",
DROP COLUMN "circuitPubInputTy",
DROP COLUMN "circuitPubInputUx",
DROP COLUMN "circuitPubInputUy",
ADD COLUMN     "circuitPubInput" JSONB NOT NULL;
