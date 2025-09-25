-- Fix batch_bids RLS so farmers can view bids on their batches without also being the distributor
-- 1) Drop existing restrictive policies
DROP POLICY IF EXISTS "Distributors can manage their own bids" ON public.batch_bids;
DROP POLICY IF EXISTS "Farmers can view bids on their batches" ON public.batch_bids;

-- 2) Recreate permissive policies
-- Distributors can fully manage their own bids (insert/select/update/delete)
CREATE POLICY "Distributors can manage their own bids"
ON public.batch_bids
FOR ALL
USING (auth.uid() = distributor_id)
WITH CHECK (auth.uid() = distributor_id);

-- Farmers can view bids placed on their own batches
CREATE POLICY "Farmers can view bids on their batches"
ON public.batch_bids
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.batches
    WHERE batches.id = batch_bids.batch_id
      AND batches.farmer_id = auth.uid()
  )
);