'use client';

import React from 'react';
import { Movie, User } from '@/types';
import { Star, Heart, Edit2, Trash2, MessageSquare, Film, Sparkles } from 'lucide-react';

interface MovieCardProps {
  movie: Movie;
  currentUser: User;
  movieOwner?: User;
  isOwner: boolean;
  onEdit?: (movie: Movie) => void;
  onDelete?: (movieId: string) => void;
  onToggleLike: (movieId: string) => void;
  onOpenDetails: (movie: Movie) => void;
  onVisitOwner?: (user: User) => void;
  commentCount?: number;
}

export function MovieCard({
  movie,
  currentUser,
  movieOwner,
  isOwner,
  onEdit,
  onDelete,
  onToggleLike,
  onOpenDetails,
  onVisitOwner,
  commentCount = 0,
}: MovieCardProps) {
  const isLiked = movie.likedBy?.includes(currentUser.id) || false;

  return (
    <div className="group relative rounded-xl bg-[#091412] border border-white/[0.08] hover:border-[#00D2FF]/50 transition-all duration-300 hover:shadow-[0_12px_36px_rgba(0,0,0,0.8),0_0_24px_rgba(0,210,255,0.18)] flex flex-col overflow-hidden">
      {/* Poster Media Box (2:3 aspect ratio) */}
      <div 
        onClick={() => onOpenDetails(movie)}
        className="relative aspect-[2/3] w-full overflow-hidden bg-[#060D0B] cursor-pointer"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={movie.posterUrl}
          alt={movie.title}
          className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
          onError={(e) => {
            // Fallback to high quality cinema still if image fails
            (e.target as HTMLImageElement).src =
              'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=600&auto=format&fit=crop&q=80';
          }}
        />

        {/* Gradient Scrim */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#060D0B] via-transparent to-black/40 opacity-80 group-hover:opacity-90 transition-opacity" />

        {/* Top Badges: Rating & Resolution */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2 z-10">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#060D0B]/85 backdrop-blur-md border border-[#00D2FF]/40 text-[#00D2FF] text-xs font-black shadow-lg">
            <Star className="w-3.5 h-3.5 fill-[#00D2FF] text-[#00D2FF]" />
            <span>{typeof movie.rating === 'number' ? movie.rating.toFixed(1) : movie.rating}</span>
          </div>

          <div className="flex items-center gap-1">
            {movie.badges?.[0] && (
              <span className="text-[10px] font-bold tracking-wider uppercase px-2 py-0.5 rounded bg-white/10 backdrop-blur-md text-[#94A8A3] border border-white/15">
                {movie.badges[0]}
              </span>
            )}
          </div>
        </div>

        {/* Hover Quick Action Overlay */}
        <div className="absolute inset-x-0 bottom-0 p-4 transform translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 z-10 flex items-center justify-between">
          <span className="text-xs font-bold text-[#00D2FF] flex items-center gap-1 bg-[#060D0B]/80 px-2.5 py-1 rounded-md backdrop-blur-sm border border-[#00D2FF]/30">
            <Film className="w-3.5 h-3.5" />
            Ver Ficha Completa
          </span>

          <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
            {isOwner && onEdit && (
              <button
                onClick={() => onEdit(movie)}
                title="Editar este filme"
                className="p-2 rounded-lg bg-[#0D1F1C]/90 text-white hover:text-[#00D2FF] hover:bg-[#00D2FF]/20 border border-white/20 transition-all"
              >
                <Edit2 className="w-3.5 h-3.5" />
              </button>
            )}
            {isOwner && onDelete && (
              <button
                onClick={() => {
                  if (confirm(`Deseja remover "${movie.title}" dos seus filmes favoritos?`)) {
                    onDelete(movie.id);
                  }
                }}
                title="Remover filme"
                className="p-2 rounded-lg bg-[#0D1F1C]/90 text-white hover:text-[#FF2E4D] hover:bg-[#FF2E4D]/20 border border-white/20 transition-all"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Card Body Info */}
      <div className="p-4 flex-1 flex flex-col justify-between space-y-3 bg-[#091412]">
        <div>
          {/* Movie Owner reference (if viewing outside own profile) */}
          {movieOwner && !isOwner && onVisitOwner && (
            <button
              onClick={() => onVisitOwner(movieOwner)}
              className="flex items-center gap-1.5 mb-2 group/owner text-left"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={movieOwner.avatar}
                alt={movieOwner.name}
                className="w-4 h-4 rounded-full object-cover border border-[#00D2FF]/40"
              />
              <span className="text-[11px] text-[#94A8A3] group-hover/owner:text-[#00D2FF] transition-colors truncate">
                Lista de <strong className="font-semibold text-white">{movieOwner.name}</strong>
              </span>
            </button>
          )}

          <div className="flex items-start justify-between gap-2">
            <h3 
              onClick={() => onOpenDetails(movie)}
              className="font-bold text-base text-[#F0FDF8] group-hover:text-[#00D2FF] transition-colors cursor-pointer leading-snug line-clamp-1"
            >
              {movie.title}
            </h3>
            <span className="text-xs font-semibold text-[#94A8A3] flex-shrink-0">
              {movie.year}
            </span>
          </div>

          <p className="text-xs text-[#94A8A3] mt-0.5">
            Dir. <span className="text-[#d9e5e1] font-medium">{movie.director}</span> • {movie.genre}
          </p>

          {/* Personal Review Snippet */}
          {movie.review && (
            <div className="mt-2.5 p-2.5 rounded-lg bg-[#0D1F1C]/70 border border-white/[0.06] text-xs text-[#bbc9cf] leading-relaxed line-clamp-2 italic relative">
              <span className="text-[#00D2FF] font-serif mr-1">“</span>
              {movie.review}
              <span className="text-[#00D2FF] font-serif ml-1">”</span>
            </div>
          )}
        </div>

        {/* Footer Actions: Likes & Comments */}
        <div className="pt-2 border-t border-white/[0.06] flex items-center justify-between text-xs text-[#94A8A3]">
          <button
            onClick={() => onToggleLike(movie.id)}
            className={`flex items-center gap-1.5 py-1 px-2.5 rounded-md transition-all ${
              isLiked
                ? 'bg-[#FF2E4D]/15 text-[#FF2E4D] font-bold border border-[#FF2E4D]/30 shadow-[0_0_12px_rgba(255,46,77,0.25)]'
                : 'hover:bg-white/[0.05] hover:text-[#FF2E4D]'
            }`}
          >
            <Heart className={`w-3.5 h-3.5 ${isLiked ? 'fill-[#FF2E4D]' : ''}`} />
            <span>{movie.likesCount}</span>
          </button>

          <button
            onClick={() => onOpenDetails(movie)}
            className="flex items-center gap-1.5 py-1 px-2.5 rounded-md hover:bg-white/[0.05] hover:text-[#00D2FF] transition-colors"
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>{commentCount > 0 ? `${commentCount} recados` : 'Comentar'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
