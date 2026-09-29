/*
# RAHIQ Parfums — Perfume Gender Classification + offer_perfumes link repair

Supabase SQL Editor → New query → paste → Run.

This script is idempotent: it is safe to run more than once.

--------------------------------------------------------------------------
PART 1 — Perfume gender
--------------------------------------------------------------------------

The Dashboard already manages perfumes; this adds the one missing field the
customer-facing Home filters need: the Men / Women / Unisex classification.

`gender` is the single canonical source for:
  - عطور نسائية  (Home filter)  → 'women'
  - عطور رجالية (Home filter)  → 'men'
  - everything else              → 'unisex'

Existing rows default to 'unisex' so no perfume disappears from the catalogue.

--------------------------------------------------------------------------
PART 2 — Backfill gender for the existing catalogue
--------------------------------------------------------------------------

The six current perfumes already belong to the men / women collection offers,
so PART 3 below assigns them from that existing membership. REVIEW OR CHANGE
THIS LIST if you disagree with the classification — it is a business decision.
Anything not listed here stays 'unisex'.

--------------------------------------------------------------------------
PART 3 — Repair offer_perfumes.perfume_id
--------------------------------------------------------------------------

All six `offer_perfumes` rows currently have perfume_id = NULL, which is why no
perfume card can show a price or an order button: the link between a catalogue
perfume and the offer that gives it a price is missing.

This backfill restores the link by matching the stored perfume name against
`perfumes.name_ar` / `name_en`. It only fills rows where perfume_id IS NULL, so
it never overwrites a correct existing link.
*/

-- ==========================================================================
-- PART 1 — schema
-- ==========================================================================

ALTER TABLE perfumes
  ADD COLUMN IF NOT EXISTS gender text NOT NULL DEFAULT 'unisex';

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'perfumes_gender_check') THEN
    ALTER TABLE perfumes
      ADD CONSTRAINT perfumes_gender_check
      CHECK (gender IN ('men', 'women', 'unisex'));
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS perfumes_gender_idx
  ON perfumes (gender)
  WHERE is_visible = true;

-- ==========================================================================
-- PART 2 — backfill gender from the existing collection membership
-- ==========================================================================

-- Belong to the "women-collection" offer.
UPDATE perfumes
   SET gender = 'women'
 WHERE slug IN ('de-lina', 'crystal-noir', 'imperatrice-royal')
   AND (gender IS NULL OR gender = 'unisex');

-- Belong to the "men-collection" offer.
UPDATE perfumes
   SET gender = 'men'
 WHERE slug IN ('vib-rato', 'torino-21', 'paradis-garden')
   AND (gender IS NULL OR gender = 'unisex');

-- ==========================================================================
-- PART 3 — repair offer_perfumes.perfume_id
-- ==========================================================================

UPDATE offer_perfumes op
   SET perfume_id = p.id
  FROM perfumes p
 WHERE op.perfume_id IS NULL
   AND lower(btrim(op.name_ar)) = lower(btrim(p.name_ar));

UPDATE offer_perfumes op
   SET perfume_id = p.id
  FROM perfumes p
 WHERE op.perfume_id IS NULL
   AND lower(btrim(op.name_en)) = lower(btrim(p.name_en));
