/**
 * Admin Panel Layout (ISP Level Admin)
 * Blue/Green theme for ISP administrators
 * Controls a single organization/ISP
 * 
 * SECURITY: Uses backend verification instead of trusting localStorage
 */

'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { 
  LayoutDashboard, 
  Router, 
  Users, 
  Package, 
  Wifi, 
  CreditCard, 
  BarChart3, 
  FileText, 
  UsersRound,
  Settings,
  Menu,
  Bell,
  LogOut,
  ChevronRight,
  Building2,
  ShieldCheck,
  AlertTriangle
} from 'lucide-react';
import { 
  useUIStore, 
  type UserSession, 
  type UserRole,
  canAccessAdminPanel 
} from '@/lib/store/uiStore';
import { 
  verifyAdminAccess, 
  clearAuthData, 
  getStoredToken 
} from '@/lib/auth/authVerifier';

// ============================================================================
// NAVIGATION CONFIGURATION
// ============================================================================

const adminNavItems = [
  { name: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
  { name: 'Routers', href: '/admin/routers', icon: Router },
  { name: 'PPP Users', href: '/admin/ppp', icon: Users },
  { name: 'Profiles / Packages', href: '/admin/profiles', icon: Package },
  { name: 'Hotspot', href: '/admin/hotspot', icon: Wifi },
  { name: 'Billing', href: '/admin/billing', icon: CreditCard },
  { name: 'Analytics', href: '/admin/analytics', icon: BarChart3 },
  { name: 'Reports', href: '/admin/reports', icon: FileText },
  { name: 'Staff Management', href: '/admin/staff', icon: UsersRound },
  { name: 'Settings', href: '/admin/settings', icon: Settings },
];

// ============================================================================
// LAYOUT COMPONENT
// ============================================================================

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [user, setUser] = useState<UserSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);
  
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
    const result = await verifyAdminAccess();

    if (!result.success) {
      // Not authenticated or not authorized
      setAuthError(result.error || 'Access denied');
      
      if (result.user) {
        // User is authenticated but not authorized for admin panel
        // Redirect to their appropriate dashboard
        router.push('/dashboard');
      } else {
        // Not authenticated - redirect to login
        clearAuthData();
        router.push('/login');
      }
      
      setLoading(false);
      return;
    }

    // Success - user is verified as admin
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
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-slate-400">Verifying admin access...</p>
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
          <button
            onClick={() => router.push('/login')}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
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
        <div className="h-full px-3 py-4 overflow-y-auto bg-gradient-to-b from-slate-900 to-slate-950 border-r border-slate-800 w-64">
          {/* Logo */}
          <div className="flex items-center gap-3 mb-8 px-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-emerald-500 flex items-center justify-center">
              <span className="text-white font-bold text-lg">N</span>
            </div>
            <div>
              <h1 className="text-white font-bold text-lg">NetFlow</h1>
              <span className="text-xs text-blue-400 font-medium">Admin Panel</span>
            </div>
          </div>

          {/* Organization Badge */}
          <div className="mb-6 px-2">
            <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-1">
                <Building2 className="w-3.5 h-3.5 text-blue-400" />
                <p className="text-xs text-blue-400">Organization</p>
              </div>
              <p className="text-sm text-white font-medium truncate">
                {user?.organizationName || 'ISP Organization'}
              </p>
            </div>
          </div>

          {/* Navigation */}
          <nav className="space-y-1">
            {adminNavItems.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group ${
                    isActive
                      ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
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

          {/* Role Badge */}
          <div className="absolute bottom-24 left-3 right-3">
            <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-3">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span className="text-xs text-emerald-400 font-medium">
                  {user?.role === 'super_admin' ? 'Super Admin' : 'Admin Access'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className={`transition-all duration-300 ${sidebarOpen ? 'ml-64' : 'ml-0'}`}>
        {/* Top Header */}
        <header className="sticky top-0 z-30 bg-slate-900/80 backdrop-blur-xl border-b border-slate-800">
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
                <h2 className="text-white font-semibold">
                  {adminNavItems.find(item => pathname.startsWith(item.href))?.name || 'Admin Panel'}
                </h2>
                <p className="text-xs text-slate-500">Manage your ISP operations</p>
              </div>
            </div>

            {/* Right Side */}
            <div className="flex items-center gap-4">
              {/* Notifications */}
              <button className="relative p-2 rounded-lg text-slate-400 hover:bg-slate-800 hover:text-white transition-colors">
                <Bell className="w-5 h-5" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
              </button>

              {/* User Menu */}
              <div className="flex items-center gap-3 pl-4 border-l border-slate-700">
                <div className="text-right">
                  <p className="text-sm text-white font-medium">{user?.name}</p>
                  <p className="text-xs text-slate-500">{user?.email}</p>
                </div>
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-emerald-500 flex items-center justify-center">
                  <span className="text-white font-semibold">
                    {user?.name?.charAt(0).toUpperCase() || 'A'}
                  </span>
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
