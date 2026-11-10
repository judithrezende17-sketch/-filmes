'use client';

import React, { useState } from 'react';
import { Comment, User, Movie } from '@/types';
import { MessageSquare, Send, Heart, Trash2, Film, Sparkles, User as UserIcon } from 'lucide-react';

interface GuestbookProps {
  targetUser: User;
  currentUser: User;
  comments: Comment[];
  movies: Movie[];
  onAddComment: (commentData: {
    targetUserId: string;
    movieId?: string;
    movieTitle?: string;
    content: string;
  }) => void;
  onDeleteComment: (commentId: string) => void;
  onToggleLikeComment: (commentId: string) => void;
}

export function Guestbook({
  targetUser,
  currentUser,
  comments,
  movies,
  onAddComment,
  onDeleteComment,
  onToggleLikeComment,
}: GuestbookProps) {
  const [content, setContent] = useState('');
  const [selectedMovieId, setSelectedMovieId] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isOwnProfile = currentUser.id === targetUser.id;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    setIsSubmitting(true);
    const relatedMovie = movies.find((m) => m.id === selectedMovieId);

    onAddComment({
      targetUserId: targetUser.id,
      movieId: relatedMovie ? relatedMovie.id : undefined,
      movieTitle: relatedMovie ? relatedMovie.title : undefined,
      content: content.trim(),
    });

    setContent('');
    setSelectedMovieId('');
    setIsSubmitting(false);
  };

  return (
    <section className="mt-12 rounded-2xl bg-[#091412] border border-white/[0.08] overflow-hidden shadow-2xl">
      {/* Section Header */}
      <div className="p-6 border-b border-white/[0.08] bg-gradient-to-r from-[#0D1F1C] to-[#091412] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#00D2FF]/10 border border-[#00D2FF]/30 flex items-center justify-center text-[#00D2FF] shadow-[0_0_15px_rgba(0,210,255,0.2)]">
            <MessageSquare className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-[#F0FDF8] flex items-center gap-2">
              Mural de Recados & Opiniões
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-[#00D2FF]/15 text-[#00D2FF] border border-[#00D2FF]/30">
                {comments.length}
              </span>
            </h3>
            <p className="text-xs text-[#94A8A3]">
              {isOwnProfile
                ? 'Aqui ficam os recados e palavras que os visitantes e outros cinéfilos deixam para você'
                : `Deixe uma palavra, elogio ou debata sobre os filmes favoritos de ${targetUser.name}`}
            </p>
          </div>
        </div>

        <div className="text-xs text-[#94A8A3] bg-[#060D0B] px-3 py-1.5 rounded-lg border border-white/[0.06] flex items-center gap-2 self-start sm:self-auto">
          <UserIcon className="w-3.5 h-3.5 text-[#00D2FF]" />
          <span>Comentando como: <strong className="text-white">{currentUser.name}</strong></span>
        </div>
      </div>

      {/* New Comment Input Box */}
      <form onSubmit={handleSubmit} className="p-4 sm:p-6 border-b border-white/[0.06] bg-[#091412]">
        <div className="flex gap-3">
          {/* Current user avatar */}
          <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0 border border-[#00D2FF]/40 hidden sm:block">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={currentUser.avatar} alt={currentUser.name} className="w-full h-full object-cover" />
          </div>

          <div className="flex-1 space-y-3">
            <textarea
              rows={2}
              required
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder={
                isOwnProfile
                  ? 'Escreva um recado de boas-vindas no seu próprio mural...'
                  : `Deixe um recado sobre os filmes favoritos de ${targetUser.name}... Ex: "Excelente lista! Blade Runner 2049 é insuperável!"`
              }
              className="w-full bg-[#060D0B] border border-white/[0.1] rounded-xl p-3 sm:p-3.5 text-xs sm:text-sm text-[#F0FDF8] placeholder-[#4D635F] focus:outline-none focus:border-[#00D2FF] focus:shadow-[0_0_16px_rgba(0,210,255,0.2)] transition-all leading-relaxed"
            />

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              {/* Optional: Associate with a specific movie in this user's list */}
              {movies.length > 0 && (
                <div className="flex items-center gap-2 text-xs">
                  <Film className="w-3.5 h-3.5 text-[#94A8A3]" />
                  <span className="text-[#94A8A3]">Referente ao filme:</span>
                  <select
                    value={selectedMovieId}
                    onChange={(e) => setSelectedMovieId(e.target.value)}
                    className="bg-[#0D1F1C] border border-white/[0.1] text-xs text-[#F0FDF8] rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-[#00D2FF] max-w-[200px] truncate"
                  >
                    <option value="">(Geral / Toda a lista)</option>
                    {movies.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.title} ({m.year})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <button
                type="submit"
                disabled={!content.trim() || isSubmitting}
                className="w-full sm:w-auto py-2 px-5 rounded-lg bg-[#00D2FF] hover:bg-[#47d6ff] text-[#060D0B] font-bold text-xs sm:text-sm shadow-[0_0_16px_rgba(0,210,255,0.35)] transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02] active:scale-95"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Publicar Recado</span>
              </button>
            </div>
          </div>
        </div>
      </form>

      {/* List of Comments */}
      <div className="p-4 sm:p-6 divide-y divide-white/[0.06]">
        {comments.length === 0 ? (
          <div className="py-12 text-center text-[#94A8A3] space-y-2">
            <Sparkles className="w-8 h-8 text-[#00D2FF]/40 mx-auto" />
            <p className="text-sm font-semibold text-[#F0FDF8]">Mural ainda sem recados</p>
            <p className="text-xs text-[#4D635F]">
              Seja o primeiro a deixar uma palavra sobre a curadoria cinematográfica deste perfil!
            </p>
          </div>
        ) : (
          comments.map((comm) => {
            const isLiked = comm.likedBy?.includes(currentUser.id) || false;
            const canDelete = isOwnProfile || comm.authorId === currentUser.id;

            return (
              <div key={comm.id} className="py-4 first:pt-0 last:pb-0 space-y-2 group">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={comm.authorAvatar}
                      alt={comm.authorName}
                      className="w-8 h-8 rounded-full object-cover border border-[#00D2FF]/30"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs sm:text-sm text-[#F0FDF8]">
                          {comm.authorName}
                        </span>
                        <span className="text-[11px] text-[#94A8A3]">
                          @{comm.authorUsername}
                        </span>
                      </div>
                      <span className="text-[10px] text-[#4D635F]">{comm.createdAt}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {comm.movieTitle && (
                      <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-[#00D2FF]/10 text-[#00D2FF] border border-[#00D2FF]/20 flex items-center gap-1">
                        <Film className="w-2.5 h-2.5" />
                        {comm.movieTitle}
                      </span>
                    )}

                    {canDelete && (
                      <button
                        onClick={() => onDeleteComment(comm.id)}
                        title="Remover este recado"
                        className="opacity-100 sm:opacity-0 sm:group-hover:opacity-100 p-1.5 rounded text-[#94A8A3] hover:text-[#FF2E4D] hover:bg-[#FF2E4D]/10 transition-all"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Comment Text */}
                <p className="text-xs sm:text-sm text-[#bbc9cf] sm:pl-10 leading-relaxed font-normal">
                  {comm.content}
                </p>

                {/* Like / Interaction */}
                <div className="sm:pl-10 flex items-center gap-4 pt-1">
                  <button
                    onClick={() => onToggleLikeComment(comm.id)}
                    className={`flex items-center gap-1 text-[11px] font-semibold transition-colors ${
                      isLiked ? 'text-[#FF2E4D]' : 'text-[#94A8A3] hover:text-[#FF2E4D]'
                    }`}
                  >
                    <Heart className={`w-3 h-3 ${isLiked ? 'fill-[#FF2E4D]' : ''}`} />
                    <span>{comm.likes} curtidas</span>
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </section>
  );
}
