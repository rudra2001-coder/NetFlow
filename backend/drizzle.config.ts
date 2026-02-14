import type { Config } from 'drizzle-kit';
export default {
    schema: './src/db/schema.ts',
    out: './drizzle',
    driver: 'pg',
    dbCredentials: {
        host: process.env.DATABASE_HOST || 'localhost',
        port: Number(process.env.DATABASE_PORT) || 5432,
        user: process.env.DATABASE_USER || 'netflow',
        password: process.env.DATABASE_PASSWORD || 'netflow123',
        database: process.env.DATABASE_NAME || 'netflow',
    },
} satisfies Config;