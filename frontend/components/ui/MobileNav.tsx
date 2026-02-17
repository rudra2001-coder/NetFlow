'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  Server,
  Users,
  Wifi,
  BarChart3,
  Settings,
  Menu,
  X,
  Home,
  Bell,
  User,
  ChevronLeft,
  MoreHorizontal,
  Search,
  LogOut,
  HelpCircle,
} from 'lucide-react';
import { Button } from './Button';
import { Avatar } from './Avatar';

// Types
export interface MobileNavItem {
  id: string;
  label: string;
  href: string;
  icon: React.ReactNode;
  badge?: number;
}

export interface MobileNavProps {
  items?: MobileNavItem[];
  user?: {
    name: string;
    email?: string;
    avatar?: string;
  };
  onLogout?: () => void;
  onSearch?: () => void;
  onNotification?: () => void;
  notificationCount?: number;
  className?: string;
}

// Default navigation items
const defaultNavItems: MobileNavItem[] = [
  { id: 'home', label: 'Home', href: '/dashboard', icon: <Home className="w-5 h-5" /> },
  { id: 'routers', label: 'Routers', href: '/routers', icon: <Server className="w-5 h-5" /> },
  { id: 'users', label: 'Users', href: '/ppp', icon: <Users className="w-5 h-5" /> },
  { id: 'hotspot', label: 'Hotspot', href: '/hotspot', icon: <Wifi className="w-5 h-5" /> },
  { id: 'more', label: 'More', href: '#more', icon: <MoreHorizontal className="w-5 h-5" /> },
];

