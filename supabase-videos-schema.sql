-- ===================================================================
-- CICIBET - ESQUEMA PARA VIDEOS GENERADOS CON VEO 3.1
-- ===================================================================
-- Este script agrega soporte para almacenar videos promocionales generados
-- Ejecuta este script en el editor SQL de tu proyecto Supabase
-- ===================================================================

-- ===================================================================
-- PARTE 1: CREAR TABLA DE VIDEOS
-- ===================================================================

-- Tabla para videos promocionales generados con Veo 3.1
CREATE TABLE IF NOT EXISTS public.videos (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  name text NOT NULL,
  description text NOT NULL,
  video_url text NOT NULL,
  thumbnail_url text,
  storage_path text NOT NULL,
  look_ids jsonb NOT NULL, -- Array de IDs de looks usados en el video
  prompt_used text, -- Prompt usado para generar el video
  duration_seconds integer DEFAULT 8,
  resolution text DEFAULT '720p',
  aspect_ratio text DEFAULT '16:9',
  status text DEFAULT 'completed' CHECK (status IN ('processing', 'completed', 'failed')),
  error_message text,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ===================================================================
-- PARTE 2: ÍNDICES PARA RENDIMIENTO
-- ===================================================================

CREATE INDEX IF NOT EXISTS videos_created_at_idx ON public.videos USING btree (created_at DESC);
CREATE INDEX IF NOT EXISTS videos_status_idx ON public.videos USING btree (status);
CREATE INDEX IF NOT EXISTS videos_look_ids_idx ON public.videos USING gin (look_ids);

-- ===================================================================
-- PARTE 3: ROW LEVEL SECURITY (RLS)
-- ===================================================================

-- Habilitar RLS para la tabla de videos
ALTER TABLE public.videos ENABLE ROW LEVEL SECURITY;

-- Limpiar políticas existentes que puedan causar conflictos
DROP POLICY IF EXISTS "Allow anonymous access to videos" ON public.videos;
DROP POLICY IF EXISTS "Allow all operations on videos" ON public.videos;
DROP POLICY IF EXISTS "chic_pic_videos_all_access" ON public.videos;
DROP POLICY IF EXISTS "cicibet_videos_all_access" ON public.videos;

-- Crear política permisiva para acceso anónimo (desarrollo/demo)
-- ⚠️ NOTA: En producción, deberías usar políticas más restrictivas basadas en autenticación
CREATE POLICY "cicibet_videos_all_access" ON public.videos
  FOR ALL
  TO public
  USING (true)
  WITH CHECK (true);

-- ===================================================================
-- PARTE 4: CONFIGURACIÓN DE STORAGE PARA VIDEOS
-- ===================================================================

-- Crear bucket para videos (si no existe)
-- Nota: El bucket 'cicibet-storage' debe existir o se creará aquí
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'cicibet-storage',
  'cicibet-storage',
  true,
  52428800, -- 50MB límite para videos
  array['video/mp4', 'video/webm', 'video/quicktime', 'image/jpeg', 'image/jpg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO UPDATE SET
  file_size_limit = 52428800,
  allowed_mime_types = array['video/mp4', 'video/webm', 'video/quicktime', 'image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

-- Si el bucket 'chic-pic-images' existe, también actualizarlo para permitir videos
UPDATE storage.buckets
SET 
  file_size_limit = 52428800,
  allowed_mime_types = array['video/mp4', 'video/webm', 'video/quicktime', 'image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']
WHERE id = 'chic-pic-images';

-- Limpiar políticas existentes de storage para videos
DROP POLICY IF EXISTS "cicibet_videos_public_read" ON storage.objects;
DROP POLICY IF EXISTS "cicibet_videos_anonymous_upload" ON storage.objects;
DROP POLICY IF EXISTS "cicibet_videos_anonymous_update" ON storage.objects;
DROP POLICY IF EXISTS "cicibet_videos_anonymous_delete" ON storage.objects;

-- Crear políticas de Storage para videos en el bucket cicibet-storage
-- ✅ Política 1: Lectura pública de videos
CREATE POLICY "cicibet_videos_public_read" ON storage.objects 
  FOR SELECT 
  TO public
  USING (bucket_id = 'cicibet-storage');

-- ✅ Política 2: Subida anónima de videos
CREATE POLICY "cicibet_videos_anonymous_upload" ON storage.objects 
  FOR INSERT 
  TO public
  WITH CHECK (bucket_id = 'cicibet-storage');

-- ✅ Política 3: Actualización anónima de videos
CREATE POLICY "cicibet_videos_anonymous_update" ON storage.objects 
  FOR UPDATE 
  TO public
  USING (bucket_id = 'cicibet-storage');

-- ✅ Política 4: Eliminación anónima de videos
CREATE POLICY "cicibet_videos_anonymous_delete" ON storage.objects 
  FOR DELETE 
  TO public
  USING (bucket_id = 'cicibet-storage');

-- ===================================================================
-- PARTE 5: DOCUMENTACIÓN Y COMENTARIOS
-- ===================================================================

-- Comentarios para la tabla de videos
COMMENT ON TABLE public.videos IS 'Tabla para almacenar videos promocionales generados con Veo 3.1';
COMMENT ON COLUMN public.videos.video_url IS 'URL pública del video en Supabase Storage';
COMMENT ON COLUMN public.videos.thumbnail_url IS 'URL del thumbnail del video (opcional)';
COMMENT ON COLUMN public.videos.storage_path IS 'Ruta del archivo de video en Supabase Storage para eliminación';
COMMENT ON COLUMN public.videos.look_ids IS 'Array JSON con los IDs de los looks usados para generar este video';
COMMENT ON COLUMN public.videos.prompt_used IS 'Prompt completo usado para generar el video con Veo 3.1';
COMMENT ON COLUMN public.videos.status IS 'Estado del video: processing, completed, failed';
COMMENT ON COLUMN public.videos.error_message IS 'Mensaje de error si el video falló al generarse';

-- ===================================================================
-- PARTE 6: VERIFICACIÓN (Opcional - Descomenta para verificar)
-- ===================================================================

-- Verificar que la tabla fue creada correctamente
-- SELECT 
--     table_name,
--     column_name,
--     data_type,
--     is_nullable
-- FROM information_schema.columns
-- WHERE table_schema = 'public' 
--   AND table_name = 'videos'
-- ORDER BY ordinal_position;

-- Verificar que el bucket fue creado/actualizado correctamente
-- SELECT 
--     name,
--     public,
--     file_size_limit,
--     allowed_mime_types
-- FROM storage.buckets 
-- WHERE name IN ('cicibet-storage', 'chic-pic-images');

-- Verificar las políticas de storage creadas
-- SELECT 
--     policyname, 
--     cmd, 
--     permissive,
--     roles::text
-- FROM pg_policies 
-- WHERE tablename = 'objects' 
--   AND schemaname = 'storage'
--   AND policyname LIKE 'cicibet_%'
-- ORDER BY policyname;

-- ===================================================================
-- ✅ CONFIGURACIÓN COMPLETA PARA VIDEOS
-- ===================================================================
-- Después de ejecutar este script:
-- 1. ✅ Tabla 'videos' creada con todos los campos necesarios
-- 2. ✅ Índices creados para optimizar consultas
-- 3. ✅ RLS habilitado con políticas permisivas para desarrollo
-- 4. ✅ Bucket 'cicibet-storage' configurado para videos (50MB límite)
-- 5. ✅ Políticas de storage permiten acceso anónimo a videos
-- 6. ✅ Documentación completa añadida
-- 
-- Tu base de datos está lista para almacenar videos generados con Veo 3.1 🎬✨
-- ===================================================================

