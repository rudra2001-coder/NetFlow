/**
 * Unauthorized Page
 * Shown when user doesn't have required permissions
 */

'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ShieldX, Home, ArrowLeft, LogOut } from 'lucide-react';
import { getCurrentUser, clearCurrentUser, getDashboardPath } from '../../lib/auth/permissions';

export default function UnauthorizedPage() {
  const router = useRouter();

  useEffect(() => {
    // Check if user is logged in
    const user = getCurrentUser();
    if (!user) {
      router.push('/login');
    }
  }, [router]);

  const handleGoBack = () => {
    router.back();
  };

  const handleGoToDashboard = () => {
    const user = getCurrentUser();
    if (user) {
      const path = getDashboardPath(user.role);
      router.push(path);
    } else {
      router.push('/login');
    }
  };

  const handleLogout = () => {
    clearCurrentUser();
    router.push('/login');
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Error Icon */}
        <div className="flex justify-center mb-8">
          <div className="w-24 h-24 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center">
            <ShieldX className="w-12 h-12 text-red-400" />
          </div>
        </div>

        {/* Error Content */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Access Denied</h1>
          <p className="text-slate-400 mb-4">
            You don't have permission to access this page.
          </p>
          <div className="bg-slate-900/50 border border-slate-800 rounded-lg p-4">
            <p className="text-sm text-slate-500">
              If you believe this is an error, please contact your administrator or try logging in with a different account.
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="space-y-3">
          <button
            onClick={handleGoToDashboard}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-colors"
          >
            <Home className="w-5 h-5" />
            Go to Dashboard
          </button>
          
          <button
            onClick={handleGoBack}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-lg font-medium transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Go Back
          </button>
          
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 rounded-lg font-medium transition-colors"
          >
            <LogOut className="w-5 h-5" />
            Logout
          </button>
        </div>

        {/* Help Link */}
        <div className="mt-8 text-center">
          <p className="text-sm text-slate-500">
            Need help?{' '}
            <Link href="/support" className="text-blue-400 hover:text-blue-300">
              Contact Support
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
