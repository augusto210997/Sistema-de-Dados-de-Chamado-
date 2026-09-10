import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Chamado, TicketStatus } from '../types';

// Default initial mock data for immediate out-of-the-box usage
const INITIAL_CHAMADOS: Chamado[] = [
  {
    id: 'ch-001',
    protocol: 'CH-2026-001',
    title: 'Superaquecimento no fuso principal',
    equipment: 'Torno CNC Romi D800',
    sector: 'Usinagem - Célula 01',
    priority: 'alta',
    category: 'mecanica',
    status: 'aberto',
    description: 'Durante a operação de desbaste pesado, o fuso apresentou ruído atípico metálico e a temperatura atingiu 78°C no sensor interno. Máquina parada por precaução.',
    operator_name: 'Carlos Oliveira (Operador)',
    operator_id: 'operador',
    created_at: new Date(Date.now() - 1000 * 60 * 45).toISOString(), // 45 min ago
    started_at: null,
    closed_at: null,
    mechanic_name: null,
    mechanic_id: null,
    resolution_notes: null,
    replaced_parts: null,
    downtime_minutes: null,
    photo_url: null,
  },
  {
    id: 'ch-002',
    protocol: 'CH-2026-002',
    title: 'Vazamento de óleo na válvula de alívio',
    equipment: 'Prensa Hidráulica 100 Ton',
    sector: 'Estamparia Pesada',
    priority: 'urgente',
    category: 'hidraulica',
    status: 'em_atendimento',
    description: 'Pressão do circuito oscilando entre 120 e 180 bar. Constatado gotejamento contínuo de óleo ISO VG 68 no bloco manifold inferior.',
    operator_name: 'Carlos Oliveira (Operador)',
    operator_id: 'operador',
    created_at: new Date(Date.now() - 1000 * 60 * 120).toISOString(), // 2 hours ago
    started_at: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 min ago
    closed_at: null,
    mechanic_name: 'Roberto Silva (Mecânico)',
    mechanic_id: 'mecanico',
    resolution_notes: null,
    replaced_parts: null,
    downtime_minutes: null,
    photo_url: null,
  },
  {
    id: 'ch-003',
    protocol: 'CH-2026-003',
    title: 'Correia de transmissão frouxa e gasta',
    equipment: 'Compressor de Parafuso Atlas Copco',
    sector: 'Utilidades / Central de Ar',
    priority: 'media',
    category: 'mecanica',
    status: 'encerrado',
    description: 'Compressor perdendo rotação no pico de demanda. Cheiro característico de borracha aquecida na casa de compressores.',
    operator_name: 'Carlos Oliveira (Operador)',
    operator_id: 'operador',
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
    started_at: new Date(Date.now() - 1000 * 60 * 60 * 22).toISOString(),
    closed_at: new Date(Date.now() - 1000 * 60 * 60 * 20).toISOString(),
    mechanic_name: 'Roberto Silva (Mecânico)',
    mechanic_id: 'mecanico',
    resolution_notes: 'Efetuada inspeção completa do conjunto de acionamento. Substituído o jogo de correias trapezoidais (Perfil SPB 2240). Realizado alinhamento com régua laser e retensionamento conforme torque do manual do fabricante. Testado em carga por 40 minutos com vibração e temperatura nominais.',
    replaced_parts: '03x Correias Trapezoidais Gates SPB-2240; 01x Rolamento Tensor 6205-2RS',
    downtime_minutes: 120,
    photo_url: null,
  },
  {
    id: 'ch-004',
    protocol: 'CH-2026-004',
    title: 'Travamento no atuador pneumático de avanço',
    equipment: 'Esteira Transportadora Linha 03',
    sector: 'Embalagem e Expedição',
    priority: 'baixa',
    category: 'pneumatica',
    status: 'encerrado',
    description: 'Cilindro pneumático sem força para empurrar as caixas de 25kg no final de curso.',
    operator_name: 'Carlos Oliveira (Operador)',
    operator_id: 'operador',
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
    started_at: new Date(Date.now() - 1000 * 60 * 60 * 46).toISOString(),
    closed_at: new Date(Date.now() - 1000 * 60 * 60 * 45).toISOString(),
    mechanic_name: 'Roberto Silva (Mecânico)',
    mechanic_id: 'mecanico',
    resolution_notes: 'Limpeza e lubrificação do copo regulador de ar FRL. Substituição das vedações do êmbolo (kit reparo Parker 50mm). Regulada a pressão de linha para 6 bar.',
    replaced_parts: 'Kit de anéis de vedação O-Ring NBR 50mm; Silenciador pneumático 1/4"',
    downtime_minutes: 60,
    photo_url: null,
  }
];

