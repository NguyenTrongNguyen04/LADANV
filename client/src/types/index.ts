export type SkinType = 'oily' | 'dry' | 'combination' | 'sensitive' | 'normal';

export type SafetyRating = 'good' | 'neutral' | 'caution' | 'avoid';

export type ProductStatus = 'wishlist' | 'using' | 'discontinued';

export type SkinCondition = 'excellent' | 'good' | 'fair' | 'poor';

export type AlertType = 'ingredient_warning' | 'reminder' | 'duplicate_function' | 'product_alert';

export type AlertSeverity = 'info' | 'warning' | 'danger';

export interface UserProfile {
  id: string;
  user_id: string;
  skin_type: SkinType | null;
  skin_concerns: string[];
  allergies: string[];
  health_conditions: string[];
  goals: string[];
  date_of_birth: string | null;
  gender: string | null;
  created_at: string;
  updated_at: string;
}

export interface Ingredient {
  id: string;
  name: string;
  name_vi: string | null;
  description: string | null;
  functions: string[];
  safety_rating: SafetyRating;
  concerns: string[];
  suitable_for: string[];
  avoid_for: string[];
  concentration_notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface Product {
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
}

export interface ProductWithIngredients extends Product {
  ingredients?: Array<Ingredient & { position: number; concentration?: string }>;
  ratings?: ProductRating[];
}

export interface ProductRating {
  id: string;
  product_id: string;
  skin_type: string;
  rating: number;
  notes: string | null;
}

export interface UserProduct {
  id: string;
  user_id: string;
  product_id: string;
  status: ProductStatus;
  started_at: string | null;
  notes: string | null;
  created_at: string;
  product?: Product;
}

export interface SkinJournalEntry {
  id: string;
  user_id: string;
  entry_date: string;
  skin_condition: SkinCondition | null;
  notes: string | null;
  photo_url: string | null;
  reactions: string[];
  products_used: string[];
  created_at: string;
}

export interface ProductReview {
  id: string;
  user_id: string;
  product_id: string;
  rating: number;
  review_text: string | null;
  effectiveness_rating: number;
  days_used: number;
  verified: boolean;
  created_at: string;
  updated_at: string;
}

export interface UserAlert {
  id: string;
  user_id: string;
  alert_type: AlertType;
  severity: AlertSeverity;
  title: string;
  message: string;
  related_product_id: string | null;
  related_ingredient_id: string | null;
  is_read: boolean;
  created_at: string;
}
