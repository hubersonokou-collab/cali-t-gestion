'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from '@/i18n/navigation';
import { createClient } from '@/lib/supabase/client';
import Card from '@/components/ui/Card';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import { ArrowLeft, Save, Upload } from 'lucide-react';
import { Link } from '@/i18n/navigation';
import toast from 'react-hot-toast';

export default function NewProductPage() {
  const t = useTranslations('adminProducts');
  const tc = useTranslations('common');
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    name_fr: '', name_en: '',
    description_fr: '', description_en: '',
    ingredients_fr: '', ingredients_en: '',
    conservation_fr: '', conservation_en: '',
    consumption_fr: '', consumption_en: '',
    alcohol_option: false,
    price_25cl: '500', price_50cl: '1000', price_1l: '2000',
  });

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name_fr.trim()) { toast.error('Nom requis'); return; }
    setLoading(true);
    try {
      const supabase = createClient();
      const slug = form.name_fr.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');

      const { data: product, error } = await supabase.from('products').insert({
        slug,
        name_fr: form.name_fr,
        name_en: form.name_en || form.name_fr,
        description_fr: form.description_fr || null,
        description_en: form.description_en || null,
        ingredients_fr: form.ingredients_fr || null,
        ingredients_en: form.ingredients_en || null,
        conservation_tips_fr: form.conservation_fr || null,
        conservation_tips_en: form.conservation_en || null,
        consumption_tips_fr: form.consumption_fr || null,
        consumption_tips_en: form.consumption_en || null,
        alcohol_option: form.alcohol_option,
      }).select().single();

      if (error) throw error;

      const formats = [
        { product_id: product.id, size: '25cl', price_fcfa: parseInt(form.price_25cl) || 500 },
        { product_id: product.id, size: '50cl', price_fcfa: parseInt(form.price_50cl) || 1000 },
        { product_id: product.id, size: '1L', price_fcfa: parseInt(form.price_1l) || 2000 },
      ];
      await supabase.from('product_formats').insert(formats);

      toast.success(t('saved'));
      router.push('/admin/products');
    } catch {
      toast.error('Erreur lors de la creation');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Link href="/admin/products" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-nature-green mb-6">
        <ArrowLeft className="w-4 h-4" />
        {tc('back')}
      </Link>

      <h1 className="text-2xl font-bold text-gray-800 mb-6">{t('addProduct')}</h1>

      <form onSubmit={handleSave} className="space-y-6">
        <Card className="p-6">
          <h2 className="font-semibold mb-4">{t('productName')}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input label={t('nameFr')} value={form.name_fr} onChange={(e) => setForm({ ...form, name_fr: e.target.value })} required />
            <Input label={t('nameEn')} value={form.name_en} onChange={(e) => setForm({ ...form, name_en: e.target.value })} required />
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="font-semibold mb-4">Description</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('descFr')}</label>
              <textarea className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-nature-green focus:border-transparent" rows={3} value={form.description_fr} onChange={(e) => setForm({ ...form, description_fr: e.target.value })} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('descEn')}</label>
              <textarea className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-nature-green focus:border-transparent" rows={3} value={form.description_en} onChange={(e) => setForm({ ...form, description_en: e.target.value })} />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="font-semibold mb-4">{t('ingredientsFr').replace(' (Francais)', '')}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input label={t('ingredientsFr')} value={form.ingredients_fr} onChange={(e) => setForm({ ...form, ingredients_fr: e.target.value })} />
            <Input label={t('ingredientsEn')} value={form.ingredients_en} onChange={(e) => setForm({ ...form, ingredients_en: e.target.value })} />
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="font-semibold mb-4">Conseils</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input label={t('conservationFr')} value={form.conservation_fr} onChange={(e) => setForm({ ...form, conservation_fr: e.target.value })} />
            <Input label={t('conservationEn')} value={form.conservation_en} onChange={(e) => setForm({ ...form, conservation_en: e.target.value })} />
            <Input label={t('consumptionFr')} value={form.consumption_fr} onChange={(e) => setForm({ ...form, consumption_fr: e.target.value })} />
            <Input label={t('consumptionEn')} value={form.consumption_en} onChange={(e) => setForm({ ...form, consumption_en: e.target.value })} />
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="font-semibold mb-4">{t('formats')}</h2>
          <div className="grid grid-cols-3 gap-4">
            <Input label="Prix 25cl (FCFA)" type="number" value={form.price_25cl} onChange={(e) => setForm({ ...form, price_25cl: e.target.value })} />
            <Input label="Prix 50cl (FCFA)" type="number" value={form.price_50cl} onChange={(e) => setForm({ ...form, price_50cl: e.target.value })} />
            <Input label="Prix 1L (FCFA)" type="number" value={form.price_1l} onChange={(e) => setForm({ ...form, price_1l: e.target.value })} />
          </div>

          <label className="flex items-center gap-3 mt-4 cursor-pointer">
            <input type="checkbox" checked={form.alcohol_option} onChange={(e) => setForm({ ...form, alcohol_option: e.target.checked })} className="w-5 h-5 rounded border-gray-300 text-nature-green focus:ring-nature-green" />
            <span className="text-sm font-medium">{t('alcoholOption')}</span>
          </label>
        </Card>

        <Card className="p-6">
          <h2 className="font-semibold mb-4">{t('images')}</h2>
          <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-nature-green transition-colors cursor-pointer">
            <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
            <p className="text-sm text-gray-500">{t('uploadImage')}</p>
          </div>
        </Card>

        <div className="flex gap-3">
          <Button type="submit" size="lg" disabled={loading}>
            <Save className="w-4 h-4 mr-2" />
            {loading ? '...' : tc('save')}
          </Button>
          <Link href="/admin/products">
            <Button type="button" variant="outline" size="lg">{tc('cancel')}</Button>
          </Link>
        </div>
      </form>
    </div>
  );
}
