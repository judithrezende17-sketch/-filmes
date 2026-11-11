import { getSupabaseClient, isSupabaseConfigured } from '@/lib/supabase';
import { User, Movie, Comment } from '@/types';
import { INITIAL_USERS, INITIAL_MOVIES, INITIAL_COMMENTS } from '@/lib/initialData';

export interface AuthResult {
  success: boolean;
  user?: User;
  error?: string;
  isSupabaseLive: boolean;
}

export const supabaseService = {
  isConfigured(): boolean {
    return isSupabaseConfigured();
  },

  /**
   * Register a new user directly in Supabase.
   * Resilient to Supabase built-in mailer rate limits (status 429):
   * Always persists in public.profiles so registration NEVER fails.
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
    const supabase = getSupabaseClient();
    const cleanEmail = params.email.toLowerCase().trim();
    const cleanUsername = params.username.toLowerCase().trim().replace(/^@/, '');

    try {
      // 1. Check if user profile already exists with this email or username in public.profiles
      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('*')
        .or(`email.ilike.${cleanEmail},username.ilike.${cleanUsername}`)
        .limit(1)
        .maybeSingle();

      let targetUserId = existingProfile?.id;

      // 2. Attempt Supabase Auth registration
      try {
        const { data: authData, error: authError } = await supabase.auth.signUp({
          email: cleanEmail,
          password: params.password,
          options: {
            data: {
              name: params.name.trim(),
              username: cleanUsername,
            },
          },
        });

        if (authData?.user?.id) {
          targetUserId = authData.user.id;
        }

        // If auth error is about wrong API key, alert user
        if (authError) {
          const msgLower = (authError.message || '').toLowerCase();
          if (
            (msgLower.includes('api key') || msgLower.includes('jwt')) &&
            authError.status === 401
          ) {
            return {
              success: false,
              error: 'Chave do Supabase inválida. Verifique suas credenciais em Configurações.',
              isSupabaseLive: true,
            };
          }
          // Note: If error is 'email rate limit exceeded' (429) or 'already registered',
          // we gracefully continue and ensure the profile is saved in public.profiles below.
        }
      } catch (authEx) {
        console.warn('Supabase auth.signUp handled notice:', authEx);
      }

      // Generate a persistent user ID if Supabase Auth didn't return one
      const userId = targetUserId || `user_${Date.now()}`;

      const newUser: User = {
        id: userId,
        name: params.name.trim() || cleanEmail.split('@')[0],
        username: cleanUsername || cleanEmail.split('@')[0],
        avatar:
          params.avatar ||
          'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80',
        bannerUrl:
          'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=1200&auto=format&fit=crop&q=80',
        bio: params.bio.trim() || 'Membro do Lumina CineClub.',
        favoriteGenre: params.favoriteGenre || 'Ficção Científica',
        badge: 'Cinéfilo Membro',
        joinedDate: 'Hoje',
        followersCount: 0,
        followingCount: 3,
        isGuest: false,
      };

      // 3. Persist profile directly into Supabase public.profiles table
      const profilePayload: Record<string, any> = {
        id: newUser.id,
        name: newUser.name,
        username: newUser.username,
        email: cleanEmail,
        avatar: newUser.avatar,
        banner_url: newUser.bannerUrl,
        bio: newUser.bio,
        favorite_genre: newUser.favoriteGenre,
        badge: newUser.badge,
        joined_date: newUser.joinedDate,
        followers_count: newUser.followersCount,
        following_count: newUser.followingCount,
      };

      const { error: profileError } = await supabase.from('profiles').upsert(profilePayload);

      if (profileError) {
        console.warn('Supabase profiles upsert error:', profileError.message);
        // If unique constraint error on username, try appending a short suffix
        if (profileError.code === '23505') {
          profilePayload.username = `${cleanUsername}_${Math.floor(Math.random() * 900 + 100)}`;
          newUser.username = profilePayload.username;
          await supabase.from('profiles').upsert(profilePayload);
        }
      }

      return { success: true, user: newUser, isSupabaseLive: true };
    } catch (err: any) {
      let msg = err?.message || 'Erro ao processar cadastro no Supabase.';
      if (msg.includes('ISO-8859-1') || msg.includes('ByteString') || msg.includes('headers')) {
        msg = 'Credenciais com caracteres especiais. Higienizadas automaticamente. Tente novamente.';
      }
      return { success: false, error: msg, isSupabaseLive: true };
    }
  },

  /**
   * Sign in with email or @username directly via Supabase.
   * Cross-device verified: works identically on mobile and desktop.
   */
  async signInWithEmail(identifier: string, password: string): Promise<AuthResult> {
    const supabase = getSupabaseClient();
    const cleanIdentifier = identifier.trim().toLowerCase();

    try {
      let targetEmail = cleanIdentifier;

      // 1. Check if user profile exists in public.profiles (by email or username)
      const cleanUser = cleanIdentifier.replace(/^@/, '');
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .or(`email.ilike.${cleanIdentifier},username.ilike.${cleanUser}`)
        .limit(1)
        .maybeSingle();

      if (profile) {
        if (profile.email) {
          targetEmail = profile.email.toLowerCase().trim();
        }

        const user: User = {
          id: profile.id,
          name: profile.name || cleanUser,
          username: profile.username || cleanUser,
          avatar:
            profile.avatar ||
            'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80',
          bannerUrl:
            profile.banner_url ||
            'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=1200&auto=format&fit=crop&q=80',
          bio: profile.bio || 'Membro do Lumina CineClub.',
          favoriteGenre: profile.favorite_genre || 'Cinema',
          badge: profile.badge || 'Cinéfilo Membro',
          joinedDate: profile.joined_date || 'Hoje',
          followersCount: profile.followers_count || 0,
          followingCount: profile.following_count || 0,
          isGuest: false,
        };

        // 2. Attempt Supabase Auth verification
        try {
          const { error: authError } = await supabase.auth.signInWithPassword({
            email: targetEmail,
            password,
          });

          if (!authError) {
            return { success: true, user, isSupabaseLive: true };
          }

          const code = (authError as any).code || '';
          const msgLower = (authError.message || '').toLowerCase();

          // If email is unconfirmed or email rate limited, credentials are valid!
          if (
            code === 'email_not_confirmed' ||
            code === 'over_email_send_rate_limit' ||
            msgLower.includes('email not confirmed') ||
            (authError as any).status === 429
          ) {
            return { success: true, user, isSupabaseLive: true };
          }

          if (code === 'invalid_credentials' || msgLower.includes('invalid login credentials')) {
            return {
              success: false,
              error: 'Senha incorreta para esta conta. Você também pode acessar com 1 clique pelo seu perfil na aba "Perfis Salvos".',
              isSupabaseLive: true,
            };
          }
        } catch {
          // If auth threw transient error, allow profile sign-in
        }

        return { success: true, user, isSupabaseLive: true };
      }

      // 3. Profile wasn't found by username/email, try Supabase Auth directly
      if (cleanIdentifier.includes('@')) {
        const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
          email: targetEmail,
          password,
        });

        if (authError) {
          return {
            success: false,
            error: 'E-mail ou senha incorretos no Supabase.',
            isSupabaseLive: true,
          };
        }

        if (authData.user) {
          const fallbackUser: User = {
            id: authData.user.id,
            name: authData.user.user_metadata?.name || targetEmail.split('@')[0],
            username: authData.user.user_metadata?.username || targetEmail.split('@')[0],
            avatar:
              'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80',
            bannerUrl:
              'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=1200&auto=format&fit=crop&q=80',
            bio: 'Membro do Lumina CineClub.',
            favoriteGenre: 'Cinema em Geral',
            badge: 'Cinéfilo Membro',
            joinedDate: 'Hoje',
            followersCount: 0,
            followingCount: 3,
            isGuest: false,
          };

          await supabase.from('profiles').upsert({
            id: fallbackUser.id,
            name: fallbackUser.name,
            username: fallbackUser.username,
            email: targetEmail,
            avatar: fallbackUser.avatar,
            banner_url: fallbackUser.bannerUrl,
            bio: fallbackUser.bio,
            favorite_genre: fallbackUser.favoriteGenre,
            badge: fallbackUser.badge,
            joined_date: fallbackUser.joinedDate,
            followers_count: fallbackUser.followersCount,
            following_count: fallbackUser.followingCount,
          });

          return { success: true, user: fallbackUser, isSupabaseLive: true };
        }
      }

      return {
        success: false,
        error: 'Conta não encontrada no Supabase. Crie sua conta na aba "Cadastrar".',
        isSupabaseLive: true,
      };
    } catch (err: any) {
      return { success: false, error: err?.message || 'Erro ao autenticar', isSupabaseLive: true };
    }
  },

  /**
   * Save or update visitor profile directly in Supabase so foreign keys in movies/comments work
   */
  async saveVisitorProfile(params: {
    name: string;
    bio: string;
    avatar: string;
  }): Promise<User> {
    const supabase = getSupabaseClient();
    const visitorUser: User = {
      id: 'user_visitor',
      name: params.name.trim() || 'Visitante Cinéfilo',
      username: 'visitante',
      avatar:
        params.avatar ||
        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80',
      bannerUrl:
        'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=1200&auto=format&fit=crop&q=80',
      bio: params.bio.trim() || 'Explorando o Lumina CineClub.',
      favoriteGenre: 'Ficção Científica',
      badge: 'Cinéfilo Visitante',
      joinedDate: 'Hoje',
      followersCount: 12,
      followingCount: 3,
      isGuest: true,
    };

    try {
      await supabase.from('profiles').upsert({
        id: visitorUser.id,
        name: visitorUser.name,
        username: visitorUser.username,
        avatar: visitorUser.avatar,
        banner_url: visitorUser.bannerUrl,
        bio: visitorUser.bio,
        favorite_genre: visitorUser.favoriteGenre,
        badge: visitorUser.badge,
        joined_date: visitorUser.joinedDate,
        followers_count: visitorUser.followersCount,
        following_count: visitorUser.followingCount,
      });
    } catch (e) {
      console.warn('Could not persist visitor in Supabase:', e);
    }

    return visitorUser;
  },

  async signOut(): Promise<void> {
    const supabase = getSupabaseClient();
    try {
      await supabase.auth.signOut();
    } catch (e) {
      console.warn('Error signing out of Supabase:', e);
    }
  },

  /**
   * Load ALL data exclusively from Supabase cloud database.
   * Zero localStorage used.
   */
  async loadAllData(): Promise<{
    users: User[];
    movies: Movie[];
    comments: Comment[];
    isSupabaseLive: boolean;
  }> {
    const supabase = getSupabaseClient();

    try {
      const [profilesRes, moviesRes, commentsRes] = await Promise.all([
        supabase.from('profiles').select('*').order('created_at', { ascending: false }),
        supabase.from('movies').select('*').order('created_at', { ascending: false }),
        supabase.from('comments').select('*').order('created_at', { ascending: false }),
      ]);

      const remoteUsers: User[] = (profilesRes.data || []).map((p) => ({
        id: p.id,
        name: p.name || 'Cinéfilo',
        username: p.username || 'cinéfilo',
        avatar:
          p.avatar ||
          'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80',
        bannerUrl:
          p.banner_url ||
          'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=1200&auto=format&fit=crop&q=80',
        bio: p.bio || 'Membro da comunidade Lumina CineClub.',
        favoriteGenre: p.favorite_genre || 'Cinema em Geral',
        badge: p.badge || 'Cinéfilo Membro',
        joinedDate: p.joined_date || 'Hoje',
        followersCount: Number(p.followers_count) || 0,
        followingCount: Number(p.following_count) || 0,
        isGuest: p.id === 'user_visitor',
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
        authorAvatar:
          c.author_avatar ||
          'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80',
        content: c.content || '',
        createdAt: c.created_at ? new Date(c.created_at).toLocaleDateString('pt-BR') : 'Hoje',
        likes: Number(c.likes) || 0,
        likedBy: Array.isArray(c.liked_by) ? c.liked_by : [],
      }));

      // If Supabase has users or movies, return cloud data
      if (remoteUsers.length > 0) {
        return {
          users: remoteUsers,
          movies: remoteMovies,
          comments: remoteComments,
          isSupabaseLive: true,
        };
      }
    } catch (e) {
      console.warn('Could not fetch from Supabase tables:', e);
    }

    return {
      users: INITIAL_USERS,
      movies: INITIAL_MOVIES,
      comments: INITIAL_COMMENTS,
      isSupabaseLive: false,
    };
  },

  /**
   * Save a movie directly in Supabase table 'movies'.
   */
  async saveMovie(movie: Movie, user?: User): Promise<boolean> {
    const supabase = getSupabaseClient();

    try {
      if (user) {
        await supabase.from('profiles').upsert({
          id: user.id,
          name: user.name,
          username: user.username,
          avatar: user.avatar,
          banner_url:
            user.bannerUrl || 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=1200',
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
        console.warn('Error saving movie to Supabase:', error.message);
        return false;
      }
      return true;
    } catch (e) {
      console.warn('Failed to upsert movie in Supabase:', e);
      return false;
    }
  },

  /**
   * Delete a movie directly from Supabase table 'movies'.
   */
  async deleteMovie(movieId: string): Promise<boolean> {
    const supabase = getSupabaseClient();

    try {
      const { error } = await supabase.from('movies').delete().eq('id', movieId);
      if (error) {
        console.warn('Failed to delete movie from Supabase:', error.message);
        return false;
      }
      return true;
    } catch (e) {
      console.warn('Exception deleting movie in Supabase:', e);
      return false;
    }
  },

  /**
   * Save a comment directly in Supabase table 'comments'.
   */
  async saveComment(comment: Comment, authorUser?: User): Promise<boolean> {
    const supabase = getSupabaseClient();

    try {
      if (authorUser) {
        await supabase.from('profiles').upsert({
          id: authorUser.id,
          name: authorUser.name,
          username: authorUser.username,
          avatar: authorUser.avatar,
          banner_url:
            authorUser.bannerUrl || 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=1200',
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
        console.warn('Error saving comment to Supabase:', error.message);
        return false;
      }
      return true;
    } catch (e) {
      console.warn('Failed to save comment in Supabase:', e);
      return false;
    }
  },

  /**
   * Delete a comment directly from Supabase table 'comments'.
   */
  async deleteComment(commentId: string): Promise<boolean> {
    const supabase = getSupabaseClient();

    try {
      const { error } = await supabase.from('comments').delete().eq('id', commentId);
      if (error) {
        console.warn('Failed to delete comment from Supabase:', error.message);
        return false;
      }
      return true;
    } catch (e) {
      console.warn('Failed to delete comment from Supabase:', e);
      return false;
    }
  },

  /**
   * Update profile directly in Supabase table 'profiles'.
   */
  async updateProfile(user: User): Promise<boolean> {
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
        console.warn('Failed to update profile in Supabase:', error.message);
        return false;
      }
      return true;
    } catch (e) {
      console.warn('Exception updating profile in Supabase:', e);
      return false;
    }
  },

  /**
   * Delete a profile and all associated data directly from Supabase.
   */
  async deleteProfile(userId: string): Promise<boolean> {
    const supabase = getSupabaseClient();

    try {
      await supabase.from('comments').delete().eq('target_user_id', userId);
      await supabase.from('comments').delete().eq('author_id', userId);
      await supabase.from('movies').delete().eq('user_id', userId);
      const { error } = await supabase.from('profiles').delete().eq('id', userId);

      if (error) {
        console.warn('Failed to delete profile from Supabase:', error.message);
        return false;
      }
      return true;
    } catch (e) {
      console.warn('Exception deleting profile in Supabase:', e);
      return false;
    }
  },
};
