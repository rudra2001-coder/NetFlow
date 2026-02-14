/**
 * Role Badge Component
 * Displays user role with appropriate styling
 */

'use client';

import { Shield, User, Wrench, Users, Crown } from 'lucide-react';
import { UserRole, roleDisplayNames, roleColors } from '../../lib/auth/permissions';

// ============================================================================
// TYPES
// ============================================================================

interface RoleBadgeProps {
  role: UserRole;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
  className?: string;
}

// ============================================================================
// ICONS
// ============================================================================

const roleIcons: Record<UserRole, React.ComponentType<{ className?: string }>> = {
  super_admin: Crown,
  org_admin: Shield,
  technician: Wrench,
  reseller: Users,
  user: User,
};

// ============================================================================
// COMPONENT
// ============================================================================

export function RoleBadge({ role, size = 'md', showIcon = true, className = '' }: RoleBadgeProps) {
  const colors = roleColors[role];
  const displayName = roleDisplayNames[role];
  const Icon = roleIcons[role];

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs gap-1',
    md: 'px-2.5 py-1 text-sm gap-1.5',
    lg: 'px-3 py-1.5 text-base gap-2',
  };

  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-3.5 h-3.5',
    lg: 'w-4 h-4',
  };

  return (
    <span
      className={`inline-flex items-center rounded-full border font-medium ${colors.bg} ${colors.text} ${colors.border} ${sizeClasses[size]} ${className}`}
    >
      {showIcon && <Icon className={iconSizes[size]} />}
      {displayName}
    </span>
  );
}

// ============================================================================
// COMPACT ROLE INDICATOR
// ============================================================================

interface RoleIndicatorProps {
  role: UserRole;
  className?: string;
}

export function RoleIndicator({ role, className = '' }: RoleIndicatorProps) {
  const colors = roleColors[role];

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className={`w-2 h-2 rounded-full ${colors.bg.replace('/20', '')}`} />
      <span className={`text-sm font-medium ${colors.text}`}>
        {roleDisplayNames[role]}
      </span>
    </div>
  );
}

// ============================================================================
// ROLE CARD (For user profile display)
// ============================================================================

interface RoleCardProps {
  role: UserRole;
  userName?: string;
  userEmail?: string;
  className?: string;
}

export function RoleCard({ role, userName, userEmail, className = '' }: RoleCardProps) {
  const colors = roleColors[role];
  const Icon = roleIcons[role];

  return (
    <div className={`bg-slate-900/50 border border-slate-800 rounded-xl p-4 ${className}`}>
      <div className="flex items-center gap-3">
        <div className={`w-12 h-12 rounded-xl ${colors.bg} flex items-center justify-center`}>
          <Icon className={`w-6 h-6 ${colors.text}`} />
        </div>
        <div>
          {userName && <p className="text-white font-medium">{userName}</p>}
          {userEmail && <p className="text-sm text-slate-500">{userEmail}</p>}
          <RoleBadge role={role} size="sm" className="mt-1" />
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// ROLE PERMISSIONS INFO
// ============================================================================

interface RolePermissionsInfoProps {
  role: UserRole;
  className?: string;
}

export function RolePermissionsInfo({ role, className = '' }: RolePermissionsInfoProps) {
  const roleDescriptions: Record<UserRole, string> = {
    super_admin: 'Full system access across all organizations. Can create and manage ISPs.',
    org_admin: 'Full access to organization resources. Can manage routers, users, and billing.',
    technician: 'Can manage PPP users and view router information.',
    reseller: 'Can create PPP users and view billing information.',
    user: 'Basic read-only access to view network status.',
  };

  return (
    <div className={`bg-slate-900/50 border border-slate-800 rounded-xl p-4 ${className}`}>
      <h4 className="text-white font-medium mb-2">Role Permissions</h4>
      <p className="text-sm text-slate-400">{roleDescriptions[role]}</p>
    </div>
  );
}

// ============================================================================
// EXPORTS
// ============================================================================

export default RoleBadge;
