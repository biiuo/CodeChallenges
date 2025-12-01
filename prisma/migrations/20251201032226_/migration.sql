/*
  Warnings:

  - You are about to drop the column `nrc` on the `Course` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Challenge" ADD COLUMN     "solutionCode" TEXT,
ADD COLUMN     "solutionLanguage" TEXT;



