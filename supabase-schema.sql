-- =============================================
-- Cali-T E-commerce Database Schema
-- Run this in your Supabase SQL Editor
-- =============================================

-- PROFILES: extends Supabase auth.users
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  phone TEXT UNIQUE NOT NULL,
  full_name TEXT,
  address TEXT,
  city TEXT,
  zone TEXT,
  role TEXT NOT NULL DEFAULT 'client' CHECK (role IN ('client', 'admin', 'driver')),
  locale TEXT DEFAULT 'fr' CHECK (locale IN ('fr', 'en')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- PRODUCTS
CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  name_fr TEXT NOT NULL,
  name_en TEXT NOT NULL,
  description_fr TEXT,
  description_en TEXT,
  benefits_fr TEXT[] DEFAULT '{}',
  benefits_en TEXT[] DEFAULT '{}',
  ingredients_fr TEXT,
  ingredients_en TEXT,
  conservation_tips_fr TEXT,
  conservation_tips_en TEXT,
  consumption_tips_fr TEXT,
  consumption_tips_en TEXT,
  alcohol_option BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- PRODUCT_IMAGES
CREATE TABLE IF NOT EXISTS product_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  alt_text TEXT,
  is_primary BOOLEAN DEFAULT FALSE,
  sort_order INT DEFAULT 0
);

-- PRODUCT_FORMATS (price tiers)
CREATE TABLE IF NOT EXISTS product_formats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  size TEXT NOT NULL,
  price_fcfa INT NOT NULL,
  UNIQUE(product_id, size)
);

-- ORDERS
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number TEXT UNIQUE NOT NULL,
  client_id UUID NOT NULL REFERENCES profiles(id),
  status TEXT NOT NULL DEFAULT 'commande'
    CHECK (status IN ('commande', 'preparation', 'disponible', 'livraison', 'terminee', 'annulee')),
  payment_method TEXT NOT NULL CHECK (payment_method IN ('cash', 'wave')),
  payment_status TEXT NOT NULL DEFAULT 'pending'
    CHECK (payment_status IN ('pending', 'paid', 'failed', 'refunded')),
  wave_transaction_id TEXT,
  delivery_address TEXT NOT NULL,
  delivery_city TEXT,
  delivery_zone TEXT,
  driver_id UUID REFERENCES profiles(id),
  subtotal_fcfa INT NOT NULL,
  delivery_fee_fcfa INT DEFAULT 0,
  total_fcfa INT NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ORDER_ITEMS
CREATE TABLE IF NOT EXISTS order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id),
  format_id UUID NOT NULL REFERENCES product_formats(id),
  quantity INT NOT NULL CHECK (quantity > 0),
  with_alcohol BOOLEAN DEFAULT FALSE,
  unit_price_fcfa INT NOT NULL,
  total_fcfa INT NOT NULL
);

-- CHAT_MESSAGES
CREATE TABLE IF NOT EXISTS chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL,
  sender_id UUID NOT NULL REFERENCES profiles(id),
  sender_role TEXT NOT NULL CHECK (sender_role IN ('client', 'admin')),
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- DELIVERY_ZONES
CREATE TABLE IF NOT EXISTS delivery_zones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  fee_fcfa INT NOT NULL DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE
);

-- INDEXES
CREATE INDEX IF NOT EXISTS idx_orders_client ON orders(client_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_driver ON orders(driver_id);
CREATE INDEX IF NOT EXISTS idx_order_items_order ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_chat_conversation ON chat_messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_products_active ON products(is_active, sort_order);

-- ROW LEVEL SECURITY
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_formats ENABLE ROW LEVEL SECURITY;
ALTER TABLE delivery_zones ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Products (public read)
CREATE POLICY "Public product read" ON products FOR SELECT USING (is_active = TRUE);
CREATE POLICY "Public product_images read" ON product_images FOR SELECT USING (TRUE);
CREATE POLICY "Public product_formats read" ON product_formats FOR SELECT USING (TRUE);
CREATE POLICY "Public delivery_zones read" ON delivery_zones FOR SELECT USING (is_active = TRUE);

-- RLS: Profiles
CREATE POLICY "Users view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Admins view all profiles" ON profiles FOR SELECT USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- RLS: Orders
CREATE POLICY "Clients view own orders" ON orders FOR SELECT USING (auth.uid() = client_id);
CREATE POLICY "Clients create orders" ON orders FOR INSERT WITH CHECK (auth.uid() = client_id);
CREATE POLICY "Admins view all orders" ON orders FOR SELECT USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "Admins update orders" ON orders FOR UPDATE USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- RLS: Order Items
CREATE POLICY "Clients view own order items" ON order_items FOR SELECT USING (
  EXISTS (SELECT 1 FROM orders WHERE orders.id = order_items.order_id AND orders.client_id = auth.uid())
);
CREATE POLICY "Clients create order items" ON order_items FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM orders WHERE orders.id = order_items.order_id AND orders.client_id = auth.uid())
);
CREATE POLICY "Admins view all order items" ON order_items FOR SELECT USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- RLS: Chat
CREATE POLICY "Users view own chat" ON chat_messages FOR SELECT USING (auth.uid() = sender_id);
CREATE POLICY "Users send chat" ON chat_messages FOR INSERT WITH CHECK (auth.uid() = sender_id);
CREATE POLICY "Admins view all chat" ON chat_messages FOR SELECT USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "Admins send chat" ON chat_messages FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Admins manage products
CREATE POLICY "Admins manage products" ON products FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "Admins manage product_images" ON product_images FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "Admins manage product_formats" ON product_formats FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "Admins manage delivery_zones" ON delivery_zones FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, phone, role)
  VALUES (NEW.id, NEW.phone, 'client');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- SEED DATA: Insert default Cali-T products
