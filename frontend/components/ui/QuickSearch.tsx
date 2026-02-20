'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Search, Command, X, ArrowRight, Zap, Settings, Users, Server, Activity, User, CreditCard, AlertCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';

// Mock customer data for search - in production this would come from API
interface CustomerResult {
  id: string;
  name: string;
  phone: string;
  username: string;
  status: 'active' | 'suspended' | 'due' | 'expired';
  dueAmount: number;
  expiryDate: string;
}

const mockCustomers: CustomerResult[] = [
  { id: 'CUS001', name: 'Rahim Ahmed', phone: '+8801712345678', username: 'rahim.isp', status: 'active', dueAmount: 0, expiryDate: '2026-03-15' },
  { id: 'CUS002', name: 'Karim Khan', phone: '+8801812345678', username: 'karim.net', status: 'due', dueAmount: 450, expiryDate: '2026-02-20' },
  { id: 'CUS003', name: 'John Doe', phone: '+8801912345678', username: 'john.doe', status: 'suspended', dueAmount: 1200, expiryDate: '2026-02-10' },
  { id: 'CUS004', name: 'Sarah Smith', phone: '+8801512345678', username: 'sarah.s', status: 'active', dueAmount: 0, expiryDate: '2026-03-01' },
  { id: 'CUS005', name: 'Mike Wilson', phone: '+8801612345678', username: 'mike.w', status: 'expired', dueAmount: 890, expiryDate: '2026-02-15' },
];

export const QuickSearch = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [searchType, setSearchType] = useState<'all' | 'customers' | 'pages'>('all');
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

  // Customer search - filters by name, phone, username, or customer ID
  const customerResults = useMemo(() => {
    if (!query || query.length < 2) return [];
    const q = query.toLowerCase();
    return mockCustomers.filter(c => 
      c.name.toLowerCase().includes(q) ||
      c.phone.includes(q) ||
      c.username.toLowerCase().includes(q) ||
      c.id.toLowerCase().includes(q)
    ).slice(0, 5);
  }, [query]);

  const pageActions = [
    { icon: <Activity className="w-4 h-4" />, label: 'Go to Monitoring', path: '/dashboard/noc', category: 'Navigation' },
    { icon: <Server className="w-4 h-4" />, label: 'Manage Routers', path: '/routers', category: 'Network' },
    { icon: <Users className="w-4 h-4" />, label: 'PPP Users', path: '/ppp', category: 'Customers' },
    { icon: <Users className="w-4 h-4" />, label: 'Hotspot Users', path: '/hotspot', category: 'Customers' },
    { icon: <CreditCard className="w-4 h-4" />, label: 'Billing', path: '/billing', category: 'Finance' },
    { icon: <CreditCard className="w-4 h-4" />, label: 'Payments', path: '/accounting/payments', category: 'Finance' },
    { icon: <Settings className="w-4 h-4" />, label: 'System Settings', path: '/settings', category: 'System' },
    { icon: <Zap className="w-4 h-4" />, label: 'Quick Actions', path: '/dashboard/command-center', category: 'Navigation' },
  ];

  const filteredPages = pageActions.filter((action) =>
    action.label.toLowerCase().includes(query.toLowerCase())
  );

  const hasCustomerResults = customerResults.length > 0;
  const hasPageResults = filteredPages.length > 0;

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
            placeholder="Search customers, pages, or actions..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <div className="flex items-center gap-1 px-2 py-1 rounded bg-white/5 border border-white/10 text-[10px] text-neutral-400 font-medium">
            <span className="text-xs">ESC</span>
          </div>
        </div>

        <div className="max-height-[60vh] overflow-y-auto p-2 space-y-4">
          {/* Customer Search Results */}
          {hasCustomerResults && (
            <div className="space-y-1">
              <div className="px-3 py-2 text-xs font-semibold text-neutral-500 uppercase tracking-wider flex items-center gap-2">
                <User className="w-3 h-3" /> Customers
              </div>
              {customerResults.map((customer) => (
                <button
                  key={customer.id}
                  onClick={() => {
                    router.push(`/ppp?search=${customer.username}`);
                    setIsOpen(false);
                  }}
                  className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-white/10 transition-colors group"
                >
                  <div className="flex items-center gap-4">
                    <div className="p-2 rounded-lg bg-white/5 text-neutral-400 group-hover:text-primary-400 transition-colors">
                      <User className="w-4 h-4" />
                    </div>
                    <div className="text-left">
                      <p className="text-sm font-medium text-neutral-200 group-hover:text-white">{customer.name}</p>
                      <p className="text-xs text-neutral-500">{customer.username} • {customer.phone}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`px-2 py-0.5 text-xs font-medium rounded-full border ${
                      customer.status === 'active' ? 'bg-green-500/20 text-green-400 border-green-500/30' :
                      customer.status === 'suspended' ? 'bg-red-500/20 text-red-400 border-red-500/30' :
                      customer.status === 'due' ? 'bg-orange-500/20 text-orange-400 border-orange-500/30' :
                      'bg-neutral-500/20 text-neutral-400 border-neutral-500/30'
                    }`}>
                      {customer.status.charAt(0).toUpperCase() + customer.status.slice(1)}
                    </span>
                    {customer.dueAmount > 0 && (
                      <span className="text-sm font-medium text-orange-400">${customer.dueAmount}</span>
                    )}
                    <ArrowRight className="w-4 h-4 text-neutral-600 group-hover:text-white group-hover:translate-x-1 transition-all" />
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* Page/Action Results */}
          {hasPageResults && (
            <div className="space-y-1">
              <div className="px-3 py-2 text-xs font-semibold text-neutral-500 uppercase tracking-wider flex items-center gap-2">
                <Command className="w-3 h-3" /> Pages & Actions
              </div>
              {filteredPages.map((action, idx) => (
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
          )}

          {!hasCustomerResults && !hasPageResults && query && (
            <div className="py-12 text-center">
              <p className="text-neutral-500">No results found for &quot;{query}&quot;</p>
            </div>
          )}

          {/* Empty state tips */}
          {!query && (
            <div className="py-8 text-center">
              <p className="text-neutral-500 text-sm mb-2">Start typing to search...</p>
              <p className="text-neutral-600 text-xs">Search by customer name, phone, username, or ID</p>
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
