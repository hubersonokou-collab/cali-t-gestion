'use client';

import { useTranslations } from 'next-intl';
import { Check, Clock, ChefHat, Package, Truck, CheckCircle2 } from 'lucide-react';
import type { OrderStatus } from '@/lib/constants';

const STEPS: { key: OrderStatus; icon: React.ElementType }[] = [
  { key: 'commande', icon: Clock },
  { key: 'preparation', icon: ChefHat },
  { key: 'disponible', icon: Package },
  { key: 'livraison', icon: Truck },
  { key: 'terminee', icon: CheckCircle2 },
];

interface OrderStatusTrackerProps {
  currentStatus: OrderStatus;
}

export default function OrderStatusTracker({ currentStatus }: OrderStatusTrackerProps) {
  const t = useTranslations('orderStatus');

  if (currentStatus === 'annulee') {
    return (
      <div className="flex items-center gap-2 text-red">
        <span className="font-medium">{t('annulee')}</span>
      </div>
    );
  }

  const currentIndex = STEPS.findIndex((s) => s.key === currentStatus);

  return (
    <div className="w-full">
      <div className="flex items-center justify-between relative">
        {/* Progress line */}
        <div className="absolute top-5 left-0 right-0 h-0.5 bg-gray-200">
          <div
            className="h-full bg-nature-green transition-all duration-500"
            style={{ width: `${(currentIndex / (STEPS.length - 1)) * 100}%` }}
          />
        </div>

        {STEPS.map((step, index) => {
          const Icon = step.icon;
          const isCompleted = index < currentIndex;
          const isCurrent = index === currentIndex;
          const isPending = index > currentIndex;

          return (
            <div key={step.key} className="flex flex-col items-center relative z-10">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                  isCompleted
                    ? 'bg-nature-green text-white'
                    : isCurrent
                    ? 'bg-nature-green text-white ring-4 ring-nature-green/20'
                    : 'bg-gray-100 text-gray-400'
                }`}
              >
                {isCompleted ? (
                  <Check className="w-5 h-5" />
                ) : (
                  <Icon className="w-5 h-5" />
                )}
              </div>
              <span
                className={`mt-2 text-xs font-medium text-center max-w-[80px] ${
                  isPending ? 'text-gray-400' : 'text-gray-700'
                }`}
              >
                {t(step.key)}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
