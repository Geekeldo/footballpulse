import { createClient } from '@supabase/supabase-js';

// Placeholder pendant le build, vraies valeurs au runtime
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key';

// Client-side (browser) — uses anon key with RLS
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Server-side — uses service role key, bypasses RLS
export const supabaseAdmin = createClient(
  supabaseUrl,
  process.env.SUPABASE_SERVICE_ROLE_KEY || supabaseAnonKey,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

// ============================================
// DATABASE SCHEMA — Run this in Supabase SQL Editor
// ============================================
/*
-- Articles table (core content)
CREATE TABLE articles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  slug TEXT NOT NULL,
  lang TEXT NOT NULL DEFAULT 'fr' CHECK (lang IN ('fr', 'en', 'ar', 'es')),
  title TEXT NOT NULL,
  meta_description TEXT NOT NULL,
  excerpt TEXT NOT NULL,
  content TEXT NOT NULL,
  cover_image TEXT,
  category TEXT NOT NULL DEFAULT 'general',
  tags TEXT[] DEFAULT '{}',
  keywords TEXT[] DEFAULT '{}',
  schema_json JSONB,
  source_url TEXT,
  source_name TEXT,
  translation_group UUID,
  status TEXT DEFAULT 'published' CHECK (status IN ('draft', 'published', 'archived')),
  views INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  published_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(slug, lang)
);

-- Indexes for performance
CREATE INDEX idx_articles_lang ON articles(lang);
CREATE INDEX idx_articles_status ON articles(status);
CREATE INDEX idx_articles_category ON articles(category);
CREATE INDEX idx_articles_published_at ON articles(published_at DESC);
CREATE INDEX idx_articles_translation_group ON articles(translation_group);
CREATE INDEX idx_articles_slug_lang ON articles(slug, lang);
CREATE INDEX idx_articles_tags ON articles USING GIN(tags);
CREATE INDEX idx_articles_keywords ON articles USING GIN(keywords);

-- Analytics table
CREATE TABLE analytics (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  article_id UUID REFERENCES articles(id) ON DELETE CASCADE,
  page_views INTEGER DEFAULT 0,
  date DATE DEFAULT CURRENT_DATE,
  lang TEXT,
  referrer TEXT,
  country TEXT,
  UNIQUE(article_id, date)
);

CREATE INDEX idx_analytics_date ON analytics(date DESC);
CREATE INDEX idx_analytics_article ON analytics(article_id);

-- Social posts tracking
CREATE TABLE social_posts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  article_id UUID REFERENCES articles(id) ON DELETE CASCADE,
  platform TEXT NOT NULL CHECK (platform IN ('twitter', 'facebook', 'instagram')),
  post_id TEXT,
  post_url TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'posted', 'failed')),
  error_message TEXT,
  posted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_social_article ON social_posts(article_id);
CREATE INDEX idx_social_platform ON social_posts(platform);

-- Ad revenue tracking
CREATE TABLE ad_revenue (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  date DATE DEFAULT CURRENT_DATE UNIQUE,
  impressions INTEGER DEFAULT 0,
  clicks INTEGER DEFAULT 0,
  revenue_usd DECIMAL(10,4) DEFAULT 0,
  rpm DECIMAL(10,4) DEFAULT 0,
  source TEXT DEFAULT 'adsense'
);

-- Cron job log
CREATE TABLE cron_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  started_at TIMESTAMPTZ DEFAULT NOW(),
  finished_at TIMESTAMPTZ,
  articles_created INTEGER DEFAULT 0,
  status TEXT DEFAULT 'running',
  error TEXT,
  details JSONB
);

-- Function to increment views
CREATE OR REPLACE FUNCTION increment_views(article_slug TEXT, article_lang TEXT)
RETURNS void AS 
$$
BEGIN
  UPDATE articles SET views = views + 1
  WHERE slug = article_slug AND lang = article_lang;

  INSERT INTO analytics (article_id, page_views, date, lang)
  SELECT id, 1, CURRENT_DATE, lang FROM articles
  WHERE slug = article_slug AND lang = article_lang
  ON CONFLICT (article_id, date)
  DO UPDATE SET page_views = analytics.page_views + 1;
END;
$$
 LANGUAGE plpgsql;

-- RLS Policies
ALTER TABLE articles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can read published articles" ON articles
  FOR SELECT USING (status = 'published');

ALTER TABLE analytics ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can read analytics" ON analytics
  FOR SELECT USING (true);
*/

export type Article = {
  id: string;
  slug: string;
  lang: 'fr' | 'en' | 'ar' | 'es';
  title: string;
  meta_description: string;
  excerpt: string;
  content: string;
  cover_image: string | null;
  category: string;
  tags: string[];
  keywords: string[];
  schema_json: Record<string, unknown> | null;
  source_url: string | null;
  source_name: string | null;
  translation_group: string | null;
  status: 'draft' | 'published' | 'archived';
  views: number;
  created_at: string;
  updated_at: string;
  published_at: string;
};

export type SocialPost = {
  id: string;
  article_id: string;
  platform: 'twitter' | 'facebook' | 'instagram';
  post_id: string | null;
  post_url: string | null;
  status: 'pending' | 'posted' | 'failed';
  error_message: string | null;
  posted_at: string | null;
  created_at: string;
};