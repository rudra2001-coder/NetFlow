/**
 * Configuration management for NetFlow ISP Platform
 * Supports environment variables with validation using Zod
 */

import { config as dotenvConfig } from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { z } from 'zod';

// Load environment variables from .env file
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenvConfig({ path: path.resolve(__dirname, '../../.env') });

// Environment variable schema validation
const envSchema = z.object({
  // Server Configuration
  NODE_ENV: z.enum(['development', 'staging', 'production']).default('development'),
  PORT: z.coerce.number().default(3001),
  API_PREFIX: z.string().default('/api/v1'),

  // Database Configuration (PostgreSQL + TimescaleDB)
  DATABASE_HOST: z.string().default('localhost'),
  DATABASE_PORT: z.coerce.number().default(5432),
  DATABASE_USER: z.string().default('netflow'),
  DATABASE_PASSWORD: z.string().optional(),
  DATABASE_NAME: z.string().default('netflow'),
  DATABASE_POOL_SIZE: z.coerce.number().default(20),
  DATABASE_MAX_RETRIES: z.coerce.number().default(3),

  // Redis Configuration
  REDIS_HOST: z.string().default('localhost'),
  REDIS_PORT: z.coerce.number().default(6379),
  REDIS_PASSWORD: z.string().optional(),
  REDIS_DB: z.coerce.number().default(0),
  REDIS_CACHE_TTL: z.coerce.number().default(60),

  // Security Configuration
  JWT_SECRET: z.string().min(32).optional(),
  JWT_EXPIRES_IN: z.string().default('24h'),
  JWT_REFRESH_SECRET: z.string().min(32).optional(),
  JWT_REFRESH_EXPIRES_IN: z.string().default('7d'),

  // Encryption Configuration (AES-256 for router credentials)
  ENCRYPTION_KEY: z.string().length(32).optional(),
  ENCRYPTION_IV_LENGTH: z.coerce.number().default(16),

  // Router Communication
  ROUTER_CONNECTION_TIMEOUT: z.coerce.number().default(30000),
  ROUTER_MAX_CONNECTIONS: z.coerce.number().default(100),
  ROUTER_CONNECTION_POOL_SIZE: z.coerce.number().default(10),

  // SNMP Configuration
  SNMP_POLL_INTERVAL: z.coerce.number().default(60000),
  SNMP_TIMEOUT: z.coerce.number().default(5000),
  SNMP_RETRIES: z.coerce.number().default(3),

  // REST API Polling Configuration
  REST_POLL_INTERVAL: z.coerce.number().default(10000),
  REST_POLL_TIMEOUT: z.coerce.number().default(15000),

  // NetFlow Configuration
  NETFLOW_PORT: z.coerce.number().default(2055),
  NETFLOW_BUFFER_SIZE: z.coerce.number().default(65535),

  // Rate Limiting
  RATE_LIMIT_MAX: z.coerce.number().default(100),
  RATE_LIMIT_TIME_WINDOW: z.coerce.number().default(60000),

  // Logging Configuration
  LOG_LEVEL: z.enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace']).default('info'),
  LOG_PRETTY: z.coerce.boolean().default(true),

  // Frontend URL (for CORS)
  FRONTEND_URL: z.string().default('http://localhost:3000'),

  // Feature Flags
  ENABLE_NETFLOW: z.coerce.boolean().default(true),
  ENABLE_SNMP: z.coerce.boolean().default(true),
  ENABLE_REST_POLLING: z.coerce.boolean().default(true),
  ENABLE_BILLING: z.coerce.boolean().default(true),
  ENABLE_AUTOSUSPEND: z.coerce.boolean().default(true),

  // Worker Configuration
  WORKER_ENABLED: z.coerce.boolean().default(true),
  WORKER_CONCURRENCY: z.coerce.number().default(4),
});

// Parse and validate environment variables
const env = envSchema.safeParse(process.env);

if (!env.success) {
  console.error('❌ Invalid environment variables:');
  console.error(env.error.format());
  process.exit(1);
}

// Security Check & Auto-Generation for Development
let configData = { ...env.data };

if (configData.NODE_ENV === 'production') {
  const missingSecrets = [];
  if (!configData.JWT_SECRET) missingSecrets.push('JWT_SECRET');
  if (!configData.JWT_REFRESH_SECRET) missingSecrets.push('JWT_REFRESH_SECRET');
  if (!configData.ENCRYPTION_KEY) missingSecrets.push('ENCRYPTION_KEY');

  if (missingSecrets.length > 0) {
    console.error('❌ CRITICAL SECURITY ERROR: The following secrets are missing in PRODUCTION environment:');
    console.error(missingSecrets.join(', '));
    console.error('The application will now exit to prevent security risks.');
    process.exit(1);
  }
} else {
  // Development / Staging: Auto-generate secrets if missing
  const { randomBytes } = await import('crypto');

  if (!configData.JWT_SECRET) {
    console.warn('⚠️  JWT_SECRET missing in DEV. Auto-generating temporary secret.');
    configData.JWT_SECRET = randomBytes(32).toString('hex');
  }

  if (!configData.JWT_REFRESH_SECRET) {
    console.warn('⚠️  JWT_REFRESH_SECRET missing in DEV. Auto-generating temporary secret.');
    configData.JWT_REFRESH_SECRET = randomBytes(32).toString('hex');
  }

  if (!configData.ENCRYPTION_KEY) {
    console.warn('⚠️  ENCRYPTION_KEY missing in DEV. Auto-generating temporary key.');
    // Ensure exactly 32 chars for AES-256-CBC if using that specific length requirement, 
    // or just 32 bytes hex = 64 chars if the schema expects 32 chars length specifically.
    // The schema said .length(32), so we need exactly 32 chars.
    configData.ENCRYPTION_KEY = randomBytes(16).toString('hex');
  }
}

// Force non-optional types after validation/generation
export const config = configData as Required<typeof configData>;

// Type inference from schema
export type Config = z.infer<typeof envSchema>;

// Singleton config instance
let configInstance: Config | null = null;

export function getConfig(): Config {
  if (!configInstance) {
    configInstance = config;
  }
  return configInstance;
}

// Configuration helper functions
export const isProduction = config.NODE_ENV === 'production';
export const isDevelopment = config.NODE_ENV === 'development';
export const isStaging = config.NODE_ENV === 'staging';

export default config;
