'use client';

import React, { useState } from 'react';
import { User } from '@/types';
import { X, UserPlus, LogIn, Sparkles, Film, Check, ShieldCheck } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User;
  allUsers: User[];
  onSelectUser: (user: User) => void;
  onRegisterUser: (newUser: User) => void;
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

export function AuthModal({
  isOpen,
  onClose,
  currentUser,
  allUsers,
  onSelectUser,
  onRegisterUser,
}: AuthModalProps) {
  const [tab, setTab] = useState<'visitor' | 'register' | 'switch'>('visitor');

  // Visitor form state
  const [visitorName, setVisitorName] = useState('Visitante Cinéfilo');
  const [visitorBio, setVisitorBio] = useState('Apenas explorando filmes incríveis e visitando perfis da comunidade.');

  // Register form state
  const [regName, setRegName] = useState('');
  const [regUsername, setRegUsername] = useState('');
  const [regGenre, setRegGenre] = useState('Ficção Científica');
  const [regBio, setRegBio] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState(AVATAR_PRESETS[0].url);
  const [customAvatarUrl, setCustomAvatarUrl] = useState('');
  const [regError, setRegError] = useState('');

  if (!isOpen) return null;

  const handleVisitorEnter = () => {
    const visitorUser: User = {
      id: 'user_visitor',
      name: visitorName.trim() || 'Visitante Cinéfilo',
      username: 'visitante',
      avatar: selectedAvatar,
      bannerUrl: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=1200&auto=format&fit=crop&q=80',
      bio: visitorBio.trim() || 'Visitante explorando a comunidade.',
      favoriteGenre: 'Cinema em Geral',
      badge: 'Cinéfilo Visitante',
      joinedDate: 'Hoje',
      followersCount: 0,
      followingCount: 3,
      isGuest: true,
    };
    onSelectUser(visitorUser);
    onClose();
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!regName.trim()) {
      setRegError('Por favor informe o seu nome ou apelido.');
      return;
    }
    const cleanUsername = (regUsername.trim() || regName.toLowerCase().replace(/\s+/g, ''))
      .replace(/[^a-zA-Z0-9_]/g, '');

    const newUser: User = {
      id: `user_${Date.now()}`,
      name: regName.trim(),
      username: cleanUsername,
      avatar: customAvatarUrl.trim() || selectedAvatar,
      bannerUrl: 'https://images.unsplash.com/photo-1518134346374-184f9d21cb39?w=1200&auto=format&fit=crop&q=80',
      bio: regBio.trim() || 'Apaixonado pela magia da tela grande.',
      favoriteGenre: regGenre,
      badge: 'Novo Cinéfilo',
      joinedDate: 'Agora',
      followersCount: 0,
      followingCount: 0,
      isGuest: false,
    };

    onRegisterUser(newUser);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#060D0B]/80 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="w-full max-w-lg rounded-2xl bg-[#091412] border border-white/[0.12] shadow-[0_16px_50px_rgba(0,0,0,0.8)] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="relative px-6 pt-6 pb-4 border-b border-white/[0.08] bg-gradient-to-r from-[#0D1F1C] to-[#091412] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-[#00D2FF]/10 border border-[#00D2FF]/30 flex items-center justify-center text-[#00D2FF]">
              <Film className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-[#F0FDF8]">
                Acesso & Cadastro no Lumina
              </h2>
              <p className="text-xs text-[#94A8A3]">
                Entre como visitante ou cadastre sua conta para curtir e comentar
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#94A8A3] hover:text-white hover:bg-white/[0.06] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selection */}
        <div className="grid grid-cols-3 p-2 bg-[#060D0B] border-b border-white/[0.08] text-xs font-semibold">
          <button
            onClick={() => setTab('visitor')}
            className={`py-2 px-3 rounded-lg flex items-center justify-center gap-1.5 transition-all ${
              tab === 'visitor'
                ? 'bg-[#00D2FF] text-[#060D0B] font-bold shadow-[0_0_15px_rgba(0,210,255,0.3)]'
                : 'text-[#94A8A3] hover:text-[#F0FDF8]'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Modo Visitante</span>
          </button>

          <button
            onClick={() => setTab('register')}
            className={`py-2 px-3 rounded-lg flex items-center justify-center gap-1.5 transition-all ${
              tab === 'register'
                ? 'bg-[#00D2FF] text-[#060D0B] font-bold shadow-[0_0_15px_rgba(0,210,255,0.3)]'
                : 'text-[#94A8A3] hover:text-[#F0FDF8]'
            }`}
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Criar Cadastro</span>
          </button>

          <button
            onClick={() => setTab('switch')}
            className={`py-2 px-3 rounded-lg flex items-center justify-center gap-1.5 transition-all ${
              tab === 'switch'
                ? 'bg-[#00D2FF] text-[#060D0B] font-bold shadow-[0_0_15px_rgba(0,210,255,0.3)]'
                : 'text-[#94A8A3] hover:text-[#F0FDF8]'
            }`}
          >
            <LogIn className="w-3.5 h-3.5" />
            <span>Trocar Usuário</span>
          </button>
        </div>

        {/* Tab 1: Visitor Mode (Simple, immediate entrance) */}
        {tab === 'visitor' && (
          <div className="p-6 space-y-4">
            <div className="p-4 rounded-xl bg-[#0D1F1C]/70 border border-[#00D2FF]/20 flex items-start gap-3">
              <ShieldCheck className="w-6 h-6 text-[#00D2FF] flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm font-bold text-[#F0FDF8]">Acesso Instantâneo para Visitantes</h4>
                <p className="text-xs text-[#94A8A3] mt-1 leading-relaxed">
                  Você pode usar o site imediatamente sem precisar criar senhas! Como visitante, você poderá cadastrar seus filmes favoritos, editar, remover e visitar páginas de outros cinéfilos para deixar comentários.
                </p>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#94A8A3] mb-1.5">
                Nome de Exibição do Visitante
              </label>
              <input
                type="text"
                value={visitorName}
                onChange={(e) => setVisitorName(e.target.value)}
                placeholder="Ex: Visitante Cinéfilo, João do Cinema, etc."
                className="w-full bg-[#060D0B] border border-white/[0.1] rounded-lg px-3.5 py-2.5 text-sm text-[#F0FDF8] focus:outline-none focus:border-[#00D2FF] focus:shadow-[0_0_12px_rgba(0,210,255,0.2)]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#94A8A3] mb-1.5">
                Bio rápida / Frase de apresentação (opcional)
              </label>
              <input
                type="text"
                value={visitorBio}
                onChange={(e) => setVisitorBio(e.target.value)}
                placeholder="Ex: Apaixonado por filmes cult e clássicos dos anos 80."
                className="w-full bg-[#060D0B] border border-white/[0.1] rounded-lg px-3.5 py-2.5 text-sm text-[#F0FDF8] focus:outline-none focus:border-[#00D2FF]"
              />
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={handleVisitorEnter}
                className="w-full py-3 px-4 rounded-xl bg-[#00D2FF] hover:bg-[#47d6ff] text-[#060D0B] font-extrabold text-sm shadow-[0_0_24px_rgba(0,210,255,0.4)] hover:shadow-[0_0_32px_rgba(0,210,255,0.55)] transition-all flex items-center justify-center gap-2"
              >
                <Sparkles className="w-4 h-4" />
                Entrar Agora como Visitante
              </button>
            </div>
          </div>
        )}

        {/* Tab 2: Full Registration */}
        {tab === 'register' && (
          <form onSubmit={handleRegisterSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
            {regError && (
              <div className="p-3 rounded-lg bg-[#FF2E4D]/15 border border-[#FF2E4D]/30 text-xs text-[#FF2E4D]">
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
                className="w-full bg-[#060D0B] border border-white/[0.1] rounded-lg px-3 py-2 text-sm text-[#F0FDF8] focus:outline-none focus:border-[#00D2FF]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#94A8A3] mb-1">
                Nome de Usuário (@handle)
              </label>
              <div className="flex items-center">
                <span className="px-3 py-2 rounded-l-lg bg-[#0D1F1C] border border-r-0 border-white/[0.1] text-xs text-[#94A8A3]">
                  @
                </span>
                <input
                  type="text"
                  value={regUsername}
                  onChange={(e) => setRegUsername(e.target.value)}
                  placeholder="judithfilmes"
                  className="w-full bg-[#060D0B] border border-white/[0.1] rounded-r-lg px-3 py-2 text-sm text-[#F0FDF8] focus:outline-none focus:border-[#00D2FF]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#94A8A3] mb-1">
                Gênero Cinematográfico Favorito
              </label>
              <select
                value={regGenre}
                onChange={(e) => setRegGenre(e.target.value)}
                className="w-full bg-[#060D0B] border border-white/[0.1] rounded-lg px-3 py-2 text-sm text-[#F0FDF8] focus:outline-none focus:border-[#00D2FF]"
              >
                <option value="Ficção Científica">Ficção Científica</option>
                <option value="Drama & Psicológico">Drama & Psicológico</option>
                <option value="Crime & Neo-Noir">Crime & Neo-Noir</option>
                <option value="Terror & Suspense">Terror & Suspense</option>
                <option value="Animação & Fantasia">Animação & Fantasia</option>
                <option value="Cinema Clássico">Cinema Clássico</option>
                <option value="Comédia & Humor Ácido">Comédia & Humor Ácido</option>
                <option value="Cinema Nacional Brasileiro">Cinema Nacional Brasileiro</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#94A8A3] mb-1">
                Bio / Apresentação do seu Perfil
              </label>
              <textarea
                rows={2}
                value={regBio}
                onChange={(e) => setRegBio(e.target.value)}
                placeholder="Conte para a comunidade quais são suas preferências no cinema..."
                className="w-full bg-[#060D0B] border border-white/[0.1] rounded-lg px-3 py-2 text-sm text-[#F0FDF8] focus:outline-none focus:border-[#00D2FF]"
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
                      setSelectedAvatar(preset.url);
                      setCustomAvatarUrl('');
                    }}
                    className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                      selectedAvatar === preset.url && !customAvatarUrl
                        ? 'border-[#00D2FF] shadow-[0_0_12px_rgba(0,210,255,0.5)] scale-105'
                        : 'border-transparent opacity-70 hover:opacity-100'
                    }`}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={preset.url} alt={preset.name} className="w-full h-full object-cover" />
                    {selectedAvatar === preset.url && !customAvatarUrl && (
                      <div className="absolute inset-0 bg-[#00D2FF]/20 flex items-center justify-center">
                        <Check className="w-4 h-4 text-white drop-shadow" />
                      </div>
                    )}
                  </button>
                ))}
              </div>
              <input
                type="url"
                value={customAvatarUrl}
                onChange={(e) => setCustomAvatarUrl(e.target.value)}
                placeholder="Ou cole a URL de uma foto personalizada..."
                className="mt-2 w-full bg-[#060D0B] border border-white/[0.1] rounded-lg px-3 py-1.5 text-xs text-[#F0FDF8] focus:outline-none focus:border-[#00D2FF]"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 px-4 rounded-xl bg-[#00D2FF] hover:bg-[#47d6ff] text-[#060D0B] font-extrabold text-sm shadow-[0_0_24px_rgba(0,210,255,0.4)] transition-all flex items-center justify-center gap-2"
            >
              <UserPlus className="w-4 h-4" />
              Finalizar Cadastro & Começar
            </button>
          </form>
        )}

        {/* Tab 3: Switch Active User Profile */}
        {tab === 'switch' && (
          <div className="p-6 space-y-4">
            <p className="text-xs text-[#94A8A3]">
              Selecione qualquer perfil abaixo para assumir sua conta, ver como ela interage e testar enviar recados para outros cinéfilos:
            </p>

            <div className="space-y-2">
              {allUsers.map((u) => {
                const isCurrent = currentUser.id === u.id;
                return (
                  <button
                    key={u.id}
                    onClick={() => {
                      onSelectUser(u);
                      onClose();
                    }}
                    className={`w-full p-3 rounded-xl border flex items-center gap-3 transition-all text-left ${
                      isCurrent
                        ? 'bg-[#00D2FF]/10 border-[#00D2FF] shadow-[0_0_16px_rgba(0,210,255,0.25)]'
                        : 'bg-[#0D1F1C] border-white/[0.08] hover:border-[#00D2FF]/40 hover:bg-[#122824]'
                    }`}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={u.avatar}
                      alt={u.name}
                      className="w-12 h-12 rounded-full object-cover border border-white/20"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-[#F0FDF8] truncate">{u.name}</span>
                        {isCurrent && (
                          <span className="text-[10px] bg-[#00D2FF] text-[#060D0B] font-extrabold px-1.5 py-0.2 rounded">
                            ATIVO
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-[#94A8A3] truncate">@{u.username} • {u.favoriteGenre}</p>
                      <p className="text-[11px] text-[#4D635F] italic truncate mt-0.5">&ldquo;{u.bio}&rdquo;</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
