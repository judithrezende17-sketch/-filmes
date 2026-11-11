'use client';

import React, { useState, useRef } from 'react';
import { User } from '@/types';
import { supabaseService } from '@/services/supabaseService';
import { getSupabaseCredentials, setSupabaseCustomCredentials, cleanAsciiString } from '@/lib/supabase';
import { processImageFile } from '@/lib/utils';
import { SUPABASE_SQL_SCHEMA } from '@/lib/sqlSchema';
import { 
  Film, Sparkles, UserPlus, LogIn, ShieldCheck, Check, Star, 
  MessageSquare, Clapperboard, Mail, Lock, Database, Copy, AlertCircle, Eye, EyeOff, Settings2, RefreshCw,
  X, Key, ExternalLink, HelpCircle, Trash2, Upload, Camera, Image as ImageIcon, Code2
} from 'lucide-react';

interface LoginScreenProps {
  allUsers: User[];
  onLoginSuccess: (user: User, isSupabase: boolean) => void;
  onLoginAsVisitor: (name: string, bio: string, avatar: string) => void;
  onSelectExistingUser: (user: User) => void;
  onDeleteUser?: (userId: string) => void;
  onRefreshData?: () => void;
  isLoadingData?: boolean;
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
  onLoginSuccess,
  onLoginAsVisitor,
  onSelectExistingUser,
  onDeleteUser,
  onRefreshData,
  isLoadingData,
}: LoginScreenProps) {
  const [tab, setTab] = useState<'email-login' | 'email-register' | 'visitor' | 'existing'>('email-login');
  const [userToDelete, setUserToDelete] = useState<User | null>(null);

  // Email Sign In form state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState('');

  // Email Register form state
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regName, setRegName] = useState('');
  const [regUsername, setRegUsername] = useState('');
  const [regGenre, setRegGenre] = useState('Ficção Científica');
  const [regBio, setRegBio] = useState('');
  const [regAvatar, setRegAvatar] = useState(AVATAR_PRESETS[0].url);
  const [regCustomAvatar, setRegCustomAvatar] = useState('');
  const [regLoading, setRegLoading] = useState(false);
  const [regError, setRegError] = useState('');

  // Visitor form state
  const [visitorName, setVisitorName] = useState('Visitante Cinéfilo');
  const [visitorBio, setVisitorBio] = useState('Explorando os filmes favoritos da comunidade e conhecendo cinéfilos.');
  const [visitorAvatar, setVisitorAvatar] = useState(AVATAR_PRESETS[0].url);

  // File upload refs & states
  const regFileInputRef = useRef<HTMLInputElement>(null);
  const visitorFileInputRef = useRef<HTMLInputElement>(null);
  const [isUploadingReg, setIsUploadingReg] = useState(false);
  const [isUploadingVisitor, setIsUploadingVisitor] = useState(false);

  const handleRegFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setIsUploadingReg(true);
      const dataUrl = await processImageFile(file, 400, 0.85);
      setRegAvatar(dataUrl);
      setRegCustomAvatar('');
    } catch (err: any) {
      alert(err.message || 'Erro ao processar imagem.');
    } finally {
      setIsUploadingReg(false);
    }
  };

  const handleVisitorFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setIsUploadingVisitor(true);
      const dataUrl = await processImageFile(file, 400, 0.85);
      setVisitorAvatar(dataUrl);
    } catch (err: any) {
      alert(err.message || 'Erro ao processar imagem.');
    } finally {
      setIsUploadingVisitor(false);
    }
  };

  // Supabase Info Drawer State
  const [showSupabaseInfo, setShowSupabaseInfo] = useState(false);
  const [copiedVar, setCopiedVar] = useState<string | null>(null);

  // Dynamic credentials editing
  const [inputUrl, setInputUrl] = useState(() => getSupabaseCredentials().url);
  const [inputKey, setInputKey] = useState(() => getSupabaseCredentials().key);
  const [credsSaved, setCredsSaved] = useState(false);

  const isConfigured = supabaseService.isConfigured();

  const handleSaveCredentials = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanU = cleanAsciiString(inputUrl);
    const cleanK = cleanAsciiString(inputKey);
    setInputUrl(cleanU);
    setInputKey(cleanK);
    setSupabaseCustomCredentials(cleanU, cleanK);
    setCredsSaved(true);
    setLoginError('');
    setRegError('');
    setTimeout(() => setCredsSaved(false), 3000);
  };

  const handleResetCredentials = () => {
    setSupabaseCustomCredentials('', '');
    const reset = getSupabaseCredentials();
    setInputUrl(reset.url);
    setInputKey(reset.key);
    setCredsSaved(true);
    setTimeout(() => setCredsSaved(false), 3000);
  };

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedVar(label);
    setTimeout(() => setCopiedVar(null), 2500);
  };

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    if (!loginEmail.trim() || !loginPassword.trim()) {
      setLoginError('Informe seu e-mail e senha.');
      return;
    }

    setLoginLoading(true);
    const result = await supabaseService.signInWithEmail(loginEmail.trim(), loginPassword);
    setLoginLoading(false);

    if (result.success && result.user) {
      onLoginSuccess(result.user, result.isSupabaseLive);
    } else {
      setLoginError(result.error || 'Credenciais inválidas. Verifique seu e-mail e senha.');
    }
  };

  const handleEmailRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegError('');
    if (!regEmail.trim()) {
      setRegError('Informe um e-mail válido.');
      return;
    }
    if (regPassword.length < 6) {
      setRegError('A senha deve ter no mínimo 6 caracteres.');
      return;
    }
    if (!regName.trim()) {
      setRegError('Informe seu nome ou apelido de cinéfilo.');
      return;
    }

    const cleanUsername = (regUsername.trim() || regName.toLowerCase().replace(/\s+/g, ''))
      .replace(/[^a-zA-Z0-9_]/g, '');

    setRegLoading(true);
    const result = await supabaseService.signUpWithEmail({
      email: regEmail.trim(),
      password: regPassword,
      name: regName.trim(),
      username: cleanUsername,
      favoriteGenre: regGenre,
      bio: regBio.trim() || 'Membro do Lumina CineClub.',
      avatar: regCustomAvatar.trim() || regAvatar,
    });
    setRegLoading(false);

    if (result.success && result.user) {
      onLoginSuccess(result.user, result.isSupabaseLive);
    } else {
      setRegError(result.error || 'Falha ao realizar cadastro no Supabase.');
    }
  };

  const handleVisitorSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onLoginAsVisitor(
      visitorName.trim() || 'Visitante Cinéfilo',
      visitorBio.trim() || 'Visitante no Lumina CineClub.',
      visitorAvatar
    );
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
                SUPABASE
              </span>
            </div>
            <p className="text-[11px] text-[#94A8A3] tracking-wide">
              Rede Social de Amantes do Cinema
            </p>
          </div>
        </div>

        {/* Supabase Status Pill */}
        <button
          onClick={() => setShowSupabaseInfo(!showSupabaseInfo)}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-semibold transition-all ${
            isConfigured
              ? 'bg-[#00D2FF]/10 border-[#00D2FF]/40 text-[#00D2FF] shadow-[0_0_12px_rgba(0,210,255,0.2)]'
              : 'bg-[#0D1F1C] border-white/[0.12] text-[#94A8A3] hover:text-[#00D2FF] hover:border-[#00D2FF]/30'
          }`}
        >
          <Database className="w-3.5 h-3.5" />
          <span>{isConfigured ? 'Supabase Conectado' : 'Configurações Supabase'}</span>
          <span className={`w-2 h-2 rounded-full ${isConfigured ? 'bg-[#00D2FF] animate-pulse' : 'bg-emerald-400'}`} />
        </button>
      </header>

      {/* Main Login / Gateway Card Container */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-4 py-6 sm:py-8">
        <div className="w-full max-w-xl rounded-2xl bg-[#091412] border border-white/[0.12] shadow-[0_24px_70px_rgba(0,0,0,0.85)] overflow-hidden">
          {/* Card Top Title Banner */}
          <div className="p-6 sm:p-7 pb-4 text-center border-b border-white/[0.08] bg-gradient-to-b from-[#0D1F1C] to-[#091412]">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#00D2FF]/10 text-[#00D2FF] text-xs font-bold border border-[#00D2FF]/25 mb-2 shadow-[0_0_15px_rgba(0,210,255,0.2)]">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Autenticação & Armazenamento Supabase</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-[#F0FDF8] tracking-tight">
              Acesso ao Lumina CineClub
            </h1>
            <p className="text-xs sm:text-sm text-[#94A8A3] mt-1.5 max-w-md mx-auto leading-relaxed">
              Faça login com seu e-mail, crie sua conta ou entre como visitante para favoritar filmes e deixar recados nos murais.
            </p>
          </div>

          {/* Interactive Navigation Tabs */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-1 p-2 bg-[#060D0B] border-b border-white/[0.08] text-xs font-semibold">
            <button
              onClick={() => {
                setTab('email-login');
                setLoginError('');
              }}
              className={`py-2 px-2 rounded-lg flex items-center justify-center gap-1.5 transition-all min-h-[40px] ${
                tab === 'email-login'
                  ? 'bg-[#00D2FF] text-[#060D0B] font-extrabold shadow-[0_0_14px_rgba(0,210,255,0.35)]'
                  : 'text-[#94A8A3] hover:text-[#F0FDF8] bg-white/[0.02]'
              }`}
            >
              <LogIn className="w-3.5 h-3.5 flex-shrink-0" />
              <span className="truncate">Entrar</span>
            </button>

            <button
              onClick={() => {
                setTab('email-register');
                setRegError('');
              }}
              className={`py-2 px-2 rounded-lg flex items-center justify-center gap-1.5 transition-all min-h-[40px] ${
                tab === 'email-register'
                  ? 'bg-[#00D2FF] text-[#060D0B] font-extrabold shadow-[0_0_14px_rgba(0,210,255,0.35)]'
                  : 'text-[#94A8A3] hover:text-[#F0FDF8] bg-white/[0.02]'
              }`}
            >
              <UserPlus className="w-3.5 h-3.5 flex-shrink-0" />
              <span className="truncate">Cadastrar</span>
            </button>

            <button
              onClick={() => setTab('visitor')}
              className={`py-2 px-2 rounded-lg flex items-center justify-center gap-1.5 transition-all min-h-[40px] ${
                tab === 'visitor'
                  ? 'bg-[#00D2FF] text-[#060D0B] font-extrabold shadow-[0_0_14px_rgba(0,210,255,0.35)]'
                  : 'text-[#94A8A3] hover:text-[#F0FDF8] bg-white/[0.02]'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 flex-shrink-0" />
              <span className="truncate">Visitante</span>
            </button>

            <button
              onClick={() => setTab('existing')}
              className={`py-2 px-2 rounded-lg flex items-center justify-center gap-1.5 transition-all min-h-[40px] ${
                tab === 'existing'
                  ? 'bg-[#00D2FF] text-[#060D0B] font-extrabold shadow-[0_0_14px_rgba(0,210,255,0.35)]'
                  : 'text-[#94A8A3] hover:text-[#F0FDF8] bg-white/[0.02]'
              }`}
            >
              <Clapperboard className="w-3.5 h-3.5 flex-shrink-0" />
              <span className="truncate">Perfis Salvos</span>
            </button>
          </div>

          {/* TAB 1: Email / Username Sign In */}
          {tab === 'email-login' && (
            <form onSubmit={handleEmailSignIn} className="p-5 sm:p-8 space-y-4 animate-in fade-in duration-200">
              {loginError && (
                <div className="p-4 rounded-xl bg-[#FF2E4D]/15 border border-[#FF2E4D]/35 space-y-2.5">
                  <div className="flex items-start gap-2.5 text-xs text-[#FF2E4D] font-bold">
                    <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                    <span className="leading-relaxed">{loginError}</span>
                  </div>
                  <div className="pt-1 flex flex-col sm:flex-row gap-2">
                    <button
                      type="button"
                      onClick={() => setTab('email-register')}
                      className="py-1.5 px-3 rounded-lg bg-[#00D2FF] text-[#060D0B] font-extrabold text-xs flex items-center justify-center gap-1.5 hover:bg-[#47d6ff] transition-all shadow-md"
                    >
                      <UserPlus className="w-3.5 h-3.5" />
                      <span>Criar Nova Conta no Supabase</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowSupabaseInfo(true)}
                      className="py-1.5 px-3 rounded-lg bg-white/[0.08] text-white hover:text-[#00D2FF] text-xs font-semibold flex items-center justify-center gap-1 transition-all"
                    >
                      <Database className="w-3.5 h-3.5" />
                      <span>Configurações Supabase</span>
                    </button>
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-[#94A8A3] mb-1.5">
                  E-mail ou Nome de Usuário (@)
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-[#94A8A3] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    required
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    autoCapitalize="none"
                    autoCorrect="off"
                    spellCheck={false}
                    placeholder="seu.email@exemplo.com ou @usuario"
                    className="w-full bg-[#060D0B] border border-white/[0.1] rounded-xl pl-10 pr-4 py-2.5 text-sm text-[#F0FDF8] focus:outline-none focus:border-[#00D2FF] focus:shadow-[0_0_14px_rgba(0,210,255,0.2)] transition-all"
                  />
                </div>
                <p className="text-[10px] text-[#4D635F] mt-1">
                  Dica: Você pode entrar com o e-mail cadastrado ou com seu @usuario
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#94A8A3] mb-1.5">
                  Sua Senha
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-[#94A8A3] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    autoCapitalize="none"
                    autoCorrect="off"
                    placeholder="••••••••"
                    className="w-full bg-[#060D0B] border border-white/[0.1] rounded-xl pl-10 pr-10 py-2.5 text-sm text-[#F0FDF8] focus:outline-none focus:border-[#00D2FF] focus:shadow-[0_0_14px_rgba(0,210,255,0.2)] transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#94A8A3] hover:text-white"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loginLoading}
                  className="w-full py-3.5 px-5 rounded-xl bg-[#00D2FF] hover:bg-[#47d6ff] text-[#060D0B] font-black text-sm shadow-[0_0_24px_rgba(0,210,255,0.4)] hover:shadow-[0_0_32px_rgba(0,210,255,0.6)] transform hover:scale-[1.01] active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <LogIn className="w-4 h-4" />
                  <span>{loginLoading ? 'Conectando ao Supabase...' : 'Entrar no Lumina'}</span>
                </button>
              </div>

              <div className="text-center pt-2">
                <p className="text-xs text-[#94A8A3]">
                  Ainda não tem conta?{' '}
                  <button
                    type="button"
                    onClick={() => setTab('email-register')}
                    className="text-[#00D2FF] font-bold hover:underline"
                  >
                    Cadastre-se aqui
                  </button>
                </p>
              </div>
            </form>
          )}

          {/* TAB 2: Email Sign Up */}
          {tab === 'email-register' && (
            <form onSubmit={handleEmailRegister} className="p-6 sm:p-8 space-y-3.5 max-h-[70vh] overflow-y-auto animate-in fade-in duration-200">
              {regError && (
                <div className="p-4 rounded-xl bg-[#FF2E4D]/15 border border-[#FF2E4D]/35 space-y-2.5">
                  <div className="flex items-start gap-2.5 text-xs text-[#FF2E4D] font-bold">
                    <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                    <span className="leading-relaxed">{regError}</span>
                  </div>
                  <div className="pt-1 flex flex-col sm:flex-row gap-2">
                    <button
                      type="button"
                      onClick={() => setTab('email-login')}
                      className="py-1.5 px-3 rounded-lg bg-[#00D2FF] text-[#060D0B] font-extrabold text-xs flex items-center justify-center gap-1.5 hover:bg-[#47d6ff] transition-all shadow-md"
                    >
                      <LogIn className="w-3.5 h-3.5" />
                      <span>Já tem conta? Ir para Entrar</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowSupabaseInfo(true)}
                      className="py-1.5 px-3 rounded-lg bg-white/[0.08] text-white hover:text-[#00D2FF] text-xs font-semibold flex items-center justify-center gap-1 transition-all"
                    >
                      <Database className="w-3.5 h-3.5" />
                      <span>Ver credenciais Supabase</span>
                    </button>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#94A8A3] mb-1">
                    E-mail do Usuário *
                  </label>
                  <div className="relative">
                    <Mail className="w-3.5 h-3.5 text-[#94A8A3] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="email"
                      required
                      value={regEmail}
                      onChange={(e) => setRegEmail(e.target.value)}
                      autoCapitalize="none"
                      autoCorrect="off"
                      spellCheck={false}
                      placeholder="seu.email@exemplo.com"
                      className="w-full bg-[#060D0B] border border-white/[0.1] rounded-lg pl-9 pr-3 py-2 text-xs sm:text-sm text-[#F0FDF8] focus:outline-none focus:border-[#00D2FF]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#94A8A3] mb-1">
                    Senha de Acesso (min 6 carac.) *
                  </label>
                  <div className="relative">
                    <Lock className="w-3.5 h-3.5 text-[#94A8A3] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="password"
                      required
                      value={regPassword}
                      onChange={(e) => setRegPassword(e.target.value)}
                      autoCapitalize="none"
                      autoCorrect="off"
                      placeholder="••••••••"
                      className="w-full bg-[#060D0B] border border-white/[0.1] rounded-lg pl-9 pr-3 py-2 text-xs sm:text-sm text-[#F0FDF8] focus:outline-none focus:border-[#00D2FF]"
                    />
                  </div>
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
                    className="w-full bg-[#060D0B] border border-white/[0.1] rounded-lg px-3 py-2 text-xs sm:text-sm text-[#F0FDF8] focus:outline-none focus:border-[#00D2FF]"
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
                      autoCapitalize="none"
                      autoCorrect="off"
                      spellCheck={false}
                      placeholder="judithfilmes"
                      className="w-full bg-[#060D0B] border border-white/[0.1] rounded-r-lg px-3 py-2 text-xs sm:text-sm text-[#F0FDF8] focus:outline-none focus:border-[#00D2FF]"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#94A8A3] mb-1">
                  Gênero de Cinema Preferido
                </label>
                <select
                  value={regGenre}
                  onChange={(e) => setRegGenre(e.target.value)}
                  className="w-full bg-[#060D0B] border border-white/[0.1] rounded-lg px-3 py-2 text-xs sm:text-sm text-[#F0FDF8] focus:outline-none focus:border-[#00D2FF]"
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
                  placeholder="Conte um pouco sobre suas preferências cinematográficas..."
                  className="w-full bg-[#060D0B] border border-white/[0.1] rounded-lg px-3 py-1.5 text-xs text-[#F0FDF8] focus:outline-none focus:border-[#00D2FF]"
                />
              </div>

              {/* Avatar Picker & File Upload */}
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
                  <div className="relative w-14 h-14 rounded-xl overflow-hidden border-2 border-[#00D2FF] shadow-[0_0_12px_rgba(0,210,255,0.3)] bg-[#091412] flex-shrink-0 group">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={regCustomAvatar || regAvatar} alt="Avatar selecionado" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => regFileInputRef.current?.click()}
                      className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-[#00D2FF]"
                      title="Alterar foto"
                    >
                      <Camera className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="flex-1 min-w-0">
                    <button
                      type="button"
                      onClick={() => regFileInputRef.current?.click()}
                      disabled={isUploadingReg}
                      className="py-1.5 px-3 rounded-lg bg-[#00D2FF] hover:bg-[#47d6ff] text-[#060D0B] font-extrabold text-xs shadow-md transition-all flex items-center gap-1.5 disabled:opacity-50"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>{isUploadingReg ? 'Carregando foto...' : 'Fazer Upload da Minha Foto'}</span>
                    </button>
                    <p className="text-[10px] text-[#94A8A3] mt-1 truncate">
                      Selecione uma imagem do seu dispositivo (celular/PC)
                    </p>
                  </div>
                </div>

                <span className="block text-[11px] text-[#94A8A3] mb-1 font-medium">Ou escolha um dos avatares clássicos:</span>
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
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={regLoading}
                  className="w-full py-3.5 px-4 rounded-xl bg-[#00D2FF] hover:bg-[#47d6ff] text-[#060D0B] font-black text-sm shadow-[0_0_24px_rgba(0,210,255,0.4)] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>{regLoading ? 'Cadastrando no Supabase...' : 'Concluir Cadastro com E-mail'}</span>
                </button>
              </div>
            </form>
          )}

          {/* TAB 3: Instant Visitor Login */}
          {tab === 'visitor' && (
            <form onSubmit={handleVisitorSubmit} className="p-6 sm:p-8 space-y-4 animate-in fade-in duration-200">
              <div className="p-4 rounded-xl bg-[#0D1F1C]/80 border border-[#00D2FF]/25 flex items-start gap-3.5">
                <ShieldCheck className="w-6 h-6 text-[#00D2FF] flex-shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <h3 className="text-sm font-bold text-[#F0FDF8]">Acesso Rápido para Visitantes</h3>
                  <p className="text-xs text-[#94A8A3] leading-relaxed">
                    Você pode entrar imediatamente sem necessidade de criar senhas! Como visitante, você pode favoritar seus filmes, editá-los e comentar nos murais de outros cinéfilos.
                  </p>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#94A8A3] mb-1.5">
                  Nome do Visitante
                </label>
                <input
                  type="text"
                  value={visitorName}
                  onChange={(e) => setVisitorName(e.target.value)}
                  placeholder="Ex: Visitante Cinéfilo"
                  className="w-full bg-[#060D0B] border border-white/[0.1] rounded-xl px-4 py-2.5 text-sm text-[#F0FDF8] focus:outline-none focus:border-[#00D2FF]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#94A8A3] mb-1.5">
                  Frase de Apresentação
                </label>
                <input
                  type="text"
                  value={visitorBio}
                  onChange={(e) => setVisitorBio(e.target.value)}
                  placeholder="Ex: Apaixonado por ficção científica e cinema dos anos 80..."
                  className="w-full bg-[#060D0B] border border-white/[0.1] rounded-xl px-4 py-2.5 text-xs sm:text-sm text-[#F0FDF8] focus:outline-none focus:border-[#00D2FF]"
                />
              </div>

              {/* Visitor Avatar File Upload */}
              <div>
                <label className="block text-xs font-semibold text-[#94A8A3] mb-1.5">
                  Foto ou Avatar do Visitante
                </label>

                <input
                  type="file"
                  ref={visitorFileInputRef}
                  accept="image/*"
                  onChange={handleVisitorFileUpload}
                  className="hidden"
                />

                <div className="p-3 rounded-xl bg-[#060D0B] border border-white/[0.1] flex items-center gap-3.5 mb-2.5">
                  <div className="relative w-14 h-14 rounded-xl overflow-hidden border-2 border-[#00D2FF] shadow-[0_0_12px_rgba(0,210,255,0.3)] bg-[#091412] flex-shrink-0 group">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={visitorAvatar} alt="Avatar visitante" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => visitorFileInputRef.current?.click()}
                      className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-[#00D2FF]"
                      title="Alterar foto"
                    >
                      <Camera className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="flex-1 min-w-0">
                    <button
                      type="button"
                      onClick={() => visitorFileInputRef.current?.click()}
                      disabled={isUploadingVisitor}
                      className="py-1.5 px-3 rounded-lg bg-[#00D2FF] hover:bg-[#47d6ff] text-[#060D0B] font-extrabold text-xs shadow-md transition-all flex items-center gap-1.5 disabled:opacity-50"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>{isUploadingVisitor ? 'Carregando foto...' : 'Fazer Upload da Minha Foto'}</span>
                    </button>
                    <p className="text-[10px] text-[#94A8A3] mt-1 truncate">
                      Personalize sua foto de visitante do seu celular ou PC
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-6 gap-2">
                  {AVATAR_PRESETS.map((preset, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setVisitorAvatar(preset.url)}
                      className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                        visitorAvatar === preset.url
                          ? 'border-[#00D2FF] shadow-[0_0_12px_rgba(0,210,255,0.5)] scale-105'
                          : 'border-transparent opacity-70 hover:opacity-100'
                      }`}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={preset.url} alt={preset.name} className="w-full h-full object-cover" />
                      {visitorAvatar === preset.url && (
                        <div className="absolute inset-0 bg-[#00D2FF]/20 flex items-center justify-center">
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
                  className="w-full py-3.5 px-5 rounded-xl bg-[#00D2FF] hover:bg-[#47d6ff] text-[#060D0B] font-black text-sm shadow-[0_0_24px_rgba(0,210,255,0.4)] transition-all flex items-center justify-center gap-2"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Entrar Agora como Visitante</span>
                </button>
              </div>
            </form>
          )}

          {/* TAB 4: Existing / Saved Profiles */}
          {tab === 'existing' && (
            <div className="p-6 sm:p-8 space-y-3.5 animate-in fade-in duration-200">
              <div className="flex items-center justify-between gap-2">
                <div>
                  <p className="text-xs text-[#94A8A3]">
                    Perfis registrados na nuvem Supabase:
                  </p>
                  <p className="text-[10px] text-[#4D635F]">Sincronizados entre mobile e desktop</p>
                </div>
                <div className="flex items-center gap-2">
                  {onRefreshData && (
                    <button
                      type="button"
                      onClick={onRefreshData}
                      disabled={isLoadingData}
                      title="Atualizar lista da nuvem"
                      className="p-1.5 rounded-lg bg-[#0D1F1C] border border-white/[0.1] text-[#94A8A3] hover:text-[#00D2FF] hover:border-[#00D2FF]/40 transition-all flex items-center gap-1 text-[11px]"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${isLoadingData ? 'animate-spin text-[#00D2FF]' : ''}`} />
                      <span className="hidden sm:inline">Sincronizar</span>
                    </button>
                  )}
                  <span className="text-[11px] font-bold text-[#00D2FF] bg-[#00D2FF]/10 px-2 py-0.5 rounded-md border border-[#00D2FF]/20 flex-shrink-0">
                    {allUsers.length} {allUsers.length === 1 ? 'perfil' : 'perfis'}
                  </span>
                </div>
              </div>

              {isLoadingData ? (
                <div className="p-8 text-center rounded-xl bg-[#0D1F1C] border border-white/[0.08] space-y-2">
                  <RefreshCw className="w-6 h-6 text-[#00D2FF] animate-spin mx-auto" />
                  <p className="text-sm font-semibold text-[#F0FDF8]">Buscando perfis no Supabase...</p>
                  <p className="text-xs text-[#94A8A3]">
                    Carregando contas cadastradas na nuvem.
                  </p>
                </div>
              ) : allUsers.length === 0 ? (
                <div className="p-8 text-center rounded-xl bg-[#0D1F1C] border border-white/[0.08] space-y-2">
                  <p className="text-sm font-semibold text-[#F0FDF8]">Nenhum perfil salvo no momento</p>
                  <p className="text-xs text-[#94A8A3]">
                    Cadastre uma nova conta na aba Cadastrar ou entre como Visitante.
                  </p>
                </div>
              ) : (
                <div className="space-y-2.5 max-h-[50vh] overflow-y-auto pr-1">
                  {allUsers.map((u) => (
                    <div
                      key={u.id}
                      className="p-3 rounded-xl bg-[#0D1F1C] border border-white/[0.08] hover:border-[#00D2FF]/40 hover:bg-[#122b26] transition-all flex items-center gap-3 group"
                    >
                      <button
                        type="button"
                        onClick={() => onSelectExistingUser(u)}
                        className="flex-1 min-w-0 flex items-center gap-3.5 text-left"
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={u.avatar}
                          alt={u.name}
                          className="w-11 h-11 rounded-xl object-cover border border-[#00D2FF]/40 group-hover:scale-105 transition-transform flex-shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-sm text-[#F0FDF8] group-hover:text-[#00D2FF] transition-colors truncate">
                              {u.name}
                            </span>
                            <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-[#00D2FF]/10 text-[#00D2FF] flex-shrink-0">
                              {u.badge}
                            </span>
                          </div>
                          <p className="text-xs text-[#94A8A3] truncate">@{u.username} • {u.favoriteGenre}</p>
                        </div>
                      </button>

                      {onDeleteUser && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setUserToDelete(u);
                          }}
                          title={`Excluir perfil de ${u.name}`}
                          className="p-2 rounded-lg text-[#94A8A3] hover:text-red-400 hover:bg-red-500/15 border border-transparent hover:border-red-500/30 transition-all flex-shrink-0"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Collapsible Supabase Connection Information Box */}
        <div className="w-full max-w-xl mt-4 rounded-xl bg-[#091412]/90 border border-white/[0.1] p-4 text-xs space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 font-bold text-[#F0FDF8]">
              <Database className="w-4 h-4 text-[#00D2FF]" />
              <span>Variáveis de Conexão com o Supabase</span>
            </div>
            <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-[#00D2FF]/15 text-[#00D2FF]">
              .env.example
            </span>
          </div>

          <p className="text-[11px] text-[#94A8A3] leading-relaxed">
            Para sincronizar e salvar as contas, filmes e recados diretamente no seu banco de dados Supabase na nuvem, adicione estas variáveis no arquivo de ambiente do projeto:
          </p>

          <div className="space-y-2 font-mono text-[11px]">
            <div className="p-2.5 rounded-lg bg-[#060D0B] border border-white/[0.08] flex items-center justify-between gap-2">
              <span className="text-[#00D2FF] truncate">NEXT_PUBLIC_SUPABASE_URL</span>
              <button
                type="button"
                onClick={() => handleCopy('NEXT_PUBLIC_SUPABASE_URL', 'URL')}
                className="text-[10px] px-2 py-1 rounded bg-white/[0.06] hover:bg-[#00D2FF]/20 text-[#94A8A3] hover:text-[#00D2FF] flex items-center gap-1 flex-shrink-0"
              >
                <Copy className="w-3 h-3" />
                <span>{copiedVar === 'URL' ? 'Copiado!' : 'Copiar'}</span>
              </button>
            </div>

            <div className="p-2.5 rounded-lg bg-[#060D0B] border border-white/[0.08] flex items-center justify-between gap-2">
              <span className="text-[#00D2FF] truncate">NEXT_PUBLIC_SUPABASE_ANON_KEY</span>
              <button
                type="button"
                onClick={() => handleCopy('NEXT_PUBLIC_SUPABASE_ANON_KEY', 'KEY')}
                className="text-[10px] px-2 py-1 rounded bg-white/[0.06] hover:bg-[#00D2FF]/20 text-[#94A8A3] hover:text-[#00D2FF] flex items-center gap-1 flex-shrink-0"
              >
                <Copy className="w-3 h-3" />
                <span>{copiedVar === 'KEY' ? 'Copiado!' : 'Copiar'}</span>
              </button>
            </div>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-2.5 border-t border-white/[0.08]">
            <div className="flex items-center gap-1.5 text-[11px] text-[#94A8A3]">
              <Code2 className="w-4 h-4 text-[#00D2FF] flex-shrink-0" />
              <span>Novo código SQL pronto para colar no SQL Editor do Supabase</span>
            </div>
            <button
              type="button"
              onClick={() => handleCopy(SUPABASE_SQL_SCHEMA, 'SQL')}
              className="w-full sm:w-auto py-2 px-3.5 rounded-lg bg-[#00D2FF] hover:bg-[#47d6ff] text-[#060D0B] font-extrabold text-xs flex items-center justify-center gap-1.5 shadow-[0_0_15px_rgba(0,210,255,0.3)] transition-all flex-shrink-0"
            >
              <Copy className="w-3.5 h-3.5" />
              <span>{copiedVar === 'SQL' ? 'Código SQL Copiado!' : 'Copiar Novo Código SQL'}</span>
            </button>
          </div>
        </div>
      </main>

      {/* Supabase Settings & Troubleshooting Modal */}
      {showSupabaseInfo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-2xl max-h-[90vh] bg-[#091412] border border-[#00D2FF]/40 rounded-2xl shadow-[0_0_60px_rgba(0,210,255,0.25)] flex flex-col overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between p-5 border-b border-white/[0.08] bg-gradient-to-r from-[#0D1F1C] to-[#091412]">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-[#00D2FF]/15 border border-[#00D2FF]/40 flex items-center justify-center text-[#00D2FF]">
                  <Database className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-[#F0FDF8]">
                    Configurações & Chaves do Supabase
                  </h3>
                  <p className="text-xs text-[#94A8A3]">
                    Guia para resolver &ldquo;Invalid API key&rdquo; e gerenciar credenciais
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowSupabaseInfo(false)}
                className="w-8 h-8 rounded-lg bg-white/[0.06] hover:bg-white/[0.12] text-[#94A8A3] hover:text-[#F0FDF8] flex items-center justify-center transition-all"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-5 overflow-y-auto">
              {/* Alert: Explaining Invalid API key */}
              <div className="p-4 rounded-xl bg-[#FF2E4D]/10 border border-[#FF2E4D]/30 space-y-2.5">
                <div className="flex items-center gap-2 text-sm font-bold text-[#FF2E4D]">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>Por que o erro &ldquo;Invalid API key&rdquo; acontece?</span>
                </div>
                <p className="text-xs text-[#E1E7E5] leading-relaxed">
                  O Supabase gera 3 tipos de credenciais diferentes. Se você colar a <strong>senha do banco</strong> ou a chave <strong>service_role</strong>, o Supabase rejeita a requisição com o erro <em>Invalid API key</em>.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1 text-[11px]">
                  <div className="p-2.5 rounded-lg bg-[#060D0B] border border-emerald-500/40">
                    <div className="flex items-center gap-1 font-bold text-emerald-400 mb-0.5">
                      <Check className="w-3.5 h-3.5" />
                      <span>anon public (Correta)</span>
                    </div>
                    <p className="text-[#94A8A3] text-[10px]">
                      Token longo iniciando com <code>eyJhbGciOi...</code>. Esta é a chave pública para o frontend.
                    </p>
                  </div>

                  <div className="p-2.5 rounded-lg bg-[#060D0B] border border-red-500/40">
                    <div className="flex items-center gap-1 font-bold text-red-400 mb-0.5">
                      <X className="w-3.5 h-3.5" />
                      <span>Senha do Banco</span>
                    </div>
                    <p className="text-[#94A8A3] text-[10px]">
                      Senha criada no setup do Postgres. <strong>Não</strong> funciona na API web do Supabase.
                    </p>
                  </div>

                  <div className="p-2.5 rounded-lg bg-[#060D0B] border border-amber-500/40">
                    <div className="flex items-center gap-1 font-bold text-amber-400 mb-0.5">
                      <Key className="w-3.5 h-3.5" />
                      <span>service_role</span>
                    </div>
                    <p className="text-[#94A8A3] text-[10px]">
                      Chave administrativa secreta. Nunca deve ser usada no navegador.
                    </p>
                  </div>
                </div>
              </div>

              {/* Step by step guide */}
              <div className="p-4 rounded-xl bg-[#0D1F1C] border border-white/[0.08] space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold text-[#00D2FF]">
                  <HelpCircle className="w-4 h-4" />
                  <span>Passo a passo no Painel do Supabase:</span>
                </div>
                <ol className="text-xs text-[#E1E7E5] space-y-2 list-decimal list-inside leading-relaxed">
                  <li>
                    Acesse <a href="https://supabase.com/dashboard" target="_blank" rel="noreferrer" className="text-[#00D2FF] underline inline-flex items-center gap-1">supabase.com/dashboard <ExternalLink className="w-3 h-3" /></a> e selecione seu projeto.
                  </li>
                  <li>
                    No menu lateral esquerdo, clique no ícone de engrenagem <strong>Project Settings</strong> (ou Configurações do Projeto).
                  </li>
                  <li>
                    Clique na aba <strong>API</strong> (ou <em>Data API</em>).
                  </li>
                  <li>
                    Na seção <strong>Project API keys</strong>, copie a chave rotulada como <strong>&ldquo;anon&rdquo; / &ldquo;public&rdquo;</strong>.
                  </li>
                  <li>
                    Copie também a <strong>Project URL</strong> (exemplo: <code>https://abcdefghijklmn.supabase.co</code>).
                  </li>
                </ol>
              </div>

              {/* SQL Schema Box */}
              <div className="p-4 rounded-xl bg-[#0D1F1C] border border-[#00D2FF]/30 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-bold text-[#00D2FF]">
                    <Code2 className="w-4 h-4" />
                    <span>Novo Código SQL para o Supabase</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleCopy(SUPABASE_SQL_SCHEMA, 'SQL_MODAL')}
                    className="py-1 px-3 rounded-lg bg-[#00D2FF] hover:bg-[#47d6ff] text-[#060D0B] font-extrabold text-xs flex items-center gap-1.5 shadow transition-all"
                  >
                    <Copy className="w-3 h-3" />
                    <span>{copiedVar === 'SQL_MODAL' ? 'Copiado!' : 'Copiar Código SQL'}</span>
                  </button>
                </div>
                <p className="text-[11px] text-[#94A8A3] leading-relaxed">
                  Abra o <a href="https://supabase.com/dashboard/project/ledxptmjvmabbqofrhex/sql" target="_blank" rel="noreferrer" className="text-[#00D2FF] underline inline-flex items-center gap-1">SQL Editor no painel do Supabase <ExternalLink className="w-3 h-3" /></a>, cole o script abaixo e clique no botão verde <strong>Run</strong>.
                </p>
                <div className="relative">
                  <pre className="p-3 rounded-lg bg-[#060D0B] border border-white/[0.08] text-[10px] font-mono text-[#E1E7E5] max-h-36 overflow-y-auto whitespace-pre leading-relaxed">
                    {SUPABASE_SQL_SCHEMA}
                  </pre>
                </div>
              </div>

              {/* Direct Paste Form */}
              <form onSubmit={handleSaveCredentials} className="p-4 rounded-xl bg-[#060D0B] border border-white/[0.1] space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#F0FDF8] flex items-center gap-1.5">
                    <Settings2 className="w-3.5 h-3.5 text-[#00D2FF]" />
                    <span>Inserir ou Atualizar Credenciais no Navegador</span>
                  </span>
                  {credsSaved && (
                    <span className="text-[11px] text-emerald-400 font-bold flex items-center gap-1">
                      <Check className="w-3.5 h-3.5" /> Salvo com sucesso!
                    </span>
                  )}
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-[#94A8A3] mb-1">
                    NEXT_PUBLIC_SUPABASE_URL
                  </label>
                  <input
                    type="url"
                    value={inputUrl}
                    onChange={(e) => setInputUrl(e.target.value)}
                    placeholder="https://seu-id-de-projeto.supabase.co"
                    className="w-full bg-[#091412] border border-white/[0.12] rounded-lg px-3 py-2 text-xs font-mono text-[#F0FDF8] focus:outline-none focus:border-[#00D2FF]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-[#94A8A3] mb-1">
                    NEXT_PUBLIC_SUPABASE_ANON_KEY (Token JWT público)
                  </label>
                  <textarea
                    rows={2}
                    value={inputKey}
                    onChange={(e) => setInputKey(e.target.value)}
                    placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                    className="w-full bg-[#091412] border border-white/[0.12] rounded-lg px-3 py-2 text-xs font-mono text-[#F0FDF8] focus:outline-none focus:border-[#00D2FF] resize-none"
                  />
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <button
                    type="submit"
                    className="py-2 px-4 rounded-lg bg-[#00D2FF] hover:bg-[#47d6ff] text-[#060D0B] font-extrabold text-xs shadow-md transition-all flex items-center gap-1.5"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Salvar Credenciais</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleResetCredentials}
                    className="py-2 px-3 rounded-lg bg-white/[0.06] hover:bg-white/[0.12] text-[#94A8A3] hover:text-[#F0FDF8] text-xs font-semibold flex items-center gap-1 transition-all"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Restaurar Padrão</span>
                  </button>
                </div>
              </form>

              {/* Cloud-first reassurance banner */}
              <div className="p-4 rounded-xl bg-gradient-to-r from-[#00D2FF]/10 via-[#0D1F1C] to-transparent border border-[#00D2FF]/30 flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-[#00D2FF]/20 flex items-center justify-center flex-shrink-0 text-[#00D2FF]">
                    <Database className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-[#F0FDF8]">Armazenamento 100% em Nuvem Supabase</h4>
                    <p className="text-[11px] text-[#94A8A3]">
                      Perfis cadastrados, filmes e murais são salvos diretamente no banco Supabase e sincronizados em tempo real entre celular e computador.
                    </p>
                  </div>
                </div>
                {onRefreshData && (
                  <button
                    type="button"
                    onClick={onRefreshData}
                    className="w-full sm:w-auto py-2 px-3 rounded-xl bg-[#0D1F1C] border border-[#00D2FF]/40 text-[#00D2FF] font-bold text-xs flex items-center justify-center gap-1.5 hover:bg-[#00D2FF]/10 transition-all flex-shrink-0 shadow-sm"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Recarregar Nuvem</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Confirmação de Exclusão de Perfil */}
      {userToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="w-full max-w-md p-6 rounded-2xl bg-[#091412] border border-red-500/40 shadow-[0_0_50px_rgba(239,68,68,0.3)] space-y-4">
            <div className="flex items-center gap-3 text-red-400">
              <div className="w-10 h-10 rounded-xl bg-red-500/15 border border-red-500/30 flex items-center justify-center flex-shrink-0">
                <Trash2 className="w-5 h-5 text-red-400" />
              </div>
              <div>
                <h3 className="font-extrabold text-base text-[#F0FDF8]">Excluir Perfil Salvo?</h3>
                <p className="text-xs text-[#94A8A3]">Esta ação não pode ser desfeita</p>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-[#060D0B] border border-white/[0.08] flex items-center gap-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={userToDelete.avatar}
                alt={userToDelete.name}
                className="w-11 h-11 rounded-xl object-cover border border-white/20 flex-shrink-0"
              />
              <div className="min-w-0 flex-1">
                <p className="font-bold text-sm text-[#F0FDF8] truncate">{userToDelete.name}</p>
                <p className="text-xs text-[#94A8A3]">@{userToDelete.username} • {userToDelete.favoriteGenre}</p>
              </div>
            </div>

            <p className="text-xs text-[#94A8A3] leading-relaxed">
              Tem certeza que deseja excluir o perfil salvo de <strong className="text-white">{userToDelete.name}</strong>? Seus filmes cadastrados, avaliações e recados nos murais também serão removidos.
            </p>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setUserToDelete(null)}
                className="py-2 px-4 rounded-xl bg-white/[0.08] hover:bg-white/[0.15] text-xs font-semibold text-white transition-all"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => {
                  if (onDeleteUser) {
                    onDeleteUser(userToDelete.id);
                  }
                  setUserToDelete(null);
                }}
                className="py-2 px-4 rounded-xl bg-red-600 hover:bg-red-500 text-white font-extrabold text-xs shadow-[0_0_16px_rgba(239,68,68,0.4)] flex items-center gap-1.5 transition-all"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Sim, Excluir Perfil</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer Info */}
      <footer className="relative z-10 py-4 text-center text-xs text-[#4D635F]">
        <p>Lumina CineClub • A rede social para quem ama a sétima arte</p>
      </footer>
    </div>
  );
}
