import React, { useState, useRef } from 'react';
import { X, Plus, AlertTriangle, Cpu, MapPin, Tag, FileText, Camera, Upload, CheckCircle2, RefreshCw, Image } from 'lucide-react';
import { Priority, Category } from '../types';
import { uploadTicketImage } from '../lib/supabase';

interface NewTicketModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (ticketData: {
    title: string;
    equipment: string;
    sector: string;
    priority: Priority;
    category: Category;
    description: string;
    photo_url?: string | null;
  }) => Promise<void>;
  operatorName: string;
}

const COMMON_EQUIPMENTS = [
  'Torno CNC Romi D800',
  'Centro de Usinagem Haas VF-2',
  'Prensa Hidráulica 100 Ton',
  'Injetora de Plástico Engel 150T',
  'Compressor de Parafuso Atlas Copco',
  'Robô de Solda ABB IRB 1600',
  'Esteira Transportadora Linha 03',
  'Ponte Rolante 10 Toneladas',
  'Empilhadeira Elétrica Hyster #04',
  'Caldeira a Vapor 500kg/h',
];

const COMMON_SECTORS = [
  'Usinagem - Célula 01',
  'Usinagem - Célula 02',
  'Estamparia Pesada',
  'Injeção Plástica',
  'Linha de Montagem A',
  'Linha de Montagem B',
  'Embalagem e Expedição',
  'Utilidades / Central de Ar',
  'Almoxarifado & Logística',
  'Pintura Industrial',
];

