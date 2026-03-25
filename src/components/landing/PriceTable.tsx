'use client';

import { useTranslations } from 'next-intl';
import { formatPrice } from '@/lib/constants';
import { Check } from 'lucide-react';
import { Link } from '@/i18n/navigation';
import Button from '@/components/ui/Button';

const FORMATS = [
  {
    name: 'Mini Format',
    size: '25 cl',
    price: 500,
    image: '/images/product-25cl.jpeg',
    features: ['Idéal pour une dose d\'énergie rapide', 'Parfait à emporter', 'Format découverte'],
    popular: false,
  },
  {
    name: 'Format Standard',
    size: '50 cl',
    price: 1000,
    image: '/images/product-50cl.jpeg',
    features: ['Le format le plus populaire', 'Parfait pour la journée', 'Meilleur rapport qualité-prix'],
    popular: true,
  },
  {
    name: 'Nature Délice',
    size: '1 L',
    price: 2000,
    image: '/images/product-1l.jpeg',
    features: ['Format familial', 'Idéal pour partager', 'Économique'],
    popular: false,
  },
];

export default function PriceTable() {
  const t = useTranslations('landing');
  const tc = useTranslations('common');

  return (
    <section className="py-16 sm:py-24 bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <h2 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-bold text-nature-green-dark mb-4">
            {t('priceTable')}
          </h2>
          <div className="w-20 h-1 bg-gradient-to-r from-gold to-gold-light mx-auto rounded-full" />
          <p className="mt-4 text-gray-600">
            Choisissez le format qui vous convient
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          {FORMATS.map((format, index) => (
            <div
              key={index}
              className={`relative rounded-2xl overflow-hidden animate-fade-in-up ${
                format.popular
                  ? 'bg-nature-green-dark text-white ring-2 ring-gold shadow-xl scale-[1.02]'
                  : 'bg-white border border-gray-200 hover:border-nature-green/30 hover:shadow-lg'
              } transition-all duration-300`}
              style={{ animationDelay: `${index * 150}ms` }}
            >
              {format.popular && (
                <div className="absolute top-0 right-0 bg-gold text-white text-xs font-bold px-4 py-1 rounded-bl-xl">
                  Populaire
                </div>
              )}

              {/* Image */}
              <div className="h-48 overflow-hidden">
                <img
                  src={format.image}
                  alt={format.name}
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                />
              </div>

              <div className="p-6">
                <h3 className={`font-heading text-xl font-bold mb-1 ${format.popular ? 'text-white' : 'text-nature-green-dark'}`}>
                  {format.name}
                </h3>
                <p className={`text-sm mb-4 ${format.popular ? 'text-white/70' : 'text-gray-500'}`}>
                  {format.size}
                </p>

                {/* Price */}
                <div className="mb-6">
                  <span className={`text-3xl font-bold ${format.popular ? 'text-gold-light' : 'text-gold-dark'}`}>
                    {formatPrice(format.price)}
                  </span>
                </div>

                {/* Features */}
                <ul className="space-y-3 mb-6">
                  {format.features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <Check className={`w-4 h-4 mt-0.5 shrink-0 ${format.popular ? 'text-gold-light' : 'text-nature-green'}`} />
                      <span className={`text-sm ${format.popular ? 'text-white/80' : 'text-gray-600'}`}>
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>

                <Link href="/#products" className="block">
                  <Button
                    size="lg"
                    variant={format.popular ? 'secondary' : 'primary'}
                    className="w-full justify-center"
                  >
                    {tc('orderNow')}
                  </Button>
                </Link>
              </div>
            </div>
          ))}
        </div>

        <p className="text-center text-sm text-gray-500 mt-8">
          {t('alcoholOption')} — Option avec alcool disponible sur demande
        </p>
      </div>
    </section>
  );
}
