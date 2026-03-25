import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    const body = await request.json();
    const {
      delivery_address,
      delivery_city,
      delivery_zone,
      payment_method,
      notes,
      items,
    } = body;

    if (!delivery_address || !delivery_city || !delivery_zone || !payment_method || !items?.length) {
      return NextResponse.json({ error: 'Champs requis manquants' }, { status: 400 });
    }

    // Generate order number: CAL-YYYYMMDD-XXX
    const now = new Date();
    const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '');
    const random3 = String(Math.floor(Math.random() * 1000)).padStart(3, '0');
    const order_number = `CAL-${dateStr}-${random3}`;

    // Calculate subtotal from items
    const subtotal_fcfa = items.reduce(
      (sum: number, item: { quantity: number; unit_price_fcfa: number }) =>
        sum + item.quantity * item.unit_price_fcfa,
      0
    );

    // Get delivery fee from delivery_zones table
    const { data: zone, error: zoneError } = await supabase
      .from('delivery_zones')
      .select('id, fee_fcfa')
      .eq('name', delivery_zone)
      .eq('is_active', true)
      .single();

    if (zoneError || !zone) {
      return NextResponse.json({ error: 'Zone de livraison invalide' }, { status: 400 });
    }

    const delivery_fee_fcfa = zone.fee_fcfa;
    const total_fcfa = subtotal_fcfa + delivery_fee_fcfa;

    // Insert order
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        order_number,
        client_id: user.id,
        status: 'pending',
        delivery_address,
        delivery_city,
        delivery_zone,
        delivery_fee_fcfa,
        subtotal_fcfa,
        total_fcfa,
        payment_method,
        payment_status: 'unpaid',
        notes,
      })
      .select()
      .single();

    if (orderError) {
      return NextResponse.json({ error: orderError.message }, { status: 500 });
    }

    // Insert order items
    const orderItems = items.map(
      (item: {
        product_id: string;
        format_id: string;
        quantity: number;
        with_alcohol: boolean;
        unit_price_fcfa: number;
      }) => ({
        order_id: order.id,
        product_id: item.product_id,
        format_id: item.format_id,
        quantity: item.quantity,
        with_alcohol: item.with_alcohol ?? false,
        unit_price_fcfa: item.unit_price_fcfa,
        total_price_fcfa: item.quantity * item.unit_price_fcfa,
      })
    );

    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(orderItems);

    if (itemsError) {
      return NextResponse.json({ error: itemsError.message }, { status: 500 });
    }

    return NextResponse.json(order, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Erreur interne du serveur' }, { status: 500 });
  }
}

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    const { data: orders, error } = await supabase
      .from('orders')
      .select('*, order_items(*, product:products(name), format:product_formats(label))')
      .eq('client_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(orders);
  } catch {
    return NextResponse.json({ error: 'Erreur interne du serveur' }, { status: 500 });
  }
}
