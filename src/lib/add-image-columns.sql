-- Add image URL columns to businesses table
-- Run this in your Supabase SQL Editor

ALTER TABLE public.businesses 
ADD COLUMN IF NOT EXISTS logo_url TEXT,
ADD COLUMN IF NOT EXISTS cover_image_url TEXT;

-- Verify columns were added
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'businesses' 
AND column_name IN ('logo_url', 'cover_image_url');