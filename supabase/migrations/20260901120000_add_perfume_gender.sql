/*
# RAHIQ Parfums — Perfume Gender Classification

The Dashboard already manages perfumes; this adds the one missing field that the
customer-facing Home filters need: the Men / Women / Unisex classification.

`gender` is the single canonical source for:
  - عطور نسائية  (Home filter)  → 'women'
  - عطور رجالية (Home filter)  → 'men'
  - everything else              → 'unisex'

It is edited from /admin/products and read by the public data layer, so a
perfume created or reclassified in the Dashboard appears under the right Home
filter with no frontend change.

Existing rows default to 'unisex' so no perfume disappears from the catalogue.
*/

ALTER TABLE perfumes
  ADD COLUMN IF NOT EXISTS gender text NOT NULL DEFAULT 'unisex';

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'perfumes_gender_check'
  ) THEN
    ALTER TABLE perfumes
      ADD CONSTRAINT perfumes_gender_check
      CHECK (gender IN ('men', 'women', 'unisex'));
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS perfumes_gender_idx
  ON perfumes (gender)
  WHERE is_visible = true;
