/**
 * Reseller Service
 * Multi-level reseller hierarchy with commission and fund dependency control
 */

import { eq, and, desc, gt, gte, sql, isNull } from 'drizzle-orm';
import { db } from '../db/index.js';
import {
  resellers,
  resellerTransactions,
  resellerCommissions,
  resellerHierarchy,
  type Reseller,
  type NewReseller,
  type ResellerTransaction,
  type NewResellerTransaction,
  type ResellerCommission,
  type NewResellerCommission
} from '../db/schema.js';
import { users } from '../db/schema.js';

// ============================================================================
// TYPES
// ============================================================================

export interface CreateResellerInput {
  organizationId: string;
  userId?: string;
  parentId?: string;
  name: string;
  companyName?: string;
  email: string;
  phone?: string;
  address?: string;
  role?: 'admin' | 'macro' | 'reseller' | 'sub_reseller';
  commissionType?: 'percentage' | 'fixed' | 'margin';
  commissionValue?: number;
  marginPercent?: number;
  fundDependencyEnabled?: boolean;
  creditLimit?: number;
  walletBalance?: number;
  status?: 'active' | 'suspended' | 'inactive' | 'pending';
  settings?: Record<string, unknown>;
  notes?: string;
}

export interface UpdateResellerInput {
  parentId?: string;
  name?: string;
  companyName?: string;
  email?: string;
  phone?: string;
  address?: string;
  role?: 'admin' | 'macro' | 'reseller' | 'sub_reseller';
  commissionType?: 'percentage' | 'fixed' | 'margin';
  commissionValue?: number;
  marginPercent?: number;
  fundDependencyEnabled?: boolean;
  creditLimit?: number;
  walletBalance?: number;
  status?: 'active' | 'suspended' | 'inactive' | 'pending';
  settings?: Record<string, unknown>;
  notes?: string;
}

export interface WalletTransactionInput {
  resellerId: string;
  organizationId: string;
  type: 'credit' | 'debit' | 'commission_earned' | 'commission_paid' | 'package_sale' | 'package_cost' | 'refund' | 'adjustment';
  amount: number;
  referenceType?: string;
  referenceId?: string;
  relatedResellerId?: string;
  description?: string;
  notes?: string;
  ipAddress?: string;
}

export interface CommissionInput {
  resellerId: string;
  organizationId: string;
  billingPlanId?: string;
  commissionType?: 'percentage' | 'fixed' | 'margin';
  commissionValue: number;
  maxCommission?: number;
  minCommission?: number;
  isActive?: boolean;
}

export interface PackageSaleInput {
  sellerResellerId: string;
  buyerResellerId: string;
  amount: number;
  planId: string;
  referenceId?: string;
  description?: string;
}

export interface ResellerTreeNode extends Reseller {
  children: ResellerTreeNode[];
  totalUsers?: number;
  totalRevenue?: number;
}

// ============================================================================
// RESELLER CRUD OPERATIONS
// ============================================================================

/**
 * Create a new reseller
 */
export async function createReseller(input: CreateResellerInput): Promise<Reseller> {
  // Calculate level based on parent
  let level = 1;
  if (input.parentId) {
    const parent = await getResellerById(input.parentId);
    if (parent) {
      level = (parent.level ?? 1) + 1;
    }
  }

  const [reseller] = await db.insert(resellers).values({
    organizationId: input.organizationId,
    userId: input.userId,
    parentId: input.parentId,
    name: input.name,
    companyName: input.companyName,
    email: input.email,
    phone: input.phone,
    address: input.address,
    role: input.role || 'reseller',
    level,
    commissionType: input.commissionType || 'percentage',
    commissionValue: input.commissionValue?.toString() || '0',
    marginPercent: input.marginPercent?.toString() || '0',
    fundDependencyEnabled: input.fundDependencyEnabled ?? true,
    creditLimit: input.creditLimit?.toString() || '0',
    walletBalance: input.walletBalance?.toString() || '0',
    status: input.status || 'pending',
    settings: input.settings || {},
    notes: input.notes,
  }).returning();

  // Update hierarchy table
  await updateResellerHierarchy(reseller.id, input.parentId);

  return reseller;
}

/**
 * Get reseller by ID
 */
