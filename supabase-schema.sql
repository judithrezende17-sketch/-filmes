-- ===============================================================
-- LUMINA CINECLUB - SQL SCHEMA PARA O SUPABASE (SEGURO E REPETÍVEL)
-- Execute este script no SQL Editor do seu projeto Supabase
-- (https://app.supabase.com/project/_/sql)
-- ===============================================================

-- 1. Tabela de Perfis de Usuários (Profiles)
CREATE TABLE IF NOT EXISTS public.profiles (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  username TEXT NOT NULL UNIQUE,
  email TEXT,
  avatar TEXT,
  banner_url TEXT,
  bio TEXT,
  favorite_genre TEXT DEFAULT 'Ficção Científica',
  badge TEXT DEFAULT 'Cinéfilo Membro',
  joined_date TEXT DEFAULT 'Hoje',
  followers_count INTEGER DEFAULT 0,
  following_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Tabela de Filmes Favoritos (Movies)
CREATE TABLE IF NOT EXISTS public.movies (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  year INTEGER,
  director TEXT NOT NULL,
  genre TEXT NOT NULL,
  poster_url TEXT NOT NULL,
  backdrop_url TEXT,
  rating NUMERIC(3,1) NOT NULL DEFAULT 9.0,
  review TEXT NOT NULL,
  favorite_scene TEXT,
  badges TEXT[] DEFAULT '{}',
  likes_count INTEGER DEFAULT 0,
  liked_by TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Tabela de Recados e Comentários (Comments)
CREATE TABLE IF NOT EXISTS public.comments (
  id TEXT PRIMARY KEY,
  target_user_id TEXT NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  movie_id TEXT,
  movie_title TEXT,
  author_id TEXT NOT NULL,
  author_name TEXT NOT NULL,
  author_username TEXT NOT NULL,
  author_avatar TEXT NOT NULL,
  content TEXT NOT NULL,
  likes INTEGER DEFAULT 0,
  liked_by TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ===============================================================
-- ATIVAR ROW LEVEL SECURITY (RLS)
-- ===============================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.movies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;

-- ===============================================================
-- REMOVER POLÍTICAS ANTIGAS SE EXISTIREM (EVITA ERRO 42710)
-- ===============================================================

DROP POLICY IF EXISTS "Perfis visíveis para todos" ON public.profiles;
DROP POLICY IF EXISTS "Perfis públicos são visíveis para todos" ON public.profiles;
DROP POLICY IF EXISTS "Gravar perfis" ON public.profiles;
DROP POLICY IF EXISTS "Qualquer um pode inserir ou atualizar perfil" ON public.profiles;

DROP POLICY IF EXISTS "Filmes visíveis para todos" ON public.movies;
DROP POLICY IF EXISTS "Inserir filmes" ON public.movies;
DROP POLICY IF EXISTS "Gravar filmes" ON public.movies;

DROP POLICY IF EXISTS "Recados visíveis para todos" ON public.comments;
DROP POLICY IF EXISTS "Inserir recados" ON public.comments;
DROP POLICY IF EXISTS "Gravar recados" ON public.comments;

-- ===============================================================
-- CRIAR POLÍTICAS DE ACESSO
-- ===============================================================

-- Perfis: Leitura pública e gravação
CREATE POLICY "Perfis visíveis para todos" ON public.profiles 
  FOR SELECT USING (true);

CREATE POLICY "Gravar perfis" ON public.profiles 
  FOR ALL USING (true);

-- Filmes: Leitura pública e gravação
CREATE POLICY "Filmes visíveis para todos" ON public.movies 
  FOR SELECT USING (true);

CREATE POLICY "Gravar filmes" ON public.movies 
  FOR ALL USING (true);

-- Recados: Leitura pública e gravação
CREATE POLICY "Recados visíveis para todos" ON public.comments 
  FOR SELECT USING (true);

CREATE POLICY "Gravar recados" ON public.comments 
  FOR ALL USING (true);
