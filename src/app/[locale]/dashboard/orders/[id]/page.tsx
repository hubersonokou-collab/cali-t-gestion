'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { useParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import Card from '@/components/ui/Card';
import OrderStatusTracker from '@/components/orders/OrderStatusTracker';
import { formatPrice } from '@/lib/constants';
import { Link } from '@/i18n/navigation';
import { ArrowLeft, Loader2 } from 'lucide-react';
import type { OrderStatus } from '@/lib/constants';

export default function OrderDetailPage() {
  const t = useTranslations('dashboard');
  const tc = useTranslations('common');
  const params = useParams();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadOrder() {
      const supabase = createClient();
      const { data } = await supabase
        .from('orders')
        .select('*, items:order_items(*, product:products(name_fr, name_en), format:product_formats(size))')
        .eq('id', params.id)
        .single();
      setOrder(data);
      setLoading(false);
    }
    loadOrder();
  }, [params.id]);

  if (loading) {
    return (
      <div className="py-16 text-center">
        <Loader2 className="w-8 h-8 animate-spin text-nature-green mx-auto" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="py-16 text-center">
        <p className="text-gray-500">Commande introuvable</p>
      </div>
    );
  }

  return (
    <div>
      <Link href="/dashboard" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-nature-green mb-6">
        <ArrowLeft className="w-4 h-4" />
        {tc('back')}
      </Link>

      <Card className="p-6 mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-gray-800">{t('orderNumber')}{order.order_number}</h2>
            <p className="text-sm text-gray-500">
              {new Date(order.created_at).toLocaleDateString('fr-FR', {
                day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit',
              })}
            </p>
          </div>
        </div>

        <OrderStatusTracker currentStatus={order.status as OrderStatus} />
      </Card>

      <Card className="p-6 mb-6">
        <h3 className="font-semibold text-gray-800 mb-4">{t('orderDetails')}</h3>
        <div className="space-y-3">
          {order.items?.map((item: any, i: number) => (
            <div key={i} className="flex justify-between items-center py-2 border-b border-gray-50">
              <div>
                <span className="font-medium">{item.product?.name_fr || 'Produit'}</span>
                <span className="text-sm text-gray-500 ml-2">{item.format?.size} x {item.quantity}</span>
              </div>
              <span className="font-medium">{formatPrice(item.total_fcfa)}</span>
            </div>
          ))}
        </div>

        <div className="mt-4 pt-4 border-t space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Sous-total</span>
            <span>{formatPrice(order.subtotal_fcfa)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Livraison</span>
            <span>{formatPrice(order.delivery_fee_fcfa)}</span>
          </div>
          <div className="flex justify-between font-bold text-lg pt-2 border-t">
            <span>Total</span>
            <span className="text-gold-dark">{formatPrice(order.total_fcfa)}</span>
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="font-semibold text-gray-800 mb-2">Livraison</h3>
        <p className="text-gray-600">{order.delivery_address}</p>
        <p className="text-sm text-gray-500 mt-1 capitalize">Paiement: {order.payment_method}</p>
      </Card>
    </div>
  );
}