export async function getResellerById(id: string): Promise<Reseller | null> {
  const [reseller] = await db.select().from(resellers).where(eq(resellers.id, id));
  return reseller || null;
}

/**
 * Get reseller by user ID
 */
export async function getResellerByUserId(userId: string): Promise<Reseller | null> {
  const [reseller] = await db.select().from(resellers).where(eq(resellers.userId, userId));
  return reseller || null;
}

/**
 * Get all resellers for an organization
 */
export async function getResellersByOrganization(
  organizationId: string,
  options?: {
    status?: string;
    parentId?: string | null;
    limit?: number;
    offset?: number;
  }
): Promise<Reseller[]> {
  const conditions = [eq(resellers.organizationId, organizationId)];

  if (options?.status) {
    conditions.push(eq(resellers.status, options.status as any));
  }

  if (options?.parentId !== undefined) {
    if (options.parentId === null) {
      conditions.push(isNull(resellers.parentId));
    } else {
      conditions.push(eq(resellers.parentId, options.parentId));
    }
  }

  return db.select().from(resellers)
    .where(and(...conditions))
    .limit(options?.limit || 100)
    .offset(options?.offset || 0)
    .orderBy(desc(resellers.createdAt));
}

/**
 * Update reseller
 */
export async function updateReseller(id: string, input: UpdateResellerInput): Promise<Reseller | null> {
  const [reseller] = await db.update(resellers)
    .set({
      ...input,
      commissionValue: input.commissionValue?.toString(),
      marginPercent: input.marginPercent?.toString(),
      creditLimit: input.creditLimit?.toString(),
      walletBalance: input.walletBalance?.toString(),
      updatedAt: new Date(),
    })
    .where(eq(resellers.id, id))
    .returning();

  // If parent changed, update hierarchy
  if (input.parentId !== undefined) {
    await updateResellerHierarchy(id, input.parentId);
  }

  return reseller || null;
}

/**
 * Delete reseller
 */
export async function deleteReseller(id: string): Promise<boolean> {
  // Check for children
  const children = await db.select().from(resellers).where(eq(resellers.parentId, id));
  if (children.length > 0) {
    throw new Error('Cannot delete reseller with active children. Reassign or delete children first.');
  }

  const result = await db.delete(resellers).where(eq(resellers.id, id));
  return true;
}

// ============================================================================
// HIERARCHY OPERATIONS
// ============================================================================

/**
 * Update reseller hierarchy table
 */
async function updateResellerHierarchy(resellerId: string, parentId: string | null | undefined): Promise<void> {
  // Delete existing hierarchy entries for this reseller
  await db.delete(resellerHierarchy).where(eq(resellerHierarchy.descendantId, resellerId));

  if (!parentId) {
    // This is a top-level reseller, add self-reference
    await db.insert(resellerHierarchy).values({
      ancestorId: resellerId,
      descendantId: resellerId,
      depth: 0,
    });
    return;
  }

  // Get parent's ancestors
  const parentAncestors = await db.select()
    .from(resellerHierarchy)
    .where(eq(resellerHierarchy.descendantId, parentId))
    .orderBy(desc(resellerHierarchy.depth));

  // Add ancestors + self
  for (const ancestor of parentAncestors) {
    await db.insert(resellerHierarchy).values({
      ancestorId: ancestor.ancestorId,
      descendantId: resellerId,
      depth: ancestor.depth + 1,
    });
  }

  // Add parent as direct ancestor
  await db.insert(resellerHierarchy).values({
    ancestorId: parentId,
    descendantId: resellerId,
    depth: 1,
  });
}

/**
 * Get all descendants of a reseller (full tree)
 */
export async function getResellerDescendants(resellerId: string): Promise<Reseller[]> {
  const descendants = await db.select({ r: resellers })
    .from(resellerHierarchy)
    .innerJoin(resellers, eq(resellerHierarchy.descendantId, resellers.id))
    .where(and(
      eq(resellerHierarchy.ancestorId, resellerId),
      sql`${resellerHierarchy.depth} > 0`
    ))
    .orderBy(resellers.level);

  return descendants.map(d => d.r);
}

/**
 * Get all ancestors of a reseller (up the chain)
 */
