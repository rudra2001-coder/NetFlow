import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

// ============================================================================
// TYPES - Aligned with backend/src/middleware/permissions.ts
// ============================================================================

/**
 * User roles - MUST match backend exactly
 * These are the ONLY valid roles in the system
 */
export type UserRole = 'super_admin' | 'org_admin' | 'technician' | 'user' | 'reseller';

/**
 * Permission action types
 */
export type PermissionAction = 'create' | 'read' | 'update' | 'delete' | '*' | 'execute';

/**
 * Permission structure - matches backend format
 */
export interface Permission {
  id: string;
  resource: string;
  action: PermissionAction;
}

/**
 * Role permissions configuration
 */
export interface RolePermissions {
  role: UserRole;
  permissions: string[];  // Format: 'resource:action' (e.g., 'routers:read')
  allowedRoutes: string[];
  deniedRoutes: string[];
}

/**
 * User session data
 */
export interface UserSession {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: UserRole;
  permissions: string[];  // Array of 'resource:action' strings
  organizationId?: string;
  organizationName?: string;
  lastActive: number;
}

export interface Notification {
  id: string;
  type: "info" | "success" | "warning" | "error";
  title: string;
  message: string;
  timestamp: number;
  read: boolean;
  actionUrl?: string;
}

export interface NetworkMetric {
  id: string;
  timestamp: number;
  metricType: "bandwidth" | "latency" | "packetLoss" | "connections" | "cpu" | "memory";
  value: number;
  unit: string;
  source: string;
}

export interface PPPConnection {
  id: string;
  userId: string;
  username: string;
  service: string;
  profile: string;
  ipAddress: string;
  macAddress?: string;
  status: "active" | "pending" | "failed" | "disabled";
  bandwidthUp: number;
  bandwidthDown: number;
  bytesIn: number;
  bytesOut: number;
  uptime: number;
  lastActivity: number;
  sessionId?: string;
}

export interface WebSocketMessage {
  type: "metric" | "alert" | "ppp_update" | "connection_status" | "system";
  payload: unknown;
  timestamp: number;
}

// ============================================================================
// ROLE HIERARCHY - Must match backend
// ============================================================================

export const roleHierarchy: Record<UserRole, number> = {
  super_admin: 100,
  org_admin: 50,
  technician: 30,
  reseller: 20,
  user: 10,
};

// ============================================================================
// DEFAULT ROLE PERMISSIONS - Aligned with backend/src/middleware/permissions.ts
// ============================================================================

/**
 * Default permissions per role
 * These MUST match the backend rolePermissions exactly
 */
