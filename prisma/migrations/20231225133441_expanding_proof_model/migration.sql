/*
  Warnings:

  - Added the required column `circuitPubInputMerkleRoot` to the `Proof` table without a default value. This is not possible if the table is not empty.
  - Added the required column `circuitPubInputTx` to the `Proof` table without a default value. This is not possible if the table is not empty.
  - Added the required column `circuitPubInputTy` to the `Proof` table without a default value. This is not possible if the table is not empty.
  - Added the required column `circuitPubInputUx` to the `Proof` table without a default value. This is not possible if the table is not empty.
  - Added the required column `circuitPubInputUy` to the `Proof` table without a default value. This is not possible if the table is not empty.
  - Added the required column `msgHash` to the `Proof` table without a default value. This is not possible if the table is not empty.
  - Added the required column `proof` to the `Proof` table without a default value. This is not possible if the table is not empty.
  - Added the required column `r` to the `Proof` table without a default value. This is not possible if the table is not empty.
  - Added the required column `rV` to the `Proof` table without a default value. This is not possible if the table is not empty.
  - Added the required column `statement` to the `Proof` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Account" ADD COLUMN     "proofId" TEXT;

-- AlterTable
ALTER TABLE "Proof" ADD COLUMN     "circuitPubInputMerkleRoot" TEXT NOT NULL,
ADD COLUMN     "circuitPubInputTx" TEXT NOT NULL,
ADD COLUMN     "circuitPubInputTy" TEXT NOT NULL,
ADD COLUMN     "circuitPubInputUx" TEXT NOT NULL,
ADD COLUMN     "circuitPubInputUy" TEXT NOT NULL,
ADD COLUMN     "msgHash" TEXT NOT NULL,
ADD COLUMN     "proof" TEXT NOT NULL,
ADD COLUMN     "r" TEXT NOT NULL,
ADD COLUMN     "rV" TEXT NOT NULL,
ADD COLUMN     "statement" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "Account" ADD CONSTRAINT "Account_proofId_fkey" FOREIGN KEY ("proofId") REFERENCES "Proof"("id") ON DELETE SET NULL ON UPDATE CASCADE;
