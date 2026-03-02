'use client';

import { useState, useEffect } from 'react';
import { Plus, Search, Edit2, Trash2, Zap, Wifi, HardDrive, Check } from 'lucide-react';
import { Button, Card, CardBody, CardHeader, Input, Modal, Badge } from '@/components';

interface Package {
  id: string;
  name: string;
  slug: string;
  description?: string;
  type: 'internet' | 'bundle' | 'add_on';
  downloadSpeed: number;
  uploadSpeed: number;
  dataCap?: number;
  monthlyPrice: string;
  setupFee: string;
  currency: string;
  features: string[];
  isHighlighted: boolean;
  isActive: boolean;
  sortOrder: number;
}

export default function PackagesPage() {
  const [packages, setPackages] = useState<Package[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPkg, setEditingPkg] = useState<Package | null>(null);
  const [typeFilter, setTypeFilter] = useState<string>('');

  const fetchPackages = async () => {
    try {
      const url = typeFilter 
        ? `/api/v1/config/packages?type=${typeFilter}` 
        : '/api/v1/config/packages';
      const res = await fetch(url);
      const data = await res.json();
      if (data.success) setPackages(data.data);
    } catch (error) {
      console.error('Failed to fetch packages:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPackages();
  }, [typeFilter]);

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this package?')) return;
    await fetch(`/api/v1/config/packages/${id}`, { method: 'DELETE' });
    fetchPackages();
  };

  const formatSpeed = (mbps: number) => mbps >= 1000 ? `${mbps/1000} Gbps` : `${mbps} Mbps`;
  const formatDataCap = (bytes?: number) => bytes ? `${(bytes / (1024*1024*1024)).toFixed(0)} GB` : 'Unlimited';

  const filteredPackages = packages.filter(pkg =>
    pkg.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    pkg.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Packages</h1>
          <p className="text-gray-500">Manage service offerings and pricing plans</p>
        </div>
        <Button onClick={() => { setEditingPkg(null); setIsModalOpen(true); }}>
          <Plus size={18} className="mr-2" /> Add Package
        </Button>
      </div>

      <div className="flex gap-2">
        <Button variant={typeFilter === '' ? 'primary' : 'secondary'} size="sm" onClick={() => setTypeFilter('')}>
          All
        </Button>
        <Button variant={typeFilter === 'internet' ? 'primary' : 'secondary'} size="sm" onClick={() => setTypeFilter('internet')}>
          Internet
        </Button>
        <Button variant={typeFilter === 'bundle' ? 'primary' : 'secondary'} size="sm" onClick={() => setTypeFilter('bundle')}>
          Bundle
        </Button>
        <Button variant={typeFilter === 'add_on' ? 'primary' : 'secondary'} size="sm" onClick={() => setTypeFilter('add_on')}>
          Add-on
        </Button>
      </div>

      <Card>
        <CardHeader title="" action={
          <Input
            placeholder="Search packages..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="max-w-md"
          />
        } />
        <CardBody>
          {loading ? (
            <div className="p-8 text-center text-gray-500">Loading...</div>
          ) : filteredPackages.length === 0 ? (
            <div className="p-8 text-center text-gray-500">No packages found.</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredPackages.map((pkg) => (
                <div key={pkg.id} className={`border rounded-lg p-4 ${pkg.isHighlighted ? 'border-blue-500 bg-blue-50' : ''}`}>
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="font-bold text-lg">{pkg.name}</h3>
                      <Badge variant={pkg.type === 'internet' ? 'info' : pkg.type === 'bundle' ? 'success' : 'default'}>
                        {pkg.type.replace('_', ' ')}
                      </Badge>
                    </div>
                    {pkg.isHighlighted && <Badge variant="warning">Popular</Badge>}
                  </div>
                  <p className="text-gray-500 text-sm mb-3">{pkg.description}</p>
                  
                  <div className="flex items-center gap-4 mb-3 text-sm">
                    <div className="flex items-center gap-1">
                      <Zap size={14} className="text-green-500" />
                      <span>↓ {formatSpeed(pkg.downloadSpeed)}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Zap size={14} className="text-blue-500" />
                      <span>↑ {formatSpeed(pkg.uploadSpeed)}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <HardDrive size={14} className="text-gray-400" />
                      <span>{formatDataCap(pkg.dataCap)}</span>
                    </div>
                  </div>

                  <div className="flex items-baseline gap-1 mb-3">
                    <span className="text-2xl font-bold">{pkg.currency} {pkg.monthlyPrice}</span>
                    <span className="text-gray-500">/month</span>
                  </div>

                  {pkg.features.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-3">
                      {pkg.features.slice(0, 3).map((feature, i) => (
                        <Badge key={i} variant="default" className="text-xs">{feature}</Badge>
                      ))}
                    </div>
                  )}

                  <div className="flex justify-end gap-2">
                    <Button size="sm" variant="ghost" onClick={() => { setEditingPkg(pkg); setIsModalOpen(true); }}>
                      <Edit2 size={14} />
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => handleDelete(pkg.id)}>
                      <Trash2 size={14} className="text-red-500" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardBody>
      </Card>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingPkg ? 'Edit Package' : 'Add Package'}>
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            const formData = new FormData(e.currentTarget);
            const data = {
              name: formData.get('name'),
              slug: formData.get('slug'),
              description: formData.get('description'),
              type: formData.get('type'),
              downloadSpeed: Number(formData.get('downloadSpeed')),
              uploadSpeed: Number(formData.get('uploadSpeed')),
              dataCap: formData.get('dataCap') ? Number(formData.get('dataCap')) * 1024 * 1024 * 1024 : undefined,
              monthlyPrice: Number(formData.get('monthlyPrice')),
              setupFee: Number(formData.get('setupFee') || 0),
              currency: formData.get('currency') || 'USD',
              features: formData.get('features')?.toString().split(',').map(f => f.trim()).filter(Boolean) || [],
              isHighlighted: formData.get('isHighlighted') === 'on',
              isActive: formData.get('isActive') === 'on',
            };
            const method = editingPkg ? 'PUT' : 'POST';
            const url = editingPkg
              ? `/api/v1/config/packages/${editingPkg.id}`
              : '/api/v1/config/packages';
            await fetch(url, {
              method,
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(data),
            });
            setIsModalOpen(false);
            fetchPackages();
          }}
          className="space-y-4"
        >
          <div className="grid grid-cols-2 gap-4">
            <Input name="name" label="Name" defaultValue={editingPkg?.name} required />
            <Input name="slug" label="Slug" defaultValue={editingPkg?.slug} required />
          </div>
          <Input name="description" label="Description" defaultValue={editingPkg?.description} />
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Type</label>
              <select name="type" defaultValue={editingPkg?.type || 'internet'} className="w-full p-2 border rounded">
                <option value="internet">Internet</option>
                <option value="bundle">Bundle</option>
                <option value="add_on">Add-on</option>
              </select>
            </div>
            <Input name="downloadSpeed" label="Download (Mbps)" type="number" defaultValue={editingPkg?.downloadSpeed} required />
            <Input name="uploadSpeed" label="Upload (Mbps)" type="number" defaultValue={editingPkg?.uploadSpeed} required />
          </div>
          <div className="grid grid-cols-3 gap-4">
            <Input name="monthlyPrice" label="Monthly Price" type="number" step="0.01" defaultValue={editingPkg?.monthlyPrice} required />
            <Input name="setupFee" label="Setup Fee" type="number" step="0.01" defaultValue={editingPkg?.setupFee || 0} />
            <Input name="dataCap" label="Data Cap (GB)" type="number" defaultValue={editingPkg?.dataCap ? editingPkg.dataCap / (1024*1024*1024) : ''} placeholder="0 = unlimited" />
          </div>
          <Input name="features" label="Features (comma separated)" defaultValue={editingPkg?.features.join(', ')} placeholder="Static IP, Priority Support" />
          <div className="flex gap-4">
            <label className="flex items-center gap-2">
              <input type="checkbox" name="isHighlighted" defaultChecked={editingPkg?.isHighlighted} />
              Highlighted
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" name="isActive" defaultChecked={editingPkg?.isActive ?? true} />
              Active
            </label>
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="secondary" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button type="submit">{editingPkg ? 'Update' : 'Create'}</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