// Bottom Navigation Component
export const MobileBottomNav: React.FC<MobileNavProps> = ({
  items = defaultNavItems,
  className,
}) => {
  const pathname = usePathname();
  const [activeId, setActiveId] = useState<string | null>(null);

  useEffect(() => {
    const matchingItem = items.find(item =>
      item.href !== '#more' && pathname.startsWith(item.href)
    );
    setActiveId(matchingItem?.id || null);
  }, [pathname, items]);

  return (
    <nav
      className={cn(
        'fixed bottom-0 left-0 right-0 z-40',
        'bg-white dark:bg-neutral-900',
        'border-t border-neutral-200 dark:border-neutral-800',
        'pb-[env(safe-area-inset-bottom)]',
        className
      )}
    >
      <div className="flex items-center justify-around h-16">
        {items.map((item) => {
          const isActive = activeId === item.id;

          if (item.href === '#more') {
            return (
              <button
                key={item.id}
                className={cn(
                  'flex flex-col items-center justify-center flex-1 h-full',
                  'text-neutral-500 dark:text-neutral-400',
                  'transition-colors duration-200'
                )}
                onClick={() => { }}
              >
                <div className="relative">
                  {item.icon}
                </div>
                <span className="text-xs mt-1">{item.label}</span>
              </button>
            );
          }

          return (
            <Link
              key={item.id}
              href={item.href}
              className={cn(
                'flex flex-col items-center justify-center flex-1 h-full',
                'transition-colors duration-200',
                isActive
                  ? 'text-primary-600 dark:text-primary-400'
                  : 'text-neutral-500 dark:text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200'
              )}
            >
              <div className="relative">
                {item.icon}
                {item.badge && item.badge > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-error-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                    {item.badge > 9 ? '9+' : item.badge}
                  </span>
                )}
              </div>
              <span className="text-xs mt-1 font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

// Mobile Header Component
export interface MobileHeaderProps {
  title?: string;
  showBack?: boolean;
  onBack?: () => void;
  showSearch?: boolean;
  onSearch?: () => void;
  showNotification?: boolean;
  onNotification?: () => void;
  notificationCount?: number;
  rightContent?: React.ReactNode;
  className?: string;
  transparent?: boolean;
}

export const MobileHeader: React.FC<MobileHeaderProps> = ({
  title,
  showBack = false,
  onBack,
  showSearch = false,
  onSearch,
  showNotification = false,
  onNotification,
  notificationCount = 0,
  rightContent,
  className,
  transparent = false,
}) => {
  return (
    <header
      className={cn(
        'fixed top-0 left-0 right-0 z-40',
        'h-14 flex items-center px-4',
        'pt-[env(safe-area-inset-top)]',
        transparent
          ? 'bg-transparent'
          : 'bg-white/95 dark:bg-neutral-900/95 backdrop-blur-sm border-b border-neutral-200 dark:border-neutral-800',
        className
      )}
    >
      {/* Left Section */}
      <div className="flex items-center gap-2 w-20">
        {showBack && (
          <button
            onClick={onBack || (() => window.history.back())}
            className="p-2 -ml-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
            aria-label="Go back"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Center Section */}
      <div className="flex-1 text-center">
        {title && (
          <h1 className="text-base font-semibold text-neutral-900 dark:text-white truncate">
            {title}
          </h1>
        )}
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-1 w-20 justify-end">
        {showSearch && (
          <button
            onClick={onSearch}
            className="p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
            aria-label="Search"
          >
            <Search className="w-5 h-5" />
          </button>
        )}
        {showNotification && (
          <button
            onClick={onNotification}
            className="p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors relative"
            aria-label="Notifications"
          >
            <Bell className="w-5 h-5" />
            {notificationCount > 0 && (
              <span className="absolute top-1 right-1 w-2 h-2 bg-error-500 rounded-full" />
            )}
          </button>
        )}
        {rightContent}
      </div>
    </header>
  );
};

// Mobile Drawer Component
export interface MobileDrawerProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  position?: 'left' | 'right' | 'bottom';
  className?: string;
}

export const MobileDrawer: React.FC<MobileDrawerProps> = ({
  open,
  onClose,
  title,
  children,
  position = 'left',
  className,
}) => {
  // Close on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    if (open) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);

  const positionClasses = {
    left: 'left-0 top-0 bottom-0 h-full w-80 max-w-[85vw]',
    right: 'right-0 top-0 bottom-0 h-full w-80 max-w-[85vw]',
    bottom: 'bottom-0 left-0 right-0 max-h-[85vh] rounded-t-2xl',
  };

  const animationClasses = {
    left: open ? 'translate-x-0' : '-translate-x-full',
    right: open ? 'translate-x-0' : 'translate-x-full',
    bottom: open ? 'translate-y-0' : 'translate-y-full',
  };

  return (
    <>
      {/* Backdrop */}
      {open && (
        <div
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm animate-fadeIn"
          onClick={onClose}
        />
      )}

      {/* Drawer */}
      <div
        className={cn(
          'fixed z-50 bg-white dark:bg-neutral-900 shadow-xl',
          'transition-transform duration-300 ease-out',
          positionClasses[position],
          animationClasses[position],
          className
        )}
      >
        {/* Header */}
        {(title || position === 'bottom') && (
          <div className={cn(
            'flex items-center justify-between p-4',
            'border-b border-neutral-200 dark:border-neutral-800'
          )}>
            {title && (
              <h2 className="text-lg font-semibold text-neutral-900 dark:text-white">
                {title}
              </h2>
            )}
            <button
              onClick={onClose}
              className="p-2 -mr-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
            {position === 'bottom' && !title && (
              <div className="w-10 h-1 bg-neutral-300 dark:bg-neutral-700 rounded-full mx-auto" />
            )}
          </div>
        )}

        {/* Content */}
        <div className="overflow-y-auto overscroll-contain">
          {children}
        </div>
      </div>
    </>
  );
};

// Mobile Menu Component
export interface MobileMenuProps {
  open: boolean;
  onClose: () => void;
  user?: {
    name: string;
    email?: string;
    avatar?: string;
  };
  onLogout?: () => void;
  menuItems?: Array<{
    id: string;
    label: string;
    href?: string;
    icon: React.ReactNode;
    onClick?: () => void;
    badge?: number;
    divider?: boolean;
  }>;
}

export const MobileMenu: React.FC<MobileMenuProps> = ({
  open,
  onClose,
  user,
  onLogout,
  menuItems = defaultMenuItems,
}) => {
  return (
    <MobileDrawer open={open} onClose={onClose} position="left">
      <div className="flex flex-col h-full">
        {/* User Profile */}
        {user && (
          <div className="p-4 bg-neutral-50 dark:bg-neutral-800/50">
            <div className="flex items-center gap-3">
              <Avatar
                src={user.avatar}
                name={user.name}
                size="lg"
              />
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-neutral-900 dark:text-white truncate">
                  {user.name}
                </p>
                {user.email && (
                  <p className="text-sm text-neutral-500 dark:text-neutral-400 truncate">
                    {user.email}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        <nav className="flex-1 p-2">
          {menuItems?.map((item, index) => {
            if (item.divider) {
              return (
                <div
                  key={`divider-${index}`}
                  className="my-2 border-t border-neutral-200 dark:border-neutral-800"
                />
              );
            }

            const content = (
              <>
                <span className="flex-shrink-0 text-neutral-500 dark:text-neutral-400">
                  {item.icon}
                </span>
                <span className="flex-1">{item.label}</span>
                {item.badge !== undefined && item.badge > 0 && (
                  <span className="px-2 py-0.5 text-xs font-semibold bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 rounded-full">
                    {item.badge}
                  </span>
                )}
              </>
            );

            if (item.href) {
              return (
                <Link
                  key={item.id}
                  href={item.href}
                  onClick={onClose}
                  className="flex items-center gap-3 px-4 py-3 rounded-lg text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                >
                  {content}
                </Link>
              );
            }

            return (
              <button
                key={item.id}
                onClick={() => {
                  item.onClick?.();
                  onClose();
                }}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
              >
                {content}
              </button>
            );
          })}
        </nav>

        {/* Logout */}
        {onLogout && (
          <div className="p-2 border-t border-neutral-200 dark:border-neutral-800">
            <button
              onClick={() => {
                onLogout();
                onClose();
              }}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-error-600 dark:text-error-400 hover:bg-error-50 dark:hover:bg-error-900/20 transition-colors"
            >
              <LogOut className="w-5 h-5" />
              <span>Log out</span>
            </button>
          </div>
        )}
      </div>
    </MobileDrawer>
  );
};

const defaultMenuItems: MobileMenuProps['menuItems'] = [
  { id: 'dashboard', label: 'Dashboard', href: '/dashboard', icon: <LayoutDashboard className="w-5 h-5" /> },
  { id: 'routers', label: 'Routers', href: '/routers', icon: <Server className="w-5 h-5" /> },
  { id: 'users', label: 'PPP Users', href: '/ppp', icon: <Users className="w-5 h-5" /> },
  { id: 'hotspot', label: 'Hotspot', href: '/hotspot', icon: <Wifi className="w-5 h-5" /> },
  { id: 'analytics', label: 'Analytics', href: '/analytics', icon: <BarChart3 className="w-5 h-5" /> },
  { divider: true, id: 'div1', label: '', icon: null },
  { id: 'settings', label: 'Settings', href: '/settings', icon: <Settings className="w-5 h-5" /> },
  { id: 'help', label: 'Help & Support', href: '/help', icon: <HelpCircle className="w-5 h-5" /> },
];

// Mobile Search Component
export interface MobileSearchProps {
  open: boolean;
  onClose: () => void;
  onSearch: (query: string) => void;
  placeholder?: string;
  recentSearches?: string[];
  suggestions?: string[];
}

export const MobileSearch: React.FC<MobileSearchProps> = ({
  open,
  onClose,
  onSearch,
  placeholder = 'Search...',
  recentSearches = [],
  suggestions = [],
}) => {
  const [query, setQuery] = useState('');

  useEffect(() => {
    if (!open) {
      setQuery('');
    }
  }, [open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      onSearch(query.trim());
      onClose();
    }
  };

  return (
    <MobileDrawer open={open} onClose={onClose} position="bottom" className="h-auto">
      <form onSubmit={handleSubmit} className="p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={placeholder}
            className="w-full pl-10 pr-4 py-3 bg-neutral-100 dark:bg-neutral-800 rounded-xl text-neutral-900 dark:text-white placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
            autoFocus
          />
        </div>

        {/* Recent Searches */}
        {recentSearches.length > 0 && !query && (
          <div className="mt-4">
            <h3 className="text-xs font-semibold text-neutral-500 uppercase mb-2">Recent</h3>
            <div className="flex flex-wrap gap-2">
              {recentSearches.map((search, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => {
                    setQuery(search);
                    onSearch(search);
                    onClose();
                  }}
                  className="px-3 py-1.5 bg-neutral-100 dark:bg-neutral-800 rounded-full text-sm text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors"
                >
                  {search}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Suggestions */}
        {suggestions.length > 0 && query && (
          <div className="mt-4">
            <h3 className="text-xs font-semibold text-neutral-500 uppercase mb-2">Suggestions</h3>
            <ul className="space-y-1">
              {suggestions
                .filter(s => s.toLowerCase().includes(query.toLowerCase()))
                .slice(0, 5)
                .map((suggestion, index) => (
                  <li key={index}>
                    <button
                      type="button"
                      onClick={() => {
                        onSearch(suggestion);
                        onClose();
                      }}
                      className="w-full text-left px-3 py-2 rounded-lg text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                    >
                      {suggestion}
                    </button>
                  </li>
                ))}
            </ul>
          </div>
        )}
      </form>
    </MobileDrawer>
  );
};

// Hook for mobile detection
export const useIsMobile = (breakpoint = 768) => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < breakpoint);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);

    return () => window.removeEventListener('resize', checkMobile);
  }, [breakpoint]);

  return isMobile;
};

export default MobileBottomNav;