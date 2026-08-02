/*
# RAHIQ Parfums — Admin CMS Schema

This migration creates all tables needed for the Admin Dashboard CMS.

## Tables Created

### Content Tables
- `perfumes` — Perfume catalogue with bilingual name/description, image, ratings, visibility, display order
- `perfume_gallery` — Unlimited gallery images per perfume
- `perfume_versions` — Admin-managed version labels per perfume (Original, Ordinaire, etc.)
- `offers` — Offer packages with bilingual content, pricing, flags, display order
- `offer_gallery` — Unlimited gallery images per offer
- `offer_perfumes` — Junction table linking offers to perfumes
- `discounts` — Discount layer on top of offers (no data duplication)

### Lookup Tables
- `wilayas` — 58 official Algerian wilayas with delivery pricing
- `municipalities` — All communes linked to wilayas, with enable/disable flag

### Singleton Settings Tables (always one row, upserted by id = 1)
- `contact_settings` — Social links, email, phone, business hours
- `footer_settings` — Footer content, copyright, social icon config
- `brand_settings` — Logo URLs, brand names, default language, hero description
- `email_settings` — SMTP configuration for order emails

### Media
- `media_library` — Centralised image asset registry

## Security
- RLS enabled on all tables
- anon + authenticated roles get full CRUD (no auth in this phase, admin-only app)
*/

-- ─── Perfumes ────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS perfumes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE NOT NULL,
  name_ar text NOT NULL DEFAULT '',
  name_en text NOT NULL DEFAULT '',
  desc_ar text NOT NULL DEFAULT '',
  desc_en text NOT NULL DEFAULT '',
  main_image text NOT NULL DEFAULT '',
  rating_spring integer NOT NULL DEFAULT 50,
  rating_summer integer NOT NULL DEFAULT 50,
  rating_autumn integer NOT NULL DEFAULT 50,
  rating_winter integer NOT NULL DEFAULT 50,
  rating_day integer NOT NULL DEFAULT 50,
  rating_night integer NOT NULL DEFAULT 50,
  rating_loved integer NOT NULL DEFAULT 50,
  rating_good integer NOT NULL DEFAULT 50,
  rating_not_recommended integer NOT NULL DEFAULT 0,
  community_score integer NOT NULL DEFAULT 50,
  is_visible boolean NOT NULL DEFAULT true,
  display_order integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE perfumes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_perfumes" ON perfumes;
CREATE POLICY "anon_select_perfumes" ON perfumes FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_perfumes" ON perfumes;
CREATE POLICY "anon_insert_perfumes" ON perfumes FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_perfumes" ON perfumes;
CREATE POLICY "anon_update_perfumes" ON perfumes FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_perfumes" ON perfumes;
CREATE POLICY "anon_delete_perfumes" ON perfumes FOR DELETE TO anon, authenticated USING (true);

