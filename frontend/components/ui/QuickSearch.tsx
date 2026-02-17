'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Search, Command, X, ArrowRight, Zap, Settings, Users, Server, Activity } from 'lucide-react';
import { useRouter } from 'next/navigation';

export const QuickSearch = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const router = useRouter();

  const toggleOpen = useCallback(() => setIsOpen((prev) => !prev), []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        toggleOpen();
      }
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, toggleOpen]);

  const actions = [
    { icon: <Activity className="w-4 h-4" />, label: 'Go to Monitoring', path: '/dashboard/noc', category: 'Navigation' },
    { icon: <Server className="w-4 h-4" />, label: 'Manage Routers', path: '/dashboard/routers', category: 'Management' },
    { icon: <Users className="w-4 h-4" />, label: 'User Control', path: '/dashboard/ppp', category: 'Management' },
    { icon: <Settings className="w-4 h-4" />, label: 'System Settings', path: '/dashboard/settings', category: 'System' },
    { icon: <Zap className="w-4 h-4" />, label: 'Quick Actions', path: '/dashboard/command-center', category: 'Navigation' },
  ];

  const filteredActions = actions.filter((action) =>
    action.label.toLowerCase().includes(query.toLowerCase())
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh] px-4 sm:px-0">
      <div 
        className="fixed inset-0 bg-neutral-950/40 backdrop-blur-sm transition-opacity"
        onClick={() => setIsOpen(false)}
      />
      
      <div className="relative w-full max-w-2xl glass-morphism rounded-2xl overflow-hidden shadow-2xl animate-scaleIn border border-white/10">
        <div className="flex items-center gap-3 px-4 py-4 border-b border-white/10">
          <Search className="w-5 h-5 text-neutral-400" />
          <input
            autoFocus
            className="flex-1 bg-transparent border-none outline-none text-white placeholder:text-neutral-500 text-lg"
            placeholder="Search for pages, actions, or users..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <div className="flex items-center gap-1 px-2 py-1 rounded bg-white/5 border border-white/10 text-[10px] text-neutral-400 font-medium">
            <span className="text-xs">ESC</span>
          </div>
        </div>

        <div className="max-height-[60vh] overflow-y-auto p-2 space-y-4">
          {filteredActions.length > 0 ? (
            <div className="space-y-1">
              {filteredActions.map((action, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    router.push(action.path);
                    setIsOpen(false);
                  }}
                  className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-white/10 transition-colors group"
                >
                  <div className="flex items-center gap-4">
                    <div className="p-2 rounded-lg bg-white/5 text-neutral-400 group-hover:text-primary-400 transition-colors">
                      {action.icon}
                    </div>
                    <div className="text-left">
                      <p className="text-sm font-medium text-neutral-200 group-hover:text-white">{action.label}</p>
                      <p className="text-xs text-neutral-500">{action.category}</p>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-neutral-600 group-hover:text-white group-hover:translate-x-1 transition-all" />
                </button>
              ))}
            </div>
          ) : (
            <div className="py-12 text-center">
              <p className="text-neutral-500">No results found for &quot;{query}&quot;</p>
            </div>
          )}
        </div>

        <div className="px-4 py-3 bg-white/5 border-t border-white/10 flex items-center justify-between text-[11px] text-neutral-500">
          <div className="flex gap-4">
            <span className="flex items-center gap-1"><Command className="w-3 h-3" /> + K to search</span>
            <span className="flex items-center gap-1">↑↓ to navigate</span>
          </div>
          <span className="flex items-center gap-1"><ArrowRight className="w-3 h-3" /> to select</span>
        </div>
      </div>
    </div>
  );
};