const STORAGE_KEY = 'sistema_chamados_data_v1';
const SUPABASE_URL_KEY = 'sistema_chamados_sb_url';
const SUPABASE_KEY_KEY = 'sistema_chamados_sb_key';

// ============================================================
// SQL SCRIPTS & POLÍTICAS DE ARMAZENAMENTO PARA O SUPABASE
// ============================================================

// 1. SCRIPT COMPLETO CONSOLIDADO (TABELAS + RLS + STORAGE + POLÍTICAS)
export const SUPABASE_SQL_ALL = `-- ====================================================================
-- SCRIPT COMPLETO: BANCO DE DADOS + SUPABASE STORAGE + POLÍTICAS
-- Copie e cole no SQL Editor do seu projeto Supabase (supabase.com)
-- ====================================================================

-- --------------------------------------------------------------------
-- 1. TABELA PRINCIPAL: CHAMADOS DE MANUTENÇÃO
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.chamados (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    protocol VARCHAR(50) NOT NULL UNIQUE,
    title VARCHAR(255) NOT NULL,
    equipment VARCHAR(255) NOT NULL,
    sector VARCHAR(255) NOT NULL,
    priority VARCHAR(50) NOT NULL DEFAULT 'media',
    category VARCHAR(50) NOT NULL DEFAULT 'mecanica',
    status VARCHAR(50) NOT NULL DEFAULT 'aberto',
    description TEXT NOT NULL,
    operator_name VARCHAR(255) NOT NULL,
    operator_id VARCHAR(100),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    started_at TIMESTAMPTZ,
    closed_at TIMESTAMPTZ,
    mechanic_name VARCHAR(255),
    mechanic_id VARCHAR(100),
    resolution_notes TEXT,
    replaced_parts TEXT,
    downtime_minutes INTEGER,
    photo_url TEXT
);

-- Índices de performance para busca rápida
CREATE INDEX IF NOT EXISTS idx_chamados_status ON public.chamados(status);
CREATE INDEX IF NOT EXISTS idx_chamados_priority ON public.chamados(priority);
CREATE INDEX IF NOT EXISTS idx_chamados_equipment ON public.chamados(equipment);
CREATE INDEX IF NOT EXISTS idx_chamados_created_at ON public.chamados(created_at DESC);

-- Habilitar Row Level Security (RLS) na tabela chamados
ALTER TABLE public.chamados ENABLE ROW LEVEL SECURITY;

-- Políticas de RLS da Tabela chamados (Leitura, Criação e Atualização)
DROP POLICY IF EXISTS "Permitir leitura para todos" ON public.chamados;
CREATE POLICY "Permitir leitura para todos" ON public.chamados
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Permitir criação de chamados" ON public.chamados;
CREATE POLICY "Permitir criação de chamados" ON public.chamados
    FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Permitir atualização de chamados" ON public.chamados;
CREATE POLICY "Permitir atualização de chamados" ON public.chamados
    FOR UPDATE USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Permitir exclusão de chamados" ON public.chamados;
CREATE POLICY "Permitir exclusão de chamados" ON public.chamados
    FOR DELETE USING (true);

-- Ativar Realtime para a tabela chamados
ALTER PUBLICATION supabase_realtime ADD TABLE public.chamados;

-- --------------------------------------------------------------------
-- 2. BUCKET DO SUPABASE STORAGE (FOTOS E EVIDÊNCIAS DE FALHAS)
-- --------------------------------------------------------------------
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'chamados-evidencias',
    'chamados-evidencias',
    true,
    10485760, -- Limite de 10 Megabytes por arquivo
    ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/heic']
)
ON CONFLICT (id) DO UPDATE SET
    public = true,
    file_size_limit = 10485760,
    allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/heic'];

-- --------------------------------------------------------------------
-- 3. POLÍTICAS DE ARMAZENAMENTO SALVAS (STORAGE POLICIES)
-- --------------------------------------------------------------------

-- Política A: Visualização / Leitura Pública de Evidências Anexadas
DROP POLICY IF EXISTS "Permitir visualização pública de evidências" ON storage.objects;
CREATE POLICY "Permitir visualização pública de evidências"
ON storage.objects FOR SELECT
USING (bucket_id = 'chamados-evidencias');

-- Política B: Upload / Inserção de Novas Fotos de Evidência
DROP POLICY IF EXISTS "Permitir upload de fotos de chamados" ON storage.objects;
CREATE POLICY "Permitir upload de fotos de chamados"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'chamados-evidencias');

-- Política C: Atualização / Substituição de Imagens no Storage
DROP POLICY IF EXISTS "Permitir atualização de fotos no storage" ON storage.objects;
CREATE POLICY "Permitir atualização de fotos no storage"
ON storage.objects FOR UPDATE
USING (bucket_id = 'chamados-evidencias')
WITH CHECK (bucket_id = 'chamados-evidencias');

-- Política D: Exclusão de Fotos Anexadas no Storage
DROP POLICY IF EXISTS "Permitir remoção de fotos no storage" ON storage.objects;
CREATE POLICY "Permitir remoção de fotos no storage"
ON storage.objects FOR DELETE
USING (bucket_id = 'chamados-evidencias');

-- --------------------------------------------------------------------
-- 4. DADOS INICIAIS DE DEMONSTRAÇÃO (OPCIONAL)
-- --------------------------------------------------------------------
INSERT INTO public.chamados (
    protocol, title, equipment, sector, priority, category, status, description, operator_name, operator_id
) VALUES 
(
    'CH-2026-001',
    'Superaquecimento no fuso principal',
    'Torno CNC Romi D800',
    'Usinagem - Célula 01',
    'alta',
    'mecanica',
    'aberto',
    'Durante a operação de desbaste pesado, o fuso apresentou ruído atípico e temperatura elevada a 78°C.',
    'Carlos Oliveira (Operador)',
    'operador'
),
(
    'CH-2026-002',
    'Vazamento de óleo na válvula de alívio',
    'Prensa Hidráulica 100 Ton',
    'Estamparia Pesada',
    'urgente',
    'hidraulica',
    'em_atendimento',
    'Pressão do circuito oscilando entre 120 e 180 bar com gotejamento contínuo no manifold.',
    'Carlos Oliveira (Operador)',
    'operador'
)
ON CONFLICT (protocol) DO NOTHING;
`;

