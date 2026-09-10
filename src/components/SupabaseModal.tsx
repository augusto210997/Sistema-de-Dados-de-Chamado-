import React, { useState, useEffect } from 'react';
import {
  X,
  Database,
  Check,
  Copy,
  ExternalLink,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Terminal,
  HelpCircle,
  HardDrive,
  ShieldCheck,
  FileCode,
  Layers
} from 'lucide-react';
import {
  getSupabaseCredentials,
  saveSupabaseCredentials,
  testSupabaseConnection,
  SUPABASE_SQL_ALL,
  SUPABASE_STORAGE_POLICIES_SQL,
} from '../lib/supabase';

interface SupabaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCredentialsSaved: () => void;
}

export function SupabaseModal({ isOpen, onClose, onCredentialsSaved }: SupabaseModalProps) {
  const [url, setUrl] = useState('');
  const [anonKey, setAnonKey] = useState('');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string; storageReady?: boolean } | null>(null);
  const [activeTab, setActiveTab] = useState<'config' | 'sql-all' | 'sql-storage' | 'sql-db'>('config');

  useEffect(() => {
    if (isOpen) {
      const creds = getSupabaseCredentials();
      setUrl(creds.url);
      setAnonKey(creds.anonKey);
      setTestResult(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2500);
  };

  const handleSaveAndTest = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsTesting(true);
    setTestResult(null);

    const trimmedUrl = url.trim();
    const trimmedKey = anonKey.trim();

    saveSupabaseCredentials(trimmedUrl, trimmedKey);

    if (!trimmedUrl || !trimmedKey) {
      setTestResult({
        success: true,
        message: 'Modo Demonstração Local ativo. Os chamados e fotos são armazenados localmente e prontos para sincronização.',
      });
      setIsTesting(false);
      onCredentialsSaved();
      return;
    }

    const res = await testSupabaseConnection(trimmedUrl, trimmedKey);
    setTestResult(res);
    setIsTesting(false);
    onCredentialsSaved();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-3xl bg-white border border-slate-200 rounded-xl shadow-2xl overflow-hidden my-6">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold text-sm shadow-xs">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-slate-900 leading-tight">
                  Supabase & Políticas de Armazenamento
                </h2>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-blue-100 text-blue-800">
                  SQL & Storage
                </span>
              </div>
              <p className="text-[11px] text-slate-500">
                Tabelas relacionais, RLS, Bucket de fotos e Políticas de Armazenamento salvas
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selector */}
        <div className="flex border-b border-slate-200 px-6 bg-slate-50/70 overflow-x-auto gap-1">
          <button
            type="button"
            onClick={() => setActiveTab('config')}
            className={`py-3 px-3 text-xs font-bold border-b-2 cursor-pointer transition-colors flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'config'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <Database className="w-3.5 h-3.5" />
            Credenciais de Acesso
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('sql-all')}
            className={`py-3 px-3 text-xs font-bold border-b-2 cursor-pointer transition-colors flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'sql-all'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <FileCode className="w-3.5 h-3.5 text-blue-600" />
            Script Completo (Tudo em 1)
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('sql-storage')}
            className={`py-3 px-3 text-xs font-bold border-b-2 cursor-pointer transition-colors flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'sql-storage'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <HardDrive className="w-3.5 h-3.5 text-emerald-600" />
            Políticas de Armazenamento (Storage)
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('sql-db')}
            className={`py-3 px-3 text-xs font-bold border-b-2 cursor-pointer transition-colors flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'sql-db'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" />
            Estrutura da Tabela & RLS
          </button>
        </div>

        {/* Tab 1: Configuração */}
        {activeTab === 'config' && (
          <form onSubmit={handleSaveAndTest} className="p-6 space-y-4">
            <div className="p-3.5 rounded-lg bg-blue-50/60 border border-blue-200 text-xs text-slate-700 space-y-1.5">
              <div className="font-bold text-blue-900 flex items-center gap-1.5">
                <HelpCircle className="w-4 h-4 text-blue-600" />
                Instruções para Ativação no Supabase:
              </div>
              <ol className="list-decimal list-inside space-y-1 text-[11px] text-slate-600 leading-relaxed">
                <li>Acesse seu painel no <a href="https://supabase.com/dashboard" target="_blank" rel="noreferrer" className="text-blue-600 underline font-semibold">supabase.com</a>.</li>
                <li>Vá em <strong>SQL Editor</strong> e execute o script da aba <strong>Script Completo (Tudo em 1)</strong>.</li>
                <li>Copie a <strong>Project URL</strong> e chave <strong>anon</strong> em <em>Project Settings &gt; API</em> e cole abaixo.</li>
              </ol>
            </div>

            {testResult && (
              <div
                className={`p-3.5 rounded-lg text-xs flex items-start gap-2.5 border ${
                  testResult.success
                    ? 'bg-green-50 border-green-200 text-green-900'
                    : 'bg-red-50 border-red-200 text-red-900'
                }`}
              >
                {testResult.success ? (
                  <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                )}
                <div>
                  <span className="font-bold block">{testResult.success ? 'Conexão Pronta' : 'Aviso'}</span>
                  <span>{testResult.message}</span>
                </div>
              </div>
            )}

            <div>
              <label htmlFor="sb-url" className="block text-[10px] font-bold text-slate-600 uppercase mb-1">
                Supabase Project URL
              </label>
              <input
                id="sb-url"
                type="url"
                placeholder="https://xyzcompany.supabase.co"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="w-full px-3 py-2 rounded border border-slate-300 text-slate-900 placeholder-slate-400 text-xs font-mono focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>

            <div>
              <label htmlFor="sb-key" className="block text-[10px] font-bold text-slate-600 uppercase mb-1">
                Supabase Anon / Public API Key
              </label>
              <input
                id="sb-key"
                type="text"
                placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                value={anonKey}
                onChange={(e) => setAnonKey(e.target.value)}
                className="w-full px-3 py-2 rounded border border-slate-300 text-slate-900 placeholder-slate-400 text-xs font-mono focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>

            <div className="pt-3 border-t border-slate-200 flex items-center justify-between">
              <button
                type="button"
                onClick={() => {
                  setUrl('');
                  setAnonKey('');
                  saveSupabaseCredentials('', '');
                  setTestResult({
                    success: true,
                    message: 'Credenciais limpas. Utilizando armazenamento local imediato.',
                  });
                  onCredentialsSaved();
                }}
                className="text-xs text-slate-500 hover:text-slate-800 underline cursor-pointer"
              >
                Limpar dados e usar modo local
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-3.5 py-1.5 rounded text-xs text-slate-600 hover:bg-slate-100 font-semibold cursor-pointer"
                >
                  Fechar
                </button>
                <button
                  type="submit"
                  disabled={isTesting}
                  className="px-4 py-1.5 rounded bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs uppercase tracking-wider shadow-sm transition-colors cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
                >
                  {isTesting ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Testando...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Salvar & Testar Conexão</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>
        )}

        {/* Tab 2: Script Completo (Tudo em 1) */}
        {activeTab === 'sql-all' && (
          <div className="p-6 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <p className="text-xs text-slate-900 font-bold flex items-center gap-1.5">
                  <FileCode className="w-4 h-4 text-blue-600" />
                  Script SQL Consolidado (Tabelas + RLS + Bucket + Políticas de Armazenamento)
                </p>
                <p className="text-[11px] text-slate-500">
                  Execute no <strong>SQL Editor</strong> do Supabase para criar todo o ambiente de 1 vez.
                </p>
              </div>
              <button
                type="button"
                onClick={() => handleCopy(SUPABASE_SQL_ALL, 'all')}
                className="px-3.5 py-1.5 rounded bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 cursor-pointer shadow-xs self-start sm:self-auto"
              >
                {copiedKey === 'all' ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-white" />
                    <span>Copiado!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copiar Script Completo</span>
                  </>
                )}
              </button>
            </div>

            <div className="rounded-lg border border-slate-200 bg-slate-900 p-3.5 max-h-80 overflow-y-auto">
              <pre className="text-xs font-mono text-emerald-400 leading-relaxed whitespace-pre-wrap select-all">
                {SUPABASE_SQL_ALL}
              </pre>
            </div>

            <div className="pt-2 flex items-center justify-between">
              <span className="text-[11px] text-slate-500">
                Inclui tabela <code>public.chamados</code>, índices, publicação Realtime e Bucket <code>chamados-evidencias</code> com 4 políticas salvas.
              </span>
              <button
                type="button"
                onClick={() => setActiveTab('config')}
                className="px-3.5 py-1.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold cursor-pointer"
              >
                Voltar para Conexão
              </button>
            </div>
          </div>
        )}

        {/* Tab 3: Políticas de Armazenamento (Storage) */}
        {activeTab === 'sql-storage' && (
          <div className="p-6 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <p className="text-xs text-slate-900 font-bold flex items-center gap-1.5">
                  <HardDrive className="w-4 h-4 text-emerald-600" />
                  Políticas de Armazenamento do Supabase Storage
                </p>
                <p className="text-[11px] text-slate-500">
                  Cria o Bucket <code>chamados-evidencias</code> e as 4 políticas salvas em <code>storage.objects</code>
                </p>
              </div>
              <button
                type="button"
                onClick={() => handleCopy(SUPABASE_STORAGE_POLICIES_SQL, 'storage')}
                className="px-3.5 py-1.5 rounded bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 cursor-pointer shadow-xs self-start sm:self-auto"
              >
                {copiedKey === 'storage' ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-white" />
                    <span>Copiado!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copiar Políticas do Storage</span>
                  </>
                )}
              </button>
            </div>

            {/* Informative breakdown of the 4 storage policies */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              <div className="p-2.5 rounded border border-slate-200 bg-slate-50">
                <span className="font-bold text-slate-800 block text-[11px]">1. SELECT (Visualização Pública)</span>
                <span className="text-[10px] text-slate-600">Permite que operadores e mecânicos visualizem as fotos anexadas às ordens de serviço.</span>
              </div>
              <div className="p-2.5 rounded border border-slate-200 bg-slate-50">
                <span className="font-bold text-slate-800 block text-[11px]">2. INSERT (Upload de Evidências)</span>
                <span className="text-[10px] text-slate-600">Permite upload direto de fotos de máquinas/falhas até 10MB (JPG, PNG, WEBP, HEIC).</span>
              </div>
              <div className="p-2.5 rounded border border-slate-200 bg-slate-50">
                <span className="font-bold text-slate-800 block text-[11px]">3. UPDATE (Atualização de Imagem)</span>
                <span className="text-[10px] text-slate-600">Permite atualizar ou recarregar fotos associadas ao chamado.</span>
              </div>
              <div className="p-2.5 rounded border border-slate-200 bg-slate-50">
                <span className="font-bold text-slate-800 block text-[11px]">4. DELETE (Remoção no Bucket)</span>
                <span className="text-[10px] text-slate-600">Permite limpar anexos e fotos do bucket <code>chamados-evidencias</code>.</span>
              </div>
            </div>

            <div className="rounded-lg border border-slate-200 bg-slate-900 p-3.5 max-h-60 overflow-y-auto">
              <pre className="text-xs font-mono text-emerald-400 leading-relaxed whitespace-pre-wrap select-all">
                {SUPABASE_STORAGE_POLICIES_SQL}
              </pre>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => setActiveTab('config')}
                className="px-3.5 py-1.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold cursor-pointer"
              >
                Voltar para Conexão
              </button>
            </div>
          </div>
        )}

        {/* Tab 4: Estrutura da Tabela & RLS */}
        {activeTab === 'sql-db' && (
          <div className="p-6 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <p className="text-xs text-slate-900 font-bold flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-indigo-600" />
                  Estrutura da Tabela <code>public.chamados</code> & RLS
                </p>
                <p className="text-[11px] text-slate-500">
                  Definição de colunas, chaves, índices de performance e políticas de acesso da tabela
                </p>
              </div>
              <button
                type="button"
                onClick={() => handleCopy(SUPABASE_SQL_ALL, 'db')}
                className="px-3.5 py-1.5 rounded bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 cursor-pointer shadow-xs self-start sm:self-auto"
              >
                {copiedKey === 'db' ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-white" />
                    <span>Copiado!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copiar SQL</span>
                  </>
                )}
              </button>
            </div>

            <div className="rounded-lg border border-slate-200 bg-slate-900 p-3.5 max-h-72 overflow-y-auto">
              <pre className="text-xs font-mono text-emerald-400 leading-relaxed whitespace-pre-wrap select-all">
                {SUPABASE_SQL_ALL}
              </pre>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => setActiveTab('config')}
                className="px-3.5 py-1.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold cursor-pointer"
              >
                Voltar para Conexão
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

