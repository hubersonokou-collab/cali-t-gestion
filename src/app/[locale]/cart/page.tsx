'use client';

import { useTranslations } from 'next-intl';
import { useCartStore } from '@/stores/cart-store';
import { formatPrice } from '@/lib/constants';
import { Link } from '@/i18n/navigation';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import { Minus, Plus, Trash2, ShoppingBag, ArrowLeft } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function CartPage() {
  const t = useTranslations('cart');
  const tc = useTranslations('common');
  const { items, removeItem, updateQuantity, subtotal, clearCart } = useCartStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <p>{tc('loading')}</p>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <ShoppingBag className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-gray-800 mb-2">{t('empty')}</h1>
        <Link href="/">
          <Button variant="outline" className="mt-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            {t('continueShopping')}
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="font-heading text-3xl font-bold text-nature-green-dark mb-8">{t('title')}</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Items */}
        <div className="lg:col-span-2 space-y-4">
          {items.map((item) => (
            <Card key={item.formatId} className="p-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-gradient-to-br from-nature-green/10 to-gold/10 rounded-lg flex items-center justify-center shrink-0">
                  <ShoppingBag className="w-6 h-6 text-nature-green" />
                </div>

                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-800 truncate">{item.productName}</h3>
                  <p className="text-sm text-gray-500">
                    {item.formatSize}
                    {item.withAlcohol && ' - Avec alcool'}
                  </p>
                  <p className="text-sm font-medium text-gold-dark">
                    {formatPrice(item.unitPrice)}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => updateQuantity(item.formatId, item.quantity - 1)}
                    className="p-1.5 rounded-lg border border-gray-200 hover:bg-gray-50"
                  >
                    <Minus className="w-3 h-3" />
                  </button>
                  <span className="w-8 text-center font-bold">{item.quantity}</span>
                  <button
                    onClick={() => updateQuantity(item.formatId, item.quantity + 1)}
                    className="p-1.5 rounded-lg border border-gray-200 hover:bg-gray-50"
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                </div>

                <span className="font-bold text-gray-800 min-w-[80px] text-right">
                  {formatPrice(item.unitPrice * item.quantity)}
                </span>

                <button
                  onClick={() => removeItem(item.formatId)}
                  className="p-2 text-red hover:bg-red/5 rounded-lg transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </Card>
          ))}
        </div>

        {/* Summary */}
        <Card className="p-6 h-fit lg:sticky lg:top-24">
          <h2 className="font-semibold text-lg text-gray-800 mb-4">{t('title')}</h2>

          <div className="space-y-3 mb-6">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">{t('subtotal')}</span>
              <span className="font-medium">{formatPrice(subtotal())}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">{t('deliveryFee')}</span>
              <span className="text-gray-400">-</span>
            </div>
            <div className="border-t pt-3 flex justify-between">
              <span className="font-bold text-lg">{t('total')}</span>
              <span className="font-bold text-lg text-gold-dark">{formatPrice(subtotal())}</span>
            </div>
          </div>

          <Link href="/checkout">
            <Button className="w-full" size="lg">
              {t('proceedCheckout')}
            </Button>
          </Link>

          <Link href="/">
            <Button variant="ghost" className="w-full mt-2" size="sm">
              {t('continueShopping')}
            </Button>
          </Link>
        </Card>
      </div>
    </div>
  );
}
