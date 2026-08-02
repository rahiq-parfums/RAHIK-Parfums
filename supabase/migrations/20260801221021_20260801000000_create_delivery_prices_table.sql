/*
# RAHIQ Parfums — Delivery Prices Table

Dedicated table for per-wilaya delivery pricing.
Wilayas and municipalities are now sourced from src/lib/algeria.ts (static).
Only delivery prices remain in the database.
*/

CREATE TABLE IF NOT EXISTS delivery_prices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  wilaya_code text UNIQUE NOT NULL,
  home_delivery_price integer NOT NULL DEFAULT 600,
  office_delivery_price integer NOT NULL DEFAULT 400,
  free_delivery boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE delivery_prices ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_delivery_prices" ON delivery_prices;
CREATE POLICY "anon_select_delivery_prices" ON delivery_prices FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_delivery_prices" ON delivery_prices;
CREATE POLICY "anon_insert_delivery_prices" ON delivery_prices FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_delivery_prices" ON delivery_prices;
CREATE POLICY "anon_update_delivery_prices" ON delivery_prices FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_delivery_prices" ON delivery_prices;
CREATE POLICY "anon_delete_delivery_prices" ON delivery_prices FOR DELETE
  TO anon, authenticated USING (true);

CREATE INDEX IF NOT EXISTS delivery_prices_wilaya_code_idx ON delivery_prices(wilaya_code);

-- Seed all 58 wilayas with official prices
INSERT INTO delivery_prices (wilaya_code, home_delivery_price, office_delivery_price, free_delivery) VALUES
  ('01', 1000, 800, false),
  ('02', 550, 450, false),
  ('03', 850, 700, false),
  ('04', 700, 600, false),
  ('05', 700, 600, false),
  ('06', 700, 600, false),
  ('07', 850, 700, false),
  ('08', 1000, 800, false),
  ('09', 550, 450, false),
  ('10', 700, 600, false),
  ('11', 1500, 1300, false),
  ('12', 850, 700, false),
  ('13', 700, 600, false),
  ('14', 700, 600, false),
  ('15', 700, 600, false),
  ('16', 550, 450, false),
  ('17', 850, 700, false),
  ('18', 700, 600, false),
  ('19', 700, 600, false),
  ('20', 700, 600, false),
  ('21', 700, 600, false),
  ('22', 700, 600, false),
  ('23', 700, 600, false),
  ('24', 700, 600, false),
  ('25', 700, 600, false),
  ('26', 700, 600, false),
  ('27', 700, 600, false),
  ('28', 700, 600, false),
  ('29', 700, 600, false),
  ('30', 850, 700, false),
  ('31', 700, 600, false),
  ('32', 1000, 800, false),
  ('33', 1500, 1300, false),
  ('34', 700, 600, false),
  ('35', 700, 600, false),
  ('36', 700, 600, false),
  ('37', 1500, 1300, false),
  ('38', 700, 600, false),
  ('39', 850, 700, false),
  ('40', 700, 600, false),
  ('41', 700, 600, false),
  ('42', 500, 400, false),
  ('43', 700, 600, false),
  ('44', 550, 450, false),
  ('45', 1000, 800, false),
  ('46', 700, 600, false),
  ('47', 850, 700, false),
  ('48', 700, 600, false),
  ('49', 1000, 800, false),
  ('50', 1000, 800, false),
  ('51', 850, 700, false),
  ('52', 1000, 800, false),
  ('53', 1500, 1300, false),
  ('54', 1500, 1300, false),
  ('55', 850, 700, false),
  ('56', 1500, 1300, false),
  ('57', 850, 700, false),
  ('58', 850, 700, false)
ON CONFLICT (wilaya_code) DO NOTHING;

-- updated_at trigger
CREATE OR REPLACE FUNCTION update_delivery_prices_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS delivery_prices_updated_at ON delivery_prices;
CREATE TRIGGER delivery_prices_updated_at
  BEFORE UPDATE ON delivery_prices
  FOR EACH ROW EXECUTE FUNCTION update_delivery_prices_updated_at();
