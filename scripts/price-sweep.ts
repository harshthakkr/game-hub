/// Price sweep, run by .github/workflows/price-tracker.yml (outside Next.js,
/// so it isn't bound by the 60s serverless limit).
///
///   npx tsx scripts/price-sweep.ts            refresh whatever is due
///   npx tsx scripts/price-sweep.ts --seed     first add the popular catalogue
///
/// Env: DATABASE_URL, and for --seed the IGDB credentials
/// (NEXT_PUBLIC_CLIENT_ID, NEXT_PUBLIC_CLIENT_SECRET, NEXT_PUBLIC_BASE_URL).
/// SEED_LIMIT (default 2000) and BUDGET_MINUTES (default 20) tune a run.
import { prisma } from "@/lib/prisma";
import { refreshDueListings } from "@/lib/prices";
import { seedCatalogue } from "@/lib/priceCatalogue";

async function main() {
  if (process.argv.includes("--seed")) {
    const seeded = await seedCatalogue(Number(process.env.SEED_LIMIT) || 2000);
    console.log("seed", JSON.stringify(seeded));
  }
  const budgetMs = (Number(process.env.BUDGET_MINUTES) || 20) * 60 * 1000;
  const result = await refreshDueListings(budgetMs);
  console.log("refresh", JSON.stringify(result));
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
