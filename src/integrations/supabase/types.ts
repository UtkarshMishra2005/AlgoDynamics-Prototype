export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      batch_bids: {
        Row: {
          batch_id: string
          bid_amount: number
          created_at: string
          distributor_id: string
          id: string
          status: string
        }
        Insert: {
          batch_id: string
          bid_amount: number
          created_at?: string
          distributor_id: string
          id?: string
          status?: string
        }
        Update: {
          batch_id?: string
          bid_amount?: number
          created_at?: string
          distributor_id?: string
          id?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "batch_bids_batch_id_fkey"
            columns: ["batch_id"]
            isOneToOne: false
            referencedRelation: "batches"
            referencedColumns: ["id"]
          },
        ]
      }
      batches: {
        Row: {
          created_at: string
          crop_name: string
          farm_location: string
          farmer_id: string
          harvest_date: string
          id: string
          inspection_date: string | null
          inspection_notes: string | null
          inspector_id: string | null
          is_available_for_sale: boolean
          is_sold: boolean
          quality_grade: string | null
          quantity: number
          sold_date: string | null
          sold_price: number | null
          sold_to_distributor_id: string | null
          updated_at: string
          verification_status: string
        }
        Insert: {
          created_at?: string
          crop_name: string
          farm_location: string
          farmer_id: string
          harvest_date: string
          id?: string
          inspection_date?: string | null
          inspection_notes?: string | null
          inspector_id?: string | null
          is_available_for_sale?: boolean
          is_sold?: boolean
          quality_grade?: string | null
          quantity: number
          sold_date?: string | null
          sold_price?: number | null
          sold_to_distributor_id?: string | null
          updated_at?: string
          verification_status?: string
        }
        Update: {
          created_at?: string
          crop_name?: string
          farm_location?: string
          farmer_id?: string
          harvest_date?: string
          id?: string
          inspection_date?: string | null
          inspection_notes?: string | null
          inspector_id?: string | null
          is_available_for_sale?: boolean
          is_sold?: boolean
          quality_grade?: string | null
          quantity?: number
          sold_date?: string | null
          sold_price?: number | null
          sold_to_distributor_id?: string | null
          updated_at?: string
          verification_status?: string
        }
        Relationships: []
      }
      distributor_inventory: {
        Row: {
          acquired_date: string
          batch_id: string
          created_at: string
          distributor_id: string
          id: string
          purchase_price: number
          quantity_available: number
          selling_price_per_kg: number
          updated_at: string
        }
        Insert: {
          acquired_date?: string
          batch_id: string
          created_at?: string
          distributor_id: string
          id?: string
          purchase_price: number
          quantity_available: number
          selling_price_per_kg: number
          updated_at?: string
        }
        Update: {
          acquired_date?: string
          batch_id?: string
          created_at?: string
          distributor_id?: string
          id?: string
          purchase_price?: number
          quantity_available?: number
          selling_price_per_kg?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "distributor_inventory_batch_id_fkey"
            columns: ["batch_id"]
            isOneToOne: false
            referencedRelation: "batches"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          active_since: string | null
          business_license: string | null
          certification_body: string | null
          certifications: string[] | null
          company_name: string | null
          created_at: string
          email: string
          ethereum_wallet: string | null
          farm_location: string | null
          farm_size: number | null
          farming_experience: number | null
          full_name: string | null
          id: string
          inspector_id: string | null
          license_number: string | null
          phone: string | null
          role: string
          specializations: string[] | null
          store_address: string | null
          store_name: string | null
          store_type: string | null
          transportation_capacity: number | null
          updated_at: string
          user_id: string
          warehouse_locations: string[] | null
        }
        Insert: {
          active_since?: string | null
          business_license?: string | null
          certification_body?: string | null
          certifications?: string[] | null
          company_name?: string | null
          created_at?: string
          email: string
          ethereum_wallet?: string | null
          farm_location?: string | null
          farm_size?: number | null
          farming_experience?: number | null
          full_name?: string | null
          id?: string
          inspector_id?: string | null
          license_number?: string | null
          phone?: string | null
          role: string
          specializations?: string[] | null
          store_address?: string | null
          store_name?: string | null
          store_type?: string | null
          transportation_capacity?: number | null
          updated_at?: string
          user_id: string
          warehouse_locations?: string[] | null
        }
        Update: {
          active_since?: string | null
          business_license?: string | null
          certification_body?: string | null
          certifications?: string[] | null
          company_name?: string | null
          created_at?: string
          email?: string
          ethereum_wallet?: string | null
          farm_location?: string | null
          farm_size?: number | null
          farming_experience?: number | null
          full_name?: string | null
          id?: string
          inspector_id?: string | null
          license_number?: string | null
          phone?: string | null
          role?: string
          specializations?: string[] | null
          store_address?: string | null
          store_name?: string | null
          store_type?: string | null
          transportation_capacity?: number | null
          updated_at?: string
          user_id?: string
          warehouse_locations?: string[] | null
        }
        Relationships: []
      }
      retailer_purchases: {
        Row: {
          batch_id: string
          created_at: string
          distributor_id: string
          id: string
          inventory_id: string
          price_per_kg: number
          purchase_date: string
          quantity_purchased: number
          retailer_id: string
          total_cost: number
        }
        Insert: {
          batch_id: string
          created_at?: string
          distributor_id: string
          id?: string
          inventory_id: string
          price_per_kg: number
          purchase_date?: string
          quantity_purchased: number
          retailer_id: string
          total_cost: number
        }
        Update: {
          batch_id?: string
          created_at?: string
          distributor_id?: string
          id?: string
          inventory_id?: string
          price_per_kg?: number
          purchase_date?: string
          quantity_purchased?: number
          retailer_id?: string
          total_cost?: number
        }
        Relationships: [
          {
            foreignKeyName: "retailer_purchases_batch_id_fkey"
            columns: ["batch_id"]
            isOneToOne: false
            referencedRelation: "batches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "retailer_purchases_inventory_id_fkey"
            columns: ["inventory_id"]
            isOneToOne: false
            referencedRelation: "distributor_inventory"
            referencedColumns: ["id"]
          },
        ]
      }
      user_revenue: {
        Row: {
          amount: number
          created_at: string
          currency: string
          id: string
          source: string | null
          transaction_date: string
          user_id: string
        }
        Insert: {
          amount?: number
          created_at?: string
          currency?: string
          id?: string
          source?: string | null
          transaction_date?: string
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          currency?: string
          id?: string
          source?: string | null
          transaction_date?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      handle_distributor_purchase: {
        Args: {
          p_batch_id: string
          p_distributor_id: string
          p_purchase_price: number
          p_selling_price_per_kg: number
        }
        Returns: undefined
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
