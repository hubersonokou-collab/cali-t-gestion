'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { createClient } from '@/lib/supabase/client';
import Card from '@/components/ui/Card';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import { formatPrice } from '@/lib/constants';
import { Plus, Trash2, Truck, MapPin, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AdminDeliveriesPage() {
  const t = useTranslations('adminDeliveries');
  const [zones, setZones] = useState<any[]>([]);
  const [activeDeliveries, setActiveDeliveries] = useState<any[]>([]);
  const [newZone, setNewZone] = useState({ name: '', fee: '' });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const { data: z } = await supabase.from('delivery_zones').select('*');
      setZones(z || []);
      const { data: d } = await supabase.from('orders').select('*, client:profiles(full_name)').eq('status', 'livraison');
      setActiveDeliveries(d || []);
      setLoading(false);
    }
    load();
  }, []);

  const handleAddZone = async () => {
    if (!newZone.name || !newZone.fee) return;
    const supabase = createClient();
    const { data, error } = await supabase.from('delivery_zones').insert({
      name: newZone.name,
      fee_fcfa: parseInt(newZone.fee),
      is_active: true,
    }).select().single();
    if (error) { toast.error('Erreur'); return; }
    setZones([...zones, data]);
    setNewZone({ name: '', fee: '' });
    toast.success('Zone ajoutee !');
  };

  const handleDeleteZone = async (id: string) => {
    const supabase = createClient();
    await supabase.from('delivery_zones').update({ is_active: false }).eq('id', id);
    setZones(zones.map(z => z.id === id ? { ...z, is_active: false } : z));
    toast.success('Zone desactivee');
  };

  if (loading) {
    return <div className="py-16 text-center"><Loader2 className="w-8 h-8 animate-spin text-nature-green mx-auto" /></div>;
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">{t('title')}</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <h2 className="font-semibold text-lg mb-4 flex items-center gap-2">
            <Truck className="w-5 h-5 text-nature-green" />
            {t('activeDeliveries')}
          </h2>
          {activeDeliveries.length === 0 ? (
            <p className="text-gray-500 text-sm">Aucune livraison en cours</p>
          ) : (
            <div className="space-y-3">
              {activeDeliveries.map((d) => (
                <div key={d.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <span className="font-medium text-sm">{d.order_number}</span>
                    <span className="block text-xs text-gray-500">{d.client?.full_name || 'Client'} - {d.delivery_zone || d.delivery_city}</span>
                  </div>
                  <Badge variant="blue">En cours</Badge>
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card className="p-6">
          <h2 className="font-semibold text-lg mb-4 flex items-center gap-2">
            <MapPin className="w-5 h-5 text-nature-green" />
            {t('zones')}
          </h2>

          <div className="space-y-2 mb-4">
            {zones.map((zone) => (
              <div key={zone.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-sm">{zone.name}</span>
                  <Badge variant={zone.is_active ? 'green' : 'gray'}>
                    {zone.is_active ? 'Actif' : 'Inactif'}
                  </Badge>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-gold-dark">{formatPrice(zone.fee_fcfa)}</span>
                  <button onClick={() => handleDeleteZone(zone.id)} className="p-1 text-red hover:bg-red/5 rounded">
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="flex gap-2 pt-4 border-t">
            <Input
              placeholder={t('zoneName')}
              value={newZone.name}
              onChange={(e) => setNewZone({ ...newZone, name: e.target.value })}
              className="flex-1"
            />
            <Input
              placeholder="FCFA"
              type="number"
              value={newZone.fee}
              onChange={(e) => setNewZone({ ...newZone, fee: e.target.value })}
              className="w-24"
            />
            <Button onClick={handleAddZone} size="sm">
              <Plus className="w-4 h-4" />
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
