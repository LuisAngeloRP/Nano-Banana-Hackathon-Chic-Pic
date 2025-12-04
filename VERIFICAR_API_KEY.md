# 🔍 Guía Rápida: Verificar que Estás Usando la API Key Correcta

## ⚠️ Problema: Tengo Créditos pero Sigo con Límites

Si ya tienes créditos activos en Google Cloud pero sigues recibiendo errores de cuota, hay dos posibles causas:

1. **Estás usando la API Key incorrecta** (de AI Studio en lugar de Cloud Console)
2. **El proyecto está usando el "free tier" en lugar del "paid tier"** (más común)

## 🎯 Solución: Cambiar de Free Tier a Paid Tier

Si ves en tus cuotas:
- ❌ "Request limit per model per day for a project in the **free tier**" = 250 requests/día
- ✅ Deberías tener: "Request limit per model per minute for a project in the **paid tier 1**" = 500+ requests/minuto

**Esto significa que tu proyecto está usando el tier gratuito aunque tengas créditos.**

## 🎯 Solución Rápida (5 minutos)

### Paso a) Verificar tu API Key Actual

1. Abre tu archivo `.env.local` o `.env`
2. Copia el valor de `GOOGLE_API_KEY`
3. Ve a [Google Cloud Console](https://console.cloud.google.com/)
4. Ve a "APIs & Services" > "Credentials"
5. Busca tu API Key en la lista
6. **Si NO aparece aquí**, significa que es una API Key de Google AI Studio (tier gratuito)

### b) Crear Nueva API Key del Proyecto Cloud

1. **Ve a Google Cloud Console** (NO Google AI Studio)
   - https://console.cloud.google.com/
   - Selecciona el proyecto que tiene los créditos (S/.1,010.43)

2. **Habilita la API** (si no está habilitada):
   - Ve a "APIs & Services" > "Library"
   - Busca "Generative Language API"
   - Clic en "Enable"

3. **Crea nueva API Key**:
   - Ve a "APIs & Services" > "Credentials"
   - Clic en "Create Credentials" > "API Key"
   - Copia la nueva API Key (empieza con `AIza...`)

4. **Actualiza tu aplicación**:
   ```bash
   # Edita .env.local
   GOOGLE_API_KEY=tu_nueva_api_key_aqui
   ```

5. **Reinicia**:
   ```bash
   npm run dev
   ```

## ✅ Verificación

### Verificar que Funciona:

1. **Intenta procesar una imagen**
2. **Ve a Cloud Console > Billing > Reports**
3. **Deberías ver uso de "Generative Language API"**
4. **Los créditos se aplicarán automáticamente**

### Verificar Límites:

1. Ve a "APIs & Services" > "Quotas"
2. Busca "Generative Language API"
3. Deberías ver límites mucho más altos que antes

## 🔑 Diferencias Clave

| Característica | Google AI Studio | Google Cloud Console |
|----------------|-----------------|----------------------|
| **URL** | aistudio.google.com | console.cloud.google.com |
| **Límites** | Muy bajos (tier gratuito) | Altos (con facturación) |
| **Créditos** | No aplica | Sí aplica ($300 USD) |
| **Para Producción** | ❌ No | ✅ Sí |

## 🆘 Si Aún No Funciona

1. **Verifica el proyecto:**
   - Asegúrate de estar en el proyecto correcto
   - El proyecto debe tener facturación asociada

2. **Solicita aumento de cuota:**
   - Ve a "APIs & Services" > "Quotas"
   - Selecciona "Generative Language API"
   - Solicita aumento de "Requests per minute" y "Requests per day"

3. **Espera unos minutos:**
   - Los cambios pueden tardar unos minutos en aplicarse
   - Intenta de nuevo después de 5-10 minutos

