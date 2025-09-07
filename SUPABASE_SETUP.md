# 🚀 Configuración de Supabase para Chic Pic

Este documento te guía para configurar Supabase como base de datos principal, reemplazando LocalStorage y usando imágenes en base64.

## 📋 Requisitos Previos

1. **Cuenta de Supabase**: Crear cuenta en [supabase.com](https://supabase.com)
2. **Google Gemini API**: Tener tu API key de Google Gemini (Nano Banana)

## 🗄️ Configuración de Base de Datos

### 1. Crear Proyecto en Supabase

1. Ve a [supabase.com](https://supabase.com) y crea un nuevo proyecto
2. Anota la URL del proyecto y la clave pública (anon key)
3. Ve al editor SQL de tu proyecto

### 2. Ejecutar Schema SQL

Copia y pega el contenido del archivo `supabase-schema.sql` en el editor SQL de Supabase y ejecútalo:

```sql
-- El archivo contiene:
-- ✅ Tablas: garments, models, styled_looks
-- ✅ Índices optimizados para rendimiento
-- ✅ Políticas de seguridad (RLS)
-- ✅ Campos para imágenes en base64
```

### 3. Verificar Tablas Creadas

Deberías ver estas tablas en tu panel de Supabase:
- `garments` - Prendas de vestir
- `models` - Modelos de fashion
- `styled_looks` - Looks estilizados (combinaciones)

## 🔧 Configuración de Variables de Entorno

### 1. Crear archivo `.env.local`

```env
# Google Gemini API (Nano Banana)
GOOGLE_API_KEY=tu_api_key_de_google_gemini
NEXT_PUBLIC_GOOGLE_API_KEY=tu_api_key_de_google_gemini

# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_clave_publica_anonima_de_supabase
```

### 2. Obtener Credenciales de Supabase

1. **URL del Proyecto**: En tu dashboard de Supabase, ve a Settings > API
2. **Anon Key**: Copia la clave pública (anon/public key)

### 3. Configurar API Key de Google Gemini

1. Ve a [Google AI Studio](https://aistudio.google.com/)
2. Genera una API key para Gemini
3. Asegúrate de tener acceso a `gemini-2.5-flash-image-preview` (Nano Banana)

## 🖼️ Sistema de Imágenes en Base64

### Cambios Principales

- **Antes**: Imágenes guardadas como archivos JPG en `public/generated-images/`
- **Ahora**: Imágenes almacenadas como base64 en la base de datos de Supabase

### Ventajas del Nuevo Sistema

1. **📦 Todo en Supabase**: Una sola fuente de datos
2. **🌐 Sin dependencias de archivos**: No necesitas gestionar archivos
3. **🔄 Sincronización**: Los datos están siempre sincronizados
4. **☁️ Escalabilidad**: Aprovecha la infraestructura de Supabase

## 🚀 Ejecutar la Aplicación

### 1. Instalar Dependencias

```bash
npm install
```

### 2. Verificar Variables de Entorno

```bash
# Verifica que tu .env.local esté configurado correctamente
cat .env.local
```

### 3. Ejecutar en Desarrollo

```bash
npm run dev
```

### 4. Probar la Conexión

1. Abre [http://localhost:3000](http://localhost:3000)
2. Ve a cualquier sección (Prendas, Modelos, Estilista)
3. Si ves errores de conexión, revisa las variables de entorno

## 🧪 Pruebas de Funcionalidad

### Test Básico de Conexión

1. **Crear una Prenda**:
   - Ve a "Generar Prenda"
   - Llena el formulario
   - Genera la prenda
   - Verifica que aparezca en "Mi Guardarropa"

2. **Crear un Modelo**:
   - Ve a "Generar Modelo"
   - Llena el formulario
   - Genera el modelo
   - Verifica que aparezca en "Catálogo de Modelos"

3. **Crear un Look**:
   - Ve a "Estilista de Moda"
   - Selecciona un modelo y prendas
   - Genera el look
   - Verifica que aparezca en los looks generados

## 🔍 Solución de Problemas

### Error: "No se puede conectar con Supabase"

1. Verifica que las variables `NEXT_PUBLIC_SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_ANON_KEY` estén correctas
2. Asegúrate de que las tablas estén creadas en Supabase
3. Verifica que las políticas RLS estén habilitadas

### Error: "Nano Banana no disponible"

1. Verifica que `GOOGLE_API_KEY` esté configurada
2. Asegúrate de tener acceso a `gemini-2.5-flash-image-preview`
3. Si no tienes acceso, la app funcionará con placeholders

### Imágenes no se muestran

1. Las imágenes ahora son base64, no URLs
2. Verifica que el componente esté usando `src={imageUrl}` donde `imageUrl` es base64
3. El formato debe ser: `data:image/jpeg;base64,/9j/4AAQSkZJRg...`

## 📊 Monitoreo y Mantenimiento

### Ver Datos en Supabase

1. Ve a tu proyecto en Supabase
2. Navega a "Table Editor"
3. Revisa las tablas `garments`, `models`, `styled_looks`

### Límites y Consideraciones

1. **Tamaño de Base64**: Las imágenes base64 son ~33% más grandes
2. **Límite de Supabase**: Verifica los límites de tu plan de Supabase
3. **Rendimiento**: Para muchas imágenes, considera optimización

## 🆘 Soporte

Si encuentras problemas:

1. Revisa los logs del navegador (F12 → Console)
2. Verifica los logs de Supabase en tu dashboard
3. Asegúrate de que todas las variables de entorno estén configuradas
4. Verifica que las tablas y políticas estén correctamente creadas

---

¡Tu aplicación Chic Pic ahora está completamente integrada con Supabase! 🎉
