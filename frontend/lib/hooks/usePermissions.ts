/**
 * usePermissions Hook
 * React hook for role-based access control in components
 */

'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
  User,
  UserRole,
  hasPermission as checkPermission,
  hasRoleLevel as checkRoleLevel,
  hasAllPermissions as checkAllPermissions,
  hasAnyPermission as checkAnyPermission,
  canAccessAdminPanel as checkAdminAccess,
  canAccessSuperAdminPanel as checkSuperAdminAccess,
  getDashboardPath,
  getCurrentUser,
  clearCurrentUser,
  roleDisplayNames,
  roleColors,
} from '../auth/permissions';

// ============================================================================
// TYPES
// ============================================================================

interface UsePermissionsReturn {
  // User state
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  
  // Role info
  role: UserRole | null;
  roleDisplayName: string;
  roleColor: { bg: string; text: string; border: string } | null;
  
  // Permission checks
  hasPermission: (permission: string) => boolean;
  hasAllPermissions: (permissions: string[]) => boolean;
  hasAnyPermission: (permissions: string[]) => boolean;
  hasRoleLevel: (requiredRole: UserRole) => boolean;
  
  // Role checks
  isAdmin: boolean;
  isSuperAdmin: boolean;
  isTechnician: boolean;
  isReseller: boolean;
  isUser: boolean;
  
  // Panel access
  canAccessAdminPanel: boolean;
  canAccessSuperAdminPanel: boolean;
  
  // Actions
  logout: () => void;
  redirectToDashboard: () => void;
  requirePermission: (permission: string) => void;
  requireRole: (role: UserRole) => void;
}

// ============================================================================
// HOOK
// ============================================================================

export function usePermissions(): UsePermissionsReturn {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load user on mount
  useEffect(() => {
    const loadUser = () => {
      try {
        const userData = getCurrentUser();
        setUser(userData);
      } catch (error) {
        console.error('Failed to load user:', error);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    loadUser();
  }, []);

  // Derived state
  const role = user?.role ?? null;
  const permissions = user?.permissions ?? [];
  const isAuthenticated = user !== null;

  // Role display info
  const roleDisplayName = role ? roleDisplayNames[role] : '';
  const roleColor = role ? roleColors[role] : null;

  // Permission check functions
  const hasPermission = useCallback(
    (permission: string) => {
      if (!role) return false;
      return checkPermission(role, permissions, permission);
    },
    [role, permissions]
  );

  const hasAllPermissions = useCallback(
    (perms: string[]) => {
      if (!role) return false;
      return checkAllPermissions(role, permissions, perms);
    },
    [role, permissions]
  );

  const hasAnyPermission = useCallback(
    (perms: string[]) => {
      if (!role) return false;
      return checkAnyPermission(role, permissions, perms);
    },
    [role, permissions]
  );

  const hasRoleLevel = useCallback(
    (requiredRole: UserRole) => {
      if (!role) return false;
      return checkRoleLevel(role, requiredRole);
    },
    [role]
  );

  // Role checks
  const isAdmin = role === 'org_admin';
  const isSuperAdmin = role === 'super_admin';
  const isTechnician = role === 'technician';
  const isReseller = role === 'reseller';
  const isUser = role === 'user';

  // Panel access
  const canAccessAdminPanel = role ? checkAdminAccess(role) : false;
  const canAccessSuperAdminPanel = role ? checkSuperAdminAccess(role) : false;

  // Actions
  const logout = useCallback(() => {
    clearCurrentUser();
    setUser(null);
    router.push('/login');
  }, [router]);

  const redirectToDashboard = useCallback(() => {
    if (role) {
      const path = getDashboardPath(role);
      router.push(path);
    }
  }, [role, router]);

  const requirePermission = useCallback(
    (permission: string) => {
      if (!hasPermission(permission)) {
        router.push('/unauthorized');
      }
    },
    [hasPermission, router]
  );

  const requireRole = useCallback(
    (requiredRole: UserRole) => {
      if (!hasRoleLevel(requiredRole)) {
        router.push('/unauthorized');
      }
    },
    [hasRoleLevel, router]
  );

  return {
    // User state
    user,
    isLoading,
    isAuthenticated,
    
    // Role info
    role,
    roleDisplayName,
    roleColor,
    
    // Permission checks
    hasPermission,
    hasAllPermissions,
    hasAnyPermission,
    hasRoleLevel,
    
    // Role checks
    isAdmin,
    isSuperAdmin,
    isTechnician,
    isReseller,
    isUser,
    
    // Panel access
    canAccessAdminPanel,
    canAccessSuperAdminPanel,
    
    // Actions
    logout,
    redirectToDashboard,
    requirePermission,
    requireRole,
  };
}

// ============================================================================
// SPECIALIZED HOOKS
// ============================================================================

/**
 * Hook for admin panel access
 */
export function useAdminAccess() {
  const permissions = usePermissions();
  const router = useRouter();

  useEffect(() => {
    if (!permissions.isLoading && !permissions.canAccessAdminPanel) {
      router.push('/unauthorized');
    }
  }, [permissions.isLoading, permissions.canAccessAdminPanel, router]);

  return permissions;
}

/**
 * Hook for super admin panel access
 */
export function useSuperAdminAccess() {
  const permissions = usePermissions();
  const router = useRouter();

  useEffect(() => {
    if (!permissions.isLoading && !permissions.canAccessSuperAdminPanel) {
      router.push('/unauthorized');
    }
  }, [permissions.isLoading, permissions.canAccessSuperAdminPanel, router]);

  return permissions;
}

/**
 * Hook for requiring specific permission
 */
export function useRequirePermission(permission: string) {
  const permissions = usePermissions();
  const router = useRouter();

  useEffect(() => {
    if (!permissions.isLoading && !permissions.hasPermission(permission)) {
      router.push('/unauthorized');
    }
  }, [permissions.isLoading, permissions.hasPermission, permission, router]);

  return permissions;
}

/**
 * Hook for requiring specific role
 */
export function useRequireRole(requiredRole: UserRole) {
  const permissions = usePermissions();
  const router = useRouter();

  useEffect(() => {
    if (!permissions.isLoading && !permissions.hasRoleLevel(requiredRole)) {
      router.push('/unauthorized');
    }
  }, [permissions.isLoading, permissions.hasRoleLevel, requiredRole, router]);

  return permissions;
}

// ============================================================================
// EXPORTS
// ============================================================================

export default usePermissions;
