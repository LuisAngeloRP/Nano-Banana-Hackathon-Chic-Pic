# 📈 Cómo Aumentar los Límites de Google Gemini API

## 🔍 Entendiendo el Sistema de Google Gemini API

Google Gemini API **NO funciona como OpenAI** con créditos prepagados. En su lugar, usa el sistema de facturación de **Google Cloud Platform** con pago por uso (pay-as-you-go).

## 🆓 Tier Gratuito vs Facturación

### Tier Gratuito (Google AI Studio)
- ✅ Sin tarjeta de crédito requerida
- ❌ Límites muy estrictos (cuota diaria y por minuto limitada)
- ❌ Ideal solo para pruebas y desarrollo

### Facturación Habilitada (Google Cloud Platform)
- ✅ Límites mucho más altos
- ✅ $300 USD de créditos gratuitos para nuevos usuarios
- ✅ Pago solo por lo que usas después de los créditos gratuitos
- ✅ Muy económico comparado con alternativas

## 🚀 Pasos para Aumentar los Límites

### Paso 1: Crear Proyecto en Google Cloud Console

1. Ve a [Google Cloud Console](https://console.cloud.google.com/)
2. Inicia sesión con tu cuenta Google
3. Crea un nuevo proyecto:
   - Haz clic en el selector de proyectos (arriba)
   - Clic en "New Project"
   - Nombre: "cicibet" o el que prefieras
   - Clic en "Create"

### Paso 2: Habilitar la API de Gemini

1. En Google Cloud Console, ve a **"APIs & Services" > "Library"**
2. Busca **"Generative Language API"** o **"Gemini API"**
3. Haz clic en el resultado
4. Clic en **"Enable"**

### Paso 3: Habilitar Facturación

1. Ve a **"Billing"** en el menú lateral
2. Clic en **"Link a billing account"**
3. Si no tienes cuenta de facturación:
   - Clic en "Create billing account"
   - Completa la información
   - Agrega método de pago (tarjeta de crédito)
   - **¡No te preocupes!** Google ofrece $300 USD de créditos gratuitos

### Paso 4: Configurar Cuotas (Opcional)

1. Ve a **"APIs & Services" > "Quotas"**
2. Busca **"Generative Language API"**
3. Filtra por:
   - **Service**: Generative Language API
   - **Quota**: Requests per minute, Requests per day, etc.
4. Selecciona las cuotas que quieres aumentar
5. Clic en **"Edit Quotas"**
6. Solicita el aumento deseado
7. Google revisará tu solicitud (generalmente aprobada rápidamente)

### Paso 5: Crear API Key del Proyecto

1. Ve a **"APIs & Services" > "Credentials"**
2. Clic en **"Create Credentials" > "API Key"**
3. Copia la nueva API Key
4. (Opcional) Restringe la API Key para mayor seguridad:
   - Clic en la API Key creada
   - En "API restrictions", selecciona "Restrict key"
   - Selecciona solo "Generative Language API"
   - Guarda

### Paso 6: Actualizar tu Aplicación

1. Reemplaza tu API Key actual en `.env.local`:
   ```bash
   GOOGLE_API_KEY=tu_nueva_api_key_del_proyecto_cloud
   ```

2. Reinicia tu aplicación:
   ```bash
   npm run dev
   ```

## 💰 Costos Estimados

### Créditos Gratuitos
- **$300 USD** de créditos gratuitos para nuevos usuarios
- Válidos por 90 días
- Se aplican automáticamente a tu facturación

### Precios (después de créditos gratuitos)
- **Gemini 2.5 Flash**: Muy económico por request
- **Gemini 2.5 Flash Image Preview (Nano Banana)**: Gratis en tier gratuito, pero con límites
- Los precios son por uso, no hay cuotas mensuales fijas

### Comparación de Costos
- **Sesión fotográfica profesional**: $5,000 - $50,000 USD
- **Google Gemini API**: Céntimos por imagen generada
- **ROI**: Inmensamente mejor que alternativas tradicionales

## ⚠️ Notas Importantes

1. **Los $300 USD de créditos gratuitos** son solo para nuevos usuarios de Google Cloud
2. **No hay créditos prepagados** como en OpenAI - es pago por uso
3. **Los límites aumentan automáticamente** cuando habilitas facturación
4. **Puedes solicitar aumentos de cuota** si necesitas más límites
5. **Monitorea tu uso** en Google Cloud Console > Billing

## ⚠️ PROBLEMA COMÚN: Ya Tengo Créditos pero Sigo con Límites

### 🔍 Diagnóstico

Si ya tienes créditos activos en Google Cloud pero sigues teniendo límites, **probablemente estás usando una API Key del tier gratuito de Google AI Studio** en lugar de una API Key de tu proyecto de Google Cloud.

### ✅ Solución: Usar API Key del Proyecto de Cloud

**IMPORTANTE:** Hay DOS lugares donde puedes obtener API Keys:

1. **Google AI Studio** (https://aistudio.google.com/) - Tier gratuito con límites estrictos ❌
2. **Google Cloud Console** (https://console.cloud.google.com/) - Con facturación y límites altos ✅

### 🔧 Pasos para Solucionar

1. **Ve a Google Cloud Console** (NO Google AI Studio)
   - https://console.cloud.google.com/
   - Selecciona el proyecto que tiene los créditos activos

2. **Verifica que la API esté habilitada**
   - Ve a "APIs & Services" > "Enabled APIs"
   - Busca "Generative Language API"
   - Si no está, habilítala desde "APIs & Services" > "Library"

3. **Verifica que la facturación esté asociada**
   - Ve a "Billing"
   - Asegúrate de que tu proyecto tenga una cuenta de facturación asociada
   - Si no, asóciala desde "Billing" > "Link billing account"

4. **Crea una NUEVA API Key desde Cloud Console**
   - Ve a "APIs & Services" > "Credentials"
   - Clic en "Create Credentials" > "API Key"
   - **IMPORTANTE:** Esta API Key será diferente a la de AI Studio
   - Copia esta nueva API Key

5. **Reemplaza la API Key en tu aplicación**
   ```bash
   # En .env.local
   GOOGLE_API_KEY=tu_nueva_api_key_del_cloud_console
   ```

6. **Reinicia tu aplicación**
   ```bash
   npm run dev
   ```

### 🔍 Cómo Verificar que Funciona

1. **Verifica en Cloud Console:**
   - Ve a "APIs & Services" > "Quotas"
   - Busca "Generative Language API"
   - Deberías ver límites mucho más altos que el tier gratuito

2. **Monitorea el uso:**
   - Ve a "Billing" > "Reports"
   - Deberías ver el uso de "Generative Language API"
   - Los créditos se aplicarán automáticamente

### 📊 Límites Esperados

**Tier Gratuito (AI Studio):**
- ~15 requests por minuto
- ~1,500 requests por día
- Límites muy estrictos

**Con Facturación (Cloud Console):**
- 60+ requests por minuto (o más según solicites)
- 10,000+ requests por día (o más según solicites)
- Límites mucho más altos

### 🆘 Si Aún Tienes Problemas

1. **Verifica el proyecto correcto:**
   - Asegúrate de estar en el proyecto que tiene los créditos
   - Verifica en "Billing" que el proyecto esté asociado

2. **Solicita aumento de cuota:**
   - Ve a "APIs & Services" > "Quotas"
   - Selecciona las cuotas de "Generative Language API"
   - Clic en "Edit Quotas"
   - Solicita el aumento deseado

3. **Verifica la API Key:**
   - En "Credentials", verifica que la API Key esté activa
   - Asegúrate de que no tenga restricciones que bloqueen el uso

## 🔗 Enlaces Útiles

- [Google Cloud Console](https://console.cloud.google.com/)
- [Google AI Studio](https://aistudio.google.com/) (solo para pruebas)
- [Documentación de Gemini API](https://ai.google.dev/docs)
- [Precios de Gemini API](https://ai.google.dev/pricing)
- [Solicitar Aumento de Cuota](https://console.cloud.google.com/apis/api/generativelanguage.googleapis.com/quotas)
- [Verificar Uso y Facturación](https://console.cloud.google.com/billing)

## 📞 Soporte

Si tienes problemas:
1. Verifica que estés usando la API Key correcta del Cloud Console
2. Asegúrate de que la facturación esté asociada al proyecto
3. Verifica que la API esté habilitada en el proyecto correcto
4. Revisa los límites en "APIs & Services" > "Quotas"
5. Contacta al soporte de Google Cloud si es necesario

