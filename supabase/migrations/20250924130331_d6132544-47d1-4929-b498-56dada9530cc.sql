-- Create batches table for crop tracking
CREATE TABLE public.batches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  farmer_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  crop_name text NOT NULL,
  quantity numeric NOT NULL,
  harvest_date date NOT NULL,
  farm_location text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  verification_status text NOT NULL DEFAULT 'pending' CHECK (verification_status IN ('pending', 'verified', 'rejected')),
  quality_grade text CHECK (quality_grade IN ('A', 'B', 'C')),
  inspector_id uuid REFERENCES auth.users(id),
  inspection_notes text,
  inspection_date timestamptz,
  is_available_for_sale boolean NOT NULL DEFAULT false,
  is_sold boolean NOT NULL DEFAULT false,
  sold_to_distributor_id uuid REFERENCES auth.users(id),
  sold_date timestamptz,
  sold_price numeric
);

-- Create batch_bids table for distributor bidding
CREATE TABLE public.batch_bids (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  batch_id uuid NOT NULL REFERENCES public.batches(id) ON DELETE CASCADE,
  distributor_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  bid_amount numeric NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'accepted', 'rejected')),
  UNIQUE(batch_id, distributor_id)
);

-- Create distributor_inventory table for tracking distributor stock
CREATE TABLE public.distributor_inventory (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  distributor_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  batch_id uuid NOT NULL REFERENCES public.batches(id) ON DELETE CASCADE,
  quantity_available numeric NOT NULL,
  purchase_price numeric NOT NULL,
  selling_price_per_kg numeric NOT NULL,
  acquired_date timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Create retailer_purchases table for tracking retailer purchases from distributors
CREATE TABLE public.retailer_purchases (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  retailer_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  distributor_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  inventory_id uuid NOT NULL REFERENCES public.distributor_inventory(id) ON DELETE CASCADE,
  batch_id uuid NOT NULL REFERENCES public.batches(id) ON DELETE CASCADE,
  quantity_purchased numeric NOT NULL,
  price_per_kg numeric NOT NULL,
  total_cost numeric NOT NULL,
  purchase_date timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.batches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.batch_bids ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.distributor_inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.retailer_purchases ENABLE ROW LEVEL SECURITY;

-- RLS Policies for batches
CREATE POLICY "Farmers can manage their own batches" ON public.batches
  FOR ALL USING (auth.uid() = farmer_id);

CREATE POLICY "Inspectors can view all pending batches" ON public.batches
  FOR SELECT USING (
    verification_status = 'pending' AND 
    EXISTS (SELECT 1 FROM public.profiles WHERE user_id = auth.uid() AND role = 'inspector')
  );

CREATE POLICY "Inspectors can update batches for verification" ON public.batches
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE user_id = auth.uid() AND role = 'inspector')
  );

CREATE POLICY "Distributors can view verified batches" ON public.batches
  FOR SELECT USING (
    verification_status = 'verified' AND is_available_for_sale = true AND is_sold = false AND
    EXISTS (SELECT 1 FROM public.profiles WHERE user_id = auth.uid() AND role = 'distributor')
  );

CREATE POLICY "Retailers can view basic batch info" ON public.batches
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE user_id = auth.uid() AND role = 'retailer')
  );

-- RLS Policies for batch_bids
CREATE POLICY "Distributors can manage their own bids" ON public.batch_bids
  FOR ALL USING (auth.uid() = distributor_id);

CREATE POLICY "Farmers can view bids on their batches" ON public.batch_bids
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.batches WHERE id = batch_id AND farmer_id = auth.uid())
  );

-- RLS Policies for distributor_inventory
CREATE POLICY "Distributors can manage their inventory" ON public.distributor_inventory
  FOR ALL USING (auth.uid() = distributor_id);

CREATE POLICY "Retailers can view distributor inventory" ON public.distributor_inventory
  FOR SELECT USING (
    quantity_available > 0 AND
    EXISTS (SELECT 1 FROM public.profiles WHERE user_id = auth.uid() AND role = 'retailer')
  );

-- RLS Policies for retailer_purchases
CREATE POLICY "Retailers can manage their purchases" ON public.retailer_purchases
  FOR ALL USING (auth.uid() = retailer_id);

CREATE POLICY "Distributors can view their sales" ON public.retailer_purchases
  FOR SELECT USING (auth.uid() = distributor_id);

-- Create indexes for better performance
CREATE INDEX idx_batches_farmer_id ON public.batches(farmer_id);
CREATE INDEX idx_batches_verification_status ON public.batches(verification_status);
CREATE INDEX idx_batches_inspector_id ON public.batches(inspector_id);
CREATE INDEX idx_batch_bids_batch_id ON public.batch_bids(batch_id);
CREATE INDEX idx_batch_bids_distributor_id ON public.batch_bids(distributor_id);
CREATE INDEX idx_distributor_inventory_distributor_id ON public.distributor_inventory(distributor_id);
CREATE INDEX idx_retailer_purchases_retailer_id ON public.retailer_purchases(retailer_id);

-- Add triggers for timestamp updates
CREATE TRIGGER update_batches_updated_at
  BEFORE UPDATE ON public.batches
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_distributor_inventory_updated_at
  BEFORE UPDATE ON public.distributor_inventory
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Function to automatically make batch available for sale after verification
CREATE OR REPLACE FUNCTION public.handle_batch_verification()
RETURNS TRIGGER AS $$
BEGIN
  -- If batch is verified, make it available for sale
  IF NEW.verification_status = 'verified' AND OLD.verification_status = 'pending' THEN
    NEW.is_available_for_sale = true;
    NEW.inspection_date = now();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER batch_verification_trigger
  BEFORE UPDATE ON public.batches
  FOR EACH ROW EXECUTE FUNCTION public.handle_batch_verification();

-- Function to handle batch purchase by distributor
CREATE OR REPLACE FUNCTION public.handle_distributor_purchase(
  p_batch_id uuid,
  p_distributor_id uuid,
  p_purchase_price numeric,
  p_selling_price_per_kg numeric
) RETURNS void AS $$
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
$$ LANGUAGE plpgsql SECURITY DEFINER;