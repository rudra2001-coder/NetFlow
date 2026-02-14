/**
 * Permission Middleware
 * Role-Based Access Control (RBAC) for API routes
 * Protects routes based on user roles and permissions
 * 
 * SECURITY: Uses proper JWT verification with signatures
 */

import { FastifyRequest, FastifyReply } from 'fastify';
import { users, organizations } from '../db/schema.js';
import { db } from '../db/index.js';
import { eq } from 'drizzle-orm';
import { logger } from '../utils/logger.js';
import { authService, type TokenPayload } from '../services/auth.js';

// ============================================================================
// TYPES
// ============================================================================

export type UserRole = 'super_admin' | 'org_admin' | 'technician' | 'user' | 'reseller';

export interface Permission {
  resource: string;
  action: 'create' | 'read' | 'update' | 'delete' | '*' | 'execute';
}

/**
 * User information attached to authenticated requests
 */
export interface AuthenticatedUser {
  userId: string;
  email: string;
  organizationId: string;
  role: UserRole;
  permissions: string[];
}

/**
 * Helper function to get typed user from request.
 * Fastify's built-in 'user' property has a generic type, so we need to cast it
 * to our specific AuthenticatedUser type for proper type safety.
 */
export function getAuthenticatedUser(request: FastifyRequest): AuthenticatedUser | undefined {
  return request.user as AuthenticatedUser | undefined;
}

/**
 * Helper function to set user on request with proper typing.
 */
export function setAuthenticatedUser(request: FastifyRequest, user: AuthenticatedUser): void {
  (request as { user: AuthenticatedUser }).user = user;
}

// ============================================================================
// ROLE DEFINITIONS
// ============================================================================

/**
 * Role hierarchy - higher roles inherit permissions from lower roles
 */
const roleHierarchy: Record<UserRole, number> = {
  super_admin: 100,
  org_admin: 50,
  technician: 30,
  reseller: 20,
  user: 10,
};

/**
 * Default permissions per role
 * Format: 'resource:action' or 'resource:*' for all actions
 */
