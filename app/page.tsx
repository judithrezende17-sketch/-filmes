'use client';

import React, { useState, useEffect, useCallback } from 'react';
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
import { Film, CheckCircle2, LogOut, RefreshCw } from 'lucide-react';

export default function HomePage() {
  // Application Data States - 100% cloud-authoritative in Supabase (Zero localStorage)
  const [users, setUsers] = useState<User[]>(INITIAL_USERS);
  const [movies, setMovies] = useState<Movie[]>(INITIAL_MOVIES);
  const [comments, setComments] = useState<Comment[]>(INITIAL_COMMENTS);

  const [currentUserId, setCurrentUserId] = useState<string>(INITIAL_USERS[0].id);
  const [viewedUserId, setViewedUserId] = useState<string>(INITIAL_USERS[0].id);

  // Cloud sync loading indicator
  const [isLoadingData, setIsLoadingData] = useState<boolean>(true);

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

  /**
   * Load authoritative data directly from Supabase tables (profiles, movies, comments).
   * Cross-device guarantee: mobile and desktop always see the exact same cloud database.
   */
  const loadCloudData = useCallback(async () => {
    setIsLoadingData(true);
    try {
      const res = await supabaseService.loadAllData();
      if (res.isSupabaseLive) {
        if (res.users.length > 0) {
          setUsers(res.users);
        }
        if (res.movies.length > 0) {
          setMovies(res.movies);
        }
        if (res.comments.length > 0) {
          setComments(res.comments);
        }
      }
    } catch (e) {
      console.warn('Failed to load cloud data from Supabase:', e);
    } finally {
      setIsLoadingData(false);
    }
  }, []);

  // Fetch Supabase cloud data on initial mount without synchronous setState in effect body
  useEffect(() => {
    let isMounted = true;

    supabaseService
      .loadAllData()
      .then((res) => {
        if (!isMounted) return;
        if (res.isSupabaseLive) {
          if (res.users.length > 0) setUsers(res.users);
          if (res.movies.length > 0) setMovies(res.movies);
          if (res.comments.length > 0) setComments(res.comments);
        }
      })
      .catch((e) => {
        console.warn('Error fetching Supabase cloud data on mount:', e);
      })
      .finally(() => {
        if (isMounted) {
          setIsLoadingData(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

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
    showToast(`Conectado como ${user.name}`);
  };

  const handleRegisterUser = async (newUser: User) => {
    setUsers((prev) => [newUser, ...prev.filter((u) => u.id !== newUser.id)]);
    setCurrentUserId(newUser.id);
    setViewedUserId(newUser.id);
    setActiveTab('my-profile');
    showToast(`Bem-vindo ao Lumina, ${newUser.name}! Seu cadastro foi concluído no Supabase.`);
    await supabaseService.updateProfile(newUser);
  };

  const handleSelectUserToView = (user: User) => {
    setViewedUserId(user.id);
    setActiveTab('my-profile');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSaveMovie = async (
    movieData: Omit<Movie, 'id' | 'createdAt' | 'likesCount' | 'likedBy'> & { id?: string }
  ) => {
    if (movieData.id) {
      // Editing existing movie
      const target = movies.find((m) => m.id === movieData.id);
      const updatedMovie: Movie = {
        ...(target || (movieData as any)),
        ...movieData,
      };
      setMovies((prev) => prev.map((m) => (m.id === updatedMovie.id ? updatedMovie : m)));
      await supabaseService.saveMovie(updatedMovie, currentUser);
      showToast(`Filme "${movieData.title}" atualizado no Supabase!`);
    } else {
      // Adding new movie directly into Supabase
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
    const updatedUser = { ...currentUser, ...updatedData };
    setUsers((prev) => prev.map((u) => (u.id === currentUser.id ? updatedUser : u)));
    await supabaseService.updateProfile(updatedUser);
    showToast('Perfil atualizado no Supabase com sucesso!');
  };

  const handleLoginSuccess = async (user: User) => {
    setUsers((prev) => {
      const exists = prev.some((u) => u.id === user.id);
      return exists ? prev.map((u) => (u.id === user.id ? user : u)) : [user, ...prev];
    });
    setCurrentUserId(user.id);
    setViewedUserId(user.id);
    setIsAuthenticated(true);
    showToast(`Autenticado com sucesso via Supabase! Bem-vindo(a), ${user.name}.`);

    // Reload latest cloud data
    await loadCloudData();
  };

  const handleLoginAsVisitor = async (name: string, bio: string, avatar: string) => {
    const visitorUser = await supabaseService.saveVisitorProfile({ name, bio, avatar });
    setUsers((prev) => {
      const exists = prev.some((u) => u.id === visitorUser.id);
      return exists ? prev.map((u) => (u.id === visitorUser.id ? visitorUser : u)) : [visitorUser, ...prev];
    });
    setCurrentUserId(visitorUser.id);
    setViewedUserId(visitorUser.id);
    setIsAuthenticated(true);
    showToast(`Bem-vindo(a), ${visitorUser.name}! Conectado via Supabase.`);
  };

  const handleSelectUserFromLogin = (user: User) => {
    handleSelectUser(user);
    setIsAuthenticated(true);
    loadCloudData();
  };

  const handleLogout = () => {
    supabaseService.signOut();
    setIsAuthenticated(false);
    showToast('Você saiu da sua conta. Até logo!');
  };

  const handleDeleteUser = async (userId: string) => {
    const userToDelete = users.find((u) => u.id === userId);
    setUsers((prev) => prev.filter((u) => u.id !== userId));
    setMovies((prev) => prev.filter((m) => m.userId !== userId));
    setComments((prev) => prev.filter((c) => c.targetUserId !== userId && c.authorId !== userId));

    await supabaseService.deleteProfile(userId);

    if (currentUserId === userId) {
      setIsAuthenticated(false);
      const remaining = users.filter((u) => u.id !== userId);
      const nextUser = remaining[0] || INITIAL_USERS[0];
      setCurrentUserId(nextUser.id);
      setViewedUserId(nextUser.id);
      showToast(`O perfil de "${userToDelete?.name || 'usuário'}" foi excluído do Supabase.`);
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
          onRefreshData={loadCloudData}
          isLoadingData={isLoadingData}
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
