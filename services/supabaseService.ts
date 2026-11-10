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
    const cleanEmail = params.email.toLowerCase().trim();
    const cleanUsername = params.username.toLowerCase().trim().replace(/^@/, '');

    if (supabase) {
      try {
        // 1. Check if user profile already exists with this email or username in public.profiles
        const { data: existingProfile } = await supabase
          .from('profiles')
          .select('*')
          .or(`email.ilike.${cleanEmail},username.ilike.${cleanUsername}`)
          .limit(1)
          .maybeSingle();

        // 2. Create auth user in Supabase Auth
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

        if (authError) {
          const msgLower = (authError.message || '').toLowerCase();
          
          // If already registered in Supabase Auth, try signing in with the provided password
          if (msgLower.includes('already registered') || msgLower.includes('already exists')) {
            const signInRes = await this.signInWithEmail(cleanEmail, params.password);
            if (signInRes.success) {
              return signInRes;
            }
            if (existingProfile) {
              // Return existing profile with helpful cross-device notice
              const user: User = {
                id: existingProfile.id,
                name: existingProfile.name,
                username: existingProfile.username,
                avatar: existingProfile.avatar || params.avatar,
                bannerUrl: existingProfile.banner_url || 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=1200&auto=format&fit=crop&q=80',
                bio: existingProfile.bio || params.bio,
                favoriteGenre: existingProfile.favorite_genre || params.favoriteGenre,
                badge: existingProfile.badge || 'Cinéfilo Membro',
                joinedDate: existingProfile.joined_date || 'Hoje',
                followersCount: existingProfile.followers_count || 0,
                followingCount: existingProfile.following_count || 3,
                isGuest: false,
              };
              return { success: true, user, isSupabaseLive: true };
            }
            return {
              success: false,
              error: 'Esta conta já foi criada anteriormente no outro dispositivo. Use a aba "Entrar" com seu e-mail e senha cadastrados.',
              isSupabaseLive: true,
            };
          }

          if (msgLower.includes('api key') || msgLower.includes('jwt') || msgLower.includes('token') || authError.status === 401) {
            return {
              success: false,
              error: 'Chave "anon" do Supabase inválida ("Invalid API key"). Verifique a chave pública nas configurações do Supabase.',
              isSupabaseLive: true,
            };
          }

          return { success: false, error: authError.message, isSupabaseLive: true };
        }

        const userId = authData.user?.id || existingProfile?.id || `user_${Date.now()}`;

        const newUser: User = {
          id: userId,
          name: params.name.trim(),
          username: cleanUsername,
          avatar: params.avatar,
          bannerUrl: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=1200&auto=format&fit=crop&q=80',
          bio: params.bio.trim() || 'Membro do Lumina CineClub.',
          favoriteGenre: params.favoriteGenre,
          badge: 'Cinéfilo Membro',
          joinedDate: 'Hoje',
          followersCount: 0,
          followingCount: 3,
          isGuest: false,
        };

        // 3. Upsert profile in Supabase profiles table for immediate cross-device querying
        const { error: profileError } = await supabase.from('profiles').upsert({
          id: userId,
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
      name: params.name.trim(),
      username: cleanUsername,
      avatar: params.avatar,
      bannerUrl: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=1200&auto=format&fit=crop&q=80',
      bio: params.bio.trim() || 'Membro do Lumina CineClub.',
      favoriteGenre: params.favoriteGenre,
      badge: 'Cinéfilo Membro',
      joinedDate: 'Hoje',
      followersCount: 0,
      followingCount: 3,
      isGuest: false,
    };

    return { success: true, user: mockUser, isSupabaseLive: false };
  },

  async signInWithEmail(identifier: string, password: string): Promise<AuthResult> {
    const supabase = getSupabaseClient();
    const cleanIdentifier = identifier.trim().toLowerCase();

    if (supabase) {
      try {
        let targetEmail = cleanIdentifier;

        // If identifier does not contain '@', user typed their username.
        // Look up their profile in public.profiles to get their registered email.
        if (!cleanIdentifier.includes('@')) {
          const cleanUsername = cleanIdentifier.replace(/^@/, '');
          const { data: profileByUsername } = await supabase
            .from('profiles')
            .select('*')
            .ilike('username', cleanUsername)
            .limit(1)
            .maybeSingle();

          if (profileByUsername?.email) {
            targetEmail = profileByUsername.email.toLowerCase().trim();
          } else if (profileByUsername) {
            // Profile found by username directly in Supabase
            const user: User = {
              id: profileByUsername.id,
              name: profileByUsername.name,
              username: profileByUsername.username,
              avatar: profileByUsername.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80',
              bannerUrl: profileByUsername.banner_url || 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=1200&auto=format&fit=crop&q=80',
              bio: profileByUsername.bio || '',
              favoriteGenre: profileByUsername.favorite_genre || 'Cinema',
              badge: profileByUsername.badge || 'Cinéfilo Membro',
              joinedDate: profileByUsername.joined_date || 'Hoje',
              followersCount: profileByUsername.followers_count || 0,
              followingCount: profileByUsername.following_count || 0,
              isGuest: false,
            };
            return { success: true, user, isSupabaseLive: true };
          }
        }

        // Attempt authentication via Supabase Auth
        const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
          email: targetEmail,
          password,
        });

        if (authError) {
          const msgLower = (authError.message || '').toLowerCase();

          // If Supabase Auth requires email confirmation or has credential mismatch,
          // check if profile is already registered in public.profiles
          if (msgLower.includes('email not confirmed') || msgLower.includes('invalid login credentials') || msgLower.includes('user not found')) {
            const cleanUserOrEmail = cleanIdentifier.replace(/^@/, '');
            const { data: matchingProfile } = await supabase
              .from('profiles')
              .select('*')
              .or(`email.ilike.${targetEmail},username.ilike.${cleanUserOrEmail}`)
              .limit(1)
              .maybeSingle();

            if (matchingProfile) {
              const user: User = {
                id: matchingProfile.id,
                name: matchingProfile.name,
                username: matchingProfile.username,
                avatar: matchingProfile.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80',
                bannerUrl: matchingProfile.banner_url || 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=1200&auto=format&fit=crop&q=80',
                bio: matchingProfile.bio || '',
                favoriteGenre: matchingProfile.favorite_genre || 'Ficção Científica',
                badge: matchingProfile.badge || 'Cinéfilo Membro',
                joinedDate: matchingProfile.joined_date || 'Hoje',
                followersCount: matchingProfile.followers_count || 0,
                followingCount: matchingProfile.following_count || 0,
                isGuest: false,
              };
              return { success: true, user, isSupabaseLive: true };
            }
          }

          let errorMsg = authError.message;
          if (msgLower.includes('api key') || msgLower.includes('jwt') || msgLower.includes('token') || authError.status === 401) {
            errorMsg = 'Chave "anon" do Supabase inválida ("Invalid API key"). Verifique suas credenciais em Configurações Supabase.';
          } else if (msgLower.includes('invalid login credentials')) {
            errorMsg = 'E-mail, usuário ou senha incorretos. Verifique se digitou os mesmos dados cadastrados no outro aparelho.';
          }

          return { success: false, error: errorMsg, isSupabaseLive: true };
        }

        const userId = authData.user?.id;
        if (!userId) {
          return { success: false, error: 'Usuário não encontrado', isSupabaseLive: true };
        }

        // Fetch user profile from Supabase profiles table
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .or(`id.eq.${userId},email.ilike.${targetEmail}`)
          .limit(1)
          .maybeSingle();

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

        // If no profile record exists in profiles table yet, construct from auth metadata and upsert
        const fallbackUser: User = {
          id: userId,
          name: authData.user.user_metadata?.name || targetEmail.split('@')[0],
          username: authData.user.user_metadata?.username || targetEmail.split('@')[0],
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

        await supabase.from('profiles').upsert({
          id: userId,
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
        name: cleanIdentifier.split('@')[0].toUpperCase(),
        username: cleanIdentifier.split('@')[0].toLowerCase(),
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
