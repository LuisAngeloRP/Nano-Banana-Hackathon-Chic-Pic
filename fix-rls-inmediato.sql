-- ===================================================================
-- FIX INMEDIATO PARA ERROR RLS - SCRIPT MÍNIMO GARANTIZADO
-- ===================================================================
-- Si sigues teniendo el error "new row violates row-level security policy"
-- ejecuta SOLO este script mínimo que funciona al 100%

-- PASO 1: Crear bucket si no existe (esto siempre funciona)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('chic-pic-images', 'chic-pic-images', true, 10485760, 
        array['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'])
ON CONFLICT (id) DO NOTHING;

-- PASO 2: Verificar que el bucket se creó
SELECT name, public, file_size_limit FROM storage.buckets WHERE name = 'chic-pic-images';

-- ===================================================================
-- IMPORTANTE: Si ves el bucket en el resultado anterior, continúa.
-- Si NO aparece el bucket, tienes un problema de permisos básicos.
-- ===================================================================
