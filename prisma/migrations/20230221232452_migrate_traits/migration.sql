/*
  Warnings:

  - You are about to drop the column `nftId` on the `Trait` table. All the data in the column will be lost.

*/
-- CreateTable
CREATE TABLE "_NftToTrait" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,
    CONSTRAINT "_NftToTrait_A_fkey" FOREIGN KEY ("A") REFERENCES "Nft" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "_NftToTrait_B_fkey" FOREIGN KEY ("B") REFERENCES "Trait" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Trait" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "value" TEXT NOT NULL
);
INSERT INTO "new_Trait" ("id", "name", "value") SELECT "id", "name", "value" FROM "Trait";
DROP TABLE "Trait";
ALTER TABLE "new_Trait" RENAME TO "Trait";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;

-- CreateIndex
CREATE UNIQUE INDEX "_NftToTrait_AB_unique" ON "_NftToTrait"("A", "B");

-- CreateIndex
CREATE INDEX "_NftToTrait_B_index" ON "_NftToTrait"("B");
