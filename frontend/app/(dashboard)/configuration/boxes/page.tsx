'use client';

import { useState, useEffect } from 'react';
import { Plus, Search, Edit2, Trash2, Box, AlertTriangle } from 'lucide-react';
import { Button, Card, CardBody, CardHeader, Input, Modal, Badge } from '@/components';

interface Box {
  id: string;
  name: string;
  type: 'ONU' | 'ONT' | 'CPE' | 'Router' | 'Switch' | 'OLT';
  model?: string;
  manufacturer?: string;
  specs: Record<string, any>;
  unitCost?: string;
  stockQuantity: number;
  minStock: number;
  defaultProfile?: string;
  autoProvision: boolean;
  isActive: boolean;
}

export default function BoxesPage() {
  const [boxes, setBoxes] = useState<Box[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBox, setEditingBox] = useState<Box | null>(null);
  const [typeFilter, setTypeFilter] = useState<string>('');

  const fetchBoxes = async () => {
    try {
      const url = typeFilter ? `/api/v1/config/boxes?type=${typeFilter}` : '/api/v1/config/boxes';
      const res = await fetch(url);
      const data = await res.json();
      if (data.success) setBoxes(data.data);
    } catch (error) {
      console.error('Failed to fetch boxes:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchBoxes(); }, [typeFilter]);

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this box type?')) return;
    await fetch(`/api/v1/config/boxes/${id}`, { method: 'DELETE' });
    fetchBoxes();
  };

  const filteredBoxes = boxes.filter(box =>
    box.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    box.model?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStockStatus = (qty: number, min: number) => {
    if (qty === 0) return 'out';
    if (qty < min) return 'low';
    return 'ok';
  };

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Equipment / Boxes</h1>
          <p className="text-gray-500">Manage unit types and inventory</p>
        </div>
        <Button onClick={() => { setEditingBox(null); setIsModalOpen(true); }}>
          <Plus size={18} className="mr-2" /> Add Box Type
        </Button>
      </div>

      <div className="flex gap-2 flex-wrap">
        {['ONU', 'ONT', 'CPE', 'Router', 'Switch', 'OLT'].map(type => (
          <Button key={type} variant={typeFilter === type ? 'primary' : 'secondary'} size="sm" onClick={() => setTypeFilter(typeFilter === type ? '' : type)}>
            {type}
          </Button>
        ))}
      </div>

      <Card>
        <CardHeader title="" action={
          <Input
            placeholder="Search boxes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="max-w-md"
          />
        } />
        <CardBody>
          {loading ? (
            <div className="p-8 text-center text-gray-500">Loading...</div>
          ) : filteredBoxes.length === 0 ? (
            <div className="p-8 text-center text-gray-500">No box types found.</div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="text-left text-sm text-gray-500 border-b">
                  <th className="pb-3">Name</th>
                  <th className="pb-3">Type</th>
                  <th className="pb-3">Model</th>
                  <th className="pb-3">Manufacturer</th>
                  <th className="pb-3">Stock</th>
                  <th className="pb-3">Unit Cost</th>
                  <th className="pb-3">Status</th>
                  <th className="pb-3"></th>
                </tr>
              </thead>
              <tbody>
                {filteredBoxes.map((box) => {
                  const stockStatus = getStockStatus(box.stockQuantity, box.minStock);
                  return (
                    <tr key={box.id} className="border-b hover:bg-gray-50">
                      <td className="py-3 font-medium">{box.name}</td>
                      <td className="py-3"><Badge>{box.type}</Badge></td>
                      <td className="py-3">{box.model || '-'}</td>
                      <td className="py-3">{box.manufacturer || '-'}</td>
                      <td className="py-3">
                        <div className="flex items-center gap-2">
                          <span>{box.stockQuantity}</span>
                          {stockStatus === 'low' && <AlertTriangle size={14} className="text-yellow-500" />}
                          {stockStatus === 'out' && <AlertTriangle size={14} className="text-red-500" />}
                        </div>
                      </td>
                      <td className="py-3">{box.unitCost ? `$${box.unitCost}` : '-'}</td>
                      <td className="py-3">
                        <Badge variant={box.isActive ? 'success' : 'default'}>{box.isActive ? 'Active' : 'Inactive'}</Badge>
                      </td>
                      <td className="py-3">
                        <div className="flex gap-1">
                          <Button size="sm" variant="ghost" onClick={() => { setEditingBox(box); setIsModalOpen(true); }}>
                            <Edit2 size={14} />
                          </Button>
                          <Button size="sm" variant="ghost" onClick={() => handleDelete(box.id)}>
                            <Trash2 size={14} className="text-red-500" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </CardBody>
      </Card>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingBox ? 'Edit Box Type' : 'Add Box Type'}>
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            const formData = new FormData(e.currentTarget);
            const data = {
              name: formData.get('name'),
              type: formData.get('type'),
              model: formData.get('model') || undefined,
              manufacturer: formData.get('manufacturer') || undefined,
              unitCost: formData.get('unitCost') ? Number(formData.get('unitCost')) : undefined,
              stockQuantity: Number(formData.get('stockQuantity') || 0),
              minStock: Number(formData.get('minStock') || 5),
              defaultProfile: formData.get('defaultProfile') || undefined,
              autoProvision: formData.get('autoProvision') === 'on',
              isActive: formData.get('isActive') === 'on',
            };
            const method = editingBox ? 'PUT' : 'POST';
            const url = editingBox ? `/api/v1/config/boxes/${editingBox.id}` : '/api/v1/config/boxes';
            await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
            setIsModalOpen(false);
            fetchBoxes();
          }}
          className="space-y-4"
        >
          <div className="grid grid-cols-2 gap-4">
            <Input name="name" label="Name" defaultValue={editingBox?.name} required />
            <div>
              <label className="block text-sm font-medium mb-1">Type</label>
              <select name="type" defaultValue={editingBox?.type || 'CPE'} className="w-full p-2 border rounded" required>
                <option value="ONU">ONU</option>
                <option value="ONT">ONT</option>
                <option value="CPE">CPE</option>
                <option value="Router">Router</option>
                <option value="Switch">Switch</option>
                <option value="OLT">OLT</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input name="model" label="Model" defaultValue={editingBox?.model} />
            <Input name="manufacturer" label="Manufacturer" defaultValue={editingBox?.manufacturer} />
          </div>
          <div className="grid grid-cols-3 gap-4">
            <Input name="unitCost" label="Unit Cost ($)" type="number" step="0.01" defaultValue={editingBox?.unitCost} />
            <Input name="stockQuantity" label="Stock Qty" type="number" defaultValue={editingBox?.stockQuantity || 0} />
            <Input name="minStock" label="Min Stock" type="number" defaultValue={editingBox?.minStock || 5} />
          </div>
          <Input name="defaultProfile" label="Default Profile" defaultValue={editingBox?.defaultProfile} placeholder="e.g., default-pppoe" />
          <div className="flex gap-4">
            <label className="flex items-center gap-2">
              <input type="checkbox" name="autoProvision" defaultChecked={editingBox?.autoProvision ?? true} />
              Auto Provision
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" name="isActive" defaultChecked={editingBox?.isActive ?? true} />
              Active
            </label>
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="secondary" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button type="submit">{editingBox ? 'Update' : 'Create'}</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
