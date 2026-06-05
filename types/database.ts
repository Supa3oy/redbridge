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
          email_subscribed: boolean;
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
          email_subscribed?: boolean;
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
          email_subscribed?: boolean;
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
      intelligence_reports: {
        Row: {
          id: string;
          user_id: string;
          brand_name: string;
          industry: string;
          result: Json;
          created_at: string;
        };
        Insert: {
          user_id: string;
          brand_name: string;
          industry: string;
          result: Json;
        };
        Update: { result?: Json };
        Relationships: [];
      };
      shoot_briefs: {
        Row: {
          id: string;
          user_id: string;
          brand_name: string;
          product_name: string;
          angle: string;
          result: Json;
          created_at: string;
        };
        Insert: {
          user_id: string;
          brand_name: string;
          product_name: string;
          angle: string;
          result: Json;
        };
        Update: {
          result?: Json;
        };
        Relationships: [];
      };
      email_logs: {
        Row: {
          id: string;
          user_id: string;
          email_type: string;
          sent_at: string;
          opened: boolean;
        };
        Insert: {
          user_id: string;
          email_type?: string;
          sent_at?: string;
          opened?: boolean;
        };
        Update: {
          opened?: boolean;
        };
        Relationships: [];
      };
      saved_comments: {
        Row: {
          id: string;
          user_id: string;
          comments: Json;
          replies: Json;
          created_at: string;
        };
        Insert: {
          user_id: string;
          comments: Json;
          replies: Json;
        };
        Update: {
          comments?: Json;
          replies?: Json;
        };
        Relationships: [];
      };
      saved_inbox: {
        Row: {
          id: string;
          user_id: string;
          messages: Json;
          replies: Json;
          created_at: string;
        };
        Insert: {
          user_id: string;
          messages: Json;
          replies: Json;
        };
        Update: {
          messages?: Json;
          replies?: Json;
        };
        Relationships: [];
      };
      post_metrics: {
        Row: {
          id: string;
          user_id: string;
          post_title: string;
          likes: number;
          comments: number;
          shares: number;
          saves: number;
          posted_at: string;
          created_at: string;
        };
        Insert: {
          user_id: string;
          post_title: string;
          likes: number;
          comments: number;
          shares: number;
          saves: number;
          posted_at: string;
        };
        Update: {
          post_title?: string;
          likes?: number;
          comments?: number;
          shares?: number;
          saves?: number;
          posted_at?: string;
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

export interface IntelligenceReport {
  brandPerceptionScore: number;
  culturalTranslationGap: {
    headline: string;
    description: string;
    gaps: Array<{
      aspect: string;
      australian: string;
      chinese: string;
      recommendation: string;
    }>;
  };
  marketOpportunity: {
    score: number;
    headline: string;
    description: string;
    segments: string[];
  };
  xhsPositioning: {
    recommendedNarrative: string;
    toneOfVoice: string;
    visualStyle: string;
    contentPillars: string[];
  };
  consumerInsights: Array<{ insight: string; implication: string }>;
  quickWins: string[];
}

export interface ShootBriefResult {
  sceneDescription: string;
  propsList: string[];
  colourPalette: Array<{ hex: string; name: string }>;
  modelDirection: string | null;
  cameraComposition: string;
  lightingDirection: string;
  captionHooks: string[];
  xhsTips: string[];
  referenceDescription: string;
}

export interface SavedShootBrief {
  id: string;
  brand_name: string;
  product_name: string;
  angle: string;
  result: ShootBriefResult;
  created_at: string;
}

export type CommentSentiment = "Question" | "Compliment" | "Complaint" | "Purchase Intent";

export interface CommentItem {
  id: string;
  original: string;
  translation: string;
  sentiment: CommentSentiment;
  reply: string | null;
}

export type InboxCategory =
  | "Price Inquiry"
  | "Shipping Question"
  | "Ingredient Question"
  | "Complaint"
  | "General Praise"
  | "Purchase Ready";

export type InboxPriority = "urgent" | "high" | "normal";

export interface InboxItem {
  id: string;
  original: string;
  translation: string;
  category: InboxCategory;
  priority: InboxPriority;
  reply: string | null;
}

export interface PostMetric {
  id: string;
  post_title: string;
  likes: number;
  comments: number;
  shares: number;
  saves: number;
  posted_at: string;
  created_at: string;
}

export interface PerformanceInsights {
  topInsight: string;
  bestContentType: string;
  bestPostingDay: string;
  recommendations: string[];
}
