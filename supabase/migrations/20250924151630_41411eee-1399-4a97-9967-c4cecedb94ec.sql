-- Create/refresh triggers for batches
-- 1) updated_at auto-update
DROP TRIGGER IF EXISTS update_batches_updated_at ON public.batches;
CREATE TRIGGER update_batches_updated_at
BEFORE UPDATE ON public.batches
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- 2) verification side effects (inspection_date, availability)
DROP TRIGGER IF EXISTS batch_verification_trigger ON public.batches;
CREATE TRIGGER batch_verification_trigger
BEFORE UPDATE ON public.batches
FOR EACH ROW
EXECUTE FUNCTION public.handle_batch_verification();