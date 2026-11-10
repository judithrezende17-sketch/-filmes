'use client';

import React, { useState, useEffect } from 'react';
import { User, Movie, Comment } from '@/types';
import { INITIAL_USERS, INITIAL_MOVIES, INITIAL_COMMENTS } from '@/lib/initialData';
import { Navbar } from '@/components/Navbar';
import { ProfileView } from '@/components/ProfileView';
import { CommunityView } from '@/components/CommunityView';
import { AllMoviesFeed } from '@/components/AllMoviesFeed';
import { GuestbookFeed } from '@/components/GuestbookFeed';
import { AuthModal } from '@/components/AuthModal';
import { AddEditMovieModal } from '@/components/AddEditMovieModal';
import { MovieModal } from '@/components/MovieModal';
import { EditProfileModal } from '@/components/EditProfileModal';
import { LoginScreen } from '@/components/LoginScreen';
import { supabaseService } from '@/services/supabaseService';
import { Film, Sparkles, CheckCircle2, Heart, MessageSquare, LogOut } from 'lucide-react';

const STORAGE_KEY_USERS = 'lumina_cinema_users_v2';
const STORAGE_KEY_MOVIES = 'lumina_cinema_movies_v2';
const STORAGE_KEY_COMMENTS = 'lumina_cinema_comments_v2';
const STORAGE_KEY_CURRENT_USER = 'lumina_cinema_current_user_id_v2';

