'use client';

import React, { useState, useRef } from 'react';
import { User } from '@/types';
import { supabaseService } from '@/services/supabaseService';
import { processImageFile } from '@/lib/utils';
import {
  X,
  UserPlus,
  LogIn,
  Film,
  Check,
  Upload,
  Mail,
  Lock,
  AlertCircle,
  CheckCircle2,
  LogOut,
} from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User;
  onAuthenticatedUser: (user: User) => void;
  onLogout: () => void;
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
  onAuthenticatedUser,
  onLogout,
}: AuthModalProps) {
  const [tab, setTab] = useState<'login' | 'register'>('login');

  // Sign In state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState('');

  // Register state
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regName, setRegName] = useState('');
  const [regUsername, setRegUsername] = useState('');
  const [regGenre, setRegGenre] = useState('Ficção Científica');
  const [regBio, setRegBio] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState(AVATAR_PRESETS[0].url);
  const [regLoading, setRegLoading] = useState(false);
  const [regError, setRegError] = useState('');
  const [regSuccess, setRegSuccess] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const regFileInputRef = useRef<HTMLInputElement>(null);

  const handleRegFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setIsUploading(true);
      const dataUrl = await processImageFile(file, 400, 0.85);
      setSelectedAvatar(dataUrl);
    } catch (err: any) {
      setRegError(err.message || 'Erro ao processar imagem.');
    } finally {
      setIsUploading(false);
    }
  };

  if (!isOpen) return null;

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    if (!loginEmail.trim() || !loginPassword) {
      setLoginError('Informe seu e-mail (ou @usuario) e sua senha.');
      return;
    }

    setLoginLoading(true);
    const result = await supabaseService.signInWithEmail(loginEmail.trim(), loginPassword);
    setLoginLoading(false);

    if (!result.success || !result.user) {
      setLoginError(result.error || 'Erro ao autenticar no Supabase Auth.');
      return;
    }

    onAuthenticatedUser(result.user);
    onClose();
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegError('');
    setRegSuccess('');

    const cleanEmail = regEmail.trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes('@')) {
      setRegError('Informe um e-mail válido.');
      return;
    }
    if (!regPassword || regPassword.length < 6) {
      setRegError('A senha deve ter no mínimo 6 caracteres.');
      return;
    }

    const nameToUse = regName.trim() || cleanEmail.split('@')[0];
    const cleanUsername =
      (regUsername.trim() || nameToUse.toLowerCase().replace(/\s+/g, '')).replace(
        /[^a-zA-Z0-9_]/g,
        ''
      ) || cleanEmail.split('@')[0];

    setRegLoading(true);
    const result = await supabaseService.signUpWithEmail({
      email: cleanEmail,
      password: regPassword,
      name: nameToUse,
      username: cleanUsername,
      favoriteGenre: regGenre,
      bio: regBio.trim() || 'Membro do Lumina CineClub.',
      avatar: selectedAvatar,
    });
    setRegLoading(false);

    if (!result.success) {
      setRegError(result.error || 'Erro ao cadastrar no Supabase Auth.');
      return;
    }

    if (result.needsEmailConfirmation) {
      setRegSuccess(
        `Conta criada no Supabase Auth (${cleanEmail})! Confirme o e-mail na sua caixa de entrada antes de entrar.`
      );
      return;
    }

    if (result.user) {
      onAuthenticatedUser(result.user);
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#060D0B]/80 backdrop-blur-md animate-in fade-in duration-200"
      onClick={onClose}
    >
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
                Conta Supabase Auth
              </h2>
              <p className="text-xs text-[#94A8A3]">
                Sessão atual: <strong className="text-[#00D2FF]">{currentUser.name}</strong> (@{currentUser.username})
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#94A8A3] hover:text-white hover:bg-white/[0.06] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selection */}
        <div className="grid grid-cols-2 p-1.5 sm:p-2 bg-[#060D0B] border-b border-white/[0.08] text-xs font-semibold gap-1.5">
          <button
            type="button"
            onClick={() => {
              setTab('login');
              setLoginError('');
            }}
            className={`py-2 px-2 rounded-lg flex items-center justify-center gap-1.5 transition-all min-h-[40px] ${
              tab === 'login'
                ? 'bg-[#00D2FF] text-[#060D0B] font-bold shadow-[0_0_15px_rgba(0,210,255,0.3)]'
                : 'text-[#94A8A3] hover:text-[#F0FDF8]'
            }`}
          >
            <LogIn className="w-3.5 h-3.5 flex-shrink-0" />
            <span>Entrar em Outra Conta</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setTab('register');
              setRegError('');
              setRegSuccess('');
            }}
            className={`py-2 px-2 rounded-lg flex items-center justify-center gap-1.5 transition-all min-h-[40px] ${
              tab === 'register'
                ? 'bg-[#00D2FF] text-[#060D0B] font-bold shadow-[0_0_15px_rgba(0,210,255,0.3)]'
                : 'text-[#94A8A3] hover:text-[#F0FDF8]'
            }`}
          >
            <UserPlus className="w-3.5 h-3.5 flex-shrink-0" />
            <span>Nova Conta</span>
          </button>
        </div>

        {/* Tab 1: Sign In */}
        {tab === 'login' && (
          <form onSubmit={handleLoginSubmit} className="p-6 space-y-4">
            {loginError && (
              <div className="p-3 rounded-lg bg-[#FF2E4D]/15 border border-[#FF2E4D]/40 flex items-start gap-2 text-xs text-[#FF2E4D] font-semibold">
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span className="break-words">{loginError}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-[#94A8A3] mb-1">
                E-mail ou @usuario
              </label>
              <div className="relative">
                <Mail className="w-3.5 h-3.5 text-[#94A8A3] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  required
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  autoCapitalize="none"
                  autoCorrect="off"
                  spellCheck={false}
                  placeholder="seu.email@exemplo.com"
                  className="w-full bg-[#060D0B] border border-white/[0.1] rounded-lg pl-9 pr-3 py-2 text-sm text-[#F0FDF8] focus:outline-none focus:border-[#00D2FF]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#94A8A3] mb-1">
                Senha
              </label>
              <div className="relative">
                <Lock className="w-3.5 h-3.5 text-[#94A8A3] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="password"
                  required
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-[#060D0B] border border-white/[0.1] rounded-lg pl-9 pr-3 py-2 text-sm text-[#F0FDF8] focus:outline-none focus:border-[#00D2FF]"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loginLoading}
              className="w-full py-3 px-4 rounded-xl bg-[#00D2FF] hover:bg-[#47d6ff] text-[#060D0B] font-extrabold text-sm shadow-[0_0_24px_rgba(0,210,255,0.4)] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <LogIn className="w-4 h-4" />
              <span>{loginLoading ? 'Autenticando...' : 'Entrar com Supabase Auth'}</span>
            </button>

            <div className="pt-2 border-t border-white/[0.08] flex justify-center">
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onLogout();
                }}
                className="text-xs font-semibold text-[#FF2E4D] hover:underline flex items-center gap-1.5"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Encerrar Sessão Atual</span>
              </button>
            </div>
          </form>
        )}

        {/* Tab 2: Register */}
        {tab === 'register' && (
          <form onSubmit={handleRegisterSubmit} className="p-6 space-y-3.5 max-h-[75vh] overflow-y-auto">
            {regError && (
              <div className="p-3 rounded-lg bg-[#FF2E4D]/15 border border-[#FF2E4D]/40 flex items-start gap-2 text-xs text-[#FF2E4D] font-semibold">
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span className="break-words">{regError}</span>
              </div>
            )}

            {regSuccess && (
              <div className="p-3 rounded-lg bg-emerald-500/15 border border-emerald-400/40 flex items-start gap-2 text-xs text-emerald-300 font-semibold">
                <CheckCircle2 className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span>{regSuccess}</span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-[#94A8A3] mb-1">
                  E-mail *
                </label>
                <input
                  type="email"
                  required
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  autoCapitalize="none"
                  placeholder="seu.email@exemplo.com"
                  className="w-full bg-[#060D0B] border border-white/[0.1] rounded-lg px-3 py-2 text-sm text-[#F0FDF8] focus:outline-none focus:border-[#00D2FF]"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#94A8A3] mb-1">
                  Senha (min 6 carac.) *
                </label>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-[#060D0B] border border-white/[0.1] rounded-lg px-3 py-2 text-sm text-[#F0FDF8] focus:outline-none focus:border-[#00D2FF]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-[#94A8A3] mb-1">
                  Nome Completo *
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
                  <span className="px-2.5 py-2 rounded-l-lg bg-[#0D1F1C] border border-r-0 border-white/[0.1] text-xs text-[#94A8A3]">
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
                <option value="Cinema Nacional Brasileiro">Cinema Nacional Brasileiro</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#94A8A3] mb-1">
                Bio / Apresentação
              </label>
              <textarea
                rows={2}
                value={regBio}
                onChange={(e) => setRegBio(e.target.value)}
                placeholder="Conte para a comunidade quais são suas preferências no cinema..."
                className="w-full bg-[#060D0B] border border-white/[0.1] rounded-lg px-3 py-2 text-sm text-[#F0FDF8] focus:outline-none focus:border-[#00D2FF]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#94A8A3] mb-1.5">
                Foto de Perfil / Avatar
              </label>

              <input
                type="file"
                ref={regFileInputRef}
                accept="image/*"
                onChange={handleRegFileUpload}
                className="hidden"
              />

              <div className="p-3 rounded-xl bg-[#060D0B] border border-white/[0.1] flex items-center gap-3.5 mb-2.5">
                <div className="relative w-12 h-12 rounded-xl overflow-hidden border-2 border-[#00D2FF] bg-[#091412] flex-shrink-0">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={selectedAvatar} alt="Avatar selecionado" className="w-full h-full object-cover" />
                </div>

                <button
                  type="button"
                  onClick={() => regFileInputRef.current?.click()}
                  disabled={isUploading}
                  className="py-1.5 px-3 rounded-lg bg-[#00D2FF] hover:bg-[#47d6ff] text-[#060D0B] font-extrabold text-xs shadow-md transition-all flex items-center gap-1.5 disabled:opacity-50"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>{isUploading ? 'Carregando...' : 'Upload de Foto'}</span>
                </button>
              </div>

              <div className="grid grid-cols-6 gap-2">
                {AVATAR_PRESETS.map((preset, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setSelectedAvatar(preset.url)}
                    className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                      selectedAvatar === preset.url
                        ? 'border-[#00D2FF] scale-105'
                        : 'border-transparent opacity-70 hover:opacity-100'
                    }`}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={preset.url} alt={preset.name} className="w-full h-full object-cover" />
                    {selectedAvatar === preset.url && (
                      <div className="absolute inset-0 bg-[#00D2FF]/20 flex items-center justify-center">
                        <Check className="w-4 h-4 text-white drop-shadow" />
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>

            <button
              type="submit"
              disabled={regLoading}
              className="w-full py-3 px-4 rounded-xl bg-[#00D2FF] hover:bg-[#47d6ff] text-[#060D0B] font-extrabold text-sm shadow-[0_0_24px_rgba(0,210,255,0.4)] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <UserPlus className="w-4 h-4" />
              <span>{regLoading ? 'Cadastrando...' : 'Criar Conta no Supabase Auth'}</span>
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
