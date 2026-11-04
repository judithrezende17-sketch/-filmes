'use client';

import React, { useState, useEffect } from 'react';
import { User } from '@/types';
import { X, UserCheck, Sparkles, Check } from 'lucide-react';

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User;
  onSaveProfile: (updated: Partial<User>) => void;
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
}: EditProfileModalProps) {
  const [name, setName] = useState(currentUser.name);
  const [username, setUsername] = useState(currentUser.username);
  const [bio, setBio] = useState(currentUser.bio);
  const [favoriteGenre, setFavoriteGenre] = useState(currentUser.favoriteGenre);
  const [avatar, setAvatar] = useState(currentUser.avatar);
  const [bannerUrl, setBannerUrl] = useState(currentUser.bannerUrl);

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
            <label className="block text-xs font-semibold text-[#94A8A3] mb-1.5">Escolher Avatar</label>
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
            <input
              type="url"
              value={avatar}
              onChange={(e) => setAvatar(e.target.value)}
              placeholder="Ou cole o link de uma imagem de avatar personalizada..."
              className="mt-2 w-full bg-[#060D0B] border border-white/[0.1] rounded-lg px-3 py-1.5 text-xs text-[#F0FDF8] focus:outline-none focus:border-[#00D2FF]"
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
        </form>
      </div>
    </div>
  );
}