const rolePermissions: Record<UserRole, string[]> = {
  super_admin: [
    '*', // Super admin has all permissions
  ],
  org_admin: [
    // Router management
    'routers:create',
    'routers:read',
    'routers:update',
    'routers:delete',
    'routers:execute',
    
    // PPP management
    'ppp:create',
    'ppp:read',
    'ppp:update',
    'ppp:delete',
    'ppp:disconnect',
    
    // Hotspot management
    'hotspot:create',
    'hotspot:read',
    'hotspot:update',
    'hotspot:delete',
    
    // User management (within organization)
    'users:create',
    'users:read',
    'users:update',
    'users:delete',
    
    // Profile/Package management
    'profiles:create',
    'profiles:read',
    'profiles:update',
    'profiles:delete',
    
    // Billing
    'billing:read',
    'billing:update',
    'invoices:create',
    'invoices:read',
    
    // Analytics & Reports
    'analytics:read',
    'reports:read',
    'reports:create',
    
    // Settings (organization level)
    'settings:read',
    'settings:update',
    
    // Audit logs
    'audit:read',
  ],
  technician: [
    // Read access to routers
    'routers:read',
    'routers:execute',
    
    // PPP management
    'ppp:create',
    'ppp:read',
    'ppp:update',
    'ppp:disconnect',
    
    // Hotspot management
    'hotspot:read',
    'hotspot:update',
    
    // Limited user access
    'users:read',
    
    // Profiles
    'profiles:read',
    
    // Analytics
    'analytics:read',
  ],
  reseller: [
    // Read access
    'routers:read',
    'ppp:read',
    'profiles:read',
    
    // Limited billing
    'billing:read',
    'invoices:read',
    
    // Create PPP users (for reselling)
    'ppp:create',
  ],
  user: [
    // Basic read access
    'routers:read',
    'ppp:read',
    'hotspot:read',
    'profiles:read',
  ],
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Check if a role has at least the minimum required level
 */
export function hasRoleLevel(userRole: UserRole, requiredRole: UserRole): boolean {
  return roleHierarchy[userRole] >= roleHierarchy[requiredRole];
}

/**
 * Check if user has a specific permission
 */
export function hasPermission(
  userRole: UserRole,
  userPermissions: string[],
  requiredPermission: string
): boolean {
  // Super admin has all permissions
  if (userRole === 'super_admin') return true;

  // Check if user has wildcard permission
  if (userPermissions.includes('*')) return true;

  // Check explicit permission
  if (userPermissions.includes(requiredPermission)) return true;

  // Check role-based permissions
  const rolePerms = rolePermissions[userRole] || [];
  if (rolePerms.includes('*')) return true;
  if (rolePerms.includes(requiredPermission)) return true;

  // Check wildcard resource permissions (e.g., 'routers:*')
  const [resource, action] = requiredPermission.split(':');
  if (rolePerms.includes(`${resource}:*`) || userPermissions.includes(`${resource}:*`)) {
    return true;
  }

  // Check wildcard action permissions (e.g., '*:read')
  if (rolePerms.includes(`*:${action}`) || userPermissions.includes(`*:${action}`)) {
    return true;
  }

  return false;
}

/**
 * Check if user belongs to the same organization as the resource
 */
export async function checkOrganizationAccess(
  userId: string,
  resourceOrganizationId: string
): Promise<boolean> {
  try {
    const user = await db.query.users.findFirst({
      where: eq(users.id, userId),
      columns: { organizationId: true },
    });

    return user?.organizationId === resourceOrganizationId;
  } catch (error) {
    logger.error({ userId, error }, 'Failed to check organization access');
    return false;
  }
}

// ============================================================================
// MIDDLEWARE FUNCTIONS
// ============================================================================

/**
 * Middleware to require authentication
 * Uses SECURE JWT verification
 */
export async function requireAuth(
  request: FastifyRequest,
  reply: FastifyReply
): Promise<void> {
  try {
    // Extract token from header
    const authHeader = request.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      reply.code(401).send({
        success: false,
        error: 'Authentication required',
        code: 'AUTH_REQUIRED',
      });
      return;
    }

    const token = authHeader.substring(7);
    
    // SECURE: Verify JWT token with signature validation
    const verifyResult = authService.verifyToken(token);
    
    if (!verifyResult.valid || !verifyResult.payload) {
      reply.code(401).send({
        success: false,
        error: verifyResult.error || 'Invalid token',
        code: 'INVALID_TOKEN',
      });
      return;
    }

    const payload = verifyResult.payload as TokenPayload;
    
    // Verify token type is access (not refresh)
    if (payload.type !== 'access') {
      reply.code(401).send({
        success: false,
        error: 'Invalid token type',
        code: 'INVALID_TOKEN_TYPE',
      });
      return;
    }
    
    // Set authenticated user on request
    setAuthenticatedUser(request, {
      userId: payload.userId,
      email: payload.email,
      organizationId: payload.organizationId,
      role: payload.role as UserRole,
      permissions: payload.permissions || [],
    });
  } catch (error) {
    logger.error({ error }, 'Auth middleware error');
    reply.code(500).send({
      success: false,
      error: 'Internal server error',
      code: 'INTERNAL_ERROR',
    });
  }
}

/**
 * Middleware factory to require specific role
 */
export function requireRole(requiredRole: UserRole) {
  return async (
    request: FastifyRequest,
    reply: FastifyReply
  ): Promise<void> => {
    const user = getAuthenticatedUser(request);
    if (!user) {
      reply.code(401).send({
        success: false,
        error: 'Authentication required',
        code: 'AUTH_REQUIRED',
      });
      return;
    }

    if (!hasRoleLevel(user.role, requiredRole)) {
      reply.code(403).send({
        success: false,
        error: 'Insufficient role permissions',
        code: 'FORBIDDEN',
        required: requiredRole,
        current: user.role,
      });
      return;
    }
  };
}

/**
 * Middleware factory to require specific permission
 */
export function requirePermission(permission: string) {
  return async (
    request: FastifyRequest,
    reply: FastifyReply
  ): Promise<void> => {
    const user = getAuthenticatedUser(request);
    if (!user) {
      reply.code(401).send({
        success: false,
        error: 'Authentication required',
        code: 'AUTH_REQUIRED',
      });
      return;
    }

    if (!hasPermission(user.role, user.permissions, permission)) {
      reply.code(403).send({
        success: false,
        error: 'Insufficient permissions',
        code: 'FORBIDDEN',
        required: permission,
      });
      return;
    }
  };
}

/**
 * Middleware to require super admin role
 */
