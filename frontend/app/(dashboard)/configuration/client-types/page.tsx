'use client';

import { useState, useEffect } from 'react';
import { Plus, Search, Edit2, Trash2, Users, Building2, Globe } from 'lucide-react';
import { Button, Card, CardBody, CardHeader, Input, Modal, Badge } from '@/components';

interface ClientType {
  id: string;
  name: string;
  slug: string;
  category: 'residential' | 'commercial' | 'enterprise' | 'hotspot' | 'isp';
  description?: string;
  billingCycle: string;
  paymentTerms: number;
  portalAccess: boolean;
  selfService: boolean;
  maxDevices: number;
  isDefault: boolean;
  isActive: boolean;
}

export default function ClientTypesPage() {
  const [clientTypes, setClientTypes] = useState<ClientType[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingType, setEditingType] = useState<ClientType | null>(null);

  const fetchClientTypes = async () => {
    try {
      const res = await fetch('/api/v1/config/client-types');
      const data = await res.json();
      if (data.success) setClientTypes(data.data);
    } catch (error) {
      console.error('Failed to fetch client types:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchClientTypes(); }, []);

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this client type?')) return;
    await fetch(`/api/v1/config/client-types/${id}`, { method: 'DELETE' });
    fetchClientTypes();
  };

  const filteredTypes = clientTypes.filter(ct =>
    ct.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    ct.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'residential': return <Users size={16} />;
      case 'commercial': return <Building2 size={16} />;
      case 'enterprise': return <Building2 size={16} />;
      case 'hotspot': return <Globe size={16} />;
      case 'isp': return <Globe size={16} />;
      default: return <Users size={16} />;
    }
  };

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Client Types</h1>
          <p className="text-gray-500">Manage customer categories and defaults</p>
        </div>
        <Button onClick={() => { setEditingType(null); setIsModalOpen(true); }}>
          <Plus size={18} className="mr-2" /> Add Client Type
        </Button>
      </div>

      <Card>
        <CardHeader title="" action={
          <Input
            placeholder="Search client types..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="max-w-md"
          />
        } />
        <CardBody>
          {loading ? (
            <div className="p-8 text-center text-gray-500">Loading...</div>
          ) : filteredTypes.length === 0 ? (
            <div className="p-8 text-center text-gray-500">No client types found.</div>
          ) : (
            <div className="grid gap-4">
              {filteredTypes.map((ct) => (
                <div key={ct.id} className="border rounded-lg p-4 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="p-2 bg-gray-100 rounded-lg">{getCategoryIcon(ct.category)}</div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium">{ct.name}</h3>
                        {ct.isDefault && <Badge variant="info">Default</Badge>}
                        <Badge variant={ct.isActive ? 'success' : 'default'}>{ct.isActive ? 'Active' : 'Inactive'}</Badge>
                      </div>
                      <p className="text-sm text-gray-500">{ct.description}</p>
                      <div className="flex gap-4 mt-1 text-xs text-gray-400">
                        <span>Category: {ct.category}</span>
                        <span>Billing: {ct.billingCycle}</span>
                        <span>Terms: {ct.paymentTerms} days</span>
                        <span>Max Devices: {ct.maxDevices}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <Button size="sm" variant="ghost" onClick={() => { setEditingType(ct); setIsModalOpen(true); }}>
                      <Edit2 size={14} />
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => handleDelete(ct.id)}>
                      <Trash2 size={14} className="text-red-500" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardBody>
      </Card>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingType ? 'Edit Client Type' : 'Add Client Type'}>
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            const formData = new FormData(e.currentTarget);
            const data = {
              name: formData.get('name'),
              slug: formData.get('slug'),
              category: formData.get('category'),
              description: formData.get('description'),
              billingCycle: formData.get('billingCycle'),
              paymentTerms: Number(formData.get('paymentTerms') || 0),
              portalAccess: formData.get('portalAccess') === 'on',
              selfService: formData.get('selfService') === 'on',
              maxDevices: Number(formData.get('maxDevices') || 1),
              isDefault: formData.get('isDefault') === 'on',
              isActive: formData.get('isActive') === 'on',
            };
            const method = editingType ? 'PUT' : 'POST';
            const url = editingType ? `/api/v1/config/client-types/${editingType.id}` : '/api/v1/config/client-types';
            await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
            setIsModalOpen(false);
            fetchClientTypes();
          }}
          className="space-y-4"
        >
          <div className="grid grid-cols-2 gap-4">
            <Input name="name" label="Name" defaultValue={editingType?.name} required />
            <Input name="slug" label="Slug" defaultValue={editingType?.slug} required />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Category</label>
              <select name="category" defaultValue={editingType?.category || 'residential'} className="w-full p-2 border rounded" required>
                <option value="residential">Residential</option>
                <option value="commercial">Commercial</option>
                <option value="enterprise">Enterprise</option>
                <option value="hotspot">Hotspot</option>
                <option value="isp">ISP</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Billing Cycle</label>
              <select name="billingCycle" defaultValue={editingType?.billingCycle || 'monthly'} className="w-full p-2 border rounded">
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
                <option value="quarterly">Quarterly</option>
                <option value="yearly">Yearly</option>
              </select>
            </div>
          </div>
          <Input name="description" label="Description" defaultValue={editingType?.description} />
          <div className="grid grid-cols-3 gap-4">
            <Input name="paymentTerms" label="Payment Terms (days)" type="number" defaultValue={editingType?.paymentTerms || 0} />
            <Input name="maxDevices" label="Max Devices" type="number" defaultValue={editingType?.maxDevices || 1} />
          </div>
          <div className="flex gap-4 flex-wrap">
            <label className="flex items-center gap-2">
              <input type="checkbox" name="portalAccess" defaultChecked={editingType?.portalAccess ?? true} />
              Portal Access
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" name="selfService" defaultChecked={editingType?.selfService ?? false} />
              Self Service
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" name="isDefault" defaultChecked={editingType?.isDefault ?? false} />
              Default Type
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" name="isActive" defaultChecked={editingType?.isActive ?? true} />
              Active
            </label>
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="secondary" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button type="submit">{editingType ? 'Update' : 'Create'}</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
