-- Schema inicial da aplicacao JR Veiculos.
-- Execute este arquivo no SQL Editor do projeto Supabase.

create extension if not exists pgcrypto;

-- Vendedores precisam existir antes de veiculos por causa da chave estrangeira.
create table if not exists public.vendedores (
  id uuid primary key default gen_random_uuid(),
  nome varchar not null,
  whatsapp varchar not null,
  ativo boolean not null default true,
  criado_em timestamptz not null default now(),
  atualizado_em timestamptz not null default now()
);

create table if not exists public.veiculos (
  id uuid primary key default gen_random_uuid(),
  marca varchar not null,
  modelo varchar not null,
  versao varchar,
  ano integer not null,
  km integer not null,
  combustivel varchar not null,
  cambio varchar not null,
  cor varchar,
  categoria varchar,
  preco numeric(12, 2) not null,
  preco_promocional numeric(12, 2),
  descricao text,
  final_placa varchar,
  imagens text[] not null default '{}',
  opcionais text[] not null default '{}',
  status varchar not null default 'disponivel',
  destaque boolean not null default false,
  aceita_troca boolean not null default false,
  financia boolean not null default false,
  vendedor_id uuid references public.vendedores(id) on delete set null,
  criado_em timestamptz not null default now(),
  atualizado_em timestamptz not null default now()
);

create table if not exists public.leads (
  id uuid primary key default gen_random_uuid(),
  nome varchar not null,
  whatsapp varchar not null,
  email varchar,
  veiculo_id uuid references public.veiculos(id) on delete set null,
  vendedor_id uuid references public.vendedores(id) on delete set null,
  origem varchar,
  tipo varchar,
  status varchar not null default 'novo',
  observacoes text,
  criado_em timestamptz not null default now(),
  atualizado_em timestamptz not null default now()
);

create table if not exists public.financiamentos (
  id uuid primary key default gen_random_uuid(),
  nome varchar not null,
  whatsapp varchar not null,
  cpf varchar not null,
  rg varchar,
  sexo varchar,
  estado_civil varchar,
  veiculo_id uuid references public.veiculos(id) on delete set null,
  valor_entrada numeric(12, 2),
  observacoes text,
  criado_em timestamptz not null default now()
);

create table if not exists public.configuracoes (
  id uuid primary key default gen_random_uuid(),
  whatsapp_principal varchar,
  instagram varchar,
  facebook varchar,
  endereco varchar,
  telefone varchar,
  texto_institucional text,
  estrategia_leads varchar not null default 'aleatorio',
  criado_em timestamptz not null default now(),
  atualizado_em timestamptz not null default now()
);

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email varchar,
  nome varchar,
  avatar_url varchar,
  role varchar not null default 'vendedor',
  criado_em timestamptz not null default now()
);

-- RLS evita acesso anonimo de escrita e libera apenas o estoque publico.
--
-- IMPORTANTE (seguranca): as politicas de administracao abaixo NAO usam mais
-- "to authenticated using (true)". Esse formato liberava qualquer usuario
-- autenticado (inclusive alguem que se auto-cadastrasse pela API do Supabase
-- usando a mesma anon key publica do site, já que o app nao tem tela de
-- cadastro mas a API permite signUp por padrao) a ler/editar/apagar
-- veiculos, vendedores, leads e fichas de financiamento (nome, CPF, RG,
-- WhatsApp). Agora cada politica de administracao exige que exista uma
-- linha correspondente em "public.profiles" — ou seja, alguem que o
-- dono da loja cadastrou manualmente como equipe.
--
-- Depois de rodar este arquivo, ao criar um novo login em
-- Authentication > Users no painel do Supabase, cadastre TAMBEM uma linha
-- em public.profiles com o mesmo id (veja exemplo no final deste arquivo).
-- Sem essa linha, o login funciona mas fica sem permissao para gerenciar
-- nada — um "fail closed" proposital.
--
-- Alem disso, recomenda-se desativar novos cadastros publicos em
-- Authentication > Settings > "Allow new users to sign up" no painel do
-- Supabase, como camada extra de protecao.
alter table public.veiculos enable row level security;
alter table public.vendedores enable row level security;
alter table public.leads enable row level security;
alter table public.financiamentos enable row level security;
alter table public.configuracoes enable row level security;
alter table public.profiles enable row level security;