INSERT INTO products (slug, name_fr, name_en, description_fr, description_en, benefits_fr, benefits_en, ingredients_fr, ingredients_en, conservation_tips_fr, conservation_tips_en, consumption_tips_fr, consumption_tips_en, alcohol_option, sort_order) VALUES
('cali-t-original', 'Cali-T Original', 'Cali-T Original',
 'Jus energisant 100% naturel a base de gingembre, bissap et petit cola. Booste votre systeme immunitaire et lutte contre la fatigue.',
 '100% natural energy juice made with ginger, hibiscus and petit cola. Boosts your immune system and fights fatigue.',
 ARRAY['Booste le systeme immunitaire', 'Lutte contre la fatigue', 'Ameliore l''endurance', 'Source d''energie naturelle'],
 ARRAY['Boosts immune system', 'Fights fatigue', 'Improves endurance', 'Natural energy source'],
 'Gingembre, Bissap, Petit colas, Sucre complet, Cocktail de fruits',
 'Ginger, Hibiscus, Petit cola, Whole sugar, Fruit cocktail',
 'Conserver 5 jours au froid apres ouverture. Duree 1 mois.',
 'Keep refrigerated for 5 days after opening. Shelf life 1 month.',
 'Servir glace pour une experience optimale',
 'Serve chilled for optimal experience',
 TRUE, 1),
('cali-t-boost', 'Cali-T Boost', 'Cali-T Boost',
 'Formule concentree pour un maximum d''energie. Melange puissant de gingembre extra et d''epices naturelles.',
 'Concentrated formula for maximum energy. Powerful blend of extra ginger and natural spices.',
 ARRAY['Energie maximale', 'Anti-inflammatoire', 'Digestion amelioree'],
 ARRAY['Maximum energy', 'Anti-inflammatory', 'Improved digestion'],
 'Gingembre extra, Curcuma, Citron, Miel naturel',
 'Extra ginger, Turmeric, Lemon, Natural honey',
 'Conserver au frais. Duree 3 semaines.',
 'Keep cool. Shelf life 3 weeks.',
 'Consommer le matin a jeun pour de meilleurs resultats',
 'Consume in the morning on an empty stomach for best results',
 FALSE, 2),
('cali-t-detox', 'Cali-T Detox', 'Cali-T Detox',
 'Jus detoxifiant a base de fruits frais et d''herbes locales. Purifie votre organisme naturellement.',
 'Detoxifying juice made with fresh fruits and local herbs. Naturally purifies your body.',
 ARRAY['Detoxification naturelle', 'Peau eclatante', 'Vitalite retrouvee'],
 ARRAY['Natural detoxification', 'Glowing skin', 'Renewed vitality'],
 'Ananas, Concombre, Menthe, Citron vert, Gingembre',
 'Pineapple, Cucumber, Mint, Lime, Ginger',
 'Conserver au refrigerateur. Consommer sous 5 jours.',
 'Keep refrigerated. Consume within 5 days.',
 'Servir tres frais, ideal le matin',
 'Serve very cold, ideal in the morning',
 TRUE, 3)
ON CONFLICT (slug) DO NOTHING;

-- Insert formats for each product
INSERT INTO product_formats (product_id, size, price_fcfa)
SELECT p.id, s.size, s.price
FROM products p
CROSS JOIN (VALUES ('25cl', 500), ('50cl', 1000), ('1L', 2000)) AS s(size, price)
ON CONFLICT (product_id, size) DO NOTHING;

-- Insert default delivery zones for Abidjan
INSERT INTO delivery_zones (name, fee_fcfa, is_active) VALUES
('Cocody', 500, TRUE),
('Plateau', 500, TRUE),
('Marcory', 500, TRUE),
('Treichville', 500, TRUE),
('Yopougon', 1000, TRUE),
('Abobo', 1000, TRUE),
('Adjame', 750, TRUE),
('Port-Bouet', 1000, TRUE);
