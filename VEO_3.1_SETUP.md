# Configuración de Veo 3.1 para Generación de Videos

## ⚠️ Importante

**Veo 3.1 NO está disponible a través de la API de Gemini estándar (`@google/generative-ai`).**

Veo 3.1 requiere **Vertex AI** y usa el método `predictLongRunning` en lugar de `generateContent`.

## Requisitos

1. **Google Cloud Project** con Vertex AI habilitado
2. **Google Cloud Storage** bucket para almacenar videos generados
3. **Vertex AI SDK** en lugar de Google Generative AI SDK
4. **Autenticación** con Google Cloud (Service Account o Application Default Credentials)

## Modelos Disponibles

- `veo-3.1-generate-preview` - Generación estándar
- `veo-3.1-fast-generate-preview` - Generación rápida

## Implementación con Vertex AI

### 1. Instalar Vertex AI SDK

```bash
npm install @google-cloud/aiplatform
```

### 2. Configurar Variables de Entorno

```env
GOOGLE_CLOUD_PROJECT_ID=tu-proyecto-id
GOOGLE_CLOUD_LOCATION=us-central1
GOOGLE_CLOUD_STORAGE_BUCKET=tu-bucket-name
GOOGLE_APPLICATION_CREDENTIALS=/ruta/a/service-account-key.json
```

### 3. Ejemplo de Código

```typescript
import { PredictionServiceClient } from '@google-cloud/aiplatform';

const client = new PredictionServiceClient({
  apiEndpoint: 'us-central1-aiplatform.googleapis.com',
});

async function generateVideoWithVeo(prompt: string) {
  const projectId = process.env.GOOGLE_CLOUD_PROJECT_ID;
  const location = process.env.GOOGLE_CLOUD_LOCATION || 'us-central1';
  const model = 'veo-3.1-generate-preview';
  const bucket = process.env.GOOGLE_CLOUD_STORAGE_BUCKET;

  const request = {
    endpoint: `projects/${projectId}/locations/${location}/publishers/google/models/${model}`,
    instances: [
      {
        prompt: prompt,
      },
    ],
    parameters: {
      storageUri: `gs://${bucket}/videos/`,
      sampleCount: 1,
    },
  };

  // Iniciar operación de larga duración
  const [operation] = await client.predictLongRunning(request);
  
  // Esperar a que complete
  const [response] = await operation.promise();
  
  // El video estará en Google Cloud Storage
  return response;
}
```

## Alternativa: Usar API REST Directamente

Si prefieres usar REST en lugar del SDK:

```bash
POST https://us-central1-aiplatform.googleapis.com/v1/projects/PROJECT_ID/locations/us-central1/publishers/google/models/veo-3.1-generate-preview:predictLongRunning

Headers:
  Authorization: Bearer YOUR_ACCESS_TOKEN
  Content-Type: application/json

Body:
{
  "instances": [
    {
      "prompt": "Tu descripción del video"
    }
  ],
  "parameters": {
    "storageUri": "gs://BUCKET_NAME/videos/",
    "sampleCount": 1
  }
}
```

## Documentación Oficial

- [Generar Videos con Veo en Vertex AI](https://cloud.google.com/vertex-ai/generative-ai/docs/video/generate-videos-from-text)
- [Vertex AI SDK para Node.js](https://cloud.google.com/nodejs/docs/reference/aiplatform/latest)

## Nota sobre la Implementación Actual

La implementación actual en `src/app/api/generate-video/route.ts` intenta usar la API de Gemini estándar, pero esto no funcionará para Veo 3.1. 

Para habilitar Veo 3.1 completamente, necesitarías:

1. Migrar a Vertex AI SDK
2. Configurar Google Cloud Storage
3. Implementar el método `predictLongRunning`
4. Manejar operaciones asíncronas de larga duración

## Alternativa Temporal

Si no puedes configurar Vertex AI ahora, puedes:

1. Usar la generación de imágenes con Nano Banana para crear un "storyboard" de frames
2. Combinar los frames en un video usando herramientas como FFmpeg
3. O esperar a que Veo 3.1 esté disponible en la API de Gemini estándar (si Google lo hace disponible)

