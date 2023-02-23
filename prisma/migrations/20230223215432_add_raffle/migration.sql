-- CreateTable
CREATE TABLE "Raffle" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "displayName" TEXT NOT NULL,
    "endsAt" DATETIME,
    "imageUrl" TEXT NOT NULL,
    "linkUrl" TEXT NOT NULL,
    "ticketPrice" BIGINT NOT NULL
);

-- CreateTable
CREATE TABLE "Batch" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "buyer" TEXT NOT NULL,
    "raffleId" INTEGER NOT NULL,
    "ticketCount" INTEGER NOT NULL,
    CONSTRAINT "Batch_raffleId_fkey" FOREIGN KEY ("raffleId") REFERENCES "Raffle" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Batch_raffleId_buyer_key" ON "Batch"("raffleId", "buyer");
