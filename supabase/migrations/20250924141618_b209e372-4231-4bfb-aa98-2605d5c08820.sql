-- Fix RLS policies to allow inspectors to verify batches
DROP POLICY IF EXISTS "Farmers can manage their own batches" ON public.batches;
DROP POLICY IF EXISTS "Inspectors can update batches for verification" ON public.batches;

-- Recreate farmer policy as restrictive 
CREATE POLICY "Farmers can manage their own batches"
ON public.batches
FOR ALL
USING (auth.uid() = farmer_id)
WITH CHECK (auth.uid() = farmer_id);

-- Recreate inspector policy with permissive approach
CREATE POLICY "Inspectors can update batches for verification"
ON public.batches
FOR UPDATE
USING (
  verification_status = 'pending' OR
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.user_id = auth.uid()
      AND profiles.role = 'inspector'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.user_id = auth.uid()
      AND profiles.role = 'inspector'
  )
);