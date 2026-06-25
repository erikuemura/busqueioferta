-- AlterEnum
ALTER TYPE "Role" ADD VALUE 'CUSTOMER';

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "interests" "Category"[],
ADD COLUMN     "lastDigestAt" TIMESTAMP(3),
ADD COLUMN     "phone" TEXT,
ADD COLUMN     "wantsEmail" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "wantsWhatsapp" BOOLEAN NOT NULL DEFAULT true;

