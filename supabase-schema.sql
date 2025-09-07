-- Esquema de base de datos para Chic Pic en Supabase
-- Ejecuta este SQL en el editor SQL de tu proyecto Supabase

-- Habilitar extensiones necesarias
create extension if not exists "uuid-ossp";

-- Tabla para prendas de vestir
create table public.garments (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  description text not null,
  category text not null,
  image_base64 text not null, -- Imagen en base64
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
  image_base64 text not null, -- Imagen en base64
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Tabla para looks estilizados
create table public.styled_looks (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  model_id uuid references public.models(id) on delete cascade not null,
  garment_ids jsonb not null, -- Array de IDs de prendas
  image_base64 text not null, -- Imagen en base64
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

-- Comentarios para documentación
comment on table public.garments is 'Tabla para almacenar prendas de vestir con imágenes en base64';
comment on table public.models is 'Tabla para almacenar modelos con sus características físicas e imágenes en base64';
comment on table public.styled_looks is 'Tabla para almacenar looks estilizados (combinaciones de modelo + prendas) con imágenes en base64';

comment on column public.garments.image_base64 is 'Imagen de la prenda codificada en base64';
comment on column public.garments.available_sizes is 'Array JSON con las tallas disponibles para esta prenda';
comment on column public.models.image_base64 is 'Imagen del modelo codificada en base64';
comment on column public.styled_looks.image_base64 is 'Imagen del look estilizado codificada en base64';
comment on column public.styled_looks.garment_ids is 'Array JSON con los IDs de las prendas usadas en este look';
comment on column public.styled_looks.garment_fits is 'Array JSON con información de ajuste para cada prenda del look';
