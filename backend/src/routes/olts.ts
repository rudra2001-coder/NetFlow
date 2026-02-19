/**
 * OLT Management Routes
 * Handles CRUD operations for OLTs, PON ports, ONUs, and alarms
 */

import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { oltService } from '../services/olt.js';
import { db } from '../db/index.js';
import { olts, oltPonPorts, onus, oltAlarms } from '../db/schema.js';
import { eq, and, desc, asc } from 'drizzle-orm';
import { logger } from '../utils/logger.js';

// ============================================================================
// ROUTES
// ============================================================================

export async function oltRoutes(fastify: FastifyInstance): Promise<void> {
  /**
   * Get dashboard overview
   */
  fastify.get('/dashboard', {
    onRequest: [fastify.authenticate],
    schema: {
      description: 'Get OLT dashboard overview',
      tags: ['OLT'],
    },
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    const user = (request as any).user;
    
    const overview = await oltService.getDashboardOverview({
      organizationId: user.organizationId,
    });
    
    return reply.send({
      success: true,
      data: overview,
    });
  });

  /**
   * List all OLTs
   */
  fastify.get('/', {
    onRequest: [fastify.authenticate],
    schema: {
      description: 'List all OLTs',
      tags: ['OLT'],
      querystring: {
        type: 'object',
        properties: {
          status: { type: 'string', enum: ['online', 'offline', 'warning', 'error', 'maintenance'] },
          resellerId: { type: 'string', format: 'uuid' },
          limit: { type: 'integer', minimum: 1, maximum: 100, default: 50 },
          offset: { type: 'integer', minimum: 0, default: 0 },
        },
      },
    },
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    const user = (request as any).user;
    const query = request.query as { 
      status?: string; 
      resellerId?: string;
      limit?: number; 
      offset?: number 
    };

    const oltsList = await oltService.getOlts({
      organizationId: user.organizationId,
      resellerId: query.resellerId,
      status: query.status,
    });

    return reply.send({
      success: true,
      data: oltsList,
      pagination: {
        limit: query.limit || 50,
        offset: query.offset || 0,
        total: oltsList.length,
      },
    });
  });

  /**
   * Get single OLT details
   */
  fastify.get('/:id', {
    onRequest: [fastify.authenticate],
    schema: {
      description: 'Get OLT details',
      tags: ['OLT'],
      params: {
        type: 'object',
        required: ['id'],
        properties: {
          id: { type: 'string', format: 'uuid' },
        },
      },
    },
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    const params = request.params as { id: string };

    const olt = await oltService.getOltById(params.id);
    if (!olt) {
      return reply.status(404).send({
        success: false,
        message: 'OLT not found',
      });
    }

    // Get PON ports and stats
    const ponPorts = await oltService.getPonPorts(params.id);
    const stats = await oltService.getOltStats(params.id);

    return reply.send({
      success: true,
      data: {
        ...olt,
        ponPorts,
        stats,
      },
    });
  });

  /**
   * Create new OLT
   */
  fastify.post('/', {
    onRequest: [fastify.authenticate],
    schema: {
      description: 'Create new OLT',
      tags: ['OLT'],
      body: {
        type: 'object',
        required: ['name', 'brand', 'ipAddress'],
        properties: {
          name: { type: 'string', minLength: 1, maxLength: 255 },
          brand: { type: 'string', minLength: 1, maxLength: 100 },
          model: { type: 'string', maxLength: 100 },
          ipAddress: { type: 'string' },
          snmpVersion: { type: 'string', enum: ['v1', 'v2c', 'v3'], default: 'v2c' },
          snmpCommunity: { type: 'string' },
          snmpPort: { type: 'integer', default: 161 },
          location: { type: 'string' },
          resellerId: { type: 'string', format: 'uuid' },
          notes: { type: 'string' },
        },
      },
    },
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    const user = (request as any).user;
    const body = request.body as {
      name: string;
      brand: string;
      model?: string;
      ipAddress: string;
      snmpVersion?: 'v1' | 'v2c' | 'v3';
      snmpCommunity?: string;
      snmpPort?: number;
      location?: string;
      resellerId?: string;
      notes?: string;
    };

    const olt = await oltService.createOlt({
      ...body,
      organizationId: user.organizationId,
    });

    return reply.status(201).send({
      success: true,
      data: olt,
    });
  });

  /**
   * Update OLT
   */
  fastify.patch('/:id', {
    onRequest: [fastify.authenticate],
    schema: {
      description: 'Update OLT',
      tags: ['OLT'],
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
          name: { type: 'string', minLength: 1, maxLength: 255 },
          brand: { type: 'string', minLength: 1, maxLength: 100 },
          model: { type: 'string', maxLength: 100 },
          ipAddress: { type: 'string' },
          status: { type: 'string', enum: ['online', 'offline', 'warning', 'error', 'maintenance'] },
          notes: { type: 'string' },
        },
      },
    },
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    const params = request.params as { id: string };
    const body = request.body as Partial<{
      name: string;
      brand: string;
      model: string;
      ipAddress: string;
      status: 'online' | 'offline' | 'warning' | 'error' | 'maintenance';
      notes: string;
    }>;

    const olt = await oltService.updateOlt(params.id, body);

    return reply.send({
      success: true,
      data: olt,
    });
  });

  /**
   * Delete OLT
   */
  fastify.delete('/:id', {
    onRequest: [fastify.authenticate],
    schema: {
      description: 'Delete OLT',
      tags: ['OLT'],
      params: {
        type: 'object',
        required: ['id'],
        properties: {
          id: { type: 'string', format: 'uuid' },
        },
      },
    },
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    const params = request.params as { id: string };

    await oltService.deleteOlt(params.id);

    return reply.send({
      success: true,
      message: 'OLT deleted successfully',
    });
  });

  /**
   * Get PON ports for OLT
   */
  fastify.get('/:id/pon-ports', {
    onRequest: [fastify.authenticate],
    schema: {
      description: 'Get PON ports for OLT',
      tags: ['OLT'],
      params: {
        type: 'object',
        required: ['id'],
        properties: {
          id: { type: 'string', format: 'uuid' },
        },
      },
    },
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    const params = request.params as { id: string };

    const ponPorts = await oltService.getPonPorts(params.id);

    return reply.send({
      success: true,
      data: ponPorts,
    });
  });

  /**
   * Get ONUs for OLT
   */
  fastify.get('/:id/onus', {
    onRequest: [fastify.authenticate],
    schema: {
      description: 'Get ONUs for OLT',
      tags: ['OLT'],
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
          status: { type: 'string', enum: ['online', 'offline', 'los', 'degraded', 'disabled'] },
        },
      },
    },
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    const params = request.params as { id: string };
    const query = request.query as { status?: string };

    let onuList = await oltService.getOnusByOlt(params.id);
    
    if (query.status) {
      onuList = onuList.filter(o => o.status === query.status);
    }

    return reply.send({
      success: true,
      data: onuList,
    });
  });

  /**
   * Get alarms for OLT
   */
  fastify.get('/:id/alarms', {
    onRequest: [fastify.authenticate],
    schema: {
      description: 'Get alarms for OLT',
      tags: ['OLT'],
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
          resolved: { type: 'boolean', default: false },
          limit: { type: 'integer', default: 100 },
        },
      },
    },
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    const params = request.params as { id: string };
    const query = request.query as { resolved?: boolean; limit?: number };

    const alarms = await oltService.getAlarms(params.id, {
      resolved: query.resolved,
      limit: query.limit,
    });

    return reply.send({
      success: true,
      data: alarms,
    });
  });

  /**
   * Resolve alarm
   */
  fastify.post('/alarms/:alarmId/resolve', {
    onRequest: [fastify.authenticate],
    schema: {
      description: 'Resolve OLT alarm',
      tags: ['OLT'],
      params: {
        type: 'object',
        required: ['alarmId'],
        properties: {
          alarmId: { type: 'string', format: 'uuid' },
        },
      },
      body: {
        type: 'object',
        properties: {
          note: { type: 'string' },
        },
      },
    },
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    const params = request.params as { alarmId: string };
    const body = request.body as { note?: string };
    const user = (request as any).user;

    const alarm = await oltService.resolveAlarm(params.alarmId, user.id, body.note);

    return reply.send({
      success: true,
      data: alarm,
    });
  });

  /**
   * Get metrics for OLT
   */
  fastify.get('/:id/metrics', {
    onRequest: [fastify.authenticate],
    schema: {
      description: 'Get metrics for OLT',
      tags: ['OLT'],
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
          limit: { type: 'integer', default: 100 },
          startTime: { type: 'string', format: 'date-time' },
        },
      },
    },
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    const params = request.params as { id: string };
    const query = request.query as { limit?: number; startTime?: string };

    const metrics = await oltService.getMetrics(params.id, {
      limit: query.limit,
      startTime: query.startTime ? new Date(query.startTime) : undefined,
    });

    return reply.send({
      success: true,
      data: metrics,
    });
  });

  /**
   * Test SNMP connection
   */
  fastify.post('/:id/test-snmp', {
    onRequest: [fastify.authenticate],
    schema: {
      description: 'Test SNMP connection to OLT',
      tags: ['OLT'],
      params: {
        type: 'object',
        required: ['id'],
        properties: {
          id: { type: 'string', format: 'uuid' },
        },
      },
    },
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    const params = request.params as { id: string };

    const result = await oltService.testSnmpConnection(params.id);

    return reply.send({
      success: result.success,
      message: result.message,
    });
  });
}
