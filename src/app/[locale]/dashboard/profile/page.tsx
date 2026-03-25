'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { createClient } from '@/lib/supabase/client';
import Card from '@/components/ui/Card';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import toast from 'react-hot-toast';

export default function ProfilePage() {
  const t = useTranslations('profile');
  const [form, setForm] = useState({
    full_name: '',
    phone: '',
    address: '',
    city: '',
    zone: '',
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function loadProfile() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single();
      if (data) {
        setForm({
          full_name: data.full_name || '',
          phone: data.phone || '',
          address: data.address || '',
          city: data.city || '',
          zone: data.zone || '',
        });
      }
    }
    loadProfile();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setLoading(false); return; }
    const { error } = await supabase.from('profiles').update({
      full_name: form.full_name,
      address: form.address,
      city: form.city,
      zone: form.zone,
      updated_at: new Date().toISOString(),
    }).eq('id', user.id);
    setLoading(false);
    if (error) toast.error('Erreur lors de la sauvegarde');
    else toast.success(t('saved'));
  };

  return (
    <div>
      <h2 className="text-xl font-bold text-gray-800 mb-6">{t('title')}</h2>

      <Card className="p-6">
        <form onSubmit={handleSave} className="space-y-4">
          <Input
            label={t('fullName')}
            value={form.full_name}
            onChange={(e) => setForm({ ...form, full_name: e.target.value })}
            placeholder="John Doe"
          />
          <Input
            label={t('phone')}
            value={form.phone}
            disabled
            className="bg-gray-50"
          />
          <Input
            label={t('address')}
            value={form.address}
            onChange={(e) => setForm({ ...form, address: e.target.value })}
            placeholder="123 Rue Example"
          />
          <div className="grid grid-cols-2 gap-4">
            <Input
              label={t('city')}
              value={form.city}
              onChange={(e) => setForm({ ...form, city: e.target.value })}
              placeholder="Abidjan"
            />
            <Input
              label={t('zone')}
              value={form.zone}
              onChange={(e) => setForm({ ...form, zone: e.target.value })}
              placeholder="Cocody"
            />
          </div>
          <Button type="submit" disabled={loading}>
            {loading ? '...' : t('saved').replace('!', '')}
          </Button>
        </form>
      </Card>
    </div>
  );
}
