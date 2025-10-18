-- Supabase Database Schema for Nomadshood
-- This file contains the SQL commands to create all necessary tables in PostgreSQL
-- Run this in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- COLIVINGS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS public.colivings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    address TEXT NOT NULL,
    logo_url TEXT,
    main_image_url TEXT,
    video_url TEXT,
    whatsapp_link TEXT,
    website_url TEXT,
    tags TEXT[],
    data_ai_hint TEXT,
    country TEXT NOT NULL,
    country_code TEXT NOT NULL,
    city TEXT NOT NULL,
    region TEXT,
    coordinates JSONB,
    average_budget TEXT,
    budget_range JSONB,
    gallery TEXT[],
    coworking_access TEXT,
    amenities TEXT[],
    room_types JSONB[],
    vibe TEXT,
    contact JSONB,
    capacity INTEGER,
    minimum_stay TEXT,
    check_in TEXT,
    languages TEXT[],
    age_range TEXT,
    rating NUMERIC(3,2),
    reviews_count INTEGER,
    wifi_speed TEXT,
    climate TEXT,
    timezone TEXT,
    nearby_attractions TEXT[],
    transportation JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    status TEXT,
    brand TEXT,
    monthly_price NUMERIC(10,2) NOT NULL DEFAULT 0,
    has_private_bathroom BOOLEAN,
    has_coworking BOOLEAN,
    email TEXT,
    phone TEXT,
    currency TEXT,
    min_price NUMERIC(10,2),
    cover_image TEXT,
    logo TEXT,
    youtube_video_link TEXT,
    flag_url TEXT,
    flag_code TEXT
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_colivings_country_code ON public.colivings(country_code);
CREATE INDEX IF NOT EXISTS idx_colivings_country ON public.colivings(country);
CREATE INDEX IF NOT EXISTS idx_colivings_city ON public.colivings(city);
CREATE INDEX IF NOT EXISTS idx_colivings_status ON public.colivings(status);

