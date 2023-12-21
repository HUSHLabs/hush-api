-- CreateTable
CREATE TABLE "Verifications" (
    "id" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "contractAddress" TEXT NOT NULL,
    "threshold" INTEGER NOT NULL,
    "statement" TEXT NOT NULL,

    CONSTRAINT "Verifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Clients" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "logoUrl" TEXT NOT NULL,
    "clientSecret" TEXT NOT NULL,
    "redirectUrls" TEXT[],

    CONSTRAINT "Clients_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Proof" (
    "id" TEXT NOT NULL,
    "proofId" TEXT NOT NULL,
    "verificationId" TEXT NOT NULL,
    "proofUrl" TEXT NOT NULL,
    "proofHash" TEXT NOT NULL,
    "blockNumber" INTEGER NOT NULL,

    CONSTRAINT "Proof_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Verifications" ADD CONSTRAINT "Verifications_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Clients"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Proof" ADD CONSTRAINT "Proof_verificationId_fkey" FOREIGN KEY ("verificationId") REFERENCES "Verifications"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
