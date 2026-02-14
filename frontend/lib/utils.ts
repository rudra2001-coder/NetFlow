import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatBytes(bytes: number, decimals = 2): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB'];
  
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

export function formatNumber(num: number): string {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  }
  return num.toString();
}

export function formatPercentage(value: number, total: number): string {
  if (total === 0) return '0%';
  return ((value / total) * 100).toFixed(1) + '%';
}

export function formatUptime(seconds: number): string {
  if (seconds < 60) return `${seconds}s`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ${Math.floor((seconds % 3600) / 60)}m`;
  return `${Math.floor(seconds / 86400)}d ${Math.floor((seconds % 86400) / 3600)}h`;
}

export function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    online: 'text-status-online',
    active: 'text-status-online',
    success: 'text-status-online',
    ok: 'text-status-online',
    degraded: 'text-status-degraded',
    warning: 'text-status-degraded',
    offline: 'text-status-offline',
    error: 'text-status-offline',
    failed: 'text-status-offline',
    critical: 'text-status-offline',
    pending: 'text-status-synchronizing',
    synchronizing: 'text-status-synchronizing',
    unknown: 'text-status-unknown',
    disabled: 'text-neutral-500',
    suspended: 'text-status-offline',
    expired: 'text-status-degraded',
  };
  return colors[status.toLowerCase()] || 'text-neutral-500';
}

export function getStatusBgColor(status: string): string {
  const colors: Record<string, string> = {
    online: 'bg-status-online',
    active: 'bg-status-online',
    success: 'bg-status-online',
    ok: 'bg-status-online',
    degraded: 'bg-status-degraded',
    warning: 'bg-status-degraded',
    offline: 'bg-status-offline',
    error: 'bg-status-offline',
    failed: 'bg-status-offline',
    critical: 'bg-status-offline',
    pending: 'bg-status-synchronizing',
    synchronizing: 'bg-status-synchronizing',
    unknown: 'bg-status-unknown',
  };
  return colors[status.toLowerCase()] || 'bg-neutral-500';
}

export function debounce<T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;
  
  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

export function throttle<T extends (...args: unknown[]) => unknown>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean = false;
  
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

export function generateId(): string {
  return Math.random().toString(36).substring(2, 15);
}

export function truncate(str: string, length: number): string {
  if (str.length <= length) return str;
  return str.slice(0, length) + '...';
}

export function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

export function slugify(str: string): string {
  return str
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function isValidIpAddress(ip: string): boolean {
  const regex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
  return regex.test(ip);
}

export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}
