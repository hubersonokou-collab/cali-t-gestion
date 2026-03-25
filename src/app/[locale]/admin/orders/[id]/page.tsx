'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { useParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Select from '@/components/ui/Select';
import Badge from '@/components/ui/Badge';
import OrderStatusTracker from '@/components/orders/OrderStatusTracker';
import { formatPrice } from '@/lib/constants';
import { Link } from '@/i18n/navigation';
import { ArrowLeft, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import type { OrderStatus } from '@/lib/constants';

export default function AdminOrderDetailPage() {
  const t = useTranslations('adminOrders');
  const tc = useTranslations('common');
  const params = useParams();

  const [order, setOrder] = useState<any>(null);
  const [status, setStatus] = useState<OrderStatus>('commande');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadOrder() {
      const supabase = createClient();
      const { data } = await supabase
        .from('orders')
        .select('*, items:order_items(*, product:products(name_fr, name_en), format:product_formats(size)), client:profiles(full_name, phone)')
        .eq('id', params.id)
        .single();
      if (data) {
        setOrder(data);
        setStatus(data.status);
      }
      setLoading(false);
    }
    loadOrder();
  }, [params.id]);

  const statusOptions = [
    { value: 'commande', label: 'Commande' },
    { value: 'preparation', label: 'Preparation du jus' },
    { value: 'disponible', label: 'Disponible' },
    { value: 'livraison', label: 'Livraison en cours' },
    { value: 'terminee', label: 'Terminee' },
    { value: 'annulee', label: 'Annulee' },
  ];

  const handleUpdateStatus = async () => {
    const supabase = createClient();
    const { error } = await supabase
      .from('orders')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', params.id);
    if (error) toast.error('Erreur');
    else toast.success('Statut mis a jour !');
  };

  if (loading) {
    return <div className="py-16 text-center"><Loader2 className="w-8 h-8 animate-spin text-nature-green mx-auto" /></div>;
  }

  if (!order) {
    return <div className="py-16 text-center"><p className="text-gray-500">Commande introuvable</p></div>;
  }

  return (
    <div>
      <Link href="/admin/orders" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-nature-green mb-6">
        <ArrowLeft className="w-4 h-4" />
        {tc('back')}
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-semibold text-lg">{order.order_number}</h2>
              <Badge variant={order.payment_status === 'paid' ? 'green' : 'gold'}>
                {order.payment_status}
              </Badge>
            </div>
            <OrderStatusTracker currentStatus={status} />

            <div className="mt-6 pt-4 border-t flex items-end gap-3">
              <div className="flex-1">
                <Select
                  label={t('updateStatus')}
                  options={statusOptions}
                  value={status}
                  onChange={(e) => setStatus(e.target.value as OrderStatus)}
                />
              </div>
              <Button onClick={handleUpdateStatus}>Mettre a jour</Button>
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="font-semibold mb-4">{t('items')}</h3>
            {order.items?.map((item: any, i: number) => (
              <div key={i} className="flex justify-between py-2 border-b border-gray-50">
                <div>
                  <span className="font-medium">{item.product?.name_fr || 'Produit'}</span>
                  <span className="text-sm text-gray-500 ml-2">{item.format?.size} x {item.quantity}</span>
                  {item.with_alcohol && <Badge variant="gold" className="ml-2">Alcool</Badge>}
                </div>
                <span className="font-medium">{formatPrice(item.total_fcfa)}</span>
              </div>
            ))}
            <div className="mt-4 pt-3 border-t space-y-1">
              <div className="flex justify-between text-sm"><span>Sous-total</span><span>{formatPrice(order.subtotal_fcfa)}</span></div>
              <div className="flex justify-between text-sm"><span>Livraison</span><span>{formatPrice(order.delivery_fee_fcfa)}</span></div>
              <div className="flex justify-between font-bold text-lg pt-2 border-t"><span>Total</span><span className="text-gold-dark">{formatPrice(order.total_fcfa)}</span></div>
            </div>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="p-6">
            <h3 className="font-semibold mb-4">{t('client')}</h3>
            <p className="font-medium">{order.client?.full_name || 'Client'}</p>
            <p className="text-sm text-gray-500">{order.client?.phone}</p>
          </Card>

          <Card className="p-6">
            <h3 className="font-semibold mb-4">Livraison</h3>
            <p className="text-sm text-gray-600">{order.delivery_address}</p>
            <p className="text-sm text-gray-500 mt-2 capitalize">Paiement: {order.payment_method}</p>
          </Card>

          <Card className="p-6">
            <h3 className="font-semibold mb-2">Date</h3>
            <p className="text-sm text-gray-600">
              {new Date(order.created_at).toLocaleDateString('fr-FR', {
                day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit'
              })}
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
}