export async function getResellerAncestors(resellerId: string): Promise<Reseller[]> {
  const ancestors = await db.select({ r: resellers })
    .from(resellerHierarchy)
    .innerJoin(resellers, eq(resellerHierarchy.ancestorId, resellers.id))
    .where(and(
      eq(resellerHierarchy.descendantId, resellerId),
      sql`${resellerHierarchy.depth} > 0`
    ))
    .orderBy(resellerHierarchy.depth);

  return ancestors.map(a => a.r);
}

/**
 * Get parent reseller
 */
export async function getResellerParent(resellerId: string): Promise<Reseller | null> {
  const [reseller] = await db.select().from(resellers).where(eq(resellers.id, resellerId));
  if (!reseller?.parentId) return null;
  
  return getResellerById(reseller.parentId);
}

/**
 * Get child resellers
 */
export async function getResellerChildren(parentId: string): Promise<Reseller[]> {
  return db.select().from(resellers).where(eq(resellers.parentId, parentId));
}

/**
 * Get reseller tree (nested structure)
 */
export async function getResellerTree(rootId: string): Promise<ResellerTreeNode | null> {
  const root = await getResellerById(rootId);
  if (!root) return null;

  async function buildTree(reseller: Reseller): Promise<ResellerTreeNode> {
    const children = await getResellerChildren(reseller.id);
    const childNodes = await Promise.all(children.map(c => buildTree(c)));

    return {
      ...reseller,
      children: childNodes,
    };
  }

  return buildTree(root);
}

// ============================================================================
// WALLET OPERATIONS
// ============================================================================

/**
 * Add funds to reseller wallet
 */
export async function addFunds(input: WalletTransactionInput): Promise<ResellerTransaction> {
  const [reseller] = await db.select().from(resellers).where(eq(resellers.id, input.resellerId));
  if (!reseller) throw new Error('Reseller not found');

  const balanceBefore = parseFloat(reseller.walletBalance);
  const balanceAfter = balanceBefore + input.amount;

  // Update wallet
  await db.update(resellers)
    .set({ walletBalance: balanceAfter.toString(), updatedAt: new Date() })
    .where(eq(resellers.id, input.resellerId));

  // Record transaction
  const [transaction] = await db.insert(resellerTransactions).values({
    resellerId: input.resellerId,
    organizationId: input.organizationId,
    type: 'credit',
    amount: input.amount.toString(),
    balanceBefore: balanceBefore.toString(),
    balanceAfter: balanceAfter.toString(),
    referenceType: input.referenceType,
    referenceId: input.referenceId,
    description: input.description || 'Funds added to wallet',
    notes: input.notes,
    ipAddress: input.ipAddress,
  }).returning();

  return transaction;
}

/**
 * Deduct funds from reseller wallet
 */
export async function deductFunds(input: WalletTransactionInput): Promise<ResellerTransaction> {
  const [reseller] = await db.select().from(resellers).where(eq(resellers.id, input.resellerId));
  if (!reseller) throw new Error('Reseller not found');

  const balanceBefore = parseFloat(reseller.walletBalance);
  const availableBalance = balanceBefore + parseFloat(reseller.creditLimit ?? '0');

  // Check if fund dependency is enabled
  if (reseller.fundDependencyEnabled && availableBalance < input.amount) {
    throw new Error(`Insufficient funds. Required: ${input.amount}, Available: ${balanceBefore}`);
  }

  const balanceAfter = balanceBefore - input.amount;

  // Update wallet
  await db.update(resellers)
    .set({ walletBalance: balanceAfter.toString(), updatedAt: new Date() })
    .where(eq(resellers.id, input.resellerId));

  // Record transaction
  const [transaction] = await db.insert(resellerTransactions).values({
    resellerId: input.resellerId,
    organizationId: input.organizationId,
    type: input.type || 'debit',
    amount: input.amount.toString(),
    balanceBefore: balanceBefore.toString(),
    balanceAfter: balanceAfter.toString(),
    referenceType: input.referenceType,
    referenceId: input.referenceId,
    relatedResellerId: input.relatedResellerId,
    description: input.description || 'Funds deducted from wallet',
    notes: input.notes,
    ipAddress: input.ipAddress,
  }).returning();

  return transaction;
}

/**
 * Get wallet balance
 */
