'use client';

import React, { forwardRef } from 'react';
import { cn } from '@/lib/utils';

// Base Skeleton Component
export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  width?: string | number;
  height?: string | number;
  variant?: 'text' | 'circular' | 'rectangular' | 'rounded';
  animation?: 'pulse' | 'shimmer' | 'none';
}

export const Skeleton = forwardRef<HTMLDivElement, SkeletonProps>(
  (
    {
      className,
      width,
      height,
      variant = 'text',
      animation = 'shimmer',
      style,
      ...props
    },
    ref
  ) => {
    const variantStyles = {
      text: 'h-4 rounded',
      circular: 'rounded-full',
      rectangular: 'rounded-none',
      rounded: 'rounded-lg',
    };

    const animationStyles = {
      pulse: 'animate-pulse bg-neutral-200 dark:bg-neutral-800',
      shimmer: 'skeleton',
      none: 'bg-neutral-200 dark:bg-neutral-800',
    };

    return (
      <div
        ref={ref}
        className={cn(
          'bg-neutral-200 dark:bg-neutral-800',
          variantStyles[variant],
          animationStyles[animation],
          className
        )}
        style={{
          width: width,
          height: height,
          ...style,
        }}
        {...props}
      />
    );
  }
);

Skeleton.displayName = 'Skeleton';

// Skeleton Text - Multiple lines of text
export interface SkeletonTextProps extends React.HTMLAttributes<HTMLDivElement> {
  lines?: number;
  lineHeight?: number;
  lastLineWidth?: string;
  gap?: number;
}

export const SkeletonText = forwardRef<HTMLDivElement, SkeletonTextProps>(
  ({ lines = 3, lineHeight = 16, lastLineWidth = '60%', gap = 8, className, ...props }, ref) => {
    return (
      <div ref={ref} className={cn('flex flex-col', className)} style={{ gap }} {...props}>
        {Array.from({ length: lines }).map((_, index) => (
          <Skeleton
            key={index}
            variant="text"
            height={lineHeight}
            width={index === lines - 1 ? lastLineWidth : '100%'}
          />
        ))}
      </div>
    );
  }
);

SkeletonText.displayName = 'SkeletonText';

// Skeleton Avatar
export interface SkeletonAvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'circular' | 'rounded';
}

export const SkeletonAvatar = forwardRef<HTMLDivElement, SkeletonAvatarProps>(
  ({ size = 'md', variant = 'circular', className, ...props }, ref) => {
    const sizes = {
      xs: 'w-6 h-6',
      sm: 'w-8 h-8',
      md: 'w-10 h-10',
      lg: 'w-12 h-12',
      xl: 'w-16 h-16',
    };

    return (
      <Skeleton
        ref={ref}
        variant={variant}
        className={cn(sizes[size], className)}
        {...props}
      />
    );
  }
);

SkeletonAvatar.displayName = 'SkeletonAvatar';

// Skeleton Image
export interface SkeletonImageProps extends React.HTMLAttributes<HTMLDivElement> {
  width?: string | number;
  height?: string | number;
  aspectRatio?: string;
}

export const SkeletonImage = forwardRef<HTMLDivElement, SkeletonImageProps>(
  ({ width, height, aspectRatio = '16/9', className, ...props }, ref) => {
    return (
      <Skeleton
        ref={ref}
        variant="rounded"
        width={width}
        height={height}
        className={cn(!height && !width && 'w-full', className)}
        style={{ aspectRatio: height || width ? undefined : aspectRatio }}
        {...props}
      />
    );
  }
);

SkeletonImage.displayName = 'SkeletonImage';

// Skeleton Button
export interface SkeletonButtonProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: 'sm' | 'md' | 'lg';
  width?: string | number;
}

export const SkeletonButton = forwardRef<HTMLDivElement, SkeletonButtonProps>(
  ({ size = 'md', width, className, ...props }, ref) => {
    const sizes = {
      sm: 'h-8 px-3',
      md: 'h-10 px-4',
      lg: 'h-12 px-6',
    };

    return (
      <Skeleton
        ref={ref}
        variant="rounded"
        width={width || 100}
        className={cn(sizes[size], 'rounded-lg', className)}
        {...props}
      />
    );
  }
);

SkeletonButton.displayName = 'SkeletonButton';

// Skeleton Card
export interface SkeletonCardProps extends React.HTMLAttributes<HTMLDivElement> {
  header?: boolean;
  footer?: boolean;
  lines?: number;
  image?: boolean;
  imageAspectRatio?: string;
}

