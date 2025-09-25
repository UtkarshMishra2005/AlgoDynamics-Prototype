-- Fix inspector update policy to include WITH CHECK clause
DROP POLICY IF EXISTS "Inspectors can update batches for verification" ON public.batches;

CREATE POLICY "Inspectors can update batches for verification" 
ON public.batches 
FOR UPDATE 
USING (
  verification_status = 'pending' AND 
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.user_id = auth.uid() 
    AND profiles.role = 'inspector'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.user_id = auth.uid() 
    AND profiles.role = 'inspector'
  )
);