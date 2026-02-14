'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { cn } from '@/lib/utils';
import {
  Search,
  Command,
  Router,
  Users,
  FileText,
  Shield,
  Settings,
  Bell,
  ArrowRight,
  Keyboard,
  X,
} from 'lucide-react';

interface CommandBarProps {
  isOpen: boolean;
  onClose: () => void;
}

interface SearchResult {
  id: string;
  type: 'router' | 'ppp' | 'template' | 'policy' | 'automation' | 'setting';
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  action?: () => void;
}

const mockResults: SearchResult[] = [
  {
    id: '1',
    type: 'router',
    title: 'RTR-HQ-01',
    subtitle: 'Main HQ Router • 192.168.1.1',
    icon: <Router className="w-4 h-4" />,
  },
  {
    id: '2',
    type: 'router',
    title: 'RTR-BRANCH-15',
    subtitle: 'Branch Office Router • 192.168.15.1',
    icon: <Router className="w-4 h-4" />,
  },
  {
    id: '3',
    type: 'ppp',
    title: 'user-3421@example.com',
    subtitle: 'Active PPP User • Profile: Gold',
    icon: <Users className="w-4 h-4" />,
  },
  {
    id: '4',
    type: 'template',
    title: 'Firewall Rules v2.1',
    subtitle: 'Template • Last used: 2 hours ago',
    icon: <FileText className="w-4 h-4" />,
  },
  {
    id: '5',
    type: 'policy',
    title: 'Compliance Policy',
    subtitle: 'Policy • 156 rules enforced',
    icon: <Shield className="w-4 h-4" />,
  },
];

export function CommandBar({ isOpen, onClose }: CommandBarProps) {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [results, setResults] = useState<SearchResult[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Focus input when opened
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  // Filter results based on query
  useEffect(() => {
    if (!query.trim()) {
      setResults(mockResults.slice(0, 5));
    } else {
      const filtered = mockResults.filter(
        (r) =>
          r.title.toLowerCase().includes(query.toLowerCase()) ||
          r.subtitle.toLowerCase().includes(query.toLowerCase())
      );
      setResults(filtered.slice(0, 8));
    }
    setSelectedIndex(0);
  }, [query]);

  // Keyboard navigation
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setSelectedIndex((i) => Math.min(i + 1, results.length - 1));
          break;
        case 'ArrowUp':
          e.preventDefault();
          setSelectedIndex((i) => Math.max(i - 1, 0));
          break;
        case 'Enter':
          e.preventDefault();
          if (results[selectedIndex]) {
            results[selectedIndex].action?.();
            onClose();
          }
          break;
        case 'Escape':
          e.preventDefault();
          onClose();
          break;
      }
    },
    [results, selectedIndex, onClose]
  );

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  // Global keyboard shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        isOpen ? onClose() : undefined; // Will be triggered by parent
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const getTypeColor = (type: SearchResult['type']) => {
    switch (type) {
      case 'router':
        return 'text-primary-500 bg-primary-100 dark:bg-primary-900/30';
      case 'ppp':
        return 'text-success-500 bg-success-100 dark:bg-success-900/30';
      case 'template':
        return 'text-accent-500 bg-accent-100 dark:bg-accent-900/30';
      case 'policy':
        return 'text-warning-500 bg-warning-100 dark:bg-warning-900/30';
      case 'automation':
        return 'text-info-500 bg-info-100 dark:bg-info-900/30';
      default:
        return 'text-neutral-500 bg-neutral-100 dark:bg-neutral-800';
    }
  };

  return (
    <div className="fixed inset-0 z-50">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-fade-in" />

      {/* Dialog */}
      <div
        ref={containerRef}
        className="absolute top-[20%] left-1/2 -translate-x-1/2 w-full max-w-2xl animate-scale-in"
      >
        {/* Search Input */}
        <div className="bg-white dark:bg-neutral-900 rounded-xl shadow-2xl border border-neutral-200 dark:border-neutral-700 overflow-hidden">
          <div className="flex items-center gap-3 px-4 py-4 border-b border-neutral-200 dark:border-neutral-700">
            <Search className="w-5 h-5 text-neutral-400" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Search routers, PPP users, templates, policies..."
              className="flex-1 bg-transparent text-lg text-neutral-900 dark:text-white placeholder-neutral-400 outline-none"
            />
            <kbd className="hidden sm:inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-neutral-400 bg-neutral-100 dark:bg-neutral-800 rounded">
              <Keyboard className="w-3 h-3" />
              ESC
            </kbd>
            <button
              onClick={onClose}
              className="p-1 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-neutral-400" />
            </button>
          </div>

          {/* Results */}
          <div className="max-h-96 overflow-y-auto">
            {results.length > 0 ? (
              <div className="py-2">
                {results.map((result, index) => (
                  <button
                    key={result.id}
                    onClick={() => {
                      result.action?.();
                      onClose();
                    }}
                    className={cn(
                      'w-full flex items-center gap-3 px-4 py-3 text-left transition-colors',
                      index === selectedIndex
                        ? 'bg-primary-50 dark:bg-primary-900/20'
                        : 'hover:bg-neutral-50 dark:hover:bg-neutral-800/50'
                    )}
                  >
                    <div
                      className={cn(
                        'flex items-center justify-center w-8 h-8 rounded-lg',
                        getTypeColor(result.type)
                      )}
                    >
                      {result.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-neutral-900 dark:text-white truncate">
                        {result.title}
                      </p>
                      <p className="text-xs text-neutral-500 dark:text-neutral-400 truncate">
                        {result.subtitle}
                      </p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-neutral-300 dark:text-neutral-600" />
                  </button>
                ))}
              </div>
            ) : (
              <div className="py-12 text-center">
                <Search className="w-12 h-12 text-neutral-300 dark:text-neutral-600 mx-auto mb-4" />
                <p className="text-neutral-500 dark:text-neutral-400">
                  No results found for &ldquo;{query}&rdquo;
                </p>
                <p className="text-sm text-neutral-400 dark:text-neutral-500 mt-1">
                  Try a different search term
                </p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-4 py-3 border-t border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800/50">
            <div className="flex items-center justify-between text-xs text-neutral-500 dark:text-neutral-400">
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1">
                  <kbd className="px-1.5 py-0.5 bg-neutral-200 dark:bg-neutral-700 rounded text-[10px]">↑</kbd>
                  <kbd className="px-1.5 py-0.5 bg-neutral-200 dark:bg-neutral-700 rounded text-[10px]">↓</kbd>
                  Navigate
                </span>
                <span className="flex items-center gap-1">
                  <kbd className="px-1.5 py-0.5 bg-neutral-200 dark:bg-neutral-700 rounded text-[10px]">↵</kbd>
                  Select
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span>Search by: Routers, PPP Users, Templates, Policies, Settings</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Hook for using command bar
export function useCommandBar() {
  const [isOpen, setIsOpen] = useState(false);

  const toggle = useCallback(() => setIsOpen((v) => !v), []);
  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);

  return {
    isOpen,
    toggle,
    open,
    close,
    CommandBar: () => <CommandBar isOpen={isOpen} onClose={close} />,
  };
}
