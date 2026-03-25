'use client';

import { useState, useEffect } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { createClient } from '@/lib/supabase/client';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import { Link } from '@/i18n/navigation';
import { formatPrice } from '@/lib/constants';
import { Plus, Edit, Trash2, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import type { Product } from '@/types/database';

export default function AdminProductsPage() {
  const t = useTranslations('adminProducts');
  const locale = useLocale();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadProducts() {
      const supabase = createClient();
      const { data } = await supabase
        .from('products')
        .select('*, formats:product_formats(*)')
        .order('sort_order');
      setProducts(data || []);
      setLoading(false);
    }
    loadProducts();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm('Supprimer ce produit ?')) return;
    const supabase = createClient();
    await supabase.from('products').update({ is_active: false }).eq('id', id);
    setProducts(products.filter(p => p.id !== id));
    toast.success('Produit supprime');
  };

  if (loading) {
    return <div className="py-16 text-center"><Loader2 className="w-8 h-8 animate-spin text-nature-green mx-auto" /></div>;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">{t('title')}</h1>
        <Link href="/admin/products/new">
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            {t('addProduct')}
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {products.map((product) => {
          const name = locale === 'fr' ? product.name_fr : product.name_en;
          return (
            <Card key={product.id} className="p-5">
              <div className="flex items-start justify-between mb-3">
                <h3 className="font-semibold text-gray-800">{name}</h3>
                <Badge variant={product.is_active ? 'green' : 'gray'}>
                  {product.is_active ? 'Actif' : 'Inactif'}
                </Badge>
              </div>

              {product.formats && (
                <div className="space-y-1 mb-4">
                  {product.formats.map((f) => (
                    <div key={f.id} className="flex justify-between text-sm">
                      <span className="text-gray-500">{f.size}</span>
                      <span className="font-medium">{formatPrice(f.price_fcfa)}</span>
                    </div>
                  ))}
                </div>
              )}

              {product.alcohol_option && (
                <Badge variant="gold" className="mb-3">Option alcool</Badge>
              )}

              <div className="flex gap-2 pt-3 border-t">
                <Link href={`/admin/products/${product.id}/edit`} className="flex-1">
                  <Button variant="outline" size="sm" className="w-full">
                    <Edit className="w-3 h-3 mr-1" />
                    {t('editProduct')}
                  </Button>
                </Link>
                <Button variant="danger" size="sm" onClick={() => handleDelete(product.id)}>
                  <Trash2 className="w-3 h-3" />
                </Button>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
