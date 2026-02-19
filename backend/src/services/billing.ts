/**
 * Billing Engine Service
 * Automated billing operations for NetFlow ISP Management
 * Unified Flexible Billing Architecture
 */

import { db } from '../db/index.js';
import { 
  invoices, 
  pppSecrets, 
  resellers, 
  billingPlans,
  billingProfiles,
  billingEvents,
  resellerTransactions,
  scheduledJobs,
  jobExecutionLogs,
  routers
} from '../db/schema.js';
import { eq, and, sql, desc, isNull } from 'drizzle-orm';
import { nanoid } from 'nanoid';

// ============================================================================
// TYPES
// ============================================================================

export interface InvoiceGenerationResult {
  success: boolean;
  invoicesGenerated: number;
  errors: string[];
}

export interface SuspensionResult {
  success: boolean;
  usersSuspended: number;
  errors: string[];
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function generateInvoiceNumber(): string {
  const prefix = 'INV';
  const date = new Date();
  const year = date.getFullYear().toString().slice(-2);
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const random = nanoid(6).toUpperCase();
  return `${prefix}-${year}${month}-${random}`;
}

function calculateInvoiceAmount(
  baseAmount: number, 
  taxPercent: number = 0
): { subtotal: number; tax: number; total: number } {
  const subtotal = baseAmount;
  const tax = subtotal * (taxPercent / 100);
  const total = subtotal + tax;
  
  return {
    subtotal: Math.round(subtotal * 100) / 100,
    tax: Math.round(tax * 100) / 100,
    total: Math.round(total * 100) / 100
  };
}

/**
 * Log a billing event for audit trail
 */
async function logBillingEvent(
  pppSecretId: string,
  eventType: string,
  options: {
    organizationId?: string;
    resellerId?: string;
    referenceId?: string;
    amount?: number;
    previousValue?: string;
    newValue?: string;
    description?: string;
    metadata?: Record<string, any>;
  } = {}
): Promise<void> {
  try {
    await db.insert(billingEvents).values({
      organizationId: options.organizationId || sql`NULL`,
      resellerId: options.resellerId || sql`NULL`,
      pppSecretId,
      eventType: eventType as any,
      referenceId: options.referenceId || sql`NULL`,
      amount: options.amount?.toString(),
      previousValue: options.previousValue,
      newValue: options.newValue,
      description: options.description,
      metadata: options.metadata || {}
    });
  } catch (error) {
    // Don't fail the main operation if event logging fails
    console.error('Failed to log billing event:', error);
  }
}

/**
 * Generate a single invoice (for manual/on-demand billing)
 * This is used for manual invoice generation by admins
 */
export async function generateSingleInvoice(
  pppSecretId: string,
  amount: number,
  description?: string
): Promise<{ success: boolean; invoice?: any; error?: string }> {
  try {
    const ppp = await db.query.pppSecrets.findFirst({
      where: eq(pppSecrets.id, pppSecretId)
    });
    
    if (!ppp) {
      return { success: false, error: 'Customer not found' };
    }

    // Get organization from router
    const router = await db.query.routers.findFirst({
      where: eq(routers.id, ppp.routerId)
    });

    const now = new Date();
    const periodStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const periodEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    const dueDate = new Date(now);
    dueDate.setDate(dueDate.getDate() + 7);

    const invoiceNumber = generateInvoiceNumber();
    const amounts = calculateInvoiceAmount(amount, 0);

    const [invoice] = await db.insert(invoices).values({
      organizationId: router?.organizationId || sql`NULL`,
      resellerId: ppp.resellerId || sql`NULL`,
      pppSecretId: ppp.id,
      customerId: ppp.customerId,
      customerName: ppp.name,
      invoiceNumber,
      billingPlanName: ppp.billingPlan,
      amount: amounts.subtotal.toString(),
      tax: amounts.tax.toString(),
      discount: '0',
      totalAmount: amounts.total.toString(),
      paidAmount: '0',
      status: 'pending' as any,
      periodStart,
      periodEnd,
      dueDate,
      notes: description || 'Manual invoice generation'
    }).returning();

    return { success: true, invoice };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// ============================================================================
// BILL GENERATION
// ============================================================================

export async function generateMonthlyInvoices(
  organizationId?: string,
  _resellerId?: string
): Promise<InvoiceGenerationResult> {
  const result: InvoiceGenerationResult = {
    success: false,
    invoicesGenerated: 0,
    errors: []
  };

  try {
    const now = new Date();
    const periodStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const periodEnd = new Date(now.getFullYear(), now.getMonth(), 0);
    const dueDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 7);
    
    // Get active users with billing plans
    const activeUsers = await db
      .select({
        ppp: pppSecrets,
        reseller: resellers,
        plan: billingPlans
      })
      .from(pppSecrets)
      .leftJoin(resellers, eq(pppSecrets.resellerId, resellers.id))
      .leftJoin(billingPlans, eq(pppSecrets.billingPlan, billingPlans.name))
      .where(and(
        eq(pppSecrets.status, 'active' as any),
        sql`${pppSecrets.billingPlan} IS NOT NULL`
      ));
    
    for (const user of activeUsers) {
      if (!user.ppp.billingPlan || !user.plan) continue;
      
      const amounts = calculateInvoiceAmount(Number(user.plan.priceMonthly) || 0, 0);
      const invoiceNumber = generateInvoiceNumber();
      
      // Check if invoice already exists
      const existingInvoice = await db.query.invoices.findFirst({
        where: and(
          eq(invoices.pppSecretId, user.ppp.id),
          sql`${invoices.periodStart} = ${periodStart}`
        )
      });
      
      if (existingInvoice) continue;
      
      try {
        await db.insert(invoices).values({
          organizationId: user.reseller?.organizationId || organizationId || sql`NULL`,
          resellerId: user.ppp.resellerId || sql`NULL`,
          pppSecretId: user.ppp.id,
          customerId: user.ppp.customerId,
          customerName: user.ppp.name,
          invoiceNumber,
          billingPlanId: user.plan.id,
          billingPlanName: user.plan.name,
          amount: amounts.subtotal.toString(),
          tax: amounts.tax.toString(),
          discount: '0',
          totalAmount: amounts.total.toString(),
          paidAmount: '0',
          status: 'pending' as any,
          periodStart,
          periodEnd,
          dueDate,
          notes: `Monthly invoice for ${periodStart.toLocaleDateString()}`
        });
        
        result.invoicesGenerated++;
      } catch (err: any) {
        result.errors.push(`Error: ${err.message}`);
      }
    }
    
    result.success = true;
  } catch (error: any) {
    result.errors.push(error.message);
  }
  
  return result;
}

// ============================================================================
// AUTO SUSPENSION
// ============================================================================

export async function suspendExpiredUsers(
  _organizationId?: string,
  _resellerId?: string
): Promise<SuspensionResult> {
  const result: SuspensionResult = {
    success: false,
    usersSuspended: 0,
    errors: []
  };

  try {
    const gracePeriodDays = 3;
    const gracePeriodEnd = new Date(Date.now() - gracePeriodDays * 24 * 60 * 60 * 1000);
    
    // Find expired users
    const expiredUsers = await db
      .select({ ppp: pppSecrets })
      .from(pppSecrets)
      .where(and(
        eq(pppSecrets.status, 'active' as any),
        sql`${pppSecrets.expiryDate} IS NOT NULL`,
        sql`${pppSecrets.expiryDate} < ${gracePeriodEnd}`
      ));
    
    for (const user of expiredUsers) {
      try {
        await db.update(pppSecrets)
          .set({ status: 'suspended' as any, updatedAt: new Date() })
          .where(eq(pppSecrets.id, user.ppp.id));
        
        result.usersSuspended++;
      } catch (err: any) {
        result.errors.push(err.message);
      }
    }
    
    result.success = true;
  } catch (error: any) {
    result.errors.push(error.message);
  }
  
  return result;
}

export async function suspendUnpaidUsers(
  _organizationId?: string,
  _resellerId?: string
): Promise<SuspensionResult> {
  const result: SuspensionResult = {
    success: false,
    usersSuspended: 0,
    errors: []
  };

  try {
    const gracePeriodDays = 3;
    const gracePeriodEnd = new Date(Date.now() - gracePeriodDays * 24 * 60 * 60 * 1000);
    
    // Find unpaid invoices past due date
    const unpaidInvoices = await db.query.invoices.findMany({
      where: and(
        eq(invoices.status, 'pending' as any),
        sql`${invoices.dueDate} < ${gracePeriodEnd}`
      )
    });
    
    // Get unique PPP secret IDs
    const pppSecretIds = [...new Set(
      unpaidInvoices.map(inv => inv.pppSecretId).filter((id): id is string => id !== null)
    )];
    
    for (const pppSecretId of pppSecretIds) {
      try {
        // Check if there's a paid invoice
        const paidInvoices = await db.query.invoices.findFirst({
          where: and(
            eq(invoices.pppSecretId, pppSecretId),
            eq(invoices.status, 'paid' as any)
          )
        });
        
        if (!paidInvoices) {
          await db.update(pppSecrets)
            .set({ status: 'suspended' as any, updatedAt: new Date() })
            .where(eq(pppSecrets.id, pppSecretId));
          
          result.usersSuspended++;
        }
      } catch (err: any) {
        result.errors.push(err.message);
      }
    }
    
    result.success = true;
  } catch (error: any) {
    result.errors.push(error.message);
  }
  
  return result;
}

// ============================================================================
// PAYMENT & ACTIVATION (Updated for Unified Billing)
// ============================================================================

export async function payInvoice(
  invoiceId: string,
  paymentMethod?: string,
  paymentReference?: string,
  deductFromWallet: boolean = false
): Promise<{ success: boolean; error?: string }> {
  try {
    const invoice = await db.query.invoices.findFirst({
      where: eq(invoices.id, invoiceId)
    });
    
    if (!invoice) {
      return { success: false, error: 'Invoice not found' };
    }
    
    if (invoice.status === 'paid') {
      return { success: false, error: 'Invoice already paid' };
    }
    
    const reseller = invoice.resellerId 
      ? await db.query.resellers.findFirst({ 
          where: eq(resellers.id, invoice.resellerId) 
        }) 
      : null;
    
    // Check wallet balance if deducting from wallet
    if (deductFromWallet && reseller) {
      if (Number(reseller.walletBalance) < Number(invoice.totalAmount)) {
        return { success: false, error: 'Insufficient wallet balance' };
      }
      
      const newBalance = Number(reseller.walletBalance) - Number(invoice.totalAmount);
      
      await db.update(resellers)
        .set({ walletBalance: newBalance.toString() })
        .where(eq(resellers.id, reseller.id));
      
      await db.insert(resellerTransactions).values({
        resellerId: reseller.id,
        organizationId: invoice.organizationId || sql`NULL`,
        type: 'debit' as any,
        amount: invoice.totalAmount,
        balanceBefore: reseller.walletBalance,
        balanceAfter: newBalance.toString(),
        referenceType: 'invoice_payment',
        referenceId: invoice.id,
        description: `Payment for invoice ${invoice.invoiceNumber}`
      });
    }
    
    // Mark invoice as paid
    await db.update(invoices)
      .set({
        status: 'paid' as any,
        paidAt: new Date(),
        paymentMethod: paymentMethod || 'wallet',
        paymentReference: paymentReference || undefined,
        paidAmount: invoice.totalAmount,
        updatedAt: new Date()
      })
      .where(eq(invoices.id, invoiceId));
    
    // If linked to PPP secret, activate the user based on their billing profile
    if (invoice.pppSecretId) {
      const billingInfo = await getUserBillingInfo(invoice.pppSecretId);
      
      if (billingInfo) {
        const { billingPlan, billingMode } = billingInfo;
        const cycleDays = billingPlan?.cycleDays || 30;
        
        // Use unified extend subscription function
        const extendResult = await extendSubscription(
          invoice.pppSecretId,
          cycleDays,
          Number(invoice.totalAmount),
          paymentMethod
        );
        
        if (!extendResult.success) {
          // Log error but don't fail the payment
          console.error('Failed to extend subscription:', extendResult.error);
        }
      } else {
        // Fallback to old behavior if no billing profile
        const newExpiry = new Date();
        newExpiry.setDate(newExpiry.getDate() + 30);
        
        await db.update(pppSecrets)
          .set({
            status: 'active' as any,
            expiryDate: newExpiry,
            updatedAt: new Date()
          })
          .where(eq(pppSecrets.id, invoice.pppSecretId));
      }
    }
    
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// ============================================================================
// INVOICE QUERIES
// ============================================================================

export async function getResellerInvoices(
  resellerId: string,
  options: {
    status?: string;
    limit?: number;
    offset?: number;
  } = {}
) {
  const conditions: any[] = [eq(invoices.resellerId, resellerId)];
  
  if (options.status) {
    conditions.push(eq(invoices.status, options.status as any));
  }
  
  return db.query.invoices.findMany({
    where: and(...conditions),
    orderBy: [desc(invoices.createdAt)],
    limit: options.limit || 50,
    offset: options.offset || 0
  });
}

export async function getResellerInvoiceStats(resellerId: string) {
  const allInvoices = await db.query.invoices.findMany({
    where: eq(invoices.resellerId, resellerId)
  });
  
  const stats = {
    total: allInvoices.length,
    paid: 0,
    pending: 0,
    overdue: 0,
    totalAmount: 0,
    paidAmount: 0,
    dueAmount: 0
  };
  
  for (const inv of allInvoices) {
    const amount = Number(inv.totalAmount);
    if (inv.status === 'paid') {
      stats.paid++;
      stats.paidAmount += amount;
    } else if (inv.status === 'pending') {
      stats.pending++;
      stats.dueAmount += amount;
    } else if (inv.status === 'overdue') {
      stats.overdue++;
      stats.dueAmount += amount;
    }
    stats.totalAmount += amount;
  }
  
  return stats;
}

export async function markOverdueInvoices() {
  const now = new Date();
  
  await db.update(invoices)
    .set({ status: 'overdue' as any })
    .where(and(
      eq(invoices.status, 'pending' as any),
      sql`${invoices.dueDate} < ${now}`
    ));
}

// ============================================================================
// SCHEDULED JOBS
// ============================================================================

export async function runBillingJob(jobId: string) {
  const job = await db.query.scheduledJobs.findFirst({
    where: eq(scheduledJobs.id, jobId)
  });
  
  if (!job || !job.isActive) {
    return { success: false, error: 'Job not found or inactive' };
  }
  
  const [execution] = await db.insert(jobExecutionLogs).values({
    jobId,
    status: 'running',
    startedAt: new Date()
  }).returning();
  
  try {
    let recordsProcessed = 0;
    let recordsSuccess = 0;
    let recordsFailed = 0;
    
    switch (job.type) {
      case 'billing':
        const billingResult = await generateMonthlyInvoices();
        recordsProcessed = billingResult.invoicesGenerated;
        recordsSuccess = billingResult.invoicesGenerated;
        recordsFailed = billingResult.errors.length;
        break;
        
      case 'suspend_expired':
        const suspendResult = await suspendExpiredUsers();
        recordsProcessed = suspendResult.usersSuspended;
        recordsSuccess = suspendResult.usersSuspended;
        recordsFailed = suspendResult.errors.length;
        break;
        
      case 'suspend_unpaid':
        const unpaidResult = await suspendUnpaidUsers();
        recordsProcessed = unpaidResult.usersSuspended;
        recordsSuccess = unpaidResult.usersSuspended;
        recordsFailed = unpaidResult.errors.length;
        break;
        
      case 'mark_overdue':
        await markOverdueInvoices();
        recordsProcessed = 1;
        recordsSuccess = 1;
        break;
    }
    
    await db.update(jobExecutionLogs)
      .set({
        status: 'success',
        completedAt: new Date(),
        recordsProcessed,
        recordsSuccess,
        recordsFailed
      })
      .where(eq(jobExecutionLogs.id, execution.id));
    
    await db.update(scheduledJobs)
      .set({
        lastRunAt: new Date(),
        lastStatus: 'success'
      })
      .where(eq(scheduledJobs.id, jobId));
    
    return { success: true, recordsProcessed, recordsSuccess, recordsFailed };
    
  } catch (error: any) {
    await db.update(jobExecutionLogs)
      .set({
        status: 'failed',
        completedAt: new Date(),
        errorMessage: error.message
      })
      .where(eq(jobExecutionLogs.id, execution.id));
    
    await db.update(scheduledJobs)
      .set({
        lastRunAt: new Date(),
        lastStatus: 'failed',
        lastError: error.message
      })
      .where(eq(scheduledJobs.id, jobId));
    
    return { success: false, error: error.message };
  }
}

// ============================================================================
// UNIFIED FLEXIBLE BILLING ENGINE
// ============================================================================

// Types for unified billing
export type BillingMode = 'calendar' | 'anniversary' | 'fixed_days' | 'prepaid' | 'postpaid' | 'on_demand';

export interface UserBillingInfo {
  pppSecret: any;
  billingPlan: any;
  billingProfile: any;
  billingMode: BillingMode;
}

/**
 * Get user's billing configuration
 */
export async function getUserBillingInfo(pppSecretId: string): Promise<UserBillingInfo | null> {
  const result = await db
    .select({
      ppp: pppSecrets,
      plan: billingPlans,
      profile: billingProfiles
    })
    .from(pppSecrets)
    .leftJoin(billingPlans, eq(pppSecrets.billingPlanId, billingPlans.id))
    .leftJoin(billingProfiles, eq(pppSecrets.billingProfileId, billingProfiles.id))
    .where(eq(pppSecrets.id, pppSecretId))
    .limit(1);

  if (!result.length || !result[0].ppp) return null;

  const { ppp, plan, profile } = result[0];
  
  // Determine billing mode - use profile's mode or default to prepaid
  const billingMode: BillingMode = profile?.billingMode || 'prepaid';

  return {
    pppSecret: ppp,
    billingPlan: plan,
    billingProfile: profile,
    billingMode
  };
}

/**
 * Calculate price based on billing plan and cycle days
 */
function calculatePrice(billingPlan: any, cycleDays: number): number {
  if (!billingPlan) return 0;
  
  // If cycle matches monthly
  if (cycleDays === 30) {
    return Number(billingPlan.priceMonthly) || 0;
  }
  
  // If cycle matches yearly
  if (cycleDays === 365) {
    return Number(billingPlan.priceYearly) || (Number(billingPlan.priceMonthly) || 0) * 12;
  }
  
  // Use daily price if available
  if (billingPlan.pricePerDay && cycleDays === 1) {
    return Number(billingPlan.pricePerDay);
  }
  
  // Use weekly price if available
  if (billingPlan.pricePerWeek && cycleDays === 7) {
    return Number(billingPlan.pricePerWeek);
  }
  
  // Fallback: calculate from monthly price
  const monthlyPrice = Number(billingPlan.priceMonthly) || 0;
  return (monthlyPrice / 30) * cycleDays;
}

/**
 * Process billing for a single user based on their billing mode
 * Returns true if invoice was generated, false otherwise
 */
export async function processUserBilling(
  pppSecretId: string,
  organizationId?: string
): Promise<{ success: boolean; action: string; invoiceId?: string; error?: string }> {
  try {
    const billingInfo = await getUserBillingInfo(pppSecretId);
    if (!billingInfo) {
      return { success: false, action: 'error', error: 'User not found' };
    }

    const { pppSecret, billingPlan, billingProfile, billingMode } = billingInfo;
    const now = new Date();

    // Skip billing for these modes
    if (billingMode === 'prepaid') {
      // Prepaid users pay before service - no auto invoice
      return { success: true, action: 'skipped_prepaid' };
    }

    if (billingMode === 'on_demand') {
      // On-demand users manually activate - no auto billing
      return { success: true, action: 'skipped_on_demand' };
    }

    // Get cycle days from billing plan (default 30)
    const cycleDays = billingPlan?.cycleDays || 30;

    // Determine if we should generate invoice based on billing mode
    let shouldGenerateInvoice = false;
    let periodStart: Date;
    let periodEnd: Date;
    let nextBillingDate: Date;

    switch (billingMode) {
      case 'calendar':
        // Calendar billing: generate on 1st of month
        const billingDay = billingProfile?.billingDay || 1;
        periodStart = new Date(now.getFullYear(), now.getMonth(), billingDay);
        periodEnd = new Date(now.getFullYear(), now.getMonth() + 1, billingDay - 1);
        
        // Only generate if we're at or past the billing day
        if (now.getDate() >= billingDay) {
          shouldGenerateInvoice = true;
        }
        
        // Set next billing date
        nextBillingDate = new Date(now.getFullYear(), now.getMonth() + 1, billingDay);
        break;

      case 'anniversary':
        // Anniversary billing: generate on user's signup anniversary
        const nextBilling = pppSecret.nextBillingDate ? new Date(pppSecret.nextBillingDate) : null;
        
        if (!nextBilling || now >= nextBilling) {
          shouldGenerateInvoice = true;
          
          // Calculate next anniversary
          const createdAt = pppSecret.createdAt ? new Date(pppSecret.createdAt) : now;
          nextBillingDate = new Date(now.getFullYear(), createdAt.getMonth(), createdAt.getDate());
          if (nextBillingDate <= now) {
            nextBillingDate.setFullYear(nextBillingDate.getFullYear() + 1);
          }
          
          periodStart = pppSecret.currentPeriodStart 
            ? new Date(pppSecret.currentPeriodStart)
            : new Date(now.getFullYear(), now.getMonth() - 1, createdAt.getDate());
          periodEnd = new Date(nextBillingDate);
          periodEnd.setDate(periodEnd.getDate() - 1);
        } else {
          // Not time yet
          return { success: true, action: 'waiting_anniversary', error: `Next billing: ${nextBilling.toISOString()}` };
        }
        break;

      case 'fixed_days':
        // Fixed days: generate based on cycle days from last billing
        const lastBilling = pppSecret.currentPeriodEnd ? new Date(pppSecret.currentPeriodEnd) : now;
        nextBillingDate = new Date(lastBilling);
        nextBillingDate.setDate(nextBillingDate.getDate() + cycleDays);
        
        if (now >= nextBillingDate) {
          shouldGenerateInvoice = true;
          periodStart = lastBilling;
          periodEnd = nextBillingDate;
          // Set next period
          nextBillingDate = new Date(now);
          nextBillingDate.setDate(nextBillingDate.getDate() + cycleDays);
        } else {
          return { success: true, action: 'waiting_fixed_days', error: `Next billing: ${nextBillingDate.toISOString()}` };
        }
        break;

      case 'postpaid':
        // Postpaid: generate at period end
        const postpaidPeriodEnd = pppSecret.currentPeriodEnd 
          ? new Date(pppSecret.currentPeriodEnd)
          : new Date(now.getFullYear(), now.getMonth() + 1, 0);
        
        if (now >= postpaidPeriodEnd) {
          shouldGenerateInvoice = true;
          periodStart = pppSecret.currentPeriodStart || new Date(now.getFullYear(), now.getMonth(), 1);
          periodEnd = postpaidPeriodEnd;
          nextBillingDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        } else {
          return { success: true, action: 'waiting_postpaid' };
        }
        break;

      default:
        return { success: false, action: 'error', error: `Unknown billing mode: ${billingMode}` };
    }

    if (!shouldGenerateInvoice) {
      return { success: true, action: 'no_invoice_due' };
    }

    // Check if invoice already exists for this period
    const existingInvoice = await db.query.invoices.findFirst({
      where: and(
        eq(invoices.pppSecretId, pppSecretId),
        sql`${invoices.periodStart} = ${periodStart}`
      )
    });

    if (existingInvoice) {
      return { success: true, action: 'invoice_exists', invoiceId: existingInvoice.id };
    }

    // Calculate amount based on billing plan
    const amount = calculatePrice(billingPlan, cycleDays);
    const dueDate = new Date(periodEnd);
    const graceDays = billingProfile?.graceDays || 3;
    dueDate.setDate(dueDate.getDate() + graceDays);

    // Generate invoice
    const invoiceNumber = generateInvoiceNumber();
    const [invoice] = await db.insert(invoices).values({
      organizationId: organizationId || pppSecret.organizationId || sql`NULL`,
      resellerId: pppSecret.resellerId || sql`NULL`,
      pppSecretId: pppSecret.id,
      customerId: pppSecret.customerId,
      customerName: pppSecret.name,
      invoiceNumber,
      billingPlanId: billingPlan?.id,
      billingPlanName: billingPlan?.name || pppSecret.billingPlan,
      amount: amount.toString(),
      tax: '0',
      discount: '0',
      totalAmount: amount.toString(),
      paidAmount: '0',
      status: 'pending' as any,
      periodStart,
      periodEnd,
      dueDate,
      notes: `${billingMode} billing for ${cycleDays} days`
    }).returning();

    // Update user's billing period
    await db.update(pppSecrets)
      .set({
        currentPeriodStart: periodStart,
        currentPeriodEnd: periodEnd,
        nextBillingDate: nextBillingDate,
        updatedAt: now
      })
      .where(eq(pppSecrets.id, pppSecretId));

    return { success: true, action: 'invoice_generated', invoiceId: invoice.id };

  } catch (error: any) {
    return { success: false, action: 'error', error: error.message };
  }
}

/**
 * Process all users' billing based on their billing modes
 */
export async function processAllUserBilling(
  organizationId?: string,
  resellerId?: string
): Promise<{ success: boolean; processed: number; invoicesGenerated: number; errors: string[] }> {
  const result = {
    success: false,
    processed: 0,
    invoicesGenerated: 0,
    errors: [] as string[]
  };

  try {
    // Build base query - get users via router to properly filter by organization
    let conditions: any[] = [
      eq(pppSecrets.status, 'active' as any)
    ];

    // If organizationId provided, filter by router
    let routerIds: string[] = [];
    if (organizationId) {
      const orgRouters = await db
        .select({ id: routers.id })
        .from(routers)
        .where(eq(routers.organizationId, organizationId));
      routerIds = orgRouters.map(r => r.id);
      
      if (routerIds.length === 0) {
        return { success: true, processed: 0, invoicesGenerated: 0, errors: [] };
      }
      
      conditions.push(sql`${pppSecrets.routerId} IN ${routerIds}`);
    }

    if (resellerId) {
      conditions.push(eq(pppSecrets.resellerId, resellerId));
    }

    // Get all active users
    const users = await db
      .select({
        id: pppSecrets.id,
        routerId: pppSecrets.routerId
      })
      .from(pppSecrets)
      .where(and(...conditions));

    for (const user of users) {
      result.processed++;
      
      // Get organization from router
      const router = await db.query.routers.findFirst({
        where: eq(routers.id, user.routerId)
      });
      
      const billingResult = await processUserBilling(user.id, router?.organizationId);
      
      if (billingResult.invoiceId) {
        result.invoicesGenerated++;
      }
      
      if (!billingResult.success) {
        result.errors.push(`User ${user.id}: ${billingResult.error}`);
      }
    }

    result.success = true;
  } catch (error: any) {
    result.errors.push(error.message);
  }

  return result;
}

/**
 * Extend subscription (for prepaid, on-demand, or renewal)
 * This handles adding time to user's subscription
 * FIXED: Extend from max(expiry, today) to prevent time loss
 */
export async function extendSubscription(
  pppSecretId: string,
  days?: number,
  amount?: number,
  paymentMethod?: string,
  paymentReference?: string
): Promise<{ success: boolean; newExpiry?: Date; error?: string }> {
  try {
    const billingInfo = await getUserBillingInfo(pppSecretId);
    if (!billingInfo) {
      return { success: false, error: 'User not found' };
    }

    const { pppSecret, billingPlan, billingMode } = billingInfo;
    
    // Determine days to add
    const cycleDays = days || billingPlan?.cycleDays || 30;
    
    // Calculate amount if not provided
    const chargeAmount = amount !== undefined 
      ? amount 
      : calculatePrice(billingPlan, cycleDays);

    const now = new Date();
    let newExpiry: Date;

    // FIXED: Extend from max(expiry, today) to prevent time loss
    // This handles the case where user pays after expiry
    if (billingMode === 'prepaid' || billingMode === 'on_demand' || billingMode === 'fixed_days') {
      // For prepaid/on-demand: extend from current expiry OR now (whichever is later)
      const currentExpiry = pppSecret.expiryDate ? new Date(pppSecret.expiryDate) : null;
      const baseDate = (currentExpiry && currentExpiry > now) ? currentExpiry : now;
      
      newExpiry = new Date(baseDate);
      newExpiry.setDate(newExpiry.getDate() + cycleDays);
    } else {
      // For calendar/anniversary/postpaid: extend from now
      newExpiry = new Date(now);
      newExpiry.setDate(newExpiry.getDate() + cycleDays);
    }

    // Update PPP secret
    await db.update(pppSecrets)
      .set({
        expiryDate: newExpiry,
        status: 'active' as any,
        autoExtend: billingPlan?.autoExtend || false,
        updatedAt: now
      })
      .where(eq(pppSecrets.id, pppSecretId));

    return { success: true, newExpiry };

  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

/**
 * Suspend users based on their billing profile settings
 * Handles different suspension rules per billing mode
 */
export async function processSuspensions(
  organizationId?: string,
  resellerId?: string
): Promise<{ success: boolean; suspended: number; errors: string[] }> {
  const result = {
    success: false,
    suspended: 0,
    errors: [] as string[]
  };

  try {
    const now = new Date();

    // Get all active users with billing profiles
    const users = await db
      .select({
        ppp: pppSecrets,
        profile: billingProfiles
      })
      .from(pppSecrets)
      .leftJoin(billingProfiles, eq(pppSecrets.billingProfileId, billingProfiles.id))
      .where(and(
        eq(pppSecrets.status, 'active' as any)
      ));

    for (const user of users) {
      const { ppp, profile } = user;
      const billingMode = profile?.billingMode || 'prepaid';
      const autoSuspend = profile?.autoSuspend !== false; // default true

      // Skip if auto-suspend is disabled
      if (!autoSuspend) continue;

      // Check different suspension conditions based on billing mode
      let shouldSuspend = false;
      let suspendReason = '';

      if (billingMode === 'prepaid') {
        // Prepaid: suspend if expired
        if (ppp.expiryDate && new Date(ppp.expiryDate) < now) {
          shouldSuspend = true;
          suspendReason = 'expired';
        }
      } else if (billingMode === 'postpaid' || billingMode === 'calendar' || billingMode === 'anniversary') {
        // Postpaid/calendar/anniversary: check for overdue invoices
        const graceDays = profile?.graceDays || 3;
        const graceEnd = new Date(now);
        graceEnd.setDate(graceEnd.getDate() - graceDays);

        const overdueInvoices = await db.query.invoices.findMany({
          where: and(
            eq(invoices.pppSecretId, ppp.id),
            eq(invoices.status, 'pending' as any),
            sql`${invoices.dueDate} < ${graceEnd}`
          )
        });

        if (overdueInvoices.length > 0) {
          // Check credit limit
          const creditLimit = Number(profile?.creditLimit) || 0;
          const totalDue = overdueInvoices.reduce((sum, inv) => 
            sum + Number(inv.totalAmount), 0);

          if (totalDue > creditLimit) {
            shouldSuspend = true;
            suspendReason = `overdue_invoices`;
          }
        }
      }

      if (shouldSuspend) {
        await db.update(pppSecrets)
          .set({
            status: 'suspended' as any,
            updatedAt: now
          })
          .where(eq(pppSecrets.id, ppp.id));

        result.suspended++;
      }
    }

    result.success = true;
  } catch (error: any) {
    result.errors.push(error.message);
  }

  return result;
}
