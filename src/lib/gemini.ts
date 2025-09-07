import { GoogleGenerativeAI } from '@google/generative-ai';
import { createCustomPlaceholder } from './imageStorage.client';

// Configuración de Gemini API
const API_KEY = process.env.GOOGLE_API_KEY || process.env.NEXT_PUBLIC_GOOGLE_API_KEY || '';

let genAI: GoogleGenerativeAI | null = null;
let textModel: any = null;
let imageModel: any = null;

// Inicializar solo si tenemos API key
if (API_KEY) {
  genAI = new GoogleGenerativeAI(API_KEY);
  // Modelo para texto (Gemini 2.5 Flash)
  textModel = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
  // Modelo para imágenes (Nano Banana - Gemini 2.5 Flash Image)
  imageModel = genAI.getGenerativeModel({ model: 'gemini-2.5-flash-image-preview' });
}

// Prompts estándar para mantener consistencia de estilo
export const GARMENT_PROMPT_BASE = `
Genera una imagen de alta calidad de una prenda de vestir para catálogo de moda.
La imagen debe tener:
- Fondo blanco limpio y neutro
- Iluminación profesional y uniforme
- Estilo de fotografía de catálogo comercial
- La prenda debe estar bien presentada y visible
- Resolución alta y nítida
- Sin modelos, solo la prenda
- Estilo realista y profesional
`;

export const MODEL_PROMPT_BASE = `
Genera una imagen de alta calidad de un modelo para catálogo de moda.
La imagen debe tener:
- Fondo blanco limpio y neutro
- Iluminación profesional de estudio
- Pose natural y profesional para catálogo
- Expresión neutra y elegante
- Resolución alta y nítida
- Estilo de fotografía comercial de moda
- El modelo debe verse profesional y estar en ropa interior neutra o básica
`;

export const STYLING_PROMPT_BASE = `
Combina de manera realista una prenda de vestir con un modelo para crear una imagen de catálogo de moda.
La imagen final debe tener:
- Fondo blanco limpio y neutro
- Iluminación profesional y uniforme
- La prenda debe verse natural en el modelo
- Pose elegante y profesional
- Estilo de fotografía de catálogo comercial
- Resolución alta y nítida
- El ajuste de la ropa debe verse realista y natural
`;


export async function generateGarmentImage(description: string): Promise<string> {
  try {
    console.log('🎨 Generando imagen de prenda:', description);
    
    // Llamar a la API route del servidor para manejar la generación y almacenamiento
    const response = await fetch('/api/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        type: 'garment',
        description
      })
    });

    const data = await response.json();
    
    if (data.success) {
      console.log('✅ Imagen generada y guardada:', data.filename);
      return data.imageUrl;
    } else {
      console.warn('⚠️ Usando fallback:', data.message);
      // Fallback a placeholder directo
      return createCustomPlaceholder('garment', description);
    }
    
  } catch (error) {
    console.error('❌ Error generando imagen de prenda:', error);
    // Último fallback
    return createCustomPlaceholder('garment', description);
  }
}

export async function generateModelImage(characteristics: string): Promise<string> {
  try {
    console.log('👤 Generando imagen de modelo:', characteristics);
    
    // Llamar a la API route del servidor
    const response = await fetch('/api/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        type: 'model',
        description: characteristics
      })
    });

    const data = await response.json();
    
    if (data.success) {
      console.log('✅ Imagen generada y guardada:', data.filename);
      return data.imageUrl;
    } else {
      console.warn('⚠️ Usando fallback:', data.message);
      return createCustomPlaceholder('model', characteristics);
    }
    
  } catch (error) {
    console.error('❌ Error generando imagen de modelo:', error);
    return createCustomPlaceholder('model', characteristics);
  }
}

export async function generateStyledImage(garmentUrl: string, modelUrl: string, instructions: string): Promise<string> {
  try {
    console.log('✨ Generando look combinado:', instructions);
    
    // Llamar a la API route del servidor
    const response = await fetch('/api/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        type: 'look',
        description: instructions,
        garmentUrl,
        modelUrl
      })
    });

    const data = await response.json();
    
    if (data.success) {
      console.log('✅ Imagen generada y guardada:', data.filename);
      return data.imageUrl;
    } else {
      console.warn('⚠️ Usando fallback:', data.message);
      return createCustomPlaceholder('look', instructions);
    }
    
  } catch (error) {
    console.error('❌ Error generando imagen combinada:', error);
    return createCustomPlaceholder('look', instructions);
  }
}

// Función para verificar si la API está configurada correctamente
export function isAPIConfigured(): boolean {
  return !!API_KEY;
}

// Función para obtener información sobre la configuración
export function getAPIStatus() {
  return {
    hasAPIKey: !!API_KEY,
    hasTextModel: !!textModel,
    hasImageModel: !!imageModel,
    apiKeyLength: API_KEY ? API_KEY.length : 0
  };
}