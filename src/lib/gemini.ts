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
CREATE IMAGE: Professional garment photography showing front and back view in same frame for fashion catalog.
- White background clean neutral
- Professional uniform lighting both views
- Commercial catalog photography style
- Garment well presented visible front and back
- High resolution sharp entire composition
- No models, garment only front and back view
- Realistic professional style consistent both perspectives
- Balanced composition showing front and back clearly
GENERATE GARMENT IMAGE NOW - NO TEXT DESCRIPTION.
`;

export const MODEL_PROMPT_BASE = `
CREATE IMAGE: Professional full body model in underwear for fashion styling.
- White background clean neutral
- Professional studio lighting
- Natural professional pose catalog showing complete figure
- Neutral elegant expression
- High resolution sharp
- Commercial fashion photography style full body
- Model professional head to feet
- Complete figure visible in frame
- Model wearing ONLY basic underwear (bra/panties for women, briefs for men)
- NO outer clothing, ready for garment styling
GENERATE FULL BODY MODEL IN UNDERWEAR NOW - NO TEXT DESCRIPTION.
`;

export const STYLING_PROMPT_BASE = `
CREATE IMAGE: Realistic combination garment with model for fashion catalog.
- White background clean neutral
- Professional uniform lighting
- Garment natural on model
- Elegant professional pose
- Commercial catalog photography style
- High resolution sharp
- Clothing fit realistic natural
GENERATE STYLED FASHION IMAGE NOW - NO TEXT DESCRIPTION.
`;


// Interface para datos estructurados de prenda
interface GarmentData {
  name: string;
  description: string;
  category: string;
  color?: string;
  size?: string | string[]; // Admitir tanto string como array para retrocompatibilidad
}

export async function generateGarmentImage(
  garmentData: GarmentData | string
): Promise<string> {
  try {
    // Si recibimos string (retrocompatibilidad), convertir a objeto
    let structuredData: GarmentData;
    if (typeof garmentData === 'string') {
      structuredData = {
        name: 'Prenda personalizada',
        description: garmentData,
        category: 'general',
        color: '',
        size: []
      };
    } else {
      structuredData = garmentData;
    }

    console.log('🎨 Generando imagen de prenda:', structuredData);
    
    // Construir descripción completa incluyendo todos los datos
    const completeDescription = buildCompleteGarmentDescription(structuredData);
    
    // Llamar a la API route del servidor para manejar la generación y almacenamiento
    const response = await fetch('/api/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        type: 'garment',
        description: completeDescription,
        garmentData: structuredData // Enviar datos estructurados también
      })
    });

    const data = await response.json();
    
    if (data.success) {
      console.log('✅ Imagen generada y guardada:', data.filename);
      return data.imageUrl;
    } else {
      console.warn('⚠️ Usando fallback:', data.message);
      // Fallback a placeholder directo
      return createCustomPlaceholder('garment', completeDescription);
    }
    
  } catch (error) {
    console.error('❌ Error generando imagen de prenda:', error);
    // Último fallback
    const desc = typeof garmentData === 'string' ? garmentData : garmentData.description;
    return createCustomPlaceholder('garment', desc);
  }
}

// Función para construir descripción completa de prenda
function buildCompleteGarmentDescription(data: GarmentData): string {
  const parts = [];
  
  // Nombre y categoría siempre van primero
  parts.push(`${data.category.toUpperCase()}: ${data.name}`);
  
  // Color si está especificado
  if (data.color && data.color.trim()) {
    parts.push(`Color principal: ${data.color}`);
  }
  
  // Tallas si están especificadas
  if (data.size) {
    if (Array.isArray(data.size) && data.size.length > 0) {
      parts.push(`Tallas disponibles: ${data.size.join(', ')}`);
    } else if (typeof data.size === 'string' && data.size.trim()) {
      parts.push(`Talla: ${data.size}`);
    }
  }
  
  // Descripción detallada
  parts.push(`Descripción: ${data.description}`);
  
  return parts.join(' | ');
}

// Interface para datos estructurados de modelo
interface ModelData {
  name: string;
  characteristics: string;
  gender: string;
  age?: string;
  height?: string;
  bodyType?: string;
  hairColor?: string;
  eyeColor?: string;
  skinTone?: string;
}

export async function generateModelImage(
  modelData: ModelData | string
): Promise<string> {
  try {
    // Si recibimos string (retrocompatibilidad), convertir a objeto
    let structuredData: ModelData;
    if (typeof modelData === 'string') {
      structuredData = {
        name: 'Modelo personalizado',
        characteristics: modelData,
        gender: 'Unisex'
      };
    } else {
      structuredData = modelData;
    }

    console.log('👤 Generando imagen de modelo:', structuredData);
    
    // Construir descripción completa incluyendo todos los datos
    const completeDescription = buildCompleteModelDescription(structuredData);
    
    // Llamar a la API route del servidor
    const response = await fetch('/api/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        type: 'model',
        description: completeDescription,
        modelData: structuredData // Enviar datos estructurados también
      })
    });

    const data = await response.json();
    
    if (data.success) {
      console.log('✅ Imagen generada y guardada:', data.filename);
      return data.imageUrl;
    } else {
      console.warn('⚠️ Usando fallback:', data.message);
      return createCustomPlaceholder('model', completeDescription);
    }
    
  } catch (error) {
    console.error('❌ Error generando imagen de modelo:', error);
    const desc = typeof modelData === 'string' ? modelData : modelData.characteristics;
    return createCustomPlaceholder('model', desc);
  }
}

// Función para construir descripción completa de modelo
function buildCompleteModelDescription(data: ModelData): string {
  const parts = [];
  
  // Nombre y género
  parts.push(`MODEL: ${data.name} - Gender: ${data.gender}`);
  
  // Características físicas si están especificadas
  if (data.age) parts.push(`Age: ${data.age}`);
  if (data.height) parts.push(`Height: ${data.height}`);
  if (data.bodyType) parts.push(`Body type: ${data.bodyType}`);
  if (data.hairColor) parts.push(`Hair color: ${data.hairColor}`);
  if (data.eyeColor) parts.push(`Eye color: ${data.eyeColor}`);
  if (data.skinTone) parts.push(`Skin tone: ${data.skinTone}`);
  
  // Características adicionales
  parts.push(`Additional features: ${data.characteristics}`);
  
  return parts.join(' | ');
}

// Interface para datos de styling inteligente
interface StylingData {
  modelUrl: string;
  garments: Array<{
    imageUrl: string;
    category: string;
    name: string;
    color?: string;
  }>;
  lookName?: string;
  lookDescription?: string;
}

export async function generateStyledImage(
  stylingData: StylingData | {garmentUrl: string, modelUrl: string, instructions: string}
): Promise<string> {
  try {
    // Retrocompatibilidad con la interfaz anterior
    if ('garmentUrl' in stylingData && 'instructions' in stylingData) {
      console.log('✨ Generando look combinado (modo legacy):', stylingData.instructions);
      
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'look',
          description: stylingData.instructions,
          garmentUrl: stylingData.garmentUrl,
          modelUrl: stylingData.modelUrl
        })
      });

      const data = await response.json();
      if (data.success) {
        return data.imageUrl;
      } else {
        return createCustomPlaceholder('look', stylingData.instructions);
      }
    }

    // Nuevo modo: combinación inteligente de imágenes
    console.log('✨ Generando look combinado con imágenes:', stylingData);
    
    // Construir instrucciones inteligentes basadas en las categorías
    const intelligentInstructions = buildIntelligentStylingInstructions(stylingData);
    
    // Llamar a la API route del servidor con datos estructurados
    const response = await fetch('/api/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        type: 'look',
        description: intelligentInstructions,
        modelUrl: stylingData.modelUrl,
        garments: stylingData.garments,
        stylingData: stylingData // Datos completos para procesamiento
      })
    });

    const data = await response.json();
    
    if (data.success) {
      console.log('✅ Look inteligente generado:', data.filename);
      return data.imageUrl;
    } else {
      console.warn('⚠️ Usando fallback:', data.message);
      return createCustomPlaceholder('look', intelligentInstructions);
    }
    
  } catch (error) {
    console.error('❌ Error generando look combinado:', error);
    const fallbackDesc = 'garmentUrl' in stylingData ? 
      stylingData.instructions : 
      stylingData.lookDescription || 'Look personalizado';
    return createCustomPlaceholder('look', fallbackDesc);
  }
}

// Función para construir instrucciones inteligentes de styling
function buildIntelligentStylingInstructions(data: StylingData): string {
  // Analizar tipos de prendas para determinar el mensaje específico
  const garmentTypes = data.garments.map(g => g.category.toLowerCase());
  const hasUpper = garmentTypes.some(t => ['camiseta', 'camisa', 'chaqueta'].includes(t));
  const hasLower = garmentTypes.some(t => ['pantalon', 'falda'].includes(t));
  const hasDress = garmentTypes.some(t => ['vestido'].includes(t));
  
  let message = 'Viste a la modelo con las prendas brindadas.';
  
  // Agregar especificidad si es necesario
  if (hasDress) {
    message = 'Viste a la modelo con el vestido brindado.';
  } else if (hasUpper && !hasLower) {
    message = 'Viste a la modelo con la prenda superior brindada.';
  } else if (hasLower && !hasUpper) {
    message = 'Viste a la modelo con la prenda inferior brindada.';
  }
  
  // Agregar instrucción de ajuste perfecto
  message += ' La ropa debe ajustarse perfectamente al cuerpo del modelo.';
  
  // Agregar instrucción adicional del campo lookDescription si existe
  if (data.lookDescription && data.lookDescription.trim()) {
    message += ` ${data.lookDescription}`;
  }
  
  message += ' Imagen de catálogo profesional con fondo blanco.';
  
  return message;
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