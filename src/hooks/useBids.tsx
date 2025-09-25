import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export interface BidWithBatch {
  id: string;
  batch_id: string;
  distributor_id: string;
  bid_amount: number;
  created_at: string;
  status: 'active' | 'accepted' | 'rejected';
  batch: {
    id: string;
    crop_name: string;
    quantity: number;
    quality_grade?: string;
    farmer_id: string;
  };
}

export const useBids = () => {
  const { user } = useAuth();
  const [bids, setBids] = useState<BidWithBatch[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchBids = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('batch_bids')
        .select(`
          *,
          batch:batches (
            id,
            crop_name,
            quantity,
            quality_grade,
            farmer_id
          )
        `)
        .eq('distributor_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setBids(data as BidWithBatch[] || []);
    } catch (error) {
      console.error('Error fetching bids:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchBidsForBatch = async (batchId: string) => {
    try {
      // First get the bids
      const { data: bids, error: bidsError } = await supabase
        .from('batch_bids')
        .select('*')
        .eq('batch_id', batchId)
        .eq('status', 'active')
        .order('bid_amount', { ascending: false });

      if (bidsError) throw bidsError;
      
      if (!bids || bids.length === 0) return [];

      // Then get distributor profiles for each bid
      const distributorIds = bids.map(bid => bid.distributor_id);
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('user_id, company_name, full_name, role')
        .in('user_id', distributorIds)
        .eq('role', 'distributor');

      if (profilesError) {
        console.warn('Could not fetch profiles:', profilesError);
        // Return bids without profile info
        return bids.map(bid => ({ ...bid, profiles: null }));
      }

      // Merge bids with profile data
      return bids.map(bid => {
        const profile = profiles?.find(p => p.user_id === bid.distributor_id);
        return {
          ...bid,
          profiles: profile || null
        };
      });
    } catch (error) {
      console.error('Error fetching bids for batch:', error);
      return [];
    }
  };

  const placeBid = async (batchId: string, amount: number) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('batch_bids')
        .insert({
          batch_id: batchId,
          distributor_id: user.id,
          bid_amount: amount
        })
        .select()
        .single();

      if (error) throw error;
      
      // Refresh bids
      await fetchBids();
      return data;
    } catch (error) {
      console.error('Error placing bid:', error);
      throw error;
    }
  };

  useEffect(() => {
    fetchBids();
  }, [user]);

  return {
    bids,
    loading,
    fetchBidsForBatch,
    placeBid,
    refetch: fetchBids
  };
};