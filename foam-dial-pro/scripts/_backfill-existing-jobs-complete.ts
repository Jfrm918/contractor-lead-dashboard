// Marks all existing FoamJob records as status="complete" with eodLoggedAt
// set to their createdAt. They were logged via the old single-shot model so
// they should display as completed, not in-progress.
//
// Run once after the schema migration:
//   npx tsx scripts/_backfill-existing-jobs-complete.ts
import 'dotenv/config';
import { PrismaClient } from '../src/generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

async function main() {
  const jobs = await prisma.foamJob.findMany({
    where: {
      morningLoggedAt: null,
      eodLoggedAt: null,
    },
    select: { id: true, createdAt: true, status: true },
  });
  console.log(`Found ${jobs.length} legacy jobs to backfill.`);
  let updated = 0;
  for (const j of jobs) {
    await prisma.foamJob.update({
      where: { id: j.id },
      data: {
        status: 'complete',
        eodLoggedAt: j.createdAt,
      },
    });
    updated++;
  }
  console.log(`Updated ${updated} jobs → status="complete", eodLoggedAt=createdAt.`);
}

main()
  .then(() => prisma.$disconnect())
  .catch((err) => {
    console.error(err);
    return prisma.$disconnect().then(() => process.exit(1));
  });
