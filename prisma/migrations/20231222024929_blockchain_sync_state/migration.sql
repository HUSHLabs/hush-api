-- CreateTable
CREATE TABLE "BlockchainSyncState" (
    "entity" TEXT NOT NULL,
    "earliestBlockHash" TEXT NOT NULL,
    "contractAddress" TEXT NOT NULL,
    "lastSeenBlockNumber" INTEGER NOT NULL,

    CONSTRAINT "BlockchainSyncState_pkey" PRIMARY KEY ("entity")
);
