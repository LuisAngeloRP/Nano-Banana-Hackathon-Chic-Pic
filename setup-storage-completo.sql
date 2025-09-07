-- ===================================================================
-- CONFIGURACIÓN COMPLETA DE SUPABASE STORAGE PARA CHIC PIC
-- Script consolidado con permisos correctos para usuarios anónimos
-- ===================================================================

-- Habilitar extensiones necesarias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ===================================================================
-- PARTE 1: CONFIGURACIÓN DEL BUCKET DE STORAGE
-- ===================================================================

-- Crear bucket para imágenes (si no existe)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('chic-pic-images', 'chic-pic-images', true, 10485760, 
        array['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'])
ON CONFLICT (id) DO NOTHING;

-- ===================================================================
-- PARTE 2: POLÍTICAS DE STORAGE (ACCESO ANÓNIMO)
-- ===================================================================

-- Limpiar políticas existentes que puedan causar conflictos
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete" ON storage.objects;
DROP POLICY IF EXISTS "Allow public read access" ON storage.objects;
DROP POLICY IF EXISTS "Allow anonymous upload" ON storage.objects;
DROP POLICY IF EXISTS "Allow anonymous update" ON storage.objects;
DROP POLICY IF EXISTS "Allow anonymous delete" ON storage.objects;

-- Crear políticas que permitan acceso anónimo al bucket específico
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
-- PARTE 3: VERIFICAR TABLAS DE BASE DE DATOS (SI NO EXISTEN)
-- ===================================================================

-- Solo crear las tablas si no existen (para evitar pérdida de datos)
DO $$ 
BEGIN
    -- Tabla para prendas de vestir
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'garments') THEN
        CREATE TABLE public.garments (
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
        
        CREATE INDEX garments_category_idx ON public.garments USING btree (category);
        CREATE INDEX garments_created_at_idx ON public.garments USING btree (created_at DESC);
    END IF;

    -- Tabla para modelos
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'models') THEN
        CREATE TABLE public.models (
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
        
        CREATE INDEX models_gender_idx ON public.models USING btree (gender);
        CREATE INDEX models_created_at_idx ON public.models USING btree (created_at DESC);
    END IF;

    -- Tabla para looks estilizados
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'styled_looks') THEN
        CREATE TABLE public.styled_looks (
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
        
        CREATE INDEX styled_looks_model_id_idx ON public.styled_looks USING btree (model_id);
        CREATE INDEX styled_looks_created_at_idx ON public.styled_looks USING btree (created_at DESC);
    END IF;
END $$;

-- ===================================================================
-- PARTE 4: CONFIGURAR RLS PARA TABLAS (ACCESO ANÓNIMO)
-- ===================================================================

-- Habilitar RLS para todas las tablas
ALTER TABLE public.garments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.models ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.styled_looks ENABLE ROW LEVEL SECURITY;

-- Limpiar políticas existentes de tablas
DROP POLICY IF EXISTS "Allow anonymous access to garments" ON public.garments;
DROP POLICY IF EXISTS "Allow anonymous access to models" ON public.models;
DROP POLICY IF EXISTS "Allow anonymous access to styled_looks" ON public.styled_looks;
DROP POLICY IF EXISTS "Allow all operations on garments" ON public.garments;
DROP POLICY IF EXISTS "Allow all operations on models" ON public.models;
DROP POLICY IF EXISTS "Allow all operations on styled_looks" ON public.styled_looks;

-- Crear políticas permisivas para acceso anónimo a las tablas
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
-- PARTE 5: AGREGAR COLUMNAS DE STORAGE SI NO EXISTEN
-- ===================================================================

-- Agregar columnas de storage a tablas existentes (si no las tienen)
DO $$ 
BEGIN
    -- Para garments
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='garments' AND column_name='image_url') THEN
        ALTER TABLE public.garments ADD COLUMN image_url text;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='garments' AND column_name='thumbnail_url') THEN
        ALTER TABLE public.garments ADD COLUMN thumbnail_url text;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='garments' AND column_name='storage_path') THEN
        ALTER TABLE public.garments ADD COLUMN storage_path text;
    END IF;

    -- Para models
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='models' AND column_name='image_url') THEN
        ALTER TABLE public.models ADD COLUMN image_url text;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='models' AND column_name='thumbnail_url') THEN
        ALTER TABLE public.models ADD COLUMN thumbnail_url text;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='models' AND column_name='storage_path') THEN
        ALTER TABLE public.models ADD COLUMN storage_path text;
    END IF;

    -- Para styled_looks
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='styled_looks' AND column_name='image_url') THEN
        ALTER TABLE public.styled_looks ADD COLUMN image_url text;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='styled_looks' AND column_name='thumbnail_url') THEN
        ALTER TABLE public.styled_looks ADD COLUMN thumbnail_url text;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='styled_looks' AND column_name='storage_path') THEN
        ALTER TABLE public.styled_looks ADD COLUMN storage_path text;
    END IF;
