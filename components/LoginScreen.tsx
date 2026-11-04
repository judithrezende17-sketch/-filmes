'use client';

import React, { useState } from 'react';
import { User } from '@/types';
import { Film, Sparkles, UserPlus, LogIn, ShieldCheck, Check, Star, MessageSquare, Clapperboard, Heart } from 'lucide-react';

interface LoginScreenProps {
  allUsers: User[];
  onLoginAsVisitor: (name: string, bio: string, avatar: string) => void;
  onRegister: (newUser: User) => void;
  onSelectExistingUser: (user: User) => void;
}

const AVATAR_PRESETS = [
  {
    name: 'Cinéfila Clássica',
    url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80',
  },
  {
    name: 'Diretora Autoral',
    url: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=300&auto=format&fit=crop&q=80',
  },
  {
    name: 'Crítico Noturno',
    url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80',
  },
  {
    name: 'Exploradora Indie',
    url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=300&auto=format&fit=crop&q=80',
  },
  {
    name: 'Fotógrafo 35mm',
    url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&auto=format&fit=crop&q=80',
  },
  {
    name: 'Cinegrafista Sci-Fi',
    url: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=300&auto=format&fit=crop&q=80',
  },
];

export function LoginScreen({
  allUsers,
  onLoginAsVisitor,
  onRegister,
  onSelectExistingUser,
}: LoginScreenProps) {
  const [tab, setTab] = useState<'visitor' | 'register' | 'existing'>('visitor');

  // Visitor form state
  const [visitorName, setVisitorName] = useState('Visitante Cinéfilo');
  const [visitorBio, setVisitorBio] = useState('Explorando os filmes favoritos da comunidade e conhecendo cinéfilos.');
  const [visitorAvatar, setVisitorAvatar] = useState(AVATAR_PRESETS[0].url);

  // Register form state
  const [regName, setRegName] = useState('');
  const [regUsername, setRegUsername] = useState('');
  const [regGenre, setRegGenre] = useState('Ficção Científica');
  const [regBio, setRegBio] = useState('');
  const [regAvatar, setRegAvatar] = useState(AVATAR_PRESETS[0].url);
  const [regCustomAvatar, setRegCustomAvatar] = useState('');
  const [regError, setRegError] = useState('');

  const handleVisitorSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onLoginAsVisitor(
      visitorName.trim() || 'Visitante Cinéfilo',
      visitorBio.trim() || 'Visitante no Lumina CineClub.',
      visitorAvatar
    );
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!regName.trim()) {
      setRegError('Por favor, informe seu nome ou apelido.');
      return;
    }

    const cleanUsername = (regUsername.trim() || regName.toLowerCase().replace(/\s+/g, ''))
      .replace(/[^a-zA-Z0-9_]/g, '');

    const newUser: User = {
      id: `user_${Date.now()}`,
      name: regName.trim(),
      username: cleanUsername,
      avatar: regCustomAvatar.trim() || regAvatar,
      bannerUrl: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=1200&auto=format&fit=crop&q=80',
      bio: regBio.trim() || 'Novo membro apaixonado pelo mundo do cinema.',
      favoriteGenre: regGenre,
      badge: 'Cinéfilo Membro',
      joinedDate: 'Hoje',
      followersCount: 0,
      followingCount: 3,
      isGuest: false,
    };

    onRegister(newUser);
  };

  return (
    <div className="min-h-screen w-full bg-[#060D0B] flex flex-col justify-between relative overflow-hidden selection:bg-[#00D2FF]/30 selection:text-[#00D2FF]">
      {/* Cinematic Ambient Background Glows */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-gradient-to-b from-[#00D2FF]/10 via-[#0D1F1C]/40 to-transparent blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-[#FF2E4D]/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -top-24 -right-24 w-96 h-96 bg-[#00D2FF]/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top Bar / Branding */}
      <header className="relative z-10 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 flex items-center justify-between">
        <div className="flex items-center gap-3 select-none">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#00D2FF]/20 via-[#0D1F1C] to-[#FF2E4D]/20 border border-[#00D2FF]/40 flex items-center justify-center shadow-[0_0_20px_rgba(0,210,255,0.35)]">
            <Film className="w-6 h-6 text-[#00D2FF]" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-xl tracking-tight text-[#F0FDF8]">
                LUMINA<span className="text-[#00D2FF]">.CINE</span>
              </span>
              <span className="text-[10px] uppercase font-bold tracking-widest px-1.5 py-0.5 rounded bg-[#00D2FF]/10 text-[#00D2FF] border border-[#00D2FF]/20">
                CLUBE
              </span>
            </div>
            <p className="text-[11px] text-[#94A8A3] tracking-wide">
              Rede Social de Amantes do Cinema
            </p>
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-4 text-xs text-[#94A8A3]">
          <span className="flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-[#00D2FF]" />
            Cadastre seus Filmes
          </span>
          <span>•</span>
          <span className="flex items-center gap-1.5">
            <Clapperboard className="w-3.5 h-3.5 text-[#00D2FF]" />
            Visite Perfis de Amigos
          </span>
          <span>•</span>
          <span className="flex items-center gap-1.5">
            <MessageSquare className="w-3.5 h-3.5 text-[#00D2FF]" />
            Mural de Recados
          </span>
        </div>
      </header>

      {/* Main Login / Gateway Card Container */}
      <main className="relative z-10 flex-1 flex items-center justify-center px-4 py-8 sm:py-12">
        <div className="w-full max-w-xl rounded-2xl bg-[#091412] border border-white/[0.12] shadow-[0_24px_70px_rgba(0,0,0,0.85)] overflow-hidden">
          {/* Card Top Title Banner */}
          <div className="p-6 sm:p-8 pb-4 text-center border-b border-white/[0.08] bg-gradient-to-b from-[#0D1F1C] to-[#091412]">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#00D2FF]/10 text-[#00D2FF] text-xs font-bold border border-[#00D2FF]/25 mb-3 shadow-[0_0_15px_rgba(0,210,255,0.2)]">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Bem-vindo à Experiência Cinematográfica</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-[#F0FDF8] tracking-tight">
              Entre no Lumina CineClub
            </h1>
            <p className="text-xs sm:text-sm text-[#94A8A3] mt-2 max-w-md mx-auto leading-relaxed">
              Crie seu catálogo pessoal de filmes favoritos, explore coleções de outros cinéfilos e deixe suas palavras e recados na comunidade.
            </p>
          </div>

          {/* Interactive Navigation Tabs */}
          <div className="grid grid-cols-3 p-2 bg-[#060D0B] border-b border-white/[0.08] text-xs font-semibold">
            <button
              onClick={() => setTab('visitor')}
              className={`py-2.5 px-2 rounded-xl flex items-center justify-center gap-1.5 transition-all ${
                tab === 'visitor'
                  ? 'bg-[#00D2FF] text-[#060D0B] font-extrabold shadow-[0_0_18px_rgba(0,210,255,0.35)]'
                  : 'text-[#94A8A3] hover:text-[#F0FDF8]'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Entrar Visitante</span>
            </button>

            <button
              onClick={() => setTab('register')}
              className={`py-2.5 px-2 rounded-xl flex items-center justify-center gap-1.5 transition-all ${
                tab === 'register'
                  ? 'bg-[#00D2FF] text-[#060D0B] font-extrabold shadow-[0_0_18px_rgba(0,210,255,0.35)]'
                  : 'text-[#94A8A3] hover:text-[#F0FDF8]'
              }`}
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Criar Cadastro</span>
            </button>

            <button
              onClick={() => setTab('existing')}
              className={`py-2.5 px-2 rounded-xl flex items-center justify-center gap-1.5 transition-all ${
                tab === 'existing'
                  ? 'bg-[#00D2FF] text-[#060D0B] font-extrabold shadow-[0_0_18px_rgba(0,210,255,0.35)]'
                  : 'text-[#94A8A3] hover:text-[#F0FDF8]'
              }`}
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Contas Prontas</span>
            </button>
          </div>

          {/* Tab 1: Visitor Instant Login */}
          {tab === 'visitor' && (
            <form onSubmit={handleVisitorSubmit} className="p-6 sm:p-8 space-y-5 animate-in fade-in duration-200">
              <div className="p-4 rounded-xl bg-[#0D1F1C]/80 border border-[#00D2FF]/25 flex items-start gap-3.5">
                <ShieldCheck className="w-6 h-6 text-[#00D2FF] flex-shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <h3 className="text-sm font-bold text-[#F0FDF8]">Modo Visitante Sem Senhas</h3>
                  <p className="text-xs text-[#94A8A3] leading-relaxed">
                    Você pode entrar imediatamente agora mesmo! Cadastre seus filmes prediletos, edite, remova e visite as páginas pessoais de outros cinéfilos para deixar comentários em seus murais.
                  </p>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#94A8A3] mb-1.5">
                  Como deseja ser chamado(a) na rede?
                </label>
                <input
                  type="text"
                  value={visitorName}
                  onChange={(e) => setVisitorName(e.target.value)}
                  placeholder="Ex: Visitante Cinéfilo, João do Cinema, etc."
                  className="w-full bg-[#060D0B] border border-white/[0.1] rounded-xl px-4 py-3 text-sm text-[#F0FDF8] focus:outline-none focus:border-[#00D2FF] focus:shadow-[0_0_16px_rgba(0,210,255,0.2)] transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#94A8A3] mb-1.5">
                  Sua frase de apresentação (opcional)
                </label>
                <input
                  type="text"
                  value={visitorBio}
                  onChange={(e) => setVisitorBio(e.target.value)}
                  placeholder="Ex: Apaixonado por ficção científica e clássicos dos anos 70..."
                  className="w-full bg-[#060D0B] border border-white/[0.1] rounded-xl px-4 py-2.5 text-xs sm:text-sm text-[#F0FDF8] focus:outline-none focus:border-[#00D2FF] transition-all"
                />
              </div>

              {/* Avatar Selector */}
              <div>
                <label className="block text-xs font-semibold text-[#94A8A3] mb-2">
                  Escolha seu Avatar de Visitante
                </label>
                <div className="grid grid-cols-6 gap-2">
                  {AVATAR_PRESETS.map((p, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setVisitorAvatar(p.url)}
                      className={`relative aspect-square rounded-xl overflow-hidden border-2 transition-all ${
                        visitorAvatar === p.url
                          ? 'border-[#00D2FF] scale-105 shadow-[0_0_14px_rgba(0,210,255,0.45)]'
                          : 'border-transparent opacity-65 hover:opacity-100'
                      }`}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={p.url} alt={p.name} className="w-full h-full object-cover" />
                      {visitorAvatar === p.url && (
                        <div className="absolute inset-0 bg-[#00D2FF]/25 flex items-center justify-center">
                          <Check className="w-4 h-4 text-white drop-shadow" />
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-3.5 px-5 rounded-xl bg-[#00D2FF] hover:bg-[#47d6ff] text-[#060D0B] font-black text-sm shadow-[0_0_24px_rgba(0,210,255,0.4)] hover:shadow-[0_0_32px_rgba(0,210,255,0.6)] transform hover:scale-[1.01] active:scale-95 transition-all flex items-center justify-center gap-2"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Entrar Agora como Visitante</span>
                </button>
              </div>
            </form>
          )}

          {/* Tab 2: New Registration */}
          {tab === 'register' && (
            <form onSubmit={handleRegisterSubmit} className="p-6 sm:p-8 space-y-4 max-h-[70vh] overflow-y-auto animate-in fade-in duration-200">
              {regError && (
                <div className="p-3 rounded-lg bg-[#FF2E4D]/15 border border-[#FF2E4D]/30 text-xs text-[#FF2E4D] font-semibold">
                  {regError}
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-[#94A8A3] mb-1">
                  Seu Nome Completo *
                </label>
                <input
                  type="text"
                  required
                  value={regName}
                  onChange={(e) => {
                    setRegName(e.target.value);
                    if (!regUsername) {
                      setRegUsername(e.target.value.toLowerCase().replace(/\s+/g, ''));
                    }
                  }}
                  placeholder="Ex: Judith Rezende"
                  className="w-full bg-[#060D0B] border border-white/[0.1] rounded-lg px-3.5 py-2.5 text-sm text-[#F0FDF8] focus:outline-none focus:border-[#00D2FF]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#94A8A3] mb-1">
                  Nome de Usuário (@handle público)
                </label>
                <div className="flex items-center">
                  <span className="px-3.5 py-2.5 rounded-l-lg bg-[#0D1F1C] border border-r-0 border-white/[0.1] text-xs text-[#94A8A3]">
                    @
                  </span>
                  <input
                    type="text"
                    value={regUsername}
                    onChange={(e) => setRegUsername(e.target.value)}
                    placeholder="judithfilmes"
                    className="w-full bg-[#060D0B] border border-white/[0.1] rounded-r-lg px-3.5 py-2.5 text-sm text-[#F0FDF8] focus:outline-none focus:border-[#00D2FF]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#94A8A3] mb-1">
                  Gênero de Cinema Preferido
                </label>
                <select
                  value={regGenre}
                  onChange={(e) => setRegGenre(e.target.value)}
                  className="w-full bg-[#060D0B] border border-white/[0.1] rounded-lg px-3.5 py-2.5 text-sm text-[#F0FDF8] focus:outline-none focus:border-[#00D2FF]"
                >
                  <option value="Ficção Científica">Ficção Científica</option>
                  <option value="Drama & Psicológico">Drama & Psicológico</option>
                  <option value="Crime & Neo-Noir">Crime & Neo-Noir</option>
                  <option value="Terror & Suspense">Terror & Suspense</option>
                  <option value="Animação & Fantasia">Animação & Fantasia</option>
                  <option value="Cinema Clássico">Cinema Clássico</option>
                  <option value="Cinema Nacional Brasileiro">Cinema Nacional Brasileiro</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#94A8A3] mb-1">
                  Biografia do seu Perfil
                </label>
                <textarea
                  rows={2}
                  value={regBio}
                  onChange={(e) => setRegBio(e.target.value)}
                  placeholder="Conte um pouco sobre sua relação com o cinema..."
                  className="w-full bg-[#060D0B] border border-white/[0.1] rounded-lg px-3.5 py-2.5 text-xs text-[#F0FDF8] focus:outline-none focus:border-[#00D2FF] leading-relaxed"
                />
              </div>

              {/* Avatar Picker */}
              <div>
                <label className="block text-xs font-semibold text-[#94A8A3] mb-1.5">
                  Escolha seu Avatar Cinematográfico
                </label>
                <div className="grid grid-cols-6 gap-2">
                  {AVATAR_PRESETS.map((preset, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        setRegAvatar(preset.url);
                        setRegCustomAvatar('');
                      }}
                      className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                        regAvatar === preset.url && !regCustomAvatar
                          ? 'border-[#00D2FF] shadow-[0_0_12px_rgba(0,210,255,0.5)] scale-105'
                          : 'border-transparent opacity-70 hover:opacity-100'
                      }`}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={preset.url} alt={preset.name} className="w-full h-full object-cover" />
                      {regAvatar === preset.url && !regCustomAvatar && (
                        <div className="absolute inset-0 bg-[#00D2FF]/20 flex items-center justify-center">
                          <Check className="w-4 h-4 text-white drop-shadow" />
                        </div>
                      )}
                    </button>
                  ))}
                </div>
                <input
                  type="url"
                  value={regCustomAvatar}
                  onChange={(e) => setRegCustomAvatar(e.target.value)}
                  placeholder="Ou cole a URL de uma foto personalizada..."
                  className="mt-2 w-full bg-[#060D0B] border border-white/[0.1] rounded-lg px-3 py-1.5 text-xs text-[#F0FDF8] focus:outline-none focus:border-[#00D2FF]"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-3.5 px-4 rounded-xl bg-[#00D2FF] hover:bg-[#47d6ff] text-[#060D0B] font-black text-sm shadow-[0_0_24px_rgba(0,210,255,0.4)] transition-all flex items-center justify-center gap-2"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>Concluir Cadastro & Entrar</span>
                </button>
              </div>
            </form>
          )}

          {/* Tab 3: Existing Presets (Sofia, Lucas, Beatriz) */}
          {tab === 'existing' && (
            <div className="p-6 sm:p-8 space-y-4 animate-in fade-in duration-200">
              <p className="text-xs text-[#94A8A3]">
                Deseja testar a rede acessando o perfil de um dos cinéfilos já estabelecidos na plataforma? Escolha abaixo:
              </p>

              <div className="space-y-2.5">
                {allUsers.map((u) => (
                  <button
                    key={u.id}
                    onClick={() => onSelectExistingUser(u)}
                    className="w-full p-3.5 rounded-xl bg-[#0D1F1C] border border-white/[0.08] hover:border-[#00D2FF] hover:bg-[#122b26] transition-all flex items-center gap-3.5 text-left group"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={u.avatar}
                      alt={u.name}
                      className="w-12 h-12 rounded-xl object-cover border border-[#00D2FF]/40 group-hover:scale-105 transition-transform"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-[#F0FDF8] group-hover:text-[#00D2FF] transition-colors truncate">
                          {u.name}
                        </span>
                        <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-[#00D2FF]/10 text-[#00D2FF]">
                          {u.badge}
                        </span>
                      </div>
                      <p className="text-xs text-[#94A8A3]">@{u.username} • {u.favoriteGenre}</p>
                      <p className="text-[11px] text-[#4D635F] italic truncate mt-0.5">&ldquo;{u.bio}&rdquo;</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Footer Info */}
      <footer className="relative z-10 py-6 text-center text-xs text-[#4D635F]">
        <p>Lumina CineClub • A rede social para quem ama a sétima arte</p>
      </footer>
    </div>
  );
}
