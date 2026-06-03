export type Json = string | number | boolean | null | { [key: string]: Json } | Json[];

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          plan: "free" | "pro" | "agency";
          stripe_customer_id: string | null;
          usage_count: number;
          usage_reset_at: string;
          created_at: string;
          onboarding_completed: boolean;
          brand_name: string | null;
          website_url: string | null;
          industry: string | null;
          target_audience: Json;
          selling_points: string | null;
        };
        Insert: {
          id: string;
          email: string;
          plan?: "free" | "pro" | "agency";
          stripe_customer_id?: string | null;
          usage_count?: number;
          usage_reset_at?: string;
          onboarding_completed?: boolean;
          brand_name?: string | null;
          website_url?: string | null;
          industry?: string | null;
          target_audience?: Json;
          selling_points?: string | null;
        };
        Update: {
          id?: string;
          email?: string;
          plan?: "free" | "pro" | "agency";
          stripe_customer_id?: string | null;
          usage_count?: number;
          usage_reset_at?: string;
          onboarding_completed?: boolean;
          brand_name?: string | null;
          website_url?: string | null;
          industry?: string | null;
          target_audience?: Json;
          selling_points?: string | null;
        };
        Relationships: [];
      };
      toolkits: {
        Row: {
          id: string;
          user_id: string;
          brand_name: string;
          result: Json;
          created_at: string;
        };
        Insert: {
          user_id: string;
          brand_name: string;
          result: Json;
        };
        Update: {
          user_id?: string;
          brand_name?: string;
          result?: Json;
        };
        Relationships: [];
      };
      toolkit_cache: {
        Row: {
          cache_key: string;
          result: Json;
          created_at: string;
        };
        Insert: {
          cache_key: string;
          result: Json;
          created_at?: string;
        };
        Update: {
          result?: Json;
          created_at?: string;
        };
        Relationships: [];
      };
      competitor_analyses: {
        Row: {
          id: string;
          user_id: string;
          competitor_name: string;
          industry: string | null;
          result: Json;
          created_at: string;
        };
        Insert: {
          user_id: string;
          competitor_name: string;
          industry?: string | null;
          result: Json;
        };
        Update: {
          user_id?: string;
          competitor_name?: string;
          industry?: string | null;
          result?: Json;
        };
        Relationships: [];
      };
      trends_cache: {
        Row: {
          industry: string;
          result: Json;
          updated_at: string;
        };
        Insert: {
          industry: string;
          result: Json;
          updated_at?: string;
        };
        Update: {
          result?: Json;
          updated_at?: string;
        };
        Relationships: [];
      };
      saved_trends: {
        Row: {
          id: string;
          user_id: string;
          industry: string;
          result: Json;
          created_at: string;
        };
        Insert: {
          user_id: string;
          industry: string;
          result: Json;
          created_at?: string;
        };
        Update: {
          result?: Json;
          created_at?: string;
        };
        Relationships: [];
      };
      saved_competitors: {
        Row: {
          id: string;
          user_id: string;
          competitor_name: string;
          industry: string | null;
          result: Json;
          created_at: string;
        };
        Insert: {
          user_id: string;
          competitor_name: string;
          industry?: string | null;
          result: Json;
          created_at?: string;
        };
        Update: {
          competitor_name?: string;
          industry?: string | null;
          result?: Json;
          created_at?: string;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}

export interface ToolkitResult {
  posts: PostIdea[];
  keywords: Keyword[];
  captions: Caption[];
}

export interface PostIdea {
  id: number;
  title: string;
  hook: string;
  format: string;
  tags: string[];
}

export interface Keyword {
  id: number;
  chinese: string;
  pinyin: string;
  english: string;
  heatScore: number;
  category: string;
  seasonalRelevance?: string;
}

export interface Caption {
  id: number;
  english: string;
  chinese: string;
  context: string;
}

export interface CompetitorResult {
  keywords: Keyword[];
  contentTone: {
    style: string;
    description: string;
    examples: string[];
  };
  contentAngles: Array<{
    id: number;
    title: string;
    description: string;
  }>;
  gapOpportunities: Array<{
    id: number;
    title: string;
    description: string;
    angle: string;
  }>;
}

export interface TrendItem {
  id: number;
  chinese: string;
  pinyin: string;
  english: string;
  direction: "rising" | "hot" | "new";
  description: string;
  industry: string;
}

export interface TrendsResult {
  trends: TrendItem[];
  updatedAt: string;
}

export interface SavedTrendRow {
  id: string;
  user_id: string;
  industry: string;
  result: Json;
  created_at: string;
}

export interface SavedCompetitorRow {
  id: string;
  user_id: string;
  competitor_name: string;
  industry: string | null;
  result: Json;
  created_at: string;
}
