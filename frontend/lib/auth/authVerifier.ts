/**
 * Authentication Verification Utility
 * 
 * SECURITY: This module provides secure authentication verification
 * by calling the backend API instead of trusting localStorage.
 * 
 * IMPORTANT: Never trust client-side data for security decisions!
 * Always verify with the backend.
 */

import { type UserRole, type UserSession } from '@/lib/store/uiStore';

// ============================================================================
// TYPES
// ============================================================================

export interface AuthVerificationResult {
  success: boolean;
  user?: UserSession;
  error?: string;
}

export interface TokenPayload {
  userId: string;
  email: string;
  organizationId: string;
  organizationName?: string;
  role: UserRole;
  permissions: string[];
  exp?: number;
  iat?: number;
}

// ============================================================================
// API VERIFICATION
// ============================================================================

/**
 * Verify authentication with the backend
 * This is the SECURE way to check if a user is authenticated
 * 
 * @returns User session data if valid, null otherwise
 */
export async function verifyAuthWithBackend(): Promise<AuthVerificationResult> {
  try {
    // Get token from localStorage (only for sending to backend)
    const token = getStoredToken();
    
    if (!token) {
      return { success: false, error: 'No token found' };
    }

    // Call backend to verify token
    const response = await fetch('/api/auth/verify', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      credentials: 'include', // Include cookies for refresh token
    });

    if (!response.ok) {
      // Token is invalid or expired
      clearAuthData();
      
      if (response.status === 401) {
        return { success: false, error: 'Token expired or invalid' };
      }
      
      return { success: false, error: 'Authentication failed' };
    }

    const data = await response.json();
    
    if (!data.success || !data.user) {
      clearAuthData();
      return { success: false, error: 'Invalid response from server' };
    }

    // Convert backend user to frontend UserSession
    const userSession: UserSession = {
      id: data.user.id,
      name: `${data.user.firstName || ''} ${data.user.lastName || ''}`.trim() || data.user.email,
      email: data.user.email,
      avatar: data.user.avatar,
      role: data.user.role as UserRole,
      permissions: data.user.permissions || [],
      organizationId: data.user.organizationId,
      organizationName: data.user.organizationName,
      lastActive: Date.now(),
    };

    return { success: true, user: userSession };
  } catch (error) {
    console.error('Auth verification failed:', error);
    return { success: false, error: 'Network error during verification' };
  }
}

/**
 * Verify role access with backend
 * Use this for protecting admin/super-admin routes
 */
export async function verifyRoleAccess(requiredRole: UserRole): Promise<boolean> {
  const result = await verifyAuthWithBackend();
  
  if (!result.success || !result.user) {
    return false;
  }

  const roleHierarchy: Record<UserRole, number> = {
    super_admin: 100,
    org_admin: 50,
    technician: 30,
    reseller: 20,
    user: 10,
  };

  return roleHierarchy[result.user.role] >= roleHierarchy[requiredRole];
}

/**
 * Check if user can access admin panel
 */
export async function verifyAdminAccess(): Promise<AuthVerificationResult> {
  const result = await verifyAuthWithBackend();
  
  if (!result.success || !result.user) {
    return result;
  }

  const hasAccess = ['super_admin', 'org_admin'].includes(result.user.role);
  
  if (!hasAccess) {
    return { 
      success: false, 
      error: 'Admin access required',
      user: result.user 
    };
  }

  return result;
}

/**
 * Check if user can access super admin panel
 */
export async function verifySuperAdminAccess(): Promise<AuthVerificationResult> {
  const result = await verifyAuthWithBackend();
  
  if (!result.success || !result.user) {
    return result;
  }

  if (result.user.role !== 'super_admin') {
    return { 
      success: false, 
      error: 'Super admin access required',
      user: result.user 
    };
  }

  return result;
}

// ============================================================================
// TOKEN MANAGEMENT
// ============================================================================

/**
 * Get stored token from localStorage
 * Note: This is only used for API calls, NOT for security decisions
 */
export function getStoredToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('token');
}

/**
 * Store token in localStorage
 */
export function storeToken(token: string): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem('token', token);
}

/**
 * Get stored user data from localStorage
 * WARNING: This data is NOT verified - only use for UI display
 * For security decisions, always use verifyAuthWithBackend()
 */
export function getStoredUser(): UserSession | null {
  if (typeof window === 'undefined') return null;
  
  try {
    const userData = localStorage.getItem('user');
    if (!userData) return null;
    return JSON.parse(userData) as UserSession;
  } catch {
    return null;
  }
}

/**
 * Store user data in localStorage
 * Note: This is for caching purposes only, not security
 */
export function storeUser(user: UserSession): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem('user', JSON.stringify(user));
}

/**
 * Clear all authentication data
 */
export function clearAuthData(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  localStorage.removeItem('refreshToken');
}

// ============================================================================
// AUTH STATE HOOK
// ============================================================================

/**
 * Custom hook for secure authentication
 * This verifies with backend on mount and provides secure user state
 */
export function useSecureAuth() {
  const [isLoading, setIsLoading] = React.useState(true);
  const [isAuthenticated, setIsAuthenticated] = React.useState(false);
  const [user, setUser] = React.useState<UserSession | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    let mounted = true;

    const verify = async () => {
      setIsLoading(true);
      
      const result = await verifyAuthWithBackend();
      
      if (!mounted) return;

      if (result.success && result.user) {
        setIsAuthenticated(true);
        setUser(result.user);
        setError(null);
        // Update stored user data
        storeUser(result.user);
      } else {
        setIsAuthenticated(false);
        setUser(null);
        setError(result.error || 'Authentication failed');
      }
      
      setIsLoading(false);
    };

    verify();

    return () => {
      mounted = false;
    };
  }, []);

  const logout = React.useCallback(async () => {
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
      setIsAuthenticated(false);
      setUser(null);
    }
  }, []);

  return {
    isLoading,
    isAuthenticated,
    user,
    error,
    logout,
    verify: verifyAuthWithBackend,
  };
}

// Need to import React for the hook
import React from 'react';

// ============================================================================
// EXPORTS
// ============================================================================

export default {
  verifyAuthWithBackend,
  verifyRoleAccess,
  verifyAdminAccess,
  verifySuperAdminAccess,
  getStoredToken,
  storeToken,
  getStoredUser,
  storeUser,
  clearAuthData,
  useSecureAuth,
};
