'use client';

import { useTranslations } from 'next-intl';
import { Link, usePathname } from '@/i18n/navigation';
import { LayoutDashboard, Package, ShoppingBag, Truck, Users, Settings } from 'lucide-react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const t = useTranslations('adminNav');
  const pathname = usePathname();

  const navItems = [
    { href: '/admin', label: t('overview'), icon: LayoutDashboard, exact: true },
    { href: '/admin/orders', label: t('orders'), icon: Package },
    { href: '/admin/products', label: t('products'), icon: ShoppingBag },
    { href: '/admin/deliveries', label: t('deliveries'), icon: Truck },
    { href: '/admin/clients', label: t('clients'), icon: Users },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex">
        {/* Sidebar */}
        <aside className="hidden lg:flex lg:flex-col w-64 bg-nature-green-dark text-white min-h-screen p-4">
          <div className="flex items-center gap-2 mb-8 px-3">
            <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
              <span className="text-nature-green font-bold text-sm">C</span>
            </div>
            <span className="font-heading font-bold text-lg">Cali-T Admin</span>
          </div>

          <nav className="space-y-1 flex-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = item.exact ? pathname === item.href : pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-white/15 text-white'
                      : 'text-white/70 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <Link
            href="/"
            className="flex items-center gap-3 px-3 py-2.5 text-white/50 text-sm hover:text-white transition-colors"
          >
            Retour au site
          </Link>
        </aside>

        {/* Mobile nav */}
        <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t z-40">
          <nav className="flex justify-around py-2">
            {navItems.slice(0, 5).map((item) => {
              const Icon = item.icon;
              const isActive = item.exact ? pathname === item.href : pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex flex-col items-center gap-0.5 px-2 py-1 text-xs ${
                    isActive ? 'text-nature-green' : 'text-gray-500'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 pb-20 lg:pb-8">
          {children}
        </main>
      </div>
    </div>
  );
}
