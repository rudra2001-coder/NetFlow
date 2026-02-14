/**
 * PPP User Management Routes
 * Handles PPP secrets, active connections, and user operations
 */

import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { z } from 'zod';
import { v4 as uuidv4 } from 'uuid';
import { routerService } from '../services/router.js';
import { db } from '../db/index.js';
import { pppSecrets, pppActive, routers } from '../db/schema.js';
import { eq, and, desc } from 'drizzle-orm';
import { logger } from '../utils/logger.js';

export async function pppRoutes(fastify: FastifyInstance): Promise<void> {
  /**
   * List PPP users for a router
   */
  fastify.get('/secrets/:routerId', {
    onRequest: [fastify.authenticate],
    schema: {
      description: 'List PPP secrets for a router',
      tags: ['PPP'],
      params: {
        type: 'object',
        required: ['routerId'],
        properties: {
          routerId: { type: 'string', format: 'uuid' },
        },
      },
      querystring: {
        type: 'object',
        properties: {
          status: { type: 'string', enum: ['active', 'disabled', 'expired', 'suspended'] },
          search: { type: 'string' },
          limit: { type: 'integer', default: 50 },
          offset: { type: 'integer', default: 0 },
        },
      },
    },
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    const user = (request as any).user;
    const params = request.params as { routerId: string };
    const query = request.query as { status?: string; search?: string; limit?: number; offset?: number };

    // Verify router access
    const router = await db.query.routers.findFirst({
      where: and(
        eq(routers.id, params.routerId),
        eq(routers.organizationId, user.organizationId),
      ),
    });

    if (!router) {
      return reply.status(404).send({ success: false, error: 'Router not found' });
    }

    const secrets = await db.query.pppSecrets.findMany({
      where: eq(pppSecrets.routerId, params.routerId),
      limit: query.limit || 50,
      offset: query.offset || 0,
      orderBy: (secrets, { desc }) => [desc(secrets.createdAt)],
    });

    return reply.send({
      success: true,
      data: secrets,
      pagination: { limit: query.limit || 50, offset: query.offset || 0 },
    });
  });

  /**
   * Get single PPP user
   */
  fastify.get('/secrets/:routerId/:id', {
    onRequest: [fastify.authenticate],
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    const params = request.params as { routerId: string; id: string };

    const secret = await db.query.pppSecrets.findFirst({
      where: and(
        eq(pppSecrets.id, params.id),
        eq(pppSecrets.routerId, params.routerId),
      ),
    });

    if (!secret) {
      return reply.status(404).send({ success: false, error: 'PPP secret not found' });
    }

    return reply.send({ success: true, data: secret });
  });

  /**
   * Add PPP user
   */
  fastify.post('/secrets/:routerId', {
    onRequest: [fastify.authenticate],
    schema: {
      description: 'Add PPP secret',
      tags: ['PPP'],
      body: {
        type: 'object',
        required: ['name', 'password'],
        properties: {
          name: { type: 'string', minLength: 1 },
          password: { type: 'string', minLength: 1 },
          service: { type: 'string', default: 'any' },
          profile: { type: 'string' },
          remoteAddress: { type: 'string' },
          localAddress: { type: 'string' },
          callerId: { type: 'string' },
          limitBytesIn: { type: 'integer' },
          limitBytesOut: { type: 'integer' },
          limitBytesTotal: { type: 'integer' },
          expiryDate: { type: 'string', format: 'date-time' },
          customerId: { type: 'string' },
          billingPlan: { type: 'string' },
          notes: { type: 'string' },
        },
      },
    },
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    const user = (request as any).user;
    const params = request.params as { routerId: string };
    const body = request.body as any;

    const router = await db.query.routers.findFirst({
      where: and(
        eq(routers.id, params.routerId),
        eq(routers.organizationId, user.organizationId),
      ),
    });

    if (!router) {
      return reply.status(404).send({ success: false, error: 'Router not found' });
    }

    try {
      // Add to router
      const result = await routerService.addPppUser(router.id, {
        name: body.name,
        password: body.password,
        profile: body.profile,
        remoteAddress: body.remoteAddress,
      });

      if (!result.success) {
        return reply.status(400).send({ success: false, error: result.error });
      }

      // Save to database
      const secretId = uuidv4();
      await db.insert(pppSecrets).values({
        id: secretId,
        routerId: router.id,
        name: body.name,
        password: body.password,
        service: body.service || 'any',
        profile: body.profile,
        remoteAddress: body.remoteAddress,
        localAddress: body.localAddress,
        callerId: body.callerId,
        limitBytesIn: body.limitBytesIn ? BigInt(body.limitBytesIn) : undefined,
        limitBytesOut: body.limitBytesOut ? BigInt(body.limitBytesOut) : undefined,
        limitBytesTotal: body.limitBytesTotal ? BigInt(body.limitBytesTotal) : undefined,
        expiryDate: body.expiryDate ? new Date(body.expiryDate) : undefined,
        customerId: body.customerId,
        billingPlan: body.billingPlan,
        notes: body.notes,
        status: 'active',
        syncStatus: 'synced',
      } as any);

      return reply.status(201).send({ success: true, id: secretId });
    } catch (error) {
      logger.error({ error }, 'Failed to add PPP secret');
      return reply.status(500).send({ success: false, error: 'Failed to add PPP secret' });
    }
  });

  /**
   * Update PPP user
   */
  fastify.put('/secrets/:routerId/:id', {
    onRequest: [fastify.authenticate],
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    const params = request.params as { routerId: string; id: string };
    const body = request.body as any;

    const secret = await db.query.pppSecrets.findFirst({
      where: and(
        eq(pppSecrets.id, params.id),
        eq(pppSecrets.routerId, params.routerId),
      ),
    });

    if (!secret) {
      return reply.status(404).send({ success: false, error: 'PPP secret not found' });
    }

    // Update on router
    const result = await routerService.updatePppUser(secret.routerId, params.id, {
      name: body.name,
      password: body.password,
      profile: body.profile,
    });

    // Update in database
    await db.update(pppSecrets)
      .set({
        name: body.name,
        password: body.password,
        profile: body.profile,
        remoteAddress: body.remoteAddress,
        localAddress: body.localAddress,
        callerId: body.callerId,
        limitBytesIn: body.limitBytesIn ? Number(body.limitBytesIn) : undefined,
        limitBytesOut: body.limitBytesOut ? Number(body.limitBytesOut) : undefined,
        limitBytesTotal: body.limitBytesTotal ? Number(body.limitBytesTotal) : undefined,
        expiryDate: body.expiryDate ? new Date(body.expiryDate) : undefined,
        customerId: body.customerId,
        billingPlan: body.billingPlan,
        notes: body.notes,
        syncStatus: result.success ? 'synced' : 'error',
        syncError: result.error,
        updatedAt: new Date(),
      })
      .where(eq(pppSecrets.id, params.id));

    return reply.send({ success: true, message: 'PPP secret updated' });
  });

  /**
   * Suspend PPP user
   */
  fastify.post('/secrets/:routerId/:id/suspend', {
    onRequest: [fastify.authenticate],
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    const params = request.params as { routerId: string; id: string };

    const secret = await db.query.pppSecrets.findFirst({
      where: and(
        eq(pppSecrets.id, params.id),
        eq(pppSecrets.routerId, params.routerId),
      ),
    });

    if (!secret) {
      return reply.status(404).send({ success: false, error: 'PPP secret not found' });
    }

    const result = await routerService.suspendPppUser(secret.routerId, params.id);

    await db.update(pppSecrets)
      .set({
        status: 'suspended',
        syncStatus: result.success ? 'synced' : 'error',
        syncError: result.error,
      })
      .where(eq(pppSecrets.id, params.id));

    return reply.send({ success: result.success, error: result.error });
  });

  /**
   * Unsuspend PPP user
   */
  fastify.post('/secrets/:routerId/:id/unsuspend', {
    onRequest: [fastify.authenticate],
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    const params = request.params as { routerId: string; id: string };

    const secret = await db.query.pppSecrets.findFirst({
      where: and(
        eq(pppSecrets.id, params.id),
        eq(pppSecrets.routerId, params.routerId),
      ),
    });

    if (!secret) {
      return reply.status(404).send({ success: false, error: 'PPP secret not found' });
    }

    const result = await routerService.unsuspendPppUser(secret.routerId, params.id);

    await db.update(pppSecrets)
      .set({
        status: 'active',
        syncStatus: result.success ? 'synced' : 'error',
        syncError: result.error,
      })
      .where(eq(pppSecrets.id, params.id));

    return reply.send({ success: result.success, error: result.error });
  });

  /**
   * Delete PPP user
   */
  fastify.delete('/secrets/:routerId/:id', {
    onRequest: [fastify.authenticate],
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    const params = request.params as { routerId: string; id: string };

    const secret = await db.query.pppSecrets.findFirst({
      where: and(
        eq(pppSecrets.id, params.id),
        eq(pppSecrets.routerId, params.routerId),
      ),
    });

    if (!secret) {
      return reply.status(404).send({ success: false, error: 'PPP secret not found' });
    }

    const result = await routerService.deletePppUser(secret.routerId, params.id);

    await db.delete(pppSecrets).where(eq(pppSecrets.id, params.id));

    return reply.send({ success: true, message: 'PPP secret deleted' });
  });

  /**
   * Get active PPP connections
   */
  fastify.get('/active/:routerId', {
    onRequest: [fastify.authenticate],
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    const params = request.params as { routerId: string };

    const connections = await routerService.getPppActive(params.routerId);

    return reply.send({ success: true, data: connections });
  });

  /**
   * Bulk import PPP users
   */
  fastify.post('/import/:routerId', {
    onRequest: [fastify.authenticate],
    schema: {
      description: 'Bulk import PPP users',
      tags: ['PPP'],
      body: {
        type: 'object',
        required: ['users'],
        properties: {
          users: {
            type: 'array',
            items: {
              type: 'object',
              required: ['name', 'password'],
              properties: {
                name: { type: 'string' },
                password: { type: 'string' },
                profile: { type: 'string' },
                remoteAddress: { type: 'string' },
                customerId: { type: 'string' },
                billingPlan: { type: 'string' },
              },
            },
          },
        },
      },
    },
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    const user = (request as any).user;
    const params = request.params as { routerId: string };
    const body = request.body as { users: any[] };

    const router = await db.query.routers.findFirst({
      where: and(
        eq(routers.id, params.routerId),
        eq(routers.organizationId, user.organizationId),
      ),
    });

    if (!router) {
      return reply.status(404).send({ success: false, error: 'Router not found' });
    }

    const results = {
      success: 0,
      failed: 0,
      errors: [] as string[],
    };

    for (const userData of body.users) {
      try {
        const result = await routerService.addPppUser(router.id, {
          name: userData.name,
          password: userData.password,
          profile: userData.profile,
          remoteAddress: userData.remoteAddress,
        });

        if (result.success) {
          const secretId = uuidv4();
          await db.insert(pppSecrets).values({
            id: secretId,
            routerId: router.id,
            name: userData.name,
            password: userData.password,
            profile: userData.profile,
            remoteAddress: userData.remoteAddress,
            customerId: userData.customerId,
            billingPlan: userData.billingPlan,
            status: 'active',
            syncStatus: 'synced',
          } as any);
          results.success++;
        } else {
          results.failed++;
          results.errors.push(`${userData.name}: ${result.error}`);
        }
      } catch (error) {
        results.failed++;
        results.errors.push(`${userData.name}: ${error}`);
      }
    }

    return reply.send({ success: true, results });
  });
}

export default pppRoutes;
