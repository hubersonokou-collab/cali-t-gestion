'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { useParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import { Link } from '@/i18n/navigation';
import { ArrowLeft, User, Phone, MapPin, Loader2 } from 'lucide-react';
import { formatPrice } from '@/lib/constants';

export default function AdminClientDetailPage() {
  const t = useTranslations('adminClients');
  const tc = useTranslations('common');
  const params = useParams();
  const [client, setClient] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const { data: profile } = await supabase.from('profiles').select('*').eq('id', params.id).single();
      const { data: orders } = await supabase.from('orders').select('*').eq('client_id', params.id).order('created_at', { ascending: false });
      if (profile) setClient({ ...profile, orders: orders || [] });
      setLoading(false);
    }
    load();
  }, [params.id]);

  if (loading) {
    return <div className="py-16 text-center"><Loader2 className="w-8 h-8 animate-spin text-nature-green mx-auto" /></div>;
  }

  if (!client) {
    return <div className="py-16 text-center"><p className="text-gray-500">Client introuvable</p></div>;
  }

  return (
    <div>
      <Link href="/admin/clients" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-nature-green mb-6">
        <ArrowLeft className="w-4 h-4" />
        {tc('back')}
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="p-6">
          <div className="text-center mb-4">
            <div className="w-16 h-16 bg-nature-green/10 rounded-full flex items-center justify-center mx-auto mb-3">
              <User className="w-8 h-8 text-nature-green" />
            </div>
            <h2 className="font-bold text-lg">{client.full_name || client.phone}</h2>
          </div>
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Phone className="w-4 h-4" />{client.phone}
            </div>
            {(client.address || client.city) && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <MapPin className="w-4 h-4" />{[client.address, client.city].filter(Boolean).join(', ')}
              </div>
            )}
          </div>
          <p className="text-xs text-gray-400 mt-4">Inscrit le {new Date(client.created_at).toLocaleDateString('fr-FR')}</p>
        </Card>

        <div className="lg:col-span-2">
          <Card className="p-6">
            <h3 className="font-semibold text-lg mb-4">Historique des commandes</h3>
            {client.orders.length === 0 ? (
              <p className="text-gray-400 text-sm">Aucune commande</p>
            ) : (
              <div className="space-y-3">
                {client.orders.map((order: any) => (
                  <div key={order.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <span className="font-medium text-sm">{order.order_number}</span>
                      <span className="block text-xs text-gray-500">{new Date(order.created_at).toLocaleDateString('fr-FR')}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge variant={order.status === 'terminee' ? 'green' : order.status === 'annulee' ? 'red' : 'blue'}>{order.status}</Badge>
                      <span className="font-medium text-sm">{formatPrice(order.total_fcfa)}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
