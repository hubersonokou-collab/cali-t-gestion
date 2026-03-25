import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

async function requireAdmin(supabase: any) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
  if (profile?.role !== 'admin') return null;
  return user;
}

export async function GET() {
  try {
    const supabase = await createClient();
    const admin = await requireAdmin(supabase);

    if (!admin) {
      return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
    }

    const { data: products, error } = await supabase
      .from('products')
      .select('*, product_formats(*)')
      .order('created_at', { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(products);
  } catch {
    return NextResponse.json({ error: 'Erreur interne du serveur' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const admin = await requireAdmin(supabase);

    if (!admin) {
      return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
    }

    const body = await request.json();
    const { name, description, category, image_url, is_active, has_alcohol_option, formats } = body;

    if (!name || !category) {
      return NextResponse.json({ error: 'Nom et catégorie requis' }, { status: 400 });
    }

    // Insert product
    const { data: product, error: productError } = await supabase
      .from('products')
      .insert({
        name,
        description,
        category,
        image_url,
        is_active: is_active ?? true,
        has_alcohol_option: has_alcohol_option ?? false,
      })
      .select()
      .single();

    if (productError) {
      return NextResponse.json({ error: productError.message }, { status: 500 });
    }

    // Insert formats if provided
    if (formats?.length) {
      const productFormats = formats.map(
        (f: { label: string; price_fcfa: number; price_alcohol_fcfa?: number }) => ({
          product_id: product.id,
          label: f.label,
          price_fcfa: f.price_fcfa,
          price_alcohol_fcfa: f.price_alcohol_fcfa,
        })
      );

      const { error: formatsError } = await supabase
        .from('product_formats')
        .insert(productFormats);

      if (formatsError) {
        return NextResponse.json({ error: formatsError.message }, { status: 500 });
      }
    }

    // Return product with formats
    const { data: fullProduct } = await supabase
      .from('products')
      .select('*, product_formats(*)')
      .eq('id', product.id)
      .single();

    return NextResponse.json(fullProduct, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Erreur interne du serveur' }, { status: 500 });
  }
}
