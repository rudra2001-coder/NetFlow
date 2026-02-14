/**
 * Dashboard Routes
 * Provides aggregated data for dashboard and analytics
 */

import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { db } from '../db/index.js';
import { routers, pppActive, hotspotActive, pppSecrets, interfaceStats, systemResources } from '../db/schema.js';
import { eq, and, gte, sql } from 'drizzle-orm';
import { routerService } from '../services/router.js';
import { logger } from '../utils/logger.js';

export async function dashboardRoutes(fastify: FastifyInstance): Promise<void> {
  /**
   * Get dashboard overview
   */
  fastify.get('/overview', {
    onRequest: [fastify.authenticate],
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    const user = (request as any).user;
    const orgId = user.organizationId;

    try {
      // Get router statistics
      const routerStats = await db
        .select({
          total: sql<number>`count(*)`,
          online: sql<number>`sum(case when ${routers.status} = 'online' then 1 else 0 end)`,
          offline: sql<number>`sum(case when ${routers.status} = 'offline' then 1 else 0 end)`,
          warning: sql<number>`sum(case when ${routers.status} = 'warning' then 1 else 0 end)`,
        })
        .from(routers)
        .where(eq(routers.organizationId, orgId))
        .then(r => r[0]);

      // Get PPP statistics
      const pppStats = await db
        .select({
          total: sql<number>`count(*)`,
          active: sql<number>`sum(case when ${pppSecrets.status} = 'active' then 1 else 0 end)`,
          suspended: sql<number>`sum(case when ${pppSecrets.status} = 'suspended' then 1 else 0 end)`,
          expired: sql<number>`sum(case when ${pppSecrets.status} = 'expired' then 1 else 0 end)`,
        })
        .from(pppSecrets)
        .innerJoin(routers, eq(pppSecrets.routerId, routers.id))
        .where(eq(routers.organizationId, orgId))
        .then(r => r[0]);

      // Get active connections count
      const activeConnections = await db
        .select({
          ppp: sql<number>`count(*)`,
        })
        .from(pppActive)
        .innerJoin(routers, eq(pppActive.routerId, routers.id))
        .where(eq(routers.organizationId, orgId))
        .then(r => r[0]);

      const hotspotConnections = await db
        .select({
          hotspot: sql<number>`count(*)`,
        })
        .from(hotspotActive)
        .innerJoin(routers, eq(hotspotActive.routerId, routers.id))
        .where(eq(routers.organizationId, orgId))
        .then(r => r[0]);

      return reply.send({
        success: true,
        data: {
          routers: routerStats,
          ppp: {
            ...pppStats,
            activeConnections: activeConnections?.ppp || 0,
          },
          hotspot: {
            activeUsers: hotspotConnections?.hotspot || 0,
          },
        },
      });
    } catch (error) {
      logger.error({ error }, 'Failed to get dashboard overview');
      return reply.status(500).send({ success: false, error: 'Failed to get dashboard data' });
    }
  });

  /**
   * Get router status summary
   */
  fastify.get('/router-status', {
    onRequest: [fastify.authenticate],
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    const user = (request as any).user;

    const routersList = await db.query.routers.findMany({
      where: eq(routers.organizationId, user.organizationId),
      columns: {
        id: true,
        name: true,
        ipAddress: true,
        status: true,
        location: true,
        lastSeenAt: true,
        model: true,
      },
      orderBy: (routers, { asc }) => [asc(routers.name)],
    });

    return reply.send({ success: true, data: routersList });
  });

  /**
   * Get recent alerts
   */
  fastify.get('/alerts', {
    onRequest: [fastify.authenticate],
    schema: {
      querystring: {
        type: 'object',
        properties: {
          limit: { type: 'integer', default: 20 },
          hours: { type: 'integer', default: 24 },
        },
      },
    },
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    const user = (request as any).user;
    const query = request.query as { limit?: number; hours?: number };

    const since = new Date(Date.now() - (query.hours || 24) * 60 * 60 * 1000);

    // Get routers with issues
    const offlineRouters = await db.query.routers.findMany({
      where: and(
        eq(routers.organizationId, user.organizationId),
        sql`${routers.status} != 'online'`,
        gte(routers.updatedAt, since),
      ),
      columns: {
        id: true,
        name: true,
        ipAddress: true,
        status: true,
        lastError: true,
        lastCheckAt: true,
      },
      limit: query.limit || 20,
    });

    return reply.send({
      success: true,
      data: offlineRouters.map(r => ({
        type: 'router_offline',
        router: r.name,
        ip: r.ipAddress,
        status: r.status,
        message: r.lastError,
        timestamp: r.lastCheckAt,
      })),
    });
  });

  /**
   * Get traffic summary
   */
  fastify.get('/traffic', {
    onRequest: [fastify.authenticate],
    schema: {
      querystring: {
        type: 'object',
        properties: {
          routerId: { type: 'string', format: 'uuid' },
          hours: { type: 'integer', default: 24 },
        },
      },
    },
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    const user = (request as any).user;
    const query = request.query as { routerId?: string; hours?: number };

    // This would use TimescaleDB for actual traffic data
    // Simplified for now
    return reply.send({
      success: true,
      data: {
        totalBytesIn: 0,
        totalBytesOut: 0,
        peakTime: new Date(),
        averageLoad: 0,
      },
    });
  });

  /**
   * Get bandwidth usage
   */
  fastify.get('/bandwidth', {
    onRequest: [fastify.authenticate],
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    const user = (request as any).user;

    // Get latest interface stats for all routers
    const routersList = await db.query.routers.findMany({
      where: eq(routers.organizationId, user.organizationId),
      columns: { id: true, name: true },
    });

    const bandwidthData = await Promise.all(
      routersList.map(async (router) => {
        const latest = await db.query.interfaceStats.findFirst({
          where: eq(interfaceStats.routerId, router.id),
          orderBy: (stats, { desc }) => [desc(stats.collectedAt)],
        });
        return {
          routerId: router.id,
          routerName: router.name,
          interface: latest?.interfaceName,
          rxBytes: latest?.rxBytes,
          txBytes: latest?.txBytes,
        };
      })
    );

    return reply.send({ success: true, data: bandwidthData });
  });

  /**
   * Get PPP active connections
   */
  fastify.get('/ppp-active', {
    onRequest: [fastify.authenticate],
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    const user = (request as any).user;

    const connections = await db.query.pppActive.findMany({
      where: (pppActive, { inArray }) => 
        inArray(pppActive.routerId,
          db.select({ id: routers.id }).from(routers)
            .where(eq(routers.organizationId, user.organizationId))
        ),
      with: {
        router: {
          columns: { name: true },
        },
      },
      orderBy: (pppActive, { desc }) => [desc(pppActive.connectedAt)],
      limit: 100,
    });

    return reply.send({ success: true, data: connections });
  });

  /**
   * Get hotspot active users
   */
  fastify.get('/hotspot-active', {
    onRequest: [fastify.authenticate],
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    const user = (request as any).user;

    const users = await db.query.hotspotActive.findMany({
      where: (hotspotActive, { inArray }) =>
        inArray(hotspotActive.routerId,
          db.select({ id: routers.id }).from(routers)
            .where(eq(routers.organizationId, user.organizationId))
        ),
      with: {
        router: {
          columns: { name: true },
        },
      },
      orderBy: (hotspotActive, { desc }) => [desc(hotspotActive.connectedAt)],
      limit: 100,
    });

    return reply.send({ success: true, data: users });
  });

  /**
   * Get system resources overview
   */
  fastify.get('/resources', {
    onRequest: [fastify.authenticate],
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    const user = (request as any).user;

    const resources = await Promise.all(
      (await db.query.routers.findMany({
        where: eq(routers.organizationId, user.organizationId),
        columns: { id: true, name: true },
      })).map(async (router) => {
        const latest = await db.query.systemResources.findFirst({
          where: eq(systemResources.routerId, router.id),
          orderBy: (resources, { desc }) => [desc(resources.collectedAt)],
        });
        return {
          routerId: router.id,
          routerName: router.name,
          cpuLoad: latest?.cpuLoad,
          memoryUsed: latest?.memoryUsed,
          memoryTotal: latest?.memoryTotal,
          uptime: latest?.uptime,
        };
      })
    );

    return reply.send({ success: true, data: resources });
  });
}

export default dashboardRoutes;
