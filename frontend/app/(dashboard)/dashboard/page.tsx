'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Activity, Server, Users, TrendingUp, TrendingDown, Wifi, Bell, AlertTriangle } from 'lucide-react';
import { Card, CardBody, CardHeader, Button } from '@/components';

export default function DashboardIndex() {
  const router = useRouter();



  return (
    <div className="space-y-6">
      {/* Quick Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card hover className="transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg">
          <CardBody>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-neutral-500">System Health</p>
                <p className="text-3xl font-bold text-success-600">99.5%</p>
                <p className="text-xs text-neutral-400 mt-1 flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" /> +0.2% from last hour
                </p>
              </div>
              <div className="p-3 bg-success-100 dark:bg-success-900/30 rounded-xl">
                <Activity className="w-6 h-6 text-success-600" />
              </div>
            </div>
          </CardBody>
        </Card>

        <Card hover className="transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg">
          <CardBody>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-neutral-500">Active Routers</p>
                <p className="text-3xl font-bold text-neutral-900 dark:text-white">24</p>
                <p className="text-xs text-neutral-400 mt-1">of 25 total</p>
              </div>
              <div className="p-3 bg-primary-100 dark:bg-primary-900/30 rounded-xl">
                <Server className="w-6 h-6 text-primary-600" />
              </div>
            </div>
          </CardBody>
        </Card>

        <Card hover className="transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg">
          <CardBody>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-neutral-500">Online Users</p>
                <p className="text-3xl font-bold text-neutral-900 dark:text-white">1,247</p>
                <p className="text-xs text-neutral-400 mt-1 flex items-center gap-1 text-success-600">
                  <TrendingUp className="w-3 h-3" /> +156 today
                </p>
              </div>
              <div className="p-3 bg-info-100 dark:bg-info-900/30 rounded-xl">
                <Users className="w-6 h-6 text-info-600" />
              </div>
            </div>
          </CardBody>
        </Card>

        <Card hover className="transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg">
          <CardBody>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-neutral-500">Active Alerts</p>
                <p className="text-3xl font-bold text-warning-600">3</p>
                <p className="text-xs text-neutral-400 mt-1">1 critical, 2 warnings</p>
              </div>
              <div className="p-3 bg-warning-100 dark:bg-warning-900/30 rounded-xl">
                <Bell className="w-6 h-6 text-warning-600" />
              </div>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader title="Quick Dashboard Options" subtitle="Choose your preferred dashboard view" />
        <CardBody>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              onClick={() => router.push('/dashboard/enhanced-noc')}
              className="flex items-center gap-4 p-4 rounded-xl border-2 border-primary-200 dark:border-primary-800 hover:border-primary-500 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-all text-left"
            >
              <div className="p-3 bg-primary-100 dark:bg-primary-900/30 rounded-xl">
                <Activity className="w-6 h-6 text-primary-600" />
              </div>
              <div>
                <p className="font-semibold text-neutral-900 dark:text-white">Enhanced NOC</p>
                <p className="text-sm text-neutral-500">Advanced monitoring with charts and alerts</p>
              </div>
            </button>

            <button
              onClick={() => router.push('/dashboard/command-center')}
              className="flex items-center gap-4 p-4 rounded-xl border-2 border-neutral-200 dark:border-neutral-700 hover:border-primary-500 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-all text-left"
            >
              <div className="p-3 bg-neutral-100 dark:bg-neutral-800 rounded-xl">
                <Server className="w-6 h-6 text-neutral-600" />
              </div>
              <div>
                <p className="font-semibold text-neutral-900 dark:text-white">Command Center</p>
                <p className="text-sm text-neutral-500">Execute commands on routers</p>
              </div>
            </button>

            <button
              onClick={() => router.push('/dashboard/enterprise-noc')}
              className="flex items-center gap-4 p-4 rounded-xl border-2 border-neutral-200 dark:border-neutral-700 hover:border-primary-500 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-all text-left"
            >
              <div className="p-3 bg-neutral-100 dark:bg-neutral-800 rounded-xl">
                <TrendingUp className="w-6 h-6 text-neutral-600" />
              </div>
              <div>
                <p className="font-semibold text-neutral-900 dark:text-white">Enterprise NOC</p>
                <p className="text-sm text-neutral-500">Full enterprise features with forecasting</p>
              </div>
            </button>
          </div>
        </CardBody>
      </Card>

      {/* Recent Activity */}
      <Card>
        <CardHeader title="Recent Alerts" subtitle="Latest network events" action={
          <Button variant="ghost" size="sm" onClick={() => router.push('/audit')}>
            View All
          </Button>
        } />
        <CardBody className="p-0">
          <div className="divide-y divide-neutral-100 dark:divide-neutral-800">
            {[
              { title: 'Router RTR-HQ-01 is offline', time: '2 min ago', severity: 'critical', icon: <AlertTriangle className="w-4 h-4" /> },
              { title: 'High CPU usage on RTR-DC-03', time: '15 min ago', severity: 'warning', icon: <Activity className="w-4 h-4" /> },
              { title: 'Backup completed successfully', time: '1 hour ago', severity: 'info', icon: <Server className="w-4 h-4" /> },
              { title: 'New user registered: john@example.com', time: '2 hours ago', severity: 'info', icon: <Users className="w-4 h-4" /> },
            ].map((alert, index) => (
              <div key={index} className="flex items-center gap-4 p-4 hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors">
                <div className={`p-2 rounded-lg ${alert.severity === 'critical' ? 'bg-error-100 dark:bg-error-900/30 text-error-600' :
                  alert.severity === 'warning' ? 'bg-warning-100 dark:bg-warning-900/30 text-warning-600' :
                    'bg-info-100 dark:bg-info-900/30 text-info-600'
                  }`}>
                  {alert.icon}
                </div>
                <div className="flex-1">
                  <p className="font-medium text-neutral-900 dark:text-white">{alert.title}</p>
                  <p className="text-sm text-neutral-500">{alert.time}</p>
                </div>
              </div>
            ))}
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
