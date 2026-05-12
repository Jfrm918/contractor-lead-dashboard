import 'dotenv/config';
import { PrismaClient } from '../src/generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

async function main() {
  const sites = await prisma.foamJobSite.findMany({
    orderBy: { createdAt: 'desc' },
    take: 5,
    select: { id: true, name: true, address: true, jobType: true, substrate: true, status: true, createdAt: true, user: { select: { email: true } } },
  });
  console.log('5 most recent job sites:');
  for (const s of sites) {
    const ageMin = Math.round((Date.now() - new Date(s.createdAt).getTime()) / 60000);
    console.log(`  • "${s.name}" — ${s.address || '(no address)'} — ${s.jobType || 'no type'} — ${s.status} — ${ageMin}min ago by ${s.user.email}`);
  }
}
main().then(() => prisma.$disconnect()).catch(e => { console.error(e); prisma.$disconnect(); process.exit(1); });
