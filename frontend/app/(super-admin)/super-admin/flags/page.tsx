'use client';

import React, { useState } from 'react';
import { Flag, Plus, Edit2, Trash2, ToggleRight } from 'lucide-react';
import { Card, CardBody, CardHeader, Button, Badge } from '@/components';

interface FeatureFlag {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  audience: string;
  rolloutPercentage: number;
  createdDate: string;
}

const mockFlags: FeatureFlag[] = [
  { id: '1', name: 'New Dashboard', description: 'Beta version of the new dashboard UI', enabled: true, audience: '25%', rolloutPercentage: 25, createdDate: '2024-01-10' },
  { id: '2', name: 'Advanced Analytics', description: 'Advanced analytics features for premium users', enabled: true, audience: 'Premium Users', rolloutPercentage: 100, createdDate: '2024-01-15' },
  { id: '3', name: 'Dark Mode V2', description: 'Improved dark mode theme', enabled: false, audience: 'Beta Testers', rolloutPercentage: 10, createdDate: '2024-02-01' },
];

export default function FlagsPage() {
  const [flags] = useState<FeatureFlag[]>(mockFlags);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-neutral-900 dark:text-white">Feature Flags</h1>
          <p className="text-neutral-600 dark:text-neutral-400">Control feature rollouts and A/B testing configurations</p>
        </div>
        <Button><Plus size={18} className="mr-2" /> New Flag</Button>
      </div>

      <div className="space-y-3">
        {flags.map((flag) => (
          <Card key={flag.id} className="hover:shadow-lg transition-shadow">
            <CardBody>
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <Flag size={20} className="text-purple-500" />
                    <div>
                      <h3 className="font-semibold text-neutral-900 dark:text-white">{flag.name}</h3>
                      <p className="text-sm text-neutral-600 dark:text-neutral-400">{flag.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 mt-3 text-sm">
                    <div>
                      <p className="text-neutral-600 dark:text-neutral-400">Audience</p>
                      <p className="text-neutral-900 dark:text-white font-medium">{flag.audience}</p>
                    </div>
                    <div>
                      <p className="text-neutral-600 dark:text-neutral-400">Rollout</p>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="w-32 h-2 bg-neutral-200 dark:bg-neutral-700 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-green-500"
                            style={{ width: `${flag.rolloutPercentage}%` }}
                          />
                        </div>
                        <span className="font-medium text-neutral-900 dark:text-white min-w-fit">{flag.rolloutPercentage}%</span>
                      </div>
                    </div>
                    <div>
                      <p className="text-neutral-600 dark:text-neutral-400">Created</p>
                      <p className="text-neutral-900 dark:text-white font-medium">{flag.createdDate}</p>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={flag.enabled ? 'success' : 'default'}>
                    {flag.enabled ? 'Enabled' : 'Disabled'}
                  </Badge>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="sm"><ToggleRight size={16} className="text-blue-500" /></Button>
                    <Button variant="ghost" size="sm"><Edit2 size={16} /></Button>
                    <Button variant="ghost" size="sm"><Trash2 size={16} className="text-red-500" /></Button>
                  </div>
                </div>
              </div>
            </CardBody>
          </Card>
        ))}
      </div>
    </div>
  );
}
