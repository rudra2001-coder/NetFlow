'use client';

import { useState } from 'react';
import {
  Plus, Search, Edit2, Trash2, ChevronRight, ChevronDown,
  MapPin, Users, DollarSign, Building2, Wifi,
} from 'lucide-react';
import { Button, Card, CardBody, CardHeader, Input, Modal, Badge } from '@/components';

interface Zone {
  id: string;
  name: string;
  slug: string;
  description?: string;
  parentId?: string;
  status: 'active' | 'inactive' | 'maintenance';
  isPrimary: boolean;
  level: number;
  totalClients: number;
  totalRevenue: string;
  children?: Zone[];
}

export default function ZonesPage() {
  const [zones, setZones] = useState<Zone[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingZone, setEditingZone] = useState<Zone | null>(null);

  const fetchZones = async () => {
    try {
      const res = await fetch('/api/v1/config/zones/tree');
      const data = await res.json();
      if (data.success) setZones(data.data);
    } catch (error) {
      console.error('Failed to fetch zones:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this zone?')) return;
    await fetch(`/api/v1/config/zones/${id}`, { method: 'DELETE' });
    fetchZones();
  };

  const toggleExpand = (id: string) => {
    const newExpanded = new Set(expandedIds);
    if (newExpanded.has(id)) newExpanded.delete(id);
    else newExpanded.add(id);
    setExpandedIds(newExpanded);
  };

  const renderZone = (zone: Zone, level: number = 0) => {
    const hasChildren = zone.children && zone.children.length > 0;
    const isExpanded = expandedIds.has(zone.id);

    return (
      <div key={zone.id}>
        <div
          className={`flex items-center gap-3 p-3 hover:bg-gray-50 border-b ${
            level > 0 ? 'ml-6 border-l-2 border-l-blue-200' : ''
          }`}
          style={{ paddingLeft: `${level * 24 + 12}px` }}
        >
          {hasChildren && (
            <button onClick={() => toggleExpand(zone.id)} className="p-1">
              {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
            </button>
          )}
          {!hasChildren && <div className="w-6" />}

          <div className="flex-1 flex items-center gap-3">
            <MapPin size={18} className="text-blue-500" />
            <div>
              <div className="font-medium">{zone.name}</div>
              <div className="text-xs text-gray-500">{zone.slug}</div>
            </div>
          </div>

          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-1">
              <Users size={14} className="text-gray-400" />
              <span>{zone.totalClients}</span>
            </div>
            <div className="flex items-center gap-1">
              <DollarSign size={14} className="text-gray-400" />
              <span>{zone.totalRevenue}</span>
            </div>
            <Badge variant={zone.status === 'active' ? 'success' : 'default'}>
              {zone.status}
            </Badge>
            <Button size="sm" variant="ghost" onClick={() => { setEditingZone(zone); setIsModalOpen(true); }}>
              <Edit2 size={14} />
            </Button>
            <Button size="sm" variant="ghost" onClick={() => handleDelete(zone.id)}>
              <Trash2 size={14} className="text-red-500" />
            </Button>
          </div>
        </div>
        {hasChildren && isExpanded && zone.children?.map((child) => renderZone(child, level + 1))}
      </div>
    );
  };

  const filteredZones = zones.filter(z =>
    z.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    z.slug.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Zones</h1>
          <p className="text-gray-500">Manage hierarchical regions and locations</p>
        </div>
        <Button onClick={() => { setEditingZone(null); setIsModalOpen(true); }}>
          <Plus size={18} className="mr-2" /> Add Zone
        </Button>
      </div>

      <Card>
        <CardHeader title="" action={
          <Input
            placeholder="Search zones..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="max-w-md"
          />
        } />
        <CardBody>
          {loading ? (
            <div className="p-8 text-center text-gray-500">Loading...</div>
          ) : filteredZones.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              No zones found. Create your first zone to get started.
            </div>
          ) : (
            <div className="border rounded-lg overflow-hidden">
              {filteredZones.map((zone) => renderZone(zone))}
            </div>
          )}
        </CardBody>
      </Card>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingZone ? 'Edit Zone' : 'Add Zone'}>
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            const formData = new FormData(e.currentTarget);
            const data = {
              name: formData.get('name'),
              slug: formData.get('slug'),
              description: formData.get('description'),
              status: formData.get('status'),
              parentId: formData.get('parentId') || undefined,
            };
            const method = editingZone ? 'PUT' : 'POST';
            const url = editingZone
              ? `/api/v1/config/zones/${editingZone.id}`
              : '/api/v1/config/zones';
            await fetch(url, {
              method,
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(data),
            });
            setIsModalOpen(false);
            fetchZones();
          }}
          className="space-y-4"
        >
          <Input name="name" label="Name" defaultValue={editingZone?.name} required />
          <Input name="slug" label="Slug" defaultValue={editingZone?.slug} required />
          <Input name="description" label="Description" defaultValue={editingZone?.description} />
          <div>
            <label className="block text-sm font-medium mb-1">Status</label>
            <select name="status" defaultValue={editingZone?.status || 'active'} className="w-full p-2 border rounded">
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="maintenance">Maintenance</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Parent Zone</label>
            <select name="parentId" defaultValue={editingZone?.parentId || ''} className="w-full p-2 border rounded">
              <option value="">Root Zone</option>
              {zones.map(z => (
                <option key={z.id} value={z.id}>{z.name}</option>
              ))}
            </select>
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="secondary" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button type="submit">{editingZone ? 'Update' : 'Create'}</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
