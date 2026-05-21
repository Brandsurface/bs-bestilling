-- ══════════════════════════════════════════════════════
-- KØR DETTE I SUPABASE → SQL EDITOR
-- ══════════════════════════════════════════════════════

create table if not exists orders (
  id            uuid primary key default gen_random_uuid(),
  created_at    timestamptz default now(),
  updated_at    timestamptz default now(),
  status        text not null default 'pending'
                check (status in ('pending', 'confirmed', 'cancelled')),

  butiksnavn    text not null,
  navn          text not null,
  email         text not null,

  produkter     jsonb not null default '[]',
  andet         text,

  addr_type     text default 'butik',
  gade          text,
  postnr        text,
  by            text,
  att           text,
  tlf           text,

  alt_active    boolean default false,
  alt_gade      text,
  alt_postnr    text,
  alt_by        text,
  alt_att       text,
  alt_tlf       text,

  konsulent_navn  text,
  konsulent_tlf   text,
  konsulent_email text,

  revision      integer default 0
);

create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists orders_updated_at on orders;
create trigger orders_updated_at
  before update on orders
  for each row execute procedure set_updated_at();

alter table orders enable row level security;