export async function getWalletBalance(resellerId: string): Promise<number> {
  const [reseller] = await db.select({ walletBalance: resellers.walletBalance })
    .from(resellers)
    .where(eq(resellers.id, resellerId));
  
  return reseller ? parseFloat(reseller.walletBalance) : 0;
}

/**
 * Get wallet transactions
 */
export async function getWalletTransactions(
  resellerId: string,
  options?: {
    type?: string;
    limit?: number;
    offset?: number;
    startDate?: Date;
    endDate?: Date;
  }
): Promise<ResellerTransaction[]> {
  const conditions = [eq(resellerTransactions.resellerId, resellerId)];

  if (options?.type) {
    conditions.push(eq(resellerTransactions.type, options.type as any));
  }

  if (options?.startDate) {
    conditions.push(gte(resellerTransactions.createdAt, options.startDate));
  }

  if (options?.endDate) {
    conditions.push(lte(resellerTransactions.createdAt, options.endDate));
  }

  return db.select()
    .from(resellerTransactions)
    .where(and(...conditions))
    .limit(options?.limit || 50)
    .offset(options?.offset || 0)
    .orderBy(desc(resellerTransactions.createdAt));
}

// ============================================================================
// COMMISSION OPERATIONS
// ============================================================================

/**
 * Calculate commission for a sale
 */
export async function calculateCommission(
  resellerId: string,
  planId: string,
  saleAmount: number
): Promise<number> {
  // First try to get plan-specific commission
  const [planCommission] = await db.select()
    .from(resellerCommissions)
    .where(and(
      eq(resellerCommissions.resellerId, resellerId),
      eq(resellerCommissions.billingPlanId, planId),
      eq(resellerCommissions.isActive, true)
    ));

  let commissionValue: number;
  let commissionType: 'percentage' | 'fixed' | 'margin';

  if (planCommission) {
    commissionValue = parseFloat(planCommission.commissionValue);
    commissionType = planCommission.commissionType as 'percentage' | 'fixed' | 'margin';
  } else {
    // Use reseller default
    const [reseller] = await db.select()
      .from(resellers)
      .where(eq(resellers.id, resellerId));
    
    if (!reseller) return 0;
    
    commissionValue = parseFloat(reseller.commissionValue ?? '0');
    commissionType = reseller.commissionType as 'percentage' | 'fixed' | 'margin';
  }

  // Calculate based on type
  let commission = 0;
  if (commissionType === 'percentage') {
    commission = saleAmount * (commissionValue / 100);
  } else if (commissionType === 'fixed') {
    commission = commissionValue;
  } else if (commissionType === 'margin' && planCommission) {
    // Margin-based: use margin_percent
    const marginPercent = parseFloat(planCommission.commissionValue);
    commission = saleAmount * (marginPercent / 100);
  }

  // Apply min/max if plan-specific
  if (planCommission) {
    if (planCommission.minCommission) {
      commission = Math.max(commission, parseFloat(planCommission.minCommission));
    }
    if (planCommission.maxCommission) {
      commission = Math.min(commission, parseFloat(planCommission.maxCommission));
    }
  }

  return commission;
}

/**
 * Set commission for a billing plan
 */
export async function setPlanCommission(input: CommissionInput): Promise<ResellerCommission> {
  // Check if commission exists
  const existing = await db.select()
    .from(resellerCommissions)
    .where(and(
      eq(resellerCommissions.resellerId, input.resellerId),
      input.billingPlanId 
        ? eq(resellerCommissions.billingPlanId, input.billingPlanId)
        : sql`${resellerCommissions.billingPlanId} IS NULL`
    ));

  if (existing.length > 0) {
    // Update
    const [updated] = await db.update(resellerCommissions)
      .set({
        commissionType: input.commissionType,
        commissionValue: input.commissionValue.toString(),
        maxCommission: input.maxCommission?.toString(),
        minCommission: input.minCommission?.toString(),
        isActive: input.isActive ?? true,
        updatedAt: new Date(),
      })
      .where(eq(resellerCommissions.id, existing[0].id))
      .returning();
    return updated;
  }

  // Create
  const [created] = await db.insert(resellerCommissions).values({
    resellerId: input.resellerId,
    organizationId: input.organizationId,
    billingPlanId: input.billingPlanId,
    commissionType: input.commissionType || 'percentage',
    commissionValue: input.commissionValue.toString(),
    maxCommission: input.maxCommission?.toString(),
    minCommission: input.minCommission?.toString() || '0',
    isActive: input.isActive ?? true,
  }).returning();

  return created;
}

