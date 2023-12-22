-- CreateTable
CREATE TABLE "accounts" (
    "address" TEXT NOT NULL,
    "balance" DECIMAL(65,30) NOT NULL,
    "blockNumber" INTEGER NOT NULL,
    "contractAddress" TEXT NOT NULL,

    CONSTRAINT "accounts_pkey" PRIMARY KEY ("address")
);
