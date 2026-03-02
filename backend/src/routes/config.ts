/**
 * Configuration Routes
 * Handles CRUD operations for Zones, Packages, Boxes, and Client Types
 */

import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { db } from '../db/index.js';
import { zones, subZones, packages, boxes, clientTypes } from '../db/schema.config.js';
import { eq, and, desc, asc, like, sql, isNull } from 'drizzle-orm';
import { logger } from '../utils/logger.js';
import { z } from 'zod';

// ============================================================================
// ZONES
// ============================================================================

const zoneSchema = z.object({
  name: z.string().min(1).max(100),
  slug: z.string().min(1).max(50),
  description: z.string().optional(),
  parentId: z.string().uuid().optional(),
  status: z.enum(['active', 'inactive', 'maintenance']).default('active'),
  isPrimary: z.boolean().default(false),
  location: z.object({
    lat: z.number().nullable(),
    lng: z.number().nullable(),
  }).optional(),
  address: z.string().optional(),
  timezone: z.string().default('UTC'),
});

export async function zoneRoutes(fastify: FastifyInstance): Promise<void> {
  /**
   * Get all zones (flat list)
   */
  fastify.get('/zones', {
    onRequest: [fastify.authenticate],
    schema: {
      description: 'List all zones',
      tags: ['Configuration'],
      querystring: {
        type: 'object',
        properties: {
          status: { type: 'string', enum: ['active', 'inactive', 'maintenance'] },
          parentId: { type: 'string', format: 'uuid' },
          limit: { type: 'integer', minimum: 1, maximum: 100, default: 50 },
          offset: { type: 'integer', minimum: 0, default: 0 },
        },
      },
    },
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    const user = (request as any).user;
    const query = request.query as {
      status?: string;
      parentId?: string;
      limit?: number;
      offset?: number;
    };

    const conditions = [eq(zones.organizationId, user.organizationId)];
    if (query.status) conditions.push(eq(zones.status, query.status as any));
    if (query.parentId) conditions.push(eq(zones.parentId, query.parentId));
    else conditions.push(isNull(zones.parentId));

    const zonesList = await db.select()
      .from(zones)
      .where(and(...conditions))
      .orderBy(asc(zones.name))
      .limit(query.limit || 50)
      .offset(query.offset || 0);

    return reply.send({
      success: true,
      data: zonesList,
    });
  });

  /**
   * Get zone tree (hierarchical)
   */
  fastify.get('/zones/tree', {
    onRequest: [fastify.authenticate],
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    const user = (request as any).user;

    const allZones = await db.select()
      .from(zones)
      .where(eq(zones.organizationId, user.organizationId))
      .orderBy(asc(zones.level), asc(zones.name));

    const buildTree = (parentId: string | null = null): any[] => {
      return allZones
        .filter(z => (z.parentId || null) === parentId)
        .map(zone => ({
          ...zone,
          children: buildTree(zone.id),
        }));
    };

    return reply.send({
      success: true,
      data: buildTree(),
    });
  });

  /**
   * Create zone
   */
  fastify.post('/zones', {
    onRequest: [fastify.authenticate],
    schema: {
      description: 'Create a new zone',
      tags: ['Configuration'],
      body: zoneSchema,
    },
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    const user = (request as any).user;
    const data = zoneSchema.parse(request.body);

    const [zone] = await db.insert(zones).values({
      name: data.name,
      slug: data.slug,
      description: data.description,
      parentId: data.parentId,
      status: data.status,
      isPrimary: data.isPrimary,
      location: data.location as any,
      address: data.address,
      timezone: data.timezone,
      organizationId: user.organizationId,
      path: '/' + crypto.randomUUID(),
      level: data.parentId ? await getZoneLevel(data.parentId) + 1 : 0,
      totalClients: 0,
      totalRevenue: '0',
    }).returning();

    await db.update(zones)
      .set({ path: '/' + zone.id })
      .where(eq(zones.id, zone.id));

    const updatedZone = await db.select().from(zones).where(eq(zones.id, zone.id)).then(r => r[0]);

    return reply.send({
      success: true,
      data: zone,
    });
  });

  /**
   * Update zone
   */
  fastify.put('/zones/:id', {
    onRequest: [fastify.authenticate],
    schema: {
      description: 'Update a zone',
      tags: ['Configuration'],
      params: z.object({ id: z.string().uuid() }),
      body: zoneSchema.partial(),
    },
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = request.params as { id: string };
    const data = zoneSchema.partial().parse(request.body);

    const [zone] = await db.update(zones)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(zones.id, id))
      .returning();

    return reply.send({
      success: true,
      data: zone,
    });
  });

  /**
   * Delete zone
   */
  fastify.delete('/zones/:id', {
    onRequest: [fastify.authenticate],
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = request.params as { id: string };

    await db.delete(zones).where(eq(zones.id, id));

    return reply.send({ success: true });
  });
}

