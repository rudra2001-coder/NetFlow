/**
 * Permission Guard Component
 * Role-Based Access Control for UI components
 * 
 * IMPORTANT: This component uses the CORRECT role system:
 * - super_admin, org_admin, technician, user, reseller
 * 
 * DO NOT use the old 'admin', 'operator', 'viewer' roles!
 */

"use client";

import React, { useCallback, useMemo } from "react";
import { 
  useUIStore, 
  hasPermission as checkPermission,
  hasRoleLevel,
  isRouteAllowed,
  canAccessAdminPanel,
  canAccessSuperAdminPanel,
  defaultRolePermissions,
  type UserRole,
  type PermissionAction,
  type UserSession,
} from "@/lib/store/uiStore";

// ============================================================================
// TYPES
// ============================================================================

export interface PermissionCheck {
  action: PermissionAction;
  resource: string;
}

export interface PermissionGuardProps {
  children: React.ReactNode;
  permission?: PermissionCheck | PermissionCheck[];
  fallback?: React.ReactNode;
  requireAll?: boolean; // If true, user must have ALL permissions
  redirectTo?: string;
}

export interface RestrictedProps {
  children: React.ReactNode;
  permission?: PermissionCheck | PermissionCheck[];
  fallback?: React.ReactNode;
  requireAll?: boolean;
}

// ============================================================================
// PERMISSION CHECKING FUNCTIONS
// ============================================================================

/**
 * Check if user has specific permission(s)
 * Uses the CORRECT role system from uiStore
 */
const checkPermissions = (
  user: UserSession | null,
  permission: PermissionCheck | PermissionCheck[],
  requireAll: boolean
): boolean => {
  if (!user) return false;

  // Super admin has all permissions
  if (user.role === "super_admin") return true;

  const permissions = Array.isArray(permission) ? permission : [permission];

  if (requireAll) {
    return permissions.every((p) =>
      checkPermission(user, p.action, p.resource)
    );
  }

  return permissions.some((p) =>
    checkPermission(user, p.action, p.resource)
  );
};

// ============================================================================
// COMPONENTS
// ============================================================================

/**
 * PermissionGuard Component
 * Wraps content and only renders it if user has required permissions
 * 
 * @example
 * // Single permission check
 * <PermissionGuard permission={{ action: 'read', resource: 'routers' }}>
 *   <RouterList />
 * </PermissionGuard>
 * 
 * @example
 * // Multiple permissions (any)
 * <PermissionGuard permission={[
 *   { action: 'read', resource: 'routers' },
 *   { action: 'read', resource: 'ppp' }
 * ]}>
 *   <NetworkDashboard />
 * </PermissionGuard>
 * 
 * @example
 * // Multiple permissions (all required)
 * <PermissionGuard 
 *   permission={[
 *     { action: 'read', resource: 'billing' },
 *     { action: 'update', resource: 'billing' }
 *   ]}
 *   requireAll
 * >
 *   <BillingEditor />
 * </PermissionGuard>
 */
export const PermissionGuard = ({
  children,
  permission,
  fallback = null,
  requireAll = false,
  redirectTo,
}: PermissionGuardProps) => {
  const user = useUIStore((state) => state.user);

  const hasAccess = useMemo(() => {
    if (!permission) return true; // No permission required
    return checkPermissions(user, permission, requireAll);
  }, [user, permission, requireAll]);

  // Note: redirectTo is not implemented here for security
  // Route protection should happen at the layout/page level
  // This component only handles UI visibility
  if (!hasAccess) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
};

/**
 * Higher-Order Component version
 * 
 * @example
 * const ProtectedRouterList = withPermission(RouterList, { action: 'read', resource: 'routers' });
 */
export function withPermission<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  permission: PermissionCheck | PermissionCheck[],
  fallback?: React.ReactNode
) {
  return function WithPermissionComponent(props: P) {
    return (
      <PermissionGuard permission={permission} fallback={fallback}>
        <WrappedComponent {...props} />
      </PermissionGuard>
    );
  };
}

/**
 * Restricted Component - use as prop restriction={{ permission: {...} }}
 */
export const Restricted = ({
  children,
  permission,
  fallback = (
    <div className="flex items-center justify-center p-4 text-slate-400">
      <span className="text-sm">Access restricted</span>
    </div>
  ),
  requireAll = false,
}: RestrictedProps) => {
  const user = useUIStore((state) => state.user);

  const hasAccess = useMemo(() => {
    if (!permission) return true;
    return checkPermissions(user, permission, requireAll);
  }, [user, permission, requireAll]);

  if (!hasAccess) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
};

// ============================================================================
// HOOKS
// ============================================================================

/**
 * Hook version for programmatic permission checking
 * 
 * @example
 * const { can, check, isAdmin, isSuperAdmin } = usePermission();
 * 
 * if (can('read', 'routers')) {
 *   // Show router data
 * }
 */
