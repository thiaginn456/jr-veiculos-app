# JR VEÍCULOS - Sistema Web Completo para Concessionária

Sistema profissional de vendas de veículos desenvolvido com **React + Vite + TypeScript + Supabase**.

## 🚀 Características Principais

### Frontend
- ✅ Home com Hero cinematográfica (GSAP + ScrollTrigger)
- ✅ Página de Estoque com filtros avançados
- ✅ Página individual de veículo
- ✅ Integração com WhatsApp
- ✅ Responsivo (mobile, tablet, desktop)
- ✅ Design premium com Tailwind CSS
- ✅ Animações suaves com GSAP

### Backend & Infraestrutura
- ✅ Supabase PostgreSQL
- ✅ Autenticação Supabase Auth
- ✅ Storage de imagens (Supabase Storage)
- ✅ RLS (Row Level Security)

### Administrativo
- ✅ Painel Admin completo
- ✅ CRUD de veículos
- ✅ Gerenciamento de vendedores
- ✅ Sistema de CRM (Leads)
- ✅ Upload de fotos
- ✅ Configurações

## 📋 Pré-requisitos

- Node.js >= 16.x
- npm ou yarn
- Conta Supabase
- Git (opcional)

## 🚀 Instalação Rápida

### 1. Instalar dependências
```bash
npm install
```

### 2. Configurar variáveis de ambiente
```bash
cp .env.example .env.local
```

Preencher com suas credenciais Supabase:
```env
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua_chave_anonima
VITE_WHATSAPP_NUMBER=5511999999999
```

### 3. Iniciar servidor de desenvolvimento
```bash
npm run dev
```

Acesse `http://localhost:5173`

## 📁 Estrutura do Projeto

```
jr-veiculos-app/
├── src/
│   ├── components/           # Componentes React
│   │   ├── common/          # Componentes comuns
│   │   ├── layout/          # Header, Footer, Layout
│   │   ├── vehicles/        # Componentes de veículos
│   │   ├── forms/           # Formulários
│   │   └── ui/              # Componentes UI
│   ├── pages/               # Páginas da aplicação
│   │   ├── Home.tsx
│   │   ├── Vehicles.tsx
│   │   └── ...
│   ├── admin/               # Páginas admin
│   │   ├── pages/
│   │   └── components/
│   ├── services/            # Serviços de API
│   │   ├── vehicleService.ts
│   │   ├── authService.ts
│   │   ├── whatsappService.ts
│   │   └── ...
│   ├── hooks/               # Hooks customizados
│   │   ├── useVehicles.ts
│   │   ├── useAuth.ts
│   │   └── ...
│   ├── store/               # Zustand stores
│   ├── types/               # TypeScript types
│   ├── config/              # Configurações
│   │   └── supabase.ts
│   ├── utils/               # Funções utilitárias
│   ├── styles/              # Estilos globais
│   ├── App.tsx              # Componente raiz
│   └── main.tsx             # Entry point
├── public/                  # Arquivos estáticos
├── vite.config.ts           # Configuração Vite
├── tailwind.config.js       # Configuração Tailwind
├── tsconfig.json            # Configuração TypeScript
├── .env.example             # Exemplo de variáveis
└── package.json             # Dependências
```

## 🔧 Configuração do Supabase

### Criar Tabelas

Execute o arquivo [`supabase/schema.sql`](supabase/schema.sql) inteiro no SQL Editor do Supabase. Ele cria as tabelas usadas pelo frontend, ativa RLS, configura as politicas de acesso e cria o bucket `fotos-carros`.

Depois, crie um usuario em **Authentication > Users > Add user** para acessar `/admin/login`. O login administrativo usa as credenciais desse usuario do Supabase.

O SQL abaixo e mantido como referencia do modelo de dados:

