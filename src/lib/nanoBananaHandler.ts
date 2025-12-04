// Manejador específico para respuestas de Nano Banana (Gemini 2.5 Flash Image Preview - Free Tier)
import { EnhancedGenerateContentResponse } from '@google/generative-ai';

export interface NanoBananaResponse {
  success: boolean;
  imageUrl?: string;
  filename?: string;
  message: string;
  isRealImage: boolean;
  model?: string;
  aiDescription?: string;
  error?: string;
  debugInfo?: Record<string, unknown>;
}

export interface NanoBananaImagePart {
  inlineData?: {
    mimeType: string;
    data: string;
  };
  text?: string;
}

export interface NanoBananaCandidate {
  content?: {
    parts: NanoBananaImagePart[];
  };
}

// Función para procesar respuesta de Nano Banana
export function processNanoBananaResponse(
  response: EnhancedGenerateContentResponse,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _type: 'garment' | 'model' | 'look',
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _description: string,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _filename: string
): {
  hasImage: boolean;
  imageData?: string;
  mimeType?: string;
  textResponse?: string;
  debugInfo: Record<string, unknown>;
} {
  const debugInfo: Record<string, unknown> = {
    hasResponse: !!response,
    hasCandidates: !!(response?.candidates),
    candidatesLength: response?.candidates?.length || 0,
    timestamp: new Date().toISOString()
  };

  try {
    const candidates = response?.candidates;
    
    if (!candidates || candidates.length === 0) {
      return {
        hasImage: false,
        textResponse: 'No se recibieron candidatos de respuesta',
        debugInfo: { ...debugInfo, error: 'No candidates' }
      };
    }

    const candidate = candidates[0] as NanoBananaCandidate;
    const parts = candidate.content?.parts || [];

    debugInfo.partsLength = parts.length;
    debugInfo.partsTypes = parts.map(part => {
      if (part.inlineData) return 'image';
      if (part.text) return 'text';
      return 'unknown';
    });

    // Buscar imagen en las partes
    for (const part of parts) {
      if (part.inlineData && part.inlineData.data) {
        return {
          hasImage: true,
          imageData: part.inlineData.data,
          mimeType: part.inlineData.mimeType,
          debugInfo: { ...debugInfo, imageFound: true, mimeType: part.inlineData.mimeType }
        };
      }
    }

    // Si no hay imagen, buscar texto
    const textParts = parts.filter(part => part.text);
    const textResponse = textParts.map(part => part.text).join(' ');

    return {
      hasImage: false,
      textResponse,
      debugInfo: { ...debugInfo, textLength: textResponse.length, textPreview: textResponse.substring(0, 100) }
    };

  } catch (error) {
    return {
      hasImage: false,
      textResponse: 'Error procesando respuesta de Nano Banana',
      debugInfo: { 
        ...debugInfo, 
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      }
    };
  }
}

// Función para validar formato de imagen de Nano Banana
export function validateNanoBananaImage(mimeType: string, data: string): boolean {
  // Verificar que el mimeType sea válido
  const validMimeTypes = [
    'image/jpeg',
    'image/jpg', 
    'image/png',
    'image/webp',
    'image/gif'
  ];

  if (!validMimeTypes.includes(mimeType.toLowerCase())) {
    console.warn('❌ Tipo MIME no válido:', mimeType);
    return false;
  }

  // Verificar que los datos base64 sean válidos
  if (!data || typeof data !== 'string') {
    console.warn('❌ Datos de imagen inválidos');
    return false;
  }

  // Verificar formato base64 básico
  const base64Regex = /^[A-Za-z0-9+/]*={0,2}$/;
  if (!base64Regex.test(data)) {
    console.warn('❌ Datos base64 inválidos');
    return false;
  }

  // Verificar tamaño mínimo (debe tener al menos algunos KB)
  if (data.length < 1000) {
    console.warn('❌ Imagen demasiado pequeña, posible error');
    return false;
  }

  return true;
}

// Función para generar metadata de imagen
export function generateImageMetadata(
  type: 'garment' | 'model' | 'look',
  description: string,
  mimeType: string,
  size: number
) {
  return {
    type,
    description,
    mimeType,
    size,
    generatedWith: 'gemini-2.5-flash-image-preview',
    timestamp: new Date().toISOString(),
    version: '1.0'
  };
}

// Función para construir respuesta estándar
export function buildNanoBananaResponse(
  success: boolean,
  data: Partial<NanoBananaResponse>
): NanoBananaResponse {
  return {
    success,
    isRealImage: false,
    message: 'Error desconocido',
    ...data
  };
}

// Constantes para configuración
export const NANO_BANANA_CONFIG = {
  model: 'gemini-2.5-flash-image-preview',
  maxRetries: 3,
  timeoutMs: 30000,
  supportedMimeTypes: ['image/jpeg', 'image/png', 'image/webp'],
  maxImageSize: 10 * 1024 * 1024, // 10MB
  minImageSize: 1000 // 1KB
};

// Función para logs estructurados
export function logNanoBananaActivity(
  action: string,
  type: 'garment' | 'model' | 'look',
  success: boolean,
  details?: Record<string, unknown>
) {
  const logData = {
    timestamp: new Date().toISOString(),
    action,
    type,
    success,
    model: NANO_BANANA_CONFIG.model,
    ...details
  };

  if (success) {
    console.log(`🍌 Nano Banana ${action}:`, logData);
  } else {
    console.error(`❌ Nano Banana ${action} falló:`, logData);
  }

  return logData;
}
