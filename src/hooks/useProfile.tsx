import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export interface Profile {
  id: string;
  user_id: string;
  email: string;
  full_name?: string;
  role: 'farmer' | 'distributor' | 'retailer' | 'inspector';
  ethereum_wallet?: string;
  phone?: string;
  created_at: string;
  updated_at: string;
  
  // Farmer specific
  farm_location?: string;
  farm_size?: number;
  farming_experience?: number;
  certifications?: string[];
  
  // Distributor specific
  company_name?: string;
  license_number?: string;
  warehouse_locations?: string[];
  transportation_capacity?: number;
  
  // Retailer specific
  store_name?: string;
  store_address?: string;
  store_type?: string;
  business_license?: string;
  
  // Inspector specific
  inspector_id?: string;
  certification_body?: string;
  specializations?: string[];
  active_since?: string;
}

export const useProfile = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [revenue, setRevenue] = useState(0);

  const fetchProfile = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error) throw error;
      setProfile(data as Profile);
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchRevenue = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('user_revenue')
        .select('amount')
        .eq('user_id', user.id);

      if (error) throw error;
      
      const totalRevenue = data?.reduce((sum, record) => sum + Number(record.amount), 0) || 0;
      setRevenue(totalRevenue);
    } catch (error) {
      console.error('Error fetching revenue:', error);
    }
  };

  const updateProfile = async (updates: Partial<Profile>) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;
      setProfile(data as Profile);
      return data;
    } catch (error) {
      console.error('Error updating profile:', error);
      throw error;
    }
  };

  useEffect(() => {
    fetchProfile();
    fetchRevenue();
  }, [user]);

  return {
    profile,
    revenue,
    loading,
    updateProfile,
    refetch: () => {
      fetchProfile();
      fetchRevenue();
    }
  };
};