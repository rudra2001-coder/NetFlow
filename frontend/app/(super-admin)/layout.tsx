/**
 * Super Admin Panel Layout (SaaS Owner / System Owner)
 * Dark + Red accent theme for powerful feel
 * Controls entire multi-tenant system
 * 
 * SECURITY: Uses backend verification instead of trusting localStorage
 * Only users with 'super_admin' role can access this panel
 */

'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { 
  LayoutDashboard, 
  Building2, 
  Router, 
  CreditCard, 
  BarChart3, 
  Settings, 
  FileText,
  Flag,
  Menu,
  Bell,
  LogOut,
  ChevronRight,
  Shield,
  Database,
  Server,
  Activity,
  Users,
  KeyRound,
  Cpu,
  AlertTriangle
} from 'lucide-react';
import { 
  useUIStore, 
  type UserSession, 
  type UserRole 
} from '@/lib/store/uiStore';
import { 
  verifySuperAdminAccess, 
  clearAuthData, 
  getStoredToken 
} from '@/lib/auth/authVerifier';

// ============================================================================
// NAVIGATION CONFIGURATION
// ============================================================================

const superAdminNavItems = [
  { name: 'Global Dashboard', href: '/super-admin/dashboard', icon: LayoutDashboard },
  { name: 'ISP Management', href: '/super-admin/isps', icon: Building2 },
  { name: 'Router Clusters', href: '/super-admin/clusters', icon: Server },
  { name: 'Global Routers', href: '/super-admin/routers', icon: Router },
  { name: 'Subscription Plans', href: '/super-admin/subscriptions', icon: CreditCard },
  { name: 'System Analytics', href: '/super-admin/analytics', icon: BarChart3 },
  { name: 'Billing Engine', href: '/super-admin/billing', icon: Database },
  { name: 'Command Presets', href: '/super-admin/presets', icon: KeyRound },
  { name: 'Audit Logs', href: '/super-admin/audit', icon: FileText },
  { name: 'System Settings', href: '/super-admin/settings', icon: Settings },
  { name: 'Feature Flags', href: '/super-admin/flags', icon: Flag },
];

// ============================================================================
// LAYOUT COMPONENT
// ============================================================================

interface SuperAdminLayoutProps {
  children: React.ReactNode;
}

