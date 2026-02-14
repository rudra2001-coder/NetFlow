'use client';

import React, { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';
import {
  Globe,
  Building2,
  Server,
  ChevronDown,
  Check,
  Search,
  Plus,
} from 'lucide-react';

interface Organization {
  id: string;
  name: string;
  slug: string;
  logo?: string;
  routerCount: number;
}

interface Region {
  id: string;
  name: string;
  slug: string;
  routerCount: number;
}

interface Router {
  id: string;
  name: string;
  ipAddress: string;
  status: 'online' | 'offline' | 'degraded';
}

interface ContextSwitcherProps {
  organizations: Organization[];
  regions: Region[];
  routers: Router[];
  selectedOrg: Organization | null;
  selectedRegion: Region | null;
  selectedRouter: Router | null;
  onOrgChange: (org: Organization) => void;
  onRegionChange: (region: Region) => void;
  onRouterChange: (router: Router) => void;
  className?: string;
}

export function ContextSwitcher({
  organizations,
  regions,
  routers,
  selectedOrg,
  selectedRegion,
  selectedRouter,
  onOrgChange,
  onRegionChange,
  onRouterChange,
  className,
}: ContextSwitcherProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeLevel, setActiveLevel] = useState<'org' | 'region' | 'router'>('org');
  const containerRef = useRef<HTMLDivElement>(null);

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={containerRef} className={cn('relative', className)}>
      {/* Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium',
          'bg-neutral-100 dark:bg-neutral-800',
          'hover:bg-neutral-200 dark:hover:bg-neutral-700',
          'transition-colors'
        )}
      >
        <Globe className="w-4 h-4 text-neutral-500" />
        <span className="text-neutral-500 dark:text-neutral-400">Global</span>
        <ChevronDown className="w-4 h-4 text-neutral-400 rotate-90" />
        <span className="text-neutral-900 dark:text-white">
          {selectedOrg?.name || 'Select Organization'}
        </span>
        {selectedRegion && (
          <>
            <span className="text-neutral-300">/</span>
            <span className="text-neutral-900 dark:text-white">
              {selectedRegion.name}
            </span>
          </>
        )}
        {selectedRouter && (
          <>
            <span className="text-neutral-300">/</span>
            <span className="text-neutral-900 dark:text-white truncate max-w-[120px]">
              {selectedRouter.name}
            </span>
          </>
        )}
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-[640px] bg-white dark:bg-neutral-900 rounded-xl shadow-2xl border border-neutral-200 dark:border-neutral-700 overflow-hidden z-50 animate-scale-in">
          <div className="flex h-[400px]">
            {/* Organization List */}
            <div className="w-48 border-r border-neutral-200 dark:border-neutral-700 p-2">
              <div className="px-2 py-1 text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                Organizations
              </div>
              <div className="mt-2 space-y-1">
                {organizations.map((org) => (
                  <button
                    key={org.id}
                    onClick={() => {
                      onOrgChange(org);
                      setActiveLevel('region');
                    }}
                    className={cn(
                      'w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-sm transition-colors',
                      selectedOrg?.id === org.id
                        ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300'
                        : 'text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800'
                    )}
                  >
                    <Building2 className="w-4 h-4" />
                    <span className="flex-1 truncate text-left">{org.name}</span>
                    {selectedOrg?.id === org.id && (
                      <Check className="w-3 h-3 text-primary-500" />
                    )}
                  </button>
                ))}
                <button className="w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-sm text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors">
                  <Plus className="w-4 h-4" />
                  Add Organization
                </button>
              </div>
            </div>

            {/* Region List */}
            <div className="w-48 border-r border-neutral-200 dark:border-neutral-700 p-2">
              <div className="px-2 py-1 text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                Regions
              </div>
              <div className="mt-2 space-y-1">
                {regions.map((region) => (
                  <button
                    key={region.id}
                    onClick={() => {
                      onRegionChange(region);
                      setActiveLevel('router');
                    }}
                    className={cn(
                      'w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-sm transition-colors',
                      selectedRegion?.id === region.id
                        ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300'
                        : 'text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800'
                    )}
                  >
                    <Server className="w-4 h-4" />
                    <span className="flex-1 truncate text-left">{region.name}</span>
                    <span className="text-xs text-neutral-400">{region.routerCount}</span>
                    {selectedRegion?.id === region.id && (
                      <Check className="w-3 h-3 text-primary-500" />
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Router List */}
            <div className="flex-1 p-2">
              <div className="px-2 py-1 text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider flex items-center justify-between">
                <span>Routers</span>
                <span className="text-neutral-400 font-normal">
                  {routers.length} total
                </span>
              </div>
              <div className="mt-2 space-y-1">
                {routers.map((router) => (
                  <button
                    key={router.id}
                    onClick={() => {
                      onRouterChange(router);
                      setIsOpen(false);
                    }}
                    className={cn(
                      'w-full flex items-center gap-3 px-2 py-2 rounded-lg text-sm transition-colors',
                      selectedRouter?.id === router.id
                        ? 'bg-primary-50 dark:bg-primary-900/20'
                        : 'hover:bg-neutral-100 dark:hover:bg-neutral-800'
                    )}
                  >
                    <div
                      className={cn(
                        'w-2 h-2 rounded-full',
                        router.status === 'online' && 'bg-status-online',
                        router.status === 'offline' && 'bg-status-offline',
                        router.status === 'degraded' && 'bg-status-degraded'
                      )}
                    />
                    <div className="flex-1 text-left">
                      <div className="font-medium text-neutral-900 dark:text-white">
                        {router.name}
                      </div>
                      <div className="text-xs text-neutral-500 dark:text-neutral-400">
                        {router.ipAddress}
                      </div>
                    </div>
                    {selectedRouter?.id === router.id && (
                      <Check className="w-4 h-4 text-primary-500" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="px-4 py-3 border-t border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800/50 flex items-center justify-between">
            <span className="text-xs text-neutral-500 dark:text-neutral-400">
              {selectedOrg?.name && `${selectedOrg.name} / `}
              {selectedRegion?.name && `${selectedRegion.name} / `}
              {selectedRouter?.name || 'All Routers'}
            </span>
            <Button variant="ghost" size="sm">
              Clear Selection
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

// Simple context indicator for display
export function ContextIndicator({
  organization,
  region,
  router,
}: {
  organization?: { name: string; slug: string };
  region?: { name: string; slug: string };
  router?: { name: string; ipAddress: string };
}) {
  return (
    <div className="flex items-center gap-2 text-sm">
      <Globe className="w-4 h-4 text-neutral-500" />
      <span className="text-neutral-500">{organization?.name || 'Global'}</span>
      {region && (
        <>
          <ChevronDown className="w-3 h-3 text-neutral-400 rotate-90" />
          <span className="font-medium text-neutral-700 dark:text-neutral-300">
            {region.name}
          </span>
        </>
      )}
      {router && (
        <>
          <ChevronDown className="w-3 h-3 text-neutral-400 rotate-90" />
          <span className="font-medium text-neutral-700 dark:text-neutral-300">
            {router.name}
          </span>
        </>
      )}
    </div>
  );
}

// Import Button for the footer
import { Button } from './Button';
