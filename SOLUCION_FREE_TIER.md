# 🔧 Solución: Proyecto Usando Free Tier en Lugar de Paid Tier

## 🔍 Diagnóstico del Problema

Si ves en tus cuotas de Google Cloud:
- ❌ **"Request limit per model per day for a project in the free tier"** = 250 requests/día
- ✅ Deberías tener: **"Request limit per model per minute for a project in the paid tier 1"** = 500+ requests/minuto

**Esto significa que tu proyecto está usando el tier gratuito aunque tengas créditos activos.**

## ✅ Solución Paso a Paso

### Paso 1: Verificar Facturación del Proyecto

1. Ve a [Google Cloud Console](https://console.cloud.google.com/)
2. Selecciona el proyecto que tiene los créditos (S/.1,010.43)
3. Ve a **"Billing"** en el menú lateral
4. **VERIFICA** que aparezca:
   - ✅ "Billing account: [Tu cuenta]"
   - ✅ "Status: Active"
5. Si dice **"No billing account"** o **"Billing not enabled"**:
   - Clic en "Link a billing account"
   - Selecciona tu cuenta de facturación con los créditos
   - Guarda

### Paso 2: Habilitar la API Correctamente

1. Ve a **"APIs & Services" > "Enabled APIs"**
2. Busca **"Generative Language API"**
3. Si NO está en la lista:
   - Ve a "APIs & Services" > "Library"
   - Busca "Generative Language API"
   - Clic en "Enable"
   - Espera 1-2 minutos para que se active

### Paso 3: Solicitar Aumento de Cuota (CRÍTICO)

El problema principal es la cuota de "free tier". Necesitas solicitar que se aumente:

1. Ve a **"APIs & Services" > "Quotas"**
2. En el buscador, escribe: `generativelanguage`
3. Busca específicamente:
   - **"Request limit per model per day for a project in the free tier"**
   - Model: `gemini-2.5-flash`
4. Selecciona esta cuota (marca la casilla)
5. Clic en **"Edit Quotas"** (botón azul arriba)
6. En "New limit", escribe: **10000** (o más según necesites)
7. En "Justification", escribe:
   ```
   Necesito aumentar el límite para producción. Tengo créditos activos 
   (S/.1,010.43) y facturación habilitada. El proyecto necesita más 
   capacidad para procesar imágenes de moda infantil.
   ```
8. Clic en "Submit request"
9. Google generalmente aprueba en **minutos u horas**

### Paso 4: Verificar API Key Correcta

1. Ve a **"APIs & Services" > "Credentials"**
2. Verifica que tu API Key esté ahí
3. Si no está, crea una nueva:
   - Clic en "Create Credentials" > "API Key"
   - Copia la nueva API Key
4. Actualiza `.env.local`:
   ```bash
   GOOGLE_API_KEY=tu_api_key_aqui
   ```

### Paso 5: Esperar y Verificar

1. **Espera 5-10 minutos** después de asociar facturación
2. Ve a **"APIs & Services" > "Quotas"** de nuevo
3. Deberías ver cambios:
   - ✅ Las cuotas de "paid tier" deberían estar activas
   - ✅ Los límites deberían ser mucho más altos
   - ❌ La cuota de "free tier" debería desaparecer o aumentar significativamente

### Paso 6: Reiniciar Aplicación

```bash
# Detén el servidor (Ctrl+C)
# Reinicia
npm run dev
```

## 📊 Cuotas Esperadas Después de la Solución

**Antes (Free Tier):**
- ❌ 250 requests/día para gemini-2.5-flash
- ❌ Límites muy bajos

**Después (Paid Tier con Facturación):**
- ✅ 500+ requests/minuto para gemini-2.5-flash-preview-image
- ✅ 1,000+ requests/minuto para gemini-2.5-flash
- ✅ 10,000+ requests/día (según lo que solicites)
- ✅ Límites mucho más altos

## ⚠️ Notas Importantes

1. **El cambio puede tardar unos minutos** en aplicarse después de asociar facturación
2. **La solicitud de aumento de cuota** puede tardar minutos u horas en aprobarse
3. **Asegúrate de usar la API Key del proyecto Cloud**, no de AI Studio
4. **Monitorea el uso** en "Billing" > "Reports" para ver que los créditos se están usando

## 🔗 Enlaces Directos

- [Ver Cuotas Actuales](https://console.cloud.google.com/apis/api/generativelanguage.googleapis.com/quotas)
- [Ver Facturación](https://console.cloud.google.com/billing)
- [Ver API Key](https://console.cloud.google.com/apis/credentials)
- [Habilitar API](https://console.cloud.google.com/apis/library/generativelanguage.googleapis.com)

## 🆘 Si Aún No Funciona

1. **Verifica que el proyecto correcto esté seleccionado** (el que tiene los créditos)
2. **Espera más tiempo** (hasta 30 minutos) para que los cambios se apliquen
3. **Contacta soporte de Google Cloud** si la solicitud de aumento de cuota no se aprueba en 24 horas
4. **Verifica que la API Key no tenga restricciones** que bloqueen el uso

