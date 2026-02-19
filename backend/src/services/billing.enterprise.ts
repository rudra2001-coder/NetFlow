/**
 * Enterprise Billing Engine Service
 * Advanced billing operations with proration, subscriptions, and fund management
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
  routers
} from '../db/schema.js';
import {
  userSubscriptions,
  prorationLogs,
  commissionRules,
  commissionTransactions,
  resellerWallets,
  fundTransactions,
  financialLedger,
  type UserSubscription,
  type ProrationLog
} from '../db/schema.enterprise.js';
import { eq, and, sql, desc, isNull, gt, lt, gte, lte } from 'drizzle-orm';
import { nanoid } from 'nanoid';

// ============================================================================
// TYPES
// ============================================================================

export interface ProrationResult {
  creditAmount: number;
  chargeAmount: number;
  netAmount: number;
  daysRemaining: number;
}

export interface SubscriptionResult {
  success: boolean;
  subscriptionId?: string;
  errors: string[];
}

export interface CommissionResult {
  success: boolean;
  commissionAmount: number;
  errors: string[];
}

// ============================================================================
// PRORATION CALCULATIONS
// ============================================================================

/**
 * Calculate proration when user upgrades/downgrades plan
 */
export async function calculateProration(
  userId: string,
  oldPlanId: string,
  newPlanId: string,
  action: 'upgrade' | 'downgrade'
): Promise<ProrationResult> {
  // Get plans
  const oldPlan = await db.query.billingPlans.findFirst({
    where: eq(billingPlans.id, oldPlanId)
  });
  
  const newPlan = await db.query.billingPlans.findFirst({
    where: eq(billingPlans.id, newPlanId)
  });
  
  if (!oldPlan || !newPlan) {
    throw new Error('Invalid plan IDs');
  }
  
  // Get active subscription
  const subscription = await db.query.userSubscriptions.findFirst({
    where: and(
      eq(userSubscriptions.userId, userId),
      eq(userSubscriptions.billingPlanId, oldPlanId),
      eq(userSubscriptions.status, 'active')
    )
  });
  
  if (!subscription) {
    throw new Error('No active subscription found');
  }
  
  // Calculate days remaining
  const now = new Date();
  const expiry = new Date(subscription.expiry);
  const daysRemaining = Math.max(0, Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
  
  // Calculate price per day
  const oldPricePerDay = oldPlan.pricePerDay 
    ? Number(oldPlan.pricePerDay) 
    : (oldPlan.priceMonthly ? Number(oldPlan.priceMonthly) / 30 : 0);
    
  const newPricePerDay = newPlan.pricePerDay 
    ? Number(newPlan.pricePerDay) 
    : (newPlan.priceMonthly ? Number(newPlan.priceMonthly) / 30 : 0);
  
  let creditAmount: number;
  let chargeAmount: number;
  
  if (action === 'upgrade') {
    // Credit for unused old plan time, charge for new plan time
    creditAmount = oldPricePerDay * daysRemaining;
    chargeAmount = newPricePerDay * daysRemaining;
  } else {
    // For downgrade, credit for new plan (cheaper), charge for old plan
    creditAmount = newPricePerDay * daysRemaining;
    chargeAmount = oldPricePerDay * daysRemaining;
  }
  
  return {
    creditAmount: Math.round(creditAmount * 100) / 100,
    chargeAmount: Math.round(chargeAmount * 100) / 100,
    netAmount: Math.round((chargeAmount - creditAmount) * 100) / 100,
    daysRemaining
  };
}

/**
 * Process plan change with proration
 */
export async function processPlanChange(
  userId: string,
  organizationId: string,
  oldPlanId: string,
  newPlanId: string,
  action: 'upgrade' | 'downgrade',
  pppSecretId?: string
): Promise<SubscriptionResult> {
  const errors: string[] = [];
  
  try {
    // Calculate proration
    const proration = await calculateProration(userId, oldPlanId, newPlanId, action);
    
    // Get user
    const user = await db.query.users.findFirst({
      where: eq(sql`id`, userId)
    });
    
    if (!user) {
      return { success: false, errors: ['User not found'] };
    }
    
    // Get old subscription
    const oldSubscription = await db.query.userSubscriptions.findFirst({
      where: and(
        eq(userSubscriptions.userId, userId),
        eq(userSubscriptions.billingPlanId, oldPlanId),
        eq(userSubscriptions.status, 'active')
      )
    });
    
    // Log proration
    const prorationData: any = {
      userId,
      organizationId,
      subscriptionId: oldSubscription?.id || undefined,
      oldPlanId,
      newPlanId,
      action,
      daysRemaining: proration.daysRemaining,
      oldPricePerDay: proration.creditAmount / (proration.daysRemaining || 1),
      newPricePerDay: proration.chargeAmount / (proration.daysRemaining || 1),
      creditAmount: proration.creditAmount,
      chargeAmount: proration.chargeAmount,
      netAmount: proration.netAmount,
      effectiveDate: new Date()
    };
    await db.insert(prorationLogs).values(prorationData);
    
    // Get new plan
    const newPlan = await db.query.billingPlans.findFirst({
      where: eq(billingPlans.id, newPlanId)
    });
    
    if (!newPlan) {
      return { success: false, errors: ['New plan not found'] };
    }
    
    // Calculate new expiry based on remaining days
    let newExpiry: Date;
    if (proration.netAmount <= 0) {
      // Credit or even - extend expiry
      const daysToAdd = proration.daysRemaining;
      newExpiry = new Date(Date.now() + daysToAdd * 24 * 60 * 60 * 1000);
    } else {
      // Need to charge - use current expiry
      newExpiry = oldSubscription ? new Date(oldSubscription.expiry) : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    }
    
    // Create new subscription
    const subscriptionData: any = {
      userId,
      organizationId,
      pppSecretId: pppSecretId || null,
      billingPlanId: newPlanId,
      billingProfileId: oldSubscription?.billingProfileId || null,
      status: 'active',
      billingType: oldSubscription?.billingType || 'prepaid',
      startedAt: new Date(),
      expiry: newExpiry,
      nextBillingDate: new Date(newExpiry.getTime() - 3 * 24 * 60 * 60 * 1000),
      price: Number(newPlan.pricePerDay || newPlan.priceMonthly || 0),
      paidAmount: 0,
      priority: 1,
      prorationEnabled: true,
      prorationCredit: proration.creditAmount,
      prorationCharge: proration.chargeAmount,
      autoRenew: oldSubscription?.autoRenew ?? true,
      settings: {}
    };
    const [newSubscription] = await db.insert(userSubscriptions).values(subscriptionData).returning();
    
    // Update old subscription status
    if (oldSubscription) {
      await db.update(userSubscriptions)
        .set({ 
          status: 'cancelled',
          cancellationDate: new Date(),
          updatedAt: new Date()
        })
        .where(eq(userSubscriptions.id, oldSubscription.id));
    }
    
    // Log billing event
    await db.insert(billingEvents).values({
      organizationId,
      pppSecretId: pppSecretId || null,
      eventType: 'plan_changed',
      referenceId: newSubscription.id,
      amount: proration.netAmount.toString(),
      previousValue: oldPlanId,
      newValue: newPlanId,
      description: `Plan ${action} from old plan to new plan. Proration: ${JSON.stringify(proration)}`
    });
    
    // Record financial ledger entries
    if (proration.creditAmount > 0) {
      await recordLedgerEntry(organizationId, 'user', userId, 'proration_credit', 0, proration.creditAmount, 0, 0, 'subscription', newSubscription.id, 'Proration credit');
    }
    
    if (proration.chargeAmount > 0) {
      await recordLedgerEntry(organizationId, 'user', userId, 'proration_charge', proration.chargeAmount, 0, 0, 0, 'subscription', newSubscription.id, 'Proration charge');
    }
    
    return {
      success: true,
      subscriptionId: newSubscription.id,
      errors: []
    };
    
  } catch (error) {
    console.error('Error processing plan change:', error);
    return {
      success: false,
      errors: [error instanceof Error ? error.message : 'Unknown error']
    };
  }
}

// ============================================================================
// SUBSCRIPTION MANAGEMENT
// ============================================================================

/**
 * Create a new user subscription
 */
export async function createSubscription(
  userId: string,
  organizationId: string,
  billingPlanId: string,
  options: {
    billingType?: 'prepaid' | 'postpaid' | 'on_demand' | 'fixed_cycle';
    billingProfileId?: string;
    pppSecretId?: string;
    resellerId?: string;
    autoRenew?: boolean;
    startNow?: boolean;
  } = {}
): Promise<SubscriptionResult> {
  const errors: string[] = [];
  
  try {
    const plan = await db.query.billingPlans.findFirst({
      where: eq(billingPlans.id, billingPlanId)
    });
    
    if (!plan) {
      return { success: false, errors: ['Billing plan not found'] };
    }
    
    const billingType = options.billingType || 'prepaid';
    const billingProfile = options.billingProfileId 
      ? await db.query.billingProfiles.findFirst({
          where: eq(billingProfiles.id, options.billingProfileId)
        })
      : await db.query.billingProfiles.findFirst({
          where: and(
            eq(billingProfiles.organizationId, organizationId),
            eq(billingProfiles.isDefault, true)
          )
        });
    
    let startedAt = new Date();
    let expiry: Date;
    let nextBillingDate: Date;
    
    if (options.startNow) {
      // Calculate expiry based on billing mode
      if (billingType === 'fixed_cycle' && billingProfile?.billingDay) {
        // Fixed cycle - bill on specific day of month
        const now = new Date();
        const { billingDay } = billingProfile;
        expiry = new Date(now.getFullYear(), now.getMonth() + 1, billingDay);
      } else {
        // Regular cycle
        const cycleDays = plan.cycleDays || 30;
        expiry = new Date(Date.now() + cycleDays * 24 * 60 * 60 * 1000);
      }
      nextBillingDate = new Date(expiry.getTime() - (billingProfile?.graceDays || 3) * 24 * 60 * 60 * 1000);
    } else {
      // Future start
      startedAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // Start tomorrow
      expiry = new Date(startedAt.getTime() + (plan.cycleDays || 30) * 24 * 60 * 60 * 1000);
      nextBillingDate = new Date(expiry.getTime() - (billingProfile?.graceDays || 3) * 24 * 60 * 60 * 1000);
    }
    
    // Check reseller fund dependency
    const planPrice = Number(plan.pricePerDay || plan.priceMonthly || 0);
    
    if (options.resellerId) {
      const hasFunds = await checkResellerFundDependency(options.resellerId, planPrice);
      if (!hasFunds) {
        return { 
          success: false, 
          errors: ['Reseller has insufficient funds for this subscription'] 
        };
      }
      
      // Deduct from reseller wallet
      await deductResellerFunds(options.resellerId, planPrice, 'subscription_created', {
        referenceType: 'subscription',
        description: `New subscription for user ${userId}`
      });
      
      // Distribute commission
      await distributeCommission(
        planPrice,
        billingPlanId,
        userId,
        organizationId,
        options.resellerId
      );
    }
    
    const subscriptionData2: any = {
      userId,
      organizationId,
      pppSecretId: options.pppSecretId || null,
      billingPlanId,
      billingProfileId: options.billingProfileId || billingProfile?.id || null,
      status: options.startNow ? 'active' : 'pending',
      billingType,
      startedAt,
      expiry,
      nextBillingDate,
      price: planPrice,
      paidAmount: 0,
      priority: 1,
      prorationEnabled: true,
      overduePolicy: 'suspend',
      autoRenew: options.autoRenew ?? true,
      settings: {}
    };
    const [subscription] = await db.insert(userSubscriptions).values(subscriptionData2).returning();
    
    // Log billing event
    await db.insert(billingEvents).values({
      organizationId,
      pppSecretId: options.pppSecretId || null,
      eventType: 'subscription_extended',
      referenceId: subscription.id,
      amount: planPrice.toString(),
      description: `New subscription created for plan ${plan.name}`
    });
    
    // Record ledger entry
    await recordLedgerEntry(
      organizationId, 
      'user', 
      userId, 
      'subscription_created', 
      planPrice, 
      0, 
      0, 
      0, 
      'subscription', 
      subscription.id, 
      `Subscription created for plan ${plan.name}`
    );
    
    return {
      success: true,
      subscriptionId: subscription.id,
      errors: []
    };
    
  } catch (error) {
    console.error('Error creating subscription:', error);
    return {
      success: false,
      errors: [error instanceof Error ? error.message : 'Unknown error']
    };
  }
}

/**
 * Renew subscription
 */
export async function renewSubscription(
  subscriptionId: string,
  userId: string,
  organizationId: string
): Promise<SubscriptionResult> {
  try {
    const subscription = await db.query.userSubscriptions.findFirst({
      where: eq(userSubscriptions.id, subscriptionId)
    });
    
    if (!subscription) {
      return { success: false, errors: ['Subscription not found'] };
    }
    
    const plan = await db.query.billingPlans.findFirst({
      where: eq(billingPlans.id, subscription.billingPlanId)
    });
    
    if (!plan) {
      return { success: false, errors: ['Plan not found'] };
    }
    
    // Calculate new expiry
    const cycleDays = plan.cycleDays || 30;
    const newExpiry = new Date(Date.now() + cycleDays * 24 * 60 * 60 * 1000);
    const newNextBillingDate = new Date(newExpiry.getTime() - 3 * 24 * 60 * 60 * 1000);
    
    // Update subscription
    await db.update(userSubscriptions)
      .set({
        startedAt: new Date(),
        expiry: newExpiry,
        nextBillingDate: newNextBillingDate,
        status: 'active',
        updatedAt: new Date()
      })
      .where(eq(userSubscriptions.id, subscriptionId));
    
    // Log event
    await db.insert(billingEvents).values({
      organizationId,
      pppSecretId: subscription.pppSecretId || null,
      eventType: 'subscription_extended',
      referenceId: subscriptionId,
      amount: (Number(plan.pricePerDay || plan.priceMonthly || 0)).toString(),
      description: `Subscription renewed for plan ${plan.name}`
    });
    
    return {
      success: true,
      subscriptionId,
      errors: []
    };
    
  } catch (error) {
    console.error('Error renewing subscription:', error);
    return {
      success: false,
      errors: [error instanceof Error ? error.message : 'Unknown error']
    };
  }
}

/**
 * Cancel subscription
 */
export async function cancelSubscription(
  subscriptionId: string,
  organizationId: string,
  reason?: string
): Promise<SubscriptionResult> {
  try {
    const subscription = await db.query.userSubscriptions.findFirst({
      where: eq(userSubscriptions.id, subscriptionId)
    });
    
    if (!subscription) {
      return { success: false, errors: ['Subscription not found'] };
    }
    
    await db.update(userSubscriptions)
      .set({
        status: 'cancelled',
        cancellationRequested: true,
        cancellationDate: new Date(),
        updatedAt: new Date()
      })
      .where(eq(userSubscriptions.id, subscriptionId));
    
    await db.insert(billingEvents).values({
      organizationId,
      pppSecretId: subscription.pppSecretId || null,
      eventType: 'plan_changed',
      referenceId: subscriptionId,
      description: reason || 'Subscription cancelled'
    });
    
    return {
      success: true,
      subscriptionId,
      errors: []
    };
    
  } catch (error) {
    console.error('Error cancelling subscription:', error);
    return {
      success: false,
      errors: [error instanceof Error ? error.message : 'Unknown error']
    };
  }
}

/**
 * Get user's active subscriptions (can have multiple for add-ons)
 */
export async function getUserSubscriptions(userId: string): Promise<UserSubscription[]> {
  return db.query.userSubscriptions.findMany({
    where: and(
      eq(userSubscriptions.userId, userId),
      eq(userSubscriptions.status, 'active')
    ),
    orderBy: [desc(userSubscriptions.priority)]
  });
}

// ============================================================================
// FUND MANAGEMENT
// ============================================================================

/**
 * Check if reseller has sufficient funds
 */
export async function checkResellerFundDependency(
  resellerId: string,
  amount: number
): Promise<boolean> {
  const wallet = await db.query.resellerWallets.findFirst({
    where: eq(resellerWallets.resellerId, resellerId)
  });
  
  if (!wallet) {
    return false;
  }
  
  if (!wallet.isFundDependencyEnabled) {
    return true; // No dependency, allow
  }
  
  const availableBalance = Number(wallet.balance) + Number(wallet.creditLimit);
  return availableBalance >= amount;
}

/**
 * Deduct funds from reseller wallet
 */
export async function deductResellerFunds(
  resellerId: string,
  amount: number,
  type: string,
  options: {
    referenceType?: string;
    referenceId?: string;
    description?: string;
  } = {}
): Promise<boolean> {
  const wallet = await db.query.resellerWallets.findFirst({
    where: eq(resellerWallets.resellerId, resellerId)
  });
  
  if (!wallet) {
    console.error('Wallet not found for reseller:', resellerId);
    return false;
  }
  
  const balanceBefore = Number(wallet.balance);
  const newBalance = balanceBefore - amount;
  
  // Update wallet
  await db.update(resellerWallets)
    .set({
      balance: newBalance.toString(),
      updatedAt: new Date()
    })
    .where(eq(resellerWallets.id, wallet.id));
  
  // Record transaction
  await db.insert(fundTransactions).values({
    walletId: wallet.id,
    resellerId,
    organizationId: wallet.organizationId,
    type,
    amount: amount.toString(),
    balanceBefore: balanceBefore.toString(),
    balanceAfter: newBalance.toString(),
    referenceType: options.referenceType || null,
    referenceId: options.referenceId || null,
    description: options.description || `Deducted ${amount}`
  });
  
  return true;
}

/**
 * Add funds to reseller wallet
 */
export async function addResellerFunds(
  resellerId: string,
  amount: number,
  type: string,
  options: {
    referenceType?: string;
    referenceId?: string;
    description?: string;
  } = {}
): Promise<boolean> {
  const wallet = await db.query.resellerWallets.findFirst({
    where: eq(resellerWallets.resellerId, resellerId)
  });
  
  if (!wallet) {
    console.error('Wallet not found for reseller:', resellerId);
    return false;
  }
  
  const balanceBefore = Number(wallet.balance);
  const newBalance = balanceBefore + amount;
  
  // Update wallet
  await db.update(resellerWallets)
    .set({
      balance: newBalance.toString(),
      updatedAt: new Date()
    })
    .where(eq(resellerWallets.id, wallet.id));
  
  // Record transaction
  await db.insert(fundTransactions).values({
    walletId: wallet.id,
    resellerId,
    organizationId: wallet.organizationId,
    type,
    amount: amount.toString(),
    balanceBefore: balanceBefore.toString(),
    balanceAfter: newBalance.toString(),
    referenceType: options.referenceType || null,
    referenceId: options.referenceId || null,
    description: options.description || `Added ${amount}`
  });
  
  return true;
}

// ============================================================================
// COMMISSION DISTRIBUTION
// ============================================================================

/**
 * Distribute commission up the reseller chain
 */
export async function distributeCommission(
  saleAmount: number,
  planId: string,
  userId: string,
  organizationId: string,
  sellerResellerId: string
): Promise<CommissionResult> {
  const errors: string[] = [];
  
  try {
    // Get seller reseller
    const sellerReseller = await db.query.resellers.findFirst({
      where: eq(resellers.id, sellerResellerId)
    });
    
    if (!sellerReseller) {
      return { success: false, commissionAmount: 0, errors: ['Seller reseller not found'] };
    }
    
    let currentResellerId = sellerReseller.parentId;
    let level = 1;
    let totalCommission = 0;
    
    // Traverse up the chain
    while (currentResellerId && level <= 5) { // Max 5 levels
      const parentReseller = await db.query.resellers.findFirst({
        where: eq(resellers.id, currentResellerId)
      });
      
      if (!parentReseller) break;
      
      // Get commission rule
      const commissionRule = await db.query.commissionRules.findFirst({
        where: and(
          eq(commissionRules.resellerId, parentReseller.id),
          eq(commissionRules.isActive, true),
          sql`(${commissionRules.billingPlanId} = ${planId} OR ${commissionRules.billingPlanId} IS NULL)`
        )
      });
      
      let commissionRate = commissionRule 
        ? Number(commissionRule.value) 
        : Number(parentReseller.commissionValue);
      
      if (commissionRate > 0) {
        const commissionAmount = saleAmount * (commissionRate / 100);
        
        // Add commission to parent wallet
        await addResellerFunds(
          parentReseller.id,
          commissionAmount,
          'commission_earned',
          {
            referenceType: 'subscription',
            description: `Commission from user subscription (Level ${level})`
          }
        );
        
        // Record commission transaction
        await db.insert(commissionTransactions).values({
          organizationId,
          fromUserId: userId,
          fromResellerId: sellerResellerId,
          toResellerId: parentReseller.id,
          billingPlanId: planId,
          saleAmount: saleAmount.toString(),
          commissionAmount: commissionAmount.toString(),
          commissionRate: commissionRate.toString(),
          level,
          status: 'pending',
          description: `Commission earned from subscription (Level ${level})`
        });
        
        totalCommission += commissionAmount;
      }
      
      currentResellerId = parentReseller.parentId;
      level++;
    }
    
    return {
      success: true,
      commissionAmount: totalCommission,
      errors: []
    };
    
  } catch (error) {
    console.error('Error distributing commission:', error);
    return {
      success: false,
      commissionAmount: 0,
      errors: [error instanceof Error ? error.message : 'Unknown error']
    };
  }
}

// ============================================================================
// FINANCIAL LEDGER
// ============================================================================

/**
 * Record a financial ledger entry
 */
export async function recordLedgerEntry(
  organizationId: string,
  entityType: string,
  entityId: string,
  entryType: string,
  debit: number,
  credit: number,
  balanceBefore: number,
  balanceAfter: number,
  referenceType?: string,
  referenceId?: string,
  description?: string,
  createdBy?: string
): Promise<void> {
  const ledgerData: any = {
    organizationId,
    entityType,
    entityId,
    entryType: entryType as any,
    debit,
    credit,
    balanceBefore,
    balanceAfter,
    referenceType: referenceType || null,
    referenceId: referenceId || null,
    description: description || null,
    createdBy: createdBy || null
  };
  await db.insert(financialLedger).values(ledgerData);
}

// ============================================================================
// OVERDUE & THROTTLE MANAGEMENT
// ============================================================================

/**
 * Process overdue users based on policy
 */
export async function processOverdueUsers(organizationId: string): Promise<{
  suspended: number;
  throttled: number;
  notified: number;
}> {
  const result = { suspended: 0, throttled: 0, notified: 0 };
  
  // Find expired subscriptions
  const expiredSubscriptions = await db.query.userSubscriptions.findMany({
    where: and(
      eq(userSubscriptions.organizationId, organizationId),
      eq(userSubscriptions.status, 'active'),
      lt(userSubscriptions.expiry, new Date())
    )
  });
  
  for (const sub of expiredSubscriptions) {
    const policy = sub.overduePolicy || 'suspend';
    
    if (policy === 'suspend') {
      // Mark as expired
      await db.update(userSubscriptions)
        .set({ status: 'expired', updatedAt: new Date() })
        .where(eq(userSubscriptions.id, sub.id));
      
      // Disable PPP secret if exists
      if (sub.pppSecretId) {
        await db.update(pppSecrets)
          .set({ status: 'expired' })
          .where(eq(pppSecrets.id, sub.pppSecretId));
      }
      
      result.suspended++;
      
    } else if (policy === 'throttle') {
      // Throttle instead of suspend
      await db.update(userSubscriptions)
        .set({ status: 'throttled', updatedAt: new Date() })
        .where(eq(userSubscriptions.id, sub.id));
      
      result.throttled++;
    }
  }
  
  return result;
}

/**
 * Reactivate throttled users who have paid
 */
export async function reactivateThrottledUsers(organizationId: string): Promise<number> {
  let reactivated = 0;
  
  // Find throttled users with paid invoices
  const throttledSubscriptions = await db.query.userSubscriptions.findMany({
    where: and(
      eq(userSubscriptions.organizationId, organizationId),
      eq(userSubscriptions.status, 'throttled')
    )
  });
  
  for (const sub of throttledSubscriptions) {
    // Check if there's a recent payment
    const recentPayment = await db.query.invoices.findFirst({
      where: and(
        eq(sql`ppp_secret_id`, sub.pppSecretId || sql`NULL`),
        eq(sql`status`, 'paid'),
        gte(sql`paid_at`, new Date(Date.now() - 24 * 60 * 60 * 1000)) // Within last 24 hours
      )
    });
    
    if (recentPayment) {
      await db.update(userSubscriptions)
        .set({ status: 'active', updatedAt: new Date() })
        .where(eq(userSubscriptions.id, sub.id));
      
      reactivated++;
    }
  }
  
  return reactivated;
}

// ============================================================================
// ADD-ON PACKAGES
// ============================================================================

/**
 * Add an add-on package to existing subscription
 */
export async function addAddonPackage(
  userId: string,
  organizationId: string,
  billingPlanId: string,
  pppSecretId?: string
): Promise<SubscriptionResult> {
  const plan = await db.query.billingPlans.findFirst({
    where: eq(billingPlans.id, billingPlanId)
  });
  
  if (!plan) {
    return { success: false, errors: ['Plan not found'] };
  }
  
  // Get user's primary subscription to determine priority
  const existingSubs = await db.query.userSubscriptions.findMany({
    where: and(
      eq(userSubscriptions.userId, userId),
      eq(userSubscriptions.status, 'active')
    )
  });
  
  const maxPriority = existingSubs.reduce((max: number, s: any) => Math.max(max, s.priority), 0);
  
  const addonPrice = Number(plan.pricePerDay || plan.priceMonthly || 0);
  
  const addonSubscriptionData: any = {
    userId,
    organizationId,
    pppSecretId: pppSecretId || null,
    billingPlanId,
    status: 'active',
    billingType: 'prepaid',
    startedAt: new Date(),
    expiry: new Date(Date.now() + (plan.cycleDays || 7) * 24 * 60 * 60 * 1000), // Add-on usually shorter
    price: addonPrice,
    paidAmount: 0,
    priority: maxPriority + 1, // Add-on has lower priority
    prorationEnabled: false, // No proration for add-ons
    autoRenew: false, // Add-ons don't auto-renew
    settings: { isAddon: true }
  };
  const [subscription] = await db.insert(userSubscriptions).values(addonSubscriptionData).returning();
  
  return {
    success: true,
    subscriptionId: subscription.id,
    errors: []
  };
}

export default {
  calculateProration,
  processPlanChange,
  createSubscription,
  renewSubscription,
  cancelSubscription,
  getUserSubscriptions,
  checkResellerFundDependency,
  deductResellerFunds,
  addResellerFunds,
  distributeCommission,
  recordLedgerEntry,
  processOverdueUsers,
  reactivateThrottledUsers,
  addAddonPackage
};
