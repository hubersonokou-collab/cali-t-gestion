'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { createClient } from '@/lib/supabase/client';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import Select from '@/components/ui/Select';
import { formatPrice } from '@/lib/constants';
import { Link } from '@/i18n/navigation';
import { Eye, Filter, Loader2 } from 'lucide-react';
import type { OrderStatus } from '@/lib/constants';

export default function AdminOrdersPage() {
  const t = useTranslations('adminOrders');
  const [orders, setOrders] = useState<any[]>([]);
  const [filter, setFilter] = useState<string>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadOrders() {
      const supabase = createClient();
      const { data } = await supabase
        .from('orders')
        .select('*, client:profiles(full_name, phone)')
        .order('created_at', { ascending: false });
      setOrders(data || []);
      setLoading(false);
    }
    loadOrders();
  }, []);

  const filteredOrders = filter === 'all'
    ? orders
    : orders.filter((o) => o.status === filter);

  const statusOptions = [
    { value: 'all', label: t('allOrders') },
    { value: 'commande', label: 'Commande' },
    { value: 'preparation', label: 'Preparation' },
    { value: 'disponible', label: 'Disponible' },
    { value: 'livraison', label: 'Livraison' },
    { value: 'terminee', label: 'Terminee' },
    { value: 'annulee', label: 'Annulee' },
  ];

  const statusBadge = (status: OrderStatus) => {
    const variants: Record<OrderStatus, 'blue' | 'gold' | 'green' | 'red' | 'gray'> = {
      commande: 'blue', preparation: 'gold', disponible: 'green',
      livraison: 'blue', terminee: 'green', annulee: 'red',
    };
    return variants[status];
  };

  if (loading) {
    return <div className="py-16 text-center"><Loader2 className="w-8 h-8 animate-spin text-nature-green mx-auto" /></div>;
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">{t('title')}</h1>
        <div className="flex items-center gap-2 mt-4 sm:mt-0">
          <Filter className="w-4 h-4 text-gray-500" />
          <Select
            options={statusOptions}
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="w-40"
          />
        </div>
      </div>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b">
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Commande</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('client')}</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Statut</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('paymentMethod')}</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Total</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredOrders.length === 0 ? (
                <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-400">Aucune commande</td></tr>
              ) : (
                filteredOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div>
                        <span className="font-medium text-sm">{order.order_number}</span>
                        <span className="block text-xs text-gray-500">
                          {new Date(order.created_at).toLocaleDateString('fr-FR')}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div>
                        <span className="text-sm font-medium">{order.client?.full_name || 'Client'}</span>
                        <span className="block text-xs text-gray-500">{order.client?.phone}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={statusBadge(order.status)}>{order.status}</Badge>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm capitalize">{order.payment_method}</span>
                      <span className={`block text-xs ${order.payment_status === 'paid' ? 'text-green-600' : 'text-gold-dark'}`}>
                        {order.payment_status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right font-medium text-sm">
                      {formatPrice(order.total_fcfa)}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <Link href={`/admin/orders/${order.id}`}>
                        <Button variant="ghost" size="sm">
                          <Eye className="w-4 h-4" />
                        </Button>
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
