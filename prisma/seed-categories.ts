import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';

const connectionString = process.env.DIRECT_URL || process.env.DATABASE_URL;
if (!connectionString) {
    console.error("No database connection string");
    process.exit(1);
}
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const categories = [
    'Furniture Accessories',
    'Bathroom Fittings',
    'Power Tools',
    'Hardware',
    'Kitchen Accessories',
    'Lighting',
    'Paints & Finishes'
];

async function main() {
    console.log('Seeding categories...');
    for (const name of categories) {
        await prisma.category.upsert({
            where: { name },
            update: {},
            create: { name }
        });
    }
    console.log('Categories seeded!');
}

main()
    .then(async () => {
        await prisma.$disconnect();
    })
    .catch(async (e) => {
        console.error(e);
        await prisma.$disconnect();
        process.exit(1);
    });
