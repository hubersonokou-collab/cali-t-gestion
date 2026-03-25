'use client';

import { useTranslations } from 'next-intl';
import { Link, usePathname } from '@/i18n/navigation';
import { Package, User, ShoppingBag } from 'lucide-react';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const t = useTranslations('dashboard');
  const pathname = usePathname();

  const navItems = [
    { href: '/dashboard', label: t('orders'), icon: Package, exact: true },
    { href: '/dashboard/profile', label: t('profile'), icon: User },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="font-heading text-3xl font-bold text-nature-green-dark mb-8">{t('title')}</h1>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar */}
        <nav className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = item.exact ? pathname === item.href : pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-nature-green/10 text-nature-green-dark'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {item.label}
                </Link>
              );
            })}
          </div>
        </nav>

        {/* Content */}
        <div className="lg:col-span-3">{children}</div>
      </div>
    </div>
  );
}
