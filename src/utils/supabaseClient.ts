import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

// Supabase configuration
const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_ANON_KEY!;

// Create Supabase client
export const supabase = createClient(supabaseUrl, supabaseKey);

// Database interfaces
export interface Repository {
  id?: number;
  full_name: string;
  description?: string;
  language?: string;
  topics?: string[];
  created_at?: string;
  updated_at?: string;
}

export interface TrendRecord {
  id?: number;
  repository_id: number;
  trend_date: string;
  stars: number;
  forks: number;
  metadata?: Record<string, any>;
  recorded_at?: string;
}

// GitHub trending data interface (from the current code)
export interface GitHubTrendingItem {
  title: string;
  href: string;
  language: string;
  star: string;
  fork: string;
  description: string;
}