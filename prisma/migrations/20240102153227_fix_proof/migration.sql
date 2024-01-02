/*
  Warnings:

  - Added the required column `threshold` to the `Proof` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Proof" ADD COLUMN     "threshold" DECIMAL(65,30) NOT NULL;
