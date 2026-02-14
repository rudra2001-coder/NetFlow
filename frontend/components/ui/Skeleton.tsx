'use client';

import React from 'react';
import { cn } from '@/lib/utils';

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'text' | 'circular' | 'rectangular';
  width?: string | number;
  height?: string | number;
  animation?: 'pulse' | 'wave' | 'none';
}

export function Skeleton({
  className,
  variant = 'text',
  width,
  height,
  animation = 'pulse',
  ...props
}: SkeletonProps) {
  const variants = {
    text: 'rounded',
    circular: 'rounded-full',
    rectangular: 'rounded-lg',
  };

  const animations = {
    pulse: 'animate-pulse',
    wave: 'animate-shimmer bg-gradient-to-r from-neutral-200 via-neutral-100 to-neutral-200 bg-[length:200%_100%]',
    none: '',
  };

  const style: React.CSSProperties = {
    width: width,
    height: height,
  };

  return (
    <div
      className={cn(
        'bg-neutral-200 dark:bg-neutral-700',
        variants[variant],
        animations[animation],
        className
      )}
      style={style}
      {...props}
    />
  );
}

// Pre-defined skeleton patterns
export function SkeletonCard() {
  return (
    <div className="rounded-xl border bg-white dark:bg-neutral-900 p-5">
      <div className="flex items-start justify-between mb-4">
        <div className="space-y-2">
          <Skeleton width={120} height={14} />
          <Skeleton width={80} height={10} />
        </div>
        <Skeleton width={40} height={40} variant="circular" />
      </div>
      <Skeleton width="100%" height={60} className="mb-4" />
      <div className="flex gap-4">
        <Skeleton width={60} height={24} />
        <Skeleton width={60} height={24} />
        <Skeleton width={60} height={24} />
      </div>
    </div>
  );
}

export function SkeletonTable({ rows = 5, cols = 4 }: { rows?: number; cols?: number }) {
  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex gap-4 border-b border-neutral-200 dark:border-neutral-800 pb-3">
        {Array.from({ length: cols }).map((_, i) => (
          <Skeleton key={i} width={`${100 / cols}%`} height={14} />
        ))}
      </div>
      {/* Rows */}
      {Array.from({ length: rows }).map((_, rowIdx) => (
        <div key={rowIdx} className="flex gap-4 py-2">
          {Array.from({ length: cols }).map((_, colIdx) => (
            <Skeleton key={colIdx} width={`${100 / cols}%`} height={16} />
          ))}
        </div>
      ))}
    </div>
  );
}

export function SkeletonList({ items = 4 }: { items?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: items }).map((_, i) => (
        <div key={i} className="flex items-center gap-3 p-3">
          <Skeleton width={40} height={40} variant="circular" />
          <div className="flex-1 space-y-2">
            <Skeleton width="60%" height={14} />
            <Skeleton width="40%" height={10} />
          </div>
        </div>
      ))}
    </div>
  );
}

export function SkeletonChart() {
  return (
    <div className="h-72 flex items-center justify-center">
      <div className="w-full h-full space-y-4">
        <div className="flex justify-between items-end h-48 gap-2">
          {Array.from({ length: 12 }).map((_, i) => (
            <Skeleton
              key={i}
              width="100%"
              height={`${30 + Math.random() * 50}%`}
              className="self-end"
            />
          ))}
        </div>
        <div className="flex justify-between gap-2">
          {Array.from({ length: 12 }).map((_, i) => (
            <Skeleton key={i} width={40} height={10} />
          ))}
        </div>
      </div>
    </div>
  );
}

export function SkeletonForm({ fields = 4 }: { fields?: number }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: fields }).map((_, i) => (
        <div key={i} className="space-y-2">
          <Skeleton width={100} height={14} />
          <Skeleton width="100%" height={40} />
        </div>
      ))}
    </div>
  );
}

export function SkeletonStats({ items = 4 }: { items?: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {Array.from({ length: items }).map((_, i) => (
        <div key={i} className="p-5 space-y-3">
          <div className="flex items-start justify-between">
            <Skeleton width={100} height={14} />
            <Skeleton width={40} height={40} variant="circular" />
          </div>
          <Skeleton width={80} height={32} />
          <div className="flex gap-2">
            <Skeleton width={50} height={20} />
            <Skeleton width={50} height={20} />
            <Skeleton width={50} height={20} />
          </div>
        </div>
      ))}
    </div>
  );
}
