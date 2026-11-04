'use client';

import React, { useState, useMemo } from 'react';
import { Movie, User, Comment } from '@/types';
import { MovieCard } from './MovieCard';
import { Film, Search, Star, Filter, Sparkles, Flame } from 'lucide-react';

interface AllMoviesFeedProps {
  movies: Movie[];
  users: User[];
  currentUser: User;
  comments: Comment[];
  onOpenMovieDetails: (movie: Movie) => void;
  onToggleLikeMovie: (movieId: string) => void;
  onVisitOwner: (user: User) => void;
  onOpenAddMovieModal: () => void;
}

export function AllMoviesFeed({
  movies,
  users,
  currentUser,
  comments,
  onOpenMovieDetails,
  onToggleLikeMovie,
  onVisitOwner,
  onOpenAddMovieModal,
}: AllMoviesFeedProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGenre, setSelectedGenre] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'likes' | 'rating' | 'newest' | 'title'>('likes');

  // Extract unique genres across all movies
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

  // Filter & sort
  const filteredMovies = useMemo(() => {
    let result = [...movies];

    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
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

    if (sortBy === 'likes') {
      result.sort((a, b) => (b.likesCount || 0) - (a.likesCount || 0));
    } else if (sortBy === 'rating') {
      result.sort((a, b) => b.rating - a.rating);
    } else if (sortBy === 'newest') {
      result.sort((a, b) => Number(b.year) - Number(a.year));
    } else if (sortBy === 'title') {
      result.sort((a, b) => a.title.localeCompare(b.title));
    }

    return result;
  }, [movies, searchTerm, selectedGenre, sortBy]);

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Feed Hero */}
      <div className="relative rounded-2xl bg-gradient-to-r from-[#0D1F1C] via-[#091412] to-[#0D1F1C] border border-white/[0.08] p-6 sm:p-8 overflow-hidden shadow-2xl">
        <div className="relative z-10 max-w-2xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#00D2FF]/10 text-[#00D2FF] text-xs font-bold border border-[#00D2FF]/20">
            <Film className="w-3.5 h-3.5" />
            <span>Catálogo Coletivo de Filmes Favoritos</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-extrabold text-[#F0FDF8] tracking-tight">
            Obras-Primas Recomendadas pelos Membros
          </h1>

          <p className="text-xs sm:text-sm text-[#94A8A3] leading-relaxed">
            Navegue por todos os filmes que foram favoritados pelos cinéfilos da plataforma. Veja notas pessoais, resenhas autênticas e acesse diretamente o perfil de quem recomendou.
          </p>
        </div>

        <div className="absolute right-0 bottom-0 w-80 h-80 bg-[#FF2E4D]/5 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* Search & Sort Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#091412] p-4 rounded-xl border border-white/[0.08]">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-[#94A8A3] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Pesquisar por título, diretor, gênero ou resenha..."
            className="w-full bg-[#060D0B] text-xs sm:text-sm text-[#F0FDF8] placeholder-[#4D635F] pl-10 pr-4 py-2.5 rounded-lg border border-white/[0.08] focus:outline-none focus:border-[#00D2FF] focus:shadow-[0_0_12px_rgba(0,210,255,0.2)]"
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-[#94A8A3]">Ordenar por:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="bg-[#060D0B] text-xs text-[#F0FDF8] px-3 py-2 rounded-lg border border-white/[0.08] focus:outline-none focus:border-[#00D2FF]"
          >
            <option value="likes">Mais Curtidos da Rede</option>
            <option value="rating">Maior Nota dos Cinéfilos</option>
            <option value="newest">Ano de Lançamento</option>
            <option value="title">Título (A-Z)</option>
          </select>
        </div>
      </div>

      {/* Genre Pills */}
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

      {/* Movies Grid */}
      {filteredMovies.length === 0 ? (
        <div className="py-16 text-center rounded-2xl bg-[#091412] border border-dashed border-white/[0.1] p-8 space-y-3">
          <Film className="w-12 h-12 text-[#00D2FF]/30 mx-auto" />
          <h3 className="text-base font-bold text-[#F0FDF8]">Nenhum filme encontrado</h3>
          <p className="text-xs text-[#94A8A3]">
            Tente buscar com outro termo ou redefinir os filtros de gênero.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredMovies.map((movie) => {
            const owner = users.find((u) => u.id === movie.userId);
            const isOwner = movie.userId === currentUser.id;
            const movieComments = comments.filter((c) => c.movieId === movie.id);

            return (
              <MovieCard
                key={movie.id}
                movie={movie}
                currentUser={currentUser}
                movieOwner={owner}
                isOwner={isOwner}
                onToggleLike={onToggleLikeMovie}
                onOpenDetails={onOpenMovieDetails}
                onVisitOwner={onVisitOwner}
                commentCount={movieComments.length}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