-- ─── Perfume Gallery ─────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS perfume_gallery (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  perfume_id uuid NOT NULL REFERENCES perfumes(id) ON DELETE CASCADE,
  image_url text NOT NULL,
  display_order integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE perfume_gallery ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_perfume_gallery" ON perfume_gallery;
CREATE POLICY "anon_select_perfume_gallery" ON perfume_gallery FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_perfume_gallery" ON perfume_gallery;
CREATE POLICY "anon_insert_perfume_gallery" ON perfume_gallery FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_perfume_gallery" ON perfume_gallery;
CREATE POLICY "anon_update_perfume_gallery" ON perfume_gallery FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_perfume_gallery" ON perfume_gallery;
CREATE POLICY "anon_delete_perfume_gallery" ON perfume_gallery FOR DELETE TO anon, authenticated USING (true);

-- ─── Perfume Versions ────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS perfume_versions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  perfume_id uuid NOT NULL REFERENCES perfumes(id) ON DELETE CASCADE,
  label_ar text NOT NULL,
  label_en text NOT NULL,
  display_order integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE perfume_versions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_perfume_versions" ON perfume_versions;
CREATE POLICY "anon_select_perfume_versions" ON perfume_versions FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_perfume_versions" ON perfume_versions;
CREATE POLICY "anon_insert_perfume_versions" ON perfume_versions FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_perfume_versions" ON perfume_versions;
CREATE POLICY "anon_update_perfume_versions" ON perfume_versions FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_perfume_versions" ON perfume_versions;
CREATE POLICY "anon_delete_perfume_versions" ON perfume_versions FOR DELETE TO anon, authenticated USING (true);

-- ─── Offers ──────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS offers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE NOT NULL,
  title_ar text NOT NULL DEFAULT '',
  title_en text NOT NULL DEFAULT '',
  desc_ar text NOT NULL DEFAULT '',
  desc_en text NOT NULL DEFAULT '',
  long_desc_ar text NOT NULL DEFAULT '',
  long_desc_en text NOT NULL DEFAULT '',
  main_image text NOT NULL DEFAULT '',
  regular_price integer NOT NULL DEFAULT 0,
  max_quantity integer NOT NULL DEFAULT 99,
  free_delivery boolean NOT NULL DEFAULT false,
  is_featured boolean NOT NULL DEFAULT false,
  is_visible boolean NOT NULL DEFAULT true,
  display_order integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE offers ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_offers" ON offers;
CREATE POLICY "anon_select_offers" ON offers FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_offers" ON offers;
CREATE POLICY "anon_insert_offers" ON offers FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_offers" ON offers;
CREATE POLICY "anon_update_offers" ON offers FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_offers" ON offers;
CREATE POLICY "anon_delete_offers" ON offers FOR DELETE TO anon, authenticated USING (true);

-- ─── Offer Gallery ───────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS offer_gallery (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  offer_id uuid NOT NULL REFERENCES offers(id) ON DELETE CASCADE,
  image_url text NOT NULL,
  display_order integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE offer_gallery ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_offer_gallery" ON offer_gallery;
CREATE POLICY "anon_select_offer_gallery" ON offer_gallery FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_offer_gallery" ON offer_gallery;
CREATE POLICY "anon_insert_offer_gallery" ON offer_gallery FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_offer_gallery" ON offer_gallery;
CREATE POLICY "anon_update_offer_gallery" ON offer_gallery FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_offer_gallery" ON offer_gallery;
CREATE POLICY "anon_delete_offer_gallery" ON offer_gallery FOR DELETE TO anon, authenticated USING (true);

-- ─── Offer ↔ Perfume junction ────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS offer_perfumes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  offer_id uuid NOT NULL REFERENCES offers(id) ON DELETE CASCADE,
  perfume_id uuid REFERENCES perfumes(id) ON DELETE SET NULL,
  name_ar text NOT NULL DEFAULT '',
  name_en text NOT NULL DEFAULT '',
  desc_ar text NOT NULL DEFAULT '',
  desc_en text NOT NULL DEFAULT '',
  image_url text NOT NULL DEFAULT '',
  display_order integer NOT NULL DEFAULT 0
);

ALTER TABLE offer_perfumes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_offer_perfumes" ON offer_perfumes;
CREATE POLICY "anon_select_offer_perfumes" ON offer_perfumes FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_offer_perfumes" ON offer_perfumes;
CREATE POLICY "anon_insert_offer_perfumes" ON offer_perfumes FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_offer_perfumes" ON offer_perfumes;
CREATE POLICY "anon_update_offer_perfumes" ON offer_perfumes FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_offer_perfumes" ON offer_perfumes;
CREATE POLICY "anon_delete_offer_perfumes" ON offer_perfumes FOR DELETE TO anon, authenticated USING (true);

-- ─── Offer Includes ──────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS offer_includes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  offer_id uuid NOT NULL REFERENCES offers(id) ON DELETE CASCADE,
  label_ar text NOT NULL DEFAULT '',
  label_en text NOT NULL DEFAULT '',
  display_order integer NOT NULL DEFAULT 0
);

