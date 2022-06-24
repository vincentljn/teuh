/*
  Warnings:

  - Added the required column `order` to the `Seniority` table without a default value. This is not possible if the table is not empty.
  - Added the required column `order` to the `Experience` table without a default value. This is not possible if the table is not empty.
  - Added the required column `order` to the `Job` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Seniority" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "value" REAL NOT NULL,
    "order" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_Seniority" ("createdAt", "id", "name", "updatedAt", "value") SELECT "createdAt", "id", "name", "updatedAt", "value" FROM "Seniority";
DROP TABLE "Seniority";
ALTER TABLE "new_Seniority" RENAME TO "Seniority";
CREATE UNIQUE INDEX "Seniority_order_key" ON "Seniority"("order");
CREATE TABLE "new_Experience" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "value" REAL NOT NULL,
    "order" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_Experience" ("createdAt", "id", "name", "updatedAt", "value") SELECT "createdAt", "id", "name", "updatedAt", "value" FROM "Experience";
DROP TABLE "Experience";
ALTER TABLE "new_Experience" RENAME TO "Experience";
CREATE UNIQUE INDEX "Experience_order_key" ON "Experience"("order");
CREATE TABLE "new_Job" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "value" REAL NOT NULL,
    "order" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_Job" ("createdAt", "id", "name", "updatedAt", "value") SELECT "createdAt", "id", "name", "updatedAt", "value" FROM "Job";
DROP TABLE "Job";
ALTER TABLE "new_Job" RENAME TO "Job";
CREATE UNIQUE INDEX "Job_order_key" ON "Job"("order");
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
