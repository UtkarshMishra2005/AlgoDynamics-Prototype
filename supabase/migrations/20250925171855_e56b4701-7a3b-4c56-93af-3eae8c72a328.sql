-- Clean up the previous policy that caused recursion
DROP POLICY IF EXISTS "Farmers can view distributor info for bids on their batches" ON public.profiles;

-- Function to safely check visibility without recursive RLS
CREATE OR REPLACE FUNCTION public.can_farmer_view_distributor_profile(_profile_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.batch_bids bb
    JOIN public.batches b ON bb.batch_id = b.id
    WHERE bb.distributor_id = _profile_user_id
      AND b.farmer_id = auth.uid()
  );
$$;

-- Policy allowing farmers to view distributor profile rows tied to bids on their batches
CREATE POLICY "Farmers can view distributor info for bids on their batches"
ON public.profiles
FOR SELECT
USING (
  role = 'distributor' AND public.can_farmer_view_distributor_profile(user_id)
);

-- Atomic accept flow via SECURITY DEFINER to avoid client-side RLS issues
CREATE OR REPLACE FUNCTION public.accept_bid(p_bid_id uuid, p_selling_price_per_kg numeric)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_batch_id uuid;
  v_distributor_id uuid;
  v_bid_amount numeric;
  v_farmer_id uuid;
BEGIN
  SELECT bb.batch_id, bb.distributor_id, bb.bid_amount, b.farmer_id
    INTO v_batch_id, v_distributor_id, v_bid_amount, v_farmer_id
  FROM public.batch_bids bb
  JOIN public.batches b ON b.id = bb.batch_id
  WHERE bb.id = p_bid_id;

  IF v_batch_id IS NULL THEN
    RAISE EXCEPTION 'Bid not found';
  END IF;

  IF v_farmer_id <> auth.uid() THEN
    RAISE EXCEPTION 'Not authorized to accept this bid';
  END IF;

  -- Complete the sale and inventory updates
  PERFORM public.handle_distributor_purchase(v_batch_id, v_distributor_id, v_bid_amount, p_selling_price_per_kg);

  -- Mark accepted bid and reject others for this batch
  UPDATE public.batch_bids
  SET status = CASE WHEN id = p_bid_id THEN 'accepted' ELSE 'rejected' END
  WHERE batch_id = v_batch_id;
END;
$$;