ALTER TABLE offer_includes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_offer_includes" ON offer_includes;
CREATE POLICY "anon_select_offer_includes" ON offer_includes FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_offer_includes" ON offer_includes;
CREATE POLICY "anon_insert_offer_includes" ON offer_includes FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_offer_includes" ON offer_includes;
CREATE POLICY "anon_update_offer_includes" ON offer_includes FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_offer_includes" ON offer_includes;
CREATE POLICY "anon_delete_offer_includes" ON offer_includes FOR DELETE TO anon, authenticated USING (true);

-- ─── Discounts ───────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS discounts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  offer_id uuid UNIQUE NOT NULL REFERENCES offers(id) ON DELETE CASCADE,
  is_enabled boolean NOT NULL DEFAULT false,
  old_price integer NOT NULL DEFAULT 0,
  new_price integer NOT NULL DEFAULT 0,
  discount_percentage integer GENERATED ALWAYS AS (
    CASE WHEN old_price > 0
      THEN ROUND(((old_price - new_price)::numeric / old_price) * 100)::integer
      ELSE 0
    END
  ) STORED,
  start_date date,
  end_date date,
  show_countdown boolean NOT NULL DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE discounts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_discounts" ON discounts;
CREATE POLICY "anon_select_discounts" ON discounts FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_discounts" ON discounts;
CREATE POLICY "anon_insert_discounts" ON discounts FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_discounts" ON discounts;
CREATE POLICY "anon_update_discounts" ON discounts FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_discounts" ON discounts;
CREATE POLICY "anon_delete_discounts" ON discounts FOR DELETE TO anon, authenticated USING (true);

-- ─── Contact Settings (singleton) ────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS contact_settings (
  id integer PRIMARY KEY DEFAULT 1,
  instagram text NOT NULL DEFAULT '',
  facebook text NOT NULL DEFAULT '',
  tiktok text NOT NULL DEFAULT '',
  telegram text NOT NULL DEFAULT '',
  whatsapp text NOT NULL DEFAULT '',
  email text NOT NULL DEFAULT '',
  phone text NOT NULL DEFAULT '',
  business_hours text NOT NULL DEFAULT '',
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT single_row CHECK (id = 1)
);

ALTER TABLE contact_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_contact_settings" ON contact_settings;
CREATE POLICY "anon_select_contact_settings" ON contact_settings FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_contact_settings" ON contact_settings;
CREATE POLICY "anon_insert_contact_settings" ON contact_settings FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_contact_settings" ON contact_settings;
CREATE POLICY "anon_update_contact_settings" ON contact_settings FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_contact_settings" ON contact_settings;
CREATE POLICY "anon_delete_contact_settings" ON contact_settings FOR DELETE TO anon, authenticated USING (true);

INSERT INTO contact_settings (id, instagram, facebook, tiktok, telegram, whatsapp, email, phone, business_hours)
VALUES (1, 'https://instagram.com/rahiqparfums', 'https://facebook.com/rahiqparfums', 'https://tiktok.com/@rahiqparfums', 'https://t.me/rahiqparfums', 'https://wa.me/213000000000', 'contact@rahiqparfums.dz', '', '')
ON CONFLICT (id) DO NOTHING;

-- ─── Footer Settings (singleton) ─────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS footer_settings (
  id integer PRIMARY KEY DEFAULT 1,
  brand_name text NOT NULL DEFAULT 'RAHIQ Parfums',
  description_ar text NOT NULL DEFAULT '',
  description_en text NOT NULL DEFAULT '',
  copyright_year integer NOT NULL DEFAULT 2024,
  copyright_text text NOT NULL DEFAULT 'All Rights Reserved',
  show_instagram boolean NOT NULL DEFAULT true,
  show_facebook boolean NOT NULL DEFAULT true,
  show_tiktok boolean NOT NULL DEFAULT true,
  show_telegram boolean NOT NULL DEFAULT true,
  show_whatsapp boolean NOT NULL DEFAULT true,
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT single_row CHECK (id = 1)
);

