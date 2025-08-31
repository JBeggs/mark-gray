-- Add available_images column to businesses table for image selection
-- Run this in your Supabase SQL Editor

ALTER TABLE public.businesses 
ADD COLUMN IF NOT EXISTS available_images JSONB DEFAULT '[]'::jsonb;

-- Update the column comment
COMMENT ON COLUMN public.businesses.available_images IS 'Array of all available images scraped from business website for selection';

-- Verify the column was added
SELECT column_name, data_type, column_default 
FROM information_schema.columns 
WHERE table_name = 'businesses' 
AND column_name = 'available_images';