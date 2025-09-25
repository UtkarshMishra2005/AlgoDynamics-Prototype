import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export interface InventoryItem {
  id: string;
  distributor_id: string;
  batch_id: string;
  quantity_available: number;
  purchase_price: number;
  selling_price_per_kg: number;
  acquired_date: string;
  created_at: string;
  updated_at: string;
  batch: {
    id: string;
    crop_name: string;
    quantity: number;
    quality_grade?: string;
    farmer_id: string;
  };
}

export interface Purchase {
  id: string;
  retailer_id: string;
  distributor_id: string;
  inventory_id: string;
  batch_id: string;
  quantity_purchased: number;
  price_per_kg: number;
  total_cost: number;
  purchase_date: string;
  created_at: string;
  batch: {
    crop_name: string;
    quality_grade?: string;
  };
  profiles: {
    full_name?: string;
    company_name?: string;
  };
}

export const useInventory = () => {
  const { user } = useAuth();
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchDistributorInventory = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('distributor_inventory')
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
        .order('acquired_date', { ascending: false });

      if (error) throw error;
      setInventory(data || []);
    } catch (error) {
      console.error('Error fetching inventory:', error);
    }
  };

  const fetchAvailableInventory = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('distributor_inventory')
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
        .gt('quantity_available', 0)
        .order('acquired_date', { ascending: false });

      if (error) throw error;

      // Fetch distributor profiles separately
      const distributorIds = [...new Set(data?.map(item => item.distributor_id) || [])];
      
      if (distributorIds.length > 0) {
        const { data: profiles } = await supabase
          .from('profiles')
          .select('user_id, full_name, company_name, phone')
          .in('user_id', distributorIds);

        // Merge profiles with inventory data
        const inventoryWithProfiles = data?.map(item => ({
          ...item,
          profiles: profiles?.find(profile => profile.user_id === item.distributor_id) || null
        })) || [];

        return inventoryWithProfiles;
      }

      return data || [];
    } catch (error) {
      console.error('Error fetching available inventory:', error);
      return [];
    }
  };

  const fetchRetailerPurchases = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('retailer_purchases')
        .select(`
          *,
          batch:batches (
            crop_name,
            quality_grade
          )
        `)
        .eq('retailer_id', user.id)
        .order('purchase_date', { ascending: false });

      if (error) throw error;

      // Fetch distributor profiles separately
      const distributorIds = [...new Set(data?.map(item => item.distributor_id) || [])];
      
      if (distributorIds.length > 0) {
        const { data: profiles } = await supabase
          .from('profiles')
          .select('user_id, full_name, company_name')
          .in('user_id', distributorIds);

        // Merge profiles with purchase data
        const purchasesWithProfiles = data?.map(item => ({
          ...item,
          profiles: profiles?.find(profile => profile.user_id === item.distributor_id) || null
        })) || [];

        setPurchases(purchasesWithProfiles as Purchase[]);
      } else {
        setPurchases(data as Purchase[] || []);
      }
    } catch (error) {
      console.error('Error fetching purchases:', error);
    }
  };

  const purchaseFromDistributor = async (
    inventoryId: string,
    quantity: number
  ) => {
    if (!user) return;

    try {
      // Get inventory item details
      const { data: inventoryItem, error: inventoryError } = await supabase
        .from('distributor_inventory')
        .select('*')
        .eq('id', inventoryId)
        .single();

      if (inventoryError) throw inventoryError;

      const totalCost = quantity * inventoryItem.selling_price_per_kg;

      // Create purchase record
      const { data: purchase, error: purchaseError } = await supabase
        .from('retailer_purchases')
        .insert({
          retailer_id: user.id,
          distributor_id: inventoryItem.distributor_id,
          inventory_id: inventoryId,
          batch_id: inventoryItem.batch_id,
          quantity_purchased: quantity,
          price_per_kg: inventoryItem.selling_price_per_kg,
          total_cost: totalCost
        })
        .select()
        .single();

      if (purchaseError) throw purchaseError;

      // Update inventory quantity
      const { error: updateError } = await supabase
        .from('distributor_inventory')
        .update({
          quantity_available: inventoryItem.quantity_available - quantity
        })
        .eq('id', inventoryId);

      if (updateError) throw updateError;

      // Add revenue for distributor
      await supabase
        .from('user_revenue')
        .insert({
          user_id: inventoryItem.distributor_id,
          amount: totalCost,
          source: 'retailer_sale'
        });

      return purchase;
    } catch (error) {
      console.error('Error purchasing from distributor:', error);
      throw error;
    }
  };

  useEffect(() => {
    if (user) {
      fetchDistributorInventory();
      fetchRetailerPurchases();
    }
  }, [user]);

  return {
    inventory,
    purchases,
    loading,
    fetchAvailableInventory,
    purchaseFromDistributor,
    refetchInventory: fetchDistributorInventory,
    refetchPurchases: fetchRetailerPurchases
  };
};