export const defaultRolePermissions: Record<UserRole, RolePermissions> = {
  super_admin: {
    role: 'super_admin',
    permissions: ['*'],  // Super admin has all permissions
    allowedRoutes: [
      '/super-admin',
      '/admin',
      '/dashboard',
      '/routers',
      '/ppp',
      '/hotspot',
      '/analytics',
      '/network',
      '/settings',
      '/users',
      '/logs',
      '/audit',
      '/isps',
    ],
    deniedRoutes: [],
  },
  org_admin: {
    role: 'org_admin',
    permissions: [
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
    allowedRoutes: [
      '/admin',
      '/dashboard',
      '/routers',
      '/ppp',
      '/hotspot',
      '/analytics',
      '/network',
      '/settings',
      '/users',
      '/logs',
      '/billing',
      '/reports',
    ],
    deniedRoutes: ['/super-admin'],
  },
  technician: {
    role: 'technician',
    permissions: [
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
    allowedRoutes: [
      '/dashboard',
      '/routers',
      '/ppp',
      '/hotspot',
      '/analytics',
      '/network',
    ],
    deniedRoutes: ['/settings', '/users', '/billing', '/super-admin', '/admin'],
  },
  reseller: {
    role: 'reseller',
    permissions: [
      'routers:read',
      'ppp:read',
      'ppp:create',
      'profiles:read',
      'billing:read',
      'invoices:read',
    ],
    allowedRoutes: [
      '/dashboard',
      '/routers',
      '/ppp',
      '/billing',
    ],
    deniedRoutes: ['/settings', '/users', '/hotspot', '/super-admin', '/admin'],
  },
  user: {
    role: 'user',
    permissions: [
      'routers:read',
      'ppp:read',
      'hotspot:read',
      'profiles:read',
    ],
    allowedRoutes: [
      '/dashboard',
      '/analytics',
    ],
    deniedRoutes: ['/routers', '/ppp', '/hotspot', '/network', '/settings', '/users', '/super-admin', '/admin'],
  },
};

// ============================================================================
// PERMISSION HELPER FUNCTIONS
// ============================================================================

/**
 * Check if a role has at least the minimum required level
 */
export function hasRoleLevel(userRole: UserRole, requiredRole: UserRole): boolean {
  return roleHierarchy[userRole] >= roleHierarchy[requiredRole];
}

/**
 * Check if user has a specific permission
 * Format: 'resource:action' (e.g., 'routers:read')
 */
export function hasPermission(
  user: UserSession | null,
  action: PermissionAction,
  resource: string
): boolean {
  if (!user) return false;

  // Super admin has all permissions
  if (user.role === 'super_admin') return true;

  // Check if user has wildcard permission
  if (user.permissions.includes('*')) return true;

  // Build the permission string
  const permissionString = `${resource}:${action}`;

  // Check explicit permission
  if (user.permissions.includes(permissionString)) return true;

  // Check role-based permissions
  const rolePerms = defaultRolePermissions[user.role]?.permissions || [];
  if (rolePerms.includes('*')) return true;
  if (rolePerms.includes(permissionString)) return true;

  // Check wildcard resource permissions (e.g., 'routers:*')
  if (rolePerms.includes(`${resource}:*`) || user.permissions.includes(`${resource}:*`)) {
    return true;
  }

  // Check wildcard action permissions (e.g., '*:read')
  if (rolePerms.includes(`*:${action}`) || user.permissions.includes(`*:${action}`)) {
    return true;
  }

  return false;
}

/**
 * Check if user has any of the specified permissions
 */
export function hasAnyPermission(
  user: UserSession | null,
  permissions: Array<{ action: PermissionAction; resource: string }>
): boolean {
  return permissions.some((p) => hasPermission(user, p.action, p.resource));
}

/**
 * Check if user has all of the specified permissions
 */
export function hasAllPermissions(
  user: UserSession | null,
  permissions: Array<{ action: PermissionAction; resource: string }>
): boolean {
  return permissions.every((p) => hasPermission(user, p.action, p.resource));
}

/**
 * Check if route is allowed for user
 */
export function isRouteAllowed(
  user: UserSession | null,
  route: string
): boolean {
  if (!user) return false;
  const rolePerms = defaultRolePermissions[user.role];
  if (!rolePerms) return false;
  
  return (
    rolePerms.allowedRoutes.some((r) => route.startsWith(r)) &&
    !rolePerms.deniedRoutes.some((r) => route.startsWith(r))
  );
}

/**
 * Check if user can access admin panel
 */
export function canAccessAdminPanel(user: UserSession | null): boolean {
  if (!user) return false;
  return hasRoleLevel(user.role, 'org_admin');
}

/**
 * Check if user can access super admin panel
 */
export function canAccessSuperAdminPanel(user: UserSession | null): boolean {
  if (!user) return false;
  return user.role === 'super_admin';
}

// ============================================================================
// UI STATE INTERFACE
// ============================================================================

interface UIState {
  // Sidebar state
  sidebarCollapsed: boolean;
  mobileSidebarOpen: boolean;
  
  // Theme state
  darkMode: boolean;
  compactMode: boolean;
  
  // User session
  user: UserSession | null;
  isAuthenticated: boolean;
  
  // Notifications
  notifications: Notification[];
  unreadCount: number;
  
  // Real-time metrics
  liveMetrics: Record<string, NetworkMetric[]>;
  pppConnections: PPPConnection[];
  systemAlerts: Notification[];
  
  // WebSocket state
  wsConnected: boolean;
  wsReconnecting: boolean;
  
  // Actions
  setSidebarCollapsed: (collapsed: boolean) => void;
  toggleSidebarCollapsed: () => void;
  setMobileSidebarOpen: (open: boolean) => void;
  toggleMobileSidebarOpen: () => void;
  
  setDarkMode: (dark: boolean) => void;
  toggleDarkMode: () => void;
  setCompactMode: (compact: boolean) => void;
  toggleCompactMode: () => void;
  
  setUser: (user: UserSession | null) => void;
  logout: () => void;
  
  addNotification: (notification: Omit<Notification, "id" | "timestamp" | "read">) => void;
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  clearNotifications: () => void;
  
  updateMetric: (key: string, metric: NetworkMetric) => void;
  clearMetrics: (key: string) => void;
  
  updatePPPConnections: (connections: PPPConnection[]) => void;
  updatePPPConnection: (connection: PPPConnection) => void;
  removePPPConnection: (id: string) => void;
  
  addSystemAlert: (alert: Omit<Notification, "id" | "timestamp" | "read">) => void;
  dismissAlert: (id: string) => void;
  clearAlerts: () => void;
  
  setWsConnected: (connected: boolean) => void;
  setWsReconnecting: (reconnecting: boolean) => void;
}

// ============================================================================
// ZUSTAND STORE
// ============================================================================

export const useUIStore = create<UIState>()(
  persist(
    (set, get) => ({
      // Initial state
      sidebarCollapsed: false,
      mobileSidebarOpen: false,
      darkMode: false,
      compactMode: false,
      user: null,
      isAuthenticated: false,
      notifications: [],
      unreadCount: 0,
      liveMetrics: {},
      pppConnections: [],
      systemAlerts: [],
      wsConnected: false,
      wsReconnecting: false,

      // Sidebar actions
      setSidebarCollapsed: (collapsed) =>
        set({ sidebarCollapsed: collapsed }),
      toggleSidebarCollapsed: () =>
        set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
      setMobileSidebarOpen: (open) =>
        set({ mobileSidebarOpen: open }),
      toggleMobileSidebarOpen: () =>
        set((state) => ({ mobileSidebarOpen: !state.mobileSidebarOpen })),

      // Theme actions
      setDarkMode: (dark) => set({ darkMode: dark }),
      toggleDarkMode: () =>
        set((state) => {
          const newDarkMode = !state.darkMode;
          if (newDarkMode) {
            document.documentElement.classList.add("dark");
          } else {
            document.documentElement.classList.remove("dark");
          }
          return { darkMode: newDarkMode };
        }),
      setCompactMode: (compact) => set({ compactMode: compact }),
      toggleCompactMode: () =>
        set((state) => ({ compactMode: !state.compactMode })),

      // User actions
      setUser: (user) =>
        set({
          user,
          isAuthenticated: !!user,
          notifications: user ? get().notifications : [],
          unreadCount: user ? get().unreadCount : 0,
        }),
      logout: () =>
        set({
          user: null,
          isAuthenticated: false,
          notifications: [],
          unreadCount: 0,
          pppConnections: [],
          systemAlerts: [],
        }),

      // Notification actions
      addNotification: (notification) =>
        set((state) => {
          const newNotification: Notification = {
            ...notification,
            id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            timestamp: Date.now(),
            read: false,
          };
          return {
            notifications: [newNotification, ...state.notifications].slice(0, 50),
            unreadCount: state.unreadCount + 1,
          };
        }),
      markNotificationRead: (id) =>
        set((state) => ({
          notifications: state.notifications.map((n) =>
            n.id === id ? { ...n, read: true } : n
          ),
          unreadCount: Math.max(0, state.unreadCount - 1),
        })),
      markAllNotificationsRead: () =>
        set((state) => ({
          notifications: state.notifications.map((n) => ({ ...n, read: true })),
          unreadCount: 0,
        })),
      clearNotifications: () =>
        set({ notifications: [], unreadCount: 0 }),

      // Metrics actions
      updateMetric: (key, metric) =>
        set((state) => ({
          liveMetrics: {
            ...state.liveMetrics,
            [key]: [...(state.liveMetrics[key] || []), metric].slice(-100),
          },
        })),
      clearMetrics: (key) =>
        set((state) => {
          const { [key]: _, ...rest } = state.liveMetrics;
          return { liveMetrics: rest };
        }),

      // PPP connection actions
      updatePPPConnections: (connections) =>
        set({ pppConnections: connections }),
      updatePPPConnection: (connection) =>
        set((state) => ({
          pppConnections: state.pppConnections.map((c) =>
            c.id === connection.id ? connection : c
          ),
        })),
      removePPPConnection: (id) =>
        set((state) => ({
          pppConnections: state.pppConnections.filter((c) => c.id !== id),
        })),

      // Alert actions
      addSystemAlert: (alert) =>
        set((state) => {
          const newAlert: Notification = {
            ...alert,
            id: `alert-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            timestamp: Date.now(),
            read: false,
          };
          return {
            systemAlerts: [newAlert, ...state.systemAlerts].slice(0, 20),
          };
        }),
      dismissAlert: (id) =>
        set((state) => ({
          systemAlerts: state.systemAlerts.filter((a) => a.id !== id),
        })),
      clearAlerts: () => set({ systemAlerts: [] }),

      // WebSocket actions
      setWsConnected: (connected) => set({ wsConnected: connected }),
      setWsReconnecting: (reconnecting) => set({ wsReconnecting: reconnecting }),
    }),
    {
      name: "netflow-ui-storage",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        sidebarCollapsed: state.sidebarCollapsed,
        darkMode: state.darkMode,
        compactMode: state.compactMode,
        // Note: We do NOT persist user data for security
        // User must re-authenticate on page load
      }),
    }
  )
);

// ============================================================================
// SELECTORS
// ============================================================================

export const useSidebarCollapsed = () =>
  useUIStore((state) => state.sidebarCollapsed);

export const useDarkMode = () =>
  useUIStore((state) => state.darkMode);

export const useUser = () =>
  useUIStore((state) => state.user);

export const useUnreadCount = () =>
  useUIStore((state) => state.unreadCount);

export const usePPPConnections = () =>
  useUIStore((state) => state.pppConnections);

export const useLiveMetrics = (key: string) =>
  useUIStore((state) => state.liveMetrics[key] || []);

export const useSystemAlerts = () =>
  useUIStore((state) => state.systemAlerts);

export const useWsConnected = () =>
  useUIStore((state) => state.wsConnected);

export const useIsAuthenticated = () =>
  useUIStore((state) => state.isAuthenticated);
