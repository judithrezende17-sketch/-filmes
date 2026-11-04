'use client';

import React, { useState, useMemo } from 'react';
import { User, Movie, Comment } from '@/types';
import { MovieCard } from './MovieCard';
import { Guestbook } from './Guestbook';
import { 
  Plus, Edit3, Film, Star, Heart, MessageSquare, ArrowLeft, 
  Sparkles, Filter, CheckCircle2, UserCheck, Shield 
} from 'lucide-react';

interface ProfileViewProps {
  viewedUser: User;
  currentUser: User;
  movies: Movie[];
  comments: Comment[];
  onOpenAddMovieModal: () => void;
  onOpenEditMovieModal: (movie: Movie) => void;
  onDeleteMovie: (movieId: string) => void;
  onToggleLikeMovie: (movieId: string) => void;
  onOpenMovieDetails: (movie: Movie) => void;
  onOpenEditProfileModal: () => void;
  onAddComment: (data: { targetUserId: string; movieId?: string; movieTitle?: string; content: string }) => void;
  onDeleteComment: (commentId: string) => void;
  onToggleLikeComment: (commentId: string) => void;
  onBackToMyProfile: () => void;
}

export function ProfileView({
  viewedUser,
  currentUser,
  movies,
  comments,
  onOpenAddMovieModal,
  onOpenEditMovieModal,
  onDeleteMovie,
  onToggleLikeMovie,
  onOpenMovieDetails,
  onOpenEditProfileModal,
  onAddComment,
  onDeleteComment,
  onToggleLikeComment,
  onBackToMyProfile,
}: ProfileViewProps) {
  const isOwnProfile = currentUser.id === viewedUser.id;

  // Local filter states
  const [selectedGenre, setSelectedGenre] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'rating' | 'newest' | 'title'>('rating');
  const [searchFilter, setSearchFilter] = useState('');

  // Extract unique genres in this user's list
  const availableGenres = useMemo(() => {
    const set = new Set<string>();
    movies.forEach((m) => {
      if (m.genre) {
        m.genre.split(/[\/,]/).forEach((g) => {
          const trimmed = g.trim();
          if (trimmed) set.add(trimmed);
        });
      }
    });
    return Array.from(set);
  }, [movies]);

  // Filtered & sorted movies
  const displayedMovies = useMemo(() => {
    let result = [...movies];

    if (searchFilter.trim()) {
      const q = searchFilter.toLowerCase();
      result = result.filter(
        (m) =>
          m.title.toLowerCase().includes(q) ||
          m.director.toLowerCase().includes(q) ||
          m.genre.toLowerCase().includes(q) ||
          (m.review && m.review.toLowerCase().includes(q))
      );
    }

    if (selectedGenre !== 'all') {
      result = result.filter((m) =>
        m.genre.toLowerCase().includes(selectedGenre.toLowerCase())
      );
    }

    if (sortBy === 'rating') {
      result.sort((a, b) => b.rating - a.rating);
    } else if (sortBy === 'newest') {
      result.sort((a, b) => Number(b.year) - Number(a.year));
    } else if (sortBy === 'title') {
      result.sort((a, b) => a.title.localeCompare(b.title));
    }

    return result;
  }, [movies, searchFilter, selectedGenre, sortBy]);

  // Stats calculation
  const totalLikes = useMemo(() => {
    return movies.reduce((acc, m) => acc + (m.likesCount || 0), 0);
  }, [movies]);

  const avgRating = useMemo(() => {
    if (movies.length === 0) return 0;
    const sum = movies.reduce((acc, m) => acc + m.rating, 0);
    return Number((sum / movies.length).toFixed(1));
  }, [movies]);

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Visitor Banner Notification if looking at someone else */}
      {!isOwnProfile && (
        <div className="p-3.5 rounded-xl bg-[#0D1F1C] border border-[#00D2FF]/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-[0_0_20px_rgba(0,210,255,0.1)]">
          <div className="flex items-center gap-2.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#00D2FF] animate-pulse" />
            <p className="text-xs text-[#F0FDF8]">
              Você está visitando a página pessoal de <strong className="text-[#00D2FF]">{viewedUser.name}</strong> (@{viewedUser.username})
            </p>
          </div>
          <button
            onClick={onBackToMyProfile}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/[0.08] hover:bg-white/[0.15] text-xs font-semibold text-white transition-colors self-start sm:self-auto"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Voltar ao Meu Perfil
          </button>
        </div>
      )}

      {/* Profile Cinema Header */}
      <div className="relative rounded-2xl bg-[#091412] border border-white/[0.08] overflow-hidden shadow-2xl">
        {/* Banner Backdrop */}
        <div className="relative h-48 sm:h-64 w-full overflow-hidden bg-[#060D0B]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={viewedUser.bannerUrl}
            alt="Cinema backdrop"
            className="w-full h-full object-cover opacity-60 filter brightness-75"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#091412] via-[#091412]/60 to-transparent" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-transparent via-[#060D0B]/40 to-[#060D0B]" />
        </div>

        {/* Profile Card Info Box */}
        <div className="relative px-6 pb-6 pt-0 sm:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 -mt-16 sm:-mt-20">
            {/* Avatar & Identifiers */}
            <div className="flex flex-col sm:flex-row items-center sm:items-end gap-4 text-center sm:text-left">
              <div className="relative w-28 h-28 sm:w-32 sm:h-32 rounded-2xl overflow-hidden border-2 border-[#00D2FF] shadow-[0_0_28px_rgba(0,210,255,0.4)] flex-shrink-0 bg-[#060D0B]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={viewedUser.avatar}
                  alt={viewedUser.name}
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="space-y-1">
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                  <h1 className="text-2xl sm:text-3xl font-extrabold text-[#F0FDF8] tracking-tight">
                    {viewedUser.name}
                  </h1>
                  <span className="text-[11px] uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-full bg-[#00D2FF]/15 text-[#00D2FF] border border-[#00D2FF]/30 flex items-center gap-1 shadow-sm">
                    <Shield className="w-3 h-3" />
                    {viewedUser.badge}
                  </span>
                </div>

                <p className="text-sm text-[#94A8A3] font-medium">
                  @{viewedUser.username} • Membro desde {viewedUser.joinedDate}
                </p>

                <p className="text-xs text-[#00D2FF] font-semibold flex items-center justify-center sm:justify-start gap-1 pt-0.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  Gênero preferido: {viewedUser.favoriteGenre}
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-center gap-2.5 pt-2 sm:pt-0">
              {isOwnProfile ? (
                <>
                  <button
                    onClick={onOpenAddMovieModal}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#00D2FF] hover:bg-[#47d6ff] text-[#060D0B] font-extrabold text-xs sm:text-sm shadow-[0_0_24px_rgba(0,210,255,0.4)] hover:shadow-[0_0_32px_rgba(0,210,255,0.6)] transform hover:scale-[1.02] active:scale-95 transition-all"
                  >
                    <Plus className="w-4 h-4 stroke-[3]" />
                    <span>Cadastrar Filme</span>
                  </button>

                  <button
                    onClick={onOpenEditProfileModal}
                    className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-[#0D1F1C] hover:bg-[#152e2a] text-[#F0FDF8] font-semibold text-xs sm:text-sm border border-white/[0.12] hover:border-[#00D2FF]/50 transition-all"
                  >
                    <Edit3 className="w-4 h-4 text-[#94A8A3]" />
                    <span className="hidden sm:inline">Editar Perfil</span>
                  </button>
                </>
              ) : (
                <a
                  href="#mural-recados"
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#00D2FF] hover:bg-[#47d6ff] text-[#060D0B] font-extrabold text-xs sm:text-sm shadow-[0_0_24px_rgba(0,210,255,0.4)] transition-all transform hover:scale-[1.02] active:scale-95"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>Deixar Recado no Mural</span>
                </a>
              )}
            </div>
          </div>

          {/* User Bio */}
          {viewedUser.bio && (
            <div className="mt-5 p-4 rounded-xl bg-[#0D1F1C]/60 border border-white/[0.06]">
              <p className="text-xs sm:text-sm text-[#bbc9cf] leading-relaxed italic">
                &ldquo;{viewedUser.bio}&rdquo;
              </p>
            </div>
          )}

          {/* Stats Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5 pt-5 border-t border-white/[0.08]">
            <div className="p-3 rounded-xl bg-[#060D0B]/80 border border-white/[0.06] text-center">
              <span className="text-[11px] font-semibold text-[#94A8A3] uppercase tracking-wider block">
                Filmes Favoritos
              </span>
              <span className="text-xl font-black text-[#F0FDF8] mt-0.5 block">
                {movies.length}
              </span>
            </div>

            <div className="p-3 rounded-xl bg-[#060D0B]/80 border border-white/[0.06] text-center">
              <span className="text-[11px] font-semibold text-[#94A8A3] uppercase tracking-wider block">
                Média de Notas
              </span>
              <span className="text-xl font-black text-[#00D2FF] mt-0.5 block flex items-center justify-center gap-1">
                <Star className="w-4 h-4 fill-[#00D2FF]" />
                {avgRating > 0 ? avgRating : '-'}
              </span>
            </div>

            <div className="p-3 rounded-xl bg-[#060D0B]/80 border border-white/[0.06] text-center">
              <span className="text-[11px] font-semibold text-[#94A8A3] uppercase tracking-wider block">
                Recados no Mural
              </span>
              <span className="text-xl font-black text-[#F0FDF8] mt-0.5 block flex items-center justify-center gap-1">
                <MessageSquare className="w-4 h-4 text-[#94A8A3]" />
                {comments.length}
              </span>
            </div>

            <div className="p-3 rounded-xl bg-[#060D0B]/80 border border-white/[0.06] text-center">
              <span className="text-[11px] font-semibold text-[#94A8A3] uppercase tracking-wider block">
                Curtidas Recebidas
              </span>
              <span className="text-xl font-black text-[#FF2E4D] mt-0.5 block flex items-center justify-center gap-1">
                <Heart className="w-4 h-4 fill-[#FF2E4D]" />
                {totalLikes}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Movies Shelf Section */}
      <section className="space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/[0.08] pb-4">
          <div>
            <h2 className="text-xl font-black text-[#F0FDF8] flex items-center gap-2">
              <Film className="w-5 h-5 text-[#00D2FF]" />
              Filmes Favoritos de {viewedUser.name}
              <span className="text-xs text-[#94A8A3] font-normal">
                ({displayedMovies.length} de {movies.length})
              </span>
            </h2>
            <p className="text-xs text-[#94A8A3] mt-0.5">
              {isOwnProfile
                ? 'Aqui estão suas obras favoritas. Você pode editar, remover ou cadastrar novas.'
                : `Coleção cinematográfica selecionada pessoalmente por ${viewedUser.name}`}
            </p>
          </div>

          {/* Search inside profile */}
          <div className="flex items-center gap-2 flex-wrap">
            <input
              type="text"
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              placeholder="Filtrar nesta lista..."
              className="bg-[#091412] text-xs text-[#F0FDF8] placeholder-[#4D635F] px-3 py-1.5 rounded-lg border border-white/[0.08] focus:outline-none focus:border-[#00D2FF] w-40 sm:w-48"
            />

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-[#091412] text-xs text-[#F0FDF8] px-3 py-1.5 rounded-lg border border-white/[0.08] focus:outline-none focus:border-[#00D2FF]"
            >
              <option value="rating">Maior Nota</option>
              <option value="newest">Ano de Lançamento</option>
              <option value="title">Ordem Alfabética</option>
            </select>
          </div>
        </div>

        {/* Genre Filter Chips */}
        {availableGenres.length > 0 && (
          <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none">
            <button
              onClick={() => setSelectedGenre('all')}
              className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                selectedGenre === 'all'
                  ? 'bg-[#00D2FF] text-[#060D0B] font-bold shadow-[0_0_12px_rgba(0,210,255,0.3)]'
                  : 'bg-[#0D1F1C] text-[#94A8A3] border border-white/[0.08] hover:text-white'
              }`}
            >
              Todos os Gêneros ({movies.length})
            </button>
            {availableGenres.map((genre) => (
              <button
                key={genre}
                onClick={() => setSelectedGenre(genre)}
                className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                  selectedGenre === genre
                    ? 'bg-[#00D2FF] text-[#060D0B] font-bold shadow-[0_0_12px_rgba(0,210,255,0.3)]'
                    : 'bg-[#0D1F1C] text-[#94A8A3] border border-white/[0.08] hover:text-white'
                }`}
              >
                {genre}
              </button>
            ))}
          </div>
        )}

        {/* Movie Grid */}
        {displayedMovies.length === 0 ? (
          <div className="py-16 text-center rounded-2xl bg-[#091412] border border-dashed border-white/[0.1] p-8 space-y-4">
            <Film className="w-12 h-12 text-[#00D2FF]/30 mx-auto" />
            <h3 className="text-base font-bold text-[#F0FDF8]">
              {movies.length === 0
                ? 'Nenhum filme favorito cadastrado ainda'
                : 'Nenhum filme corresponde aos filtros'}
            </h3>
            <p className="text-xs text-[#94A8A3] max-w-md mx-auto">
              {movies.length === 0
                ? isOwnProfile
                  ? 'Comece agora a montar sua lista definitiva! Escolha entre clássicos populares ou adicione qualquer filme manualmente.'
                  : `${viewedUser.name} ainda não adicionou nenhum filme à lista.`
                : 'Tente alterar os termos de busca ou remover os filtros de gênero.'}
            </p>

            {isOwnProfile && movies.length === 0 && (
              <button
                onClick={onOpenAddMovieModal}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#00D2FF] hover:bg-[#47d6ff] text-[#060D0B] font-extrabold text-xs sm:text-sm shadow-[0_0_24px_rgba(0,210,255,0.4)] transition-all"
              >
                <Plus className="w-4 h-4 stroke-[3]" />
                Cadastrar Meu Primeiro Filme
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {displayedMovies.map((movie) => {
              const movieComments = comments.filter((c) => c.movieId === movie.id);
              return (
                <MovieCard
                  key={movie.id}
                  movie={movie}
                  currentUser={currentUser}
                  isOwner={isOwnProfile}
                  onEdit={onOpenEditMovieModal}
                  onDelete={onDeleteMovie}
                  onToggleLike={onToggleLikeMovie}
                  onOpenDetails={onOpenMovieDetails}
                  commentCount={movieComments.length}
                />
              );
            })}
          </div>
        )}
      </section>

      {/* Guestbook / Comments Section */}
      <div id="mural-recados">
        <Guestbook
          targetUser={viewedUser}
          currentUser={currentUser}
          comments={comments}
          movies={movies}
          onAddComment={onAddComment}
          onDeleteComment={onDeleteComment}
          onToggleLikeComment={onToggleLikeComment}
        />
      </div>
    </div>
  );
}
