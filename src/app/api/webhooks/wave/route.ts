import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Extract Wave payment data
    const {
      transaction_id,
      order_id,
      order_number,
      status,
      amount,
    } = body;

    if (!transaction_id || !status) {
      return NextResponse.json({ error: 'Données manquantes' }, { status: 400 });
    }

    // Only process successful payments
    if (status !== 'succeeded' && status !== 'completed') {
      return NextResponse.json({ status: 'ignored', reason: 'Payment not successful' });
    }

    // Use admin client since webhooks have no user session
    const supabase = createAdminClient();

    // Look up order by wave_transaction_id or order_number
    let query = supabase.from('orders').select('id, payment_status, total_fcfa');

    if (order_id) {
      query = query.eq('id', order_id);
    } else if (order_number) {
      query = query.eq('order_number', order_number);
    } else {
      // Try to find by wave_transaction_id
      query = query.eq('wave_transaction_id', transaction_id);
    }

    const { data: order, error: orderError } = await query.single();

    if (orderError || !order) {
      // Try matching by wave_transaction_id as fallback
      const { data: fallbackOrder, error: fallbackError } = await supabase
        .from('orders')
        .select('id, payment_status, total_fcfa')
        .eq('wave_transaction_id', transaction_id)
        .single();

      if (fallbackError || !fallbackOrder) {
        console.error('Wave webhook: order not found', { transaction_id, order_id, order_number });
        return NextResponse.json({ error: 'Commande non trouvée' }, { status: 404 });
      }

      // Update payment status
      const { error: updateError } = await supabase
        .from('orders')
        .update({
          payment_status: 'paid',
          wave_transaction_id: transaction_id,
          updated_at: new Date().toISOString(),
        })
        .eq('id', fallbackOrder.id);

      if (updateError) {
        console.error('Wave webhook: update failed', updateError);
        return NextResponse.json({ error: 'Mise à jour échouée' }, { status: 500 });
      }

      return NextResponse.json({ status: 'ok', order_id: fallbackOrder.id });
    }

    // Update payment status on the found order
    const { error: updateError } = await supabase
      .from('orders')
      .update({
        payment_status: 'paid',
        wave_transaction_id: transaction_id,
        updated_at: new Date().toISOString(),
      })
      .eq('id', order.id);

    if (updateError) {
      console.error('Wave webhook: update failed', updateError);
      return NextResponse.json({ error: 'Mise à jour échouée' }, { status: 500 });
    }

    return NextResponse.json({ status: 'ok', order_id: order.id });
  } catch (err) {
    console.error('Wave webhook error:', err);
    return NextResponse.json({ error: 'Requête invalide' }, { status: 400 });
  }
}