async function getZonePath(zoneId: string): Promise<string> {
  const zone = await db.select({ path: zones.path }).from(zones).where(eq(zones.id, zoneId)).then(r => r[0]);
  return zone?.path || '';
}

async function getZoneLevel(zoneId: string): Promise<number> {
  const zone = await db.select({ level: zones.level }).from(zones).where(eq(zones.id, zoneId)).then(r => r[0]);
  return zone?.level || 0;
}

// ============================================================================
// SUB-ZONES
// ============================================================================

const subZoneSchema = z.object({
  zoneId: z.string().uuid(),
  name: z.string().min(1).max(100),
  code: z.string().min(1).max(20),
  description: z.string().optional(),
  status: z.enum(['active', 'inactive', 'maintenance']).default('active'),
});

export async function subZoneRoutes(fastify: FastifyInstance): Promise<void> {
  fastify.get('/', {
    onRequest: [fastify.authenticate],
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    const { zoneId } = request.query as { zoneId?: string };
    const conditions = [];
    if (zoneId) conditions.push(eq(subZones.zoneId, zoneId));

    const list = await db.select()
      .from(subZones)
      .where(conditions.length ? and(...conditions) : undefined)
      .orderBy(asc(subZones.name));

    return reply.send({ success: true, data: list });
  });

  fastify.post('/', {
    onRequest: [fastify.authenticate],
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    const data = subZoneSchema.parse(request.body);
    const [subZone] = await db.insert(subZones).values(data).returning();
    return reply.send({ success: true, data: subZone });
  });

  fastify.put('/:id', {
    onRequest: [fastify.authenticate],
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = request.params as { id: string };
    const data = subZoneSchema.partial().parse(request.body);
    const [subZone] = await db.update(subZones)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(subZones.id, id))
      .returning();
    return reply.send({ success: true, data: subZone });
  });

  fastify.delete('/:id', {
    onRequest: [fastify.authenticate],
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = request.params as { id: string };
    await db.delete(subZones).where(eq(subZones.id, id));
    return reply.send({ success: true });
  });
}

// ============================================================================
// PACKAGES
// ============================================================================

const packageSchema = z.object({
  name: z.string().min(1).max(100),
  slug: z.string().min(1).max(50),
  description: z.string().optional(),
  type: z.enum(['internet', 'bundle', 'add_on']),
  downloadSpeed: z.number().int().positive(),
  uploadSpeed: z.number().int().positive(),
  burstLimit: z.number().int().optional(),
  dataCap: z.number().optional(),
  fairUsageLimit: z.number().optional(),
  monthlyPrice: z.number().positive(),
  setupFee: z.number().default(0),
  currency: z.string().length(3).default('USD'),
  features: z.array(z.string()).default([]),
  isHighlighted: z.boolean().default(false),
  isActive: z.boolean().default(true),
  sortOrder: z.number().int().default(0),
  validityDays: z.number().int().default(30),
  zoneId: z.string().uuid().optional(),
});

export async function packageRoutes(fastify: FastifyInstance): Promise<void> {
  fastify.get('/', {
    onRequest: [fastify.authenticate],
    schema: {
      tags: ['Configuration'],
      querystring: {
        type: 'object',
        properties: {
          zoneId: { type: 'string', format: 'uuid' },
          type: { type: 'string', enum: ['internet', 'bundle', 'add_on'] },
          isActive: { type: 'boolean' },
        },
      },
    },
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    const user = (request as any).user;
    const query = request.query as {
      zoneId?: string;
      type?: string;
      isActive?: boolean;
    };

    const conditions = [eq(packages.organizationId, user.organizationId)];
    if (query.zoneId) conditions.push(eq(packages.zoneId, query.zoneId));
    if (query.type) conditions.push(eq(packages.type, query.type as any));
    if (query.isActive !== undefined) conditions.push(eq(packages.isActive, query.isActive));

    const list = await db.select()
      .from(packages)
      .where(and(...conditions))
      .orderBy(asc(packages.sortOrder), asc(packages.name));

    return reply.send({ success: true, data: list });
  });

  fastify.post('/', {
    onRequest: [fastify.authenticate],
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    const user = (request as any).user;
    const data = packageSchema.parse(request.body);
    const [pkg] = await db.insert(packages)
      .values({
        ...data,
        organizationId: user.organizationId,
        monthlyPrice: String(data.monthlyPrice),
        setupFee: data.setupFee ? String(data.setupFee) : '0',
      })
      .returning();
    return reply.send({ success: true, data: pkg });
  });

  fastify.put('/:id', {
    onRequest: [fastify.authenticate],
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = request.params as { id: string };
    const data = packageSchema.partial().parse(request.body);
    const updateData: any = { ...data, updatedAt: new Date() };
    if (data.monthlyPrice) updateData.monthlyPrice = String(data.monthlyPrice);
    if (data.setupFee) updateData.setupFee = String(data.setupFee);
    const [pkg] = await db.update(packages)
      .set(updateData)
      .where(eq(packages.id, id))
      .returning();
    return reply.send({ success: true, data: pkg });
  });

  fastify.delete('/:id', {
    onRequest: [fastify.authenticate],
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = request.params as { id: string };
    await db.delete(packages).where(eq(packages.id, id));
    return reply.send({ success: true });
  });
}

