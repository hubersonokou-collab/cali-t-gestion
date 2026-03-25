import { createClient } from './server';
import type { Product, Order, Profile, DeliveryZone } from '@/types/database';

// ============================================================
// PRODUCTS
// ============================================================

export async function getProducts(): Promise<Product[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('products')
    .select('*, formats:product_formats(*), images:product_images(*)')
    .eq('is_active', true)
    .order('sort_order', { ascending: true });

  if (error) {
    console.error('getProducts error:', error.message);
    return [];
  }
  return data as Product[];
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('products')
    .select('*, formats:product_formats(*), images:product_images(*)')
    .eq('slug', slug)
    .single();

  if (error) {
    console.error('getProductBySlug error:', error.message);
    return null;
  }
  return data as Product;
}

export async function getAllProducts(): Promise<Product[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('products')
    .select('*, formats:product_formats(*), images:product_images(*)')
    .order('sort_order', { ascending: true });

  if (error) {
    console.error('getAllProducts error:', error.message);
    return [];
  }
  return data as Product[];
}

// ============================================================
// ORDERS
// ============================================================

export async function getOrdersByClient(clientId: string): Promise<Order[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('orders')
    .select('*, items:order_items(*, product:products(*), format:product_formats(*))')
    .eq('client_id', clientId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('getOrdersByClient error:', error.message);
    return [];
  }
  return data as Order[];
}

export async function getOrderById(orderId: string): Promise<Order | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('orders')
    .select(
      '*, items:order_items(*, product:products(*), format:product_formats(*)), client:profiles(*)'
    )
    .eq('id', orderId)
    .single();

  if (error) {
    console.error('getOrderById error:', error.message);
    return null;
  }
  return data as Order;
}

export async function getAllOrders(status?: string): Promise<Order[]> {
  const supabase = await createClient();
  let query = supabase
    .from('orders')
    .select('*, client:profiles(*)')
    .order('created_at', { ascending: false });

  if (status) {
    query = query.eq('status', status);
  }

  const { data, error } = await query;

  if (error) {
    console.error('getAllOrders error:', error.message);
    return [];
  }
  return data as Order[];
}

// ============================================================
// PROFILES
// ============================================================

export async function getProfile(userId: string): Promise<Profile | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) {
    console.error('getProfile error:', error.message);
    return null;
  }
  return data as Profile;
}

export async function getAllClients(): Promise<Profile[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('role', 'client')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('getAllClients error:', error.message);
    return [];
  }
  return data as Profile[];
}

export async function getClientWithOrders(
  clientId: string
): Promise<{ profile: Profile; orders: Order[] } | null> {
  const supabase = await createClient();

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', clientId)
    .single();

  if (profileError) {
    console.error('getClientWithOrders profile error:', profileError.message);
    return null;
  }

  const { data: orders, error: ordersError } = await supabase
    .from('orders')
    .select('*, items:order_items(*, product:products(*), format:product_formats(*))')
    .eq('client_id', clientId)
    .order('created_at', { ascending: false });

  if (ordersError) {
    console.error('getClientWithOrders orders error:', ordersError.message);
    return null;
  }

  return {
    profile: profile as Profile,
    orders: (orders ?? []) as Order[],
  };
}

// ============================================================
// DELIVERY ZONES
// ============================================================

export async function getDeliveryZones(): Promise<DeliveryZone[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('delivery_zones')
    .select('*')
    .eq('is_active', true)
    .order('name', { ascending: true });

  if (error) {
    console.error('getDeliveryZones error:', error.message);
    return [];
  }
  return data as DeliveryZone[];
}

export async function getAllDeliveryZones(): Promise<DeliveryZone[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('delivery_zones')
    .select('*')
    .order('name', { ascending: true });

  if (error) {
    console.error('getAllDeliveryZones error:', error.message);
    return [];
  }
  return data as DeliveryZone[];
}

// ============================================================
// ADMIN STATS
// ============================================================

export async function getAdminStats(): Promise<{
  todayOrderCount: number;
  weekRevenue: number;
  pendingOrdersCount: number;
  activeDeliveriesCount: number;
}> {
  const supabase = await createClient();

  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();

  const dayOfWeek = now.getDay();
  const mondayOffset = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
  const weekStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() - mondayOffset);
  const weekStartISO = weekStart.toISOString();

  const [todayOrders, weekOrders, pendingOrders, activeDeliveries] = await Promise.all([
    supabase
      .from('orders')
      .select('id', { count: 'exact', head: true })
      .gte('created_at', todayStart),
    supabase
      .from('orders')
      .select('total_fcfa')
      .gte('created_at', weekStartISO)
      .eq('payment_status', 'paid'),
    supabase
      .from('orders')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'commande'),
    supabase
      .from('orders')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'livraison'),
  ]);

  const weekRevenue =
    weekOrders.data?.reduce((sum, order) => sum + (order.total_fcfa ?? 0), 0) ?? 0;

  return {
    todayOrderCount: todayOrders.count ?? 0,
    weekRevenue,
    pendingOrdersCount: pendingOrders.count ?? 0,
    activeDeliveriesCount: activeDeliveries.count ?? 0,
  };
}
