-- AlterTable
ALTER TABLE "Message" ADD COLUMN "image" TEXT;

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Book" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "title" TEXT NOT NULL,
    "author" TEXT NOT NULL,
    "price" REAL NOT NULL,
    "condition" TEXT NOT NULL,
    "category" TEXT NOT NULL DEFAULT '教材',
    "courseName" TEXT,
    "images" TEXT NOT NULL,
    "description" TEXT,
    "tradeLocation" TEXT,
    "status" TEXT NOT NULL DEFAULT '在售',
    "sellerId" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Book_sellerId_fkey" FOREIGN KEY ("sellerId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Book" ("author", "condition", "courseName", "createdAt", "description", "id", "images", "price", "sellerId", "status", "title", "tradeLocation") SELECT "author", "condition", "courseName", "createdAt", "description", "id", "images", "price", "sellerId", "status", "title", "tradeLocation" FROM "Book";
DROP TABLE "Book";
ALTER TABLE "new_Book" RENAME TO "Book";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