export const usePermission = () => {
  const user = useUIStore((state) => state.user);

  const check = useCallback(
    (permission: PermissionCheck | PermissionCheck[], requireAll = false): boolean => {
      return checkPermissions(user, permission, requireAll);
    },
    [user]
  );

  const can = useCallback(
    (action: PermissionAction, resource: string): boolean => {
      if (!user) return false;
      return checkPermission(user, action, resource);
    },
    [user]
  );

  const canAccessRoute = useCallback(
    (route: string): boolean => {
      if (!user) return false;
      return isRouteAllowed(user, route);
    },
    [user]
  );

  const isSuperAdmin = useCallback((): boolean => {
    return user?.role === "super_admin";
  }, [user]);

  const isOrgAdmin = useCallback((): boolean => {
    return user?.role === "org_admin";
  }, [user]);

  const isTechnician = useCallback((): boolean => {
    return user?.role === "technician";
  }, [user]);

  const isReseller = useCallback((): boolean => {
    return user?.role === "reseller";
  }, [user]);

  const isUser = useCallback((): boolean => {
    return user?.role === "user";
  }, [user]);

  const isRole = useCallback(
    (role: UserRole): boolean => {
      return user?.role === role;
    },
    [user]
  );

  const hasRole = useCallback(
    (requiredRole: UserRole): boolean => {
      if (!user) return false;
      return hasRoleLevel(user.role, requiredRole);
    },
    [user]
  );

  return {
    check,
    can,
    canAccessRoute,
    isSuperAdmin,
    isOrgAdmin,
    isTechnician,
    isReseller,
    isUser,
    isRole,
    hasRole,
    user,
  };
};

// ============================================================================
// ROLE BADGE COMPONENT
// ============================================================================

/**
 * Role Badge Component
 * Displays user role with appropriate styling
 */
export const RoleBadge = ({
  size = "sm",
  showLabel = true,
}: {
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
}) => {
  const user = useUIStore((state) => state.user);

  if (!user) return null;

  // Updated role config with CORRECT roles
  const roleConfig: Record<UserRole, { label: string; className: string }> = {
    super_admin: {
      label: "Super Admin",
      className: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300",
    },
    org_admin: {
      label: "Org Admin",
      className: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300",
    },
    technician: {
      label: "Technician",
      className: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
    },
    reseller: {
      label: "Reseller",
      className: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300",
    },
    user: {
      label: "User",
      className: "bg-slate-100 text-slate-700 dark:bg-slate-700/50 dark:text-slate-300",
    },
  };

  const config = roleConfig[user.role] || roleConfig.user;
  const sizeClasses = {
    sm: "px-2 py-0.5 text-xs",
    md: "px-2.5 py-1 text-sm",
    lg: "px-3 py-1.5 text-base",
  };

  return (
    <span
      className={`inline-flex items-center rounded-full font-medium ${config.className} ${sizeClasses[size]}`}
    >
      {showLabel && config.label}
    </span>
  );
};

// ============================================================================
// PERMISSION MATRIX COMPONENT
// ============================================================================

/**
 * Permission Matrix Component for Admin UI
 * Shows what permissions each role has
 */
export const PermissionMatrix = ({
  roles = ["super_admin", "org_admin", "technician", "reseller", "user"],
  resources = [
    { name: "dashboard", label: "Dashboard" },
    { name: "routers", label: "Routers" },
    { name: "ppp", label: "PPP Users" },
    { name: "hotspot", label: "Hotspot" },
    { name: "analytics", label: "Analytics" },
    { name: "billing", label: "Billing" },
    { name: "users", label: "User Management" },
    { name: "settings", label: "System Settings" },
  ],
  actions = [
    { name: "read", label: "View" },
    { name: "create", label: "Create" },
    { name: "update", label: "Edit" },
    { name: "delete", label: "Delete" },
  ],
}: {
  roles?: UserRole[];
  resources?: { name: string; label: string }[];
  actions?: { name: string; label: string }[];
}) => {
  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr>
            <th className="text-left p-2 border border-slate-200 bg-slate-50 dark:bg-slate-800 dark:border-slate-700">
              Resource
            </th>
            {actions.map((action) => (
              <th 
                key={action.name} 
                className="text-center p-2 border border-slate-200 bg-slate-50 dark:bg-slate-800 dark:border-slate-700"
              >
                {action.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {resources.map((resource) => (
            <tr key={resource.name}>
              <td className="p-2 border border-slate-200 dark:border-slate-700 font-medium">
                {resource.label}
              </td>
              {actions.map((action) => (
                <td 
                  key={action.name} 
                  className="p-2 border border-slate-200 dark:border-slate-700 text-center"
                >
                  <div className="flex justify-center gap-1">
                    {roles.map((role) => {
                      const rolePerms = defaultRolePermissions[role];
                      const hasPermission = rolePerms?.permissions?.some(
                        (p) =>
                          p === '*' ||
                          p === `${resource.name}:${action.name}` ||
                          p === `${resource.name}:*` ||
                          p === `*:${action.name}`
                      );

                      const roleColors: Record<UserRole, string> = {
                        super_admin: 'text-red-500',
                        org_admin: 'text-emerald-500',
                        technician: 'text-blue-500',
                        reseller: 'text-purple-500',
                        user: 'text-slate-500',
                      };

                      return (
                        <span
                          key={role}
                          className={`inline-block w-4 h-4 ${
                            hasPermission ? roleColors[role] : "text-slate-300 dark:text-slate-600"
                          }`}
                          title={`${role}: ${hasPermission ? 'Granted' : 'Denied'}`}
                        >
                          {hasPermission ? "✓" : "−"}
                        </span>
                      );
                    })}
                  </div>
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      <div className="mt-2 flex flex-wrap gap-3 text-xs text-slate-500">
        {roles.map((role) => (
          <span key={role} className="flex items-center gap-1">
            <span className={`w-3 h-3 rounded ${
              role === 'super_admin' ? 'bg-red-500' :
              role === 'org_admin' ? 'bg-emerald-500' :
              role === 'technician' ? 'bg-blue-500' :
              role === 'reseller' ? 'bg-purple-500' :
              'bg-slate-500'
            }`} />
            {role}
          </span>
        ))}
      </div>
    </div>
  );
};

// ============================================================================
// EXPORTS
// ============================================================================

export default PermissionGuard;
