import { PrismaClient } from '@prisma/client'
import { Pool } from 'pg'
import { PrismaPg } from '@prisma/adapter-pg'

const prismaClientSingleton = () => {
    // Ensure DATABASE_URL is defined
    const connectionString = process.env.DATABASE_URL

    if (!connectionString) {
        // Return a dummy client or throw in production?
        // In build time (no .env), this might run? 
        // Usually build doesn't run runtime code unless generating static pages that use DB.
        // But page generation DOES run this.
        // If DATABASE_URL is missing, we can't connect.
        console.warn("DATABASE_URL is missing")
    }

    const pool = new Pool({ connectionString })
    const adapter = new PrismaPg(pool)
    return new PrismaClient({ adapter })
}

type PrismaClientSingleton = ReturnType<typeof prismaClientSingleton>

const globalForPrisma = globalThis as unknown as {
    prisma: PrismaClientSingleton | undefined
}

const prisma = globalForPrisma.prisma ?? prismaClientSingleton()

export default prisma

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
