
-- 1.1 Fix evaluation_answers score constraint (allow 0-10)
ALTER TABLE public.evaluation_answers DROP CONSTRAINT IF EXISTS evaluation_answers_score_check;
ALTER TABLE public.evaluation_answers ADD CONSTRAINT evaluation_answers_score_check CHECK (score >= 0 AND score <= 10);

-- 1.2 Add CASCADE on delete for campaign-related FKs

-- evaluation_campaign_questions -> evaluation_campaigns
ALTER TABLE public.evaluation_campaign_questions
  DROP CONSTRAINT IF EXISTS evaluation_campaign_questions_campaign_id_fkey,
  ADD CONSTRAINT evaluation_campaign_questions_campaign_id_fkey
    FOREIGN KEY (campaign_id) REFERENCES public.evaluation_campaigns(id) ON DELETE CASCADE;

-- evaluation_answers -> customer_evaluations
ALTER TABLE public.evaluation_answers
  DROP CONSTRAINT IF EXISTS evaluation_answers_evaluation_id_fkey,
  ADD CONSTRAINT evaluation_answers_evaluation_id_fkey
    FOREIGN KEY (evaluation_id) REFERENCES public.customer_evaluations(id) ON DELETE CASCADE;

-- customer_evaluations -> evaluation_campaigns
ALTER TABLE public.customer_evaluations
  DROP CONSTRAINT IF EXISTS customer_evaluations_campaign_id_fkey,
  ADD CONSTRAINT customer_evaluations_campaign_id_fkey
    FOREIGN KEY (campaign_id) REFERENCES public.evaluation_campaigns(id) ON DELETE CASCADE;

-- campaign_prizes -> evaluation_campaigns
ALTER TABLE public.campaign_prizes
  DROP CONSTRAINT IF EXISTS campaign_prizes_campaign_id_fkey,
  ADD CONSTRAINT campaign_prizes_campaign_id_fkey
    FOREIGN KEY (campaign_id) REFERENCES public.evaluation_campaigns(id) ON DELETE CASCADE;

-- campaign_prize_wins -> evaluation_campaigns
ALTER TABLE public.campaign_prize_wins
  DROP CONSTRAINT IF EXISTS campaign_prize_wins_campaign_id_fkey,
  ADD CONSTRAINT campaign_prize_wins_campaign_id_fkey
    FOREIGN KEY (campaign_id) REFERENCES public.evaluation_campaigns(id) ON DELETE CASCADE;

-- campaign_prize_wins -> customer_evaluations
ALTER TABLE public.campaign_prize_wins
  DROP CONSTRAINT IF EXISTS campaign_prize_wins_evaluation_id_fkey,
  ADD CONSTRAINT campaign_prize_wins_evaluation_id_fkey
    FOREIGN KEY (evaluation_id) REFERENCES public.customer_evaluations(id) ON DELETE CASCADE;

-- campaign_prize_wins -> campaign_prizes
ALTER TABLE public.campaign_prize_wins
  DROP CONSTRAINT IF EXISTS campaign_prize_wins_prize_id_fkey,
  ADD CONSTRAINT campaign_prize_wins_prize_id_fkey
    FOREIGN KEY (prize_id) REFERENCES public.campaign_prizes(id) ON DELETE CASCADE;

-- 1.3 Add CASCADE for delivery product deletions

-- delivery_product_options -> delivery_products
ALTER TABLE public.delivery_product_options
  DROP CONSTRAINT IF EXISTS delivery_product_options_product_id_fkey,
  ADD CONSTRAINT delivery_product_options_product_id_fkey
    FOREIGN KEY (product_id) REFERENCES public.delivery_products(id) ON DELETE CASCADE;

-- delivery_product_option_items -> delivery_product_options
ALTER TABLE public.delivery_product_option_items
  DROP CONSTRAINT IF EXISTS delivery_product_option_items_option_id_fkey,
  ADD CONSTRAINT delivery_product_option_items_option_id_fkey
    FOREIGN KEY (option_id) REFERENCES public.delivery_product_options(id) ON DELETE CASCADE;

-- delivery_product_recipes -> delivery_products
ALTER TABLE public.delivery_product_recipes
  DROP CONSTRAINT IF EXISTS delivery_product_recipes_product_id_fkey,
  ADD CONSTRAINT delivery_product_recipes_product_id_fkey
    FOREIGN KEY (product_id) REFERENCES public.delivery_products(id) ON DELETE CASCADE;

-- delivery_option_item_recipes -> delivery_product_option_items
ALTER TABLE public.delivery_option_item_recipes
  DROP CONSTRAINT IF EXISTS delivery_option_item_recipes_option_item_id_fkey,
  ADD CONSTRAINT delivery_option_item_recipes_option_item_id_fkey
    FOREIGN KEY (option_item_id) REFERENCES public.delivery_product_option_items(id) ON DELETE CASCADE;

-- delivery_order_items -> delivery_products (SET NULL instead of CASCADE to preserve order history)
ALTER TABLE public.delivery_order_items
  DROP CONSTRAINT IF EXISTS delivery_order_items_product_id_fkey,
  ADD CONSTRAINT delivery_order_items_product_id_fkey
    FOREIGN KEY (product_id) REFERENCES public.delivery_products(id) ON DELETE SET NULL;

-- 1.4 Add CASCADE for pdv ingredient deletions

-- pdv_product_recipes -> pdv_ingredients
ALTER TABLE public.pdv_product_recipes
  DROP CONSTRAINT IF EXISTS pdv_product_recipes_ingredient_id_fkey,
  ADD CONSTRAINT pdv_product_recipes_ingredient_id_fkey
    FOREIGN KEY (ingredient_id) REFERENCES public.pdv_ingredients(id) ON DELETE CASCADE;

-- delivery_product_recipes -> pdv_ingredients
ALTER TABLE public.delivery_product_recipes
  DROP CONSTRAINT IF EXISTS delivery_product_recipes_ingredient_id_fkey,
  ADD CONSTRAINT delivery_product_recipes_ingredient_id_fkey
    FOREIGN KEY (ingredient_id) REFERENCES public.pdv_ingredients(id) ON DELETE CASCADE;

-- delivery_option_item_recipes -> pdv_ingredients
ALTER TABLE public.delivery_option_item_recipes
  DROP CONSTRAINT IF EXISTS delivery_option_item_recipes_ingredient_id_fkey,
  ADD CONSTRAINT delivery_option_item_recipes_ingredient_id_fkey
    FOREIGN KEY (ingredient_id) REFERENCES public.pdv_ingredients(id) ON DELETE CASCADE;
