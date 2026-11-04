'use client';

import React from 'react';
import { Comment, User, Movie } from '@/types';
import { MessageSquare, Heart, ArrowRight, Film, User as UserIcon, Sparkles } from 'lucide-react';

interface GuestbookFeedProps {
  comments: Comment[];
  users: User[];
  movies: Movie[];
  currentUser: User;
  onToggleLikeComment: (commentId: string) => void;
  onSelectUserToView: (user: User) => void;
}

export function GuestbookFeed({
  comments,
  users,
  movies,
  currentUser,
  onToggleLikeComment,
  onSelectUserToView,
}: GuestbookFeedProps) {
  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="relative rounded-2xl bg-gradient-to-r from-[#0D1F1C] via-[#091412] to-[#0D1F1C] border border-white/[0.08] p-6 sm:p-8 overflow-hidden shadow-2xl">
        <div className="relative z-10 max-w-2xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#00D2FF]/10 text-[#00D2FF] text-xs font-bold border border-[#00D2FF]/20">
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Mural Geral de Recados da Comunidade</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-extrabold text-[#F0FDF8] tracking-tight">
            Conversas & Elogios Cinematográficos
          </h1>

          <p className="text-xs sm:text-sm text-[#94A8A3] leading-relaxed">
            Acompanhe o que os cinéfilos e visitantes estão comentando nos murais de perfil e nas listas de filmes favoritos. Participe e compartilhe sua visão!
          </p>
        </div>
      </div>

      {/* Stream of Comments */}
      <div className="space-y-4">
        {comments.map((comm) => {
          const targetUser = users.find((u) => u.id === comm.targetUserId);
          const isLiked = comm.likedBy?.includes(currentUser.id) || false;

          return (
            <div
              key={comm.id}
              className="p-5 rounded-2xl bg-[#091412] border border-white/[0.08] hover:border-[#00D2FF]/30 transition-all flex flex-col sm:flex-row sm:items-start justify-between gap-4 group shadow-md"
            >
              <div className="flex items-start gap-3.5 flex-1">
                {/* Author Avatar */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={comm.authorAvatar}
                  alt={comm.authorName}
                  className="w-10 h-10 rounded-full object-cover border border-[#00D2FF]/40 flex-shrink-0"
                />

                <div className="space-y-2 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-bold text-sm text-[#F0FDF8]">{comm.authorName}</span>
                    <span className="text-xs text-[#94A8A3]">@{comm.authorUsername}</span>
                    <span className="text-[10px] text-[#4D635F]">• {comm.createdAt}</span>

                    {/* Target Context */}
                    {targetUser && (
                      <span className="text-xs text-[#94A8A3] flex items-center gap-1 bg-[#0D1F1C] px-2 py-0.5 rounded-md border border-white/[0.06]">
                        no mural de{' '}
                        <button
                          onClick={() => onSelectUserToView(targetUser)}
                          className="font-bold text-[#00D2FF] hover:underline"
                        >
                          {targetUser.name}
                        </button>
                      </span>
                    )}

                    {comm.movieTitle && (
                      <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-[#00D2FF]/10 text-[#00D2FF] border border-[#00D2FF]/20 flex items-center gap-1">
                        <Film className="w-2.5 h-2.5" />
                        {comm.movieTitle}
                      </span>
                    )}
                  </div>

                  <p className="text-xs sm:text-sm text-[#d9e5e1] leading-relaxed">
                    &ldquo;{comm.content}&rdquo;
                  </p>

                  <div className="flex items-center gap-4 pt-1">
                    <button
                      onClick={() => onToggleLikeComment(comm.id)}
                      className={`flex items-center gap-1.5 text-xs font-semibold transition-colors ${
                        isLiked ? 'text-[#FF2E4D]' : 'text-[#94A8A3] hover:text-[#FF2E4D]'
                      }`}
                    >
                      <Heart className={`w-3.5 h-3.5 ${isLiked ? 'fill-[#FF2E4D]' : ''}`} />
                      <span>{comm.likes} curtidas</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Quick Jump to Target Profile */}
              {targetUser && (
                <button
                  onClick={() => onSelectUserToView(targetUser)}
                  className="flex items-center gap-1.5 text-xs font-bold text-[#00D2FF] hover:text-[#47d6ff] bg-[#0D1F1C] hover:bg-[#00D2FF]/15 border border-[#00D2FF]/30 px-3.5 py-2 rounded-xl transition-all self-start flex-shrink-0"
                >
                  <span>Visitar Perfil</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
