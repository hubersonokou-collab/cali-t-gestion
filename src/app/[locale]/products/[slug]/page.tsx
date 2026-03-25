'use client';

import { useTranslations, useLocale } from 'next-intl';
import { useParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { Product } from '@/types/database';
import { useCartStore } from '@/stores/cart-store';
import { formatPrice } from '@/lib/constants';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import { Link } from '@/i18n/navigation';
import { ShoppingCart, Minus, Plus, ArrowLeft, Sparkles, Leaf, Snowflake, Package, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ProductDetailPage() {
  const t = useTranslations('product');
  const tc = useTranslations('common');
  const locale = useLocale();
  const params = useParams();
  const addItem = useCartStore((s) => s.addItem);

  const [product, setProduct] = useState<Product | null>(null);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const [selectedFormat, setSelectedFormat] = useState<any>(null);
  const [quantity, setQuantity] = useState(1);
  const [withAlcohol, setWithAlcohol] = useState(false);

  useEffect(() => {
    async function fetchProduct() {
      const supabase = createClient();
      const { data } = await supabase.from('products').select('*, formats:product_formats(*), images:product_images(*)').eq('slug', params.slug).single();
      setProduct(data);
      if (data?.formats?.[0]) setSelectedFormat(data.formats[0]);
      const { data: others } = await supabase.from('products').select('*, formats:product_formats(*), images:product_images(*)').eq('is_active', true).neq('slug', params.slug);
      setAllProducts(others || []);
      setLoading(false);
    }
    fetchProduct();
  }, [params.slug]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <Loader2 className="w-8 h-8 animate-spin text-nature-green mx-auto" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold text-gray-800">Product not found</h1>
        <Link href="/">
          <Button variant="outline" className="mt-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            {tc('home')}
          </Button>
        </Link>
      </div>
    );
  }

  const name = locale === 'fr' ? product.name_fr : product.name_en;
  const description = locale === 'fr' ? product.description_fr : product.description_en;
  const benefits = locale === 'fr' ? product.benefits_fr : product.benefits_en;
  const ingredients = locale === 'fr' ? product.ingredients_fr : product.ingredients_en;
  const conservation = locale === 'fr' ? product.conservation_tips_fr : product.conservation_tips_en;
  const consumption = locale === 'fr' ? product.consumption_tips_fr : product.consumption_tips_en;

  const handleAddToCart = () => {
    if (!selectedFormat) return;
    addItem({
      productId: product.id,
      productName: name,
      productSlug: product.slug,
      formatId: selectedFormat.id,
      formatSize: selectedFormat.size,
      unitPrice: selectedFormat.price_fcfa,
      withAlcohol,
      quantity,
    });
    toast.success(t('addedToCart'));
  };

  const otherProducts = allProducts;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Back */}
      <Link href="/" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-nature-green mb-6">
        <ArrowLeft className="w-4 h-4" />
        {tc('back')}
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Image */}
        <div className="bg-gradient-to-br from-nature-green/10 to-gold/10 rounded-2xl flex items-center justify-center h-80 lg:h-[500px]">
          <div className="text-center">
            <Sparkles className="w-20 h-20 text-nature-green mx-auto mb-4" />
            <span className="font-heading text-3xl font-bold text-nature-green-dark">{name}</span>
          </div>
        </div>

        {/* Details */}
        <div>
          <h1 className="font-heading text-3xl sm:text-4xl font-bold text-nature-green-dark mb-4">
            {name}
          </h1>

          {description && <p className="text-gray-600 text-lg mb-6">{description}</p>}

          {/* Benefits */}
          {benefits && benefits.length > 0 && (
            <div className="mb-6">
              <h3 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
                <Leaf className="w-4 h-4 text-nature-green" />
                {t('benefits')}
              </h3>
              <ul className="space-y-1">
                {benefits.map((b: string, i: number) => (
                  <li key={i} className="text-sm text-gray-600 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-nature-green rounded-full" />
                    {b}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Ingredients */}
          {ingredients && (
            <div className="mb-4">
              <h3 className="font-semibold text-gray-800 mb-1">{t('ingredients')}</h3>
              <p className="text-sm text-gray-600">{ingredients}</p>
            </div>
          )}

          {/* Conservation & Consumption */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            {conservation && (
              <div className="flex items-start gap-2 text-sm text-gray-600">
                <Package className="w-4 h-4 text-blue-500 mt-0.5 shrink-0" />
                <span>{conservation}</span>
              </div>
            )}
            {consumption && (
              <div className="flex items-start gap-2 text-sm text-gray-600">
                <Snowflake className="w-4 h-4 text-cyan-500 mt-0.5 shrink-0" />
                <span>{consumption}</span>
              </div>
            )}
          </div>

          {/* Format selector */}
          <div className="mb-6">
            <h3 className="font-semibold text-gray-800 mb-3">{t('selectFormat')}</h3>
            <div className="flex gap-3">
              {product.formats?.map((format: any) => (
                <button
                  key={format.id}
                  onClick={() => setSelectedFormat(format)}
                  className={`px-5 py-3 rounded-xl border-2 text-center transition-all ${
                    selectedFormat?.id === format.id
                      ? 'border-nature-green bg-nature-green/5 text-nature-green-dark'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <span className="block font-bold text-lg">{format.size}</span>
                  <span className="block text-sm font-medium text-gold-dark">
                    {formatPrice(format.price_fcfa)}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Alcohol option */}
          {product.alcohol_option && (
            <label className="flex items-center gap-3 mb-6 cursor-pointer">
              <input
                type="checkbox"
                checked={withAlcohol}
                onChange={(e) => setWithAlcohol(e.target.checked)}
                className="w-5 h-5 rounded border-gray-300 text-nature-green focus:ring-nature-green"
              />
              <span className="text-sm font-medium text-gray-700">{t('withAlcohol')}</span>
              <Badge variant="gold">Option</Badge>
            </label>
          )}

          {/* Quantity */}
          <div className="mb-8">
            <h3 className="font-semibold text-gray-800 mb-3">{t('quantity')}</h3>
            <div className="inline-flex items-center border border-gray-200 rounded-xl">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="p-3 hover:bg-gray-50 rounded-l-xl transition-colors"
              >
                <Minus className="w-4 h-4" />
              </button>
              <span className="px-6 py-3 font-bold text-lg min-w-[60px] text-center">
                {quantity}
              </span>
              <button
                onClick={() => setQuantity(quantity + 1)}
                className="p-3 hover:bg-gray-50 rounded-r-xl transition-colors"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Total & Add to cart */}
          <div className="flex items-center gap-4">
            {selectedFormat && (
              <span className="text-2xl font-bold text-gold-dark">
                {formatPrice(selectedFormat.price_fcfa * quantity)}
              </span>
            )}
            <Button size="lg" onClick={handleAddToCart} disabled={!selectedFormat}>
              <ShoppingCart className="w-5 h-5 mr-2" />
              {tc('addToCart')}
            </Button>
          </div>
        </div>
      </div>

      {/* Similar products */}
      {otherProducts.length > 0 && (
        <div className="mt-16">
          <h2 className="font-heading text-2xl font-bold text-nature-green-dark mb-6">
            {t('similarProducts')}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {otherProducts.map((p) => {
              const pName = locale === 'fr' ? p.name_fr : p.name_en;
              const pDesc = locale === 'fr' ? p.description_fr : p.description_en;
              return (
                <Link key={p.id} href={`/products/${p.slug}`}>
                  <Card hover className="p-5">
                    <div className="h-32 bg-gradient-to-br from-nature-green/10 to-gold/10 rounded-lg flex items-center justify-center mb-4">
                      <Sparkles className="w-8 h-8 text-nature-green" />
                    </div>
                    <h3 className="font-heading font-bold text-nature-green-dark">{pName}</h3>
                    <p className="text-sm text-gray-500 line-clamp-2 mt-1">{pDesc}</p>
                  </Card>
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
