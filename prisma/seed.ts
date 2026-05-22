import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const types = [
    { slug: 'water-space-denial',   displayName: 'Water Space Denial',    domain: 'Maritime', sortOrder: 1 },
    { slug: 'survey-mapping',       displayName: 'Survey & Mapping',      domain: 'Maritime', sortOrder: 2 },
    { slug: 'mine-countermeasures', displayName: 'Mine Countermeasures',  domain: 'Maritime', sortOrder: 3 },
    { slug: 'contested-logistics',  displayName: 'Contested Logistics',   domain: 'Maritime', sortOrder: 4 },
    { slug: 'convoy-escort',        displayName: 'Convoy Escort',         domain: 'Maritime', sortOrder: 5 },
    { slug: 'swarm-attack',         displayName: 'Swarm Attack',          domain: 'Maritime', sortOrder: 6 },
    { slug: 'sigint-collection',    displayName: 'SIGINT Collection',     domain: 'Combined', sortOrder: 7 },
    { slug: 'isr-patrol',           displayName: 'ISR Patrol',            domain: 'Combined', sortOrder: 8 },
    { slug: 'anti-submarine',       displayName: 'Anti-Submarine Warfare', domain: 'Maritime', sortOrder: 9 },
    { slug: 'port-security',        displayName: 'Port Security',         domain: 'Maritime', sortOrder: 10 },
  ];

  for (const t of types) {
    await prisma.missionType.upsert({
      where: { slug: t.slug },
      update: {},
      create: t,
    });
  }

  console.log('MissionType seed complete');
}

main().finally(() => prisma.$disconnect());
