'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { createClient } from '@/lib/supabase/client';
import Card from '@/components/ui/Card';
import Input from '@/components/ui/Input';
import { Link } from '@/i18n/navigation';
import { Search, Eye, Loader2 } from 'lucide-react';
import Button from '@/components/ui/Button';

export default function AdminClientsPage() {
  const t = useTranslations('adminClients');
  const tc = useTranslations('common');
  const [clients, setClients] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('role', 'client')
        .order('created_at', { ascending: false });

      const clientsWithOrders = await Promise.all(
        (data || []).map(async (c) => {
          const { count } = await supabase.from('orders').select('id', { count: 'exact', head: true }).eq('client_id', c.id);
          return { ...c, orders_count: count || 0 };
        })
      );
      setClients(clientsWithOrders);
      setLoading(false);
    }
    load();
  }, []);

  const filtered = clients.filter((c) =>
    (c.full_name || c.phone || '').toLowerCase().includes(search.toLowerCase()) ||
    c.phone.includes(search)
  );

  if (loading) {
    return <div className="py-16 text-center"><Loader2 className="w-8 h-8 animate-spin text-nature-green mx-auto" /></div>;
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">{t('title')}</h1>

      <div className="mb-6">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder={tc('search') + '...'}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <Card className="overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50 border-b">
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('name')}</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('phone')}</th>
              <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">{t('orders')}</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('registered')}</th>
              <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filtered.length === 0 ? (
              <tr><td colSpan={5} className="px-4 py-8 text-center text-gray-400">Aucun client</td></tr>
            ) : (
              filtered.map((client) => (
                <tr key={client.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-sm">{client.full_name || client.phone}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{client.phone}</td>
                  <td className="px-4 py-3 text-center text-sm">{client.orders_count}</td>
                  <td className="px-4 py-3 text-sm text-gray-500">
                    {new Date(client.created_at).toLocaleDateString('fr-FR')}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <Link href={`/admin/clients/${client.id}`}>
                      <Button variant="ghost" size="sm"><Eye className="w-4 h-4" /></Button>
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
