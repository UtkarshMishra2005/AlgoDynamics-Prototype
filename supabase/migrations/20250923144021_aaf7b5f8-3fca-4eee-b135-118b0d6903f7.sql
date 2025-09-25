-- Create user profiles table with role-specific details
CREATE TABLE public.profiles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  email TEXT NOT NULL,
  full_name TEXT,
  role TEXT NOT NULL CHECK (role IN ('farmer', 'distributor', 'retailer', 'inspector')),
  ethereum_wallet TEXT,
  phone TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  -- Farmer specific fields
  farm_location TEXT,
  farm_size DECIMAL,
  farming_experience INTEGER,
  certifications TEXT[],
  
  -- Distributor specific fields
  company_name TEXT,
  license_number TEXT,
  warehouse_locations TEXT[],
  transportation_capacity INTEGER,
  
  -- Retailer specific fields
  store_name TEXT,
  store_address TEXT,
  store_type TEXT,
  business_license TEXT,
  
  -- Inspector specific fields
  inspector_id TEXT,
  certification_body TEXT,
  specializations TEXT[],
  active_since DATE
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own profile" 
ON public.profiles 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile" 
ON public.profiles 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile" 
ON public.profiles 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Create revenue tracking table
CREATE TABLE public.user_revenue (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  amount DECIMAL NOT NULL DEFAULT 0,
  currency TEXT NOT NULL DEFAULT 'INR',
  source TEXT, -- 'batch_sale', 'commission', etc.
  transaction_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS for revenue
ALTER TABLE public.user_revenue ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own revenue" 
ON public.user_revenue 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own revenue" 
ON public.user_revenue 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_profiles_updated_at
BEFORE UPDATE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to handle new user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, email, role)
  VALUES (
    NEW.id, 
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'role', 'farmer')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger for new user profile creation
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();