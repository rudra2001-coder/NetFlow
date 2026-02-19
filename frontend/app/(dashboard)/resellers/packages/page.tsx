'use client';

import React, { useState } from 'react';
import { Plus, Edit2, Trash2, Package, Users, DollarSign } from 'lucide-react';
import { Card, CardBody, CardHeader, Button, Badge } from '@/components';

interface Package {
  id: string;
  name: string;
  description: string;
  dataLimit: string;
  speed: string;
  fupSpeed: string;
  validity: string;
  price: number;
  retailPrice?: number;
  wholesalePrice?: number;
  margin: number;
  status: 'active' | 'inactive' | 'discontinued';
  createdDate: string;
  assignedCount: number;
}

const mockPackages: Package[] = [
  {
    id: '1',
    name: 'Daily 1GB',
    description: '1GB data valid for 24 hours',
    dataLimit: '1 GB',
    speed: '5 Mbps',
    fupSpeed: '512 Kbps',
    validity: '24 Hours',
    price: 1.99,
    retailPrice: 2.99,
    wholesalePrice: 1.49,
    margin: 25,
    status: 'active',
    createdDate: '2024-01-15',
    assignedCount: 142,
  },
  {
    id: '2',
    name: 'Weekly 10GB',
    description: '10GB data valid for 7 days',
    dataLimit: '10 GB',
    speed: '10 Mbps',
    fupSpeed: '1 Mbps',
    validity: '7 Days',
    price: 9.99,
    retailPrice: 14.99,
    wholesalePrice: 7.99,
    margin: 20,
    status: 'active',
    createdDate: '2024-01-10',
    assignedCount: 87,
  },
  {
    id: '3',
    name: 'Monthly 100GB',
    description: '100GB data valid for 30 days',
    dataLimit: '100 GB',
    speed: 'Unlimited',
    fupSpeed: '5 Mbps',
    validity: '30 Days',
    price: 49.99,
    retailPrice: 69.99,
    wholesalePrice: 39.99,
    margin: 20,
    status: 'active',
    createdDate: '2023-12-20',
    assignedCount: 264,
  },
];

export default function ResellersPagePackages() {
  const [packages] = useState<Package[]>(mockPackages);
  const [showModal, setShowModal] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-neutral-900 dark:text-white">Reseller Packages</h1>
          <p className="text-neutral-600 dark:text-neutral-400 mt-1">
            Configure and manage data packages for reseller distribution
          </p>
        </div>
        <Button onClick={() => setShowModal(true)}>
          <Plus size={18} className="mr-2" /> Add Package
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {packages.map((pkg) => (
          <Card key={pkg.id} className="hover:shadow-lg transition-shadow">
            <CardBody>
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-start gap-3 mb-3">
                    <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                      <Package size={24} className="text-blue-600 dark:text-blue-400" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-neutral-900 dark:text-white">{pkg.name}</h3>
                      <p className="text-sm text-neutral-600 dark:text-neutral-400">{pkg.description}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4 p-4 bg-neutral-50 dark:bg-neutral-800/50 rounded-lg">
                    <div>
                      <p className="text-xs text-neutral-600 dark:text-neutral-400 font-medium">Data Limit</p>
                      <p className="text-neutral-900 dark:text-white font-semibold">{pkg.dataLimit}</p>
                    </div>
                    <div>
                      <p className="text-xs text-neutral-600 dark:text-neutral-400 font-medium">Speed</p>
                      <p className="text-neutral-900 dark:text-white font-semibold">{pkg.speed}</p>
                    </div>
                    <div>
                      <p className="text-xs text-neutral-600 dark:text-neutral-400 font-medium">FUP Speed</p>
                      <p className="text-neutral-900 dark:text-white font-semibold">{pkg.fupSpeed}</p>
                    </div>
                    <div>
                      <p className="text-xs text-neutral-600 dark:text-neutral-400 font-medium">Validity</p>
                      <p className="text-neutral-900 dark:text-white font-semibold">{pkg.validity}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-4 pt-4 border-t border-neutral-200 dark:border-neutral-700">
                    <div>
                      <p className="text-xs text-neutral-600 dark:text-neutral-400 font-medium">Your Price</p>
                      <p className="text-xl font-bold text-green-600 dark:text-green-400">${pkg.price}</p>
                    </div>
                    <div>
                      <p className="text-xs text-neutral-600 dark:text-neutral-400 font-medium">Retail Price</p>
                      <p className="text-neutral-900 dark:text-white font-semibold">${pkg.retailPrice}</p>
                    </div>
                    <div>
                      <p className="text-xs text-neutral-600 dark:text-neutral-400 font-medium">Wholesale</p>
                      <p className="text-neutral-900 dark:text-white font-semibold">${pkg.wholesalePrice}</p>
                    </div>
                    <div>
                      <p className="text-xs text-neutral-600 dark:text-neutral-400 font-medium">Margin</p>
                      <p className="text-blue-600 dark:text-blue-400 font-semibold">{pkg.margin}%</p>
                    </div>
                    <div>
                      <p className="text-xs text-neutral-600 dark:text-neutral-400 font-medium">Assigned</p>
                      <p className="text-neutral-900 dark:text-white font-semibold flex items-center gap-1">
                        <Users size={14} /> {pkg.assignedCount}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 mt-4">
                    <Badge variant={pkg.status === 'active' ? 'success' : 'warning'}>
                      {pkg.status}
                    </Badge>
                    <span className="text-xs text-neutral-600 dark:text-neutral-400">Created {pkg.createdDate}</span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button variant="ghost" size="sm" title="Edit">
                    <Edit2 size={16} />
                  </Button>
                  <Button variant="ghost" size="sm" title="Delete">
                    <Trash2 size={16} className="text-red-500" />
                  </Button>
                </div>
              </div>
            </CardBody>
          </Card>
        ))}
      </div>
    </div>
  );
}