export default function HomePage() {
  // Application Data States initialized with lazy storage check
  const [users, setUsers] = useState<User[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem(STORAGE_KEY_USERS);
        if (stored) {
          const parsed: User[] = JSON.parse(stored);
          if (Array.isArray(parsed) && parsed.length > 0) return parsed;
        }
      } catch (e) {
        console.warn(e);
      }
    }
    return INITIAL_USERS;
  });

  const [movies, setMovies] = useState<Movie[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem(STORAGE_KEY_MOVIES);
        if (stored) {
          const parsed: Movie[] = JSON.parse(stored);
          if (Array.isArray(parsed) && parsed.length > 0) return parsed;
        }
      } catch (e) {
        console.warn(e);
      }
    }
    return INITIAL_MOVIES;
  });

  const [comments, setComments] = useState<Comment[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem(STORAGE_KEY_COMMENTS);
        if (stored) {
          const parsed: Comment[] = JSON.parse(stored);
          if (Array.isArray(parsed) && parsed.length > 0) return parsed;
        }
      } catch (e) {
        console.warn(e);
      }
    }
    return INITIAL_COMMENTS;
  });

  const [currentUserId, setCurrentUserId] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem(STORAGE_KEY_CURRENT_USER);
        if (stored) return stored;
      } catch (e) {
        console.warn(e);
      }
    }
    return INITIAL_USERS[0].id;
  });

  const [viewedUserId, setViewedUserId] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem(STORAGE_KEY_CURRENT_USER);
        if (stored) return stored;
      } catch (e) {
        console.warn(e);
      }
    }
    return INITIAL_USERS[0].id;
  });

  // User Authentication State - Starts false so app starts on the Login Screen
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

  // Active View Tab
  const [activeTab, setActiveTab] = useState<'my-profile' | 'community' | 'all-movies' | 'guestbook-feed'>('my-profile');

  // Search filter
  const [searchTerm, setSearchTerm] = useState('');

  // Modals state
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isAddEditMovieModalOpen, setIsAddEditMovieModalOpen] = useState(false);
  const [editingMovie, setEditingMovie] = useState<Movie | null>(null);
  const [selectedMovieForDetails, setSelectedMovieForDetails] = useState<Movie | null>(null);
  const [isEditProfileModalOpen, setIsEditProfileModalOpen] = useState(false);

  // Transient Toast Notification
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  // Sync to LocalStorage
  const saveUsers = (updatedUsers: User[]) => {
    setUsers(updatedUsers);
    try {
      localStorage.setItem(STORAGE_KEY_USERS, JSON.stringify(updatedUsers));
    } catch (e) {
      console.error(e);
    }
  };

  const saveMovies = (updatedMovies: Movie[]) => {
    setMovies(updatedMovies);
    try {
      localStorage.setItem(STORAGE_KEY_MOVIES, JSON.stringify(updatedMovies));
    } catch (e) {
      console.error(e);
    }
  };

  const saveComments = (updatedComments: Comment[]) => {
    setComments(updatedComments);
    try {
      localStorage.setItem(STORAGE_KEY_COMMENTS, JSON.stringify(updatedComments));
    } catch (e) {
      console.error(e);
    }
  };

  // Current active user object
  const currentUser = users.find((u) => u.id === currentUserId) || users[0] || INITIAL_USERS[0];
  // User whose profile page is currently on screen
  const viewedUser = users.find((u) => u.id === viewedUserId) || currentUser;

  // Movies of the currently viewed profile
  const viewedUserMovies = movies.filter((m) => m.userId === viewedUser.id);
  // Comments on the currently viewed profile
  const viewedUserComments = comments.filter((c) => c.targetUserId === viewedUser.id);

  // --- Handlers ---

  const handleSelectUser = (user: User) => {
    setCurrentUserId(user.id);
    setViewedUserId(user.id);
    try {
      localStorage.setItem(STORAGE_KEY_CURRENT_USER, user.id);
    } catch (e) {
      console.error(e);
    }
    showToast(`Conectado como ${user.name}`);
  };

  const handleRegisterUser = (newUser: User) => {
    const updated = [newUser, ...users];
    saveUsers(updated);
    setCurrentUserId(newUser.id);
    setViewedUserId(newUser.id);
    try {
      localStorage.setItem(STORAGE_KEY_CURRENT_USER, newUser.id);
    } catch (e) {
      console.error(e);
    }
    setActiveTab('my-profile');
    showToast(`Bem-vindo ao Lumina, ${newUser.name}! Seu cadastro foi concluído.`);
  };

  const handleSelectUserToView = (user: User) => {
    setViewedUserId(user.id);
    setActiveTab('my-profile');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Initial Supabase remote sync if project is configured
  useEffect(() => {
    if (supabaseService.isConfigured()) {
      supabaseService.loadAllData().then((res) => {
        if (res.isSupabaseLive) {
          // Merge users without wiping any locally added user
          setUsers((currentUsers) => {
            const userMap = new Map<string, User>();
            INITIAL_USERS.forEach((u) => userMap.set(u.id, u));
            currentUsers.forEach((u) => userMap.set(u.id, u));
            res.users.forEach((u) => userMap.set(u.id, u));
            const merged = Array.from(userMap.values());
            saveUsers(merged);
            return merged;
          });

          // Merge movies without wiping any locally added/favorited movie
          setMovies((currentMovies) => {
            const movieMap = new Map<string, Movie>();
            INITIAL_MOVIES.forEach((m) => movieMap.set(m.id, m));
            currentMovies.forEach((m) => movieMap.set(m.id, m));
            res.movies.forEach((m) => movieMap.set(m.id, m));
            const merged = Array.from(movieMap.values());
            saveMovies(merged);
            return merged;
          });

          // Merge comments
          setComments((currentComments) => {
            const commentMap = new Map<string, Comment>();
            INITIAL_COMMENTS.forEach((c) => commentMap.set(c.id, c));
            currentComments.forEach((c) => commentMap.set(c.id, c));
            res.comments.forEach((c) => commentMap.set(c.id, c));
            const merged = Array.from(commentMap.values());
            saveComments(merged);
            return merged;
          });
        }
      });
    }
  }, []);

  const handleSaveMovie = (
    movieData: Omit<Movie, 'id' | 'createdAt' | 'likesCount' | 'likedBy'> & { id?: string }
  ) => {
    if (movieData.id) {
      // Editing
      const updated = movies.map((m) => {
        if (m.id === movieData.id) {
          const updatedMovie = { ...m, ...movieData };
          supabaseService.saveMovie(updatedMovie, currentUser);
          return updatedMovie;
        }
        return m;
      });
      saveMovies(updated);
      showToast(`Filme "${movieData.title}" atualizado com sucesso!`);
    } else {
      // Adding new
      const newMovie: Movie = {
        ...movieData,
        id: `mov_${Date.now()}`,
        userId: currentUser.id,
        likesCount: 1,
        likedBy: [currentUser.id],
        createdAt: new Date().toISOString().split('T')[0],
      };
      supabaseService.saveMovie(newMovie, currentUser);
      const updated = [newMovie, ...movies];
      saveMovies(updated);
      showToast(`"${newMovie.title}" adicionado aos seus favoritos!`);
    }
    setEditingMovie(null);
  };

  const handleDeleteMovie = (movieId: string) => {
    const target = movies.find((m) => m.id === movieId);
    const updated = movies.filter((m) => m.id !== movieId);
    supabaseService.deleteMovie(movieId);
    saveMovies(updated);
    showToast(`"${target?.title || 'Filme'}" foi removido dos favoritos.`);
  };

  const handleToggleLikeMovie = (movieId: string) => {
    const updated = movies.map((m) => {
      if (m.id === movieId) {
        const alreadyLiked = m.likedBy?.includes(currentUser.id);
        const newLikedBy = alreadyLiked
          ? m.likedBy.filter((id) => id !== currentUser.id)
          : [...(m.likedBy || []), currentUser.id];
        const updatedMovie = {
          ...m,
          likedBy: newLikedBy,
          likesCount: newLikedBy.length,
        };
        supabaseService.saveMovie(updatedMovie);
        return updatedMovie;
      }
      return m;
    });
    saveMovies(updated);
  };

  const handleAddComment = ({
    targetUserId,
    movieId,
    movieTitle,
    content,
  }: {
    targetUserId: string;
    movieId?: string;
    movieTitle?: string;
    content: string;
  }) => {
    const newComm: Comment = {
      id: `comm_${Date.now()}`,
      targetUserId,
      movieId,
      movieTitle,
      authorId: currentUser.id,
      authorName: currentUser.name,
      authorUsername: currentUser.username,
      authorAvatar: currentUser.avatar,
      content,
      createdAt: 'Agora mesmo',
      likes: 0,
      likedBy: [],
    };

    supabaseService.saveComment(newComm, currentUser);
    const updated = [newComm, ...comments];
    saveComments(updated);
    showToast('Seu recado foi publicado com sucesso!');
  };

  const handleDeleteComment = (commentId: string) => {
    const updated = comments.filter((c) => c.id !== commentId);
    supabaseService.deleteComment(commentId);
    saveComments(updated);
    showToast('Recado removido.');
  };

  const handleToggleLikeComment = (commentId: string) => {
    const updated = comments.map((c) => {
      if (c.id === commentId) {
        const alreadyLiked = c.likedBy?.includes(currentUser.id);
        const newLikedBy = alreadyLiked
          ? (c.likedBy || []).filter((id) => id !== currentUser.id)
          : [...(c.likedBy || []), currentUser.id];
        const updatedComment = {
          ...c,
          likedBy: newLikedBy,
          likes: newLikedBy.length,
        };
        supabaseService.saveComment(updatedComment);
        return updatedComment;
      }
      return c;
    });
    saveComments(updated);
  };

  const handleSaveProfile = (updatedData: Partial<User>) => {
    const updatedUsers = users.map((u) => {
      if (u.id === currentUser.id) {
        const updatedUser = { ...u, ...updatedData };
        supabaseService.updateProfile(updatedUser);
        return updatedUser;
      }
      return u;
    });
    saveUsers(updatedUsers);
    showToast('Perfil atualizado com sucesso!');
  };

  const handleLoginSuccess = (user: User, isSupabaseLive: boolean) => {
    setUsers((prev) => {
      const exists = prev.some((u) => u.id === user.id);
      const updated = exists ? prev.map((u) => (u.id === user.id ? user : u)) : [user, ...prev];
      saveUsers(updated);
      return updated;
    });
    setCurrentUserId(user.id);
    setViewedUserId(user.id);
    setIsAuthenticated(true);
    try {
      localStorage.setItem(STORAGE_KEY_CURRENT_USER, user.id);
    } catch (e) {
      console.error(e);
    }
    showToast(
      isSupabaseLive
        ? `Autenticado com sucesso via Supabase! Bem-vindo(a), ${user.name}.`
        : `Conectado como ${user.name}!`
    );

    // Immediately sync remote data from Supabase across devices
    if (supabaseService.isConfigured()) {
      supabaseService.loadAllData().then((res) => {
        if (res.isSupabaseLive) {
          if (res.movies.length > 0) {
            setMovies((currentMovies) => {
              const movieMap = new Map<string, Movie>();
              INITIAL_MOVIES.forEach((m) => movieMap.set(m.id, m));
              currentMovies.forEach((m) => movieMap.set(m.id, m));
              res.movies.forEach((m) => movieMap.set(m.id, m));
              const merged = Array.from(movieMap.values());
              saveMovies(merged);
              return merged;
            });
          }
          if (res.comments.length > 0) {
            setComments((currentComments) => {
              const commentMap = new Map<string, Comment>();
              INITIAL_COMMENTS.forEach((c) => commentMap.set(c.id, c));
              currentComments.forEach((c) => commentMap.set(c.id, c));
              res.comments.forEach((c) => commentMap.set(c.id, c));
              const merged = Array.from(commentMap.values());
              saveComments(merged);
              return merged;
            });
          }
        }
      });
    }
  };

  const handleLoginAsVisitor = (name: string, bio: string, avatar: string) => {
    const updatedUsers = users.map((u) =>
      u.id === 'user_visitor'
        ? {
            ...u,
            name: name || u.name,
            bio: bio || u.bio,
            avatar: avatar || u.avatar,
          }
        : u
    );
    saveUsers(updatedUsers);
    setCurrentUserId('user_visitor');
    setViewedUserId('user_visitor');
    setIsAuthenticated(true);
    try {
      localStorage.setItem(STORAGE_KEY_CURRENT_USER, 'user_visitor');
    } catch (e) {
      console.error(e);
    }
    showToast(`Bem-vindo(a), ${name || 'Visitante'}! Você entrou no Lumina CineClub.`);
  };

  const handleSelectUserFromLogin = (user: User) => {
    handleSelectUser(user);
    setIsAuthenticated(true);
    if (supabaseService.isConfigured()) {
      supabaseService.loadAllData().then((res) => {
        if (res.isSupabaseLive && res.movies.length > 0) {
          setMovies((currentMovies) => {
            const movieMap = new Map<string, Movie>();
            INITIAL_MOVIES.forEach((m) => movieMap.set(m.id, m));
            currentMovies.forEach((m) => movieMap.set(m.id, m));
            res.movies.forEach((m) => movieMap.set(m.id, m));
            const merged = Array.from(movieMap.values());
            saveMovies(merged);
            return merged;
          });
        }
      });
    }
  };

  const handleLogout = () => {
    supabaseService.signOut();
    setIsAuthenticated(false);
    showToast('Você saiu da sua conta. Até logo!');
  };

  const handleDeleteUser = (userId: string) => {
    const userToDelete = users.find((u) => u.id === userId);
    const updatedUsers = users.filter((u) => u.id !== userId);
    const updatedMovies = movies.filter((m) => m.userId !== userId);
    const updatedComments = comments.filter((c) => c.targetUserId !== userId && c.authorId !== userId);

    const safeUsers = updatedUsers.length > 0 ? updatedUsers : INITIAL_USERS;
    saveUsers(safeUsers);
    saveMovies(updatedMovies);
    saveComments(updatedComments);
    supabaseService.deleteProfile(userId);

    if (currentUserId === userId) {
      setIsAuthenticated(false);
      const nextUser = safeUsers[0];
      setCurrentUserId(nextUser.id);
      setViewedUserId(nextUser.id);
      try {
        localStorage.setItem(STORAGE_KEY_CURRENT_USER, nextUser.id);
      } catch (e) {
        console.error(e);
      }
      showToast(`O perfil de "${userToDelete?.name || 'usuário'}" foi excluído com sucesso.`);
    } else {
      if (viewedUserId === userId) {
        setViewedUserId(currentUserId);
      }
      showToast(`O perfil de "${userToDelete?.name || 'usuário'}" foi excluído.`);
    }
  };

  // If not authenticated, the app starts directly with the Cinema Login Screen
  if (!isAuthenticated) {
    return (
      <>
        <LoginScreen
          allUsers={users}
          onLoginSuccess={handleLoginSuccess}
          onLoginAsVisitor={handleLoginAsVisitor}
          onSelectExistingUser={handleSelectUserFromLogin}
          onDeleteUser={handleDeleteUser}
        />

        {toastMessage && (
          <div className="fixed bottom-6 right-6 z-50 bg-[#0D1F1C] border border-[#00D2FF]/50 text-[#F0FDF8] px-4 py-3 rounded-xl shadow-[0_0_24px_rgba(0,210,255,0.3)] flex items-center gap-2.5 animate-in slide-in-from-bottom-3 duration-200">
            <CheckCircle2 className="w-5 h-5 text-[#00D2FF] flex-shrink-0" />
            <span className="text-xs sm:text-sm font-semibold">{toastMessage}</span>
          </div>
        )}
      </>
    );
  }

  return (
    <div className="min-h-screen bg-[#060D0B] text-[#F0FDF8] flex flex-col font-sans selection:bg-[#00D2FF]/30 selection:text-[#00D2FF]">
      {/* Top Navbar */}
      <Navbar
        currentUser={currentUser}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenAuthModal={() => setIsAuthModalOpen(true)}
        onOpenAddMovieModal={() => {
          setEditingMovie(null);
          setIsAddEditMovieModalOpen(true);
        }}
        onSelectUserToView={handleSelectUserToView}
        onLogout={handleLogout}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        allUsers={users}
      />

      {/* Main Viewport Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 pb-24 lg:pb-8">
        {activeTab === 'my-profile' && (
          <ProfileView
            viewedUser={viewedUser}
            currentUser={currentUser}
            movies={viewedUserMovies}
            comments={viewedUserComments}
            onOpenAddMovieModal={() => {
              setEditingMovie(null);
              setIsAddEditMovieModalOpen(true);
            }}
            onOpenEditMovieModal={(mov) => {
              setEditingMovie(mov);
              setIsAddEditMovieModalOpen(true);
            }}
            onDeleteMovie={handleDeleteMovie}
            onToggleLikeMovie={handleToggleLikeMovie}
            onOpenMovieDetails={(mov) => setSelectedMovieForDetails(mov)}
            onOpenEditProfileModal={() => setIsEditProfileModalOpen(true)}
            onAddComment={handleAddComment}
            onDeleteComment={handleDeleteComment}
            onToggleLikeComment={handleToggleLikeComment}
            onBackToMyProfile={() => setViewedUserId(currentUser.id)}
          />
        )}

        {activeTab === 'community' && (
          <CommunityView
            users={users}
            movies={movies}
            currentUser={currentUser}
            onSelectUserToView={handleSelectUserToView}
          />
        )}

        {activeTab === 'all-movies' && (
          <AllMoviesFeed
            movies={movies}
            users={users}
            currentUser={currentUser}
            comments={comments}
            onOpenMovieDetails={(mov) => setSelectedMovieForDetails(mov)}
            onToggleLikeMovie={handleToggleLikeMovie}
            onVisitOwner={handleSelectUserToView}
            onOpenAddMovieModal={() => {
              setEditingMovie(null);
              setIsAddEditMovieModalOpen(true);
            }}
          />
        )}

        {activeTab === 'guestbook-feed' && (
          <GuestbookFeed
            comments={comments}
            users={users}
            movies={movies}
            currentUser={currentUser}
            onToggleLikeComment={handleToggleLikeComment}
            onSelectUserToView={handleSelectUserToView}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="mt-auto border-t border-white/[0.08] bg-[#091412] py-8 text-xs text-[#94A8A3]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Film className="w-4 h-4 text-[#00D2FF]" />
            <span className="font-extrabold text-sm text-[#F0FDF8]">LUMINA CINECLUB</span>
            <span>— A rede social dos verdadeiros amantes do cinema</span>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={handleLogout}
              className="text-[#00D2FF] hover:underline font-semibold flex items-center gap-1.5"
            >
              <LogOut className="w-3.5 h-3.5" />
              Sair / Ir para Tela de Login
            </button>
            <span>•</span>
            <button
              onClick={() => {
                if (confirm('Deseja resetar os dados locais para os cinéfilos originais?')) {
                  localStorage.removeItem(STORAGE_KEY_USERS);
                  localStorage.removeItem(STORAGE_KEY_MOVIES);
                  localStorage.removeItem(STORAGE_KEY_COMMENTS);
                  localStorage.removeItem(STORAGE_KEY_CURRENT_USER);
                  window.location.reload();
                }
              }}
              className="text-[#4D635F] hover:text-[#94A8A3]"
            >
              Restaurar Dados Padrão
            </button>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        currentUser={currentUser}
        allUsers={users}
        onSelectUser={handleSelectUser}
        onRegisterUser={handleRegisterUser}
        onDeleteUser={handleDeleteUser}
      />

      <AddEditMovieModal
        key={editingMovie ? editingMovie.id : isAddEditMovieModalOpen ? 'open-new' : 'closed'}
        isOpen={isAddEditMovieModalOpen}
        onClose={() => {
          setIsAddEditMovieModalOpen(false);
          setEditingMovie(null);
        }}
        onSave={handleSaveMovie}
        editingMovie={editingMovie}
        currentUserId={currentUser.id}
      />

      <MovieModal
        movie={selectedMovieForDetails}
        onClose={() => setSelectedMovieForDetails(null)}
        currentUser={currentUser}
        allUsers={users}
        comments={comments}
        onToggleLike={handleToggleLikeMovie}
        onAddComment={handleAddComment}
        onDeleteComment={handleDeleteComment}
        onVisitOwner={handleSelectUserToView}
      />

      <EditProfileModal
        key={currentUser.id + String(isEditProfileModalOpen)}
        isOpen={isEditProfileModalOpen}
        onClose={() => setIsEditProfileModalOpen(false)}
        currentUser={currentUser}
        onSaveProfile={handleSaveProfile}
        onDeleteProfile={() => handleDeleteUser(currentUser.id)}
      />

      {/* Transient Toast */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#0D1F1C] border border-[#00D2FF]/50 text-[#F0FDF8] px-4 py-3 rounded-xl shadow-[0_0_24px_rgba(0,210,255,0.3)] flex items-center gap-2.5 animate-in slide-in-from-bottom-3 duration-200">
          <CheckCircle2 className="w-5 h-5 text-[#00D2FF] flex-shrink-0" />
          <span className="text-xs sm:text-sm font-semibold">{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