drop policy if exists "Estoque publico disponivel" on public.veiculos;
create policy "Estoque publico disponivel"
  on public.veiculos for select
  using (
    status = 'disponivel'
    or exists (select 1 from public.profiles p where p.id = auth.uid())
  );

drop policy if exists "Admin gerencia veiculos" on public.veiculos;
create policy "Admin gerencia veiculos"
  on public.veiculos for all
  to authenticated
  using (exists (select 1 from public.profiles p where p.id = auth.uid()))
  with check (exists (select 1 from public.profiles p where p.id = auth.uid()));

drop policy if exists "Admin gerencia vendedores" on public.vendedores;
create policy "Admin gerencia vendedores"
  on public.vendedores for all
  to authenticated
  using (exists (select 1 from public.profiles p where p.id = auth.uid()))
  with check (exists (select 1 from public.profiles p where p.id = auth.uid()));

drop policy if exists "Publico verifica vendedores" on public.vendedores;
create policy "Publico verifica vendedores"
  on public.vendedores for select
  to anon, authenticated
  using (ativo = true);

drop policy if exists "Publico cria leads" on public.leads;
create policy "Publico cria leads"
  on public.leads for insert
  to anon, authenticated
  with check (true);

drop policy if exists "Admin gerencia leads" on public.leads;
create policy "Admin gerencia leads"
  on public.leads for all
  to authenticated
  using (exists (select 1 from public.profiles p where p.id = auth.uid()))
  with check (exists (select 1 from public.profiles p where p.id = auth.uid()));

drop policy if exists "Publico cria financiamentos" on public.financiamentos;
create policy "Publico cria financiamentos"
  on public.financiamentos for insert
  to anon, authenticated
  with check (true);

drop policy if exists "Admin gerencia financiamentos" on public.financiamentos;
create policy "Admin gerencia financiamentos"
  on public.financiamentos for all
  to authenticated
  using (exists (select 1 from public.profiles p where p.id = auth.uid()))
  with check (exists (select 1 from public.profiles p where p.id = auth.uid()));

drop policy if exists "Publico le configuracoes" on public.configuracoes;
create policy "Publico le configuracoes"
  on public.configuracoes for select
  to anon, authenticated
  using (true);

drop policy if exists "Admin gerencia configuracoes" on public.configuracoes;
create policy "Admin gerencia configuracoes"
  on public.configuracoes for all
  to authenticated
  using (exists (select 1 from public.profiles p where p.id = auth.uid()))
  with check (exists (select 1 from public.profiles p where p.id = auth.uid()));

drop policy if exists "Usuario le proprio perfil" on public.profiles;
create policy "Usuario le proprio perfil"
  on public.profiles for select
  to authenticated
  using (id = auth.uid());

-- Exemplo (rode manualmente, com o id real do usuario criado em
-- Authentication > Users, para transformar esse login em equipe da loja):
--
-- insert into public.profiles (id, email, nome, role)
-- values ('cole-aqui-o-uuid-do-usuario', 'email@exemplo.com', 'Nome', 'admin');

-- Bucket usado pelo upload de fotos no cadastro de carros.
insert into storage.buckets (id, name, public)
values ('fotos-carros', 'fotos-carros', true)
on conflict (id) do update set public = true;

drop policy if exists "Fotos publicas para leitura" on storage.objects;
create policy "Fotos publicas para leitura"
  on storage.objects for select
  using (bucket_id = 'fotos-carros');

-- Mesma logica das tabelas acima: só quem tem uma linha em public.profiles
-- (equipe cadastrada manualmente pelo dono da loja) pode enviar, atualizar
-- ou remover fotos — nao qualquer usuario autenticado.
drop policy if exists "Usuarios autenticados enviam fotos" on storage.objects;
create policy "Usuarios autenticados enviam fotos"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'fotos-carros'
    and exists (select 1 from public.profiles p where p.id = auth.uid())
  );

drop policy if exists "Usuarios autenticados atualizam fotos" on storage.objects;
create policy "Usuarios autenticados atualizam fotos"
  on storage.objects for update
  to authenticated
  using (
    bucket_id = 'fotos-carros'
    and exists (select 1 from public.profiles p where p.id = auth.uid())
  )
  with check (
    bucket_id = 'fotos-carros'
    and exists (select 1 from public.profiles p where p.id = auth.uid())
  );

drop policy if exists "Usuarios autenticados removem fotos" on storage.objects;
create policy "Usuarios autenticados removem fotos"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'fotos-carros'
    and exists (select 1 from public.profiles p where p.id = auth.uid())
  );