export function NewTicketModal({ isOpen, onClose, onSubmit, operatorName }: NewTicketModalProps) {
  const [title, setTitle] = useState('');
  const [equipment, setEquipment] = useState('');
  const [sector, setSector] = useState('');
  const [priority, setPriority] = useState<Priority>('media');
  const [category, setCategory] = useState<Category>('mecanica');
  const [description, setDescription] = useState('');
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [customEquipment, setCustomEquipment] = useState(false);
  const [customSector, setCustomSector] = useState(false);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingPhoto(true);
    try {
      const result = await uploadTicketImage(file);
      setPhotoUrl(result.url);
    } catch (err) {
      console.error('Erro ao enviar foto:', err);
    } finally {
      setIsUploadingPhoto(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleSimulatePhoto = (url?: string) => {
    setPhotoUrl(url || 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=800&auto=format&fit=crop&q=80');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !equipment.trim() || !sector.trim() || !description.trim()) {
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit({
        title: title.trim(),
        equipment: equipment.trim(),
        sector: sector.trim(),
        priority,
        category,
        description: description.trim(),
        photo_url: photoUrl,
      });
      setTitle('');
      setEquipment('');
      setSector('');
      setDescription('');
      setPhotoUrl(null);
      onClose();
    } catch (err) {
      console.error('Erro ao abrir chamado:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white border border-slate-200 rounded-xl shadow-xl overflow-hidden my-8">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold text-sm shadow-xs">
              <Plus className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 leading-tight">
                Abertura de Chamado de Manutenção
              </h2>
              <p className="text-[11px] text-slate-500">
                Operador: <span className="text-slate-800 font-bold">{operatorName}</span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Título */}
          <div>
            <label htmlFor="ticket-title" className="block text-[10px] font-bold text-slate-600 uppercase mb-1">
              Título da Ocorrência *
            </label>
            <input
              id="ticket-title"
              type="text"
              required
              placeholder="Ex: Barulho anômalo no motor principal, Vazamento de fluido..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 rounded border border-slate-300 text-slate-900 placeholder-slate-400 text-xs focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          {/* Grid: Equipamento e Setor */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-[10px] font-bold text-slate-600 uppercase">
                  Máquina / Equipamento *
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setCustomEquipment(!customEquipment);
                    setEquipment('');
                  }}
                  className="text-[10px] text-blue-600 hover:underline cursor-pointer font-semibold"
                >
                  {customEquipment ? 'Selecionar da Lista' : 'Digitar Outro'}
                </button>
              </div>

              {customEquipment ? (
                <input
                  type="text"
                  required
                  placeholder="Nome ou TAG do equipamento..."
                  value={equipment}
                  onChange={(e) => setEquipment(e.target.value)}
                  className="w-full px-3 py-1.5 rounded border border-slate-300 text-slate-900 text-xs focus:ring-2 focus:ring-blue-500 outline-none"
                />
              ) : (
                <select
                  required
                  value={equipment}
                  onChange={(e) => setEquipment(e.target.value)}
                  className="w-full px-3 py-1.5 rounded border border-slate-300 text-slate-900 text-xs focus:ring-2 focus:ring-blue-500 outline-none bg-white font-medium"
                >
                  <option value="">Selecione o equipamento...</option>
                  {COMMON_EQUIPMENTS.map((eq) => (
                    <option key={eq} value={eq}>
                      {eq}
                    </option>
                  ))}
                </select>
              )}
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-[10px] font-bold text-slate-600 uppercase">
                  Setor / Linha *
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setCustomSector(!customSector);
                    setSector('');
                  }}
                  className="text-[10px] text-blue-600 hover:underline cursor-pointer font-semibold"
                >
                  {customSector ? 'Selecionar da Lista' : 'Digitar Outro'}
                </button>
              </div>

              {customSector ? (
                <input
                  type="text"
                  required
                  placeholder="Nome da linha ou setor..."
                  value={sector}
                  onChange={(e) => setSector(e.target.value)}
                  className="w-full px-3 py-1.5 rounded border border-slate-300 text-slate-900 text-xs focus:ring-2 focus:ring-blue-500 outline-none"
                />
              ) : (
                <select
                  required
                  value={sector}
                  onChange={(e) => setSector(e.target.value)}
                  className="w-full px-3 py-1.5 rounded border border-slate-300 text-slate-900 text-xs focus:ring-2 focus:ring-blue-500 outline-none bg-white font-medium"
                >
                  <option value="">Selecione o setor...</option>
                  {COMMON_SECTORS.map((sec) => (
                    <option key={sec} value={sec}>
                      {sec}
                    </option>
                  ))}
                </select>
              )}
            </div>
          </div>

          {/* Grid: Prioridade e Categoria */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">
                Grau de Prioridade *
              </label>
              <div className="grid grid-cols-4 gap-1">
                {(['baixa', 'media', 'alta', 'urgente'] as Priority[]).map((p) => {
                  const active = priority === p;
                  return (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setPriority(p)}
                      className={`py-1.5 text-[10px] font-bold rounded uppercase border cursor-pointer ${
                        active
                          ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                          : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {p}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">
                Categoria da Falha *
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as Category)}
                className="w-full px-3 py-1.5 rounded border border-slate-300 text-slate-900 text-xs focus:ring-2 focus:ring-blue-500 outline-none bg-white font-medium"
              >
                <option value="mecanica">Mecânica</option>
                <option value="hidraulica">Hidráulica</option>
                <option value="pneumatica">Pneumática</option>
                <option value="eletrica">Elétrica / Eletrônica</option>
                <option value="geral">Geral / Estrutural</option>
              </select>
            </div>
          </div>

          {/* Descrição */}
          <div>
            <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">
              Descrição Detalhada do Problema *
            </label>
            <textarea
              required
              rows={3}
              placeholder="Descreva o que ocorreu, se a máquina está parada, ruídos, mensagens de erro..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full p-2.5 rounded border border-slate-300 text-slate-900 placeholder-slate-400 text-xs focus:ring-2 focus:ring-blue-500 outline-none resize-none leading-relaxed"
            />
          </div>

          {/* Foto / Evidência Visual */}
          <div>
            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
            />

            <div className="flex items-center justify-between mb-1">
              <label className="text-[10px] font-bold text-slate-600 uppercase flex items-center gap-1">
                <Camera className="w-3 h-3 text-blue-600" />
                Foto / Evidência Visual (Supabase Storage)
              </label>
              {photoUrl && (
                <button
                  type="button"
                  onClick={() => setPhotoUrl(null)}
                  className="text-[10px] text-red-600 hover:underline cursor-pointer font-semibold"
                >
                  Remover Foto
                </button>
              )}
            </div>

            {photoUrl ? (
              <div className="relative rounded-lg border border-slate-200 h-28 bg-slate-100 flex items-center justify-center overflow-hidden group">
                <img src={photoUrl} alt="Anexo" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-slate-900/40 flex items-center justify-between px-3 text-xs text-white font-semibold opacity-90 transition-opacity">
                  <span className="flex items-center gap-1 bg-slate-900/60 px-2 py-0.5 rounded text-[11px]">
                    <CheckCircle2 className="w-3.5 h-3.5 text-green-400" />
                    Foto Anexada
                  </span>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-2 py-1 bg-white/90 hover:bg-white text-slate-800 rounded text-[10px] font-bold cursor-pointer transition-colors"
                  >
                    Trocar Foto
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <button
                  type="button"
                  disabled={isUploadingPhoto}
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full py-3 px-3 border-2 border-dashed border-slate-300 hover:border-blue-500 rounded-lg text-xs text-slate-600 hover:text-blue-600 bg-slate-50 hover:bg-blue-50/30 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isUploadingPhoto ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin text-blue-600" />
                      <span className="font-semibold text-blue-600">Enviando imagem para o Storage...</span>
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4 text-blue-600" />
                      <span className="font-medium">Selecionar ou tirar foto do equipamento (JPG, PNG)</span>
                    </>
                  )}
                </button>

                {/* Exemplos Rápidos */}
                <div className="flex items-center gap-1.5 text-[10px] text-slate-500">
                  <span>Ou usar foto de exemplo:</span>
                  <button
                    type="button"
                    onClick={() => handleSimulatePhoto('https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=800&auto=format&fit=crop&q=80')}
                    className="text-blue-600 hover:underline cursor-pointer font-semibold"
                  >
                    Usinagem CNC
                  </button>
                  <span>•</span>
                  <button
                    type="button"
                    onClick={() => handleSimulatePhoto('https://images.unsplash.com/photo-1581092335397-9583fe92d232?w=800&auto=format&fit=crop&q=80')}
                    className="text-blue-600 hover:underline cursor-pointer font-semibold"
                  >
                    Válvula Hidráulica
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="pt-2 border-t border-slate-200 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-1.5 rounded text-xs text-slate-600 hover:bg-slate-100 font-semibold cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              id="btn-confirm-new-ticket"
              disabled={isSubmitting}
              className="px-4 py-1.5 rounded bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs uppercase tracking-wider shadow-sm transition-colors cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? 'Registrando...' : 'Registrar Chamado'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
