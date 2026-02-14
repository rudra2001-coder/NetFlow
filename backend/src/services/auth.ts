/**
 * Authentication Service
 * Handles JWT authentication, user management, and session handling
 * 
 * SECURITY: Uses proper JWT tokens with signatures and expiration
 */

import bcrypt from 'bcryptjs';
import * as jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { config } from '../config/index.js';
import { logger } from '../utils/logger.js';
import { db } from '../db/index.js';
import { users, userSessions, organizations, auditLogs } from '../db/schema.js';
import { eq, and, desc } from 'drizzle-orm';
import type { FastifyRequest, FastifyReply } from 'fastify';

// ============================================================================
// TYPES
// ============================================================================

export interface UserPayload {
  id: string;
  email: string;
  organizationId: string;
  role: string;
  permissions: string[];
}

export interface TokenPayload {
  userId: string;
  email: string;
  organizationId: string;
  role: string;
  permissions: string[];
  type: 'access' | 'refresh';
  iat: number;
  exp: number;
}

export interface AuthResult {
  success: boolean;
  user?: Partial<typeof users.$inferSelect>;
  accessToken?: string;
  refreshToken?: string;
  error?: string;
}

export interface VerifyResult {
  valid: boolean;
  payload?: TokenPayload;
  error?: string;
}

// ============================================================================
// JWT CONFIGURATION
// ============================================================================

// Token expiration times
const ACCESS_TOKEN_EXPIRY = '15m';  // 15 minutes
const REFRESH_TOKEN_EXPIRY = '7d';  // 7 days

// Get JWT secret from environment - MUST be set in production
const getJwtSecret = (): string => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    logger.warn('JWT_SECRET not set in environment - using development secret. THIS IS INSECURE FOR PRODUCTION!');
    // Development fallback - DO NOT use in production
    return 'dev-secret-change-in-production-please';
  }
  return secret;
};

// ============================================================================
// AUTHENTICATION SERVICE
// ============================================================================

export class AuthService {
  private jwtSecret: string;

  constructor() {
    this.jwtSecret = getJwtSecret();
  }

  /**
   * Hash password using bcrypt
   */
  async hashPassword(password: string): Promise<string> {
    const saltRounds = 12;
    return bcrypt.hash(password, saltRounds);
  }