// 2. APENAS POLÍTICAS DE ARMAZENAMENTO DO STORAGE (storage.objects)
export const SUPABASE_STORAGE_POLICIES_SQL = `-- ====================================================================
-- POLÍTICAS DE ARMAZENAMENTO (STORAGE POLICIES) - SUPABASE STORAGE
-- Executar no SQL Editor para criar o Bucket e as 4 Políticas Salvas
-- ====================================================================

-- 1. Cria ou atualiza o Bucket público 'chamados-evidencias'
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'chamados-evidencias',
    'chamados-evidencias',
    true,
    10485760, -- 10MB
    ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/heic']
)
ON CONFLICT (id) DO UPDATE SET
    public = true,
    file_size_limit = 10485760,
    allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/heic'];

-- 2. POLÍTICA DE LEITURA (SELECT): Visualização pública das fotos
DROP POLICY IF EXISTS "Permitir visualização pública de evidências" ON storage.objects;
CREATE POLICY "Permitir visualização pública de evidências"
ON storage.objects FOR SELECT
USING (bucket_id = 'chamados-evidencias');

-- 3. POLÍTICA DE UPLOAD (INSERT): Envio de fotos pelos operadores
DROP POLICY IF EXISTS "Permitir upload de fotos de chamados" ON storage.objects;
CREATE POLICY "Permitir upload de fotos de chamados"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'chamados-evidencias');

-- 4. POLÍTICA DE ATUALIZAÇÃO (UPDATE): Edição ou substituição de foto
DROP POLICY IF EXISTS "Permitir atualização de fotos no storage" ON storage.objects;
CREATE POLICY "Permitir atualização de fotos no storage"
ON storage.objects FOR UPDATE
USING (bucket_id = 'chamados-evidencias')
WITH CHECK (bucket_id = 'chamados-evidencias');

-- 5. POLÍTICA DE EXCLUSÃO (DELETE): Remoção de arquivos do chamado
DROP POLICY IF EXISTS "Permitir remoção de fotos no storage" ON storage.objects;
CREATE POLICY "Permitir remoção de fotos no storage"
ON storage.objects FOR DELETE
USING (bucket_id = 'chamados-evidencias');
`;