-- =====================================================
-- COLIVING NEARBY PLACES TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS public.coliving_nearby_places (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    coliving_id TEXT NOT NULL,
    coliving_name TEXT,
    coliving_city TEXT,
    coliving_country TEXT,
    coliving_website TEXT,
    coliving_location JSONB,
    nearby_places JSONB,
    summary JSONB,
    metadata JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for coliving_id lookups
CREATE INDEX IF NOT EXISTS idx_nearby_places_coliving_id ON public.coliving_nearby_places(coliving_id);

-- =====================================================
-- COLIVING REVIEWS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS public.coliving_reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    coliving_id TEXT NOT NULL,
    coliving_name TEXT,
    coliving_city TEXT,
    coliving_country TEXT,
    coliving_website TEXT,
    google_place_id TEXT,
    google_name TEXT,
    google_address TEXT,
    google_rating NUMERIC(3,2),
    google_total_ratings INTEGER,
    google_website TEXT,
    google_phone TEXT,
    total_reviews INTEGER,
    recent_reviews_count INTEGER,
    average_sentiment NUMERIC(5,4),
    reviews JSONB[] NOT NULL DEFAULT '{}',
    crawled_at TIMESTAMPTZ,
    api_status TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for coliving_id lookups
CREATE INDEX IF NOT EXISTS idx_reviews_coliving_id ON public.coliving_reviews(coliving_id);

-- =====================================================
-- COUNTRIES TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS public.countries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    cover_image TEXT,
    flag TEXT,
    flag_image_url TEXT,
    continent TEXT,
    currency TEXT,
    timezone TEXT,
    popular_cities TEXT[],
    coliving_count INTEGER DEFAULT 0,
    source TEXT,
    community_count INTEGER DEFAULT 0,
    community_members INTEGER,
    community_cities TEXT[],
    community_platforms TEXT[],
    communities JSONB[] NOT NULL DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for country code
CREATE INDEX IF NOT EXISTS idx_countries_code ON public.countries(code);

-- =====================================================
-- MAIL SUBSCRIBER TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS public.mail_subscriber (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email TEXT NOT NULL UNIQUE,
    countries TEXT[] NOT NULL,
    language TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    payment_status TEXT DEFAULT 'pending',
    payment_id TEXT,
    active BOOLEAN DEFAULT false
);

-- Create index for email lookups
CREATE INDEX IF NOT EXISTS idx_mail_subscriber_email ON public.mail_subscriber(email);
CREATE INDEX IF NOT EXISTS idx_mail_subscriber_active ON public.mail_subscriber(active);

-- =====================================================
-- NOMAD VIDEOS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS public.nomad_videos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    thumbnail_url TEXT NOT NULL,
    youtube_url TEXT NOT NULL,
    view_count INTEGER DEFAULT 0,
    like_count INTEGER DEFAULT 0,
    comment_count INTEGER DEFAULT 0,
    duration INTEGER DEFAULT 0,
    published_at TIMESTAMPTZ NOT NULL,
    destination TEXT,
    data_ai_hint TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for destination
CREATE INDEX IF NOT EXISTS idx_nomad_videos_destination ON public.nomad_videos(destination);

-- =====================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================
-- Enable RLS on all tables
ALTER TABLE public.colivings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coliving_nearby_places ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coliving_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.countries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mail_subscriber ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.nomad_videos ENABLE ROW LEVEL SECURITY;

-- Allow public read access (SELECT) to all tables
CREATE POLICY "Allow public read access on colivings" ON public.colivings FOR SELECT USING (true);
CREATE POLICY "Allow public read access on coliving_nearby_places" ON public.coliving_nearby_places FOR SELECT USING (true);
CREATE POLICY "Allow public read access on coliving_reviews" ON public.coliving_reviews FOR SELECT USING (true);
CREATE POLICY "Allow public read access on countries" ON public.countries FOR SELECT USING (true);
CREATE POLICY "Allow public read access on nomad_videos" ON public.nomad_videos FOR SELECT USING (true);

-- Allow public insert on mail_subscriber (for newsletter signup)
CREATE POLICY "Allow public insert on mail_subscriber" ON public.mail_subscriber FOR INSERT WITH CHECK (true);

-- =====================================================
-- FUNCTIONS AND TRIGGERS
-- =====================================================
-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add triggers to all tables with updated_at
CREATE TRIGGER update_colivings_updated_at BEFORE UPDATE ON public.colivings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_coliving_nearby_places_updated_at BEFORE UPDATE ON public.coliving_nearby_places FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_coliving_reviews_updated_at BEFORE UPDATE ON public.coliving_reviews FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_countries_updated_at BEFORE UPDATE ON public.countries FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_nomad_videos_updated_at BEFORE UPDATE ON public.nomad_videos FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- INITIAL DATA - SPAIN COUNTRY
-- =====================================================
-- Insert Spain as the primary country
INSERT INTO public.countries (code, name, flag, flag_image_url, continent, currency, timezone, communities)
VALUES (
    'ES',
    'Spain',
    '🇪🇸',
    '/flags/es.png',
    'Europe',
    'EUR',
    'Europe/Madrid',
    '{}'::JSONB[]
) ON CONFLICT (code) DO NOTHING;

COMMENT ON TABLE public.colivings IS 'Coliving spaces - currently focused on Spain (country_code = ES)';
COMMENT ON TABLE public.coliving_nearby_places IS 'Nearby places categorized by type for each coliving';
COMMENT ON TABLE public.coliving_reviews IS 'Google reviews and sentiment analysis for colivings';
COMMENT ON TABLE public.countries IS 'Country information with digital nomad communities';
COMMENT ON TABLE public.mail_subscriber IS 'Newsletter subscribers with country preferences';
COMMENT ON TABLE public.nomad_videos IS 'YouTube videos featuring destinations';
