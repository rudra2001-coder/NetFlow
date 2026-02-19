/**
 * NetFlow ISP Management Platform - Backend Server
 * Production-grade Fastify application with all middleware and routes
 */

import Fastify, { FastifyInstance } from 'fastify';
import fastifyJwt from '@fastify/jwt';
// import fastifyCookie from '@fastify/cookie';
import fastifyCors from '@fastify/cors';
import fastifyHelmet from '@fastify/helmet';
import fastifyRateLimit from '@fastify/rate-limit';
import fastifySwagger from '@fastify/swagger';
import fastifySwaggerUi from '@fastify/swagger-ui';
import { config } from './config/index.js';
import { logger } from './utils/logger.js';
import { db, pool, checkDatabaseHealth, runMigrations, initializeTimescaleDB } from './db/index.js';
import { initializeRedis, closeRedis } from './services/cache.js';
import { snmpPollingService } from './services/snmp.js';
import { netflowCollector } from './services/netflow.js';

// Routes
import authRoutes from './routes/auth.js';
import routerRoutes from './routes/routers.js';
import pppRoutes from './routes/ppp.js';
import dashboardRoutes from './routes/dashboard.js';
import { oltRoutes } from './routes/olts.js';

// ============================================================================
// APP FACTORY
// ============================================================================

export async function buildApp(): Promise<FastifyInstance> {
  const app = Fastify({
    logger: {
      level: config.LOG_LEVEL,
    },
    trustProxy: true,
    bodyLimit: 1048576 * 10, // 10MB
  });

  // ==========================================================================
  // MIDDLEWARE
  // ==========================================================================

  // CORS
  await app.register(fastifyCors, {
    origin: config.FRONTEND_URL,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  });

  // Security headers
  await app.register(fastifyHelmet, {
    contentSecurityPolicy: false,
  });

  // Rate limiting
  await app.register(fastifyRateLimit, {
    max: config.RATE_LIMIT_MAX,
    timeWindow: config.RATE_LIMIT_TIME_WINDOW,
    keyGenerator: (request) => {
      return request.ip || 'unknown';
    },
    errorResponseBuilder: (request) => {
      return {
        success: false,
        error: 'Too many requests',
        retryAfter: 60,
      };
    },
  });

  // JWT Authentication
  await app.register(fastifyJwt, {
    secret: config.JWT_SECRET,
    sign: {
      expiresIn: config.JWT_EXPIRES_IN,
    },
  });

  // Cookies
  // await app.register(fastifyCookie, {
  //   secret: config.JWT_SECRET,
  //   parseOptions: {},
  // });

  // Swagger Documentation
  await app.register(fastifySwagger, {
    openapi: {
      info: {
        title: 'NetFlow ISP Management API',
        description: 'Production-grade ISP management platform for MikroTik routers',
        version: '1.0.0',
      },
      servers: [
        {
          url: `http://localhost:${config.PORT}`,
          description: 'Development server',
        },
      ],
      components: {
        securitySchemes: {
          bearerAuth: {
            type: 'http',
            scheme: 'bearer',
            bearerFormat: 'JWT',
          },
        },
      },
      tags: [
        { name: 'Authentication', description: 'User authentication endpoints' },
        { name: 'Routers', description: 'Router management' },
        { name: 'PPP', description: 'PPP user management' },
        { name: 'Dashboard', description: 'Dashboard and analytics' },
      ],
    },
  });

  await app.register(fastifySwaggerUi, {
    routePrefix: '/docs',
    uiConfig: {
      docExpansion: 'list',
      deepLinking: false,
    },
  });

  // ==========================================================================
  // AUTHENTICATION DECORATOR
  // ==========================================================================

  app.decorate('authenticate', async (request, reply) => {
    try {
      await request.jwtVerify();
    } catch (err) {
      reply.status(401).send({
        success: false,
        error: 'Unauthorized',
      });
    }
  });

  // ==========================================================================
  // HEALTH CHECK
  // ==========================================================================

  app.get('/health', async (request, reply) => {
    const dbHealth = await checkDatabaseHealth();

    const status = {
      status: dbHealth ? 'healthy' : 'degraded',
      timestamp: new Date().toISOString(),
      services: {
        database: dbHealth ? 'up' : 'down',
        api: 'up',
      },
      version: '1.0.0',
    };

    return reply.status(dbHealth ? 200 : 503).send(status);
  });

  app.get('/ready', async (request, reply) => {
    const dbHealth = await checkDatabaseHealth();

    if (!dbHealth) {
      return reply.status(503).send({
        ready: false,
        reason: 'Database not available',
      });
    }

    return reply.send({
      ready: true,
    });
  });

  // ==========================================================================
  // ROUTES
  // ==========================================================================

  await app.register(authRoutes, { prefix: '/api/v1/auth' });
  await app.register(routerRoutes, { prefix: '/api/v1/routers' });
  await app.register(pppRoutes, { prefix: '/api/v1/ppp' });
  await app.register(dashboardRoutes, { prefix: '/api/v1/dashboard' });
  await app.register(oltRoutes, { prefix: '/api/v1/olts' });

  // Root endpoint
  app.get('/', async (request, reply) => {
    return reply.send({
      name: 'NetFlow ISP Management Platform',
      version: '1.0.0',
      documentation: '/docs',
      health: '/health',
    });
  });

  // ==========================================================================
  // ERROR HANDLING
  // ==========================================================================

  app.setErrorHandler((error, request, reply) => {
    logger.error({
      err: error,
      method: request.method,
      url: request.url,
      ip: request.ip,
    }, 'Request error');

    // Don't expose internal errors in production
    const isProduction = config.NODE_ENV === 'production';

    reply.status(error.statusCode || 500).send({
      success: false,
      error: isProduction && error.statusCode === 500
        ? 'Internal Server Error'
        : error.message,
    });
  });

  // Not found handler
  app.setNotFoundHandler((request, reply) => {
    reply.status(404).send({
      success: false,
      error: 'Not Found',
    });
  });

  return app;
}

