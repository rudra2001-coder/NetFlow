/**
 * Database migration script
 * Run migrations manually using: npm run db:migrate
 */

import { config as dotenvConfig } from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Load environment variables from .env file
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenvConfig({ path: path.resolve(__dirname, '../../../.env') });

import { drizzle } from 'drizzle-orm/node-postgres';
import { migrate } from 'drizzle-orm/node-postgres/migrator';
import { Pool } from 'pg';
import { config } from '../config/index.js';
import { logger } from '../utils/logger.js';

async function runMigrations() {
    const pool = new Pool({
        host: config.DATABASE_HOST,
        port: config.DATABASE_PORT,
        user: config.DATABASE_USER,
        password: config.DATABASE_PASSWORD,
        database: config.DATABASE_NAME,
    });

    const db = drizzle(pool);

    try {
        logger.info('Starting database migrations...');

        await migrate(db, {
            migrationsFolder: './drizzle',
        });

        logger.info('✅ Database migrations completed successfully');
    } catch (error) {
        logger.error({ error }, '❌ Database migrations failed');
        throw error;
    } finally {
        await pool.end();
    }
}

runMigrations()
    .then(() => {
        process.exit(0);
    })
    .catch((error) => {
        console.error('Migration failed:', error);
        process.exit(1);
    });
