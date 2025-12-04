-- ===================================================================
-- CHIC PIC - ESQUEMA COMPLETO PARA SUPABASE
-- ===================================================================
-- Este archivo contiene toda la configuración necesaria para Chic Pic
-- Ejecuta este script completo en el editor SQL de tu proyecto Supabase
-- 
-- Incluye:
-- - Extensiones necesarias
-- - Tablas principales (garments, models, styled_looks)
-- - Índices para rendimiento
-- - Row Level Security (RLS) con políticas permisivas
-- - Configuración de Storage (bucket y políticas)
-- - Documentación completa
-- ===================================================================

-- ===================================================================
-- PARTE 1: EXTENSIONES
-- ===================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ===================================================================
-- PARTE 2: LIMPIEZA INICIAL (OPCIONAL - Descomenta si necesitas resetear)
-- ===================================================================

-- ⚠️ CUIDADO: Descomentar estas líneas eliminará TODOS los datos existentes
-- DROP TABLE IF EXISTS public.styled_looks CASCADE;
-- DROP TABLE IF EXISTS public.models CASCADE;
-- DROP TABLE IF EXISTS public.garments CASCADE;

-- ===================================================================
-- PARTE 3: CREACIÓN DE TABLAS
-- ===================================================================

-- Tabla para prendas de vestir
CREATE TABLE IF NOT EXISTS public.garments (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  name text NOT NULL,
  description text NOT NULL,
  category text NOT NULL,
  image_url text NOT NULL,
  thumbnail_url text,
  storage_path text NOT NULL,
  color text NOT NULL,
  available_sizes jsonb,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Tabla para modelos
CREATE TABLE IF NOT EXISTS public.models (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  name text NOT NULL,
  characteristics text NOT NULL,
  gender text NOT NULL CHECK (gender IN ('masculino', 'femenino', 'unisex')),
  age text NOT NULL,
  height text NOT NULL,
  body_type text NOT NULL,
  hair_color text NOT NULL,
  eye_color text NOT NULL,
  skin_tone text NOT NULL,
  upper_body_size text NOT NULL,
  lower_body_size text NOT NULL,
  shoe_size text NOT NULL,
  image_url text NOT NULL,
  thumbnail_url text,
  storage_path text NOT NULL,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Tabla para looks estilizados
CREATE TABLE IF NOT EXISTS public.styled_looks (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  name text NOT NULL,
  model_id uuid REFERENCES public.models(id) ON DELETE CASCADE NOT NULL,
  garment_ids jsonb NOT NULL,
  image_url text NOT NULL,
  thumbnail_url text,
  storage_path text NOT NULL,
  description text NOT NULL,
  garment_fits jsonb NOT NULL,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ===================================================================
-- PARTE 4: ÍNDICES PARA RENDIMIENTO
-- ===================================================================

-- Índices para garments
CREATE INDEX IF NOT EXISTS garments_category_idx ON public.garments USING btree (category);
CREATE INDEX IF NOT EXISTS garments_created_at_idx ON public.garments USING btree (created_at DESC);

-- Índices para models
CREATE INDEX IF NOT EXISTS models_gender_idx ON public.models USING btree (gender);
CREATE INDEX IF NOT EXISTS models_created_at_idx ON public.models USING btree (created_at DESC);

-- Índices para styled_looks
CREATE INDEX IF NOT EXISTS styled_looks_model_id_idx ON public.styled_looks USING btree (model_id);
CREATE INDEX IF NOT EXISTS styled_looks_created_at_idx ON public.styled_looks USING btree (created_at DESC);

-- ===================================================================
-- PARTE 5: ROW LEVEL SECURITY (RLS)
-- ===================================================================

-- Habilitar RLS para todas las tablas
ALTER TABLE public.garments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.models ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.styled_looks ENABLE ROW LEVEL SECURITY;

-- Limpiar políticas existentes que puedan causar conflictos
DROP POLICY IF EXISTS "Allow anonymous access to garments" ON public.garments;
DROP POLICY IF EXISTS "Allow anonymous access to models" ON public.models;
DROP POLICY IF EXISTS "Allow anonymous access to styled_looks" ON public.styled_looks;
DROP POLICY IF EXISTS "Allow all operations on garments" ON public.garments;
DROP POLICY IF EXISTS "Allow all operations on models" ON public.models;
DROP POLICY IF EXISTS "Allow all operations on styled_looks" ON public.styled_looks;
DROP POLICY IF EXISTS "chic_pic_garments_all_access" ON public.garments;
DROP POLICY IF EXISTS "chic_pic_models_all_access" ON public.models;
DROP POLICY IF EXISTS "chic_pic_styled_looks_all_access" ON public.styled_looks;

-- Crear políticas permisivas para acceso anónimo (desarrollo/demo)
-- ⚠️ NOTA: En producción, deberías usar políticas más restrictivas basadas en autenticación
CREATE POLICY "chic_pic_garments_all_access" ON public.garments
  FOR ALL
  TO public
  USING (true)
  WITH CHECK (true);

CREATE POLICY "chic_pic_models_all_access" ON public.models
  FOR ALL
  TO public
  USING (true)
  WITH CHECK (true);

CREATE POLICY "chic_pic_styled_looks_all_access" ON public.styled_looks
  FOR ALL
  TO public
  USING (true)
  WITH CHECK (true);

-- ===================================================================
-- PARTE 6: CONFIGURACIÓN DE STORAGE
-- ===================================================================

-- Crear bucket para imágenes (si no existe)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'chic-pic-images',
  'chic-pic-images',
  true,
  10485760, -- 10MB límite
  array['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO NOTHING;

-- Limpiar políticas existentes de storage que puedan causar conflictos
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete" ON storage.objects;
DROP POLICY IF EXISTS "Allow public read access" ON storage.objects;
DROP POLICY IF EXISTS "Allow anonymous upload" ON storage.objects;
DROP POLICY IF EXISTS "Allow anonymous update" ON storage.objects;
DROP POLICY IF EXISTS "Allow anonymous delete" ON storage.objects;
DROP POLICY IF EXISTS "chic_pic_public_read" ON storage.objects;
DROP POLICY IF EXISTS "chic_pic_anonymous_upload" ON storage.objects;
DROP POLICY IF EXISTS "chic_pic_anonymous_update" ON storage.objects;
DROP POLICY IF EXISTS "chic_pic_anonymous_delete" ON storage.objects;

-- Crear políticas de Storage para acceso anónimo al bucket específico
-- ✅ Política 1: Lectura pública de imágenes
CREATE POLICY "chic_pic_public_read" ON storage.objects 
  FOR SELECT 
  TO public
  USING (bucket_id = 'chic-pic-images');

-- ✅ Política 2: Subida anónima de archivos
CREATE POLICY "chic_pic_anonymous_upload" ON storage.objects 
  FOR INSERT 
  TO public
  WITH CHECK (bucket_id = 'chic-pic-images');

-- ✅ Política 3: Actualización anónima de archivos
CREATE POLICY "chic_pic_anonymous_update" ON storage.objects 
  FOR UPDATE 
  TO public
  USING (bucket_id = 'chic-pic-images');

-- ✅ Política 4: Eliminación anónima de archivos
CREATE POLICY "chic_pic_anonymous_delete" ON storage.objects 
  FOR DELETE 
  TO public
  USING (bucket_id = 'chic-pic-images');

-- ===================================================================
-- PARTE 7: DOCUMENTACIÓN Y COMENTARIOS
-- ===================================================================

-- Comentarios para tablas
COMMENT ON TABLE public.garments IS 'Tabla para almacenar prendas de vestir con URLs de Supabase Storage';
COMMENT ON TABLE public.models IS 'Tabla para almacenar modelos con sus características físicas y URLs de Supabase Storage';
COMMENT ON TABLE public.styled_looks IS 'Tabla para almacenar looks estilizados (combinaciones de modelo + prendas) con URLs de Supabase Storage';

-- Comentarios para columnas de garments
COMMENT ON COLUMN public.garments.image_url IS 'URL pública de la imagen en Supabase Storage';
COMMENT ON COLUMN public.garments.thumbnail_url IS 'URL del thumbnail comprimido (opcional)';
COMMENT ON COLUMN public.garments.storage_path IS 'Ruta del archivo en Supabase Storage para eliminación';
COMMENT ON COLUMN public.garments.available_sizes IS 'Array JSON con las tallas disponibles para esta prenda';

-- Comentarios para columnas de models
COMMENT ON COLUMN public.models.image_url IS 'URL pública de la imagen en Supabase Storage';
COMMENT ON COLUMN public.models.thumbnail_url IS 'URL del thumbnail comprimido (opcional)';
COMMENT ON COLUMN public.models.storage_path IS 'Ruta del archivo en Supabase Storage para eliminación';

-- Comentarios para columnas de styled_looks
COMMENT ON COLUMN public.styled_looks.image_url IS 'URL pública de la imagen en Supabase Storage';
COMMENT ON COLUMN public.styled_looks.thumbnail_url IS 'URL del thumbnail comprimido (opcional)';
COMMENT ON COLUMN public.styled_looks.storage_path IS 'Ruta del archivo en Supabase Storage para eliminación';
COMMENT ON COLUMN public.styled_looks.garment_ids IS 'Array JSON con los IDs de las prendas usadas en este look';
COMMENT ON COLUMN public.styled_looks.garment_fits IS 'Array JSON con información de ajuste para cada prenda del look';

-- ===================================================================
-- PARTE 8: VERIFICACIÓN FINAL (Opcional - Descomenta para verificar)
-- ===================================================================

-- Verificar que el bucket fue creado correctamente
-- SELECT 
--     name,
--     public,
--     file_size_limit,
--     allowed_mime_types
-- FROM storage.buckets 
-- WHERE name = 'chic-pic-images';

-- Verificar las políticas de storage creadas
-- SELECT 
--     policyname, 
--     cmd, 
--     permissive,
--     roles::text
-- FROM pg_policies 
-- WHERE tablename = 'objects' 
--   AND schemaname = 'storage'
--   AND policyname LIKE 'chic_pic_%'
-- ORDER BY policyname;

-- Verificar las políticas de las tablas
-- SELECT 
--     schemaname, 
--     tablename, 
--     policyname, 
--     permissive, 
--     roles::text,
--     cmd
-- FROM pg_policies 
-- WHERE tablename IN ('garments', 'models', 'styled_looks')
--   AND policyname LIKE 'chic_pic_%'
-- ORDER BY tablename, policyname;

-- ===================================================================
-- ✅ CONFIGURACIÓN COMPLETA
-- ===================================================================
-- Después de ejecutar este script:
-- 1. ✅ Extensiones habilitadas (uuid-ossp)
-- 2. ✅ Tablas creadas (garments, models, styled_looks)
-- 3. ✅ Índices creados para optimizar consultas
-- 4. ✅ RLS habilitado con políticas permisivas para desarrollo
-- 5. ✅ Bucket 'chic-pic-images' configurado y público
-- 6. ✅ Políticas de storage permiten acceso anónimo
-- 7. ✅ Documentación completa añadida
-- 
-- Tu base de datos está lista para usar con Chic Pic 🎨✨
-- ===================================================================