```sql
-- Veículos
CREATE TABLE veiculos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  marca VARCHAR NOT NULL,
  modelo VARCHAR NOT NULL,
  versao VARCHAR,
  ano INT NOT NULL,
  km INT NOT NULL,
  combustivel VARCHAR NOT NULL,
  cambio VARCHAR NOT NULL,
  cor VARCHAR,
  categoria VARCHAR,
  preco DECIMAL(12,2) NOT NULL,
  preco_promocional DECIMAL(12,2),
  descricao TEXT,
  final_placa VARCHAR,
  imagens TEXT[],
  opcionais TEXT[],
  status VARCHAR DEFAULT 'disponivel',
  destaque BOOLEAN DEFAULT false,
  aceita_troca BOOLEAN DEFAULT false,
  financia BOOLEAN DEFAULT false,
  vendedor_id UUID REFERENCES vendedores(id),
  criado_em TIMESTAMP DEFAULT now(),
  atualizado_em TIMESTAMP DEFAULT now()
);

-- Vendedores
CREATE TABLE vendedores (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nome VARCHAR NOT NULL,
  whatsapp VARCHAR NOT NULL,
  ativo BOOLEAN DEFAULT true,
  criado_em TIMESTAMP DEFAULT now(),
  atualizado_em TIMESTAMP DEFAULT now()
);

-- Leads/CRM
CREATE TABLE leads (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nome VARCHAR NOT NULL,
  whatsapp VARCHAR NOT NULL,
  email VARCHAR,
  veiculo_id UUID REFERENCES veiculos(id),
  vendedor_id UUID REFERENCES vendedores(id),
  origem VARCHAR,
  tipo VARCHAR,
  status VARCHAR DEFAULT 'novo',
  observacoes TEXT,
  criado_em TIMESTAMP DEFAULT now(),
  atualizado_em TIMESTAMP DEFAULT now()
);

-- Financiamentos
CREATE TABLE financiamentos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nome VARCHAR NOT NULL,
  whatsapp VARCHAR NOT NULL,
  cpf VARCHAR NOT NULL,
  rg VARCHAR,
  sexo VARCHAR,
  estado_civil VARCHAR,
  veiculo_id UUID REFERENCES veiculos(id),
  valor_entrada DECIMAL(12,2),
  observacoes TEXT,
  criado_em TIMESTAMP DEFAULT now()
);

-- Configurações
CREATE TABLE configuracoes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  whatsapp_principal VARCHAR,
  instagram VARCHAR,
  facebook VARCHAR,
  endereco VARCHAR,
  telefone VARCHAR,
  texto_institucional TEXT,
  estrategia_leads VARCHAR DEFAULT 'aleatorio',
  criado_em TIMESTAMP DEFAULT now(),
  atualizado_em TIMESTAMP DEFAULT now()
);
```

### Criar Bucket de Storage

1. Ir para Storage no Supabase
2. Criar novo bucket: `fotos-carros`
3. Configurar para público (permitir acesso de leitura)

## 🌐 Rotas da Aplicação

### Rotas Públicas
- `/` - Home
- `/estoque` - Listagem de veículos
- `/veiculo/:id` - Detalhes do veículo
- `/financiamento/:id` - Formulário de financiamento
- `/contato` - Página de contato

### Rotas Admin
- `/admin/login` - Login
- `/admin` - Dashboard
- `/admin/veiculos` - Gerenciar veículos
- `/admin/veiculos/novo` - Novo veículo
- `/admin/veiculos/:id/editar` - Editar veículo
- `/admin/vendedores` - Gerenciar vendedores
- `/admin/leads` - CRM
- `/admin/configuracoes` - Configurações

## 🛠️ Scripts Disponíveis

```bash
npm run dev          # Inicia servidor de desenvolvimento
npm run build        # Build para produção
npm run preview      # Preview do build
npm run lint         # Verificar linting
npm run type-check   # Verificar tipos TypeScript
```

## 📦 Dependências Principais

- **React 18.2** - Framework UI
- **Vite 5** - Build tool
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **React Router v6** - Roteamento
- **Supabase JS** - Backend
- **GSAP** - Animações
- **Zustand** - State management
- **React Hook Form** - Formulários
- **Lucide React** - Ícones

## 🎨 Design & Tema

### Cores Principais
- **Primário**: `#dc2626` (Vermelho)
- **Dark**: `#111827` (Preto profundo)
- **Dark Secondary**: `#1f2937` (Cinza escuro)

### Tipografia
- **Font Family**: Inter, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto
- **Weights**: 400, 500, 600, 700, 800, 900

## 🔐 Segurança

- **Supabase Auth**: Autenticação segura com JWT
- **RLS**: Row Level Security no banco de dados
- **Env Variables**: Chaves sensíveis em variáveis de ambiente
- **HTTPS**: Usar sempre em produção
- **Rate Limiting**: Implementar no servidor

## 📱 Responsividade

Breakpoints Tailwind:
- Mobile: < 640px
- Tablet: 640px - 1024px
- Desktop: > 1024px

## 🚀 Deploy

### Vercel (Recomendado)
```bash
npm install -g vercel
vercel
```

### Netlify
```bash
npm install -g netlify-cli
netlify deploy --prod
```

### Docker
```bash
docker build -t jr-veiculos .
docker run -p 80:5173 jr-veiculos
```

## 🤝 Contribuindo

1. Fork o projeto
2. Crie uma branch (`git checkout -b feature/feature-name`)
3. Commit suas mudanças (`git commit -m 'Add feature'`)
4. Push para a branch (`git push origin feature/feature-name`)
5. Abra um Pull Request

## 📄 Licença

Copyright © 2024 JR Veículos. Todos os direitos reservados.

## 📞 Contato

- Email: contato@jrveiculos.com
- WhatsApp: (11) 9999-9999
- Instagram: @jrveiculos
- Website: https://jrveiculos.com

---

Desenvolvido com ❤️ para JR Veículos
