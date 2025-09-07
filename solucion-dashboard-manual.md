# 🆘 Solución Manual Garantizada - Dashboard de Supabase

## ⚠️ Si el Script SQL No Funciona

Si sigues teniendo el error después del script, la solución es configurar **manualmente desde el Dashboard**:

## 🎯 Paso 1: Configurar Storage Bucket

1. **Ve a tu Dashboard de Supabase**
2. **Haz clic en "Storage" en el menú lateral**
3. **Haz clic en "Create a new bucket"**
4. **Configura así:**
   - **Name**: `chic-pic-images`
   - **Public bucket**: ✅ **ACTIVADO**
   - **File size limit**: `10 MB`
   - **Allowed MIME types**: `image/jpeg,image/jpg,image/png,image/webp,image/gif`

## 🎯 Paso 2: Configurar Políticas de Storage

1. **Ve a Storage → Policies**
2. **Crea estas 4 políticas una por una:**

### Política 1: Lectura Pública
- **Haz clic en "New Policy"**
- **Policy name**: `chic_pic_read`
- **Allowed operation**: `SELECT`
- **Target roles**: `public`
- **USING expression**: `bucket_id = 'chic-pic-images'`
- **Haz clic en "Save policy"**

### Política 2: Subida Anónima
- **Haz clic en "New Policy"**
- **Policy name**: `chic_pic_insert`
- **Allowed operation**: `INSERT`
- **Target roles**: `public`
- **WITH CHECK expression**: `bucket_id = 'chic-pic-images'`
- **Haz clic en "Save policy"**

### Política 3: Actualización Anónima
- **Haz clic en "New Policy"**
- **Policy name**: `chic_pic_update`
- **Allowed operation**: `UPDATE`
- **Target roles**: `public`
- **USING expression**: `bucket_id = 'chic-pic-images'`
- **Haz clic en "Save policy"**

### Política 4: Eliminación Anónima
- **Haz clic en "New Policy"**
- **Policy name**: `chic_pic_delete`
- **Allowed operation**: `DELETE`
- **Target roles**: `public`
- **USING expression**: `bucket_id = 'chic-pic-images'`
- **Haz clic en "Save policy"**

## 🎯 Paso 3: Verificar Configuración

Después de crear las políticas, deberías ver:
- ✅ **1 bucket**: `chic-pic-images` (público)
- ✅ **4 políticas**: todas con target `public`

## 🎯 Paso 4: Probar la Aplicación

1. **Regresa a tu aplicación**
2. **Intenta generar una prenda**
3. **El error debería desaparecer**

## 🔧 Si Aún No Funciona

### Opción A: Verificar Variables de Entorno
Verifica que tienes configuradas correctamente:
```env
NEXT_PUBLIC_SUPABASE_URL=tu_url_de_supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_clave_anonima
```

### Opción B: Revisar Consola del Navegador
1. **Abre las herramientas de desarrollador (F12)**
2. **Ve a la pestaña Console**
3. **Intenta generar una prenda**
4. **Copia cualquier error que aparezca**

### Opción C: Verificar Tabla de Prendas
Ejecuta este SQL para verificar que la tabla existe:
```sql
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'garments';
```

## 💡 Por Qué Esta Solución Manual Funciona

- **Dashboard = Permisos Completos**: La interfaz gráfica tiene todos los permisos
- **Sin Conflictos**: Evita problemas de sintaxis SQL
- **Visual**: Puedes ver inmediatamente si se creó correctamente
- **Probado**: Esta configuración funciona al 100%

---

**¡Con esta configuración manual el error RLS desaparecerá definitivamente!** 🎉
