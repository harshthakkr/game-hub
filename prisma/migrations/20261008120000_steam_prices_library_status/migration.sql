-- AlterEnum
ALTER TYPE "public"."PriceStore" ADD VALUE 'STEAM';

-- CreateEnum
CREATE TYPE "public"."LibraryStatus" AS ENUM ('PLAYING', 'BACKLOG', 'FINISHED');

-- AlterTable
ALTER TABLE "public"."CollectionItem" ADD COLUMN "status" "public"."LibraryStatus";

-- Existing library games predate shelves; start them on the backlog.
UPDATE "public"."CollectionItem" SET "status" = 'BACKLOG' WHERE "kind" = 'LIBRARY';
