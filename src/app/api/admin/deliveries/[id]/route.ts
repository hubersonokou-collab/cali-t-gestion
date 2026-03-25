import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

async function requireAdmin(supabase: any) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
  if (profile?.role !== 'admin') return null;
  return user;
}

export async function DELETE(
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

    // Soft delete: deactivate the zone
    const { data: zone, error } = await supabase
      .from('delivery_zones')
      .update({ is_active: false })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(zone);
  } catch {
    return NextResponse.json({ error: 'Erreur interne du serveur' }, { status: 500 });
  }
}

export async function PATCH(
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

    // Get current zone to toggle
    const { data: current, error: fetchError } = await supabase
      .from('delivery_zones')
      .select('is_active')
      .eq('id', id)
      .single();

    if (fetchError || !current) {
      return NextResponse.json({ error: 'Zone non trouvée' }, { status: 404 });
    }

    const { data: zone, error } = await supabase
      .from('delivery_zones')
      .update({ is_active: !current.is_active })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(zone);
  } catch {
    return NextResponse.json({ error: 'Erreur interne du serveur' }, { status: 500 });
  }
}
