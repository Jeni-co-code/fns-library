-- =========================================================
-- Esquema de la base de datos para "Rincón" (biblioteca personal)
-- Ejecuta todo este archivo en Supabase: Panel > SQL Editor > New query > Run
-- =========================================================

-- Perfiles de usuario (se crea automáticamente al registrarse)
create table if not exists profiles (
  id uuid references auth.users on delete cascade primary key,
  display_name text,
  avatar_color text default '#E29A21',
  theme_mode text default 'magica', -- 'magica' | 'clasica'
  created_at timestamptz default now()
);

-- Estanterías / carpetas (cada usuario crea las suyas: "Fantasía", "Saga X", etc.)
create table if not exists folders (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  name text not null,
  color text default '#8AA98C',
  character_emoji text default '🦉',      -- personaje rápido (si no sube uno propio)
  character_image_path text,              -- ruta en storage si subió su propio personaje
  created_at timestamptz default now()
);

-- Libros
create table if not exists books (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  title text not null,
  author text,
  file_path text not null,       -- ruta dentro del bucket 'library-files'
  file_type text not null,       -- 'epub' | 'pdf'
  cover_path text,               -- ruta de la portada dentro del bucket (opcional)
  status text default 'por_leer', -- 'por_leer' | 'leyendo' | 'terminado'
  progress_location text,        -- CFI (epub) o número de página (pdf), como texto
  progress_percent numeric default 0,
  created_at timestamptz default now()
);

-- Relación libros <-> carpetas (un libro puede estar en varias carpetas)
create table if not exists book_folders (
  book_id uuid references books on delete cascade not null,
  folder_id uuid references folders on delete cascade not null,
  primary key (book_id, folder_id)
);

-- =========================================================
-- Seguridad: cada usuario solo ve y modifica SUS propios datos
-- =========================================================
alter table profiles enable row level security;
alter table folders enable row level security;
alter table books enable row level security;
alter table book_folders enable row level security;

create policy "ver mi perfil" on profiles for select using (auth.uid() = id);
create policy "editar mi perfil" on profiles for update using (auth.uid() = id);
create policy "crear mi perfil" on profiles for insert with check (auth.uid() = id);

create policy "gestionar mis carpetas" on folders for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "gestionar mis libros" on books for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "gestionar mis relaciones libro-carpeta" on book_folders for all
  using (exists (select 1 from books where books.id = book_id and books.user_id = auth.uid()))
  with check (exists (select 1 from books where books.id = book_id and books.user_id = auth.uid()));

-- Crear perfil automáticamente cuando alguien se registra
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1)));
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- =========================================================
-- Almacenamiento: crea un bucket PRIVADO llamado 'library-files'
-- Panel > Storage > New bucket > nombre: library-files > Public: NO
-- Luego corre las políticas de abajo.
-- =========================================================
insert into storage.buckets (id, name, public)
values ('library-files', 'library-files', false)
on conflict (id) do nothing;

create policy "leer mis propios archivos"
  on storage.objects for select
  using (bucket_id = 'library-files' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "subir mis propios archivos"
  on storage.objects for insert
  with check (bucket_id = 'library-files' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "borrar mis propios archivos"
  on storage.objects for delete
  using (bucket_id = 'library-files' and (storage.foldername(name))[1] = auth.uid()::text);