export const SkeletonCard = forwardRef<HTMLDivElement, SkeletonCardProps>(
  (
    {
      header = true,
      footer = false,
      lines = 3,
      image = false,
      imageAspectRatio = '16/9',
      className,
      ...props
    },
    ref
  ) => {
    return (
      <div
        ref={ref}
        className={cn(
          'bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 p-5',
          className
        )}
        {...props}
      >
        {image && (
          <div className="mb-4 -mx-5 -mt-5">
            <SkeletonImage aspectRatio={imageAspectRatio} className="rounded-t-xl" />
          </div>
        )}
        {header && (
          <div className="flex items-center gap-3 mb-4">
            <SkeletonAvatar size="sm" />
            <div className="flex-1">
              <Skeleton variant="text" width="40%" height={14} className="mb-2" />
              <Skeleton variant="text" width="60%" height={12} />
            </div>
          </div>
        )}
        <SkeletonText lines={lines} lastLineWidth="70%" />
        {footer && (
          <div className="flex items-center gap-2 mt-4 pt-4 border-t border-neutral-200 dark:border-neutral-800">
            <SkeletonButton size="sm" width={80} />
            <SkeletonButton size="sm" width={80} />
          </div>
        )}
      </div>
    );
  }
);

SkeletonCard.displayName = 'SkeletonCard';

// Skeleton Table
export interface SkeletonTableProps extends React.HTMLAttributes<HTMLDivElement> {
  rows?: number;
  columns?: number;
  showHeader?: boolean;
}

export const SkeletonTable = forwardRef<HTMLDivElement, SkeletonTableProps>(
  ({ rows = 5, columns = 4, showHeader = true, className, ...props }, ref) => {
    return (
      <div ref={ref} className={cn('w-full', className)} {...props}>
        {showHeader && (
          <div className="flex gap-4 p-4 bg-neutral-50 dark:bg-neutral-800/50 rounded-t-lg border-b border-neutral-200 dark:border-neutral-700">
            {Array.from({ length: columns }).map((_, index) => (
              <Skeleton key={index} variant="text" width={`${100 / columns}%`} height={14} />
            ))}
          </div>
        )}
        {Array.from({ length: rows }).map((_, rowIndex) => (
          <div
            key={rowIndex}
            className="flex gap-4 p-4 border-b border-neutral-100 dark:border-neutral-800"
          >
            {Array.from({ length: columns }).map((_, colIndex) => (
              <Skeleton
                key={colIndex}
                variant="text"
                width={`${100 / columns}%`}
                height={14}
              />
            ))}
          </div>
        ))}
      </div>
    );
  }
);

SkeletonTable.displayName = 'SkeletonTable';

// Skeleton Stat Card
export interface SkeletonStatCardProps extends React.HTMLAttributes<HTMLDivElement> {
  showIcon?: boolean;
  showTrend?: boolean;
}

export const SkeletonStatCard = forwardRef<HTMLDivElement, SkeletonStatCardProps>(
  ({ showIcon = true, showTrend = true, className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 p-5',
          className
        )}
        {...props}
      >
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <Skeleton variant="text" width="40%" height={12} className="mb-2" />
            <Skeleton variant="text" width="60%" height={28} className="mb-1" />
            {showTrend && <Skeleton variant="text" width="50%" height={12} />}
          </div>
          {showIcon && (
            <Skeleton variant="rounded" width={48} height={48} className="rounded-xl" />
          )}
        </div>
      </div>
    );
  }
);

SkeletonStatCard.displayName = 'SkeletonStatCard';

// Skeleton List
export interface SkeletonListProps extends React.HTMLAttributes<HTMLDivElement> {
  items?: number;
  showAvatar?: boolean;
  showAction?: boolean;
}

export const SkeletonList = forwardRef<HTMLDivElement, SkeletonListProps>(
  ({ items = 5, showAvatar = true, showAction = false, className, ...props }, ref) => {
    return (
      <div ref={ref} className={cn('space-y-3', className)} {...props}>
        {Array.from({ length: items }).map((_, index) => (
          <div
            key={index}
            className="flex items-center gap-3 p-3 rounded-lg border border-neutral-100 dark:border-neutral-800"
          >
            {showAvatar && <SkeletonAvatar size="md" />}
            <div className="flex-1">
              <Skeleton variant="text" width="30%" height={14} className="mb-2" />
              <Skeleton variant="text" width="60%" height={12} />
            </div>
            {showAction && <Skeleton variant="rounded" width={60} height={32} className="rounded-lg" />}
          </div>
        ))}
      </div>
    );
  }
);

SkeletonList.displayName = 'SkeletonList';

// Skeleton Dashboard - Pre-built dashboard skeleton
export const SkeletonDashboard = forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => {
    return (
      <div ref={ref} className={cn('space-y-6', className)} {...props}>
        {/* Stats Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <SkeletonStatCard key={index} />
          ))}
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <SkeletonCard lines={5} header />
          </div>
          <div>
            <SkeletonCard lines={4} header />
          </div>
        </div>

        {/* Table Section */}
        <SkeletonCard header={false} className="p-0">
          <div className="p-5 border-b border-neutral-200 dark:border-neutral-800">
            <Skeleton variant="text" width={150} height={20} />
          </div>
          <SkeletonTable rows={5} columns={4} showHeader />
        </SkeletonCard>
      </div>
    );
  }
);

SkeletonDashboard.displayName = 'SkeletonDashboard';

export default Skeleton;
