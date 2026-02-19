/**
 * Accounting Routes
 * Lightweight endpoints for invoices, payments, and expenses
 */

import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { db } from '../db/index.js';
import { invoices, organizations } from '../db/schema.js';
import { requireAuth } from '../middleware/permissions.js';
import { payments, expenses } from '../db/schema.js';
import { eq } from 'drizzle-orm';

// Note: payments/expenses persisted to DB via `payments` and `expenses` tables

function generateInvoiceNumber() {
  const t = Date.now();
  return `INV-${t.toString().slice(-8)}`;
}

export default async function accountingRoutes(fastify: FastifyInstance) {
  // List invoices
  fastify.get('/invoices', { preHandler: requireAuth }, async (_request: FastifyRequest, reply: FastifyReply) => {
    try {
      const rows = await db.select().from(invoices).limit(200);
      return reply.send(rows);
    } catch (error: any) {
      return reply.status(500).send({ error: error.message });
    }
  });

  // Get invoice by id
  fastify.get('/invoices/:id', { preHandler: requireAuth }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const params = request.params as any;
      const id = params.id;
      // Try by id first, then by invoiceNumber
      const byId = await db.query.invoices.findFirst({ where: eq(invoices.id, id) });
      if (byId) return reply.send(byId);

      const byNumber = await db.query.invoices.findFirst({ where: eq(invoices.invoiceNumber, id) });
      if (byNumber) return reply.send(byNumber);

      return reply.status(404).send({ error: 'Invoice not found' });
    } catch (error: any) {
      return reply.status(500).send({ error: error.message });
    }
  });

  // Create invoice
  fastify.post('/invoices', { preHandler: requireAuth }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const body = request.body as any;
      const customer = body.customer || 'Unknown';
      const amount = parseFloat(body.amount) || 0;
      const dueDate = body.dueDate ? new Date(body.dueDate) : new Date();

      // Determine organization id (fallback to first org)
      const org = await db.select().from(organizations).limit(1).then(r => r[0]);
      if (!org) return reply.status(500).send({ error: 'No organization configured' });

      const invoiceNumber = generateInvoiceNumber();

      const [newInv] = await db.insert(invoices).values({
        organizationId: org.id,
        customerName: customer,
        invoiceNumber,
        amount: amount.toFixed(2),
        tax: '0',
        discount: '0',
        totalAmount: amount.toFixed(2),
        paidAmount: '0',
        status: 'pending',
        periodStart: new Date(),
        periodEnd: dueDate,
        dueDate: dueDate,
      }).returning();

      return reply.status(201).send(newInv);
    } catch (error: any) {
      return reply.status(500).send({ error: error.message });
    }
  });

  // Payments - list
  fastify.get('/payments', { preHandler: requireAuth }, async (_request: FastifyRequest, reply: FastifyReply) => {
    try {
      const rows = await db.select().from(payments).limit(200);
      return reply.send(rows);
    } catch (error: any) {
      return reply.status(500).send({ error: error.message });
    }
  });

  // Create payment
  fastify.post('/payments', { preHandler: requireAuth }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const body = request.body as any;
      const amount = parseFloat(body.amount) || 0;

      // Determine organization id (fallback to first org)
      const org = await db.select().from(organizations).limit(1).then(r => r[0]);
      if (!org) return reply.status(500).send({ error: 'No organization configured' });

      const [newPay] = await db.insert(payments).values({
        organizationId: org.id,
        invoiceId: body.invoiceId || null,
        amount: amount.toFixed(2),
        method: body.method,
        reference: body.reference,
        notes: body.notes,
      }).returning();

      // If linked to invoice, update invoice paidAmount and status
      if (body.invoiceId) {
        const inv = await db.query.invoices.findFirst({ where: eq(invoices.id, body.invoiceId) });
        if (inv) {
          const prevPaid = parseFloat((inv.paidAmount as any) || '0');
          const total = parseFloat((inv.totalAmount as any) || '0');
          const newPaid = prevPaid + amount;
          const newStatus = newPaid >= total ? 'paid' : 'pending';
          await db.update(invoices).set({ paidAmount: newPaid.toFixed(2), status: newStatus }).where(eq(invoices.id, body.invoiceId)).returning();
        }
      }

      return reply.status(201).send(newPay);
    } catch (error: any) {
      return reply.status(500).send({ error: error.message });
    }
  });

  // Expenses - list
  fastify.get('/expenses', { preHandler: requireAuth }, async (_request: FastifyRequest, reply: FastifyReply) => {
    try {
      const rows = await db.select().from(expenses).limit(200);
      return reply.send(rows);
    } catch (error: any) {
      return reply.status(500).send({ error: error.message });
    }
  });

  // Create expense
  fastify.post('/expenses', { preHandler: requireAuth }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const body = request.body as any;
      const amount = parseFloat(body.amount) || 0;

      const org = await db.select().from(organizations).limit(1).then(r => r[0]);
      if (!org) return reply.status(500).send({ error: 'No organization configured' });

      const [newExp] = await db.insert(expenses).values({
        organizationId: org.id,
        category: body.category,
        vendor: body.vendor,
        amount: amount.toFixed(2),
        notes: body.notes,
        occurredAt: body.occurredAt ? new Date(body.occurredAt) : new Date(),
      }).returning();

      return reply.status(201).send(newExp);
    } catch (error: any) {
      return reply.status(500).send({ error: error.message });
    }
  });
}
