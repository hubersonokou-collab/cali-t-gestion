import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

async function requireAdmin(supabase: any) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
  if (profile?.role !== 'admin') return null;
  return user;
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    const admin = await requireAdmin(supabase);

    if (!admin) {
      return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
    }

    // Get client profile
    const { data: client, error: clientError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', id)
      .eq('role', 'client')
      .single();

    if (clientError) {
      return NextResponse.json({ error: 'Client non trouvé' }, { status: 404 });
    }

    // Get client's orders
    const { data: orders, error: ordersError } = await supabase
      .from('orders')
      .select('*, order_items(*, product:products(name), format:product_formats(label))')
      .eq('client_id', id)
      .order('created_at', { ascending: false });

    if (ordersError) {
      return NextResponse.json({ error: ordersError.message }, { status: 500 });
    }

    return NextResponse.json({ ...client, orders });
  } catch {
    return NextResponse.json({ error: 'Erreur interne du serveur' }, { status: 500 });
  }
}