// 3. APENAS TABELA E RLS
export const SUPABASE_SQL_SCHEMA = SUPABASE_SQL_ALL;

// Helper to retrieve saved or env Supabase credentials
export function getSupabaseCredentials(): { url: string; anonKey: string } {
  const envUrl = (import.meta as any).env?.VITE_SUPABASE_URL || '';
  const envKey = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || '';
  const localUrl = localStorage.getItem(SUPABASE_URL_KEY) || '';
  const localKey = localStorage.getItem(SUPABASE_KEY_KEY) || '';

  return {
    url: localUrl || envUrl || '',
    anonKey: localKey || envKey || '',
  };
}

export function saveSupabaseCredentials(url: string, anonKey: string) {
  if (url) localStorage.setItem(SUPABASE_URL_KEY, url.trim());
  else localStorage.removeItem(SUPABASE_URL_KEY);

  if (anonKey) localStorage.setItem(SUPABASE_KEY_KEY, anonKey.trim());
  else localStorage.removeItem(SUPABASE_KEY_KEY);
}

let cachedClient: SupabaseClient | null = null;
let cachedUrl = '';
let cachedKey = '';

export function getSupabaseClient(): SupabaseClient | null {
  const { url, anonKey } = getSupabaseCredentials();
  if (!url || !anonKey || !url.startsWith('http')) {
    return null;
  }

  if (cachedClient && cachedUrl === url && cachedKey === anonKey) {
    return cachedClient;
  }

  try {
    cachedClient = createClient(url, anonKey, {
      auth: {
        persistSession: false,
      },
    });
    cachedUrl = url;
    cachedKey = anonKey;
    return cachedClient;
  } catch (err) {
    console.warn('Erro ao inicializar Supabase:', err);
    return null;
  }
}

// Local Storage helpers
function getLocalChamados(): Chamado[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_CHAMADOS));
      return INITIAL_CHAMADOS;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_CHAMADOS;
  }
}

function saveLocalChamados(chamados: Chamado[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(chamados));
  } catch (e) {
    console.error('Falha ao salvar chamados localmente', e);
  }
}

// Data API: Reads from Supabase if connected, or falls back to local storage
export async function fetchChamados(): Promise<{ data: Chamado[]; isSupabase: boolean; error?: string }> {
  const client = getSupabaseClient();
  if (client) {
    try {
      const { data, error } = await client
        .from('chamados')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.warn('Supabase query error, using local fallback:', error.message);
        return { data: getLocalChamados(), isSupabase: false, error: error.message };
      }

      if (data && data.length >= 0) {
        // Map database record to Chamado format if needed
        const mapped: Chamado[] = data.map((item: any) => ({
          id: String(item.id),
          protocol: item.protocol || `CH-${item.id}`,
          title: item.title || 'Chamado de Manutenção',
          equipment: item.equipment || 'Equipamento Geral',
          sector: item.sector || 'Geral',
          priority: item.priority || 'media',
          category: item.category || 'geral',
          status: item.status || 'aberto',
          description: item.description || '',
          operator_name: item.operator_name || 'Operador',
          operator_id: item.operator_id || 'operador',
          created_at: item.created_at || new Date().toISOString(),
          started_at: item.started_at || null,
          closed_at: item.closed_at || null,
          mechanic_name: item.mechanic_name || null,
          mechanic_id: item.mechanic_id || null,
          resolution_notes: item.resolution_notes || null,
          replaced_parts: item.replaced_parts || null,
          downtime_minutes: item.downtime_minutes ?? null,
          photo_url: item.photo_url || null,
        }));
        // Update local cache
        saveLocalChamados(mapped);
        return { data: mapped, isSupabase: true };
      }
    } catch (err: any) {
      console.warn('Supabase fetch exception:', err);
      return { data: getLocalChamados(), isSupabase: false, error: err?.message };
    }
  }

  return { data: getLocalChamados(), isSupabase: false };
}

