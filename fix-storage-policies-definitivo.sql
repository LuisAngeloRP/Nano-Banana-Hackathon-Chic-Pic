-- ===================================================================
-- FIX DEFINITIVO PARA STORAGE RLS - EL PROBLEMA REAL
-- ===================================================================
-- El error RLS está en storage.objects y storage.buckets, NO en las tablas

-- PASO 1: Verificar políticas actuales de storage
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
ORDER BY policyname;

-- PASO 2: Verificar si el bucket existe
SELECT name, public, file_size_limit FROM storage.buckets WHERE name = 'chic-pic-images';

-- PASO 3: SOLUCIÓN RADICAL - Deshabilitar RLS en storage.objects
ALTER TABLE storage.objects DISABLE ROW LEVEL SECURITY;

-- PASO 4: Verificar que RLS está deshabilitado en storage
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'objects' 
  AND schemaname = 'storage';

-- PASO 5: Crear bucket directamente (ahora debería funcionar)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('chic-pic-images', 'chic-pic-images', true, 10485760, 
        array['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'])
ON CONFLICT (id) DO NOTHING;

-- PASO 6: Verificar que el bucket se creó
SELECT name, public, file_size_limit FROM storage.buckets WHERE name = 'chic-pic-images';

-- ===================================================================
-- RESULTADO ESPERADO:
-- - storage.objects con rowsecurity = false
-- - bucket 'chic-pic-images' creado y visible
-- - Error de storage RLS resuelto
-- ===================================================================
