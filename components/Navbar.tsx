'use client';

import React from 'react';
import { User } from '@/types';
import { Film, Sparkles, Plus, Users, Clapperboard, MessageSquare, LogIn, LogOut, UserCheck, Search } from 'lucide-react';

interface NavbarProps {
  currentUser: User;
  activeTab: 'my-profile' | 'community' | 'all-movies' | 'guestbook-feed';
  setActiveTab: (tab: 'my-profile' | 'community' | 'all-movies' | 'guestbook-feed') => void;
  onOpenAuthModal: () => void;
  onOpenAddMovieModal: () => void;
  onSelectUserToView: (user: User) => void;
  onLogout?: () => void;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  allUsers: User[];
}

export function Navbar({
  currentUser,
  activeTab,
  setActiveTab,
  onOpenAuthModal,
  onOpenAddMovieModal,
  onSelectUserToView,
  onLogout,
  searchTerm,
  setSearchTerm,
  allUsers,
}: NavbarProps) {
  const [showUserDropdown, setShowUserDropdown] = React.useState(false);

  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b border-white/[0.08] bg-[#060D0B]/90 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between gap-3 sm:gap-4">
          {/* Brand Logo */}
          <div 
            onClick={() => {
              onSelectUserToView(currentUser);
              setActiveTab('my-profile');
            }}
            className="flex items-center gap-2.5 sm:gap-3 cursor-pointer group select-none flex-shrink-0"
          >
            <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-lg bg-gradient-to-br from-[#00D2FF]/20 via-[#0D1F1C] to-[#FF2E4D]/20 border border-[#00D2FF]/40 flex items-center justify-center relative group-hover:border-[#00D2FF] group-hover:shadow-[0_0_20px_rgba(0,210,255,0.35)] transition-all duration-300">
              <Film className="w-5 h-5 sm:w-6 sm:h-6 text-[#00D2FF] transition-transform duration-300 group-hover:scale-110" />
              <div className="absolute -top-1 -right-1 w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-[#FF2E4D] animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-lg sm:text-xl tracking-tight text-[#F0FDF8]">
                  LUMINA<span className="text-[#00D2FF]">.CINE</span>
                </span>
                <span className="text-[9px] sm:text-[10px] uppercase font-bold tracking-widest px-1.5 py-0.5 rounded bg-[#00D2FF]/10 text-[#00D2FF] border border-[#00D2FF]/20">
                  CLUBE
                </span>
              </div>
              <p className="text-[10px] sm:text-[11px] text-[#94A8A3] tracking-wide font-medium hidden sm:block">
                Rede Social de Amantes do Cinema
              </p>
            </div>
          </div>

          {/* Global Search Bar */}
          <div className="hidden md:flex items-center flex-1 max-w-xs lg:max-w-md relative">
            <Search className="w-4 h-4 text-[#94A8A3] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar filmes, gêneros ou cinéfilos..."
              className="w-full bg-[#091412] text-sm text-[#F0FDF8] placeholder-[#4D635F] pl-10 pr-4 py-2 rounded-lg border border-white/[0.08] focus:outline-none focus:border-[#00D2FF] focus:shadow-[0_0_16px_rgba(0,210,255,0.2)] transition-all"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[#94A8A3] hover:text-white"
              >
                Limpar
              </button>
            )}
          </div>

          {/* Navigation Tabs (Desktop) */}
          <nav className="hidden lg:flex items-center gap-1">
            <button
              onClick={() => {
                onSelectUserToView(currentUser);
                setActiveTab('my-profile');
              }}
              className={`px-3.5 py-2 rounded-lg text-sm font-semibold transition-all flex items-center gap-2 ${
                activeTab === 'my-profile'
                  ? 'bg-[#0D1F1C] text-[#00D2FF] border border-[#00D2FF]/40 shadow-[0_0_12px_rgba(0,210,255,0.15)]'
                  : 'text-[#94A8A3] hover:text-[#F0FDF8] hover:bg-white/[0.04]'
              }`}
            >
              <Clapperboard className="w-4 h-4" />
              Meu Perfil
            </button>

            <button
              onClick={() => setActiveTab('community')}
              className={`px-3.5 py-2 rounded-lg text-sm font-semibold transition-all flex items-center gap-2 ${
                activeTab === 'community'
                  ? 'bg-[#0D1F1C] text-[#00D2FF] border border-[#00D2FF]/40 shadow-[0_0_12px_rgba(0,210,255,0.15)]'
                  : 'text-[#94A8A3] hover:text-[#F0FDF8] hover:bg-white/[0.04]'
              }`}
            >
              <Users className="w-4 h-4" />
              Explorar Cinéfilos
            </button>

            <button
              onClick={() => setActiveTab('all-movies')}
              className={`px-3.5 py-2 rounded-lg text-sm font-semibold transition-all flex items-center gap-2 ${
                activeTab === 'all-movies'
                  ? 'bg-[#0D1F1C] text-[#00D2FF] border border-[#00D2FF]/40 shadow-[0_0_12px_rgba(0,210,255,0.15)]'
                  : 'text-[#94A8A3] hover:text-[#F0FDF8] hover:bg-white/[0.04]'
              }`}
            >
              <Film className="w-4 h-4" />
              Catálogo da Rede
            </button>

            <button
              onClick={() => setActiveTab('guestbook-feed')}
              className={`px-3.5 py-2 rounded-lg text-sm font-semibold transition-all flex items-center gap-2 ${
                activeTab === 'guestbook-feed'
                  ? 'bg-[#0D1F1C] text-[#00D2FF] border border-[#00D2FF]/40 shadow-[0_0_12px_rgba(0,210,255,0.15)]'
                  : 'text-[#94A8A3] hover:text-[#F0FDF8] hover:bg-white/[0.04]'
              }`}
            >
              <MessageSquare className="w-4 h-4" />
              Mural Geral
            </button>
          </nav>

          {/* Action Controls & User Account */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Quick Add Movie Button */}
            <button
              onClick={onOpenAddMovieModal}
              className="flex items-center gap-1.5 sm:gap-2 px-3 py-2 sm:px-3.5 sm:py-2 rounded-lg bg-[#00D2FF] hover:bg-[#47d6ff] text-[#060D0B] font-extrabold text-xs sm:text-sm shadow-[0_0_20px_rgba(0,210,255,0.35)] hover:shadow-[0_0_28px_rgba(0,210,255,0.5)] transform hover:scale-[1.02] active:scale-95 transition-all"
              title="Cadastrar Filme Favorito"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span className="hidden sm:inline">Cadastrar Filme</span>
              <span className="sm:hidden font-bold">Filme</span>
            </button>

            {/* User Profile / Account Switcher */}
            <div className="relative">
              <button
                onClick={() => setShowUserDropdown(!showUserDropdown)}
                className="flex items-center gap-2 p-1.5 sm:px-3 sm:py-1.5 rounded-lg bg-[#0D1F1C] border border-white/[0.1] hover:border-[#00D2FF]/50 transition-all text-left"
              >
                <div className="relative w-8 h-8 rounded-full overflow-hidden border border-[#00D2FF]/40 flex-shrink-0">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={currentUser.avatar}
                    alt={currentUser.name}
                    className="w-full h-full object-cover"
                  />
                  {currentUser.isGuest && (
                    <span className="absolute bottom-0 right-0 w-2 h-2 rounded-full bg-[#FF2E4D]" />
                  )}
                </div>
                <div className="hidden sm:block">
                  <div className="text-xs font-bold text-[#F0FDF8] leading-tight flex items-center gap-1 truncate max-w-[110px]">
                    {currentUser.name}
                  </div>
                  <div className="text-[10px] text-[#94A8A3] truncate max-w-[110px]">
                    @{currentUser.username} {currentUser.isGuest ? '(Visitante)' : ''}
                  </div>
                </div>
              </button>

              {/* Dropdown Menu */}
              {showUserDropdown && (
                <div 
                  className="absolute right-0 mt-2 w-64 rounded-xl bg-[#091412] border border-white/[0.12] shadow-2xl p-2 z-50 animate-in fade-in zoom-in-95 duration-150"
                  onMouseLeave={() => setShowUserDropdown(false)}
                >
                  <div className="px-3 py-2 border-b border-white/[0.08] mb-1">
                    <p className="text-xs text-[#94A8A3]">Conectado atualmente como:</p>
                    <p className="text-sm font-bold text-[#F0FDF8] truncate">{currentUser.name}</p>
                    <span className="inline-block mt-1 text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-[#00D2FF]/10 text-[#00D2FF]">
                      {currentUser.badge}
                    </span>
                  </div>

                  <div className="space-y-0.5">
                    <button
                      onClick={() => {
                        onSelectUserToView(currentUser);
                        setActiveTab('my-profile');
                        setShowUserDropdown(false);
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-[#F0FDF8] hover:bg-[#0D1F1C] rounded-lg transition-colors text-left"
                    >
                      <UserCheck className="w-4 h-4 text-[#00D2FF]" />
                      Ver Meu Perfil & Filmes
                    </button>

                    <button
                      onClick={() => {
                        onOpenAddMovieModal();
                        setShowUserDropdown(false);
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-[#00D2FF] hover:bg-[#0D1F1C] rounded-lg transition-colors text-left"
                    >
                      <Plus className="w-4 h-4 text-[#00D2FF]" />
                      Cadastrar Filme Favorito
                    </button>

                    <button
                      onClick={() => {
                        onOpenAuthModal();
                        setShowUserDropdown(false);
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-[#F0FDF8] hover:bg-[#0D1F1C] rounded-lg transition-colors text-left"
                    >
                      <LogIn className="w-4 h-4 text-[#00D2FF]" />
                      Trocar Conta / Nova Conta
                    </button>

                    {onLogout && (
                      <button
                        onClick={() => {
                          onLogout();
                          setShowUserDropdown(false);
                        }}
                        className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-[#FF2E4D] hover:bg-[#FF2E4D]/10 rounded-lg transition-colors text-left"
                      >
                        <LogOut className="w-4 h-4 text-[#FF2E4D]" />
                        Sair / Ir para Tela de Login
                      </button>
                    )}
                  </div>

                  {/* Quick visit another profile */}
                  <div className="mt-2 pt-2 border-t border-white/[0.08]">
                    <p className="text-[11px] font-bold text-[#94A8A3] px-3 mb-1.5 uppercase tracking-wider">
                      Visitar Perfil na Rede:
                    </p>
                    <div className="space-y-1">
                      {allUsers.slice(0, 3).map((u) => (
                        <button
                          key={u.id}
                          onClick={() => {
                            onSelectUserToView(u);
                            setShowUserDropdown(false);
                          }}
                          className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs transition-all text-left ${
                            currentUser.id === u.id ? 'bg-[#00D2FF]/10 text-[#00D2FF] font-bold' : 'text-[#94A8A3] hover:text-white hover:bg-white/[0.04]'
                          }`}
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={u.avatar} alt={u.name} className="w-5 h-5 rounded-full object-cover" />
                          <span className="truncate">{u.name}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Modern Fixed Bottom Navigation Dock for Mobile Devices */}
      <nav 
        aria-label="Navegação móvel"
        className="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-[#060D0B]/95 backdrop-blur-2xl border-t border-white/[0.1] px-3 py-2 flex items-center justify-around shadow-[0_-6px_25px_rgba(0,0,0,0.8)]"
      >
        <button
          onClick={() => {
            onSelectUserToView(currentUser);
            setActiveTab('my-profile');
          }}
          className={`flex flex-col items-center justify-center gap-1 py-1 px-2.5 rounded-xl transition-all ${
            activeTab === 'my-profile'
              ? 'text-[#00D2FF] font-bold'
              : 'text-[#94A8A3] hover:text-[#F0FDF8]'
          }`}
        >
          <Clapperboard className="w-4 h-4" />
          <span className="text-[10px] tracking-tight">Meu Perfil</span>
        </button>

        <button
          onClick={() => setActiveTab('community')}
          className={`flex flex-col items-center justify-center gap-1 py-1 px-2.5 rounded-xl transition-all ${
            activeTab === 'community'
              ? 'text-[#00D2FF] font-bold'
              : 'text-[#94A8A3] hover:text-[#F0FDF8]'
          }`}
        >
          <Users className="w-4 h-4" />
          <span className="text-[10px] tracking-tight">Cinéfilos</span>
        </button>

        <button
          onClick={() => setActiveTab('all-movies')}
          className={`flex flex-col items-center justify-center gap-1 py-1 px-2.5 rounded-xl transition-all ${
            activeTab === 'all-movies'
              ? 'text-[#00D2FF] font-bold'
              : 'text-[#94A8A3] hover:text-[#F0FDF8]'
          }`}
        >
          <Film className="w-4 h-4" />
          <span className="text-[10px] tracking-tight">Catálogo</span>
        </button>

        <button
          onClick={() => setActiveTab('guestbook-feed')}
          className={`flex flex-col items-center justify-center gap-1 py-1 px-2.5 rounded-xl transition-all ${
            activeTab === 'guestbook-feed'
              ? 'text-[#00D2FF] font-bold'
              : 'text-[#94A8A3] hover:text-[#F0FDF8]'
          }`}
        >
          <MessageSquare className="w-4 h-4" />
          <span className="text-[10px] tracking-tight">Recados</span>
        </button>
      </nav>
    </>
  );
}
