-- Add new columns to clients table
ALTER TABLE public.clients 
ADD COLUMN IF NOT EXISTS visit_card_image text,
ADD COLUMN IF NOT EXISTS studio text,
ADD COLUMN IF NOT EXISTS affiliates text;

-- Optional: Add check constraints if strict validation is needed, but text is text for now.
-- Verify columns
-- SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'clients';
