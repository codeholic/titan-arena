-- CreateTable
CREATE TABLE "Clan" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "multiplier" REAL NOT NULL DEFAULT 1.0,
    "name" TEXT NOT NULL,
    "position" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "Game" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "endsAt" DATETIME NOT NULL,
    "opensAt" DATETIME NOT NULL,
    "startsAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Nft" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "clanId" INTEGER NOT NULL,
    "imageUrl" TEXT NOT NULL,
    "mint" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    CONSTRAINT "Nft_clanId_fkey" FOREIGN KEY ("clanId") REFERENCES "Clan" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Trait" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "nftId" INTEGER NOT NULL,
    "value" TEXT NOT NULL,
    CONSTRAINT "Trait_nftId_fkey" FOREIGN KEY ("nftId") REFERENCES "Nft" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Quest" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "gameId" INTEGER NOT NULL,
    "isRewardClaimed" BOOLEAN NOT NULL DEFAULT false,
    "nftId" INTEGER NOT NULL,
    "points" INTEGER NOT NULL,
    "startedAt" DATETIME NOT NULL,
    CONSTRAINT "Quest_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "Game" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Quest_nftId_fkey" FOREIGN KEY ("nftId") REFERENCES "Nft" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Clan_name_key" ON "Clan"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Clan_position_key" ON "Clan"("position");

-- CreateIndex
CREATE UNIQUE INDEX "Nft_mint_key" ON "Nft"("mint");

-- CreateIndex
CREATE UNIQUE INDEX "Nft_name_key" ON "Nft"("name");
