'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { User, Movie, Comment } from '@/types';
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
import { Film, CheckCircle2, LogOut, RefreshCw } from 'lucide-react';

export default function HomePage() {
  // Real Supabase Auth session state (zero localStorage/mock fallback)
  const [authUser, setAuthUser] = useState<User | null>(null);
  const [isCheckingAuth, setIsCheckingAuth] = useState<boolean>(true);
  const [authConfigError, setAuthConfigError] = useState<string | null>(null);
  const [credsVersion, setCredsVersion] = useState<number>(0);

  // Cloud database states
  const [users, setUsers] = useState<User[]>([]);
  const [movies, setMovies] = useState<Movie[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [viewedUserId, setViewedUserId] = useState<string>('');

  // Cloud sync loading indicator
  const [isLoadingData, setIsLoadingData] = useState<boolean>(false);

  // Active View Tab
  const [activeTab, setActiveTab] = useState<
    'my-profile' | 'community' | 'all-movies' | 'guestbook-feed'
  >('my-profile');

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

  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  }, []);

  /**
   * Load authoritative data directly from Supabase tables (profiles, movies, comments).
   */
  const loadCloudData = useCallback(async () => {
    setIsLoadingData(true);
    try {
      const res = await supabaseService.loadAllData();
      if (res.isSupabaseLive) {
        setUsers(res.users);
        setMovies(res.movies);
        setComments(res.comments);
      }
    } catch (e) {
      console.error('Failed to load cloud data from Supabase:', e);
    } finally {
      setIsLoadingData(false);
    }
  }, []);

  // Initialize and subscribe to real Supabase Auth session (getSession + onAuthStateChange)
  useEffect(() => {
    let isMounted = true;

    supabaseService.getSessionUser().then(({ user, error }) => {
      if (!isMounted) return;
      if (error) {
        setAuthConfigError(error);
      } else {
        setAuthConfigError(null);
      }

      if (user) {
        setAuthUser(user);
        setViewedUserId((prev) => prev || user.id);
        loadCloudData();
      } else {
        setAuthUser(null);
      }
      setIsCheckingAuth(false);
    });

    const unsubscribe = supabaseService.onAuthStateChange((event, user) => {
      if (!isMounted) return;
      if (user) {
        setAuthUser(user);
        setAuthConfigError(null);
        setViewedUserId((prev) => (event === 'SIGNED_IN' || !prev ? user.id : prev));
        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || event === 'USER_UPDATED') {
          loadCloudData();
        }
      } else if (event === 'SIGNED_OUT') {
        setAuthUser(null);
        setViewedUserId('');
        setIsAuthModalOpen(false);
      }
      setIsCheckingAuth(false);
    });

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, [credsVersion, loadCloudData]);

  // Merge authUser into users list in case public.profiles insert was blocked by RLS
  const allUsers = useMemo(() => {
    if (!authUser) return users;
    const exists = users.some((u) => u.id === authUser.id);
    return exists ? users.map((u) => (u.id === authUser.id ? { ...u, ...authUser, bio: u.bio || authUser.bio, avatar: u.avatar || authUser.avatar } : u)) : [authUser, ...users];
  }, [users, authUser]);

  // Current active authenticated user object
  const currentUser = useMemo(() => {
    if (!authUser) return null;
    return allUsers.find((u) => u.id === authUser.id) || authUser;
  }, [allUsers, authUser]);

  // User whose profile page is currently on screen
  const viewedUser = useMemo(() => {
    if (!currentUser) return null;
    return allUsers.find((u) => u.id === viewedUserId) || currentUser;
  }, [allUsers, viewedUserId, currentUser]);

  // Movies & comments of the currently viewed profile
  const viewedUserMovies = useMemo(
    () => (viewedUser ? movies.filter((m) => m.userId === viewedUser.id) : []),
    [movies, viewedUser]
  );
  const viewedUserComments = useMemo(
    () => (viewedUser ? comments.filter((c) => c.targetUserId === viewedUser.id) : []),
    [comments, viewedUser]
  );

  // --- Handlers ---

  const handleSelectUserToView = (user: User) => {
    setViewedUserId(user.id);
    setActiveTab('my-profile');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSaveMovie = async (
    movieData: Omit<Movie, 'id' | 'createdAt' | 'likesCount' | 'likedBy'> & { id?: string }
  ) => {
    if (!currentUser) return;
    if (movieData.id) {
      const target = movies.find((m) => m.id === movieData.id);
      const updatedMovie: Movie = {
        ...(target || (movieData as any)),
        ...movieData,
      };
      setMovies((prev) => prev.map((m) => (m.id === updatedMovie.id ? updatedMovie : m)));
      await supabaseService.saveMovie(updatedMovie, currentUser);
      showToast(`Filme "${movieData.title}" atualizado no Supabase!`);
    } else {
      const newMovie: Movie = {
        ...movieData,
        id: `mov_${Date.now()}`,
        userId: currentUser.id,
        likesCount: 1,
        likedBy: [currentUser.id],
        createdAt: new Date().toISOString().split('T')[0],
      };
      setMovies((prev) => [newMovie, ...prev]);
      await supabaseService.saveMovie(newMovie, currentUser);
      showToast(`"${newMovie.title}" adicionado e salvo no Supabase!`);
    }
    setEditingMovie(null);
  };

  const handleDeleteMovie = async (movieId: string) => {
    const target = movies.find((m) => m.id === movieId);
    setMovies((prev) => prev.filter((m) => m.id !== movieId));
    await supabaseService.deleteMovie(movieId);
    showToast(`"${target?.title || 'Filme'}" foi removido do Supabase.`);
  };

  const handleToggleLikeMovie = async (movieId: string) => {
    if (!currentUser) return;
    const target = movies.find((m) => m.id === movieId);
    if (!target) return;
    const alreadyLiked = target.likedBy?.includes(currentUser.id);
    const newLikedBy = alreadyLiked
      ? (target.likedBy || []).filter((id) => id !== currentUser.id)
      : [...(target.likedBy || []), currentUser.id];
    const updatedMovie: Movie = {
      ...target,
      likedBy: newLikedBy,
      likesCount: newLikedBy.length,
    };
    setMovies((prev) => prev.map((m) => (m.id === movieId ? updatedMovie : m)));
    await supabaseService.saveMovie(updatedMovie);
  };

  const handleAddComment = async ({
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
    if (!currentUser) return;
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

    setComments((prev) => [newComm, ...prev]);
    await supabaseService.saveComment(newComm, currentUser);
    showToast('Seu recado foi salvo no Supabase!');
  };

  const handleDeleteComment = async (commentId: string) => {
    setComments((prev) => prev.filter((c) => c.id !== commentId));
    await supabaseService.deleteComment(commentId);
    showToast('Recado removido do Supabase.');
  };

  const handleToggleLikeComment = async (commentId: string) => {
    if (!currentUser) return;
    const target = comments.find((c) => c.id === commentId);
    if (!target) return;
    const alreadyLiked = target.likedBy?.includes(currentUser.id);
    const newLikedBy = alreadyLiked
      ? (target.likedBy || []).filter((id) => id !== currentUser.id)
      : [...(target.likedBy || []), currentUser.id];
    const updatedComment: Comment = {
      ...target,
      likedBy: newLikedBy,
      likes: newLikedBy.length,
    };
    setComments((prev) => prev.map((c) => (c.id === commentId ? updatedComment : c)));
    await supabaseService.saveComment(updatedComment);
  };

  const handleSaveProfile = async (updatedData: Partial<User>) => {
    if (!currentUser) return;
    const updatedUser = { ...currentUser, ...updatedData };
    setAuthUser(updatedUser);
    setUsers((prev) => {
      const exists = prev.some((u) => u.id === updatedUser.id);
      return exists ? prev.map((u) => (u.id === updatedUser.id ? updatedUser : u)) : [updatedUser, ...prev];
    });
    await supabaseService.updateProfile(updatedUser);
    showToast('Perfil atualizado no Supabase com sucesso!');
  };

  const handleLoginSuccess = async (user: User) => {
    setAuthUser(user);
    setViewedUserId(user.id);
    setActiveTab('my-profile');
    showToast(`Autenticado via Supabase Auth! Bem-vindo(a), ${user.name}.`);
    await loadCloudData();
  };

  const handleLogout = async () => {
    const { error } = await supabaseService.signOut();
    if (error) {
      showToast(`Erro ao sair: ${error}`);
      return;
    }
    setAuthUser(null);
    setViewedUserId('');
    showToast('Sessão encerrada no Supabase Auth. Até logo!');
  };

  const handleDeleteUser = async (userId: string) => {
    const userToDelete = allUsers.find((u) => u.id === userId);
    setUsers((prev) => prev.filter((u) => u.id !== userId));
    setMovies((prev) => prev.filter((m) => m.userId !== userId));
    setComments((prev) => prev.filter((c) => c.targetUserId !== userId && c.authorId !== userId));

    await supabaseService.deleteProfile(userId);

    if (currentUser?.id === userId) {
      await supabaseService.signOut();
      setAuthUser(null);
      setViewedUserId('');
      showToast(`O perfil de "${userToDelete?.name || 'usuário'}" foi excluído.`);
    }
  };

  // Loading state while verifying real Supabase Auth session on page load
  if (isCheckingAuth) {
    return (
      <div className="min-h-screen w-full bg-[#060D0B] flex flex-col items-center justify-center p-6 text-[#F0FDF8]">
        <div className="w-14 h-14 rounded-2xl bg-[#0D1F1C] border border-[#00D2FF]/40 flex items-center justify-center shadow-[0_0_24px_rgba(0,210,255,0.25)] mb-4">
          <RefreshCw className="w-7 h-7 text-[#00D2FF] animate-spin" />
        </div>
        <h2 className="text-base font-bold tracking-tight">Verificando sessão no Supabase Auth...</h2>
        <p className="text-xs text-[#94A8A3] mt-1">Conectando de forma segura ao seu projeto.</p>
      </div>
    );
  }

  // If no real Supabase Auth session is active, show LoginScreen
  if (!authUser || !currentUser || !viewedUser) {
    return (
      <>
        <LoginScreen
          onLoginSuccess={handleLoginSuccess}
          configError={authConfigError}
          onCredentialsUpdated={() => setCredsVersion((v) => v + 1)}
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
        allUsers={allUsers}
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
            users={allUsers}
            movies={movies}
            currentUser={currentUser}
            onSelectUserToView={handleSelectUserToView}
          />
        )}

        {activeTab === 'all-movies' && (
          <AllMoviesFeed
            movies={movies}
            users={allUsers}
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
            users={allUsers}
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
                loadCloudData();
                showToast('Dados sincronizados com o Supabase com sucesso!');
              }}
              className="text-[#00D2FF] hover:underline font-semibold flex items-center gap-1.5"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoadingData ? 'animate-spin' : ''}`} />
              Sincronizar com Supabase
            </button>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        currentUser={currentUser}
        onAuthenticatedUser={handleLoginSuccess}
        onLogout={handleLogout}
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
        allUsers={allUsers}
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