// ============================================================================
// BOXES
// ============================================================================

const boxSchema = z.object({
  name: z.string().min(1).max(100),
  type: z.enum(['ONU', 'ONT', 'CPE', 'Router', 'Switch', 'OLT']),
  model: z.string().optional(),
  manufacturer: z.string().optional(),
  specs: z.object({}).optional(),
  unitCost: z.number().optional(),
  stockQuantity: z.number().int().default(0),
  minStock: z.number().int().default(5),
  defaultProfile: z.string().optional(),
  autoProvision: z.boolean().default(false),
  isActive: z.boolean().default(true),
});

export async function boxRoutes(fastify: FastifyInstance): Promise<void> {
  fastify.get('/', {
    onRequest: [fastify.authenticate],
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    const user = (request as any).user;
    const { type, isActive } = request.query as { type?: string; isActive?: boolean };

    const conditions = [eq(boxes.organizationId, user.organizationId)];
    if (type) conditions.push(eq(boxes.type, type as any));
    if (isActive !== undefined) conditions.push(eq(boxes.isActive, isActive));

    const list = await db.select()
      .from(boxes)
      .where(and(...conditions))
      .orderBy(asc(boxes.name));

    return reply.send({ success: true, data: list });
  });

  fastify.post('/', {
    onRequest: [fastify.authenticate],
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    const user = (request as any).user;
    const data = boxSchema.parse(request.body);
    const insertData: any = { ...data, organizationId: user.organizationId };
    if (data.unitCost !== undefined) insertData.unitCost = String(data.unitCost);
    const [box] = await db.insert(boxes).values(insertData).returning();
    return reply.send({ success: true, data: box });
  });

  fastify.put('/:id', {
    onRequest: [fastify.authenticate],
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = request.params as { id: string };
    const data = boxSchema.partial().parse(request.body);
    const updateData: any = { ...data, updatedAt: new Date() };
    if (data.unitCost !== undefined) updateData.unitCost = String(data.unitCost);
    const [box] = await db.update(boxes)
      .set(updateData)
      .where(eq(boxes.id, id))
      .returning();
    return reply.send({ success: true, data: box });
  });

  fastify.delete('/:id', {
    onRequest: [fastify.authenticate],
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = request.params as { id: string };
    await db.delete(boxes).where(eq(boxes.id, id));
    return reply.send({ success: true });
  });
}

// ============================================================================
// CLIENT TYPES
// ============================================================================

const clientTypeSchema = z.object({
  name: z.string().min(1).max(50),
  slug: z.string().min(1).max(30),
  category: z.enum(['residential', 'commercial', 'enterprise', 'hotspot', 'isp']),
  description: z.string().optional(),
  defaultPackageId: z.string().uuid().optional(),
  defaultBoxId: z.string().uuid().optional(),
  defaultProfile: z.string().optional(),
  billingCycle: z.string().default('monthly'),
  paymentTerms: z.number().int().default(0),
  portalAccess: z.boolean().default(true),
  selfService: z.boolean().default(false),
  maxDevices: z.number().int().default(1),
  allowMultipleConnections: z.boolean().default(false),
  isDefault: z.boolean().default(false),
  isActive: z.boolean().default(true),
});

export async function clientTypeRoutes(fastify: FastifyInstance): Promise<void> {
  fastify.get('/', {
    onRequest: [fastify.authenticate],
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    const user = (request as any).user;
    const { category, isActive } = request.query as { category?: string; isActive?: boolean };

    const conditions = [eq(clientTypes.organizationId, user.organizationId)];
    if (category) conditions.push(eq(clientTypes.category, category as any));
    if (isActive !== undefined) conditions.push(eq(clientTypes.isActive, isActive));

    const list = await db.select()
      .from(clientTypes)
      .where(and(...conditions))
      .orderBy(asc(clientTypes.name));

    return reply.send({ success: true, data: list });
  });

  fastify.post('/', {
    onRequest: [fastify.authenticate],
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    const user = (request as any).user;
    const data = clientTypeSchema.parse(request.body);
    const [clientType] = await db.insert(clientTypes)
      .values({ ...data, organizationId: user.organizationId })
      .returning();
    return reply.send({ success: true, data: clientType });
  });

  fastify.put('/:id', {
    onRequest: [fastify.authenticate],
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = request.params as { id: string };
    const data = clientTypeSchema.partial().parse(request.body);
    const [clientType] = await db.update(clientTypes)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(clientTypes.id, id))
      .returning();
    return reply.send({ success: true, data: clientType });
  });

  fastify.delete('/:id', {
    onRequest: [fastify.authenticate],
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = request.params as { id: string };
    await db.delete(clientTypes).where(eq(clientTypes.id, id));
    return reply.send({ success: true });
  });
}
