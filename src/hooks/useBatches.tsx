import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export interface Batch {
  id: string;
  farmer_id: string;
  crop_name: string;
  quantity: number;
  harvest_date: string;
  farm_location: string;
  created_at: string;
  updated_at: string;
  verification_status: 'pending' | 'verified' | 'rejected';
  quality_grade?: 'A' | 'B' | 'C';
  inspector_id?: string;
  inspection_notes?: string;
  inspection_date?: string;
  is_available_for_sale: boolean;
  is_sold: boolean;
  sold_to_distributor_id?: string;
  sold_date?: string;
  sold_price?: number;
}

export interface BatchBid {
  id: string;
  batch_id: string;
  distributor_id: string;
  bid_amount: number;
  created_at: string;
  status: 'active' | 'accepted' | 'rejected';
}

export const useBatches = () => {
  const { user } = useAuth();
  const [batches, setBatches] = useState<Batch[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchBatches = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('batches')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setBatches(data as Batch[] || []);
    } catch (error) {
      console.error('Error fetching batches:', error);
    } finally {
      setLoading(false);
    }
  };

  const createBatch = async (batchData: {
    crop_name: string;
    quantity: number;
    harvest_date: string;
    farm_location: string;
  }) => {
    if (!user) return null;

    try {
      const { data, error } = await supabase
        .from('batches')
        .insert({
          farmer_id: user.id,
          ...batchData
        })
        .select()
        .single();

      if (error) throw error;
      
      setBatches(prev => [data as Batch, ...prev]);
      return data;
    } catch (error) {
      console.error('Error creating batch:', error);
      throw error;
    }
  };

  const verifyBatch = async (
    batchId: string, 
    qualityGrade: 'A' | 'B' | 'C',
    inspectionNotes?: string
  ) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('batches')
        .update({
          verification_status: 'verified',
          quality_grade: qualityGrade,
          inspector_id: user.id,
          inspection_notes: inspectionNotes
        })
        .eq('id', batchId)
        .select()
        .maybeSingle();

      if (error) throw error;
      
      setBatches(prev =>
        prev.map(batch =>
          batch.id === batchId
            ? ((data as Batch) ?? {
                ...batch,
                verification_status: 'verified',
                quality_grade: qualityGrade,
                inspector_id: user.id,
                inspection_notes: inspectionNotes
              })
            : batch
        )
      );
      
      return data;
    } catch (error) {
      console.error('Error verifying batch:', error);
      throw error;
    }
  };

  const placeBid = async (batchId: string, bidAmount: number) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('batch_bids')
        .insert({
          batch_id: batchId,
          distributor_id: user.id,
          bid_amount: bidAmount
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error placing bid:', error);
      throw error;
    }
  };

  const acceptBid = async (bidId: string, sellingPrice: number) => {
    if (!user) return;

    try {
      // Use the new secure accept function
      const { error } = await supabase.rpc('accept_bid', {
        p_bid_id: bidId,
        p_selling_price_per_kg: sellingPrice
      });

      if (error) throw error;

      // Refresh batches
      fetchBatches();
    } catch (error) {
      console.error('Error accepting bid:', error);
      throw error;
    }
  };

  useEffect(() => {
    fetchBatches();
  }, [user]);

  return {
    batches,
    loading,
    createBatch,
    verifyBatch,
    placeBid,
    acceptBid,
    refetch: fetchBatches
  };
};