// Data API: Creates a new ticket
export async function createChamado(params: {
  title: string;
  equipment: string;
  sector: string;
  priority: Chamado['priority'];
  category: Chamado['category'];
  description: string;
  operator_name: string;
  operator_id: string;
  photo_url?: string | null;
}): Promise<{ data: Chamado; isSupabase: boolean }> {
  const localList = getLocalChamados();
  const nextNum = (localList.length + 1).toString().padStart(3, '0');
  const protocol = `CH-${new Date().getFullYear()}-${nextNum}`;
  const now = new Date().toISOString();

  const newChamado: Chamado = {
    id: typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `ch-${Date.now()}`,
    protocol,
    title: params.title,
    equipment: params.equipment,
    sector: params.sector,
    priority: params.priority,
    category: params.category,
    status: 'aberto',
    description: params.description,
    operator_name: params.operator_name,
    operator_id: params.operator_id,
    created_at: now,
    started_at: null,
    closed_at: null,
    mechanic_name: null,
    mechanic_id: null,
    resolution_notes: null,
    replaced_parts: null,
    downtime_minutes: null,
    photo_url: params.photo_url || null,
  };

  const client = getSupabaseClient();
  if (client) {
    try {
      const { data, error } = await client
        .from('chamados')
        .insert([
          {
            protocol: newChamado.protocol,
            title: newChamado.title,
            equipment: newChamado.equipment,
            sector: newChamado.sector,
            priority: newChamado.priority,
            category: newChamado.category,
            status: newChamado.status,
            description: newChamado.description,
            operator_name: newChamado.operator_name,
            operator_id: newChamado.operator_id,
            created_at: newChamado.created_at,
            photo_url: newChamado.photo_url,
          },
        ])
        .select()
        .single();

      if (!error && data) {
        const created: Chamado = {
          ...newChamado,
          id: String(data.id),
        };
        const updatedLocal = [created, ...localList];
        saveLocalChamados(updatedLocal);
        return { data: created, isSupabase: true };
      } else if (error) {
        console.warn('Supabase insert error, saved locally:', error.message);
      }
    } catch (err) {
      console.warn('Supabase insert failed, fallback to local', err);
    }
  }

  const updatedLocal = [newChamado, ...localList];
  saveLocalChamados(updatedLocal);
  return { data: newChamado, isSupabase: false };
}

// Data API: Updates a ticket (e.g. Mechanic starts or closes ticket)
export async function updateChamado(
  id: string,
  updates: Partial<Chamado>
): Promise<{ success: boolean; isSupabase: boolean; data?: Chamado }> {
  const localList = getLocalChamados();
  const index = localList.findIndex((item) => item.id === id || item.protocol === id);
  let updatedRecord: Chamado | null = null;

  if (index !== -1) {
    updatedRecord = {
      ...localList[index],
      ...updates,
    };
    localList[index] = updatedRecord;
    saveLocalChamados(localList);
  }

  const client = getSupabaseClient();
  if (client) {
    try {
      const { data, error } = await client
        .from('chamados')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (!error && data) {
        return { success: true, isSupabase: true, data: data as Chamado };
      }
    } catch (err) {
      console.warn('Supabase update failed:', err);
    }
  }

  return { success: true, isSupabase: false, data: updatedRecord || undefined };
}

// Data API: Mechanic starts work
export async function startMaintenance(
  ticketId: string,
  mechanicName: string,
  mechanicId: string
) {
  return updateChamado(ticketId, {
    status: 'em_atendimento',
    started_at: new Date().toISOString(),
    mechanic_name: mechanicName,
    mechanic_id: mechanicId,
  });
}

