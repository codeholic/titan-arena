-- CreateTable
CREATE TABLE "Job" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "signature" TEXT NOT NULL,
    "handler" TEXT NOT NULL,
    "payload" TEXT NOT NULL,
    "signer" TEXT NOT NULL,
    "timestamp" DATETIME NOT NULL,
    "isProcessed" BOOLEAN NOT NULL DEFAULT false
);

-- CreateIndex
CREATE UNIQUE INDEX "Job_signature_key" ON "Job"("signature");

-- CreateIndex
CREATE INDEX "Job_isProcessed_idx" ON "Job"("isProcessed");
