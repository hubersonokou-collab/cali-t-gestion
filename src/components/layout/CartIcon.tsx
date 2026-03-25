'use client';

import { ShoppingCart } from 'lucide-react';
import { useCartStore } from '@/stores/cart-store';
import { Link } from '@/i18n/navigation';
import { useEffect, useState } from 'react';

export default function CartIcon() {
  const [mounted, setMounted] = useState(false);
  const totalItems = useCartStore((s) => s.totalItems);

  useEffect(() => setMounted(true), []);

  const count = mounted ? totalItems() : 0;

  return (
    <Link
      href="/cart"
      className="relative p-2 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
      aria-label="Cart"
    >
      <ShoppingCart className="w-5 h-5" />
      {count > 0 && (
        <span className="absolute -top-1 -right-1 bg-red text-white text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full">
          {count > 9 ? '9+' : count}
        </span>
      )}
    </Link>
  );
}
