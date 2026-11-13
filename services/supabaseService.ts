import { User as SupabaseAuthUser, Session, AuthChangeEvent } from '@supabase/supabase-js';
import { getSupabaseClient, isSupabaseConfigured } from '@/lib/supabase';
import { User, Movie, Comment } from '@/types';

const DEFAULT_AVATAR =
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80';
const DEFAULT_BANNER =
  'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=1200&auto=format&fit=crop&q=80';

export interface AuthResult {
  success: boolean;
  user?: User;
  needsEmailConfirmation?: boolean;
  error?: string;
  isSupabaseLive: boolean;
}

function mapAuthUserToAppUser(authUser: SupabaseAuthUser, profile?: Record<string, any> | null): User {
  const emailPrefix = authUser.email ? authUser.email.split('@')[0] : 'cinefilo';
  const meta = authUser.user_metadata || {};

  return {
    id: authUser.id,
    name: profile?.name || meta.name || emailPrefix,
    username: profile?.username || meta.username || emailPrefix,
    avatar: profile?.avatar || meta.avatar || DEFAULT_AVATAR,
    bannerUrl: profile?.banner_url || DEFAULT_BANNER,
    bio: profile?.bio || meta.bio || 'Membro do Lumina CineClub.',
    favoriteGenre: profile?.favorite_genre || meta.favorite_genre || 'Ficção Científica',
    badge: profile?.badge || 'Cinéfilo Membro',
    joinedDate: profile?.joined_date || 'Hoje',
    followersCount: Number(profile?.followers_count) || 0,
    followingCount: Number(profile?.following_count) || 0,
    isGuest: false,
  };
}

async function tryEnsureProfileRow(
  authUser: SupabaseAuthUser,
  overrides?: Partial<User>
): Promise<Record<string, any> | null> {
  try {
    const supabase = getSupabaseClient();
    const { data: existing, error: selectErr } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', authUser.id)
      .maybeSingle();

    if (selectErr) {
      console.warn('Não foi possível consultar public.profiles (RLS/tabela):', selectErr.message);
    }

    if (existing) {
      return existing;
    }

    const appUser = mapAuthUserToAppUser(authUser);
    const payload = {
      id: authUser.id,
      name: overrides?.name || appUser.name,
      username: overrides?.username || appUser.username,
      email: authUser.email?.toLowerCase().trim() || null,
      avatar: overrides?.avatar || appUser.avatar,
      banner_url: overrides?.bannerUrl || appUser.bannerUrl,
      bio: overrides?.bio || appUser.bio,
      favorite_genre: overrides?.favoriteGenre || appUser.favoriteGenre,
      badge: overrides?.badge || appUser.badge,
      joined_date: overrides?.joinedDate || appUser.joinedDate,
      followers_count: overrides?.followersCount ?? appUser.followersCount,
      following_count: overrides?.followingCount ?? appUser.followingCount,
    };

    const { data: inserted, error: insertError } = await supabase
      .from('profiles')
      .upsert(payload)
      .select('*')
      .maybeSingle();

    if (insertError) {
      // Handle unique username conflict without failing authentication
      if (insertError.code === '23505') {
        const suffixPayload = {
          ...payload,
          username: `${payload.username}_${authUser.id.slice(0, 6)}`,
        };
        const { data: retryData, error: retryErr } = await supabase
          .from('profiles')
          .upsert(suffixPayload)
          .select('*')
          .maybeSingle();
        if (retryErr) {
          console.warn('Aviso ao salvar perfil auxiliar no Supabase:', retryErr.message);
          return null;
        }
        return retryData;
      }
      console.warn('Aviso ao criar perfil auxiliar (RLS ou permissão):', insertError.message);
      return null;
    }

    return inserted || payload;
  } catch (err) {
    console.warn('Exceção não-bloqueante ao sincronizar public.profiles:', err);
    return null;
  }
}

