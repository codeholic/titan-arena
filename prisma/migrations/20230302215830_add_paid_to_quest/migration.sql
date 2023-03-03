-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Quest" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "clamedAt" DATETIME,
    "gameId" INTEGER NOT NULL,
    "nftId" INTEGER NOT NULL,
    "paid" BIGINT NOT NULL DEFAULT 10000000,
    "points" INTEGER,
    "rewardClaimedAt" DATETIME,
    "startedAt" DATETIME NOT NULL,
    CONSTRAINT "Quest_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "Game" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Quest_nftId_fkey" FOREIGN KEY ("nftId") REFERENCES "Nft" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Quest" ("clamedAt", "gameId", "id", "nftId", "points", "rewardClaimedAt", "startedAt") SELECT "clamedAt", "gameId", "id", "nftId", "points", "rewardClaimedAt", "startedAt" FROM "Quest";
DROP TABLE "Quest";
ALTER TABLE "new_Quest" RENAME TO "Quest";
CREATE UNIQUE INDEX "Quest_gameId_nftId_key" ON "Quest"("gameId", "nftId");
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
