/*
  Warnings:

  - You are about to drop the `accounts` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "accounts";

-- CreateTable
CREATE TABLE "Account" (
    "address" TEXT NOT NULL,
    "balance" DECIMAL(65,30) NOT NULL,
    "blockNumber" INTEGER NOT NULL,
    "contractAddress" TEXT NOT NULL,

    CONSTRAINT "Account_pkey" PRIMARY KEY ("address")
);
