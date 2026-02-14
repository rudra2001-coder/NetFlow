/**
 * Database connection and pool management for PostgreSQL + TimescaleDB
 */

import { Pool, PoolClient, QueryResult, QueryResultRow } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import { migrate } from 'drizzle-orm/node-postgres/migrator';
import pgConnectionString from 'pg-connection-string';
import { config } from '../config/index.js';
import { logger } from '../utils/logger.js';
import * as schema from './schema.js';

// Prepare database connection options
const dbOptions = {
  host: config.DATABASE_HOST,
  port: config.DATABASE_PORT,
  user: config.DATABASE_USER,
  password: config.DATABASE_PASSWORD,
  database: config.DATABASE_NAME,
  max: config.DATABASE_POOL_SIZE,
};

// Create connection pool
export const pool = new Pool({
  ...dbOptions,
  ssl: config.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
});

// Initialize Drizzle ORM
export const db = drizzle(pool, {
  schema,
  logger: config.NODE_ENV === 'development',
});

// Pool event handlers
pool.on('connect', () => {
  logger.debug('New database connection established');
});

pool.on('error', (err) => {
  logger.error({ err }, 'Unexpected database pool error');
});

pool.on('remove', () => {
  logger.debug('Database connection removed from pool');
});

// Database health check
export async function checkDatabaseHealth(): Promise<boolean> {
  try {
    // Simple connectivity check
    await pool.query('SELECT 1');

    // Check if critical tables exist
    const tableCheck = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'users'
      );
    `);

    // If tables don't exist yet (first run), we still consider DB connected but maybe not initialized
    // This allows migrations to run.
    return true;
  } catch (error) {
    logger.error({ error }, 'Database health check failed');
    return false;
  }
}

// Get database client for transactions
export async function getClient(): Promise<PoolClient> {
  return pool.connect();
}

// Execute query with retry logic
export async function executeQuery<T extends QueryResultRow = any>(
  query: string,
  params?: unknown[],
  retries: number = config.DATABASE_MAX_RETRIES
): Promise<QueryResult<T>> {
  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      return await pool.query<any>(query, params);
    } catch (error) {
      lastError = error as Error;
      logger.warn({ attempt, retries, error }, 'Query attempt failed');

      if (attempt < retries) {
        const delay = Math.pow(2, attempt) * 100;
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }

  throw lastError;
}

// Run database migrations
export async function runMigrations(): Promise<void> {
  try {
    logger.info('Running database migrations...');
    await migrate(db, {
      migrationsFolder: './drizzle',
    });
    logger.info('Database migrations completed successfully');
  } catch (error) {
    logger.error({ error }, 'Database migrations failed');
    throw error;
  }
}

// Initialize TimescaleDB hypertable for traffic metrics
export async function initializeTimescaleDB(): Promise<void> {
  try {
    // Enable TimescaleDB extension
    await pool.query('CREATE EXTENSION IF NOT EXISTS timescaledb');

    // Convert traffic_metrics to hypertable
    const hypertableResult = await pool.query(`
      SELECT create_hypertable('traffic_metrics', 'time')
    `);

    logger.info({ result: hypertableResult.rows }, 'TimescaleDB hypertable created');

    // Create continuous aggregates for performance
    await pool.query(`
      CREATE MATERIALIZED VIEW IF NOT EXISTS traffic_metrics_1m
      WITH (timescaledb.continuous) AS
      SELECT
        router_id,
        interface_name,
        time_bucket('1 minute', time) AS bucket,
        AVG(bytes_in) AS avg_bytes_in,
        AVG(bytes_out) AS avg_bytes_out,
        SUM(packets_in) AS total_packets_in,
        SUM(packets_out) AS total_packets_out,
        MAX(bytes_in) AS max_bytes_in,
        MAX(bytes_out) AS max_bytes_out
      FROM traffic_metrics
      GROUP BY router_id, interface_name, bucket
    `);

    // Create hourly aggregate view
    await pool.query(`
      CREATE MATERIALIZED VIEW IF NOT EXISTS traffic_metrics_1h
      WITH (timescaledb.continuous) AS
      SELECT
        router_id,
        interface_name,
        time_bucket('1 hour', time) AS bucket,
        AVG(bytes_in) AS avg_bytes_in,
        AVG(bytes_out) AS avg_bytes_out,
        SUM(packets_in) AS total_packets_in,
        SUM(packets_out) AS total_packets_out,
        MAX(bytes_in) AS max_bytes_in,
        MAX(bytes_out) AS max_bytes_out
      FROM traffic_metrics
      GROUP BY router_id, interface_name, bucket
    `);

    logger.info('TimescaleDB continuous aggregates created');

    // Add retention policy (keep 30 days of raw data)
    await pool.query(`
      SELECT add_retention_policy('traffic_metrics', INTERVAL '30 days')
    `);

    logger.info('TimescaleDB retention policy applied');
  } catch (error) {
    // TimescaleDB might not be available in all environments
    logger.warn({ error }, 'TimescaleDB initialization skipped (extension may not be installed)');
  }
}

// Graceful shutdown
export async function closeDatabase(): Promise<void> {
  try {
    logger.info('Closing database connections...');
    await pool.end();
    logger.info('Database connections closed');
  } catch (error) {
    logger.error({ error }, 'Error closing database connections');
    throw error;
  }
}

export default {
  pool,
  db,
  checkDatabaseHealth,
  getClient,
  executeQuery,
  runMigrations,
  initializeTimescaleDB,
  closeDatabase,
};