END $$;

-- ===================================================================
-- PARTE 6: COMENTARIOS Y DOCUMENTACIÓN
-- ===================================================================

-- Comentarios para documentación de tablas
COMMENT ON TABLE public.garments IS 'Tabla para almacenar prendas de vestir con URLs de Supabase Storage';
COMMENT ON TABLE public.models IS 'Tabla para almacenar modelos con sus características físicas y URLs de Supabase Storage';
COMMENT ON TABLE public.styled_looks IS 'Tabla para almacenar looks estilizados (combinaciones de modelo + prendas) con URLs de Supabase Storage';

-- Comentarios para columnas de storage
COMMENT ON COLUMN public.garments.image_url IS 'URL pública de la imagen en Supabase Storage';
COMMENT ON COLUMN public.garments.thumbnail_url IS 'URL del thumbnail comprimido (opcional)';
COMMENT ON COLUMN public.garments.storage_path IS 'Ruta del archivo en Supabase Storage para eliminación';

COMMENT ON COLUMN public.models.image_url IS 'URL pública de la imagen en Supabase Storage';
COMMENT ON COLUMN public.models.thumbnail_url IS 'URL del thumbnail comprimido (opcional)';
COMMENT ON COLUMN public.models.storage_path IS 'Ruta del archivo en Supabase Storage para eliminación';

COMMENT ON COLUMN public.styled_looks.image_url IS 'URL pública de la imagen en Supabase Storage';
COMMENT ON COLUMN public.styled_looks.thumbnail_url IS 'URL del thumbnail comprimido (opcional)';
COMMENT ON COLUMN public.styled_looks.storage_path IS 'Ruta del archivo en Supabase Storage para eliminación';

-- ===================================================================
-- PARTE 7: VERIFICACIÓN FINAL
-- ===================================================================

-- Verificar que el bucket fue creado correctamente
SELECT 
    name,
    public,
    file_size_limit,
    allowed_mime_types
FROM storage.buckets 
WHERE name = 'chic-pic-images';

-- Verificar las políticas de storage creadas
SELECT 
    policyname, 
    cmd, 
    permissive,
    roles::text,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'objects' 
  AND schemaname = 'storage'
  AND policyname LIKE 'chic_pic_%'
ORDER BY policyname;

-- Verificar las políticas de las tablas
SELECT 
    schemaname, 
    tablename, 
    policyname, 
    permissive, 
    roles::text,
    cmd, 
    qual, 
    with_check
FROM pg_policies 
WHERE tablename IN ('garments', 'models', 'styled_looks')
  AND policyname LIKE 'chic_pic_%'
ORDER BY tablename, policyname;

-- ===================================================================
-- ✅ RESULTADO ESPERADO
-- ===================================================================
-- Después de ejecutar este script:
-- 1. ✅ Bucket 'chic-pic-images' configurado y público
-- 2. ✅ Políticas de storage permiten acceso anónimo
-- 3. ✅ Tablas creadas/actualizadas con columnas de storage
-- 4. ✅ RLS habilitado con políticas permisivas para desarrollo
-- 5. ✅ El error "new row violates row-level security policy" desaparece
-- 6. ✅ El Generador de Prendas IA funciona correctamente
-- ===================================================================
