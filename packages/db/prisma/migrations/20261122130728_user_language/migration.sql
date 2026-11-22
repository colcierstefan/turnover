-- CreateEnum
CREATE TYPE "UserLanguage" AS ENUM ('EN', 'RO');

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "language" "UserLanguage";
