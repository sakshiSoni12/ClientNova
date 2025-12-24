-- ==============================================================================
-- ClientNova Strict Schema Initialization
-- ==============================================================================

-- 1. Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Create Gatekeeper Table: allowed_team_ids
CREATE TABLE IF NOT EXISTS public.allowed_team_ids (
    team_member_id text PRIMARY KEY,
    role text NOT NULL CHECK (role IN ('admin', 'team_member')),
    used boolean DEFAULT false,
    created_at timestamptz DEFAULT now()
);

-- 3. Create Profiles Table
CREATE TABLE IF NOT EXISTS public.profiles (
    id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email text UNIQUE NOT NULL,
    team_member_id text UNIQUE NOT NULL,
    role text NOT NULL CHECK (role IN ('admin', 'team_member')),
    status text DEFAULT 'active' CHECK (status IN ('active', 'disabled')),
    full_name text,
    avatar_url text,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    
    -- Constraint: team_member_id must exist in allowed_team_ids logic (enforced via application/trigger)
    CONSTRAINT fk_team_id FOREIGN KEY (team_member_id) REFERENCES public.allowed_team_ids(team_member_id)
);

-- 4. Create Approval Requests Table
CREATE TABLE IF NOT EXISTS public.approval_requests (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    request_type text NOT NULL CHECK (request_type IN ('ADD', 'EDIT', 'DELETE')),
    entity_type text NOT NULL CHECK (entity_type IN ('client', 'project', 'file', 'social')),
    entity_id uuid, -- Can be NULL for ADD requests
    requested_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
    data_payload jsonb DEFAULT '{}'::jsonb,
    current_data_snapshot jsonb DEFAULT '{}'::jsonb,
    status text DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    admin_note text,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- 5. Row Level Security (RLS)
ALTER TABLE public.allowed_team_ids ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.approval_requests ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Profiles: Everyone can read basic info, only self can update specific fields (or admin)
CREATE POLICY "Public profiles are viewable by everyone" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Approval Requests:
CREATE POLICY "Team view own requests" ON public.approval_requests FOR SELECT USING (requested_by = auth.uid());
CREATE POLICY "Team create requests" ON public.approval_requests FOR INSERT WITH CHECK (auth.uid() = requested_by);
-- Admin has full access (handled by is_admin function check mostly, or specific admin policy)
CREATE POLICY "Admins have full access to approvals" ON public.approval_requests FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

-- 6. Trigger: Handle New User & Enforce Gatekeeper
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
DECLARE
    allow_record public.allowed_team_ids%ROWTYPE;
BEGIN
    -- 1. Check if provided team_member_id exists in allowed_team_ids AND is unused
    SELECT * INTO allow_record
    FROM public.allowed_team_ids
    WHERE team_member_id = new.raw_user_meta_data->>'team_member_id'
      AND used = false;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Invalid or already used Team Member ID';
    END IF;

    -- 2. Insert into profiles
    INSERT INTO public.profiles (id, email, team_member_id, role, full_name, status)
    VALUES (
        new.id,
        new.email,
        allow_record.team_member_id,
        allow_record.role, -- Inherit role from the allow list
        new.raw_user_meta_data->>'full_name',
        'active'
    );

    -- 3. Mark ID as used
    UPDATE public.allowed_team_ids
    SET used = true
    WHERE team_member_id = allow_record.team_member_id;

    RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Bind trigger to auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();


-- 7. RPC: Validate Team ID (For UI pre-check only)
CREATE OR REPLACE FUNCTION public.validate_team_id(input_team_id text)
RETURNS jsonb AS $$
DECLARE
    found_role text;
BEGIN
    SELECT role INTO found_role
    FROM public.allowed_team_ids
    WHERE team_member_id = input_team_id AND used = false;
    
    IF found_role IS NOT NULL THEN
        RETURN jsonb_build_object('success', true, 'role', found_role);
    ELSE
        RETURN jsonb_build_object('success', false);
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- 8. RPC: Admin Succession (Demote Old, Promote New)
CREATE OR REPLACE FUNCTION public.promote_admin(new_admin_id uuid)
RETURNS void AS $$
DECLARE
    current_admin_id uuid;
BEGIN
    -- Check if executing user is Admin
    IF NOT EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin') THEN
        RAISE EXCEPTION 'Unauthorized: Only current admin can promote a successor';
    END IF;

    current_admin_id := auth.uid();

    -- Atomic Swap
    -- 1. Demote Self
    UPDATE public.profiles
    SET role = 'team_member'
    WHERE id = current_admin_id;

    -- 2. Promote New
    UPDATE public.profiles
    SET role = 'admin'
    WHERE id = new_admin_id;

    -- Optional: Log this event?
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 9. Seed Data (Initial Admin)
-- Insert ONE Admin ID to bootstrap certain access. User must sign up with this.
INSERT INTO public.allowed_team_ids (team_member_id, role, used)
VALUES ('ADMIN-MASTER', 'admin', false)
ON CONFLICT (team_member_id) DO NOTHING;

-- Insert some Team IDs for testing
INSERT INTO public.allowed_team_ids (team_member_id, role, used)
VALUES 
('TM-1001', 'team_member', false),
('TM-1002', 'team_member', false)
ON CONFLICT (team_member_id) DO NOTHING;
