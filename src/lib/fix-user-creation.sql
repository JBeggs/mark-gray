-- Fix User Creation Issue
-- This fixes the database trigger that handles new user creation

-- ======================================================================
-- USER CREATION TRIGGER FIX
-- ======================================================================

-- Drop existing trigger and function if they exist
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Create improved handle_new_user function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  -- Insert into profiles with all required fields
  INSERT INTO public.profiles (
    id,
    email,
    full_name,
    avatar_url,
    role,
    username,
    bio,
    social_links,
    preferences,
    is_verified,
    created_at,
    updated_at
  )
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', NULL),
    COALESCE((NEW.raw_user_meta_data->>'role')::user_role, 'user'),
    NULL, -- username will be set later
    NULL, -- bio will be set later
    '{}', -- empty social_links
    '{}', -- empty preferences
    false, -- not verified by default
    NOW(),
    NOW()
  );
  
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log the error but don't fail the user creation
    RAISE WARNING 'Error creating profile for user %: %', NEW.id, SQLERRM;
    RETURN NEW;
END;
$$;

-- Create the trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ======================================================================
-- ENSURE PROFILE TABLE HAS CORRECT STRUCTURE
-- ======================================================================

-- Make sure all columns exist with proper defaults
ALTER TABLE public.profiles 
  ALTER COLUMN username DROP NOT NULL,
  ALTER COLUMN bio DROP NOT NULL,
  ALTER COLUMN social_links SET DEFAULT '{}',
  ALTER COLUMN preferences SET DEFAULT '{}',
  ALTER COLUMN is_verified SET DEFAULT false;

-- Add any missing indexes
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_is_verified ON public.profiles(is_verified);
CREATE INDEX IF NOT EXISTS idx_profiles_username ON public.profiles(username) WHERE username IS NOT NULL;

-- ======================================================================
-- ENHANCED RLS POLICIES FOR PROFILES
-- ======================================================================

-- Drop existing policies
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;

-- Create new comprehensive policies
CREATE POLICY "Anyone can view public profile data" ON profiles
  FOR SELECT USING (true);

CREATE POLICY "Users can insert their own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Admins can update any profile" ON profiles
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

-- ======================================================================
-- FIX EXISTING DATA
-- ======================================================================

-- Update any existing profiles that might have NULL values
UPDATE public.profiles SET
  social_links = COALESCE(social_links, '{}'),
  preferences = COALESCE(preferences, '{}'),
  is_verified = COALESCE(is_verified, false),
  updated_at = NOW()
WHERE social_links IS NULL 
   OR preferences IS NULL 
   OR is_verified IS NULL;