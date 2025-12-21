-- Create profiles table
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  role TEXT DEFAULT 'member',
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "profiles_select_all" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "profiles_insert_own" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "profiles_update_own" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Create clients table
CREATE TABLE IF NOT EXISTS public.clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  company TEXT,
  industry TEXT,
  website TEXT,
  status TEXT DEFAULT 'active',
  notes TEXT,
  avatar_url TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;

CREATE POLICY "clients_select_authenticated" ON public.clients FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "clients_insert_authenticated" ON public.clients FOR INSERT WITH CHECK (auth.uid() = created_by);
CREATE POLICY "clients_update_authenticated" ON public.clients FOR UPDATE USING (auth.uid() IS NOT NULL);
CREATE POLICY "clients_delete_authenticated" ON public.clients FOR DELETE USING (auth.uid() IS NOT NULL);

-- Create projects table
CREATE TABLE IF NOT EXISTS public.projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID REFERENCES public.clients(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'planning',
  priority TEXT DEFAULT 'medium',
  start_date DATE,
  end_date DATE,
  budget DECIMAL(10, 2),
  progress INTEGER DEFAULT 0,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "projects_select_authenticated" ON public.projects FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "projects_insert_authenticated" ON public.projects FOR INSERT WITH CHECK (auth.uid() = created_by);
CREATE POLICY "projects_update_authenticated" ON public.projects FOR UPDATE USING (auth.uid() IS NOT NULL);
CREATE POLICY "projects_delete_authenticated" ON public.projects FOR DELETE USING (auth.uid() IS NOT NULL);

-- Create social_accounts table
CREATE TABLE IF NOT EXISTS public.social_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID REFERENCES public.clients(id) ON DELETE CASCADE,
  platform TEXT NOT NULL,
  username TEXT,
  url TEXT,
  followers INTEGER DEFAULT 0,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.social_accounts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "social_accounts_select_authenticated" ON public.social_accounts FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "social_accounts_insert_authenticated" ON public.social_accounts FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "social_accounts_update_authenticated" ON public.social_accounts FOR UPDATE USING (auth.uid() IS NOT NULL);
CREATE POLICY "social_accounts_delete_authenticated" ON public.social_accounts FOR DELETE USING (auth.uid() IS NOT NULL);

-- Create files table
CREATE TABLE IF NOT EXISTS public.files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID REFERENCES public.clients(id) ON DELETE CASCADE,
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT,
  size BIGINT,
  url TEXT NOT NULL,
  uploaded_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.files ENABLE ROW LEVEL SECURITY;

CREATE POLICY "files_select_authenticated" ON public.files FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "files_insert_authenticated" ON public.files FOR INSERT WITH CHECK (auth.uid() = uploaded_by);
CREATE POLICY "files_delete_authenticated" ON public.files FOR DELETE USING (auth.uid() IS NOT NULL);

-- Create team_members table
CREATE TABLE IF NOT EXISTS public.team_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
  role TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "team_members_select_authenticated" ON public.team_members FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "team_members_insert_authenticated" ON public.team_members FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "team_members_delete_authenticated" ON public.team_members FOR DELETE USING (auth.uid() IS NOT NULL);