ALTER TABLE footer_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_footer_settings" ON footer_settings;
CREATE POLICY "anon_select_footer_settings" ON footer_settings FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_footer_settings" ON footer_settings;
CREATE POLICY "anon_insert_footer_settings" ON footer_settings FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_footer_settings" ON footer_settings;
CREATE POLICY "anon_update_footer_settings" ON footer_settings FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_footer_settings" ON footer_settings;
CREATE POLICY "anon_delete_footer_settings" ON footer_settings FOR DELETE TO anon, authenticated USING (true);

INSERT INTO footer_settings (id) VALUES (1) ON CONFLICT (id) DO NOTHING;

-- ─── Brand Settings (singleton) ──────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS brand_settings (
  id integer PRIMARY KEY DEFAULT 1,
  logo_url text NOT NULL DEFAULT '/images/logo/logo.png',
  hero_logo_url text NOT NULL DEFAULT '',
  favicon_url text NOT NULL DEFAULT '/favicon.svg',
  brand_name_ar text NOT NULL DEFAULT 'رحيق',
  brand_name_en text NOT NULL DEFAULT 'RAHIQ Parfums',
  default_language text NOT NULL DEFAULT 'ar',
  hero_desc_ar text NOT NULL DEFAULT '',
  hero_desc_en text NOT NULL DEFAULT '',
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT single_row CHECK (id = 1)
);

ALTER TABLE brand_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_brand_settings" ON brand_settings;
CREATE POLICY "anon_select_brand_settings" ON brand_settings FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_brand_settings" ON brand_settings;
CREATE POLICY "anon_insert_brand_settings" ON brand_settings FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_brand_settings" ON brand_settings;
CREATE POLICY "anon_update_brand_settings" ON brand_settings FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_brand_settings" ON brand_settings;
CREATE POLICY "anon_delete_brand_settings" ON brand_settings FOR DELETE TO anon, authenticated USING (true);

INSERT INTO brand_settings (id) VALUES (1) ON CONFLICT (id) DO NOTHING;

-- ─── Email Settings (singleton) ──────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS email_settings (
  id integer PRIMARY KEY DEFAULT 1,
  smtp_host text NOT NULL DEFAULT '',
  smtp_port text NOT NULL DEFAULT '587',
  smtp_username text NOT NULL DEFAULT '',
  smtp_password text NOT NULL DEFAULT '',
  sender_email text NOT NULL DEFAULT '',
  recipient_email text NOT NULL DEFAULT '',
  reply_to_email text NOT NULL DEFAULT '',
  use_ssl boolean NOT NULL DEFAULT false,
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT single_row CHECK (id = 1)
);

ALTER TABLE email_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_email_settings" ON email_settings;
CREATE POLICY "anon_select_email_settings" ON email_settings FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_email_settings" ON email_settings;
CREATE POLICY "anon_insert_email_settings" ON email_settings FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_email_settings" ON email_settings;
CREATE POLICY "anon_update_email_settings" ON email_settings FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_email_settings" ON email_settings;
CREATE POLICY "anon_delete_email_settings" ON email_settings FOR DELETE TO anon, authenticated USING (true);

INSERT INTO email_settings (id) VALUES (1) ON CONFLICT (id) DO NOTHING;

-- ─── Media Library ───────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS media_library (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  url text NOT NULL,
  filename text NOT NULL DEFAULT '',
  file_size integer,
  mime_type text NOT NULL DEFAULT 'image/jpeg',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE media_library ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_media_library" ON media_library;
CREATE POLICY "anon_select_media_library" ON media_library FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_media_library" ON media_library;
CREATE POLICY "anon_insert_media_library" ON media_library FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_media_library" ON media_library;
CREATE POLICY "anon_update_media_library" ON media_library FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_media_library" ON media_library;
CREATE POLICY "anon_delete_media_library" ON media_library FOR DELETE TO anon, authenticated USING (true);
