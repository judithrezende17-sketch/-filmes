'use client';

import React, { useState, useEffect } from 'react';
import { Movie, CatalogPresetMovie } from '@/types';
import { CATALOG_PRESETS } from '@/lib/initialData';
import { X, Film, Star, Check, Sparkles, Image as ImageIcon, Sliders } from 'lucide-react';

interface AddEditMovieModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (movieData: Omit<Movie, 'id' | 'createdAt' | 'likesCount' | 'likedBy'> & { id?: string }) => void;
  editingMovie?: Movie | null;
  currentUserId: string;
}

export function AddEditMovieModal({
  isOpen,
  onClose,
  onSave,
  editingMovie,
  currentUserId,
}: AddEditMovieModalProps) {
  const [tab, setTab] = useState<'custom' | 'catalog'>(editingMovie ? 'custom' : 'catalog');

  // Form states initialized directly from editingMovie or defaults
  const [title, setTitle] = useState(editingMovie?.title || '');
  const [year, setYear] = useState<number | string>(editingMovie?.year || 2024);
  const [director, setDirector] = useState(editingMovie?.director || '');
  const [genre, setGenre] = useState(editingMovie?.genre || 'Ficção Científica');
  const [posterUrl, setPosterUrl] = useState(
    editingMovie?.posterUrl ||
      'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=600&auto=format&fit=crop&q=80'
  );
  const [backdropUrl, setBackdropUrl] = useState(editingMovie?.backdropUrl || '');
  const [rating, setRating] = useState<number>(editingMovie ? editingMovie.rating : 9.5);
  const [review, setReview] = useState(editingMovie?.review || '');
  const [favoriteScene, setFavoriteScene] = useState(editingMovie?.favoriteScene || '');
  const [selectedBadges, setSelectedBadges] = useState<string[]>(
    editingMovie?.badges || ['4K UHD', 'IMAX']
  );
  const [customTagInput, setCustomTagInput] = useState('');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSelectPreset = (preset: CatalogPresetMovie) => {
    setTitle(preset.title);
    setYear(preset.year);
    setDirector(preset.director);
    setGenre(preset.genre);
    setPosterUrl(preset.posterUrl);
    setBackdropUrl(preset.backdropUrl);
    setReview(preset.defaultReview);
    setSelectedBadges(preset.badges);
    setTab('custom'); // Switch to custom form so they can adjust rating and thoughts
  };

  const toggleBadge = (badge: string) => {
    if (selectedBadges.includes(badge)) {
      setSelectedBadges(selectedBadges.filter((b) => b !== badge));
    } else {
      setSelectedBadges([...selectedBadges, badge]);
    }
  };

  const handleAddCustomBadge = () => {
    if (customTagInput.trim() && !selectedBadges.includes(customTagInput.trim().toUpperCase())) {
      setSelectedBadges([...selectedBadges, customTagInput.trim().toUpperCase()]);
      setCustomTagInput('');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Informe o título do filme.');
      return;
    }
    if (!director.trim()) {
      setError('Informe o diretor do filme.');
      return;
    }
    if (!review.trim()) {
      setError('Escreva uma breve resenha ou frase sobre por que você ama esse filme.');
      return;
    }

    const finalPoster =
      posterUrl.trim() ||
      'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=600&auto=format&fit=crop&q=80';

    onSave({
      ...(editingMovie ? { id: editingMovie.id } : {}),
      userId: currentUserId,
      title: title.trim(),
      year: year || 2024,
      director: director.trim(),
      genre: genre.trim(),
      posterUrl: finalPoster,
      backdropUrl: backdropUrl.trim() || undefined,
      rating: Number(rating),
      review: review.trim(),
      favoriteScene: favoriteScene.trim() || undefined,
      badges: selectedBadges,
    });

    onClose();
  };

  const COMMON_BADGES = [
    '4K UHD',
    'IMAX',
    'DOLBY ATMOS',
    'DOLBY VISION',
    'OBRA-PRIMA',
    'OSCAR WINNER',
    'A24',
    'CINEMA CULT',
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#060D0B]/85 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="w-full max-w-2xl max-h-[90vh] rounded-2xl bg-[#091412] border border-white/[0.12] shadow-[0_16px_50px_rgba(0,0,0,0.8)] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-white/[0.08] bg-[#0D1F1C] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-[#00D2FF]/10 border border-[#00D2FF]/30 flex items-center justify-center text-[#00D2FF]">
              <Film className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-[#F0FDF8]">
                {editingMovie ? 'Editar Filme Favorito' : 'Cadastrar Novo Filme Favorito'}
              </h2>
              <p className="text-xs text-[#94A8A3]">
                {editingMovie
                  ? 'Atualize sua nota, resenha e destaques'
                  : 'Escolha de clássicos populares ou preencha as informações do filme'}
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

        {/* Tab switcher for Add mode */}
        {!editingMovie && (
          <div className="grid grid-cols-2 p-2 bg-[#060D0B] border-b border-white/[0.08] text-xs font-semibold">
            <button
              onClick={() => setTab('catalog')}
              className={`py-2 px-3 rounded-lg flex items-center justify-center gap-2 transition-all ${
                tab === 'catalog'
                  ? 'bg-[#00D2FF] text-[#060D0B] font-bold shadow-[0_0_15px_rgba(0,210,255,0.3)]'
                  : 'text-[#94A8A3] hover:text-[#F0FDF8]'
              }`}
            >
              <Sparkles className="w-4 h-4" />
              <span>Sugestões Rápidas do Catálogo</span>
            </button>
            <button
              onClick={() => setTab('custom')}
              className={`py-2 px-3 rounded-lg flex items-center justify-center gap-2 transition-all ${
                tab === 'custom'
                  ? 'bg-[#00D2FF] text-[#060D0B] font-bold shadow-[0_0_15px_rgba(0,210,255,0.3)]'
                  : 'text-[#94A8A3] hover:text-[#F0FDF8]'
              }`}
            >
              <Sliders className="w-4 h-4" />
              <span>Preenchimento Personalizado</span>
            </button>
          </div>
        )}

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {error && (
            <div className="p-3 rounded-lg bg-[#FF2E4D]/15 border border-[#FF2E4D]/30 text-xs text-[#FF2E4D] font-medium">
              {error}
            </div>
          )}

          {/* Catalog Tab View */}
          {!editingMovie && tab === 'catalog' && (
            <div className="space-y-3">
              <p className="text-xs text-[#94A8A3]">
                Clique em um dos filmes abaixo para carregar os dados instantaneamente e personalizar sua nota:
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {CATALOG_PRESETS.map((preset, idx) => (
                  <div
                    key={idx}
                    onClick={() => handleSelectPreset(preset)}
                    className="group cursor-pointer rounded-xl bg-[#0D1F1C] border border-white/[0.08] hover:border-[#00D2FF] p-2 transition-all hover:shadow-[0_0_20px_rgba(0,210,255,0.2)] flex flex-col items-center text-center"
                  >
                    <div className="relative aspect-[2/3] w-full rounded-lg overflow-hidden mb-2">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={preset.posterUrl}
                        alt={preset.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                      <div className="absolute top-1.5 right-1.5 bg-[#060D0B]/80 text-[#00D2FF] text-[10px] font-bold px-1.5 py-0.5 rounded backdrop-blur-sm">
                        {preset.year}
                      </div>
                    </div>
                    <h4 className="text-xs font-bold text-[#F0FDF8] group-hover:text-[#00D2FF] line-clamp-1">
                      {preset.title}
                    </h4>
                    <p className="text-[10px] text-[#94A8A3] truncate">{preset.director}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Custom / Edit Form */}
          {(editingMovie || tab === 'custom') && (
            <form id="movieForm" onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-[#94A8A3] mb-1">
                    Título do Filme *
                  </label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Ex: Interestelar, O Iluminado, Matrix..."
                    className="w-full bg-[#060D0B] border border-white/[0.1] rounded-lg px-3.5 py-2 text-sm text-[#F0FDF8] focus:outline-none focus:border-[#00D2FF]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#94A8A3] mb-1">
                    Ano de Lançamento
                  </label>
                  <input
                    type="number"
                    value={year}
                    onChange={(e) => setYear(e.target.value)}
                    placeholder="2024"
                    className="w-full bg-[#060D0B] border border-white/[0.1] rounded-lg px-3.5 py-2 text-sm text-[#F0FDF8] focus:outline-none focus:border-[#00D2FF]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#94A8A3] mb-1">
                    Diretor(a) *
                  </label>
                  <input
                    type="text"
                    required
                    value={director}
                    onChange={(e) => setDirector(e.target.value)}
                    placeholder="Ex: Christopher Nolan, Denis Villeneuve..."
                    className="w-full bg-[#060D0B] border border-white/[0.1] rounded-lg px-3.5 py-2 text-sm text-[#F0FDF8] focus:outline-none focus:border-[#00D2FF]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#94A8A3] mb-1">
                    Gênero Principal
                  </label>
                  <input
                    type="text"
                    value={genre}
                    onChange={(e) => setGenre(e.target.value)}
                    placeholder="Ex: Ficção Científica, Neo-Noir, Drama..."
                    className="w-full bg-[#060D0B] border border-white/[0.1] rounded-lg px-3.5 py-2 text-sm text-[#F0FDF8] focus:outline-none focus:border-[#00D2FF]"
                  />
                </div>
              </div>

              {/* Rating Control (Slider + Display) */}
              <div className="p-3.5 rounded-xl bg-[#0D1F1C] border border-white/[0.08]">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Star className="w-4 h-4 fill-[#00D2FF] text-[#00D2FF]" />
                    <span className="text-xs font-bold text-[#F0FDF8]">Sua Nota Pessoal (1.0 a 10.0)</span>
                  </div>
                  <div className="px-3 py-0.5 rounded-full bg-[#00D2FF] text-[#060D0B] font-extrabold text-sm shadow-[0_0_12px_rgba(0,210,255,0.4)]">
                    {Number(rating).toFixed(1)} / 10
                  </div>
                </div>
                <input
                  type="range"
                  min="1"
                  max="10"
                  step="0.1"
                  value={rating}
                  onChange={(e) => setRating(parseFloat(e.target.value))}
                  className="w-full accent-[#00D2FF] cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-[#4D635F] mt-1 font-bold">
                  <span>1.0 (Ruim)</span>
                  <span>5.0 (Médio)</span>
                  <span>8.0 (Muito Bom)</span>
                  <span>10.0 (Obra-Prima Suprema)</span>
                </div>
              </div>

              {/* Poster Image URL with preview */}
              <div>
                <label className="block text-xs font-semibold text-[#94A8A3] mb-1">
                  URL da Imagem do Pôster
                </label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <ImageIcon className="w-4 h-4 text-[#94A8A3] absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="url"
                      value={posterUrl}
                      onChange={(e) => setPosterUrl(e.target.value)}
                      placeholder="https://..."
                      className="w-full bg-[#060D0B] border border-white/[0.1] rounded-lg pl-9 pr-3.5 py-2 text-xs text-[#F0FDF8] focus:outline-none focus:border-[#00D2FF]"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      setPosterUrl(
                        'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=600&auto=format&fit=crop&q=80'
                      )
                    }
                    className="px-3 py-1.5 rounded-lg bg-[#0D1F1C] border border-white/[0.1] text-xs text-[#94A8A3] hover:text-white"
                  >
                    Foto Padrão
                  </button>
                </div>
              </div>

              {/* Personal Review */}
              <div>
                <label className="block text-xs font-semibold text-[#94A8A3] mb-1">
                  Sua Resenha / Palavra sobre o filme *
                </label>
                <textarea
                  rows={3}
                  required
                  value={review}
                  onChange={(e) => setReview(e.target.value)}
                  placeholder="Por que esse filme é um dos seus favoritos? Fale sobre a direção, a fotografia, o sentimento que ele causou em você..."
                  className="w-full bg-[#060D0B] border border-white/[0.1] rounded-lg px-3.5 py-2.5 text-xs text-[#F0FDF8] focus:outline-none focus:border-[#00D2FF] leading-relaxed"
                />
              </div>

              {/* Favorite Scene */}
              <div>
                <label className="block text-xs font-semibold text-[#94A8A3] mb-1">
                  Cena Favorita ou Momento Marcante (opcional)
                </label>
                <input
                  type="text"
                  value={favoriteScene}
                  onChange={(e) => setFavoriteScene(e.target.value)}
                  placeholder="Ex: A cena da dança no restaurante / O monólogo final diante das lágrimas na chuva..."
                  className="w-full bg-[#060D0B] border border-white/[0.1] rounded-lg px-3.5 py-2 text-xs text-[#F0FDF8] focus:outline-none focus:border-[#00D2FF]"
                />
              </div>

              {/* Technical Badges Selection */}
              <div>
                <label className="block text-xs font-semibold text-[#94A8A3] mb-1.5">
                  Selos & Etiquetas Cinematográficas
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {COMMON_BADGES.map((b) => {
                    const isSelected = selectedBadges.includes(b);
                    return (
                      <button
                        key={b}
                        type="button"
                        onClick={() => toggleBadge(b)}
                        className={`text-[10px] font-bold px-2.5 py-1 rounded-md transition-all ${
                          isSelected
                            ? 'bg-[#00D2FF] text-[#060D0B] shadow-[0_0_10px_rgba(0,210,255,0.4)]'
                            : 'bg-[#0D1F1C] text-[#94A8A3] border border-white/[0.08] hover:text-white'
                        }`}
                      >
                        {isSelected && <Check className="w-2.5 h-2.5 inline mr-1" />}
                        {b}
                      </button>
                    );
                  })}
                </div>

                <div className="flex gap-2 mt-2">
                  <input
                    type="text"
                    value={customTagInput}
                    onChange={(e) => setCustomTagInput(e.target.value)}
                    placeholder="Adicionar selo personalizado (Ex: 35MM, CANNES)..."
                    className="flex-1 bg-[#060D0B] border border-white/[0.08] rounded-md px-3 py-1 text-xs text-[#F0FDF8] focus:outline-none focus:border-[#00D2FF]"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddCustomBadge();
                      }
                    }}
                  />
                  <button
                    type="button"
                    onClick={handleAddCustomBadge}
                    className="px-3 py-1 bg-[#0D1F1C] border border-white/[0.1] rounded-md text-xs text-[#94A8A3] hover:text-[#00D2FF]"
                  >
                    + Selo
                  </button>
                </div>
              </div>
            </form>
          )}
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-white/[0.08] bg-[#0D1F1C] flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-xs font-semibold text-[#94A8A3] hover:text-white"
          >
            Cancelar
          </button>

          {(editingMovie || tab === 'custom') && (
            <button
              type="submit"
              form="movieForm"
              className="py-2.5 px-6 rounded-xl bg-[#00D2FF] hover:bg-[#47d6ff] text-[#060D0B] font-extrabold text-xs sm:text-sm shadow-[0_0_20px_rgba(0,210,255,0.4)] hover:shadow-[0_0_28px_rgba(0,210,255,0.55)] transition-all flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              {editingMovie ? 'Salvar Alterações' : 'Confirmar & Adicionar aos Favoritos'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
