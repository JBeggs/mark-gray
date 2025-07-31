-- Enable Row Level Security
-- Note: JWT secret is handled by Supabase automatically

-- Create custom types
CREATE TYPE user_role AS ENUM ('user', 'admin', 'editor');
CREATE TYPE article_status AS ENUM ('draft', 'published', 'archived');
CREATE TYPE ad_status AS ENUM ('active', 'paused', 'expired');

-- Users table (extends Supabase auth.users)
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  role user_role DEFAULT 'user',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Categories for articles
CREATE TABLE public.categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  color TEXT DEFAULT '#3B82F6',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Articles/News table
CREATE TABLE public.articles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  excerpt TEXT,
  content TEXT NOT NULL,
  featured_image_url TEXT,
  author_id UUID REFERENCES public.profiles(id) NOT NULL,
  category_id UUID REFERENCES public.categories(id),
  status article_status DEFAULT 'draft',
  views INTEGER DEFAULT 0,
  published_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Businesses for advertising
CREATE TABLE public.businesses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  website_url TEXT,
  phone TEXT,
  email TEXT,
  address TEXT,
  logo_url TEXT,
  owner_id UUID REFERENCES public.profiles(id) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Advertisements
CREATE TABLE public.advertisements (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  business_id UUID REFERENCES public.businesses(id) NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  image_url TEXT NOT NULL,
  link_url TEXT,
  position TEXT NOT NULL, -- 'header', 'sidebar', 'content', 'footer'
  status ad_status DEFAULT 'active',
  impressions INTEGER DEFAULT 0,
  clicks INTEGER DEFAULT 0,
  start_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  end_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Audio recordings for voice-to-text
CREATE TABLE public.audio_recordings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) NOT NULL,
  audio_url TEXT NOT NULL,
  transcription TEXT,
  duration_seconds INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Content imports
CREATE TABLE public.content_imports (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) NOT NULL,
  filename TEXT NOT NULL,
  file_url TEXT NOT NULL,
  imported_articles INTEGER DEFAULT 0,
  status TEXT DEFAULT 'pending', -- 'pending', 'processing', 'completed', 'failed'
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.businesses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.advertisements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audio_recordings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content_imports ENABLE ROW LEVEL SECURITY;

-- Row Level Security Policies

-- Profiles policies
CREATE POLICY "Users can view all profiles" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Categories policies (public read, admin write)
CREATE POLICY "Anyone can view categories" ON public.categories FOR SELECT USING (true);
CREATE POLICY "Admins can manage categories" ON public.categories FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'editor')
  )
);

-- Articles policies
CREATE POLICY "Anyone can view published articles" ON public.articles FOR SELECT USING (
  status = 'published' OR 
  author_id = auth.uid() OR
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'editor')
  )
);

CREATE POLICY "Authors can manage own articles" ON public.articles FOR ALL USING (
  author_id = auth.uid() OR
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'editor')
  )
);

-- Businesses policies
CREATE POLICY "Anyone can view businesses" ON public.businesses FOR SELECT USING (true);
CREATE POLICY "Owners can manage own business" ON public.businesses FOR ALL USING (
  owner_id = auth.uid() OR
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
  )
);

-- Advertisements policies
CREATE POLICY "Anyone can view active ads" ON public.advertisements FOR SELECT USING (
  status = 'active' OR
  EXISTS (
    SELECT 1 FROM public.businesses b 
    WHERE b.id = business_id AND b.owner_id = auth.uid()
  ) OR
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
  )
);

CREATE POLICY "Business owners can manage own ads" ON public.advertisements FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.businesses b 
    WHERE b.id = business_id AND b.owner_id = auth.uid()
  ) OR
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
  )
);

-- Audio recordings policies
CREATE POLICY "Users can manage own recordings" ON public.audio_recordings FOR ALL USING (
  user_id = auth.uid() OR
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
  )
);

-- Content imports policies
CREATE POLICY "Users can manage own imports" ON public.content_imports FOR ALL USING (
  user_id = auth.uid() OR
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'editor')
  )
);

-- Functions and triggers

-- Function to handle user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url)
  VALUES (new.id, new.email, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user creation
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at();
CREATE TRIGGER update_articles_updated_at BEFORE UPDATE ON public.articles FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at();
CREATE TRIGGER update_businesses_updated_at BEFORE UPDATE ON public.businesses FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at();
CREATE TRIGGER update_advertisements_updated_at BEFORE UPDATE ON public.advertisements FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at();
CREATE TRIGGER update_content_imports_updated_at BEFORE UPDATE ON public.content_imports FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at();

-- Insert default categories
INSERT INTO public.categories (name, slug, description, color) VALUES
('Local News', 'local-news', 'Breaking news and updates from our community', '#EF4444'),
('Business', 'business', 'Local business news and updates', '#10B981'),
('Events', 'events', 'Community events and gatherings', '#8B5CF6'),
('Sports', 'sports', 'Local sports teams and activities', '#F59E0B'),
('Politics', 'politics', 'Local government and political news', '#3B82F6'),
('Community', 'community', 'Community stories and human interest pieces', '#EC4899');

-- Create storage buckets
INSERT INTO storage.buckets (id, name, public) VALUES 
('articles', 'articles', true),
('advertisements', 'advertisements', true),
('audio', 'audio', false),
('imports', 'imports', false);

-- Storage policies
CREATE POLICY "Anyone can view article images" ON storage.objects FOR SELECT USING (bucket_id = 'articles');
CREATE POLICY "Anyone can view ad images" ON storage.objects FOR SELECT USING (bucket_id = 'advertisements');
CREATE POLICY "Authenticated users can upload article images" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'articles' AND auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can upload ad images" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'advertisements' AND auth.role() = 'authenticated');
CREATE POLICY "Users can manage own audio files" ON storage.objects FOR ALL USING (bucket_id = 'audio' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Users can upload import files" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'imports' AND auth.role() = 'authenticated'); 