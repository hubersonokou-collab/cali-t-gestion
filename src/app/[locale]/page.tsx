import HeroBanner from '@/components/landing/HeroBanner';
import ProductShowcase from '@/components/landing/ProductShowcase';
import BenefitsSection from '@/components/landing/BenefitsSection';
import IngredientsShowcase from '@/components/landing/IngredientsShowcase';
import PriceTable from '@/components/landing/PriceTable';
import AdGallery from '@/components/landing/AdGallery';
import QuickContact from '@/components/landing/QuickContact';
import { createClient } from '@/lib/supabase/server';

export default async function HomePage() {
  const supabase = await createClient();
  const { data: products } = await supabase.from('products').select('*, formats:product_formats(*), images:product_images(*)').eq('is_active', true).order('sort_order');

  return (
    <>
      <HeroBanner />
      <ProductShowcase products={products || []} />
      <BenefitsSection />
      <IngredientsShowcase />
      <PriceTable />
      <AdGallery />
      <QuickContact />
    </>
  );
}
