'use client';

import React, { useState, useMemo } from 'react';
import { User, Movie } from '@/types';
import { Users, Film, Star, MessageSquare, Heart, Search, ArrowRight, Sparkles, Shield } from 'lucide-react';

interface CommunityViewProps {
  users: User[];
  movies: Movie[];
  currentUser: User;
  onSelectUserToView: (user: User) => void;
}

export function CommunityView({
  users,
  movies,
  currentUser,
  onSelectUserToView,
}: CommunityViewProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGenre, setSelectedGenre] = useState<string>('all');

  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      const matchSearch =
        u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.favoriteGenre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.bio.toLowerCase().includes(searchTerm.toLowerCase());

      const matchGenre =
        selectedGenre === 'all' ||
        u.favoriteGenre.toLowerCase().includes(selectedGenre.toLowerCase());

      return matchSearch && matchGenre;
    });
  }, [users, searchTerm, selectedGenre]);

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Community Hero Header */}
      <div className="relative rounded-2xl bg-gradient-to-r from-[#0D1F1C] via-[#091412] to-[#0D1F1C] border border-white/[0.08] p-6 sm:p-8 overflow-hidden shadow-2xl">
        <div className="relative z-10 max-w-2xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#00D2FF]/10 text-[#00D2FF] text-xs font-bold border border-[#00D2FF]/20">
            <Users className="w-3.5 h-3.5" />
            <span>Rede Social de Amantes de Cinema</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-extrabold text-[#F0FDF8] tracking-tight">
            Descubra Outros Cinéfilos & Explore suas Páginas
          </h1>

          <p className="text-xs sm:text-sm text-[#94A8A3] leading-relaxed">
            Visite os perfis pessoais da comunidade, descubra quais são os filmes favoritos de cada um e deixe palavras e recados sinceros em seus murais para iniciar discussões cinematográficas.
          </p>
        </div>

        {/* Decorative background glow */}
        <div className="absolute right-0 top-0 w-96 h-96 bg-[#00D2FF]/5 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* Search & Filter Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#091412] p-4 rounded-xl border border-white/[0.08]">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-[#94A8A3] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar cinéfilo pelo nome, @handle ou gênero..."
            className="w-full bg-[#060D0B] text-xs sm:text-sm text-[#F0FDF8] placeholder-[#4D635F] pl-10 pr-4 py-2.5 rounded-lg border border-white/[0.08] focus:outline-none focus:border-[#00D2FF] focus:shadow-[0_0_12px_rgba(0,210,255,0.2)]"
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-[#94A8A3]">Filtro:</span>
          <select
            value={selectedGenre}
            onChange={(e) => setSelectedGenre(e.target.value)}
            className="bg-[#060D0B] text-xs text-[#F0FDF8] px-3 py-2 rounded-lg border border-white/[0.08] focus:outline-none focus:border-[#00D2FF]"
          >
            <option value="all">Todos os Gostos</option>
            <option value="Ficção">Ficção Científica</option>
            <option value="Drama">Drama</option>
            <option value="Crime">Crime & Noir</option>
            <option value="Animação">Animação</option>
          </select>
        </div>
      </div>

      {/* Cinephiles Directory Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredUsers.map((user) => {
          const userMovies = movies.filter((m) => m.userId === user.id);
          const isCurrentUser = user.id === currentUser.id;

          return (
            <div
              key={user.id}
              className={`rounded-2xl bg-[#091412] border transition-all duration-300 flex flex-col justify-between overflow-hidden group hover:shadow-[0_12px_36px_rgba(0,0,0,0.8),0_0_24px_rgba(0,210,255,0.18)] ${
                isCurrentUser
                  ? 'border-[#00D2FF]/40 shadow-[0_0_15px_rgba(0,210,255,0.1)]'
                  : 'border-white/[0.08] hover:border-[#00D2FF]/50'
              }`}
            >
              {/* Header with Banner & Avatar */}
              <div>
                <div className="relative h-24 w-full bg-[#060D0B] overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={user.bannerUrl}
                    alt={user.name}
                    className="w-full h-full object-cover opacity-50 group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#091412] to-transparent" />
                  
                  {isCurrentUser && (
                    <span className="absolute top-2.5 right-2.5 text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-[#00D2FF] text-[#060D0B] shadow-md">
                      SEU PERFIL
                    </span>
                  )}
                </div>

                <div className="p-5 pt-0 relative">
                  {/* Avatar overlapping banner */}
                  <div className="flex items-end justify-between -mt-10 mb-3">
                    <div className="relative w-16 h-16 rounded-xl overflow-hidden border-2 border-[#00D2FF] bg-[#060D0B] shadow-[0_0_16px_rgba(0,210,255,0.3)]">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                    </div>

                    <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-[#00D2FF]/10 text-[#00D2FF] border border-[#00D2FF]/20 flex items-center gap-1">
                      <Shield className="w-3 h-3" />
                      {user.badge}
                    </span>
                  </div>

                  {/* Name and Handle */}
                  <h3 className="text-base font-bold text-[#F0FDF8] group-hover:text-[#00D2FF] transition-colors leading-snug">
                    {user.name}
                  </h3>
                  <p className="text-xs text-[#94A8A3]">@{user.username}</p>

                  <p className="text-xs text-[#bbc9cf] mt-2 line-clamp-2 italic leading-relaxed">
                    &ldquo;{user.bio}&rdquo;
                  </p>

                  <div className="mt-3 flex items-center gap-2">
                    <span className="text-[11px] font-semibold text-[#00D2FF] bg-[#0D1F1C] px-2.5 py-1 rounded-md border border-white/[0.06]">
                      ♥ {user.favoriteGenre}
                    </span>
                    <span className="text-[11px] text-[#94A8A3]">
                      {userMovies.length} filmes favoritados
                    </span>
                  </div>
                </div>

                {/* Previews of their favorite movies */}
                <div className="px-5 pb-3">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-[#94A8A3] mb-1.5">
                    Principais Favoritos:
                  </p>
                  {userMovies.length === 0 ? (
                    <p className="text-xs text-[#4D635F] italic">Nenhum filme cadastrado ainda</p>
                  ) : (
                    <div className="grid grid-cols-3 gap-2">
                      {userMovies.slice(0, 3).map((mov) => (
                        <div
                          key={mov.id}
                          className="relative aspect-[2/3] rounded-lg overflow-hidden bg-[#060D0B] border border-white/[0.08] shadow-sm"
                          title={`${mov.title} (Nota: ${mov.rating})`}
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={mov.posterUrl}
                            alt={mov.title}
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/90 to-transparent p-1">
                            <span className="text-[9px] font-extrabold text-[#00D2FF] block truncate">
                              ★ {mov.rating}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Bottom Visit Button */}
              <div className="p-4 border-t border-white/[0.06] bg-[#060D0B]/40">
                <button
                  onClick={() => onSelectUserToView(user)}
                  className="w-full py-2.5 px-4 rounded-xl bg-[#0D1F1C] hover:bg-[#00D2FF] text-[#F0FDF8] hover:text-[#060D0B] font-bold text-xs sm:text-sm border border-white/[0.1] hover:border-transparent transition-all flex items-center justify-center gap-2 group/btn shadow-sm hover:shadow-[0_0_20px_rgba(0,210,255,0.4)]"
                >
                  <span>{isCurrentUser ? 'Acessar Meu Próprio Perfil' : `Visitar Página de ${user.name.split(' ')[0]}`}</span>
                  <ArrowRight className="w-4 h-4 transition-transform group-hover/btn:translate-x-1" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
