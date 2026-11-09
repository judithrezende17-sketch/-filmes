'use client';

import React, { useState, useRef } from 'react';
import { User } from '@/types';
import { X, UserCheck, Sparkles, Check, Trash2, AlertTriangle, Upload, Camera, Image as ImageIcon } from 'lucide-react';
import { processImageFile } from '@/lib/utils';

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User;
  onSaveProfile: (updated: Partial<User>) => void;
  onDeleteProfile?: () => void;
}

const AVATAR_OPTIONS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=300&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=300&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=300&auto=format&fit=crop&q=80',
];

export function EditProfileModal({
  isOpen,
  onClose,
  currentUser,
  onSaveProfile,
  onDeleteProfile,
}: EditProfileModalProps) {
  const [name, setName] = useState(currentUser.name);
  const [username, setUsername] = useState(currentUser.username);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [bio, setBio] = useState(currentUser.bio);
  const [favoriteGenre, setFavoriteGenre] = useState(currentUser.favoriteGenre);
  const [avatar, setAvatar] = useState(currentUser.avatar);
  const [bannerUrl, setBannerUrl] = useState(currentUser.bannerUrl);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setIsUploading(true);
      const dataUrl = await processImageFile(file, 400, 0.85);
      setAvatar(dataUrl);
    } catch (err: any) {
      alert(err.message || 'Erro ao processar imagem.');
    } finally {
      setIsUploading(false);
    }
  };

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveProfile({
      name: name.trim() || currentUser.name,
      username: username.trim() || currentUser.username,
      bio: bio.trim(),
      favoriteGenre: favoriteGenre.trim(),
      avatar: avatar.trim() || currentUser.avatar,
      bannerUrl: bannerUrl.trim() || currentUser.bannerUrl,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#060D0B]/85 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="w-full max-w-lg rounded-2xl bg-[#091412] border border-white/[0.12] shadow-[0_20px_60px_rgba(0,0,0,0.9)] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-6 py-4 border-b border-white/[0.08] bg-[#0D1F1C] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <UserCheck className="w-5 h-5 text-[#00D2FF]" />
            <h2 className="text-base font-bold text-[#F0FDF8]">Editar Meu Perfil de Cinéfilo</h2>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-[#94A8A3] hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          <div>
            <label className="block text-xs font-semibold text-[#94A8A3] mb-1">Nome de Exibição</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-[#060D0B] border border-white/[0.1] rounded-lg px-3 py-2 text-sm text-[#F0FDF8] focus:outline-none focus:border-[#00D2FF]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#94A8A3] mb-1">Nome de Usuário (@handle)</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full bg-[#060D0B] border border-white/[0.1] rounded-lg px-3 py-2 text-sm text-[#F0FDF8] focus:outline-none focus:border-[#00D2FF]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#94A8A3] mb-1">Gênero Favorito</label>
            <input
              type="text"
              value={favoriteGenre}
              onChange={(e) => setFavoriteGenre(e.target.value)}
              placeholder="Ex: Sci-Fi, Neo-Noir, Cinema de Arte..."
              className="w-full bg-[#060D0B] border border-white/[0.1] rounded-lg px-3 py-2 text-sm text-[#F0FDF8] focus:outline-none focus:border-[#00D2FF]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#94A8A3] mb-1">Biografia</label>
            <textarea
              rows={3}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Conte aos visitantes sobre sua paixão por cinema..."
              className="w-full bg-[#060D0B] border border-white/[0.1] rounded-lg px-3 py-2 text-sm text-[#F0FDF8] focus:outline-none focus:border-[#00D2FF]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#94A8A3] mb-1.5">Foto de Perfil / Avatar</label>
            
            {/* File Upload Box */}
            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              onChange={handleFileUpload}
              className="hidden"
            />

            <div className="p-3.5 rounded-xl bg-[#060D0B] border border-white/[0.1] flex flex-col sm:flex-row items-center gap-4">
              <div className="relative w-20 h-20 rounded-2xl overflow-hidden border-2 border-[#00D2FF] shadow-[0_0_16px_rgba(0,210,255,0.3)] bg-[#091412] flex-shrink-0 group">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={avatar} alt="Avatar atual" className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-[#00D2FF]"
                  title="Alterar foto"
                >
                  <Camera className="w-5 h-5" />
                  <span className="text-[9px] font-bold text-white mt-0.5">Mudar</span>
                </button>
              </div>

              <div className="flex-1 text-center sm:text-left space-y-2">
                <div>
                  <h4 className="text-xs font-bold text-[#F0FDF8]">Fazer upload do seu celular ou computador</h4>
                  <p className="text-[11px] text-[#94A8A3]">Selecione uma foto da sua galeria ou arquivos (PNG, JPG, WEBP)</p>
                </div>
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading}
                    className="py-1.5 px-3 rounded-lg bg-[#00D2FF] hover:bg-[#47d6ff] text-[#060D0B] font-extrabold text-xs shadow-md transition-all flex items-center gap-1.5 disabled:opacity-50"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>{isUploading ? 'Processando imagem...' : 'Escolher Arquivo'}</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Presets */}
            <div className="mt-3">
              <span className="block text-[11px] text-[#94A8A3] mb-1.5 font-medium">Ou escolha um dos avatares temáticos:</span>
              <div className="grid grid-cols-6 gap-2">
                {AVATAR_OPTIONS.map((url, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setAvatar(url)}
                    className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                      avatar === url
                        ? 'border-[#00D2FF] scale-105 shadow-[0_0_12px_rgba(0,210,255,0.4)]'
                        : 'border-transparent opacity-70 hover:opacity-100'
                    }`}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={url} alt="Avatar option" className="w-full h-full object-cover" />
                    {avatar === url && (
                      <div className="absolute inset-0 bg-[#00D2FF]/20 flex items-center justify-center">
                        <Check className="w-4 h-4 text-white" />
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* URL fallback */}
            <input
              type="url"
              value={avatar}
              onChange={(e) => setAvatar(e.target.value)}
              placeholder="Ou cole o link de uma imagem da web..."
              className="mt-2.5 w-full bg-[#060D0B] border border-white/[0.1] rounded-lg px-3 py-1.5 text-xs text-[#F0FDF8] focus:outline-none focus:border-[#00D2FF]"
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              className="w-full py-2.5 px-4 rounded-xl bg-[#00D2FF] hover:bg-[#47d6ff] text-[#060D0B] font-extrabold text-sm shadow-[0_0_20px_rgba(0,210,255,0.4)] transition-all flex items-center justify-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              Salvar Perfil
            </button>
          </div>

          {onDeleteProfile && (
            <div className="pt-4 border-t border-white/[0.08]">
              <div className="p-3.5 rounded-xl bg-red-950/20 border border-red-500/30 space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-bold text-red-400">
                    <AlertTriangle className="w-4 h-4" />
                    <span>Zona de Perigo</span>
                  </div>
                  {!confirmDelete ? (
                    <button
                      type="button"
                      onClick={() => setConfirmDelete(true)}
                      className="px-3 py-1.5 rounded-lg bg-red-500/15 hover:bg-red-500/25 border border-red-500/30 text-red-400 hover:text-red-300 text-xs font-semibold flex items-center gap-1.5 transition-all"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Excluir Meu Perfil</span>
                    </button>
                  ) : (
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setConfirmDelete(false)}
                        className="px-2.5 py-1 rounded-lg bg-white/[0.08] hover:bg-white/[0.15] text-[#94A8A3] text-xs font-medium transition-all"
                      >
                        Cancelar
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          onDeleteProfile();
                          onClose();
                        }}
                        className="px-3 py-1 rounded-lg bg-red-600 hover:bg-red-500 text-white text-xs font-bold shadow-[0_0_12px_rgba(239,68,68,0.4)] flex items-center gap-1 transition-all"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Confirmar Exclusão</span>
                      </button>
                    </div>
                  )}
                </div>
                <p className="text-[11px] text-[#94A8A3] leading-relaxed">
                  Ao excluir seu perfil salvo, sua conta, seus filmes favoritos cadastrados e comentários em murais serão permanentemente removidos.
                </p>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
