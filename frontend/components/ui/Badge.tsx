'use client';

import React, { forwardRef } from 'react';
import { cn } from '@/lib/utils';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info' | 'status' | 'ppp';
  status?: 'online' | 'offline' | 'degraded' | 'synchronizing' | 'unknown';
  pppStatus?: 'active' | 'disabled' | 'expired' | 'suspended' | 'pending';
  size?: 'sm' | 'md' | 'lg';
  dot?: boolean;
}

const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
  (
    {
      className,
      variant = 'default',
      status,
      pppStatus,
      size = 'md',
      dot = false,
      children,
      ...props
    },
    ref
  ) => {
    const baseStyles = `
      inline-flex items-center font-medium rounded-full
      transition-colors duration-150
    `;

    const variants = {
      default: 'bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300',
      success: 'bg-success-100 text-success-700 dark:bg-success-900/30 dark:text-success-400',
      warning: 'bg-warning-100 text-warning-700 dark:bg-warning-900/30 dark:text-warning-400',
      error: 'bg-error-100 text-error-700 dark:bg-error-900/30 dark:text-error-400',
      info: 'bg-info-100 text-info-700 dark:bg-info-900/30 dark:text-info-400',
      status: '',
      ppp: '',
    };

    const statusColors: Record<string, string> = {
      online: 'bg-status-online text-white',
      offline: 'bg-status-offline text-white',
      degraded: 'bg-status-degraded text-white',
      synchronizing: 'bg-status-synchronizing text-white',
      unknown: 'bg-status-unknown text-white',
    };

    const pppColors: Record<string, string> = {
      active: 'bg-ppp-active text-white',
      disabled: 'bg-ppp-disabled text-white',
      expired: 'bg-ppp-expired text-white',
      suspended: 'bg-ppp-suspended text-white',
      pending: 'bg-ppp-pending text-white',
    };

    const sizes = {
      sm: 'px-2 py-0.5 text-xs',
      md: 'px-2.5 py-1 text-sm',
      lg: 'px-3 py-1.5 text-base',
    };

    const dotColors: Record<string, string> = {
      online: 'bg-status-online',
      offline: 'bg-status-offline',
      degraded: 'bg-status-degraded',
      synchronizing: 'bg-status-synchronizing',
      unknown: 'bg-status-unknown',
      active: 'bg-ppp-active',
      disabled: 'bg-ppp-disabled',
      expired: 'bg-ppp-expired',
      suspended: 'bg-ppp-suspended',
      pending: 'bg-ppp-pending',
    };

    let colorClass = variants[variant];
    if (status) colorClass = statusColors[status];
    if (pppStatus) colorClass = pppColors[pppStatus];

    return (
      <span
        ref={ref}
        className={cn(baseStyles, colorClass, sizes[size], className)}
        {...props}
      >
        {dot && (
          <span
            className={cn(
              'w-1.5 h-1.5 rounded-full mr-1.5',
              (status || pppStatus) && dotColors[status || pppStatus || '']
            )}
          />
        )}
        {children}
      </span>
    );
  }
);

Badge.displayName = 'Badge';

export interface StatusDotProps extends React.HTMLAttributes<HTMLSpanElement> {
  status: 'online' | 'offline' | 'degraded' | 'synchronizing' | 'unknown' | 'active' | 'disabled' | 'expired' | 'suspended' | 'pending';
  pulse?: boolean;
}

const StatusDot = forwardRef<HTMLSpanElement, StatusDotProps>(
  ({ className, status, pulse = false, ...props }, ref) => {
    const statusColors: Record<string, string> = {
      online: 'bg-status-online',
      offline: 'bg-status-offline',
      degraded: 'bg-status-degraded',
      synchronizing: 'bg-status-synchronizing',
      unknown: 'bg-status-unknown',
      active: 'bg-ppp-active',
      disabled: 'bg-ppp-disabled',
      expired: 'bg-ppp-expired',
      suspended: 'bg-ppp-suspended',
      pending: 'bg-ppp-pending',
    };

    return (
      <span
        ref={ref}
        className={cn(
          'relative flex h-2.5 w-2.5',
          className
        )}
        {...props}
      >
        <span
          className={cn(
            'animate-ping absolute inline-flex h-full w-full rounded-full opacity-75',
            statusColors[status]
          )}
        />
        <span
          className={cn(
            'relative inline-flex rounded-full h-2.5 w-2.5',
            statusColors[status]
          )}
        />
      </span>
    );
  }
);

StatusDot.displayName = 'StatusDot';

export { Badge, StatusDot };
