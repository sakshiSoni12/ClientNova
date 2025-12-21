-- Add subscription_plan column to clients table
ALTER TABLE public.clients 
ADD COLUMN IF NOT EXISTS subscription_plan TEXT DEFAULT 'basic' CHECK (subscription_plan IN ('basic', 'pro', 'premium'));

-- Update existing clients to have basic plan by default
UPDATE public.clients 
SET subscription_plan = 'basic' 
WHERE subscription_plan IS NULL;
