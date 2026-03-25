'use client';

import { useTranslations, useLocale } from 'next-intl';
import { Link } from '@/i18n/navigation';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import { formatPrice } from '@/lib/constants';
import type { Product } from '@/types/database';
import { ShoppingCart, Sparkles, Star } from 'lucide-react';

const PRODUCT_IMAGES: Record<string, string> = {
  'cali-t-original': '/images/photo-outdoor-original.jpeg',
  'cali-t-boost': '/images/photo-tropical-mix.jpeg',
  'cali-t-detox': '/images/photo-tropical-closeup.jpeg',
};

const FALLBACK_IMAGES = [
  '/images/hero-products.jpeg',
  '/images/ad-bissap.jpeg',
  '/images/ad-cocktail-fruits.jpeg',
];

interface ProductShowcaseProps {
  products: Product[];
}

export default function ProductShowcase({ products }: ProductShowcaseProps) {
  const t = useTranslations('landing');
  const tc = useTranslations('common');
  const locale = useLocale();

  return (
    <section id="products" className="py-16 sm:py-24 bg-gradient-to-b from-off-white to-warm-gray">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div className="text-center mb-14">
          <div className="inline-flex items-center gap-2 bg-nature-green/5 rounded-full px-4 py-1.5 mb-4">
            <Star className="w-4 h-4 text-gold" />
            <span className="text-sm font-medium text-nature-green-dark">Jus 100% Bio</span>
          </div>
          <h2 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-bold text-nature-green-dark mb-4">
            {t('ourJuices')}
          </h2>
          <div className="w-20 h-1 bg-gradient-to-r from-gold to-gold-light mx-auto rounded-full" />
          <p className="mt-4 text-gray-600 max-w-2xl mx-auto">
            Des jus naturels et énergisants, fabriqués avec des ingrédients locaux et bio
          </p>
        </div>

        {/* Product grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {products.map((product, index) => {
            const name = locale === 'fr' ? product.name_fr : product.name_en;
            const description = locale === 'fr' ? product.description_fr : product.description_en;
            const ingredients = locale === 'fr' ? product.ingredients_fr : product.ingredients_en;
            const primaryImage = product.images?.find((img) => img.is_primary) || product.images?.[0];
            const fallbackImage = PRODUCT_IMAGES[product.slug] || FALLBACK_IMAGES[index % FALLBACK_IMAGES.length];
            const imageUrl = primaryImage?.url || fallbackImage;
            const minPrice = product.formats?.reduce(
              (min, f) => (f.price_fcfa < min ? f.price_fcfa : min),
              Infinity
            );

            return (
              <div
                key={product.id}
                className="group animate-fade-in-up"
                style={{ animationDelay: `${index * 150}ms` }}
              >
                <Card hover className="overflow-hidden h-full flex flex-col">
                  {/* Image */}
                  <div className="relative h-56 overflow-hidden">
                    <img
                      src={imageUrl}
                      alt={name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 ease-out"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                    {product.alcohol_option && (
                      <Badge variant="gold" className="absolute top-3 right-3 shadow-md">
                        {t('alcoholOption')}
                      </Badge>
                    )}

                    {/* Quick view overlay */}
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
                      <Link href={`/products/${product.slug}`}>
                        <span className="bg-white/90 backdrop-blur-sm text-nature-green-dark font-medium px-5 py-2.5 rounded-full shadow-lg hover:bg-white transition-colors text-sm">
                          Voir le produit
                        </span>
                      </Link>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-5 flex flex-col flex-1">
                    <h3 className="font-heading text-xl font-bold text-nature-green-dark mb-2 group-hover:text-nature-green transition-colors">
                      {name}
                    </h3>

                    {description && (
                      <p className="text-sm text-gray-600 mb-3 line-clamp-2">{description}</p>
                    )}

                    {ingredients && (
                      <p className="text-xs text-gray-500 mb-3">
                        <span className="font-semibold text-nature-green-dark">{t('ingredients')}:</span> {ingredients}
                      </p>
                    )}

                    {/* Formats */}
                    {product.formats && product.formats.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-4">
                        {product.formats.map((format) => (
                          <span
                            key={format.id}
                            className="inline-flex items-center px-3 py-1.5 bg-nature-green/5 border border-nature-green/10 rounded-full text-xs font-medium text-nature-green-dark hover:bg-nature-green/10 transition-colors"
                          >
                            {format.size} — {formatPrice(format.price_fcfa)}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Price & CTA */}
                    <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-100">
                      {minPrice && minPrice !== Infinity && (
                        <div>
                          <span className="text-xs text-gray-500">À partir de</span>
                          <span className="block text-xl font-bold text-gold-dark">
                            {formatPrice(minPrice)}
                          </span>
                        </div>
                      )}
                      <Link href={`/products/${product.slug}`}>
                        <Button size="sm" className="group/btn">
                          <ShoppingCart className="w-4 h-4 mr-1.5 group-hover/btn:animate-bounce-subtle" />
                          {tc('orderNow')}
                        </Button>
                      </Link>
                    </div>
                  </div>
                </Card>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