// Data API: Mechanic closes work
export async function closeMaintenance(
  ticketId: string,
  params: {
    mechanicName: string;
    mechanicId: string;
    resolutionNotes: string;
    replacedParts?: string;
    downtimeMinutes?: number;
  }
) {
  return updateChamado(ticketId, {
    status: 'encerrado',
    closed_at: new Date().toISOString(),
    mechanic_name: params.mechanicName,
    mechanic_id: params.mechanicId,
    resolution_notes: params.resolutionNotes,
    replaced_parts: params.replacedParts || null,
    downtime_minutes: params.downtimeMinutes ?? null,
  });
}

export const INITIAL_MOCK_CHAMADOS = INITIAL_CHAMADOS;

export async function startChamado(ticketId: string, user: { name: string; username: string }): Promise<Chamado> {
  const res = await startMaintenance(ticketId, user.name, user.username);
  if (res.data) return res.data;
  const localList = getLocalChamados();
  return localList.find((c) => c.id === ticketId) || ({ id: ticketId } as Chamado);
}

export async function closeChamado(
  ticketId: string,
  resolutionNotes: string,
  user: { name: string; username: string },
  replacedParts?: string,
  downtimeMinutes?: number
): Promise<Chamado> {
  const res = await closeMaintenance(ticketId, {
    mechanicName: user.name,
    mechanicId: user.username,
    resolutionNotes,
    replacedParts,
    downtimeMinutes,
  });
  if (res.data) return res.data;
  const localList = getLocalChamados();
  return localList.find((c) => c.id === ticketId) || ({ id: ticketId } as Chamado);
}
export async function testSupabaseConnection(url: string, anonKey: string): Promise<{ success: boolean; message: string; storageReady?: boolean }> {
  if (!url || !anonKey) {
    return { success: false, message: 'URL e Anon Key são obrigatórios.' };
  }
  try {
    const testClient = createClient(url, anonKey, { auth: { persistSession: false } });
    const { error } = await testClient.from('chamados').select('id').limit(1);
    
    // Test storage bucket presence as well
    let storageReady = false;
    try {
      const { data: buckets } = await testClient.storage.listBuckets();
      if (buckets && buckets.some((b) => b.name === 'chamados-evidencias' || b.id === 'chamados-evidencias')) {
        storageReady = true;
      }
    } catch {
      // ignore storage list error
    }

    if (error) {
      if (error.code === 'PGRST116' || error.message.includes('relation "public.chamados" does not exist') || error.message.includes('chamados')) {
        return {
          success: true,
          message: 'Conectado ao Supabase com sucesso! Atenção: A tabela "chamados" ainda não existe. Execute o script SQL no Supabase para criá-la.',
          storageReady,
        };
      }
      return { success: false, message: `Erro ao conectar: ${error.message}` };
    }
    return { 
      success: true, 
      message: `Conexão estabelecida com sucesso! Tabela "chamados" ativa.${storageReady ? ' Bucket "chamados-evidencias" pronto.' : ' (Execute o SQL do Storage para habilitar upload de fotos em nuvem).'}` ,
      storageReady,
    };
  } catch (err: any) {
    return { success: false, message: `Falha na conexão: ${err.message || 'Verifique as credenciais.'}` };
  }
}

/**
 * Upload an image file to Supabase Storage 'chamados-evidencias' bucket.
 * Falls back to base64 Data URL if Supabase is offline or not configured.
 */
export async function uploadTicketImage(file: File): Promise<{ url: string; isSupabaseStorage: boolean }> {
  const client = getSupabaseClient();
  
  if (client) {
    try {
      const fileExt = file.name.split('.').pop() || 'jpg';
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${fileExt}`;
      const filePath = `evidencias/${fileName}`;

      const { error: uploadError } = await client.storage
        .from('chamados-evidencias')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false,
        });

      if (!uploadError) {
        const { data: urlData } = client.storage
          .from('chamados-evidencias')
          .getPublicUrl(filePath);

        if (urlData?.publicUrl) {
          return { url: urlData.publicUrl, isSupabaseStorage: true };
        }
      } else {
        console.warn('Supabase storage upload error, falling back to local base64:', uploadError.message);
      }
    } catch (err) {
      console.warn('Supabase storage upload failed:', err);
    }
  }

  // Fallback: Read as Base64 Data URL
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      resolve({ url: reader.result as string, isSupabaseStorage: false });
    };
    reader.onerror = (error) => {
      reject(error);
    };
    reader.readAsDataURL(file);
  });
}

