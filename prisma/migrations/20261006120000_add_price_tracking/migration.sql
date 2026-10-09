-- CreateEnum
CREATE TYPE "public"."PriceStore" AS ENUM ('PLAYSTATION');

-- CreateTable
CREATE TABLE "public"."PriceListing" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "store" "public"."PriceStore" NOT NULL,
    "gameId" INTEGER NOT NULL,
    "gameSlug" TEXT NOT NULL,
    "externalId" TEXT NOT NULL,
    "productName" TEXT,
    "lastViewedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastFetchedAt" TIMESTAMP(3),
    "lastError" TEXT,

    CONSTRAINT "PriceListing_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."PriceSnapshot" (
    "id" TEXT NOT NULL,
    "fetchedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "currency" TEXT NOT NULL,
    "basePrice" INTEGER NOT NULL,
    "price" INTEGER NOT NULL,
    "isFree" BOOLEAN NOT NULL DEFAULT false,
    "saleEndsAt" TIMESTAMP(3),
    "listingId" TEXT NOT NULL,

    CONSTRAINT "PriceSnapshot_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "PriceListing_gameSlug_store_idx" ON "public"."PriceListing"("gameSlug", "store");

-- CreateIndex
CREATE INDEX "PriceListing_lastViewedAt_idx" ON "public"."PriceListing"("lastViewedAt");

-- CreateIndex
CREATE UNIQUE INDEX "PriceListing_gameId_store_key" ON "public"."PriceListing"("gameId", "store");

-- CreateIndex
CREATE INDEX "PriceSnapshot_listingId_fetchedAt_idx" ON "public"."PriceSnapshot"("listingId", "fetchedAt");

-- AddForeignKey
ALTER TABLE "public"."PriceSnapshot" ADD CONSTRAINT "PriceSnapshot_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "public"."PriceListing"("id") ON DELETE CASCADE ON UPDATE CASCADE;

