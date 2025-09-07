-- Esquema limpio para Chic Pic: Solo Supabase Storage (sin base64)
-- Ejecuta este SQL en el editor SQL de tu proyecto Supabase

-- Habilitar extensiones necesarias
create extension if not exists "uuid-ossp";

-- LIMPIAR TABLAS EXISTENTES (CUIDADO: Esto borra todos los datos)
DROP TABLE IF EXISTS public.styled_looks CASCADE;
DROP TABLE IF EXISTS public.models CASCADE;
DROP TABLE IF EXISTS public.garments CASCADE;

-- CREAR TABLAS LIMPIAS CON SOLO URLs
-- Tabla para prendas de vestir
create table public.garments (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  description text not null,
  category text not null,
  image_url text not null, -- URL de Supabase Storage
  thumbnail_url text, -- URL del thumbnail comprimido
  storage_path text not null, -- Ruta en Storage para eliminación
  color text not null,
  available_sizes jsonb, -- Array de tallas disponibles
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Tabla para modelos
create table public.models (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  characteristics text not null,
  gender text not null check (gender in ('masculino', 'femenino', 'unisex')),
  age text not null,
  height text not null,
  body_type text not null,
  hair_color text not null,
  eye_color text not null,
  skin_tone text not null,
  upper_body_size text not null, -- Talla para parte superior
  lower_body_size text not null, -- Talla para parte inferior
  shoe_size text not null, -- Talla de zapatos
  image_url text not null, -- URL de Supabase Storage
  thumbnail_url text, -- URL del thumbnail comprimido
  storage_path text not null, -- Ruta en Storage para eliminación
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Tabla para looks estilizados
create table public.styled_looks (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  model_id uuid references public.models(id) on delete cascade not null,
  garment_ids jsonb not null, -- Array de IDs de prendas
  image_url text not null, -- URL de Supabase Storage
  thumbnail_url text, -- URL del thumbnail comprimido
  storage_path text not null, -- Ruta en Storage para eliminación
  description text not null,
  garment_fits jsonb not null, -- Información de ajuste de cada prenda
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Índices para mejorar el rendimiento
create index garments_category_idx on public.garments using btree (category);
create index garments_created_at_idx on public.garments using btree (created_at desc);
create index models_gender_idx on public.models using btree (gender);
create index models_created_at_idx on public.models using btree (created_at desc);
create index styled_looks_model_id_idx on public.styled_looks using btree (model_id);
create index styled_looks_created_at_idx on public.styled_looks using btree (created_at desc);

-- Habilitar RLS (Row Level Security) para todas las tablas
alter table public.garments enable row level security;
alter table public.models enable row level security;
alter table public.styled_looks enable row level security;

-- Políticas de seguridad (permitir acceso público para este demo)
-- En producción, deberías configurar políticas más restrictivas basadas en autenticación

-- Política para garments: permitir todo a usuarios anónimos
create policy "Allow anonymous access to garments" on public.garments
  for all using (true);

-- Política para models: permitir todo a usuarios anónimos
create policy "Allow anonymous access to models" on public.models
  for all using (true);

-- Política para styled_looks: permitir todo a usuarios anónimos
create policy "Allow anonymous access to styled_looks" on public.styled_looks
  for all using (true);

-- CONFIGURAR STORAGE
-- Crear bucket para imágenes (si no existe)
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('chic-pic-images', 'chic-pic-images', true, 10485760, 
array['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'])
ON CONFLICT (id) DO NOTHING;

-- Políticas de Storage
-- Política para permitir lectura pública
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
CREATE POLICY "Public Access" ON storage.objects FOR SELECT USING (bucket_id = 'chic-pic-images');

-- Política para permitir subida de archivos
DROP POLICY IF EXISTS "Authenticated users can upload" ON storage.objects;
CREATE POLICY "Authenticated users can upload" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'chic-pic-images');

-- Política para permitir actualización de archivos
DROP POLICY IF EXISTS "Authenticated users can update" ON storage.objects;
CREATE POLICY "Authenticated users can update" ON storage.objects FOR UPDATE USING (bucket_id = 'chic-pic-images');

-- Política para permitir eliminación de archivos
DROP POLICY IF EXISTS "Authenticated users can delete" ON storage.objects;
CREATE POLICY "Authenticated users can delete" ON storage.objects FOR DELETE USING (bucket_id = 'chic-pic-images');

-- Comentarios para documentación
comment on table public.garments is 'Tabla para almacenar prendas de vestir con URLs de Supabase Storage';
comment on table public.models is 'Tabla para almacenar modelos con sus características físicas y URLs de Supabase Storage';
comment on table public.styled_looks is 'Tabla para almacenar looks estilizados (combinaciones de modelo + prendas) con URLs de Supabase Storage';

comment on column public.garments.image_url is 'URL pública de la imagen en Supabase Storage';
comment on column public.garments.thumbnail_url is 'URL del thumbnail comprimido (opcional)';
comment on column public.garments.storage_path is 'Ruta del archivo en Supabase Storage para eliminación';
comment on column public.garments.available_sizes is 'Array JSON con las tallas disponibles para esta prenda';

comment on column public.models.image_url is 'URL pública de la imagen en Supabase Storage';
comment on column public.models.thumbnail_url is 'URL del thumbnail comprimido (opcional)';
comment on column public.models.storage_path is 'Ruta del archivo en Supabase Storage para eliminación';

comment on column public.styled_looks.image_url is 'URL pública de la imagen en Supabase Storage';
comment on column public.styled_looks.thumbnail_url is 'URL del thumbnail comprimido (opcional)';
comment on column public.styled_looks.storage_path is 'Ruta del archivo en Supabase Storage para eliminación';
comment on column public.styled_looks.garment_ids is 'Array JSON con los IDs de las prendas usadas en este look';
comment on column public.styled_looks.garment_fits is 'Array JSON con información de ajuste para cada prenda del look';
