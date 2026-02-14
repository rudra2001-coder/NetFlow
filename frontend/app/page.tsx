'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Activity, Server, Users, Settings, Wifi, BarChart3, Zap, Shield } from 'lucide-react';
import { Button, Card, CardBody } from '@/components';

export default function HomePage() {
  const router = useRouter();



  const features = [
    {
      icon: <Activity className="w-8 h-8 text-primary-500" />,
      title: 'Real-time Monitoring',
      description: 'Monitor your network infrastructure in real-time with advanced metrics and alerts.',
    },
    {
      icon: <Server className="w-8 h-8 text-success-500" />,
      title: 'Router Management',
      description: 'Manage MikroTik routers remotely with secure API integration.',
    },
    {
      icon: <Users className="w-8 h-8 text-warning-500" />,
      title: 'User Management',
      description: 'Handle PPP and Hotspot users with ease and automated billing.',
    },
    {
      icon: <BarChart3 className="w-8 h-8 text-info-500" />,
      title: 'Analytics & Reports',
      description: 'Comprehensive analytics and customizable reports for better insights.',
    },
    {
      icon: <Zap className="w-8 h-8 text-purple-500" />,
      title: 'Automation',
      description: 'Automate routine tasks with templates and scheduled operations.',
    },
    {
      icon: <Shield className="w-8 h-8 text-error-500" />,
      title: 'Security & Compliance',
      description: 'Ensure network security with compliance checks and audit logs.',
    },
  ];

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-white dark:bg-neutral-900">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-500/10 to-transparent" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 sm:py-32">
          <div className="text-center">
            <div className="flex items-center justify-center gap-4 mb-6">
              <div className="w-16 h-16 bg-primary-600 rounded-2xl flex items-center justify-center shadow-lg shadow-primary-500/30">
                <Activity className="w-10 h-10 text-white" />
              </div>
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-neutral-900 dark:text-white tracking-tight">
              NetFlow
            </h1>
            <p className="mt-4 text-xl text-neutral-600 dark:text-neutral-300 max-w-2xl mx-auto">
              Production-grade ISP Management Platform for MikroTik Routers
            </p>
            <div className="mt-8 flex items-center justify-center gap-4">
              <Button size="lg" onClick={() => router.push('/dashboard')}>
                Open Dashboard
              </Button>
              <Button variant="outline" size="lg" onClick={() => router.push('/login')}>
                Sign In
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Features */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h2 className="text-3xl font-bold text-center text-neutral-900 dark:text-white mb-12">
          Everything you need to manage your ISP
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <Card key={index} hover className="transition-all duration-200 hover:-translate-y-1">
              <CardBody className="p-6">
                <div className="mb-4">{feature.icon}</div>
                <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-2">
                  {feature.title}
                </h3>
                <p className="text-neutral-600 dark:text-neutral-400">
                  {feature.description}
                </p>
              </CardBody>
            </Card>
          ))}
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-neutral-200 dark:border-neutral-800 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-primary-500" />
              <span className="font-semibold text-neutral-900 dark:text-white">NetFlow</span>
            </div>
            <p className="text-sm text-neutral-500">
              © 2026 NetFlow ISP Management Platform. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
