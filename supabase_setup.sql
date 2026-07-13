-- Criação da tabela offers e configuração de segurança

create table if not exists public.offers (
    id uuid default gen_random_uuid() primary key,

    user_id uuid
        references auth.users(id)
        on delete cascade
        not null,

    title text not null,
    product_name text,
    niche text,
    advertiser_name text,
    page_name text,

    ad_library_url text not null,
    sales_page_url text,

    current_ads_count integer not null default 0,
    oldest_ad_date date,

    country text,
    platform text,
    creative_type text,

    status text not null,
    notes text,

    ads_history jsonb not null default '{}'::jsonb,
    is_favorite boolean not null default false,

    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),

    constraint current_ads_count_non_negative
        check (current_ads_count >= 0),

    constraint status_enum_check
        check (
            status in (
                'discovery',
                'watching',
                'growing',
                'stable',
                'scaling',
                'declining',
                'ended',
                'archived'
            )
        )
);

-- Índices úteis
create index if not exists offers_user_id_idx
on public.offers(user_id);

create index if not exists offers_user_status_idx
on public.offers(user_id, status);

create index if not exists offers_user_updated_at_idx
on public.offers(user_id, updated_at desc);

-- Atualização automática de updated_at
create or replace function public.handle_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
    new.updated_at = now();
    return new;
end;
$$;

drop trigger if exists set_updated_at on public.offers;

create trigger set_updated_at
before update on public.offers
for each row
execute function public.handle_updated_at();

-- Privilégios
revoke all on table public.offers from anon;

grant select, insert, update, delete
on table public.offers
to authenticated;

-- Row Level Security
alter table public.offers enable row level security;

-- SELECT
drop policy if exists
"Usuários podem ler apenas suas próprias ofertas"
on public.offers;

create policy
"Usuários podem ler apenas suas próprias ofertas"
on public.offers
for select
to authenticated
using ((select auth.uid()) = user_id);

-- INSERT
drop policy if exists
"Usuários podem criar apenas suas próprias ofertas"
on public.offers;

create policy
"Usuários podem criar apenas suas próprias ofertas"
on public.offers
for insert
to authenticated
with check ((select auth.uid()) = user_id);

-- UPDATE
drop policy if exists
"Usuários podem atualizar apenas suas próprias ofertas"
on public.offers;

create policy
"Usuários podem atualizar apenas suas próprias ofertas"
on public.offers
for update
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

-- DELETE
drop policy if exists
"Usuários podem excluir apenas suas próprias ofertas"
on public.offers;

create policy
"Usuários podem excluir apenas suas próprias ofertas"
on public.offers
for delete
to authenticated
using ((select auth.uid()) = user_id);