/**
 * Get commissions for a reseller
 */
export async function getResellerCommissions(resellerId: string): Promise<ResellerCommission[]> {
  return db.select()
    .from(resellerCommissions)
    .where(eq(resellerCommissions.resellerId, resellerId));
}

// ============================================================================
// PACKAGE SALE WITH COMMISSION DISTRIBUTION
// ============================================================================

/**
 * Process a package sale with full commission distribution
 */
export async function processPackageSale(input: PackageSaleInput): Promise<{
  sellerTransaction: ResellerTransaction;
  commissions: ResellerTransaction[];
}> {
  const [seller] = await db.select().from(resellers).where(eq(resellers.id, input.sellerResellerId));
  const [buyer] = await db.select().from(resellers).where(eq(resellers.id, input.buyerResellerId));

  if (!seller || !buyer) {
    throw new Error('Reseller not found');
  }

  // Check fund dependency
  if (seller.fundDependencyEnabled) {
    const availableBalance = parseFloat(seller.walletBalance ?? '0') + parseFloat(seller.creditLimit ?? '0');
    if (availableBalance < input.amount) {
      throw new Error(`Insufficient funds. Required: ${input.amount}, Available: ${parseFloat(seller.walletBalance ?? '0')}`);
    }
  }

  const sellerBalanceBefore = parseFloat(seller.walletBalance ?? '0');
  const sellerBalanceAfter = sellerBalanceBefore - input.amount;

  // Deduct from seller
  await db.update(resellers)
    .set({ walletBalance: sellerBalanceAfter.toString(), updatedAt: new Date() })
    .where(eq(resellers.id, input.sellerResellerId));

  // Record seller transaction
  const [sellerTransaction] = await db.insert(resellerTransactions).values({
    resellerId: input.sellerResellerId,
    organizationId: seller.organizationId,
    type: 'package_sale',
    amount: input.amount.toString(),
    balanceBefore: sellerBalanceBefore.toString(),
    balanceAfter: sellerBalanceAfter.toString(),
    referenceType: 'billing_plan',
    referenceId: input.referenceId || input.planId,
    relatedResellerId: input.buyerResellerId,
    description: input.description || `Package sale to reseller ${buyer.name}`,
  }).returning();

  // Distribute commission up the chain
  const commissions: ResellerTransaction[] = [];
  let currentResellerId: string | null = input.sellerResellerId;

  while (currentResellerId) {
    const [currentReseller] = await db.select().from(resellers).where(eq(resellers.id, currentResellerId));
    
    if (!currentReseller?.parentId) break;

    const [parentReseller] = await db.select().from(resellers).where(eq(resellers.id, currentReseller.parentId));
    if (!parentReseller) break;

    // Calculate commission for parent
    const commission = await calculateCommission(parentReseller.id, input.planId, input.amount);

    if (commission > 0) {
      const parentBalanceBefore = parseFloat(parentReseller.walletBalance);
      const parentBalanceAfter = parentBalanceBefore + commission;

      // Credit parent wallet
      await db.update(resellers)
        .set({ walletBalance: parentBalanceAfter.toString(), updatedAt: new Date() })
        .where(eq(resellers.id, parentReseller.id));

      // Record commission earned by parent
      const [commissionTransaction] = await db.insert(resellerTransactions).values({
        resellerId: parentReseller.id,
        organizationId: parentReseller.organizationId,
        type: 'commission_earned',
        amount: commission.toString(),
        balanceBefore: parentBalanceBefore.toString(),
        balanceAfter: parentBalanceAfter.toString(),
        referenceType: 'billing_plan',
        referenceId: input.referenceId || input.planId,
        relatedResellerId: currentResellerId,
        description: `Commission from reseller ${currentReseller.name}`,
      }).returning();

      commissions.push(commissionTransaction);

      // Record commission paid by child
      const childBalanceAfter = sellerBalanceAfter; // Already deducted
      
      const [paidTransaction] = await db.insert(resellerTransactions).values({
        resellerId: currentResellerId,
        organizationId: seller.organizationId,
        type: 'commission_paid',
        amount: commission.toString(),
        balanceBefore: (parentBalanceBefore - commission).toString(),
        balanceAfter: parentBalanceBefore.toString(),
        referenceType: 'billing_plan',
        referenceId: input.referenceId || input.planId,
        relatedResellerId: parentReseller.id,
        description: `Commission paid to parent ${parentReseller.name}`,
      }).returning();

      commissions.push(paidTransaction);
    }

    currentResellerId = parentReseller.parentId;
  }

  return { sellerTransaction, commissions };
}