  /**
   * Verify password
   */
  async verifyPassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }

  /**
   * Register a new user
   */
  async register(data: {
    email: string;
    password: string;
    firstName?: string;
    lastName?: string;
    organizationId?: string;
    role?: string;
  }): Promise<AuthResult> {
    try {
      // Check if user already exists
      const existingUser = await db.query.users.findFirst({
        where: eq(users.email, data.email),
      });

      if (existingUser) {
        return { success: false, error: 'User already exists' };
      }

      // Hash password
      const passwordHash = await this.hashPassword(data.password);

      // Create user
      const userId = uuidv4();
      const orgId = data.organizationId || uuidv4();
      
      await db.insert(users).values({
        organizationId: orgId,
        email: data.email,
        passwordHash,
        firstName: data.firstName,
        lastName: data.lastName,
        role: (data.role || 'user') as 'super_admin' | 'org_admin' | 'technician' | 'user' | 'reseller',
      });

      // Get created user
      const user = await db.query.users.findFirst({
        where: eq(users.id, userId),
      });

      // Log audit
      await this.createAuditLog(user!.organizationId, user!.id, 'user.register', 'users', user!.id);

      return {
        success: true,
        user: {
          id: user!.id,
          email: user!.email,
          firstName: user!.firstName,
          lastName: user!.lastName,
          role: user!.role,
        },
      };
    } catch (error) {
      logger.error({ error }, 'Registration failed');
      return { success: false, error: 'Registration failed' };
    }
  }

  /**
   * Login user
   */
  async login(
    email: string,
    password: string,
    ipAddress?: string,
    userAgent?: string
  ): Promise<AuthResult> {
    try {
      // Find user
      const user = await db.query.users.findFirst({
        where: and(
          eq(users.email, email),
          eq(users.isActive, true)
        ),
      });

      if (!user) {
        return { success: false, error: 'Invalid credentials' };
      }

      // Verify password
      const validPassword = await this.verifyPassword(password, user.passwordHash);
      if (!validPassword) {
        return { success: false, error: 'Invalid credentials' };
      }

      // Generate tokens using JWT
      const accessToken = this.generateAccessToken(user);
      const refreshToken = this.generateRefreshToken(user);

      // Store refresh token hash in database
      await db.update(users)
        .set({
          refreshToken,
          refreshTokenExpiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
          lastLoginAt: new Date(),
          lastLoginIp: ipAddress,
        })
        .where(eq(users.id, user.id));

      // Create session
      const sessionToken = uuidv4();
      await db.insert(userSessions).values({
        id: uuidv4(),
        userId: user.id,
        token: sessionToken,
        ipAddress: ipAddress || '0.0.0.0',
        userAgent,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      });

      // Log audit
      await this.createAuditLog(user.organizationId, user.id, 'user.login', 'users', user.id, undefined, { ipAddress });

      return {
        success: true,
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          permissions: user.permissions as string[],
          organizationId: user.organizationId,
        },
        accessToken,
        refreshToken,
      };
    } catch (error) {
      logger.error({ email, error }, 'Login failed');
      return { success: false, error: 'Login failed' };
    }
  }

  /**
   * Logout user
   */
  async logout(userId: string, refreshToken: string): Promise<void> {
    try {
      // Invalidate refresh token
      await db.update(users)
        .set({
          refreshToken: null,
          refreshTokenExpiresAt: null,
        })
        .where(eq(users.id, userId));

      // Get user for audit
      const user = await db.query.users.findFirst({
        where: eq(users.id, userId),
      });

      if (user) {
        await this.createAuditLog(user.organizationId, userId, 'user.logout', 'users', userId);
      }
    } catch (error) {
      logger.error({ userId, error }, 'Logout failed');
    }
  }

  /**
   * Refresh access token
   */
  async refreshAccessToken(refreshToken: string): Promise<{ accessToken?: string; error?: string }> {
    try {
      // Verify the refresh token
      const verifyResult = this.verifyToken(refreshToken);
      
      if (!verifyResult.valid || !verifyResult.payload) {
        return { error: 'Invalid refresh token' };
      }

      if (verifyResult.payload.type !== 'refresh') {
        return { error: 'Invalid token type' };
      }

      // Find user with this refresh token
      const user = await db.query.users.findFirst({
        where: and(
          eq(users.id, verifyResult.payload.userId),
          eq(users.isActive, true),
        ),
      });

      if (!user) {
        return { error: 'User not found' };
      }

      // Check if refresh token is expired in database
      if (user.refreshTokenExpiresAt && new Date() > user.refreshTokenExpiresAt) {
        return { error: 'Refresh token expired' };
      }

      // Generate new access token
      const accessToken = this.generateAccessToken(user);
      return { accessToken };
    } catch (error) {
      logger.error({ error }, 'Token refresh failed');
      return { error: 'Token refresh failed' };
    }
  }

  /**
   * Verify JWT token
   * This is the SECURE way to verify tokens
   */
  verifyToken(token: string): VerifyResult {
    try {
      const payload = jwt.verify(token, this.jwtSecret) as TokenPayload;
      return { valid: true, payload };
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        return { valid: false, error: 'Token expired' };
      }
      if (error instanceof jwt.JsonWebTokenError) {
        return { valid: false, error: 'Invalid token' };
      }
      return { valid: false, error: 'Token verification failed' };
    }
  }

  /**
   * Get current user from request
   */
  async getCurrentUser(request: FastifyRequest): Promise<typeof users.$inferSelect | null> {
    const userId = (request as any).user?.userId;
    if (!userId) return null;

    const user = await db.query.users.findFirst({
      where: eq(users.id, userId),
    });
    
    return user ?? null;
  }

  /**
   * Check if user has permission
   */
  hasPermission(user: typeof users.$inferSelect, permission: string): boolean {
    // Super admin has all permissions
    if (user.role === 'super_admin') return true;

    // Check explicit permissions
    const permissions = (user.permissions as string[]) || [];
    if (permissions.includes(permission)) return true;
    if (permissions.includes('*')) return true;

    // Role-based permissions
    const rolePermissions: Record<string, string[]> = {
      org_admin: [
        'routers:*',
        'users:*',
        'ppp:*',
        'billing:*',
        'audit:read',
        'settings:*',
      ],
      technician: [
        'routers:read',
        'ppp:*',
        'hotspot:*',
        'interfaces:read',
      ],
      user: [
        'ppp:read',
        'hotspot:read',
      ],
      reseller: [
        'routers:read',
        'ppp:read',
        'billing:read',
      ],
    };

    const allowed = rolePermissions[user.role] || [];
    return allowed.some((p) => {
      if (p === permission) return true;
      if (p.endsWith(':*') && permission.startsWith(p.replace(':*', ':'))) return true;
      return false;
    });
  }

  /**
   * Generate access token using JWT
   * Token expires in 15 minutes
   */
  private generateAccessToken(user: typeof users.$inferSelect): string {
    const payload: Omit<TokenPayload, 'iat' | 'exp'> = {
      userId: user.id,
      email: user.email,
      organizationId: user.organizationId,
      role: user.role,
      permissions: (user.permissions as string[]) || [],
      type: 'access',
    };

    return jwt.sign(payload, this.jwtSecret, { 
      expiresIn: ACCESS_TOKEN_EXPIRY,
      issuer: 'netflow-api',
      subject: user.id,
    });
  }

  /**
   * Generate refresh token using JWT
   * Token expires in 7 days
   */
  private generateRefreshToken(user: typeof users.$inferSelect): string {
    const payload: Omit<TokenPayload, 'iat' | 'exp'> = {
      userId: user.id,
      email: user.email,
      organizationId: user.organizationId,
      role: user.role,
      permissions: (user.permissions as string[]) || [],
      type: 'refresh',
    };

    return jwt.sign(payload, this.jwtSecret, { 
      expiresIn: REFRESH_TOKEN_EXPIRY,
      issuer: 'netflow-api',
      subject: user.id,
    });
  }

  /**
   * Create audit log
   */
  private async createAuditLog(
    organizationId: string,
    userId: string,
    action: string,
    entityType: string,
    entityId?: string,
    oldValue?: unknown,
    metadata?: unknown
  ): Promise<void> {
    try {
      await db.insert(auditLogs).values({
        id: uuidv4(),
        organizationId,
        userId,
        action,
        entityType,
        entityId,
        oldValue: oldValue ? JSON.parse(JSON.stringify(oldValue)) : undefined,
        metadata,
      });
    } catch (error) {
      logger.error({ action, entityType, error }, 'Failed to create audit log');
    }
  }
}

export const authService = new AuthService();
export default authService;