export const supabaseService = {
  isConfigured(): boolean {
    return isSupabaseConfigured();
  },

  /**
   * Real Supabase Auth sign up.
   * Calls supabase.auth.signUp directly first with zero prior queries/inserts to auxiliary tables.
   * Non-blocking best-effort profile sync happens only AFTER signUp succeeds.
   */
  async signUpWithEmail(params: {
    email: string;
    password: string;
    name: string;
    username: string;
    favoriteGenre: string;
    bio: string;
    avatar: string;
  }): Promise<AuthResult> {
    if (!isSupabaseConfigured()) {
      const configError =
        'Cliente Supabase não configurado. Verifique NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY no .env.local ou no modal "Configurações Supabase".';
      console.error(configError);
      return {
        success: false,
        error: configError,
        isSupabaseLive: false,
      };
    }

    const cleanEmail = params.email.trim().toLowerCase();
    const rawUsername = params.username.trim().toLowerCase().replace(/^@/, '');
    const cleanUsername =
      rawUsername.replace(/[^a-z0-9_]/g, '') || cleanEmail.split('@')[0] || 'cinefilo';
    const cleanName = params.name.trim() || cleanEmail.split('@')[0] || 'Cinéfilo';
    const cleanBio = params.bio.trim() || 'Membro do Lumina CineClub.';
    const cleanGenre = params.favoriteGenre || 'Ficção Científica';
    const cleanAvatar = params.avatar || DEFAULT_AVATAR;

    try {
      const supabase = getSupabaseClient();

      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: cleanEmail,
        password: params.password,
        options: {
          data: {
            name: cleanName,
            username: cleanUsername,
            favorite_genre: cleanGenre,
            bio: cleanBio,
            avatar: cleanAvatar,
          },
        },
      });

      if (authError) {
        console.error('Supabase auth.signUp error:', authError);
        return {
          success: false,
          error: authError.message,
          isSupabaseLive: true,
        };
      }

      if (!authData?.user) {
        const missingUserErr = 'O Supabase Auth não retornou nenhum usuário após o cadastro.';
        console.error(missingUserErr, authData);
        return {
          success: false,
          error: missingUserErr,
          isSupabaseLive: true,
        };
      }

      // Supabase returns empty identities array when email already exists and confirm email is enabled
      if (Array.isArray(authData.user.identities) && authData.user.identities.length === 0) {
        const dupErr = 'User already registered';
        console.error('Supabase auth.signUp duplicate email:', dupErr);
        return {
          success: false,
          error: dupErr,
          isSupabaseLive: true,
        };
      }

      // Non-blocking best-effort sync to public.profiles AFTER signUp succeeded
      const profileRow = await tryEnsureProfileRow(authData.user, {
        name: cleanName,
        username: cleanUsername,
        favoriteGenre: cleanGenre,
        bio: cleanBio,
        avatar: cleanAvatar,
      });

      const appUser = mapAuthUserToAppUser(authData.user, profileRow);

      return {
        success: true,
        user: appUser,
        needsEmailConfirmation: !authData.session,
        isSupabaseLive: true,
      };
    } catch (err: any) {
      console.error('Supabase signUp exception:', err);
      return {
        success: false,
        error: err?.message || 'Erro inesperado ao cadastrar no Supabase Auth.',
        isSupabaseLive: isSupabaseConfigured(),
      };
    }
  },

  /**
   * Real Supabase Auth sign in.
   * If input contains an email (@ with domain), calls supabase.auth.signInWithPassword directly
   * without querying any profile table beforehand.
   * Only queries public.profiles if the user entered a @username without an email domain.
   */
  async signInWithEmail(identifier: string, password: string): Promise<AuthResult> {
    if (!isSupabaseConfigured()) {
      const configError =
        'Cliente Supabase não configurado. Verifique NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY no .env.local ou no modal "Configurações Supabase".';
      console.error(configError);
      return {
        success: false,
        error: configError,
        isSupabaseLive: false,
      };
    }

    const cleanIdentifier = identifier.trim().toLowerCase();

    try {
      const supabase = getSupabaseClient();
      let emailToAuth = cleanIdentifier;

      // Check if user entered a @username without email domain (e.g. "@judith" or "judith")
      const isEmailInput = cleanIdentifier.includes('@') && !cleanIdentifier.startsWith('@');

      if (!isEmailInput) {
        const cleanUsername = cleanIdentifier.replace(/^@/, '');
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('email')
          .ilike('username', cleanUsername)
          .limit(1)
          .maybeSingle();

        if (profileError) {
          console.error('Supabase username lookup error:', profileError);
          return {
            success: false,
            error: profileError.message,
            isSupabaseLive: true,
          };
        }

        if (!profile?.email) {
          const notFoundMsg = `Usuário @${cleanUsername} não encontrado com e-mail associado. Tente entrar usando seu e-mail completo.`;
          console.error(notFoundMsg);
          return {
            success: false,
            error: notFoundMsg,
            isSupabaseLive: true,
          };
        }

        emailToAuth = profile.email.trim().toLowerCase();
      }

      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: emailToAuth,
        password,
      });

      if (authError) {
        console.error('Supabase auth.signInWithPassword error:', authError);
        return {
          success: false,
          error: authError.message,
          isSupabaseLive: true,
        };
      }

      if (!authData?.user) {
        const noUserMsg = 'O Supabase Auth não retornou dados de usuário para esta sessão.';
        console.error(noUserMsg, authData);
        return {
          success: false,
          error: noUserMsg,
          isSupabaseLive: true,
        };
      }

      // Best-effort profile sync after authentication succeeds
      const profileRow = await tryEnsureProfileRow(authData.user);
      const appUser = mapAuthUserToAppUser(authData.user, profileRow);

      return {
        success: true,
        user: appUser,
        isSupabaseLive: true,
      };
    } catch (err: any) {
      console.error('Supabase signInWithPassword exception:', err);
      return {
        success: false,
        error: err?.message || 'Erro inesperado ao autenticar no Supabase Auth.',
        isSupabaseLive: isSupabaseConfigured(),
      };
    }
  },

  /**
   * Reads the real active Supabase session via supabase.auth.getSession().
   */
  async getSessionUser(): Promise<{
    user: User | null;
    session: Session | null;
    error?: string;
  }> {
    if (!isSupabaseConfigured()) {
      return {
        user: null,
        session: null,
        error:
          'Cliente Supabase não configurado. Verifique as credenciais no .env.local ou no modal "Configurações Supabase".',
      };
    }

    try {
      const supabase = getSupabaseClient();
      const { data, error } = await supabase.auth.getSession();

      if (error) {
        console.error('Supabase getSession error:', error);
        return { user: null, session: null, error: error.message };
      }

      const session = data.session;
      if (!session?.user) {
        return { user: null, session: null };
      }

      const profileRow = await tryEnsureProfileRow(session.user);
      return {
        user: mapAuthUserToAppUser(session.user, profileRow),
        session,
      };
    } catch (err: any) {
      console.error('Supabase getSession exception:', err);
      return {
        user: null,
        session: null,
        error: err?.message || 'Erro ao verificar sessão no Supabase.',
      };
    }
  },

  /**
   * Subscribes to real-time Supabase auth state changes (SIGNED_IN, SIGNED_OUT, TOKEN_REFRESHED, etc.).
   */
  onAuthStateChange(
    callback: (event: AuthChangeEvent, user: User | null, session: Session | null) => void
  ): (() => void) {
    if (!isSupabaseConfigured()) {
      return () => {};
    }

    try {
      const supabase = getSupabaseClient();
      const {
        data: { subscription },
      } = supabase.auth.onAuthStateChange(async (event, session) => {
        if (session?.user) {
          const profileRow = await tryEnsureProfileRow(session.user);
          callback(event, mapAuthUserToAppUser(session.user, profileRow), session);
        } else {
          callback(event, null, null);
        }
      });

      return () => {
        subscription.unsubscribe();
      };
    } catch (err) {
      console.error('Failed to subscribe to onAuthStateChange:', err);
      return () => {};
    }
  },

  async signOut(): Promise<{ error?: string }> {
    if (!isSupabaseConfigured()) return {};
    try {
      const supabase = getSupabaseClient();
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('Supabase signOut error:', error);
        return { error: error.message };
      }
      return {};
    } catch (err: any) {
      console.error('Supabase signOut exception:', err);
      return { error: err?.message || 'Erro ao sair da conta.' };
    }
  },

  /**
   * Load ALL data exclusively from Supabase cloud database (no mock fallback).
   */
  async loadAllData(): Promise<{
    users: User[];
    movies: Movie[];
    comments: Comment[];
    isSupabaseLive: boolean;
    error?: string;
  }> {
    if (!isSupabaseConfigured()) {
      return {
        users: [],
        movies: [],
        comments: [],
        isSupabaseLive: false,
        error: 'Cliente Supabase não configurado.',
      };
    }

    try {
      const supabase = getSupabaseClient();
      const [profilesRes, moviesRes, commentsRes] = await Promise.all([
        supabase.from('profiles').select('*').order('created_at', { ascending: false }),
        supabase.from('movies').select('*').order('created_at', { ascending: false }),
        supabase.from('comments').select('*').order('created_at', { ascending: false }),
      ]);

      if (profilesRes.error) console.error('Erro ao carregar profiles:', profilesRes.error);
      if (moviesRes.error) console.error('Erro ao carregar movies:', moviesRes.error);
      if (commentsRes.error) console.error('Erro ao carregar comments:', commentsRes.error);

      const remoteUsers: User[] = (profilesRes.data || []).map((p) => ({
        id: p.id,
        name: p.name || 'Cinéfilo',
        username: p.username || 'cinefilo',
        avatar: p.avatar || DEFAULT_AVATAR,
        bannerUrl: p.banner_url || DEFAULT_BANNER,
        bio: p.bio || 'Membro da comunidade Lumina CineClub.',
        favoriteGenre: p.favorite_genre || 'Cinema em Geral',
        badge: p.badge || 'Cinéfilo Membro',
        joinedDate: p.joined_date || 'Hoje',
        followersCount: Number(p.followers_count) || 0,
        followingCount: Number(p.following_count) || 0,
        isGuest: false,
      }));

      const remoteMovies: Movie[] = (moviesRes.data || []).map((m) => ({
        id: m.id,
        userId: m.user_id,
        title: m.title || 'Sem título',
        year: Number(m.year) || 2024,
        director: m.director || 'Diretor',
        genre: m.genre || 'Cinema',
        posterUrl:
          m.poster_url ||
          'https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?w=600&auto=format&fit=crop&q=80',
        backdropUrl:
          m.backdrop_url ||
          'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1200&auto=format&fit=crop&q=80',
        rating: Number(m.rating) || 9.0,
        review: m.review || '',
        favoriteScene: m.favorite_scene || undefined,
        badges: Array.isArray(m.badges) ? m.badges : [],
        likesCount: Number(m.likes_count) || 0,
        likedBy: Array.isArray(m.liked_by) ? m.liked_by : [],
        createdAt: m.created_at ? new Date(m.created_at).toISOString().split('T')[0] : 'Hoje',
      }));

      const remoteComments: Comment[] = (commentsRes.data || []).map((c) => ({
        id: c.id,
        targetUserId: c.target_user_id,
        movieId: c.movie_id || undefined,
        movieTitle: c.movie_title || undefined,
        authorId: c.author_id,
        authorName: c.author_name || 'Cinéfilo',
        authorUsername: c.author_username || 'usuario',
        authorAvatar: c.author_avatar || DEFAULT_AVATAR,
        content: c.content || '',
        createdAt: c.created_at ? new Date(c.created_at).toLocaleDateString('pt-BR') : 'Hoje',
        likes: Number(c.likes) || 0,
        likedBy: Array.isArray(c.liked_by) ? c.liked_by : [],
      }));

      return {
        users: remoteUsers,
        movies: remoteMovies,
        comments: remoteComments,
        isSupabaseLive: true,
      };
    } catch (err: any) {
      console.error('Could not fetch from Supabase tables:', err);
      return {
        users: [],
        movies: [],
        comments: [],
        isSupabaseLive: false,
        error: err?.message || 'Erro ao carregar dados do Supabase.',
      };
    }
  },

  /**
   * Save a movie directly in Supabase table 'movies'.
   */
  async saveMovie(movie: Movie, user?: User): Promise<boolean> {
    if (!isSupabaseConfigured()) return false;
    const supabase = getSupabaseClient();

    try {
      if (user) {
        await supabase.from('profiles').upsert({
          id: user.id,
          name: user.name,
          username: user.username,
          avatar: user.avatar,
          banner_url: user.bannerUrl || DEFAULT_BANNER,
          bio: user.bio || '',
          favorite_genre: user.favoriteGenre || 'Cinema',
          badge: user.badge || 'Cinéfilo Membro',
          joined_date: user.joinedDate || 'Hoje',
          followers_count: user.followersCount || 0,
          following_count: user.followingCount || 0,
        });
      }

      const { error } = await supabase.from('movies').upsert({
        id: movie.id,
        user_id: movie.userId,
        title: movie.title,
        year: Number(movie.year) || 2024,
        director: movie.director,
        genre: movie.genre,
        poster_url: movie.posterUrl,
        backdrop_url: movie.backdropUrl || null,
        rating: Number(movie.rating) || 9.0,
        review: movie.review,
        favorite_scene: movie.favoriteScene || null,
        badges: movie.badges || [],
        likes_count: movie.likesCount || 0,
        liked_by: movie.likedBy || [],
      });

      if (error) {
        console.error('Error saving movie to Supabase:', error);
        return false;
      }
      return true;
    } catch (e) {
      console.error('Failed to upsert movie in Supabase:', e);
      return false;
    }
  },

  /**
   * Delete a movie directly from Supabase table 'movies'.
   */
  async deleteMovie(movieId: string): Promise<boolean> {
    if (!isSupabaseConfigured()) return false;
    const supabase = getSupabaseClient();

    try {
      const { error } = await supabase.from('movies').delete().eq('id', movieId);
      if (error) {
        console.error('Failed to delete movie from Supabase:', error);
        return false;
      }
      return true;
    } catch (e) {
      console.error('Exception deleting movie in Supabase:', e);
      return false;
    }
  },

  /**
   * Save a comment directly in Supabase table 'comments'.
   */
  async saveComment(comment: Comment, authorUser?: User): Promise<boolean> {
    if (!isSupabaseConfigured()) return false;
    const supabase = getSupabaseClient();

    try {
      if (authorUser) {
        await supabase.from('profiles').upsert({
          id: authorUser.id,
          name: authorUser.name,
          username: authorUser.username,
          avatar: authorUser.avatar,
          banner_url: authorUser.bannerUrl || DEFAULT_BANNER,
          bio: authorUser.bio || '',
          favorite_genre: authorUser.favoriteGenre || 'Cinema',
          badge: authorUser.badge || 'Cinéfilo Membro',
          joined_date: authorUser.joinedDate || 'Hoje',
          followers_count: authorUser.followersCount || 0,
          following_count: authorUser.followingCount || 0,
        });
      }

      const { error } = await supabase.from('comments').upsert({
        id: comment.id,
        target_user_id: comment.targetUserId,
        movie_id: comment.movieId || null,
        movie_title: comment.movieTitle || null,
        author_id: comment.authorId,
        author_name: comment.authorName,
        author_username: comment.authorUsername,
        author_avatar: comment.authorAvatar,
        content: comment.content,
        likes: comment.likes || 0,
        liked_by: comment.likedBy || [],
      });

      if (error) {
        console.error('Error saving comment to Supabase:', error);
        return false;
      }
      return true;
    } catch (e) {
      console.error('Failed to save comment in Supabase:', e);
      return false;
    }
  },

  /**
   * Delete a comment directly from Supabase table 'comments'.
   */
  async deleteComment(commentId: string): Promise<boolean> {
    if (!isSupabaseConfigured()) return false;
    const supabase = getSupabaseClient();

    try {
      const { error } = await supabase.from('comments').delete().eq('id', commentId);
      if (error) {
        console.error('Failed to delete comment from Supabase:', error);
        return false;
      }
      return true;
    } catch (e) {
      console.error('Failed to delete comment from Supabase:', e);
      return false;
    }
  },

  /**
   * Update profile directly in Supabase table 'profiles'.
   */
  async updateProfile(user: User): Promise<boolean> {
    if (!isSupabaseConfigured()) return false;
    const supabase = getSupabaseClient();

    try {
      const { error } = await supabase.from('profiles').upsert({
        id: user.id,
        name: user.name,
        username: user.username,
        avatar: user.avatar,
        banner_url: user.bannerUrl,
        bio: user.bio,
        favorite_genre: user.favoriteGenre,
        badge: user.badge,
        followers_count: user.followersCount,
        following_count: user.followingCount,
      });

      if (error) {
        console.error('Failed to update profile in Supabase:', error);
        return false;
      }
      return true;
    } catch (e) {
      console.error('Exception updating profile in Supabase:', e);
      return false;
    }
  },

  /**
   * Delete a profile and all associated data directly from Supabase.
   */
  async deleteProfile(userId: string): Promise<boolean> {
    if (!isSupabaseConfigured()) return false;
    const supabase = getSupabaseClient();

    try {
      await supabase.from('comments').delete().eq('target_user_id', userId);
      await supabase.from('comments').delete().eq('author_id', userId);
      await supabase.from('movies').delete().eq('user_id', userId);
      const { error } = await supabase.from('profiles').delete().eq('id', userId);

      if (error) {
        console.error('Failed to delete profile from Supabase:', error);
        return false;
      }
      return true;
    } catch (e) {
      console.error('Exception deleting profile in Supabase:', e);
      return false;
    }
  },
};