export async function requireSuperAdmin(
  request: FastifyRequest,
  reply: FastifyReply
): Promise<void> {
  const user = getAuthenticatedUser(request);
  if (!user) {
    reply.code(401).send({
      success: false,
      error: 'Authentication required',
      code: 'AUTH_REQUIRED',
    });
    return;
  }

  if (user.role !== 'super_admin') {
    reply.code(403).send({
      success: false,
      error: 'Super admin access required',
      code: 'SUPER_ADMIN_REQUIRED',
    });
    return;
  }
}

/**
 * Middleware to require org admin or higher
 */
export async function requireOrgAdmin(
  request: FastifyRequest,
  reply: FastifyReply
): Promise<void> {
  const user = getAuthenticatedUser(request);
  if (!user) {
    reply.code(401).send({
      success: false,
      error: 'Authentication required',
      code: 'AUTH_REQUIRED',
    });
    return;
  }

  if (!hasRoleLevel(user.role, 'org_admin')) {
    reply.code(403).send({
      success: false,
      error: 'Organization admin access required',
      code: 'ORG_ADMIN_REQUIRED',
    });
    return;
  }
}

/**
 * Middleware to check organization isolation
 * Ensures user can only access resources in their own organization
 */
export function requireOrganizationAccess(getOrganizationId: (request: FastifyRequest) => string | Promise<string>) {
  return async (
    request: FastifyRequest,
    reply: FastifyReply
  ): Promise<void> => {
    const user = getAuthenticatedUser(request);
    if (!user) {
      reply.code(401).send({
        success: false,
        error: 'Authentication required',
        code: 'AUTH_REQUIRED',
      });
      return;
    }

    // Super admin can access all organizations
    if (user.role === 'super_admin') {
      return;
    }

    try {
      const resourceOrgId = await getOrganizationId(request);
      
      if (user.organizationId !== resourceOrgId) {
        reply.code(403).send({
          success: false,
          error: 'Access denied to this organization',
          code: 'ORGANIZATION_ACCESS_DENIED',
        });
        return;
      }
    } catch (error) {
      logger.error({ error }, 'Organization access check failed');
      reply.code(500).send({
        success: false,
        error: 'Failed to verify organization access',
        code: 'INTERNAL_ERROR',
      });
    }
  };
}

// ============================================================================
// ROUTE PROTECTION DECORATORS
// ============================================================================

/**
 * Permission requirements for route groups
 */
export const routePermissions = {
  // Super Admin only routes
  superAdmin: {
    '/api/super-admin/*': ['super_admin'],
  },
  
  // Org Admin routes
  admin: {
    '/api/admin/routers': ['routers:read'],
    '/api/admin/routers/create': ['routers:create'],
    '/api/admin/routers/:id': ['routers:read'],
    '/api/admin/routers/:id/update': ['routers:update'],
    '/api/admin/routers/:id/delete': ['routers:delete'],
    
    '/api/admin/ppp': ['ppp:read'],
    '/api/admin/ppp/create': ['ppp:create'],
    '/api/admin/ppp/:id': ['ppp:read'],
    '/api/admin/ppp/:id/update': ['ppp:update'],
    '/api/admin/ppp/:id/delete': ['ppp:delete'],
    '/api/admin/ppp/:id/disconnect': ['ppp:disconnect'],
    
    '/api/admin/users': ['users:read'],
    '/api/admin/users/create': ['users:create'],
    '/api/admin/users/:id': ['users:read'],
    '/api/admin/users/:id/update': ['users:update'],
    '/api/admin/users/:id/delete': ['users:delete'],
    
    '/api/admin/billing': ['billing:read'],
    '/api/admin/billing/update': ['billing:update'],
    
    '/api/admin/analytics': ['analytics:read'],
    '/api/admin/reports': ['reports:read'],
    '/api/admin/reports/create': ['reports:create'],
    
    '/api/admin/settings': ['settings:read'],
    '/api/admin/settings/update': ['settings:update'],
  },
  
  // Technician routes
  technician: {
    '/api/technician/routers': ['routers:read'],
    '/api/technician/ppp': ['ppp:read'],
    '/api/technician/ppp/create': ['ppp:create'],
    '/api/technician/ppp/:id/disconnect': ['ppp:disconnect'],
  },
};

// ============================================================================
// EXPORTS
// ============================================================================

export default {
  requireAuth,
  requireRole,
  requirePermission,
  requireSuperAdmin,
  requireOrgAdmin,
  requireOrganizationAccess,
  hasPermission,
  hasRoleLevel,
  checkOrganizationAccess,
  rolePermissions,
  roleHierarchy,
};
