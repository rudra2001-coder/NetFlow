/**
 * Permission Utilities for Frontend
 * Role-Based Access Control (RBAC) helper functions
 */

// ============================================================================
// TYPES
// ============================================================================

export type UserRole = 'super_admin' | 'org_admin' | 'technician' | 'user' | 'reseller';

export interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  role: UserRole;
  organizationId: string;
  organizationName?: string;
  permissions: string[];
}

export interface Permission {
  resource: string;
  action: 'create' | 'read' | 'update' | 'delete' | '*' | 'execute';
}

// ============================================================================
// ROLE DEFINITIONS
// ============================================================================

/**
 * Role hierarchy - higher roles inherit permissions from lower roles
 */
export const roleHierarchy: Record<UserRole, number> = {
  super_admin: 100,
  org_admin: 50,
  technician: 30,
  reseller: 20,
  user: 10,
};

/**
 * Role display names
 */
export const roleDisplayNames: Record<UserRole, string> = {
  super_admin: 'Super Admin',
  org_admin: 'Organization Admin',
  technician: 'Technician',
  reseller: 'Reseller',
  user: 'User',
};

/**
 * Role colors for UI
 */
export const roleColors: Record<UserRole, { bg: string; text: string; border: string }> = {
  super_admin: {
    bg: 'bg-red-500/20',
    text: 'text-red-400',
    border: 'border-red-500/30',
  },
  org_admin: {
    bg: 'bg-emerald-500/20',
    text: 'text-emerald-400',
    border: 'border-emerald-500/30',
  },
  technician: {
    bg: 'bg-blue-500/20',
    text: 'text-blue-400',
    border: 'border-blue-500/30',
  },
  reseller: {
    bg: 'bg-purple-500/20',
    text: 'text-purple-400',
    border: 'border-purple-500/30',
  },
  user: {
    bg: 'bg-slate-500/20',
    text: 'text-slate-400',
    border: 'border-slate-500/30',
  },
};

/**
 * Default permissions per role
 */
export const rolePermissions: Record<UserRole, string[]> = {
  super_admin: ['*'],
  org_admin: [
    'routers:*',
    'users:*',
    'ppp:*',
    'hotspot:*',
    'profiles:*',
    'billing:read',
    'billing:update',
    'invoices:*',
    'analytics:read',
    'reports:*',
    'settings:*',
    'audit:read',
  ],
  technician: [
    'routers:read',
    'routers:execute',
    'ppp:create',
    'ppp:read',
    'ppp:update',
    'ppp:disconnect',
    'hotspot:read',
    'hotspot:update',
    'users:read',
    'profiles:read',
    'analytics:read',
  ],
  reseller: [
    'routers:read',
    'ppp:read',
    'ppp:create',
    'profiles:read',
    'billing:read',
    'invoices:read',
  ],
  user: [
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
 * Check multiple permissions (all must be satisfied)
 */
export function hasAllPermissions(
  userRole: UserRole,
  userPermissions: string[],
  requiredPermissions: string[]
): boolean {
  return requiredPermissions.every((perm) =>
    hasPermission(userRole, userPermissions, perm)
  );
}

/**
 * Check multiple permissions (at least one must be satisfied)
 */
export function hasAnyPermission(
  userRole: UserRole,
  userPermissions: string[],
  requiredPermissions: string[]
): boolean {
  return requiredPermissions.some((perm) =>
    hasPermission(userRole, userPermissions, perm)
  );
}

/**
 * Check if user can access admin panel
 */
export function canAccessAdminPanel(userRole: UserRole): boolean {
  return hasRoleLevel(userRole, 'org_admin');
}

/**
 * Check if user can access super admin panel
 */
export function canAccessSuperAdminPanel(userRole: UserRole): boolean {
  return userRole === 'super_admin';
}

/**
 * Get all permissions for a role (including inherited)
 */
export function getRolePermissions(role: UserRole): string[] {
  return rolePermissions[role] || [];
}

/**
 * Get redirect path based on user role
 */
export function getDashboardPath(userRole: UserRole): string {
  switch (userRole) {
    case 'super_admin':
      return '/super-admin/dashboard';
    case 'org_admin':
      return '/admin/dashboard';
    case 'technician':
    case 'reseller':
    case 'user':
    default:
      return '/dashboard';
  }
}

/**
 * Get navigation items based on user role
 */
export function getNavigationItems(userRole: UserRole, userPermissions: string[]) {
  const items: { name: string; href: string; icon: string; permission?: string }[] = [];

  // Dashboard
  items.push({ name: 'Dashboard', href: getDashboardPath(userRole), icon: 'dashboard' });

  // Routers
  if (hasPermission(userRole, userPermissions, 'routers:read')) {
    items.push({ name: 'Routers', href: '/routers', icon: 'router', permission: 'routers:read' });
  }

  // PPP Users
  if (hasPermission(userRole, userPermissions, 'ppp:read')) {
    items.push({ name: 'PPP Users', href: '/ppp', icon: 'users', permission: 'ppp:read' });
  }

  // Hotspot
  if (hasPermission(userRole, userPermissions, 'hotspot:read')) {
    items.push({ name: 'Hotspot', href: '/hotspot', icon: 'wifi', permission: 'hotspot:read' });
  }

  // Profiles
  if (hasPermission(userRole, userPermissions, 'profiles:read')) {
    items.push({ name: 'Profiles', href: '/profiles', icon: 'package', permission: 'profiles:read' });
  }

  // Billing (admin+)
  if (hasPermission(userRole, userPermissions, 'billing:read')) {
    items.push({ name: 'Billing', href: '/billing', icon: 'credit-card', permission: 'billing:read' });
  }

  // Analytics
  if (hasPermission(userRole, userPermissions, 'analytics:read')) {
    items.push({ name: 'Analytics', href: '/analytics', icon: 'chart', permission: 'analytics:read' });
  }

  // Reports
  if (hasPermission(userRole, userPermissions, 'reports:read')) {
    items.push({ name: 'Reports', href: '/reports', icon: 'file-text', permission: 'reports:read' });
  }

  // Settings
  if (hasPermission(userRole, userPermissions, 'settings:read')) {
    items.push({ name: 'Settings', href: '/settings', icon: 'settings', permission: 'settings:read' });
  }

  return items;
}

// ============================================================================
// USER STORAGE HELPERS
// ============================================================================

/**
 * Get current user from localStorage
 */
export function getCurrentUser(): User | null {
  if (typeof window === 'undefined') return null;
  
  try {
    const userData = localStorage.getItem('user');
    if (!userData) return null;
    
    return JSON.parse(userData) as User;
  } catch {
    return null;
  }
}

/**
 * Store user in localStorage
 */
export function setCurrentUser(user: User): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem('user', JSON.stringify(user));
}

/**
 * Clear user from localStorage
 */
export function clearCurrentUser(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('user');
  localStorage.removeItem('token');
}

/**
 * Get auth token
 */
export function getAuthToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('token');
}

/**
 * Set auth token
 */
export function setAuthToken(token: string): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem('token', token);
}

// ============================================================================
// EXPORTS
// ============================================================================

export default {
  hasRoleLevel,
  hasPermission,
  hasAllPermissions,
  hasAnyPermission,
  canAccessAdminPanel,
  canAccessSuperAdminPanel,
  getRolePermissions,
  getDashboardPath,
  getNavigationItems,
  getCurrentUser,
  setCurrentUser,
  clearCurrentUser,
  getAuthToken,
  setAuthToken,
  roleHierarchy,
  roleDisplayNames,
  roleColors,
  rolePermissions,
};
