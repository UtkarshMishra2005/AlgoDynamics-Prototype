-- Fix security warnings by updating function search paths

-- Update handle_new_user function to set search_path
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  INSERT INTO public.profiles (user_id, email, role)
  VALUES (
    NEW.id, 
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'role', 'farmer')
  );
  RETURN NEW;
END;
$function$;

-- Update handle_batch_verification function to set search_path
CREATE OR REPLACE FUNCTION public.handle_batch_verification()
RETURNS TRIGGER 
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  -- If batch is verified, make it available for sale
  IF NEW.verification_status = 'verified' AND OLD.verification_status = 'pending' THEN
    NEW.is_available_for_sale = true;
    NEW.inspection_date = now();
  END IF;
  RETURN NEW;
END;
$$;

-- Update handle_distributor_purchase function to set search_path
CREATE OR REPLACE FUNCTION public.handle_distributor_purchase(
  p_batch_id uuid,
  p_distributor_id uuid,
  p_purchase_price numeric,
  p_selling_price_per_kg numeric
) RETURNS void 
LANGUAGE plpgsql 
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Update batch as sold
  UPDATE public.batches 
  SET 
    is_sold = true,
    sold_to_distributor_id = p_distributor_id,
    sold_date = now(),
    sold_price = p_purchase_price,
    is_available_for_sale = false
  WHERE id = p_batch_id;

  -- Add to distributor inventory
  INSERT INTO public.distributor_inventory (
    distributor_id,
    batch_id,
    quantity_available,
    purchase_price,
    selling_price_per_kg
  )
  SELECT 
    p_distributor_id,
    p_batch_id,
    quantity,
    p_purchase_price,
    p_selling_price_per_kg
  FROM public.batches
  WHERE id = p_batch_id;

  -- Add revenue record for farmer
  INSERT INTO public.user_revenue (user_id, amount, source)
  SELECT farmer_id, p_purchase_price, 'batch_sale'
  FROM public.batches
  WHERE id = p_batch_id;
END;
$$;