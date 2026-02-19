/**
 * Reseller Routes
 * API endpoints for multi-level reseller management
 */

import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { z } from 'zod';
import * as resellerService from '../services/reseller.js';
import { requireAuth, requireRole, getAuthenticatedUser } from '../middleware/permissions.js';

// ============================================================================
// VALIDATION SCHEMAS
// ============================================================================

const createResellerSchema = z.object({
  organizationId: z.string().uuid(),
  userId: z.string().uuid().optional(),
  parentId: z.string().uuid().optional(),
  name: z.string().min(1).max(255),
  companyName: z.string().max(255).optional(),
  email: z.string().email(),
  phone: z.string().max(50).optional(),
  address: z.string().optional(),
  role: z.enum(['admin', 'macro', 'reseller', 'sub_reseller']).optional(),
  commissionType: z.enum(['percentage', 'fixed', 'margin']).optional(),
  commissionValue: z.number().min(0).max(100).optional(),
  marginPercent: z.number().min(0).max(100).optional(),
  fundDependencyEnabled: z.boolean().optional(),
  creditLimit: z.number().min(0).optional(),
  walletBalance: z.number().min(0).optional(),
  status: z.enum(['active', 'suspended', 'inactive', 'pending']).optional(),
  settings: z.record(z.unknown()).optional(),
  notes: z.string().optional(),
});

const updateResellerSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  companyName: z.string().max(255).optional(),
  email: z.string().email().optional(),
  phone: z.string().max(50).optional(),
  address: z.string().optional(),
  role: z.enum(['admin', 'macro', 'reseller', 'sub_reseller']).optional(),
  commissionType: z.enum(['percentage', 'fixed', 'margin']).optional(),
  commissionValue: z.number().min(0).max(100).optional(),
  marginPercent: z.number().min(0).max(100).optional(),
  fundDependencyEnabled: z.boolean().optional(),
  creditLimit: z.number().min(0).optional(),
  walletBalance: z.number().optional(),
  status: z.enum(['active', 'suspended', 'inactive', 'pending']).optional(),
  settings: z.record(z.unknown()).optional(),
  notes: z.string().optional(),
});

const addFundsSchema = z.object({
  amount: z.number().positive(),
  referenceType: z.string().optional(),
  referenceId: z.string().uuid().optional(),
  description: z.string().optional(),
  notes: z.string().optional(),
});

const deductFundsSchema = z.object({
  amount: z.number().positive(),
  type: z.enum(['debit', 'package_sale', 'commission_paid', 'refund', 'adjustment']).optional(),
  referenceType: z.string().optional(),
  referenceId: z.string().uuid().optional(),
  relatedResellerId: z.string().uuid().optional(),
  description: z.string().optional(),
  notes: z.string().optional(),
});

const commissionSchema = z.object({
  billingPlanId: z.string().uuid().optional(),
  commissionType: z.enum(['percentage', 'fixed', 'margin']).optional(),
  commissionValue: z.number().min(0),
  maxCommission: z.number().min(0).optional(),
  minCommission: z.number().min(0).optional(),
  isActive: z.boolean().optional(),
});

const packageSaleSchema = z.object({
  buyerResellerId: z.string().uuid(),
  amount: z.number().positive(),
  planId: z.string().uuid(),
  referenceId: z.string().uuid().optional(),
  description: z.string().optional(),
});

const listQuerySchema = z.object({
  status: z.enum(['active', 'suspended', 'inactive', 'pending']).optional(),
  parentId: z.string().uuid().optional(),
  limit: z.coerce.number().min(1).max(100).optional().default(50),
  offset: z.coerce.number().min(0).optional().default(0),
});

const transactionsQuerySchema = z.object({
  type: z.enum(['credit', 'debit', 'commission_earned', 'commission_paid', 'package_sale', 'package_cost', 'refund', 'adjustment']).optional(),
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
  limit: z.coerce.number().min(1).max(100).optional().default(50),
  offset: z.coerce.number().min(0).optional().default(0),
});

