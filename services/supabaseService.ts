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

    if (supabase) {
      try {
        // 1. Create auth user in Supabase Auth
        const { data: authData, error: authError } = await supabase.auth.signUp({
          email: params.email,
          password: params.password,
          options: {
            data: {
              name: params.name,
              username: params.username,
            },
          },
        });

        if (authError) {
          let errorMsg = authError.message;
          const msgLower = (authError.message || '').toLowerCase();
          if (msgLower.includes('api key') || msgLower.includes('jwt') || msgLower.includes('token') || authError.status === 401) {
            errorMsg = 'Chave "anon" do Supabase inválida ("Invalid API key"). No dashboard do Supabase, vá em Project Settings > API e copie a chave pública rotulada como "anon / public" (um código longo começando com "eyJ..."), e não a senha do banco de dados.';
          }
          return { success: false, error: errorMsg, isSupabaseLive: true };
        }

        const userId = authData.user?.id || `user_${Date.now()}`;

        const newUser: User = {
          id: userId,
          name: params.name,
          username: params.username,
          avatar: params.avatar,
          bannerUrl: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=1200&auto=format&fit=crop&q=80',
          bio: params.bio,
          favoriteGenre: params.favoriteGenre,
          badge: 'Cinéfilo Membro',
          joinedDate: 'Hoje',
          followersCount: 0,
          followingCount: 3,
          isGuest: false,
        };

        // 2. Insert profile in Supabase table
        const { error: profileError } = await supabase.from('profiles').upsert({
          id: userId,
          name: newUser.name,
          username: newUser.username,
          email: params.email,
          avatar: newUser.avatar,
          banner_url: newUser.bannerUrl,
          bio: newUser.bio,
          favorite_genre: newUser.favoriteGenre,
          badge: newUser.badge,
          joined_date: newUser.joinedDate,
          followers_count: newUser.followersCount,
          following_count: newUser.followingCount,
        });

        if (profileError) {
          console.warn('Could not insert profile into Supabase profiles table:', profileError.message);
        }

        return { success: true, user: newUser, isSupabaseLive: true };
      } catch (err: any) {
        let msg = err?.message || 'Erro ao registrar no Supabase';
        if (msg.includes('ISO-8859-1') || msg.includes('ByteString') || msg.includes('headers')) {
          msg = 'Caracteres especiais detectados na chave. As credenciais foram higienizadas automaticamente. Tente clicar em Concluir Cadastro novamente.';
        }
        return { success: false, error: msg, isSupabaseLive: true };
      }
    }

    // Fallback when Supabase env vars are not yet filled
    const mockUser: User = {
      id: `user_${Date.now()}`,
      name: params.name,
      username: params.username,
      avatar: params.avatar,
      bannerUrl: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=1200&auto=format&fit=crop&q=80',
      bio: params.bio,
      favoriteGenre: params.favoriteGenre,
      badge: 'Cinéfilo Membro',
      joinedDate: 'Hoje',
      followersCount: 0,
      followingCount: 3,
      isGuest: false,
    };

    return { success: true, user: mockUser, isSupabaseLive: false };
  },

  async signInWithEmail(email: string, password: string): Promise<AuthResult> {
    const supabase = getSupabaseClient();

    if (supabase) {
      try {
        const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (authError) {
          let errorMsg = authError.message;
          const msgLower = (authError.message || '').toLowerCase();
          if (msgLower.includes('api key') || msgLower.includes('jwt') || msgLower.includes('token') || authError.status === 401) {
            errorMsg = 'Chave "anon" do Supabase inválida ("Invalid API key"). No dashboard do Supabase, vá em Project Settings > API e copie a chave pública rotulada como "anon / public" (um código longo começando com "eyJ..."), e não a senha do banco de dados.';
          }
          return { success: false, error: errorMsg, isSupabaseLive: true };
        }

        const userId = authData.user?.id;
        if (!userId) {
          return { success: false, error: 'Usuário não encontrado', isSupabaseLive: true };
        }

        // Fetch profile
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .single();

        if (profile) {
          const user: User = {
            id: profile.id,
            name: profile.name,
            username: profile.username,
            avatar: profile.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80',
            bannerUrl: profile.banner_url || 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=1200&auto=format&fit=crop&q=80',
            bio: profile.bio || '',
            favoriteGenre: profile.favorite_genre || 'Ficção Científica',
            badge: profile.badge || 'Cinéfilo Membro',
            joinedDate: profile.joined_date || 'Hoje',
            followersCount: profile.followers_count || 0,
            followingCount: profile.following_count || 0,
            isGuest: false,
          };
          return { success: true, user, isSupabaseLive: true };
        }

        // If no profile record yet, build from user metadata
        const fallbackUser: User = {
          id: userId,
          name: authData.user.user_metadata?.name || email.split('@')[0],
          username: authData.user.user_metadata?.username || email.split('@')[0],
          avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80',
          bannerUrl: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=1200&auto=format&fit=crop&q=80',
          bio: 'Amante de cinema conectado ao Supabase.',
          favoriteGenre: 'Cinema em Geral',
          badge: 'Cinéfilo Membro',
          joinedDate: 'Hoje',
          followersCount: 0,
          followingCount: 3,
          isGuest: false,
        };

        return { success: true, user: fallbackUser, isSupabaseLive: true };
      } catch (err: any) {
        let msg = err?.message || 'Erro ao autenticar';
        if (msg.includes('ISO-8859-1') || msg.includes('ByteString') || msg.includes('headers')) {
          msg = 'Caracteres especiais detectados na chave. As credenciais foram higienizadas automaticamente. Tente clicar em Entrar novamente.';
        }
        return { success: false, error: msg, isSupabaseLive: true };
      }
    }

    // Local / Demonstration mode
    return {
      success: true,
      user: {
        id: `user_${Date.now()}`,
        name: email.split('@')[0].toUpperCase(),
        username: email.split('@')[0].toLowerCase(),
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80',
        bannerUrl: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=1200&auto=format&fit=crop&q=80',
        bio: 'Conta de teste local (conecte o Supabase em .env para dados em nuvem).',
        favoriteGenre: 'Ficção Científica',
        badge: 'Cinéfilo Membro',
        joinedDate: 'Hoje',
        followersCount: 0,
        followingCount: 3,
        isGuest: false,
      },
      isSupabaseLive: false,
    };
  },

  async signOut(): Promise<void> {
    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        await supabase.auth.signOut();
      } catch (e) {
        console.warn('Error signing out of Supabase:', e);
      }
    }
  },

  async loadAllData(): Promise<{
    users: User[];
    movies: Movie[];
    comments: Comment[];
    isSupabaseLive: boolean;
  }> {
    const supabase = getSupabaseClient();

    if (supabase) {
      try {
        const [profilesRes, moviesRes, commentsRes] = await Promise.all([
          supabase.from('profiles').select('*'),
          supabase.from('movies').select('*'),
          supabase.from('comments').select('*'),
        ]);

        const remoteUsers: User[] = (profilesRes.data || []).map((p) => ({
          id: p.id,
          name: p.name,
          username: p.username,
          avatar: p.avatar,
          bannerUrl: p.banner_url || 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=1200&auto=format&fit=crop&q=80',
          bio: p.bio,
          favoriteGenre: p.favorite_genre,
          badge: p.badge,
          joinedDate: p.joined_date,
          followersCount: p.followers_count || 0,
          followingCount: p.following_count || 0,
          isGuest: false,
        }));

        const remoteMovies: Movie[] = (moviesRes.data || []).map((m) => ({
          id: m.id,
          userId: m.user_id,
          title: m.title,
          year: m.year,
          director: m.director,
          genre: m.genre,
          posterUrl: m.poster_url,
          backdropUrl: m.backdrop_url,
          rating: Number(m.rating),
          review: m.review,
          favoriteScene: m.favorite_scene,
          badges: m.badges || [],
          likesCount: m.likes_count || 0,
          likedBy: m.liked_by || [],
          createdAt: m.created_at,
        }));

        const remoteComments: Comment[] = (commentsRes.data || []).map((c) => ({
          id: c.id,
          targetUserId: c.target_user_id,
          movieId: c.movie_id,
          movieTitle: c.movie_title,
          authorId: c.author_id,
          authorName: c.author_name,
          authorUsername: c.author_username,
          authorAvatar: c.author_avatar,
          content: c.content,
          createdAt: c.created_at ? new Date(c.created_at).toLocaleDateString('pt-BR') : 'Hoje',
          likes: c.likes || 0,
          likedBy: c.liked_by || [],
        }));

        if (remoteUsers.length > 0 || remoteMovies.length > 0) {
          return {
            users: remoteUsers.length > 0 ? remoteUsers : INITIAL_USERS,
            movies: remoteMovies,
            comments: remoteComments,
            isSupabaseLive: true,
          };
        }
      } catch (e) {
        console.warn('Could not fetch from Supabase tables:', e);
      }
    }

    return {
      users: INITIAL_USERS,
      movies: INITIAL_MOVIES,
      comments: INITIAL_COMMENTS,
      isSupabaseLive: false,
    };
  },

  async saveMovie(movie: Movie, user?: User): Promise<boolean> {
    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        // Ensure user profile exists in profiles table so foreign key constraint is satisfied
        if (user) {
          await supabase.from('profiles').upsert({
            id: user.id,
            name: user.name,
            username: user.username,
            avatar: user.avatar,
            banner_url: user.bannerUrl || 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=1200',
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
    }
    return true;
  },

  async deleteMovie(movieId: string): Promise<void> {
    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        await supabase.from('movies').delete().eq('id', movieId);
      } catch (e) {
        console.warn('Failed to delete movie from Supabase:', e);
      }
    }
  },

  async saveComment(comment: Comment, authorUser?: User): Promise<boolean> {
    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        if (authorUser) {
          await supabase.from('profiles').upsert({
            id: authorUser.id,
            name: authorUser.name,
            username: authorUser.username,
            avatar: authorUser.avatar,
            banner_url: authorUser.bannerUrl || 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=1200',
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
    }
    return true;
  },

  async deleteComment(commentId: string): Promise<void> {
    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        await supabase.from('comments').delete().eq('id', commentId);
      } catch (e) {
        console.warn('Failed to delete comment from Supabase:', e);
      }
    }
  },

  async updateProfile(user: User): Promise<void> {
    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        await supabase.from('profiles').upsert({
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
      } catch (e) {
        console.warn('Failed to update profile in Supabase:', e);
      }
    }
  },

  async deleteProfile(userId: string): Promise<boolean> {
    const supabase = getSupabaseClient();
    if (supabase) {
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
    }
    return true;
  },

  createLocalUser(params: {
    name: string;
    username: string;
    favoriteGenre?: string;
    bio?: string;
    avatar?: string;
  }): User {
    return {
      id: `user_${Date.now()}`,
      name: params.name,
      username: params.username,
      avatar: params.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80',
      bannerUrl: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=1200&auto=format&fit=crop&q=80',
      bio: params.bio || 'Membro do Lumina CineClub.',
      favoriteGenre: params.favoriteGenre || 'Ficção Científica',
      badge: 'Cinéfilo Membro',
      joinedDate: 'Hoje',
      followersCount: 0,
      followingCount: 3,
      isGuest: false,
    };
  },
};
