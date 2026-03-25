'use client';

import { usePathname } from 'next/navigation';
import { Link } from '@/i18n/navigation';
import { Home, ShoppingBag, ShoppingCart, User } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useCartStore } from '@/stores/cart-store';

const NAV_ITEMS = [
  { href: '/', icon: Home, labelKey: 'home' },
  { href: '/#products', icon: ShoppingBag, labelKey: 'products' },
  { href: '/cart', icon: ShoppingCart, labelKey: 'cart', showBadge: true },
  { href: '/dashboard', icon: User, labelKey: 'account' },
];

export default function BottomNav() {
  const pathname = usePathname();
  const t = useTranslations('common');
  const totalItems = useCartStore((s) => s.totalItems());

  // Hide on admin pages
  if (pathname.includes('/admin')) return null;

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-gray-200 safe-area-bottom">
      <div className="flex items-center justify-around h-16 px-2">
        {NAV_ITEMS.map(({ href, icon: Icon, labelKey, showBadge }) => {
          const isActive = pathname === href ||
            (href === '/' && pathname.endsWith('/fr')) ||
            (href === '/' && pathname.endsWith('/en')) ||
            (href !== '/' && pathname.includes(href.replace('/#', '')));

          return (
            <Link
              key={href}
              href={href}
              className={`relative flex flex-col items-center justify-center gap-0.5 w-16 h-14 rounded-xl transition-all duration-200 active:scale-90 ${
                isActive
                  ? 'text-nature-green'
                  : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              <div className="relative">
                <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5]' : ''}`} />
                {showBadge && totalItems > 0 && (
                  <span className="absolute -top-1.5 -right-2.5 min-w-[18px] h-[18px] flex items-center justify-center bg-red text-white text-[10px] font-bold rounded-full px-1 leading-none shadow-sm">
                    {totalItems > 99 ? '99+' : totalItems}
                  </span>
                )}
              </div>
              <span className="text-[10px] font-medium leading-none">{t(labelKey)}</span>
              {isActive && (
                <div className="absolute -bottom-0 w-8 h-0.5 bg-nature-green rounded-full" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
