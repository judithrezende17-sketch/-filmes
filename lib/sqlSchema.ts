export const SUPABASE_SQL_SCHEMA = `-- ==============================================================================
-- LUMINA CINECLUB - NOVO SCRIPT SQL COMPLETO & ATUALIZADO PARA O SUPABASE
-- ==============================================================================
-- PROJETO: https://ledxptmjvmabbqofrhex.supabase.co
-- INSTRUÇÕES DE EXECUÇÃO:
-- 1. Acesse o painel do seu Supabase: https://supabase.com/dashboard/project/ledxptmjvmabbqofrhex/sql
-- 2. Cole este script completo no editor SQL e clique no botão verde "Run" (ou aperte Ctrl+Enter).
-- 3. Dica importante para cadastros sem limites de envio de e-mail:
--    Vá em Authentication -> Providers -> Email e desmarque a opção "Confirm email".
-- ==============================================================================

-- 1. EXTENSÃO PARA GERAÇÃO DE UUIDS (OPCIONAL, SEGURO)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. TABELA DE PERFIS DE USUÁRIOS (public.profiles)
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

-- Adiciona novas colunas caso ainda não existam em tabelas criadas anteriormente
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS email TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS avatar TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS banner_url TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS bio TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS favorite_genre TEXT DEFAULT 'Ficção Científica';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS badge TEXT DEFAULT 'Cinéfilo Membro';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS joined_date TEXT DEFAULT 'Hoje';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS followers_count INTEGER DEFAULT 0;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS following_count INTEGER DEFAULT 0;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS password_hash TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT now();

-- 3. TABELA DE FILMES FAVORITOS (public.movies)
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

-- Adiciona novas colunas caso ainda não existam
ALTER TABLE public.movies ADD COLUMN IF NOT EXISTS backdrop_url TEXT;
ALTER TABLE public.movies ADD COLUMN IF NOT EXISTS favorite_scene TEXT;
ALTER TABLE public.movies ADD COLUMN IF NOT EXISTS badges TEXT[] DEFAULT '{}';
ALTER TABLE public.movies ADD COLUMN IF NOT EXISTS likes_count INTEGER DEFAULT 0;
ALTER TABLE public.movies ADD COLUMN IF NOT EXISTS liked_by TEXT[] DEFAULT '{}';
ALTER TABLE public.movies ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT now();

-- 4. TABELA DE RECADOS E COMENTÁRIOS DO MURAL (public.comments)
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

-- Adiciona novas colunas caso ainda não existam
ALTER TABLE public.comments ADD COLUMN IF NOT EXISTS movie_id TEXT;
ALTER TABLE public.comments ADD COLUMN IF NOT EXISTS movie_title TEXT;
ALTER TABLE public.comments ADD COLUMN IF NOT EXISTS likes INTEGER DEFAULT 0;
ALTER TABLE public.comments ADD COLUMN IF NOT EXISTS liked_by TEXT[] DEFAULT '{}';
ALTER TABLE public.comments ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT now();

-- ==============================================================================
-- 5. ATIVAÇÃO DE ROW LEVEL SECURITY (RLS)
-- ==============================================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.movies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;

-- ==============================================================================
-- 6. REMOÇÃO DE POLÍTICAS ANTIGAS (PREVINE ERRO 42710 "policy already exists")
-- ==============================================================================
DROP POLICY IF EXISTS "Perfis visíveis para todos" ON public.profiles;
DROP POLICY IF EXISTS "Perfis públicos são visíveis para todos" ON public.profiles;
DROP POLICY IF EXISTS "Gravar perfis" ON public.profiles;
DROP POLICY IF EXISTS "Permissao total para perfis" ON public.profiles;
DROP POLICY IF EXISTS "Qualquer um pode inserir ou atualizar perfil" ON public.profiles;

DROP POLICY IF EXISTS "Filmes visíveis para todos" ON public.movies;
DROP POLICY IF EXISTS "Inserir filmes" ON public.movies;
DROP POLICY IF EXISTS "Gravar filmes" ON public.movies;
DROP POLICY IF EXISTS "Permissao total para filmes" ON public.movies;

DROP POLICY IF EXISTS "Recados visíveis para todos" ON public.comments;
DROP POLICY IF EXISTS "Inserir recados" ON public.comments;
DROP POLICY IF EXISTS "Gravar recados" ON public.comments;
DROP POLICY IF EXISTS "Permissao total para recados" ON public.comments;

-- ==============================================================================
-- 7. CRIAÇÃO DE POLÍTICAS DE ACESSO PÚBLICO E GRAVAÇÃO COM WITH CHECK (TRUE)
-- ==============================================================================

-- PROFILES: Permite Leitura, Inserção, Atualização e Exclusão públicas
CREATE POLICY "Permissao total para perfis" ON public.profiles
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- MOVIES: Permite Leitura, Inserção, Atualização e Exclusão de filmes
CREATE POLICY "Permissao total para filmes" ON public.movies
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- COMMENTS: Permite Leitura, Inserção, Atualização e Exclusão de comentários
CREATE POLICY "Permissao total para recados" ON public.comments
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- ==============================================================================
-- 8. ÍNDICES DE PERFORMANCE PARA BUSCA RÁPIDA DE FILMES E USUÁRIOS
-- ==============================================================================
CREATE INDEX IF NOT EXISTS idx_profiles_username ON public.profiles(username);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);
CREATE INDEX IF NOT EXISTS idx_movies_user_id ON public.movies(user_id);
CREATE INDEX IF NOT EXISTS idx_comments_target_user_id ON public.comments(target_user_id);
CREATE INDEX IF NOT EXISTS idx_comments_author_id ON public.comments(author_id);

-- ==============================================================================
-- FIM DO SCRIPT - O Supabase exibirá o aviso nativo 'Success. No rows returned'
-- ==============================================================================
`;