// ============================================================================
// START SERVER
// ============================================================================

async function startServer(): Promise<void> {
  try {
    logger.info('Starting NetFlow ISP Management Platform...');

    // Initialize database
    logger.info('Connecting to database...');
    await checkDatabaseHealth();
    await runMigrations();
    await initializeTimescaleDB();
    logger.info('Database initialized');

    // Initialize Redis
    logger.info('Connecting to Redis...');
    try {
      await initializeRedis();
      logger.info('Redis initialized');
    } catch (redisError) {
      logger.warn({ error: redisError }, 'Redis initialization failed, continuing without cache');
    }

    // Build app
    const app = await buildApp();

    // Start background services
    if (config.ENABLE_SNMP && config.WORKER_ENABLED) {
      logger.info('Starting SNMP polling service...');
      snmpPollingService.start();
    }

    if (config.ENABLE_NETFLOW) {
      logger.info('Starting NetFlow collector...');
      netflowCollector.start();
    }

    // Start server
    await app.listen({
      port: config.PORT,
      host: '0.0.0.0',
    });

    logger.info({
      port: config.PORT,
      environment: config.NODE_ENV,
    }, `Server listening on port ${config.PORT}`);

    // Graceful shutdown
    const shutdown = async (signal: string) => {
      logger.info({ signal }, 'Shutting down...');

      // Stop background services
      snmpPollingService.stop();
      netflowCollector.stop();

      // Close connections
      await app.close();
      await closeRedis();
      await pool.end();

      logger.info('Shutdown complete');
      process.exit(0);
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));

  } catch (error) {
    logger.error({ error }, 'Failed to start server');
    process.exit(1);
  }
}

// Export for testing


// Start if running directly
if (process.argv[1] && process.argv[1].includes('index.ts')) {
  startServer();
}