export default function SuperAdminLayout({ children }: SuperAdminLayoutProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [user, setUser] = useState<UserSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);
  const [systemStats, setSystemStats] = useState({
    totalIsps: 47,
    activeRouters: 234,
    systemCpu: 34,
    alerts: 5,
  });

  // Get Zustand store actions
  const setUserInStore = useUIStore((state) => state.setUser);
  const logoutFromStore = useUIStore((state) => state.logout);

  // ============================================================================
  // SECURE AUTHENTICATION CHECK
  // ============================================================================

  const checkAuth = useCallback(async () => {
    setLoading(true);
    setAuthError(null);

    // First check if there's a token
    const token = getStoredToken();
    if (!token) {
      router.push('/login');
      setLoading(false);
      return;
    }

    // Verify with backend - THIS IS THE SECURE WAY
    // Using verifySuperAdminAccess which checks for 'super_admin' role specifically
    const result = await verifySuperAdminAccess();

    if (!result.success) {
      // Not authenticated or not authorized
      setAuthError(result.error || 'Super admin access required');
      
      if (result.user) {
        // User is authenticated but not super_admin
        // Redirect to their appropriate panel based on role
        if (result.user.role === 'org_admin') {
          router.push('/admin/dashboard');
        } else {
          router.push('/dashboard');
        }
      } else {
        // Not authenticated - redirect to login
        clearAuthData();
        router.push('/login');
      }
      
      setLoading(false);
      return;
    }

    // Success - user is verified as super_admin
    const verifiedUser = result.user!;
    setUser(verifiedUser);
    setUserInStore(verifiedUser);
    setLoading(false);
  }, [router, setUserInStore]);

  // Run auth check on mount
  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  // ============================================================================
  // LOGOUT HANDLER
  // ============================================================================

  const handleLogout = useCallback(async () => {
    try {
      const token = getStoredToken();
      if (token) {
        // Notify backend about logout
        await fetch('/api/auth/logout', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
      }
    } catch (error) {
      console.error('Logout API call failed:', error);
    } finally {
      clearAuthData();
      logoutFromStore();
      router.push('/login');
    }
  }, [router, logoutFromStore]);

  // ============================================================================
  // LOADING STATE
  // ============================================================================

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-red-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-slate-400">Verifying super admin access...</p>
        </div>
      </div>
    );
  }

  // ============================================================================
  // ERROR STATE
  // ============================================================================

  if (authError && !user) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4 text-center p-8">
          <AlertTriangle className="w-16 h-16 text-red-500" />
          <h2 className="text-xl font-semibold text-white">Access Denied</h2>
          <p className="text-slate-400">{authError}</p>
          <p className="text-sm text-slate-500">Super admin privileges are required to access this panel.</p>
          <button
            onClick={() => router.push('/login')}
            className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  // ============================================================================
  // MAIN LAYOUT
  // ============================================================================

  return (
    <div className="min-h-screen bg-slate-950">
      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 z-40 h-screen transition-transform duration-300 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="h-full px-3 py-4 overflow-y-auto bg-gradient-to-b from-slate-900 to-slate-950 border-r border-red-900/30 w-72">
          {/* Logo */}
          <div className="flex items-center gap-3 mb-8 px-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center shadow-lg shadow-red-500/20">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-white font-bold text-lg">NetFlow</h1>
              <span className="text-xs text-red-400 font-medium flex items-center gap-1">
                <Cpu className="w-3 h-3" />
                Super Admin
              </span>
            </div>
          </div>

          {/* System Stats Mini Cards */}
          <div className="mb-6 px-2 grid grid-cols-2 gap-2">
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-2.5">
              <div className="flex items-center gap-1.5 mb-1">
                <Building2 className="w-3 h-3 text-red-400" />
                <span className="text-xs text-red-400">ISPs</span>
              </div>
              <p className="text-lg font-bold text-white">{systemStats.totalIsps}</p>
            </div>
            <div className="bg-orange-500/10 border border-orange-500/20 rounded-lg p-2.5">
              <div className="flex items-center gap-1.5 mb-1">
                <Router className="w-3 h-3 text-orange-400" />
                <span className="text-xs text-orange-400">Routers</span>
              </div>
              <p className="text-lg font-bold text-white">{systemStats.activeRouters}</p>
            </div>
          </div>

          {/* Navigation */}
          <nav className="space-y-1">
            {superAdminNavItems.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group ${
                    isActive
                      ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                      : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium text-sm">{item.name}</span>
                  {isActive && (
                    <ChevronRight className="w-4 h-4 ml-auto" />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* System Status */}
          <div className="absolute bottom-24 left-3 right-3">
            <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-3 mb-2">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-slate-400">System CPU</span>
                <span className="text-xs text-white">{systemStats.systemCpu}%</span>
              </div>
              <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-full"
                  style={{ width: `${systemStats.systemCpu}%` }}
                />
              </div>
            </div>
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-red-400" />
                <span className="text-xs text-red-400 font-medium">{systemStats.alerts} System Alerts</span>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className={`transition-all duration-300 ${sidebarOpen ? 'ml-72' : 'ml-0'}`}>
        {/* Top Header */}
        <header className="sticky top-0 z-30 bg-slate-900/80 backdrop-blur-xl border-b border-red-900/20">
          <div className="flex items-center justify-between px-6 py-4">
            {/* Left Side */}
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="p-2 rounded-lg text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
              >
                <Menu className="w-6 h-6" />
              </button>
              <div>
                <h2 className="text-white font-semibold flex items-center gap-2">
                  {superAdminNavItems.find(item => pathname.startsWith(item.href))?.name || 'Super Admin Panel'}
                  <span className="px-2 py-0.5 bg-red-500/20 text-red-400 text-xs rounded-full font-medium">
                    SaaS Owner
                  </span>
                </h2>
                <p className="text-xs text-slate-500">Full system control across all tenants</p>
              </div>
            </div>

            {/* Right Side */}
            <div className="flex items-center gap-4">
              {/* System Status Indicator */}
              <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-lg">
                <Activity className="w-4 h-4 text-emerald-400" />
                <span className="text-xs text-emerald-400 font-medium">All Systems Operational</span>
              </div>

              {/* Notifications */}
              <button className="relative p-2 rounded-lg text-slate-400 hover:bg-slate-800 hover:text-white transition-colors">
                <Bell className="w-5 h-5" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse" />
              </button>

              {/* User Menu */}
              <div className="flex items-center gap-3 pl-4 border-l border-slate-700">
                <div className="text-right">
                  <p className="text-sm text-white font-medium">{user?.name}</p>
                  <p className="text-xs text-red-400">Super Admin</p>
                </div>
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center shadow-lg shadow-red-500/20">
                  <Shield className="w-5 h-5 text-white" />
                </div>
                <button
                  onClick={handleLogout}
                  className="p-2 rounded-lg text-slate-400 hover:bg-red-500/10 hover:text-red-400 transition-colors"
                  title="Logout"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-6">
          {children}
        </main>
      </div>

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
}
