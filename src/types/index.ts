// Veículo
// Contratos TypeScript compartilhados entre interface, hooks e servicos.
export interface Vehicle {
  id: string;
  marca: string;
  modelo: string;
  versao: string;
  ano: number;
  km: number;
  combustivel: 'gasolina' | 'diesel' | 'etanol' | 'flex' | 'hibrido' | 'eletrico';
  cambio: 'manual' | 'automatico' | 'cvt';
  cor: string;
  categoria: string;
  preco: number;
  preco_promocional?: number;
  descricao: string;
  final_placa: string;
  imagens: string[];
  opcionais: string[];
  status: 'disponivel' | 'reservado' | 'vendido' | 'oculto';
  destaque: boolean;
  aceita_troca: boolean;
  financia: boolean;
  criado_em: string;
  atualizado_em: string;
  vendedor_id?: string;
}

// Vendedor
export interface Seller {
  id: string;
  nome: string;
  whatsapp: string;
  ativo: boolean;
  criado_em: string;
  atualizado_em: string;
}

// Lead / CRM
export interface Lead {
  id: string;
  nome: string;
  whatsapp: string;
  email?: string;
  veiculo_id?: string;
  vendedor_id?: string;
  origem: 'whatsapp' | 'contato' | 'financiamento' | 'negociacao';
  tipo: 'contato' | 'interesse' | 'financiamento' | 'negociacao';
  status: 'novo' | 'em_atendimento' | 'proposta' | 'negociacao' | 'vendido' | 'perdido';
  observacoes?: string;
  criado_em: string;
  atualizado_em: string;
}

// Financiamento
export interface Financing {
  id: string;
  nome: string;
  whatsapp: string;
  cpf: string;
  rg: string;
  sexo: 'masculino' | 'feminino' | 'outro';
  estado_civil: 'solteiro' | 'casado' | 'divorciado' | 'viuvo' | 'uniao_estavel';
  veiculo_id: string;
  valor_entrada?: number;
  observacoes?: string;
  criado_em: string;
}

// Perfil / Usuário Admin
export interface Profile {
  id: string;
  email: string;
  nome: string;
  avatar_url?: string;
  role: 'admin' | 'vendedor';
  criado_em: string;
}

// Configurações
export interface AppConfig {
  id: string;
  whatsapp_principal: string;
  instagram?: string;
  facebook?: string;
  endereco: string;
  telefone: string;
  texto_institucional: string;
  estrategia_leads: 'aleatorio' | 'rodizio' | 'manual';
  criado_em: string;
  atualizado_em: string;
}

// Tipos de filtros
export interface VehicleFilters {
  marca?: string;
  modelo?: string;
  ano_min?: number;
  ano_max?: number;
  preco_min?: number;
  preco_max?: number;
  combustivel?: string;
  cambio?: string;
  categoria?: string;
  ordem?: 'recentes' | 'preco_baixo' | 'preco_alto' | 'km_baixo';
  pagina?: number;
}

// Resposta de API
export interface ApiResponse<T> {
  data?: T;
  error?: string;
  status: number;
}

// Paginação
export interface PaginationMeta {
  total: number;
  pagina: number;
  limite: number;
  total_paginas: number;
}

export interface PaginatedResponse<T> {
  dados: T[];
  paginacao: PaginationMeta;
}
