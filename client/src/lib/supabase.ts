import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Database = {
  public: {
    Tables: {
      user_profiles: {
        Row: {
          id: string;
          user_id: string;
          skin_type: 'oily' | 'dry' | 'combination' | 'sensitive' | 'normal' | null;
          skin_concerns: string[];
          allergies: string[];
          health_conditions: string[];
          goals: string[];
          date_of_birth: string | null;
          gender: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['user_profiles']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['user_profiles']['Insert']>;
      };
      products: {
        Row: {
          id: string;
          barcode: string | null;
          name: string;
          brand: string | null;
          category: string | null;
          price: number | null;
          currency: string;
          image_url: string | null;
          description: string | null;
          full_ingredients_list: string | null;
          created_at: string;
          updated_at: string;
        };
      };
      ingredients: {
        Row: {
          id: string;
          name: string;
          name_vi: string | null;
          description: string | null;
          functions: string[];
          safety_rating: 'good' | 'neutral' | 'caution' | 'avoid';
          concerns: string[];
          suitable_for: string[];
          avoid_for: string[];
          concentration_notes: string | null;
          created_at: string;
          updated_at: string;
        };
      };
    };
  };
};
