'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { useCartStore } from '@/stores/cart-store';
import { formatPrice } from '@/lib/constants';
import { useRouter } from '@/i18n/navigation';
import { createClient } from '@/lib/supabase/client';
import Card from '@/components/ui/Card';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import { CreditCard, Banknote, CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function CheckoutPage() {
  const t = useTranslations('checkout');
  const tc = useTranslations('cart');
  const router = useRouter();
  const { items, subtotal, clearCart } = useCartStore();
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);

  const [form, setForm] = useState({
    address: '',
    city: '',
    zone: '',
    paymentMethod: 'cash' as 'cash' | 'wave',
    notes: '',
  });

  const [zones, setZones] = useState<{name: string, fee_fcfa: number}[]>([]);

  useEffect(() => {
    async function loadZones() {
      const supabase = createClient();
      const { data } = await supabase.from('delivery_zones').select('name, fee_fcfa').eq('is_active', true);
      setZones(data || []);
    }
    loadZones();
    setMounted(true);
  }, []);

  const deliveryFee = zones.find(z => z.name === form.zone)?.fee_fcfa || 500;
  const total = subtotal() + deliveryFee;

  if (!mounted) return null;

  if (orderPlaced) {
    return (
      <div className="max-w-lg mx-auto px-4 py-16 text-center">
        <CheckCircle2 className="w-20 h-20 text-nature-green mx-auto mb-6" />
        <h1 className="font-heading text-3xl font-bold text-nature-green-dark mb-3">
          {t('orderConfirmed')}
        </h1>
        <p className="text-gray-600 mb-8">{t('orderConfirmedDesc')}</p>
        <Button onClick={() => router.push('/dashboard')} size="lg">
          Voir mes commandes
        </Button>
      </div>
    );
  }

  if (items.length === 0) {
    router.push('/cart');
    return null;
  }

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.address.trim()) {
      toast.error('Veuillez saisir une adresse de livraison');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          delivery_address: form.address,
          delivery_city: form.city,
          delivery_zone: form.zone,
          payment_method: form.paymentMethod,
          notes: form.notes,
          items: items.map(item => ({
            product_id: item.productId,
            format_id: item.formatId,
            quantity: item.quantity,
            with_alcohol: item.withAlcohol,
            unit_price_fcfa: item.unitPrice,
          })),
        }),
      });
      if (!res.ok) throw new Error('Failed');
      clearCart();
      setOrderPlaced(true);
    } catch {
      toast.error('Erreur lors de la creation de la commande');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="font-heading text-3xl font-bold text-nature-green-dark mb-8">{t('title')}</h1>

      <form onSubmit={handlePlaceOrder}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            {/* Delivery info */}
            <Card className="p-6">
              <h2 className="font-semibold text-lg text-gray-800 mb-4">{t('deliveryInfo')}</h2>
              <div className="space-y-4">
                <Input
                  label={t('address')}
                  value={form.address}
                  onChange={(e) => setForm({ ...form, address: e.target.value })}
                  placeholder="123 Rue Example, Cocody"
                  required
                />
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label={t('city')}
                    value={form.city}
                    onChange={(e) => setForm({ ...form, city: e.target.value })}
                    placeholder="Abidjan"
                  />
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">{t('zone')}</label>
                    <select
                      value={form.zone}
                      onChange={(e) => setForm({ ...form, zone: e.target.value })}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-nature-green focus:border-transparent bg-white"
                    >
                      <option value="">Selectionnez une zone</option>
                      {zones.map((z) => (
                        <option key={z.name} value={z.name}>
                          {z.name} - {formatPrice(z.fee_fcfa)}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <Input
                  label={t('notes')}
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  placeholder="Instructions speciales..."
                />
              </div>
            </Card>

            {/* Payment method */}
            <Card className="p-6">
              <h2 className="font-semibold text-lg text-gray-800 mb-4">{t('paymentMethod')}</h2>
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setForm({ ...form, paymentMethod: 'cash' })}
                  className={`p-4 rounded-xl border-2 text-center transition-all ${
                    form.paymentMethod === 'cash'
                      ? 'border-nature-green bg-nature-green/5'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <Banknote className="w-8 h-8 mx-auto mb-2 text-nature-green" />
                  <span className="block font-medium text-sm">{t('cashOnDelivery')}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setForm({ ...form, paymentMethod: 'wave' })}
                  className={`p-4 rounded-xl border-2 text-center transition-all ${
                    form.paymentMethod === 'wave'
                      ? 'border-nature-green bg-nature-green/5'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <CreditCard className="w-8 h-8 mx-auto mb-2 text-blue-500" />
                  <span className="block font-medium text-sm">{t('wavePayment')}</span>
                </button>
              </div>
            </Card>
          </div>

          {/* Summary */}
          <Card className="p-6 h-fit lg:sticky lg:top-24">
            <h2 className="font-semibold text-lg text-gray-800 mb-4">{tc('title')}</h2>

            <div className="space-y-2 mb-4">
              {items.map((item) => (
                <div key={item.formatId} className="flex justify-between text-sm">
                  <span className="text-gray-600">
                    {item.productName} ({item.formatSize}) x{item.quantity}
                  </span>
                  <span>{formatPrice(item.unitPrice * item.quantity)}</span>
                </div>
              ))}
            </div>

            <div className="border-t pt-3 space-y-2 mb-6">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">{tc('subtotal')}</span>
                <span>{formatPrice(subtotal())}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">{tc('deliveryFee')}</span>
                <span>{formatPrice(deliveryFee)}</span>
              </div>
              <div className="flex justify-between font-bold text-lg pt-2 border-t">
                <span>{tc('total')}</span>
                <span className="text-gold-dark">{formatPrice(total)}</span>
              </div>
            </div>

            <Button type="submit" className="w-full" size="lg" disabled={loading}>
              {loading ? '...' : t('placeOrder')}
            </Button>
          </Card>
        </div>
      </form>
    </div>
  );
}
