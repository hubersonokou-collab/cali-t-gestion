'use client';

import { useTranslations } from 'next-intl';
import { Zap, Heart, Shield, Droplets, Sun, Leaf } from 'lucide-react';

const BENEFITS = [
  {
    icon: Zap,
    titleFr: 'Énergie Naturelle',
    titleEn: 'Natural Energy',
    descFr: 'Booste votre vitalité grâce au gingembre et au petit cola, sans caféine artificielle.',
    descEn: 'Boosts your vitality with ginger and petit cola, without artificial caffeine.',
    color: 'bg-gold/10 text-gold-dark',
  },
  {
    icon: Shield,
    titleFr: 'Immunité Renforcée',
    titleEn: 'Boosted Immunity',
    descFr: 'Le bissap et le curcuma renforcent vos défenses immunitaires naturellement.',
    descEn: 'Hibiscus and turmeric naturally strengthen your immune defenses.',
    color: 'bg-nature-green/10 text-nature-green-dark',
  },
  {
    icon: Heart,
    titleFr: 'Santé Digestive',
    titleEn: 'Digestive Health',
    descFr: 'Le gingembre et les épices naturelles favorisent une digestion saine.',
    descEn: 'Ginger and natural spices promote healthy digestion.',
    color: 'bg-red/10 text-red-dark',
  },
  {
    icon: Droplets,
    titleFr: 'Hydratation Pure',
    titleEn: 'Pure Hydration',
    descFr: 'Des fruits frais locaux pour une hydratation optimale et rafraîchissante.',
    descEn: 'Fresh local fruits for optimal and refreshing hydration.',
    color: 'bg-blue-100 text-blue-700',
  },
  {
    icon: Sun,
    titleFr: 'Anti-inflammatoire',
    titleEn: 'Anti-inflammatory',
    descFr: 'Le curcuma et le gingembre aident à réduire les inflammations du corps.',
    descEn: 'Turmeric and ginger help reduce body inflammation.',
    color: 'bg-orange-100 text-orange-700',
  },
  {
    icon: Leaf,
    titleFr: '100% Bio & Local',
    titleEn: '100% Organic & Local',
    descFr: 'Tous nos ingrédients sont sourcés localement et certifiés biologiques.',
    descEn: 'All our ingredients are locally sourced and certified organic.',
    color: 'bg-nature-green/10 text-nature-green',
  },
];

export default function BenefitsSection() {
  const t = useTranslations('landing');

  return (
    <section className="py-16 sm:py-24 bg-white relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute top-0 left-0 w-72 h-72 bg-nature-green/5 rounded-full -translate-x-1/2 -translate-y-1/2" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-gold/5 rounded-full translate-x-1/3 translate-y-1/3" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <div className="text-center mb-14">
          <h2 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-bold text-nature-green-dark mb-4">
            Pourquoi Cali-T ?
          </h2>
          <div className="w-20 h-1 bg-gradient-to-r from-nature-green to-gold mx-auto rounded-full" />
          <p className="mt-4 text-gray-600 max-w-2xl mx-auto">
            Chaque gorgée est un concentré de bienfaits naturels pour votre corps
          </p>
        </div>

        {/* Benefits grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {BENEFITS.map((benefit, index) => {
            const Icon = benefit.icon;
            return (
              <div
                key={index}
                className="group p-6 rounded-2xl bg-white border border-gray-100 hover:border-nature-green/20 hover:shadow-lg transition-all duration-300 animate-fade-in-up"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className={`w-14 h-14 rounded-xl ${benefit.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                  <Icon className="w-7 h-7" />
                </div>
                <h3 className="font-heading text-lg font-bold text-gray-900 mb-2">
                  {benefit.titleFr}
                </h3>
                <p className="text-sm text-gray-600 leading-relaxed">
                  {benefit.descFr}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
