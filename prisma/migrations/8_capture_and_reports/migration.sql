-- AlterTable
ALTER TABLE "Offer" ADD COLUMN     "capturedVia" TEXT,
ADD COLUMN     "expiredReportsCount" INTEGER NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "ExpiredReport" (
    "id" TEXT NOT NULL,
    "offerId" TEXT NOT NULL,
    "reporterKey" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ExpiredReport_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ExpiredReport_offerId_idx" ON "ExpiredReport"("offerId");

-- CreateIndex
CREATE UNIQUE INDEX "ExpiredReport_offerId_reporterKey_key" ON "ExpiredReport"("offerId", "reporterKey");

-- AddForeignKey
ALTER TABLE "ExpiredReport" ADD CONSTRAINT "ExpiredReport_offerId_fkey" FOREIGN KEY ("offerId") REFERENCES "Offer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

