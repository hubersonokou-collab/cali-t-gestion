export interface Profile {
  id: string;
  phone: string;
  full_name: string | null;
  address: string | null;
  city: string | null;
  zone: string | null;
  role: 'client' | 'admin' | 'driver';
  locale: 'fr' | 'en';
  created_at: string;
  updated_at: string;
}

export interface Product {
  id: string;
  slug: string;
  name_fr: string;
  name_en: string;
  description_fr: string | null;
  description_en: string | null;
  benefits_fr: string[];
  benefits_en: string[];
  ingredients_fr: string | null;
  ingredients_en: string | null;
  conservation_tips_fr: string | null;
  conservation_tips_en: string | null;
  consumption_tips_fr: string | null;
  consumption_tips_en: string | null;
  alcohol_option: boolean;
  is_active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
  images?: ProductImage[];
  formats?: ProductFormat[];
}

export interface ProductImage {
  id: string;
  product_id: string;
  url: string;
  alt_text: string | null;
  is_primary: boolean;
  sort_order: number;
}

export interface ProductFormat {
  id: string;
  product_id: string;
  size: '25cl' | '50cl' | '1L';
  price_fcfa: number;
}

export interface Order {
  id: string;
  order_number: string;
  client_id: string;
  status: 'commande' | 'preparation' | 'disponible' | 'livraison' | 'terminee' | 'annulee';
  payment_method: 'cash' | 'wave';
  payment_status: 'pending' | 'paid' | 'failed' | 'refunded';
  wave_transaction_id: string | null;
  delivery_address: string;
  delivery_city: string | null;
  delivery_zone: string | null;
  driver_id: string | null;
  subtotal_fcfa: number;
  delivery_fee_fcfa: number;
  total_fcfa: number;
  notes: string | null;
  created_at: string;
  updated_at: string;
  items?: OrderItem[];
  client?: Profile;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  format_id: string;
  quantity: number;
  with_alcohol: boolean;
  unit_price_fcfa: number;
  total_fcfa: number;
  product?: Product;
  format?: ProductFormat;
}

export interface ChatMessage {
  id: string;
  conversation_id: string;
  sender_id: string;
  sender_role: 'client' | 'admin';
  message: string;
  is_read: boolean;
  created_at: string;
}

export interface DeliveryZone {
  id: string;
  name: string;
  fee_fcfa: number;
  is_active: boolean;
}