// ============================================================================
// FUND DEPENDENCY CHECK
// ============================================================================

/**
 * Check if reseller can perform a transaction based on fund dependency
 */
export async function checkFundDependency(
  resellerId: string,
  requiredAmount: number
): Promise<{ allowed: boolean; availableBalance: number; message?: string }> {
  const [reseller] = await db.select().from(resellers).where(eq(resellers.id, resellerId));

  if (!reseller) {
    return { allowed: false, availableBalance: 0, message: 'Reseller not found' };
  }

  // If fund dependency is disabled, allow
  if (!reseller.fundDependencyEnabled) {
    return { allowed: true, availableBalance: parseFloat(reseller.walletBalance ?? '0') };
  }

  const availableBalance = parseFloat(reseller.walletBalance ?? '0') + parseFloat(reseller.creditLimit ?? '0');

  if (availableBalance < requiredAmount) {
    return {
      allowed: false,
      availableBalance: parseFloat(reseller.walletBalance ?? '0'),
      message: `Insufficient funds. Required: ${requiredAmount}, Available: ${parseFloat(reseller.walletBalance ?? '0')}`
    };
  }

  return { allowed: true, availableBalance: parseFloat(reseller.walletBalance ?? '0') };
}

// ============================================================================
// REPORTS & ANALYTICS
// ============================================================================

/**
 * Get reseller statistics
 */
export async function getResellerStats(resellerId: string): Promise<{
  totalChildren: number;
  totalDescendants: number;
  totalRevenue: number;
  totalCommissionEarned: number;
  totalCommissionPaid: number;
  currentBalance: number;
}> {
  const [reseller] = await db.select().from(resellers).where(eq(resellers.id, resellerId));
  if (!reseller) throw new Error('Reseller not found');

  // Get direct children count
  const children = await db.select({ id: resellers.id }).from(resellers).where(eq(resellers.parentId, resellerId));
  const totalChildren = children.length;

  // Get all descendants
  const descendants = await getResellerDescendants(resellerId);
  const totalDescendants = descendants.length;

  // Calculate totals from transactions
  const revenueResult = await db.select({
    total: sql<string>`COALESCE(SUM(${resellerTransactions.amount}), '0')`,
  })
    .from(resellerTransactions)
    .where(and(
      eq(resellerTransactions.resellerId, resellerId),
      eq(resellerTransactions.type, 'package_sale')
    ));

  const commissionEarnedResult = await db.select({
    total: sql<string>`COALESCE(SUM(${resellerTransactions.amount}), '0')`,
  })
    .from(resellerTransactions)
    .where(and(
      eq(resellerTransactions.resellerId, resellerId),
      eq(resellerTransactions.type, 'commission_earned')
    ));

  const commissionPaidResult = await db.select({
    total: sql<string>`COALESCE(SUM(${resellerTransactions.amount}), '0')`,
  })
    .from(resellerTransactions)
    .where(and(
      eq(resellerTransactions.resellerId, resellerId),
      eq(resellerTransactions.type, 'commission_paid')
    ));

  return {
    totalChildren,
    totalDescendants,
    totalRevenue: parseFloat(revenueResult[0]?.total || '0'),
    totalCommissionEarned: parseFloat(commissionEarnedResult[0]?.total || '0'),
    totalCommissionPaid: parseFloat(commissionPaidResult[0]?.total || '0'),
    currentBalance: parseFloat(reseller.walletBalance),
  };
}

/**
 * Get all resellers under a parent (for reports)
 */
export async function getResellersUnderParent(parentId: string): Promise<Reseller[]> {
  return getResellerDescendants(parentId);
}

import { lte } from 'drizzle-orm';
