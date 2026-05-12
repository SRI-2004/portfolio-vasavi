create table if not exists public.admin_users (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  section text not null default 'projects' check (section in ('projects', 'research', 'play')),
  tags text[] not null default '{}',
  disciplines text[] not null default '{}',
  card_image jsonb not null,
  featured_on_home boolean not null default false,
  sort_order int not null default 100,
  status text not null default 'draft' check (status in ('draft', 'published')),
  detail jsonb not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.projects
add column if not exists section text not null default 'projects'
check (section in ('projects', 'research', 'play'));

alter table public.projects
drop constraint if exists projects_section_check;

alter table public.projects
add constraint projects_section_check
check (section in ('projects', 'research', 'play'));

create index if not exists projects_status_sort_idx on public.projects(status, sort_order);
create index if not exists projects_section_status_sort_idx on public.projects(section, status, sort_order);
create index if not exists projects_slug_idx on public.projects(slug);
create index if not exists projects_tags_gin_idx on public.projects using gin(tags);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists projects_set_updated_at on public.projects;
create trigger projects_set_updated_at
before update on public.projects
for each row
execute function public.set_updated_at();

alter table public.admin_users enable row level security;
alter table public.projects enable row level security;

create policy "Admin users can read admin list"
on public.admin_users
for select
to authenticated
using (user_id = auth.uid());

create policy "Published projects are public"
on public.projects
for select
to anon, authenticated
using (
  status = 'published'
  or exists (
    select 1 from public.admin_users
    where admin_users.user_id = auth.uid()
  )
);

create policy "Admins can insert projects"
on public.projects
for insert
to authenticated
with check (
  exists (
    select 1 from public.admin_users
    where admin_users.user_id = auth.uid()
  )
);

create policy "Admins can update projects"
on public.projects
for update
to authenticated
using (
  exists (
    select 1 from public.admin_users
    where admin_users.user_id = auth.uid()
  )
)
with check (
  exists (
    select 1 from public.admin_users
    where admin_users.user_id = auth.uid()
  )
);

create policy "Admins can delete projects"
on public.projects
for delete
to authenticated
using (
  exists (
    select 1 from public.admin_users
    where admin_users.user_id = auth.uid()
  )
);

insert into storage.buckets (id, name, public)
values ('project-assets', 'project-assets', true)
on conflict (id) do update set public = true;

drop policy if exists "Project assets are public" on storage.objects;
create policy "Project assets are public"
on storage.objects
for select
to anon, authenticated
using (bucket_id = 'project-assets');

drop policy if exists "Admins can upload project assets" on storage.objects;
create policy "Admins can upload project assets"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'project-assets'
  and exists (
    select 1 from public.admin_users
    where admin_users.user_id = auth.uid()
  )
);

drop policy if exists "Admins can update project assets" on storage.objects;
create policy "Admins can update project assets"
on storage.objects
for update
to authenticated
using (
  bucket_id = 'project-assets'
  and exists (
    select 1 from public.admin_users
    where admin_users.user_id = auth.uid()
  )
)
with check (
  bucket_id = 'project-assets'
  and exists (
    select 1 from public.admin_users
    where admin_users.user_id = auth.uid()
  )
);

drop policy if exists "Admins can delete project assets" on storage.objects;
create policy "Admins can delete project assets"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'project-assets'
  and exists (
    select 1 from public.admin_users
    where admin_users.user_id = auth.uid()
  )
);
