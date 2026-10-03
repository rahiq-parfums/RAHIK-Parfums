/*
# RAHIQ Parfums — Individual perfume price (`perfumes.price`) + Offer gender (`offers.gender`)

Supabase SQL Editor → New query → paste → Run.

This script is idempotent: it is safe to run more than once.

--------------------------------------------------------------------------
PART 1 — perfumes.price : an individual perfume becomes a real product
--------------------------------------------------------------------------
A perfume is a product in its own right. It is priced from `perfumes.price`
and ordered on its own.

It deliberately does NOT borrow a collection Offer's price:
`offers.regular_price` buys a whole set of perfumes, so that number can never
stand behind a single perfume. Nothing in this script copies an Offer price
into `perfumes.price`.

`price` is NULLABLE ON PURPOSE. The existing perfumes have no individual price
yet, and inventing one would put a wrong number on the shop. They stay NULL
until the real prices are entered in PART 3.

`integer` matches `offers.regular_price`: prices are whole dinars, no decimals.
`perfumes_price_check` rejects a stored price of 0 or less, because a free or
negative perfume price is never valid.

The Dashboard (Add/Edit Perfume → "Individual Price (DA)") refuses to save a
perfume without a price, so no NEW perfume can be published without one.

--------------------------------------------------------------------------
PART 2 — offers.gender : Men / Women / Unisex on collections
--------------------------------------------------------------------------
Mirrors the existing `perfumes.gender` implementation exactly: the same three
values, the same CHECK constraint convention (`<table>_gender_check`), and the
same `DEFAULT 'unisex'` so no Offer disappears from the catalogue.

Existing Offers are classified in PART 4. REVIEW IT before running — a product
category is a business decision. Anything not listed stays 'unisex', which is
the safe default because it never hides or misroutes an Offer.

No new RLS policy is needed: PART 1 and PART 2 only add columns to `perfumes`
and `offers`, which already have anon + authenticated CRUD policies. The new
columns are readable and writable by the Dashboard as soon as they exist.

--------------------------------------------------------------------------
PART 3 — REQUIRED manual data entry: the individual perfume prices
--------------------------------------------------------------------------
The catalogue currently has 7 perfumes and NOT ONE price between them.
Until this step is done, a perfume page shows "price to be announced" and has
no order form, and no collection fallback is offered.

Set each price either way:
  (a) in the Dashboard: Add/Edit Perfume → "Individual Price (DA)", or
  (b) with the UPDATE statements below, one row per perfume.

DO NOT copy the collection prices (2500 / 2300) into individual perfumes. Those
are bundle prices. Each perfume needs its own real price.

--------------------------------------------------------------------------
PART 4 — offers.gender classification: the two existing Offers
--------------------------------------------------------------------------
Both state their category in their slug AND their title, so these values are
read from the stored data rather than guessed. REVIEW IT before running — a
product category is a business decision. Any Offer not listed stays 'unisex'.

--------------------------------------------------------------------------
PART 5 — Optional hardening, only after every price is entered
--------------------------------------------------------------------------
`ALTER TABLE perfumes ALTER COLUMN price SET NOT NULL` locks the column down
at the database level, so not even a direct SQL insert can create a perfume
without a price. Leave it commented out until PART 3 is complete, otherwise
every existing perfume becomes uneditable.
*/

/* ==========================================================================
   PART 1 — perfumes.price
   ========================================================================== */

ALTER TABLE perfumes
  ADD COLUMN IF NOT EXISTS price integer;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'perfumes_price_check') THEN
    ALTER TABLE perfumes
      ADD CONSTRAINT perfumes_price_check
      CHECK (price IS NULL OR price > 0);
  END IF;
END $$;

COMMENT ON COLUMN perfumes.price IS
  'Individual selling price of this perfume in DA. Never copied from an offer.';

/* ==========================================================================
   PART 2 — offers.gender
   ========================================================================== */

ALTER TABLE offers
  ADD COLUMN IF NOT EXISTS gender text NOT NULL DEFAULT 'unisex';

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'offers_gender_check') THEN
    ALTER TABLE offers
      ADD CONSTRAINT offers_gender_check
      CHECK (gender IN ('men', 'women', 'unisex'));
  END IF;
END $$;

/* ==========================================================================
   PART 3 — manual data entry: individual perfume prices   [REQUIRED]
   ========================================================================== */

-- Which perfumes still need a price. Expected right now: every row returned,
-- because none of them has an individual price yet.
SELECT slug, name_ar, name_en, gender, price
  FROM perfumes
 WHERE price IS NULL
 ORDER BY display_order, slug;

-- Set the real prices. Replace <price> with the actual amount in DA.
-- Example syntax, one statement per perfume:
--
-- UPDATE perfumes SET price = <price> WHERE slug = 'paradis-garden';
-- UPDATE perfumes SET price = <price> WHERE slug = 'imperatrice-royal';
-- UPDATE perfumes SET price = <price> WHERE slug = 'crystal-noir';
-- UPDATE perfumes SET price = <price> WHERE slug = 'de-lina';
-- UPDATE perfumes SET price = <price> WHERE slug = 'torino-21';
-- UPDATE perfumes SET price = <price> WHERE slug = 'vib-rato';
--
-- NOTE: the catalogue also contains a row with slug 'test'. Decide whether it
-- is a real perfume (give it a price, or hide it) or leftover junk to delete.
-- This script does not touch it.

/* ==========================================================================
   PART 4 — offers.gender classification   [REVIEW BEFORE RUNNING]
   ========================================================================== */

-- Both existing Offers state their category in their slug AND their title
-- ("RAHIQ Man Collection" / "RAHIQ Woman Collection"), so these two values are
-- read from the stored data rather than guessed. Change them if the business
-- meaning is different. Every other Offer keeps the 'unisex' default.
UPDATE offers SET gender = 'men'   WHERE slug = 'men-collection';
UPDATE offers SET gender = 'women' WHERE slug = 'women-collection';

/* ==========================================================================
   PART 5 — Optional hardening, only after PART 3 is complete
   ========================================================================== */

-- Must return 0 before you run the statement below it.
-- SELECT count(*) AS missing_price FROM perfumes WHERE price IS NULL;
--
-- ALTER TABLE perfumes ALTER COLUMN price SET NOT NULL;

/* ==========================================================================
   VERIFICATION — run after everything above
   ========================================================================== */

-- Expect: no rows. Any row listed here is a perfume with no price and no order.
SELECT slug, name_ar, name_en
  FROM perfumes
 WHERE price IS NULL OR price <= 0
 ORDER BY slug;

-- Expect: every row price IS NOT NULL, and the 6 real perfumes priced.
SELECT slug, name_ar, name_en, gender, price
  FROM perfumes
 ORDER BY price NULLS LAST, display_order, slug;

-- Expect: men-collection = men, women-collection = women, others unisex.
SELECT slug, title_ar, title_en, gender, regular_price
  FROM offers
 ORDER BY display_order, slug;

-- Expect: both columns to exist.
SELECT table_name, column_name, data_type, is_nullable, column_default
  FROM information_schema.columns
 WHERE (table_name = 'perfumes' AND column_name = 'price')
    OR (table_name = 'offers'    AND column_name = 'gender')
 ORDER BY table_name, column_name;