// ============================================================================
// ROUTES
// ============================================================================

export default async function resellerRoutes(fastify: FastifyInstance) {

  // -------------------------------------------------------------------------
  // RESELLER CRUD
  // -------------------------------------------------------------------------

  /**
   * Create a new reseller
   * POST /api/resellers
   */
  fastify.post('/', {
    schema: { body: createResellerSchema },
    preHandler: [requireAuth, requireRole('org_admin')]
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const user = getAuthenticatedUser(request);
      const input = createResellerSchema.parse(request.body);
      
      // Use user's organization if not specified
      if (!input.organizationId && user) {
        input.organizationId = user.organizationId;
      }
      
      const reseller = await resellerService.createReseller(input);
      return reply.code(201).send(reseller);
    } catch (error: any) {
      request.log.error(error);
      return reply.code(400).send({ error: error.message });
    }
  });

  /**
   * Get reseller by ID
   * GET /api/resellers/:id
   */
  fastify.get('/:id', {
    preHandler: requireAuth
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { id } = request.params as { id: string };
      const reseller = await resellerService.getResellerById(id);
      
      if (!reseller) {
        return reply.code(404).send({ error: 'Reseller not found' });
      }
      
      return reply.send(reseller);
    } catch (error: any) {
      request.log.error(error);
      return reply.code(500).send({ error: error.message });
    }
  });

  /**
   * List resellers
   * GET /api/resellers
   */
  fastify.get('/', {
    schema: { querystring: listQuerySchema },
    preHandler: requireAuth
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const user = getAuthenticatedUser(request);
      if (!user) {
        return reply.code(401).send({ error: 'Unauthorized' });
      }
      
      const { status, parentId, limit, offset } = request.query as any;
      const resellers = await resellerService.getResellersByOrganization(
        user.organizationId,
        { status, parentId, limit, offset }
      );
      
      return reply.send(resellers);
    } catch (error: any) {
      request.log.error(error);
      return reply.code(500).send({ error: error.message });
    }
  });

  /**
   * Update reseller
   * PUT /api/resellers/:id
   */
  fastify.put('/:id', {
    schema: { body: updateResellerSchema },
    preHandler: [requireAuth, requireRole('org_admin')]
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { id } = request.params as { id: string };
      const input = updateResellerSchema.parse(request.body);
      const reseller = await resellerService.updateReseller(id, input);
      
      if (!reseller) {
        return reply.code(404).send({ error: 'Reseller not found' });
      }
      
      return reply.send(reseller);
    } catch (error: any) {
      request.log.error(error);
      return reply.code(400).send({ error: error.message });
    }
  });

  /**
   * Delete reseller
   * DELETE /api/resellers/:id
   */
  fastify.delete('/:id', {
    preHandler: [requireAuth, requireRole('org_admin')]
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { id } = request.params as { id: string };
      await resellerService.deleteReseller(id);
      return reply.code(204).send();
    } catch (error: any) {
      request.log.error(error);
      return reply.code(400).send({ error: error.message });
    }
  });

  // -------------------------------------------------------------------------
  // HIERARCHY
  // -------------------------------------------------------------------------

  /**
   * Get reseller parent
   * GET /api/resellers/:id/parent
   */
  fastify.get('/:id/parent', {
    preHandler: requireAuth
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { id } = request.params as { id: string };
      const parent = await resellerService.getResellerParent(id);
      return reply.send(parent || {});
    } catch (error: any) {
      request.log.error(error);
      return reply.code(500).send({ error: error.message });
    }
  });

  /**
   * Get reseller children
   * GET /api/resellers/:id/children
   */
  fastify.get('/:id/children', {
    preHandler: requireAuth
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { id } = request.params as { id: string };
      const children = await resellerService.getResellerChildren(id);
      return reply.send(children);
    } catch (error: any) {
      request.log.error(error);
      return reply.code(500).send({ error: error.message });
    }
  });

  /**
   * Get full reseller tree
   * GET /api/resellers/:id/tree
   */
  fastify.get('/:id/tree', {
    preHandler: requireAuth
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { id } = request.params as { id: string };
      const tree = await resellerService.getResellerTree(id);
      return reply.send(tree);
    } catch (error: any) {
      request.log.error(error);
      return reply.code(500).send({ error: error.message });
    }
  });

  /**
   * Get all descendants
   * GET /api/resellers/:id/descendants
   */
  fastify.get('/:id/descendants', {
    preHandler: requireAuth
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { id } = request.params as { id: string };
      const descendants = await resellerService.getResellerDescendants(id);
      return reply.send(descendants);
    } catch (error: any) {
      request.log.error(error);
      return reply.code(500).send({ error: error.message });
    }
  });

  // -------------------------------------------------------------------------
  // WALLET OPERATIONS
  // -------------------------------------------------------------------------

  /**
   * Get wallet balance
   * GET /api/resellers/:id/wallet
   */
  fastify.get('/:id/wallet', {
    preHandler: requireAuth
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { id } = request.params as { id: string };
      const balance = await resellerService.getWalletBalance(id);
      return reply.send({ balance });
    } catch (error: any) {
      request.log.error(error);
      return reply.code(500).send({ error: error.message });
    }
  });

  /**
   * Add funds to wallet
   * POST /api/resellers/:id/wallet/credit
   */
  fastify.post('/:id/wallet/credit', {
    schema: { body: addFundsSchema },
    preHandler: [requireAuth, requireRole('org_admin')]
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { id } = request.params as { id: string };
      const user = getAuthenticatedUser(request);
      const input = addFundsSchema.parse(request.body);

      const transaction = await resellerService.addFunds({
        resellerId: id,
        organizationId: user?.organizationId || '',
        type: 'credit',
        amount: input.amount,
        referenceType: input.referenceType,
        referenceId: input.referenceId,
        description: input.description,
        notes: input.notes,
        ipAddress: request.ip as any,
      });

      return reply.code(201).send(transaction);
    } catch (error: any) {
      request.log.error(error);
      return reply.code(400).send({ error: error.message });
    }
  });

  /**
   * Deduct funds from wallet
   * POST /api/resellers/:id/wallet/debit
   */
  fastify.post('/:id/wallet/debit', {
    schema: { body: deductFundsSchema },
    preHandler: [requireAuth, requireRole('org_admin')]
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { id } = request.params as { id: string };
      const user = getAuthenticatedUser(request);
      const input = deductFundsSchema.parse(request.body);

      const transaction = await resellerService.deductFunds({
        resellerId: id,
        organizationId: user?.organizationId || '',
        type: input.type || 'debit',
        amount: input.amount,
        referenceType: input.referenceType,
        referenceId: input.referenceId,
        relatedResellerId: input.relatedResellerId,
        description: input.description,
        notes: input.notes,
        ipAddress: request.ip as any,
      });

      return reply.code(201).send(transaction);
    } catch (error: any) {
      request.log.error(error);
      return reply.code(400).send({ error: error.message });
    }
  });

  /**
   * Get wallet transactions
   * GET /api/resellers/:id/wallet/transactions
   */
  fastify.get('/:id/wallet/transactions', {
    schema: { querystring: transactionsQuerySchema },
    preHandler: requireAuth
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { id } = request.params as { id: string };
      const { type, startDate, endDate, limit, offset } = request.query as any;

      const transactions = await resellerService.getWalletTransactions(id, {
        type,
        startDate,
        endDate,
        limit,
        offset,
      });

      return reply.send(transactions);
    } catch (error: any) {
      request.log.error(error);
      return reply.code(500).send({ error: error.message });
    }
  });

  // -------------------------------------------------------------------------
  // COMMISSION
  // -------------------------------------------------------------------------

  /**
   * Get commission settings
   * GET /api/resellers/:id/commissions
   */
  fastify.get('/:id/commissions', {
    preHandler: requireAuth
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { id } = request.params as { id: string };
      const commissions = await resellerService.getResellerCommissions(id);
      return reply.send(commissions);
    } catch (error: any) {
      request.log.error(error);
      return reply.code(500).send({ error: error.message });
    }
  });

  /**
   * Set commission for a plan
   * POST /api/resellers/:id/commissions
   */
  fastify.post('/:id/commissions', {
    schema: { body: commissionSchema },
    preHandler: [requireAuth, requireRole('org_admin')]
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { id } = request.params as { id: string };
      const user = getAuthenticatedUser(request);
      const input = commissionSchema.parse(request.body);

      const commission = await resellerService.setPlanCommission({
        resellerId: id,
        organizationId: user?.organizationId || '',
        ...input,
      });

      return reply.code(201).send(commission);
    } catch (error: any) {
      request.log.error(error);
      return reply.code(400).send({ error: error.message });
    }
  });

  /**
   * Calculate commission
   * POST /api/resellers/commissions/calculate
   */
  fastify.post('/commissions/calculate', {
    preHandler: requireAuth
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { resellerId, planId, amount } = request.body as any;
      const commission = await resellerService.calculateCommission(resellerId, planId, amount);
      return reply.send({ commission });
    } catch (error: any) {
      request.log.error(error);
      return reply.code(500).send({ error: error.message });
    }
  });

  // -------------------------------------------------------------------------
  // PACKAGE SALES
  // -------------------------------------------------------------------------

  /**
   * Process package sale with commission
   * POST /api/resellers/:id/sales
   */
  fastify.post('/:id/sales', {
    schema: { body: packageSaleSchema },
    preHandler: requireAuth
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { id } = request.params as { id: string };
      const input = packageSaleSchema.parse(request.body);

      const result = await resellerService.processPackageSale({
        sellerResellerId: id,
        buyerResellerId: input.buyerResellerId,
        amount: input.amount,
        planId: input.planId,
        referenceId: input.referenceId,
        description: input.description,
      });

      return reply.code(201).send(result);
    } catch (error: any) {
      request.log.error(error);
      return reply.code(400).send({ error: error.message });
    }
  });

  // -------------------------------------------------------------------------
  // FUND DEPENDENCY
  // -------------------------------------------------------------------------

  /**
   * Check fund dependency
   * POST /api/resellers/:id/check-funds
   */
  fastify.post('/:id/check-funds', {
    preHandler: requireAuth
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { id } = request.params as { id: string };
      const { amount } = request.body as { amount: number };
      
      const result = await resellerService.checkFundDependency(id, amount);
      return reply.send(result);
    } catch (error: any) {
      request.log.error(error);
      return reply.code(500).send({ error: error.message });
    }
  });

  // -------------------------------------------------------------------------
  // REPORTS
  // -------------------------------------------------------------------------

  /**
   * Get reseller statistics
   * GET /api/resellers/:id/stats
   */
  fastify.get('/:id/stats', {
    preHandler: requireAuth
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { id } = request.params as { id: string };
      const stats = await resellerService.getResellerStats(id);
      return reply.send(stats);
    } catch (error: any) {
      request.log.error(error);
      return reply.code(500).send({ error: error.message });
    }
  });

  /**
   * Get resellers under parent
   * GET /api/resellers/:id/sub-resellers
   */
  fastify.get('/:id/sub-resellers', {
    preHandler: requireAuth
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { id } = request.params as { id: string };
      const subResellers = await resellerService.getResellersUnderParent(id);
      return reply.send(subResellers);
    } catch (error: any) {
      request.log.error(error);
      return reply.code(500).send({ error: error.message });
    }
  });
}
