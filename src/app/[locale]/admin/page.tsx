'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { createClient } from '@/lib/supabase/client';
import Card from '@/components/ui/Card';
import { formatPrice } from '@/lib/constants';
import { Package, DollarSign, Clock, Truck, TrendingUp, Loader2 } from 'lucide-react';
import type { OrderStatus } from '@/lib/constants';

export default function AdminOverviewPage() {
  const t = useTranslations('adminOverview');
  const [stats, setStats] = useState({ todayOrders: 0, weekRevenue: 0, pendingOrders: 0, activeDeliveries: 0 });
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDashboard() {
      const supabase = createClient();
      const today = new Date().toISOString().split('T')[0];
      const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

      const [todayRes, pendingRes, deliveryRes, weekRes, recentRes] = await Promise.all([
        supabase.from('orders').select('id').gte('created_at', today),
        supabase.from('orders').select('id').in('status', ['commande', 'preparation']),
        supabase.from('orders').select('id').eq('status', 'livraison'),
        supabase.from('orders').select('total_fcfa').gte('created_at', weekAgo),
        supabase.from('orders').select('*, client:profiles(full_name)').order('created_at', { ascending: false }).limit(10),
      ]);

      setStats({
        todayOrders: todayRes.data?.length || 0,
        weekRevenue: weekRes.data?.reduce((sum, o) => sum + o.total_fcfa, 0) || 0,
        pendingOrders: pendingRes.data?.length || 0,
        activeDeliveries: deliveryRes.data?.length || 0,
      });
      setRecentOrders(recentRes.data || []);
      setLoading(false);
    }
    loadDashboard();
  }, []);

  const STAT_CONFIG = [
    { key: 'todayOrders', value: stats.todayOrders, icon: Package, color: 'bg-blue-50 text-blue-600' },
    { key: 'weekRevenue', value: stats.weekRevenue, icon: DollarSign, color: 'bg-green-50 text-green-600', isMoney: true },
    { key: 'pendingOrders', value: stats.pendingOrders, icon: Clock, color: 'bg-gold/10 text-gold-dark' },
    { key: 'activeDeliveries', value: stats.activeDeliveries, icon: Truck, color: 'bg-red/10 text-red' },
  ];

  if (loading) {
    return (
      <div className="py-16 text-center">
        <Loader2 className="w-8 h-8 animate-spin text-nature-green mx-auto" />
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">{t('title')}</h1>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {STAT_CONFIG.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.key} className="p-5">
              <div className="flex items-center justify-between mb-3">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${stat.color}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <TrendingUp className="w-4 h-4 text-nature-green" />
              </div>
              <p className="text-2xl font-bold text-gray-800">
                {stat.isMoney ? formatPrice(stat.value as number) : stat.value}
              </p>
              <p className="text-sm text-gray-500 mt-1">{t(stat.key as any)}</p>
            </Card>
          );
        })}
      </div>

      <Card className="p-6">
        <h2 className="font-semibold text-lg text-gray-800 mb-4">{t('recentOrders')}</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b text-left">
                <th className="pb-3 text-sm font-medium text-gray-500">N Commande</th>
                <th className="pb-3 text-sm font-medium text-gray-500">Client</th>
                <th className="pb-3 text-sm font-medium text-gray-500">Statut</th>
                <th className="pb-3 text-sm font-medium text-gray-500 text-right">Total</th>
              </tr>
            </thead>
            <tbody>
              {recentOrders.length === 0 ? (
                <tr><td colSpan={4} className="py-8 text-center text-gray-400">Aucune commande</td></tr>
              ) : (
                recentOrders.map((order) => (
                  <tr key={order.id} className="border-b border-gray-50 hover:bg-gray-50">
                    <td className="py-3 text-sm font-medium">{order.order_number}</td>
                    <td className="py-3 text-sm text-gray-600">{order.client?.full_name || 'Client'}</td>
                    <td className="py-3">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                        order.status === 'terminee' ? 'bg-green-50 text-green-600' :
                        order.status === 'livraison' ? 'bg-blue-50 text-blue-600' :
                        order.status === 'preparation' ? 'bg-gold/10 text-gold-dark' :
                        'bg-gray-100 text-gray-600'
                      }`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="py-3 text-sm font-medium text-right">{formatPrice(order.total_fcfa)}</td>
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
