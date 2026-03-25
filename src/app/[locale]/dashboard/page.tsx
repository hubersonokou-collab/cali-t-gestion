'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { createClient } from '@/lib/supabase/client';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import OrderStatusTracker from '@/components/orders/OrderStatusTracker';
import { Link } from '@/i18n/navigation';
import { formatPrice } from '@/lib/constants';
import { Package, Eye, Loader2 } from 'lucide-react';
import type { OrderStatus } from '@/lib/constants';

export default function DashboardPage() {
  const t = useTranslations('dashboard');
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadOrders() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase.from('orders').select('*').eq('client_id', user.id).order('created_at', { ascending: false });
      setOrders(data || []);
      setLoading(false);
    }
    loadOrders();
  }, []);

  const statusBadgeVariant = (status: OrderStatus) => {
    switch (status) {
      case 'commande': return 'blue' as const;
      case 'preparation': return 'gold' as const;
      case 'disponible': return 'green' as const;
      case 'livraison': return 'gold' as const;
      case 'terminee': return 'green' as const;
      case 'annulee': return 'red' as const;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="w-8 h-8 animate-spin text-nature-green" />
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-xl font-bold text-gray-800 mb-6">{t('orders')}</h2>

      {orders.length === 0 ? (
        <Card className="p-12 text-center">
          <Package className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">{t('noOrders')}</p>
        </Card>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <Card key={order.id} className="p-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                <div>
                  <h3 className="font-semibold text-gray-800">
                    {t('orderNumber')}{order.order_number}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {new Date(order.created_at).toLocaleDateString('fr-FR', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    })}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant={statusBadgeVariant(order.status)}>
                    {t('orderStatus')}: {order.status}
                  </Badge>
                  <span className="font-bold text-gold-dark">{formatPrice(order.total_fcfa)}</span>
                </div>
              </div>

              <OrderStatusTracker currentStatus={order.status} />

              <div className="mt-4 pt-4 border-t border-gray-100 flex justify-end">
                <Link
                  href={`/dashboard/orders/${order.id}`}
                  className="inline-flex items-center gap-1 text-sm text-nature-green hover:underline"
                >
                  <Eye className="w-4 h-4" />
                  {t('orderDetails')}
                </Link>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
