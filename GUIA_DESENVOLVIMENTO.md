# GUIA COMPLETO DE DESENVOLVIMENTO - JR VEÍCULOS

## 📋 Índice
1. [Setup Inicial](#setup-inicial)
2. [Arquitetura](#arquitetura)
3. [Convenções de Código](#convenções-de-código)
4. [Componentes](#componentes)
5. [Hooks](#hooks)
6. [Serviços](#serviços)
7. [Estado Global](#estado-global)
8. [Tipos TypeScript](#tipos-typescript)
9. [Banco de Dados](#banco-de-dados)
10. [Fluxos de Desenvolvimento](#fluxos-de-desenvolvimento)

## Setup Inicial

### Passo 1: Clonar e Instalar
```bash
git clone <repo>
cd jr-veiculos-app
npm install
```

### Passo 2: Variáveis de Ambiente
Copie `.env.example` para `.env.local` e preencha com suas credenciais:

```env
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua_chave_publica_aqui
VITE_WHATSAPP_NUMBER=5511999999999
```

### Passo 3: Banco de Dados
Execute o SQL de inicialização no Supabase (ver README.md)

### Passo 4: Iniciar
```bash
npm run dev
```

## Arquitetura

### Estrutura em Camadas

```
┌─────────────────────────────────────────────┐
│              Interface (UI)                 │
│    Pages → Components → UI Components       │
└────────────────┬────────────────────────────┘
                 │
┌────────────────▼────────────────────────────┐
│          State Management (Zustand)         │
│    Stores → Hooks (useVehicles, useAuth)    │
└────────────────┬────────────────────────────┘
                 │
┌────────────────▼────────────────────────────┐
│            Serviços (Services)              │
│  vehicleService, authService, etc.          │
└────────────────┬────────────────────────────┘
                 │
┌────────────────▼────────────────────────────┐
│            Backend (Supabase)               │
│  PostgreSQL + Auth + Storage                │
└─────────────────────────────────────────────┘
```

### Fluxo de Dados

```
Usuário clica
    ↓
Componente dispara evento
    ↓
Hook (ex: useVehicles)
    ↓
Serviço (ex: vehicleService)
    ↓
Supabase API
    ↓
Banco de Dados
    ↓
Resposta volta em cadeia (reversa)
```

## Convenções de Código

### Nomes de Arquivos
- **Componentes**: PascalCase (Home.tsx, VehicleCard.tsx)
- **Hooks**: camelCase com prefixo "use" (useVehicles.ts, useAuth.ts)
- **Serviços**: camelCase + "Service" (vehicleService.ts, authService.ts)
- **Pages**: PascalCase (Home.tsx, Vehicles.tsx)
- **Types**: PascalCase (index.ts em pasta types/)

### Variáveis e Funções
```typescript
// Variáveis
const userName: string = 'João';
const vehicleCount: number = 5;
const isLoading: boolean = true;

// Funções
function getUserById(id: string) { }
const fetchVehicles = async () => { }
```

### Imports
```typescript
// 1. React e bibliotecas externas
import React from 'react';
import { useState, useEffect } from 'react';

// 2. Componentes locais
import { Header, Footer } from '@/components';

// 3. Hooks
import { useVehicles } from '@/hooks';

// 4. Types
import { Vehicle } from '@/types';

// 5. Serviços
import { vehicleService } from '@/services';

// 6. Utilitários
import { formatPrice } from '@/utils';
```

## Componentes

### Estrutura de um Componente

```typescript
import React, { useState, useEffect } from 'react';
import { SomeIcon } from 'lucide-react';
import { classNames } from '@/utils';

interface ComponentProps {
  title: string;
  onClose?: () => void;
}

export const MyComponent: React.FC<ComponentProps> = ({
  title,
  onClose,
}) => {
  const [state, setState] = useState('');

  useEffect(() => {
    // Setup
    return () => {
      // Cleanup
    };
  }, []);

  const handleClick = () => {
    // Handler
  };

  return (
    <div className="flex items-center justify-between">
      <h2>{title}</h2>
      {onClose && (
        <button onClick={onClose}>Close</button>
      )}
    </div>
  );
};
```

### Props Types
- Sempre tipificar props com interface
- Usar `React.FC<Props>` para type safety
- Documentar props importantes com comentários

### Estilos
- Usar Tailwind CSS para estilização
- Classes condicionais com `clsx`:
  ```typescript
  <div className={clsx(
    'base-class',
    isActive && 'active-class',
    size === 'lg' && 'lg-class'
  )}>
  ```

## Hooks

### Hook Customizado useVehicles

```typescript
import { useVehicles } from '@/hooks';

export const MyPage = () => {
  const {
    vehicles,    // Array de veículos
    isLoading,   // boolean
    error,       // string | null
    paginacao,   // PaginationMeta
    fetchVehicles, // função para buscar
    refetch,     // função para recarregar
  } = useVehicles({ marca: 'Fiat' });

  return <div>{/* ... */}</div>;
};
```

### Hook Customizado useAuth

```typescript
import { useAuth } from '@/hooks';

export const LoginPage = () => {
  const {
    user,          // User | null
    isLoading,     // boolean
    isAuthenticated, // boolean
    login,         // async (email, password)
    logout,        // async ()
  } = useAuth();

  const handleLogin = async () => {
    try {
      await login('email@example.com', 'password');
    } catch (error) {
      console.error(error);
    }
  };

  return <div>{/* ... */}</div>;
};
```

## Serviços

### Padrão de Serviço

```typescript
// src/services/myService.ts

export const myService = {
  async getData() {
    try {
      const { data, error } = await supabase
        .from('my_table')
        .select('*');

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error:', error);
      throw error;
    }
  },

  async createData(item: any) {
    try {
      const { data, error } = await supabase
        .from('my_table')
        .insert([item])
        .select();

      if (error) throw error;
      return data[0];
    } catch (error) {
      console.error('Error:', error);
      throw error;
    }
  },
};
```

## Estado Global

Usar Zustand para estado compartilhado:

```typescript
// src/store/vehicleStore.ts
import { create } from 'zustand';

interface VehicleStore {
  selectedVehicle: Vehicle | null;
  setSelectedVehicle: (vehicle: Vehicle | null) => void;
}

export const useVehicleStore = create<VehicleStore>((set) => ({
  selectedVehicle: null,
  setSelectedVehicle: (vehicle) =>
    set({ selectedVehicle: vehicle }),
}));
```

## Tipos TypeScript

Tudo deve ser tipificado! Exemplos:

```typescript
// ✅ BOM - Com tipos
interface Props {
  vehicles: Vehicle[];
  isLoading: boolean;
  onSelect: (vehicle: Vehicle) => void;
}

const MyComponent: React.FC<Props> = ({
  vehicles,
  isLoading,
  onSelect,
}) => {
  // ...
};

// ❌ RUIM - Sem tipos
const MyComponent = ({ vehicles, isLoading, onSelect }) => {
  // ...
};
```

## Banco de Dados

### Tabela Veículos

```sql
CREATE TABLE veiculos (
  id UUID PRIMARY KEY,
  marca VARCHAR,
  modelo VARCHAR,
  ano INT,
  preco DECIMAL,
  km INT,
  combustivel VARCHAR,
  cambio VARCHAR,
  descricao TEXT,
  imagens TEXT[],
  status VARCHAR DEFAULT 'disponivel',
  criado_em TIMESTAMP DEFAULT now()
);

-- Index para performance
CREATE INDEX idx_veiculos_marca ON veiculos(marca);
CREATE INDEX idx_veiculos_preco ON veiculos(preco);
CREATE INDEX idx_veiculos_status ON veiculos(status);
```

### Queries Comuns

```typescript
// Buscar todos com filtro
const { data } = await supabase
  .from('veiculos')
  .select('*')
  .eq('status', 'disponivel')
  .order('criado_em', { ascending: false });

// Buscar um específico
const { data } = await supabase
  .from('veiculos')
  .select('*')
  .eq('id', vehicleId)
  .single();

// Inserir
const { data } = await supabase
  .from('veiculos')
  .insert([vehicle])
  .select();

// Atualizar
const { data } = await supabase
  .from('veiculos')
  .update({ status: 'vendido' })
  .eq('id', vehicleId)
  .select();

// Deletar
const { error } = await supabase
  .from('veiculos')
  .delete()
  .eq('id', vehicleId);
```

## Fluxos de Desenvolvimento

### Adicionar Nova Página

1. Criar arquivo em `src/pages/MyPage.tsx`
2. Adicionar rota em `App.tsx`:
   ```typescript
   <Route path="/my-page" element={<MyPage />} />
   ```
3. Adicionar link em `Header.tsx` se necessário

### Adicionar Novo Serviço

1. Criar `src/services/myService.ts`
2. Implementar funções com try-catch
3. Exportar funções
4. Usar em hooks ou componentes

### Adicionar Novo Hook

1. Criar `src/hooks/useMyHook.ts`
2. Exportar em `src/hooks/index.ts`
3. Usar em componentes com `const { ... } = useMyHook()`

### Adicionar novo Componente

1. Criar pasta em `src/components/`
2. Criar arquivo TSX
3. Tipificar props com interface
4. Exportar em `src/components/index.ts`
5. Usar onde necessário

## Testing (Recomendado)

```bash
npm install --save-dev vitest @testing-library/react
```

Exemplo:
```typescript
import { render, screen } from '@testing-library/react';
import { MyComponent } from './MyComponent';

describe('MyComponent', () => {
  it('renders correctly', () => {
    render(<MyComponent title="Test" />);
    expect(screen.getByText('Test')).toBeInTheDocument();
  });
});
```

## Performance

### Code Splitting
```typescript
import { lazy, Suspense } from 'react';

const HeavyComponent = lazy(() => 
  import('./HeavyComponent')
);

export const App = () => (
  <Suspense fallback={<div>Carregando...</div>}>
    <HeavyComponent />
  </Suspense>
);
```

### Memoization
```typescript
import { memo, useCallback } from 'react';

const MyComponent = memo(({ onSubmit }) => {
  const handleClick = useCallback(() => {
    onSubmit();
  }, [onSubmit]);

  return <button onClick={handleClick}>Click</button>;
});
```

## Deploy Checklist

- [ ] Variáveis de ambiente configuradas
- [ ] Testes passando
- [ ] Build sem erros (`npm run build`)
- [ ] Sem console.logs de debug
- [ ] HTTPS configurado
- [ ] Cache estratégico
- [ ] Sentry configurado (error tracking)
- [ ] Analytics configurado
- [ ] SEO otimizado (meta tags, alt text)

## Troubleshooting

### "Cannot find module '@/...'"
Verificar se o alias está em `vite.config.ts` e `tsconfig.json`

### Erro 401 do Supabase
Verificar se `VITE_SUPABASE_ANON_KEY` está correto

### Componente não aparece
Verificar:
1. Se está exportado corretamente
2. Se está importado em `index.ts`
3. Se não há erros no console
4. Se está renderizado no JSX

---

Perguntas? Consulte o README.md ou crie uma issue no GitHub.
