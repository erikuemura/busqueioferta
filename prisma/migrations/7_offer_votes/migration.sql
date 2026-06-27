-- AlterTable
ALTER TABLE "Offer" ADD COLUMN     "temperature" INTEGER NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "OfferVote" (
    "id" TEXT NOT NULL,
    "offerId" TEXT NOT NULL,
    "voterKey" TEXT NOT NULL,
    "value" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "OfferVote_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "OfferVote_offerId_idx" ON "OfferVote"("offerId");

-- CreateIndex
CREATE UNIQUE INDEX "OfferVote_offerId_voterKey_key" ON "OfferVote"("offerId", "voterKey");

-- AddForeignKey
ALTER TABLE "OfferVote" ADD CONSTRAINT "OfferVote_offerId_fkey" FOREIGN KEY ("offerId") REFERENCES "Offer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

