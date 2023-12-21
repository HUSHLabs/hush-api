/*
  Warnings:

  - You are about to drop the `Clients` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Verifications` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Proof" DROP CONSTRAINT "Proof_verificationId_fkey";

-- DropForeignKey
ALTER TABLE "Verifications" DROP CONSTRAINT "Verifications_clientId_fkey";

-- DropTable
DROP TABLE "Clients";

-- DropTable
DROP TABLE "Verifications";

-- CreateTable
CREATE TABLE "Verification" (
    "id" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "contractAddress" TEXT NOT NULL,
    "threshold" INTEGER NOT NULL,
    "statement" TEXT NOT NULL,

    CONSTRAINT "Verification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Client" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "logoUrl" TEXT NOT NULL,
    "clientSecret" TEXT NOT NULL,
    "redirectUrls" TEXT[],

    CONSTRAINT "Client_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Verification" ADD CONSTRAINT "Verification_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Proof" ADD CONSTRAINT "Proof_verificationId_fkey" FOREIGN KEY ("verificationId") REFERENCES "Verification"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
