/**
 * Billing Routes
 * API endpoints for billing management in NetFlow
 */

import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { z } from 'zod';
import * as billingService from '../services/billing.js';
import { requireAuth, getAuthenticatedUser } from '../middleware/permissions.js';
import { eq } from 'drizzle-orm';
import { db } from '../db/index.js';
import { resellers, pppSecrets, invoices, billingPlans, billingProfiles } from '../db/schema.js';

// ============================================================================
// VALIDATION SCHEMAS
// ============================================================================

const payInvoiceSchema = z.object({
  invoiceId: z.string().uuid(),
  paymentMethod: z.string().optional(),
  paymentReference: z.string().optional(),
  deductFromWallet: z.boolean().optional(),
});

const generateInvoiceSchema = z.object({
  pppSecretId: z.string().uuid(),
  amount: z.number().positive(),
  description: z.string().optional(),
});

const listInvoicesSchema = z.object({
  status: z.enum(['pending', 'paid', 'overdue', 'cancelled']).optional(),
  limit: z.coerce.number().min(1).max(100).optional().default(50),
  offset: z.coerce.number().min(0).optional().default(0),
});

// ============================================================================
// ROUTES
// ============================================================================

export default async function billingRoutes(fastify: FastifyInstance) {
  
  // Get reseller's invoices
  fastify.get('/reseller/invoices', {
    preHandler: requireAuth,
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const user = getAuthenticatedUser(request);
      if (!user) {
        return reply.status(401).send({ error: 'Unauthorized' });
      }
      const query = request.query as z.infer<typeof listInvoicesSchema>;
      
      // Find reseller for this user
      const reseller = await db.query.resellers.findFirst({
        where: eq(resellers.userId, user.userId)
      });
      
      if (!reseller) {
        return reply.status(403).send({ error: 'Reseller not found' });
      }
      
      const invoices_list = await billingService.getResellerInvoices(reseller.id, {
        status: query.status,
        limit: query.limit,
        offset: query.offset
      });
      
      const stats = await billingService.getResellerInvoiceStats(reseller.id);
      
      return {
        invoices: invoices_list,
        stats
      };
      
    } catch (error: any) {
      return reply.status(500).send({ error: error.message });
    }
  });
  
  // Pay single invoice
  fastify.post('/invoices/pay', {
    preHandler: requireAuth,
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const body = request.body as z.infer<typeof payInvoiceSchema>;
      const result = await billingService.payInvoice(
        body.invoiceId,
        body.paymentMethod,
        body.paymentReference,
        body.deductFromWallet
      );
      
      if (!result.success) {
        return reply.status(400).send({ error: result.error });
      }
      
      return { success: true };
      
    } catch (error: any) {
      return reply.status(500).send({ error: error.message });
    }
  });
  
  // Generate single invoice
  fastify.post('/invoices/generate', {
    preHandler: requireAuth,
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const body = request.body as z.infer<typeof generateInvoiceSchema>;
      
      const { pppSecretId, amount, description } = body;
      
      // Get PPP secret to verify
      const ppp = await db.query.pppSecrets.findFirst({
        where: eq(pppSecrets.id, pppSecretId)
      });
      
      if (!ppp) {
        return reply.status(404).send({ error: 'Customer not found' });
      }
      
      const result = await billingService.generateSingleInvoice(
        pppSecretId,
        amount,
        description
      );
      
      if (!result.success) {
        return reply.status(400).send({ error: result.error });
      }
      
      return { invoice: result.invoice };
      
    } catch (error: any) {
      return reply.status(500).send({ error: error.message });
    }
  });
  
  // Get reseller's customers (PPP secrets)
  fastify.get('/reseller/customers', {
    preHandler: requireAuth,
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const user = getAuthenticatedUser(request);
      if (!user) {
        return reply.status(401).send({ error: 'Unauthorized' });
      }
      
      const reseller = await db.query.resellers.findFirst({
        where: eq(resellers.userId, user.userId)
      });
      
      if (!reseller) {
        return reply.status(403).send({ error: 'Reseller not found' });
      }
      
      const customers = await db.query.pppSecrets.findMany({
        where: eq(pppSecrets.resellerId, reseller.id)
      });
      
      return { customers };
      
    } catch (error: any) {
      return reply.status(500).send({ error: error.message });
    }
  });
  
  // Get dashboard stats for reseller
  fastify.get('/reseller/dashboard', {
    preHandler: requireAuth,
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const user = getAuthenticatedUser(request);
      if (!user) {
        return reply.status(401).send({ error: 'Unauthorized' });
      }
      
      const reseller = await db.query.resellers.findFirst({
        where: eq(resellers.userId, user.userId)
      });
      
      if (!reseller) {
        return reply.status(403).send({ error: 'Reseller not found' });
      }
      
      // Get invoice stats
      const invoiceStats = await billingService.getResellerInvoiceStats(reseller.id);
      
      // Get customer counts
      const allCustomers = await db.query.pppSecrets.findMany({
        where: eq(pppSecrets.resellerId, reseller.id)
      });
      
      const activeCustomers = allCustomers.filter(c => c.status === 'active').length;
      const suspendedCustomers = allCustomers.filter(c => c.status === 'suspended').length;
      const expiredCustomers = allCustomers.filter(c => 
        c.expiryDate && new Date(c.expiryDate) < new Date()
      ).length;
      
      return {
        walletBalance: reseller.walletBalance,
        invoiceStats,
        customerStats: {
          total: allCustomers.length,
          active: activeCustomers,
          suspended: suspendedCustomers,
          expired: expiredCustomers
        }
      };
      
    } catch (error: any) {
      return reply.status(500).send({ error: error.message });
    }
  });
  
  // Get all billing plans
  fastify.get('/plans', {
    preHandler: requireAuth,
  }, async (_request: FastifyRequest, reply: FastifyReply) => {
    try {
      const plans = await db.select().from(billingPlans);
      return { plans };
    } catch (error: any) {
      return reply.status(500).send({ error: error.message });
    }
  });

  // Get all billing profiles
  fastify.get('/profiles', {
    preHandler: requireAuth,
  }, async (_request: FastifyRequest, reply: FastifyReply) => {
    try {
      const profiles = await db.select().from(billingProfiles);
      return { profiles };
    } catch (error: any) {
      return reply.status(500).send({ error: error.message });
    }
  });

  // Create billing profile
  fastify.post('/profiles', {
    preHandler: requireAuth,
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const body = request.body as any;
      const { 
        organizationId,
        name, 
        description, 
        billingMode, 
        graceDays, 
        lateFeePercent, 
        autoSuspend, 
        allowPartial, 
        creditLimit, 
        walletRequired, 
        billingDay,
        isDefault 
      } = body;

      const [profile] = await db.insert(billingProfiles).values({
        organizationId,
        name,
        description,
        billingMode: billingMode || 'prepaid',
        graceDays: graceDays || 3,
        lateFeePercent: lateFeePercent?.toString() || '0',
        autoSuspend: autoSuspend ?? true,
        allowPartial: allowPartial ?? false,
        creditLimit: creditLimit?.toString() || '0',
        walletRequired: walletRequired ?? false,
        billingDay,
        isDefault: isDefault ?? false
      }).returning();

      return { profile };
    } catch (error: any) {
      return reply.status(500).send({ error: error.message });
    }
  });

  // Update billing profile
  fastify.put('/profiles/:id', {
    preHandler: requireAuth,
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const params = request.params as any;
      const body = request.body as any;
      const { id } = params;

      const updateData: any = { ...body, updatedAt: new Date() };
      
      // Convert numeric fields
      if (body.lateFeePercent !== undefined) {
        updateData.lateFeePercent = body.lateFeePercent.toString();
      }
      if (body.creditLimit !== undefined) {
        updateData.creditLimit = body.creditLimit.toString();
      }

      const [profile] = await db.update(billingProfiles)
        .set(updateData)
        .where(eq(billingProfiles.id, id))
        .returning();

      if (!profile) {
        return reply.status(404).send({ error: 'Profile not found' });
      }

      return { profile };
    } catch (error: any) {
      return reply.status(500).send({ error: error.message });
    }
  });

  // Process unified billing for all users
  fastify.post('/process-all', {
    preHandler: requireAuth,
  }, async (_request: FastifyRequest, reply: FastifyReply) => {
    try {
      const result = await billingService.processAllUserBilling();
      return result;
    } catch (error: any) {
      return reply.status(500).send({ error: error.message });
    }
  });
}
