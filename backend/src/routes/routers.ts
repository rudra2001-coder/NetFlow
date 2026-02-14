/**
 * Router Management Routes
 * Handles CRUD operations for routers and their data
 */

import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { z } from 'zod';
import { v4 as uuidv4 } from 'uuid';
import { routerService } from '../services/router.js';
import { snmpPollingService } from '../services/snmp.js';
import { encryptRouterCredentials } from '../utils/encryption.js';
import { cacheRouterStatus, invalidateRouterCache } from '../services/cache.js';
import { db } from '../db/index.js';
import { routers, pppSecrets, pppActive, hotspotActive, interfaceStats, systemResources } from '../db/schema.js';
import { eq, and, desc, asc } from 'drizzle-orm';
import { logger } from '../utils/logger.js';

// ============================================================================
// ROUTES
// ============================================================================

export async function routerRoutes(fastify: FastifyInstance): Promise<void> {
  /**
   * List all routers for organization
   */
  fastify.get('/', {
    onRequest: [fastify.authenticate],
    schema: {
      description: 'List all routers',
      tags: ['Routers'],
      querystring: {
        type: 'object',
        properties: {
          status: { type: 'string', enum: ['online', 'offline', 'warning', 'error'] },
          limit: { type: 'integer', minimum: 1, maximum: 100, default: 50 },
          offset: { type: 'integer', minimum: 0, default: 0 },
        },
      },
    },
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    const user = (request as any).user;
    const query = request.query as { status?: string; limit?: number; offset?: number };

    const orgRouters = await db.query.routers.findMany({
      where: eq(routers.organizationId, user.organizationId),
      limit: query.limit || 50,
      offset: query.offset || 0,
      orderBy: (routers, { desc }) => [desc(routers.createdAt)],
    });

    return reply.send({
      success: true,
      data: orgRouters,
      pagination: {
        limit: query.limit || 50,
        offset: query.offset || 0,
      },
    });
  });

  /**
   * Get single router details
   */
  fastify.get('/:id', {
    onRequest: [fastify.authenticate],
    schema: {
      description: 'Get router details',
      tags: ['Routers'],
      params: {
        type: 'object',
        required: ['id'],
        properties: {
          id: { type: 'string', format: 'uuid' },
        },
      },
    },
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    const user = (request as any).user;
    const params = request.params as { id: string };

    const router = await db.query.routers.findFirst({
      where: and(
        eq(routers.id, params.id),
        eq(routers.organizationId, user.organizationId),
      ),
    });

    if (!router) {
      return reply.status(404).send({
        success: false,
        error: 'Router not found',
      });
    }

    return reply.send({
      success: true,
      data: router,
    });
  });

  /**
   * Add new router
   */
  fastify.post('/', {
    onRequest: [fastify.authenticate],
    schema: {
      description: 'Add new router',
      tags: ['Routers'],
      body: {
        type: 'object',
        required: ['name', 'hostname', 'ipAddress', 'username', 'password'],
        properties: {
          name: { type: 'string', minLength: 1, maxLength: 255 },
          hostname: { type: 'string', minLength: 1, maxLength: 255 },
          ipAddress: { type: 'string', format: 'ipv4' },
          port: { type: 'integer', default: 8728 },
          username: { type: 'string', minLength: 1, maxLength: 100 },
          password: { type: 'string', minLength: 1 },
          snmpCommunity: { type: 'string' },
          snmpPort: { type: 'integer', default: 161 },
          location: { type: 'string' },
          latitude: { type: 'string' },
          longitude: { type: 'string' },
          enableSnmp: { type: 'boolean', default: true },
          enableRest: { type: 'boolean', default: true },
          enableNetflow: { type: 'boolean', default: false },
        },
      },
    },
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    const user = (request as any).user;
    const body = request.body as any;

    try {
      // Encrypt credentials
      const encryptedCredential = encryptRouterCredentials({
        username: body.username,
        password: body.password,
      });

      // Create router
      const routerId = uuidv4();
      await db.insert(routers).values({
        id: routerId,
        organizationId: user.organizationId,
        name: body.name,
        hostname: body.hostname,
        ipAddress: body.ipAddress,
        port: body.port || 8728,
        username: body.username,
        encryptedCredential,
        snmpCommunity: body.snmpCommunity,
        snmpPort: body.snmpPort || 161,
        location: body.location,
        latitude: body.latitude,
        longitude: body.longitude,
        enableSnmp: body.enableSnmp !== false,
        enableRest: body.enableRest !== false,
        enableNetflow: body.enableNetflow || false,
        status: 'pending',
      });

      const router = await db.query.routers.findFirst({
        where: eq(routers.id, routerId),
      });

      return reply.status(201).send({
        success: true,
        data: router,
      });
    } catch (error) {
      logger.error({ error }, 'Failed to add router');
      return reply.status(500).send({
        success: false,
        error: 'Failed to add router',
      });
    }
  });

  /**
   * Test router connection
   */
  fastify.post('/:id/test', {
    onRequest: [fastify.authenticate],
    schema: {
      description: 'Test router connection',
      tags: ['Routers'],
      params: {
        type: 'object',
        required: ['id'],
        properties: {
          id: { type: 'string', format: 'uuid' },
        },
      },
    },
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    const user = (request as any).user;
    const params = request.params as { id: string };

    const router = await db.query.routers.findFirst({
      where: and(
        eq(routers.id, params.id),
        eq(routers.organizationId, user.organizationId),
      ),
    });

    if (!router) {
      return reply.status(404).send({
        success: false,
        error: 'Router not found',
      });
    }

    const result = await routerService.testConnection(router.id);

    if (result.success) {
      // Update router status
      await db.update(routers)
        .set({
          status: 'online',
          lastSeenAt: new Date(),
          lastError: null,
        })
        .where(eq(routers.id, router.id));
    } else {
      await db.update(routers)
        .set({
          status: 'offline',
          lastError: result.error,
        })
        .where(eq(routers.id, router.id));
    }

    // Invalidate cache
    await invalidateRouterCache(router.id);

    return reply.send({
      success: result.success,
      latency: result.latency,
      error: result.error,
    });
  });

  /**
   * Get router system info
   */
  fastify.get('/:id/system', {
    onRequest: [fastify.authenticate],
    schema: {
      description: 'Get router system information',
      tags: ['Routers'],
      params: {
        type: 'object',
        required: ['id'],
        properties: {
          id: { type: 'string', format: 'uuid' },
        },
      },
      querystring: {
        type: 'object',
        properties: {
          history: { type: 'boolean', default: false },
          hours: { type: 'integer', default: 24 },
        },
      },
    },
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    const user = (request as any).user;
    const params = request.params as { id: string };
    const query = request.query as { history?: boolean; hours?: number };

    const router = await db.query.routers.findFirst({
      where: and(
        eq(routers.id, params.id),
        eq(routers.organizationId, user.organizationId),
      ),
    });

    if (!router) {
      return reply.status(404).send({
        success: false,
        error: 'Router not found',
      });
    }

    if (query.history) {
      const startTime = new Date(Date.now() - (query.hours || 24) * 60 * 60 * 1000);
      const resources = await snmpPollingService.getSystemResourcesForRange(
        router.id,
        startTime,
        new Date()
      );
      return reply.send({
        success: true,
        data: resources,
      });
    }

    const latestResources = await snmpPollingService.getLatestSystemResources(router.id);

    return reply.send({
      success: true,
      data: latestResources,
    });
  });

  /**
   * Get router interfaces
   */
  fastify.get('/:id/interfaces', {
    onRequest: [fastify.authenticate],
    schema: {
      description: 'Get router interfaces',
      tags: ['Routers'],
      params: {
        type: 'object',
        required: ['id'],
        properties: {
          id: { type: 'string', format: 'uuid' },
        },
      },
      querystring: {
        type: 'object',
        properties: {
          history: { type: 'boolean', default: false },
          hours: { type: 'integer', default: 24 },
          interfaceName: { type: 'string' },
        },
      },
    },
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    const user = (request as any).user;
    const params = request.params as { id: string };
    const query = request.query as { history?: boolean; hours?: number; interfaceName?: string };

    const router = await db.query.routers.findFirst({
      where: and(
        eq(routers.id, params.id),
        eq(routers.organizationId, user.organizationId),
      ),
    });

    if (!router) {
      return reply.status(404).send({
        success: false,
        error: 'Router not found',
      });
    }

    if (query.history) {
      const startTime = new Date(Date.now() - (query.hours || 24) * 60 * 60 * 1000);
      const stats = await snmpPollingService.getInterfaceStatsForRange(
        router.id,
        query.interfaceName || 'ether1',
        startTime,
        new Date()
      );
      return reply.send({
        success: true,
        data: stats,
      });
    }

    const latestStats = await snmpPollingService.getLatestInterfaceStats(router.id, 10);

    return reply.send({
      success: true,
      data: latestStats,
    });
  });

  /**
   * Update router
   */
  fastify.put('/:id', {
    onRequest: [fastify.authenticate],
    schema: {
      description: 'Update router',
      tags: ['Routers'],
      params: {
        type: 'object',
        required: ['id'],
        properties: {
          id: { type: 'string', format: 'uuid' },
        },
      },
      body: {
        type: 'object',
        properties: {
          name: { type: 'string' },
          port: { type: 'integer' },
          snmpCommunity: { type: 'string' },
          snmpPort: { type: 'integer' },
          location: { type: 'string' },
          latitude: { type: 'string' },
          longitude: { type: 'string' },
          enableSnmp: { type: 'boolean' },
          enableRest: { type: 'boolean' },
          enableNetflow: { type: 'boolean' },
          tags: { type: 'array', items: { type: 'string' } },
          notes: { type: 'string' },
        },
      },
    },
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    const user = (request as any).user;
    const params = request.params as { id: string };
    const body = request.body as any;

    const router = await db.query.routers.findFirst({
      where: and(
        eq(routers.id, params.id),
        eq(routers.organizationId, user.organizationId),
      ),
    });

    if (!router) {
      return reply.status(404).send({
        success: false,
        error: 'Router not found',
      });
    }

    await db.update(routers)
      .set({
        ...body,
        updatedAt: new Date(),
      })
      .where(eq(routers.id, router.id));

    await invalidateRouterCache(router.id);

    return reply.send({
      success: true,
      message: 'Router updated',
    });
  });

  /**
   * Delete router
   */
  fastify.delete('/:id', {
    onRequest: [fastify.authenticate],
    schema: {
      description: 'Delete router',
      tags: ['Routers'],
      params: {
        type: 'object',
        required: ['id'],
        properties: {
          id: { type: 'string', format: 'uuid' },
        },
      },
    },
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    const user = (request as any).user;
    const params = request.params as { id: string };

    const router = await db.query.routers.findFirst({
      where: and(
        eq(routers.id, params.id),
        eq(routers.organizationId, user.organizationId),
      ),
    });

    if (!router) {
      return reply.status(404).send({
        success: false,
        error: 'Router not found',
      });
    }

    await db.delete(routers).where(eq(routers.id, router.id));
    await invalidateRouterCache(router.id);

    return reply.send({
      success: true,
      message: 'Router deleted',
    });
  });

  /**
   * Execute command on router
   */
  fastify.post('/:id/command', {
    onRequest: [fastify.authenticate],
    schema: {
      description: 'Execute command on router',
      tags: ['Routers'],
      params: {
        type: 'object',
        required: ['id'],
        properties: {
          id: { type: 'string', format: 'uuid' },
        },
      },
      body: {
        type: 'object',
        required: ['command'],
        properties: {
          command: { type: 'string' },
          commandType: { type: 'string' },
          parameters: { type: 'object' },
        },
      },
    },
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    const user = (request as any).user;
    const params = request.params as { id: string };
    const body = request.body as { command: string; commandType?: string; parameters?: Record<string, unknown> };

    const router = await db.query.routers.findFirst({
      where: and(
        eq(routers.id, params.id),
        eq(routers.organizationId, user.organizationId),
      ),
    });

    if (!router) {
      return reply.status(404).send({
        success: false,
        error: 'Router not found',
      });
    }

    const result = await routerService.executeCommand(
      router.id,
      body.command,
      user.userId,
      body.commandType,
      body.parameters
    );

    return reply.send({
      success: !result.error,
      data: result.data,
      error: result.error,
      executionTime: result.executionTime,
    });
  });
}

export default routerRoutes;
