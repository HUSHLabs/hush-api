-- AlterTable
ALTER TABLE "Verification" ADD COLUMN     "description" TEXT NOT NULL DEFAULT 'Long description',
ADD COLUMN     "imageUrl" TEXT NOT NULL DEFAULT 'https://image',
ADD COLUMN     "name" TEXT NOT NULL DEFAULT 'New Verification',
ADD COLUMN     "shortDescription" TEXT NOT NULL DEFAULT 'Short description';
