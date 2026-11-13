'use client';

import React, { useState, useRef } from 'react';
import { User } from '@/types';
import { supabaseService } from '@/services/supabaseService';
import {
  getSupabaseCredentials,
  setSupabaseCustomCredentials,
  cleanAsciiString,
  isSupabaseConfigured,
  isValidSupabaseUrl,
  isValidSupabaseKey,
} from '@/lib/supabase';
import { processImageFile } from '@/lib/utils';
import { SUPABASE_SQL_SCHEMA } from '@/lib/sqlSchema';
import {
  Film,
  Sparkles,
  UserPlus,
  LogIn,
  ShieldCheck,
  Check,
  Mail,
  Lock,
  Database,
  Copy,
  AlertCircle,
  Eye,
  EyeOff,
  Settings2,
  RefreshCw,
  X,
  Key,
  ExternalLink,
  HelpCircle,
  Upload,
  Camera,
  Code2,
  AlertTriangle,
  CheckCircle2,
} from 'lucide-react';

interface LoginScreenProps {
  onLoginSuccess: (user: User) => void;
  configError?: string | null;
  onCredentialsUpdated?: () => void;
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
  onLoginSuccess,
  configError,
  onCredentialsUpdated,
}: LoginScreenProps) {
  const [tab, setTab] = useState<'email-login' | 'email-register'>('email-login');

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
  const [regSuccess, setRegSuccess] = useState('');

  // File upload ref & state
  const regFileInputRef = useRef<HTMLInputElement>(null);
  const [isUploadingReg, setIsUploadingReg] = useState(false);

  // Supabase Info Drawer State
  const [showSupabaseInfo, setShowSupabaseInfo] = useState(false);
  const [copiedVar, setCopiedVar] = useState<string | null>(null);

  // Dynamic credentials editing
  const [inputUrl, setInputUrl] = useState(() => getSupabaseCredentials().url);
  const [inputKey, setInputKey] = useState(() => getSupabaseCredentials().key);
  const [credsSaved, setCredsSaved] = useState(false);
  const [credsError, setCredsError] = useState('');
  const [configured, setConfigured] = useState(() => isSupabaseConfigured());
  const [credSource, setCredSource] = useState(() => getSupabaseCredentials().source);

  const handleRegFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setIsUploadingReg(true);
      const dataUrl = await processImageFile(file, 400, 0.85);
      setRegAvatar(dataUrl);
      setRegCustomAvatar('');
    } catch (err: any) {
      setRegError(err.message || 'Erro ao processar imagem.');
    } finally {
      setIsUploadingReg(false);
    }
  };

  const handleSaveCredentials = (e: React.FormEvent) => {
    e.preventDefault();
    setCredsError('');
    const cleanU = cleanAsciiString(inputUrl);
    const cleanK = cleanAsciiString(inputKey);

    if (!cleanU || !cleanK) {
      setCredsError('Preencha tanto a Project URL quanto a Anon Public Key do Supabase.');
      return;
    }

    if (!isValidSupabaseUrl(cleanU)) {
      setCredsError('URL do Supabase inválida. Deve começar com https:// (ex: https://xyz.supabase.co).');
      return;
    }

    if (!isValidSupabaseKey(cleanK)) {
      setCredsError('Chave pública inválida! Cole a chave anon/publishable (começando com eyJ... ou sb_publishable_...), não a URL do projeto.');
      return;
    }

    setInputUrl(cleanU);
    setInputKey(cleanK);
    setSupabaseCustomCredentials(cleanU, cleanK);

    const nowConfigured = isSupabaseConfigured();
    setConfigured(nowConfigured);
    setCredSource(getSupabaseCredentials().source);
    setCredsSaved(true);
    setLoginError('');
    setRegError('');
    if (onCredentialsUpdated) {
      onCredentialsUpdated();
    }
    setTimeout(() => setCredsSaved(false), 3000);
  };

  const handleResetCredentials = () => {
    setCredsError('');
    setSupabaseCustomCredentials('', '');
    const reset = getSupabaseCredentials();
    setInputUrl(reset.url);
    setInputKey(reset.key);
    setConfigured(isSupabaseConfigured());
    setCredSource(reset.source);
    setCredsSaved(true);
    if (onCredentialsUpdated) {
      onCredentialsUpdated();
    }
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

    if (!configured) {
      setLoginError(
        'Cliente Supabase não configurado ou chaves inválidas. Configure no .env.local ou no botão "Configurações Supabase".'
      );
      return;
    }

    if (!loginEmail.trim() || !loginPassword) {
      setLoginError('Informe seu e-mail (ou @usuario) e sua senha.');
      return;
    }

    setLoginLoading(true);
    const result = await supabaseService.signInWithEmail(loginEmail.trim(), loginPassword);
    setLoginLoading(false);

    if (result.success && result.user) {
      onLoginSuccess(result.user);
    } else {
      setLoginError(result.error || 'Falha desconhecida ao autenticar no Supabase.');
    }
  };

  const handleEmailRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegError('');
    setRegSuccess('');

    if (!configured) {
      setRegError(
        'Cliente Supabase não configurado ou chaves inválidas. Configure no .env.local ou no botão "Configurações Supabase".'
      );
      return;
    }

    const emailToUse = regEmail.trim().toLowerCase();
    if (!emailToUse || !emailToUse.includes('@')) {
      setRegError('Informe um endereço de e-mail válido.');
      return;
    }

    if (!regPassword || regPassword.length < 6) {
      setRegError('A senha deve ter pelo menos 6 caracteres.');
      return;
    }

    const nameToUse = regName.trim() || emailToUse.split('@')[0];
    const cleanUsername =
      (regUsername.trim() || nameToUse.toLowerCase().replace(/\s+/g, '')).replace(
        /[^a-zA-Z0-9_]/g,
        ''
      ) || emailToUse.split('@')[0];

    setRegLoading(true);
    const result = await supabaseService.signUpWithEmail({
      email: emailToUse,
      password: regPassword,
      name: nameToUse,
      username: cleanUsername,
      favoriteGenre: regGenre,
      bio: regBio.trim() || 'Membro do Lumina CineClub.',
      avatar: regCustomAvatar.trim() || regAvatar,
    });
    setRegLoading(false);

    if (!result.success) {
      setRegError(result.error || 'Erro desconhecido ao cadastrar no Supabase Auth.');
      return;
    }

    if (result.needsEmailConfirmation) {
      setRegSuccess(
        `Conta criada no Supabase Auth (${emailToUse})! Verifique sua caixa de entrada e spam para confirmar o e-mail antes de fazer login.`
      );
      return;
    }

    if (result.user) {
      onLoginSuccess(result.user);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#060D0B] flex flex-col justify-between relative overflow-hidden selection:bg-[#00D2FF]/30 selection:text-[#00D2FF]">
      {/* Cinematic Ambient Background Glows */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-gradient-to-b from-[#00D2FF]/10 via-[#0D1F1C]/40 to-transparent blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-[#FF2E4D]/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -top-24 -right-24 w-96 h-96 bg-[#00D2FF]/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top Bar / Branding */}
      <header className="relative z-10 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 flex items-center justify-between gap-3">
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
                AUTH REAL
              </span>
            </div>
            <p className="text-[11px] text-[#94A8A3] tracking-wide">
              Rede Social de Amantes do Cinema
            </p>
          </div>
        </div>

        {/* Supabase Status Pill */}
        <button
          type="button"
          onClick={() => setShowSupabaseInfo(!showSupabaseInfo)}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-semibold transition-all ${
            configured
              ? 'bg-[#00D2FF]/10 border-[#00D2FF]/40 text-[#00D2FF] shadow-[0_0_12px_rgba(0,210,255,0.2)]'
              : 'bg-[#FF2E4D]/15 border-[#FF2E4D]/50 text-[#FF2E4D] shadow-[0_0_12px_rgba(255,46,77,0.25)]'
          }`}
        >
          <Database className="w-3.5 h-3.5" />
          <span>{configured ? 'Supabase Conectado' : 'Chaves Ausentes / Inválidas'}</span>
          <span
            className={`w-2 h-2 rounded-full ${
              configured ? 'bg-[#00D2FF] animate-pulse' : 'bg-[#FF2E4D] animate-ping'
            }`}
          />
        </button>
      </header>

      {/* Main Login / Gateway Card Container */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-4 py-6 sm:py-8">
        <div className="w-full max-w-xl rounded-2xl bg-[#091412] border border-white/[0.12] shadow-[0_24px_70px_rgba(0,0,0,0.85)] overflow-hidden">
          {/* Card Top Title Banner */}
          <div className="p-6 sm:p-7 pb-4 text-center border-b border-white/[0.08] bg-gradient-to-b from-[#0D1F1C] to-[#091412]">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#00D2FF]/10 text-[#00D2FF] text-xs font-bold border border-[#00D2FF]/25 mb-2 shadow-[0_0_15px_rgba(0,210,255,0.2)]">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Supabase Auth Oficial (auth.users)</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-[#F0FDF8] tracking-tight">
              Acesso ao Lumina CineClub
            </h1>
            <p className="text-xs sm:text-sm text-[#94A8A3] mt-1.5 max-w-md mx-auto leading-relaxed">
              Entre com sua conta real do Supabase Auth ou crie um novo cadastro para favoritar filmes e comentar nos murais.
            </p>
          </div>

          {/* Missing/Invalid Credentials Alert */}
          {(!configured || configError) && (
            <div className="m-4 mb-0 p-4 rounded-xl bg-[#FF2E4D]/15 border border-[#FF2E4D]/50 space-y-2">
              <div className="flex items-start gap-2.5 text-xs text-[#FF2E4D] font-bold">
                <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span className="leading-relaxed">
                  {configError ||
                    'As credenciais do Supabase estão ausentes ou inválidas. O aplicativo não opera em modo offline/simulado.'}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setShowSupabaseInfo(true)}
                className="py-1.5 px-3 rounded-lg bg-[#FF2E4D] hover:bg-[#ff4762] text-white font-bold text-xs flex items-center gap-1.5 transition-all"
              >
                <Settings2 className="w-3.5 h-3.5" />
                <span>Configurar Chaves do Supabase Agora</span>
              </button>
            </div>
          )}

          {/* Interactive Navigation Tabs */}
          <div className="grid grid-cols-2 gap-1.5 p-2 bg-[#060D0B] border-b border-white/[0.08] text-xs font-semibold">
            <button
              type="button"
              onClick={() => {
                setTab('email-login');
                setLoginError('');
              }}
              className={`py-2.5 px-3 rounded-lg flex items-center justify-center gap-2 transition-all min-h-[42px] ${
                tab === 'email-login'
                  ? 'bg-[#00D2FF] text-[#060D0B] font-extrabold shadow-[0_0_14px_rgba(0,210,255,0.35)]'
                  : 'text-[#94A8A3] hover:text-[#F0FDF8] bg-white/[0.02]'
              }`}
            >
              <LogIn className="w-4 h-4 flex-shrink-0" />
              <span>Entrar</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setTab('email-register');
                setRegError('');
                setRegSuccess('');
              }}
              className={`py-2.5 px-3 rounded-lg flex items-center justify-center gap-2 transition-all min-h-[42px] ${
                tab === 'email-register'
                  ? 'bg-[#00D2FF] text-[#060D0B] font-extrabold shadow-[0_0_14px_rgba(0,210,255,0.35)]'
                  : 'text-[#94A8A3] hover:text-[#F0FDF8] bg-white/[0.02]'
              }`}
            >
              <UserPlus className="w-4 h-4 flex-shrink-0" />
              <span>Cadastrar</span>
            </button>
          </div>

          {/* TAB 1: Real Supabase Auth Sign In */}
          {tab === 'email-login' && (
            <form onSubmit={handleEmailSignIn} className="p-5 sm:p-8 space-y-4 animate-in fade-in duration-200">
              {loginError && (
                <div className="p-4 rounded-xl bg-[#FF2E4D]/15 border border-[#FF2E4D]/40 space-y-2.5">
                  <div className="flex items-start gap-2.5 text-xs text-[#FF2E4D] font-bold">
                    <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                    <div className="space-y-1">
                      <p className="uppercase tracking-wider text-[10px] text-[#FF2E4D]/80">
                        Resposta do Supabase Auth:
                      </p>
                      <p className="leading-relaxed break-words">{loginError}</p>
                    </div>
                  </div>
                  <div className="pt-1 flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => setTab('email-register')}
                      className="py-1.5 px-3 rounded-lg bg-[#00D2FF] text-[#060D0B] font-extrabold text-xs flex items-center justify-center gap-1.5 hover:bg-[#47d6ff] transition-all shadow-md"
                    >
                      <UserPlus className="w-3.5 h-3.5" />
                      <span>Criar Conta</span>
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
                  E-mail ou @usuario
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
                    placeholder="seu.email@exemplo.com"
                    className="w-full bg-[#060D0B] border border-white/[0.1] rounded-xl pl-10 pr-4 py-2.5 text-sm text-[#F0FDF8] focus:outline-none focus:border-[#00D2FF] focus:shadow-[0_0_14px_rgba(0,210,255,0.2)] transition-all"
                  />
                </div>
                <p className="text-[10px] text-[#4D635F] mt-1">
                  E-mails autenticam diretamente via signInWithPassword no Supabase Auth.
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
                  disabled={loginLoading || !configured}
                  className="w-full py-3.5 px-5 rounded-xl bg-[#00D2FF] hover:bg-[#47d6ff] text-[#060D0B] font-black text-sm shadow-[0_0_24px_rgba(0,210,255,0.4)] hover:shadow-[0_0_32px_rgba(0,210,255,0.6)] transform hover:scale-[1.01] active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <LogIn className="w-4 h-4" />
                  <span>{loginLoading ? 'Autenticando no Supabase...' : 'Entrar no Lumina'}</span>
                </button>
              </div>

              <div className="text-center pt-1">
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

          {/* TAB 2: Real Supabase Auth Sign Up */}
          {tab === 'email-register' && (
            <form onSubmit={handleEmailRegister} className="p-6 sm:p-8 space-y-3.5 max-h-[72vh] overflow-y-auto animate-in fade-in duration-200">
              <div className="p-3.5 rounded-xl bg-[#00D2FF]/10 border border-[#00D2FF]/30 flex items-center gap-2.5">
                <ShieldCheck className="w-5 h-5 text-[#00D2FF] flex-shrink-0" />
                <div className="min-w-0">
                  <p className="text-xs font-bold text-[#F0FDF8]">
                    Cadastro Oficial via Supabase Auth
                  </p>
                  <p className="text-[11px] text-[#94A8A3] leading-relaxed">
                    Sua conta é gravada diretamente em <code className="text-[#00D2FF]">auth.users</code> no Supabase.
                  </p>
                </div>
              </div>

              {regError && (
                <div className="p-3.5 rounded-xl bg-[#FF2E4D]/15 border border-[#FF2E4D]/40 flex items-start gap-2.5 text-xs text-[#FF2E4D] font-bold">
                  <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <div className="space-y-0.5">
                    <p className="uppercase tracking-wider text-[10px] text-[#FF2E4D]/80">
                      Erro retornado pelo Supabase:
                    </p>
                    <p className="leading-relaxed break-words">{regError}</p>
                  </div>
                </div>
              )}

              {regSuccess && (
                <div className="p-4 rounded-xl bg-emerald-500/15 border border-emerald-400/40 space-y-2.5">
                  <div className="flex items-start gap-2.5 text-xs text-emerald-300 font-bold">
                    <CheckCircle2 className="w-4 h-4 flex-shrink-0 mt-0.5" />
                    <span className="leading-relaxed">{regSuccess}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setLoginEmail(regEmail.trim().toLowerCase());
                      setTab('email-login');
                    }}
                    className="py-1.5 px-3 rounded-lg bg-emerald-400 text-[#060D0B] font-extrabold text-xs flex items-center gap-1.5"
                  >
                    <LogIn className="w-3.5 h-3.5" />
                    <span>Ir para Login</span>
                  </button>
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
                      minLength={6}
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
                  disabled={regLoading || !configured}
                  className="w-full py-3.5 px-4 rounded-xl bg-[#00D2FF] hover:bg-[#47d6ff] text-[#060D0B] font-black text-sm shadow-[0_0_24px_rgba(0,210,255,0.4)] transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>{regLoading ? 'Cadastrando no Supabase Auth...' : 'Concluir Cadastro com E-mail'}</span>
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Supabase Connection Information Box */}
        <div className="w-full max-w-xl mt-4 rounded-xl bg-[#091412]/90 border border-white/[0.1] p-4 text-xs space-y-3">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 font-bold text-[#F0FDF8]">
              <Database className="w-4 h-4 text-[#00D2FF]" />
              <span>Conexão Ativa com o Supabase</span>
            </div>
            <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-[#00D2FF]/15 text-[#00D2FF]">
              {credSource === 'modal'
                ? 'Configurado no Modal'
                : credSource === 'env'
                  ? 'Via .env.local'
                  : credSource === 'project'
                    ? 'Projeto Configurado'
                    : 'Não Configurado'}
            </span>
          </div>

          <p className="text-[11px] text-[#94A8A3] leading-relaxed">
            A autenticação (cadastro, login, logout e sessão persistente) utiliza exclusivamente o <strong>Supabase Auth</strong> real conectado em <code className="text-[#00D2FF] break-all">{inputUrl || 'Não configurado'}</code>.
          </p>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-2.5 border-t border-white/[0.08]">
            <div className="flex items-center gap-1.5 text-[11px] text-[#94A8A3]">
              <Code2 className="w-4 h-4 text-[#00D2FF] flex-shrink-0" />
              <span>Código SQL das tabelas (profiles, movies, comments)</span>
            </div>
            <button
              type="button"
              onClick={() => handleCopy(SUPABASE_SQL_SCHEMA, 'SQL')}
              className="w-full sm:w-auto py-2 px-3.5 rounded-lg bg-[#00D2FF] hover:bg-[#47d6ff] text-[#060D0B] font-extrabold text-xs flex items-center justify-center gap-1.5 shadow-[0_0_15px_rgba(0,210,255,0.3)] transition-all flex-shrink-0"
            >
              <Copy className="w-3.5 h-3.5" />
              <span>{copiedVar === 'SQL' ? 'Código SQL Copiado!' : 'Copiar Código SQL'}</span>
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
                    Gerencie a URL do projeto e a chave pública (anon / publishable)
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
              {/* Direct Paste Form */}
              <form onSubmit={handleSaveCredentials} className="p-4 rounded-xl bg-[#060D0B] border border-white/[0.1] space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#F0FDF8] flex items-center gap-1.5">
                    <Settings2 className="w-3.5 h-3.5 text-[#00D2FF]" />
                    <span>Credenciais Ativas do Cliente Supabase</span>
                  </span>
                  {credsSaved && (
                    <span className="text-[11px] text-emerald-400 font-bold flex items-center gap-1">
                      <Check className="w-3.5 h-3.5" /> Salvo e aplicado!
                    </span>
                  )}
                </div>

                {credsError && (
                  <div className="p-2.5 rounded-lg bg-[#FF2E4D]/15 border border-[#FF2E4D]/40 text-xs text-[#FF2E4D] font-semibold">
                    {credsError}
                  </div>
                )}

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
                    NEXT_PUBLIC_SUPABASE_ANON_KEY (Chave Pública)
                  </label>
                  <textarea
                    rows={2}
                    value={inputKey}
                    onChange={(e) => setInputKey(e.target.value)}
                    placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9... ou sb_publishable_..."
                    className="w-full bg-[#091412] border border-white/[0.12] rounded-lg px-3 py-2 text-xs font-mono text-[#F0FDF8] focus:outline-none focus:border-[#00D2FF] resize-none"
                  />
                </div>

                <div className="flex flex-wrap items-center gap-2 pt-1">
                  <button
                    type="submit"
                    className="py-2 px-4 rounded-lg bg-[#00D2FF] hover:bg-[#47d6ff] text-[#060D0B] font-extrabold text-xs shadow-md transition-all flex items-center gap-1.5"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Salvar e Conectar</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleResetCredentials}
                    className="py-2 px-3 rounded-lg bg-white/[0.06] hover:bg-white/[0.12] text-[#94A8A3] hover:text-[#F0FDF8] text-xs font-semibold flex items-center gap-1 transition-all"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Usar Padrão do .env.local</span>
                  </button>
                </div>
              </form>

              {/* Alert: Explaining Invalid API key */}
              <div className="p-4 rounded-xl bg-[#FF2E4D]/10 border border-[#FF2E4D]/30 space-y-2.5">
                <div className="flex items-center gap-2 text-sm font-bold text-[#FF2E4D]">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>Por que o erro &ldquo;Invalid API key&rdquo; acontece?</span>
                </div>
                <p className="text-xs text-[#E1E7E5] leading-relaxed">
                  Use exclusivamente a chave pública <strong>anon / publishable</strong>. Se você colar a <strong>senha do banco</strong> ou a chave <strong>service_role</strong>, o Supabase rejeitará a requisição.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1 text-[11px]">
                  <div className="p-2.5 rounded-lg bg-[#060D0B] border border-emerald-500/40">
                    <div className="flex items-center gap-1 font-bold text-emerald-400 mb-0.5">
                      <Check className="w-3.5 h-3.5" />
                      <span>anon / publishable</span>
                    </div>
                    <p className="text-[#94A8A3] text-[10px]">
                      Chave pública segura para o navegador (<code>eyJhbGci...</code> ou <code>sb_publishable_...</code>).
                    </p>
                  </div>

                  <div className="p-2.5 rounded-lg bg-[#060D0B] border border-red-500/40">
                    <div className="flex items-center gap-1 font-bold text-red-400 mb-0.5">
                      <X className="w-3.5 h-3.5" />
                      <span>Senha do Banco</span>
                    </div>
                    <p className="text-[#94A8A3] text-[10px]">
                      Senha do Postgres. <strong>Não</strong> funciona na API web do Supabase.
                    </p>
                  </div>

                  <div className="p-2.5 rounded-lg bg-[#060D0B] border border-amber-500/40">
                    <div className="flex items-center gap-1 font-bold text-amber-400 mb-0.5">
                      <Key className="w-3.5 h-3.5" />
                      <span>service_role</span>
                    </div>
                    <p className="text-[#94A8A3] text-[10px]">
                      Chave secreta administrativa. Nunca deve ser usada no frontend.
                    </p>
                  </div>
                </div>
              </div>

              {/* Step by step guide */}
              <div className="p-4 rounded-xl bg-[#0D1F1C] border border-white/[0.08] space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold text-[#00D2FF]">
                  <HelpCircle className="w-4 h-4" />
                  <span>Onde encontrar suas chaves no Supabase:</span>
                </div>
                <ol className="text-xs text-[#E1E7E5] space-y-2 list-decimal list-inside leading-relaxed">
                  <li>
                    Acesse <a href="https://supabase.com/dashboard" target="_blank" rel="noreferrer" className="text-[#00D2FF] underline inline-flex items-center gap-1">supabase.com/dashboard <ExternalLink className="w-3 h-3" /></a> e selecione seu projeto.
                  </li>
                  <li>
                    No menu lateral esquerdo, clique em <strong>Project Settings</strong> &rarr; <strong>API</strong>.
                  </li>
                  <li>
                    Copie a <strong>Project URL</strong> e a chave pública <strong>anon / publishable</strong>.
                  </li>
                </ol>
              </div>

              {/* SQL Schema Box */}
              <div className="p-4 rounded-xl bg-[#0D1F1C] border border-[#00D2FF]/30 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-bold text-[#00D2FF]">
                    <Code2 className="w-4 h-4" />
                    <span>Código SQL para o Supabase</span>
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
                <pre className="p-3 rounded-lg bg-[#060D0B] border border-white/[0.08] text-[10px] font-mono text-[#E1E7E5] max-h-36 overflow-y-auto whitespace-pre leading-relaxed">
                  {SUPABASE_SQL_SCHEMA}
                </pre>
              </div>
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
