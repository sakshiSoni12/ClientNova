-- 1. Add 'role' and 'team_member_id' to profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS role text DEFAULT 'team_member' CHECK (role IN ('admin', 'team_member')),
ADD COLUMN IF NOT EXISTS team_member_id text UNIQUE,
ADD COLUMN IF NOT EXISTS status text DEFAULT 'active' CHECK (status IN ('active', 'disabled'));

-- 2. Create 'approval_requests' table
CREATE TABLE IF NOT EXISTS public.approval_requests (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    request_type text NOT NULL CHECK (request_type IN ('ADD', 'EDIT', 'DELETE')),
    entity_type text NOT NULL CHECK (entity_type IN ('client', 'project', 'file')),
    entity_id uuid, -- Can be null for ADD requests
    requested_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
    data_payload jsonb DEFAULT '{}'::jsonb, -- Store the new data here
    current_data_snapshot jsonb DEFAULT '{}'::jsonb, -- Store old data for diffing
    status text DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    admin_note text,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- 3. Enable RLS
ALTER TABLE public.approval_requests ENABLE ROW LEVEL SECURITY;

-- 4. RLS Policies
-- Team members can view their own requests
CREATE POLICY "Team members can view their own requests" 
ON public.approval_requests FOR SELECT 
TO authenticated 
USING (requested_by = auth.uid() OR (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin');

-- Team members can create requests
CREATE POLICY "Team members can create requests" 
ON public.approval_requests FOR INSERT 
TO authenticated 
WITH CHECK (auth.uid() = requested_by);

-- Only admins can update status (Approve/Reject)
CREATE POLICY "Admins can update requests" 
ON public.approval_requests FOR UPDATE 
TO authenticated 
USING ((SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin');

-- 5. Helper function to check if user is admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
    AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
