'use client';

import React, { useState } from 'react';
import { Movie, User, Comment } from '@/types';
import { X, Star, Heart, Film, MessageSquare, Send, Trash2, Shield, Calendar, User as UserIcon } from 'lucide-react';

interface MovieModalProps {
  movie: Movie | null;
  onClose: () => void;
  currentUser: User;
  allUsers: User[];
  comments: Comment[];
  onToggleLike: (movieId: string) => void;
  onAddComment: (commentData: {
    targetUserId: string;
    movieId?: string;
    movieTitle?: string;
    content: string;
  }) => void;
  onDeleteComment: (commentId: string) => void;
  onVisitOwner?: (user: User) => void;
}

export function MovieModal({
  movie,
  onClose,
  currentUser,
  allUsers,
  comments,
  onToggleLike,
  onAddComment,
  onDeleteComment,
  onVisitOwner,
}: MovieModalProps) {
  const [newComment, setNewComment] = useState('');

  if (!movie) return null;

  const movieOwner = allUsers.find((u) => u.id === movie.userId);
  const movieComments = comments.filter((c) => c.movieId === movie.id);
  const isLiked = movie.likedBy?.includes(currentUser.id) || false;

  const handleCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    onAddComment({
      targetUserId: movie.userId,
      movieId: movie.id,
      movieTitle: movie.title,
      content: newComment.trim(),
    });

    setNewComment('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#060D0B]/85 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="w-full max-w-3xl max-h-[92vh] rounded-2xl bg-[#091412] border border-white/[0.12] shadow-[0_20px_60px_rgba(0,0,0,0.9)] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Top Bar */}
        <div className="px-6 py-3 border-b border-white/[0.08] bg-[#0D1F1C] flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-[#94A8A3]">
            <Film className="w-4 h-4 text-[#00D2FF]" />
            <span>Ficha Cinematográfica do Filme Favorito</span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-[#94A8A3] hover:text-white hover:bg-white/[0.06] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5 sm:space-y-6">
          {/* Main Info Row */}
          <div className="flex flex-col sm:flex-row gap-5 sm:gap-6">
            {/* Poster */}
            <div className="relative w-36 sm:w-56 aspect-[2/3] rounded-xl overflow-hidden flex-shrink-0 border border-white/[0.12] shadow-[0_8px_30px_rgba(0,0,0,0.7)] mx-auto sm:mx-0">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={movie.posterUrl}
                alt={movie.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute top-2.5 left-2.5 px-2.5 py-1 rounded-full bg-[#060D0B]/90 backdrop-blur-md border border-[#00D2FF]/40 text-[#00D2FF] text-xs font-black flex items-center gap-1 shadow-lg">
                <Star className="w-3.5 h-3.5 fill-[#00D2FF]" />
                <span>{movie.rating.toFixed(1)}</span>
              </div>
            </div>

            {/* Details */}
            <div className="flex-1 space-y-4">
              <div>
                <div className="flex items-start justify-between gap-2">
                  <h2 className="text-2xl sm:text-3xl font-extrabold text-[#F0FDF8] leading-tight">
                    {movie.title}
                  </h2>
                </div>
                <div className="flex flex-wrap items-center gap-2 mt-1.5 text-xs text-[#94A8A3]">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" /> {movie.year}
                  </span>
                  <span>•</span>
                  <span>Dirigido por <strong className="text-white">{movie.director}</strong></span>
                  <span>•</span>
                  <span className="text-[#00D2FF] font-semibold">{movie.genre}</span>
                </div>
              </div>

              {/* Badges */}
              {movie.badges && movie.badges.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {movie.badges.map((b, i) => (
                    <span
                      key={i}
                      className="text-[10px] uppercase font-bold tracking-wider px-2.5 py-0.5 rounded bg-white/[0.08] text-[#94A8A3] border border-white/10"
                    >
                      {b}
                    </span>
                  ))}
                </div>
              )}

              {/* Recommended By User */}
              {movieOwner && (
                <div className="p-3 rounded-xl bg-[#0D1F1C] border border-white/[0.08] flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={movieOwner.avatar}
                      alt={movieOwner.name}
                      className="w-8 h-8 rounded-full object-cover border border-[#00D2FF]/40"
                    />
                    <div>
                      <p className="text-[11px] text-[#94A8A3]">Favoritado & Avaliado por:</p>
                      <p className="text-xs font-bold text-[#F0FDF8]">{movieOwner.name} (@{movieOwner.username})</p>
                    </div>
                  </div>

                  {onVisitOwner && (
                    <button
                      onClick={() => {
                        onVisitOwner(movieOwner);
                        onClose();
                      }}
                      className="px-3 py-1.5 rounded-lg bg-white/[0.06] hover:bg-[#00D2FF] text-[#F0FDF8] hover:text-[#060D0B] text-xs font-bold transition-all"
                    >
                      Ver Perfil
                    </button>
                  )}
                </div>
              )}

              {/* Personal Review */}
              <div className="p-4 rounded-xl bg-[#0D1F1C]/70 border border-white/[0.08] space-y-1">
                <span className="text-[11px] font-bold text-[#00D2FF] uppercase tracking-wider block">
                  Resenha do Cinéfilo:
                </span>
                <p className="text-xs sm:text-sm text-[#d9e5e1] leading-relaxed italic">
                  &ldquo;{movie.review}&rdquo;
                </p>
              </div>

              {/* Favorite scene */}
              {movie.favoriteScene && (
                <div className="p-3.5 rounded-xl bg-[#060D0B] border border-white/[0.06]">
                  <span className="text-[11px] font-bold text-[#94A8A3] uppercase tracking-wider block mb-1">
                    Cena Marcante / Destaque:
                  </span>
                  <p className="text-xs text-[#bbc9cf] leading-relaxed">
                    {movie.favoriteScene}
                  </p>
                </div>
              )}

              {/* Action buttons */}
              <div className="flex items-center gap-3 pt-2">
                <button
                  onClick={() => onToggleLike(movie.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                    isLiked
                      ? 'bg-[#FF2E4D] text-white shadow-[0_0_20px_rgba(255,46,77,0.4)]'
                      : 'bg-[#0D1F1C] border border-white/[0.1] text-white hover:border-[#FF2E4D]'
                  }`}
                >
                  <Heart className={`w-4 h-4 ${isLiked ? 'fill-white' : ''}`} />
                  <span>{movie.likesCount} Curtidas</span>
                </button>
              </div>
            </div>
          </div>

          {/* Comments on this specific movie */}
          <div className="pt-6 border-t border-white/[0.08] space-y-4">
            <h3 className="text-sm font-bold text-[#F0FDF8] flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-[#00D2FF]" />
              Comentários sobre &ldquo;{movie.title}&rdquo; ({movieComments.length})
            </h3>

            {/* Comment Form */}
            <form onSubmit={handleCommentSubmit} className="flex gap-2">
              <input
                type="text"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder={`O que você achou de ${movie.title}? Deixe sua palavra...`}
                className="flex-1 bg-[#060D0B] border border-white/[0.1] rounded-xl px-4 py-2 text-xs text-[#F0FDF8] focus:outline-none focus:border-[#00D2FF]"
              />
              <button
                type="submit"
                disabled={!newComment.trim()}
                className="px-4 py-2 rounded-xl bg-[#00D2FF] text-[#060D0B] font-bold text-xs disabled:opacity-50 hover:bg-[#47d6ff] transition-all flex items-center gap-1.5"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Enviar</span>
              </button>
            </form>

            {/* Comments List */}
            <div className="space-y-3">
              {movieComments.length === 0 ? (
                <p className="text-xs text-[#4D635F] italic py-2">
                  Nenhum comentário específico sobre este filme ainda. Seja o primeiro a opinar!
                </p>
              ) : (
                movieComments.map((comm) => (
                  <div
                    key={comm.id}
                    className="p-3 rounded-xl bg-[#0D1F1C]/60 border border-white/[0.06] flex items-start justify-between gap-3"
                  >
                    <div className="flex items-start gap-2.5">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={comm.authorAvatar}
                        alt={comm.authorName}
                        className="w-6 h-6 rounded-full object-cover border border-[#00D2FF]/30 mt-0.5"
                      />
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-white">{comm.authorName}</span>
                          <span className="text-[10px] text-[#4D635F]">{comm.createdAt}</span>
                        </div>
                        <p className="text-xs text-[#bbc9cf] mt-1">{comm.content}</p>
                      </div>
                    </div>

                    {(currentUser.id === movie.userId || currentUser.id === comm.authorId) && (
                      <button
                        onClick={() => onDeleteComment(comm.id)}
                        className="p-1 text-[#94A8A3] hover:text-[#FF2E4D] transition-colors"
                        title="Remover comentário"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
