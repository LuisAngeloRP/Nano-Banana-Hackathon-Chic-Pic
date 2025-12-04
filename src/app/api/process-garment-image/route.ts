import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI, GenerativeModel } from '@google/generative-ai';

// Configuración de Gemini API
const API_KEY = process.env.GOOGLE_API_KEY || '';

let genAI: GoogleGenerativeAI | null = null;
let textModel: GenerativeModel | null = null;
let imageModel: GenerativeModel | null = null;

// Inicializar modelos si hay API key
if (API_KEY) {
  genAI = new GoogleGenerativeAI(API_KEY);
  textModel = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
  try {
    imageModel = genAI.getGenerativeModel({ 
      model: 'gemini-2.5-flash-image-preview',
      generationConfig: {
        maxOutputTokens: 8192,
        temperature: 0.7,
        topP: 0.8,
        topK: 40,
      }
    });
  } catch (error) {
    console.warn('⚠️ Nano Banana no disponible:', error);
    imageModel = null;
  }
}

// Función para cargar imagen desde URL y convertirla a base64
async function loadImageFromUrl(imageUrl: string): Promise<{data: string, mimeType: string} | null> {
  try {
    const response = await fetch(imageUrl);
    if (!response.ok) {
      return null;
    }
    
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const base64Data = buffer.toString('base64');
    
    let mimeType = response.headers.get('content-type') || 'image/jpeg';
    if (!mimeType.startsWith('image/')) {
      if (imageUrl.includes('.png')) mimeType = 'image/png';
      else if (imageUrl.includes('.webp')) mimeType = 'image/webp';
      else if (imageUrl.includes('.gif')) mimeType = 'image/gif';
      else mimeType = 'image/jpeg';
    }
    
    return { data: base64Data, mimeType };
  } catch (error) {
    console.error('Error cargando imagen:', error);
    return null;
  }
}

// Función para analizar la imagen y generar descripción automática
async function analyzeGarmentImage(imageData: {data: string, mimeType: string}, annotations?: string): Promise<{
  name: string;
  description: string;
  category: string;
  color: string;
  availableSizes: string[];
} | null> {
  if (!textModel) {
    return null;
  }

  try {
    const analysisPrompt = `Analiza esta imagen de una prenda de ropa para niños y genera una descripción completa y profesional.

${annotations ? `INSTRUCCIONES ESPECIALES: ${annotations}\n\n` : ''}

IMPORTANTE: Esta es una imagen de moda infantil. Analiza la prenda específica indicada en las instrucciones (si las hay) o la prenda principal visible.

Genera un JSON con la siguiente estructura:
{
  "name": "Nombre descriptivo de la prenda (ej: Camiseta blanca básica, Pantalón azul marino, Vestido rosa con flores)",
  "description": "Descripción detallada de la prenda incluyendo material, estilo, diseño, detalles decorativos, ocasión de uso, etc.",
  "category": "Una de estas categorías: camiseta, pantalon, vestido, falda, camisa, chaqueta, zapatos, accesorios",
  "color": "Color principal o colores principales separados por comas (ej: Blanco, Azul marino, Rosa con flores blancas)",
  "availableSizes": ["Tallas sugeridas basadas en el tamaño aparente de la prenda. Usa formato: XS, S, M, L, XL para ropa o números como 20, 22, 24, 26, 28, 30, 32, 34, 36, 38, 40 para zapatos"]
}

Responde SOLO con el JSON válido, sin texto adicional.`;

    const result = await textModel.generateContent({
      contents: [{
        role: 'user',
        parts: [
          { text: analysisPrompt },
          {
            inlineData: {
              data: imageData.data,
              mimeType: imageData.mimeType
            }
          }
        ]
      }]
    });

    const response = await result.response;
    const text = response.text();
    
    // Extraer JSON de la respuesta
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const garmentData = JSON.parse(jsonMatch[0]);
      return garmentData;
    }

    return null;
  } catch (error) {
    console.error('Error analizando imagen:', error);
    return null;
  }
}

// Función para esperar un tiempo determinado
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Función para procesar imagen y convertirla a catálogo profesional con retry
async function processImageToCatalog(imageData: {data: string, mimeType: string}, annotations?: string, maxRetries: number = 3): Promise<string | null> {
  if (!imageModel) {
    return null;
  }

  const processingPrompt = `CREATE IMAGE: Professional children's fashion catalog photography showing a garment from front and back view in the same frame.

${annotations ? `SPECIFIC INSTRUCTIONS: ${annotations}\n\n` : ''}

REQUIREMENTS:
- Extract ONLY the specific garment mentioned in instructions (if provided) or the main garment visible
- High definition studio photography (1024x1024)
- Pure white seamless background
- Professional softbox lighting on both views
- Commercial catalog quality dual composition for children's clothing
- Front and back view of the child's garment side by side
- No human model, garment only
- Children's clothing size and proportions
- Premium fashion photography style for kids' fashion
- Sharp details and vibrant, child-friendly colors
- Clean, wrinkle-free presentation
- Garment designed specifically for children, babies, or toddlers
- Child-appropriate design and styling

GENERATE CHILDREN'S FASHION GARMENT IMAGE NOW - NO TEXT DESCRIPTION.`;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const result = await imageModel.generateContent({
        contents: [{
          role: 'user',
          parts: [
            { text: processingPrompt },
            {
              inlineData: {
                data: imageData.data,
                mimeType: imageData.mimeType
              }
            }
          ]
        }]
      });

      const response = await result.response;
      
      // VERIFICACIÓN TEMPRANA: Detectar bloqueos de seguridad ANTES de procesar
      if (response.candidates && response.candidates.length > 0) {
        const candidate = response.candidates[0] as any;
        const finishReason = candidate?.finishReason;
        
        // Si hay un bloqueo de seguridad, lanzar error descriptivo
        if (finishReason === 'IMAGE_SAFETY' || finishReason === 'SAFETY' || finishReason === 'RECITATION') {
          const finishMessage = candidate?.finishMessage || '';
          const safetyRatings = candidate?.safetyRatings || [];
          
          console.error(`🚫 BLOQUEO DE SEGURIDAD DETECTADO: ${finishReason}`);
          console.error(`   Finish message: ${finishMessage}`);
          console.error(`   Safety ratings:`, JSON.stringify(safetyRatings));
          
          const errorMessage = finishReason === 'IMAGE_SAFETY' 
            ? 'Nano Banana detectó contenido inapropiado en la imagen. Intenta con una imagen diferente o más clara de la prenda.'
            : `Nano Banana bloqueó la generación por razones de seguridad (${finishReason}). Intenta con una imagen diferente.`;
          
          throw new Error(errorMessage + (finishMessage ? ` Detalles: ${finishMessage}` : ''));
        }
      }
      
      // Extraer imagen de la respuesta
      const parts = response.candidates?.[0]?.content?.parts || [];
      
      // Logging detallado para debugging
      console.log(`📊 Respuesta de Nano Banana - Candidatos: ${response.candidates?.length || 0}, Partes: ${parts.length}`);
      
      for (const part of parts) {
        if ('inlineData' in part && part.inlineData) {
          console.log('✅ Imagen encontrada en la respuesta');
          return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
        }
      }

      // Si no hay imagen, verificar si hay texto o información de error
      const textParts = parts.filter((p: any) => p?.text);
      if (textParts.length > 0) {
        const textResponse = textParts.map((p: any) => p.text).join(' ');
        console.warn('⚠️ Nano Banana retornó texto en lugar de imagen:', textResponse.substring(0, 200));
        throw new Error(`Nano Banana no generó una imagen. Respuesta: ${textResponse.substring(0, 200)}`);
      }

      // Si no hay partes, puede ser un bloqueo silencioso
      if (parts.length === 0) {
        const candidate = response.candidates?.[0] as any;
        const finishReason = candidate?.finishReason;
        if (finishReason) {
          throw new Error(`Nano Banana bloqueó la generación. Razón: ${finishReason}`);
        }
      }

      throw new Error('Nano Banana no retornó una imagen válida. No se encontraron datos de imagen en la respuesta.');
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      const isQuotaError = errorMessage.includes('429') || 
                          errorMessage.includes('quota') || 
                          errorMessage.includes('Quota exceeded') ||
                          errorMessage.includes('Too Many Requests');
      
      if (isQuotaError && attempt < maxRetries) {
        // Extraer tiempo de espera del error si está disponible
        const retryMatch = errorMessage.match(/retry in ([\d.]+)s/i);
        const retrySeconds = retryMatch ? parseFloat(retryMatch[1]) : Math.pow(2, attempt) * 2; // Backoff exponencial: 4s, 8s, 16s
        
        console.warn(`⚠️ Cuota excedida (intento ${attempt}/${maxRetries}). Esperando ${retrySeconds}s antes de reintentar...`);
        await sleep(retrySeconds * 1000);
        continue;
      }
      
      const isSafetyError = errorMessage.includes('IMAGE_SAFETY') || 
                           errorMessage.includes('SAFETY') || 
                           errorMessage.includes('RECITATION') ||
                           errorMessage.includes('bloqueó la generación');
      
      // Si es error de seguridad, NO reintentar - es un bloqueo permanente
      if (isSafetyError) {
        console.error(`🚫 Error de seguridad detectado (intento ${attempt}):`, errorMessage);
        throw error;
      }
      
      // Si es el último intento o no es error de cuota, lanzar el error
      if (attempt === maxRetries) {
        console.error(`❌ Error procesando imagen después de ${maxRetries} intentos:`, error);
        throw error;
      }
      
      // Para otros errores, esperar un poco antes de reintentar
      console.warn(`⚠️ Error en intento ${attempt}/${maxRetries}, reintentando...`, errorMessage);
      await sleep(1000 * attempt);
    }
  }

  return null;
}

// Función para convertir base64 a Buffer (para uso en servidor)
function base64ToBuffer(base64String: string): Buffer {
  const base64Data = base64String.includes(',') 
    ? base64String.split(',')[1] 
    : base64String;
  
  return Buffer.from(base64Data, 'base64');
}

export async function POST(request: NextRequest) {
  try {
    if (!API_KEY) {
      return NextResponse.json(
        { success: false, error: 'API key no configurada' },
        { status: 500 }
      );
    }

    const body = await request.json();
    const { imageUrl, annotations } = body;

    if (!imageUrl) {
      return NextResponse.json(
        { success: false, error: 'URL de imagen requerida' },
        { status: 400 }
      );
    }

    console.log('🔄 Procesando imagen de prenda:', { imageUrl, annotations });

    // Cargar imagen desde URL
    const imageData = await loadImageFromUrl(imageUrl);
    if (!imageData) {
      return NextResponse.json(
        { success: false, error: 'Error al cargar la imagen' },
        { status: 400 }
      );
    }

    // Procesar imagen y analizar en paralelo
    let processedImageBase64: string | null = null;
    let garmentData: ReturnType<typeof analyzeGarmentImage> extends Promise<infer T> ? T : never = null;

    try {
      [processedImageBase64, garmentData] = await Promise.all([
        processImageToCatalog(imageData, annotations),
        analyzeGarmentImage(imageData, annotations)
      ]);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      const isQuotaError = errorMessage.includes('429') || 
                          errorMessage.includes('quota') || 
                          errorMessage.includes('Quota exceeded') ||
                          errorMessage.includes('Too Many Requests');
      
      const isSafetyError = errorMessage.includes('IMAGE_SAFETY') || 
                           errorMessage.includes('SAFETY') || 
                           errorMessage.includes('RECITATION') ||
                           errorMessage.includes('bloqueó la generación');
      
      if (isQuotaError) {
        return NextResponse.json(
          { 
            success: false, 
            error: 'Se ha excedido la cuota de la API. Por favor espera unos minutos antes de intentar nuevamente. Si el problema persiste, verifica tu plan de Google Gemini API.',
            quotaExceeded: true
          },
          { status: 429 }
        );
      }
      
      if (isSafetyError) {
        return NextResponse.json(
          { 
            success: false, 
            error: errorMessage,
            safetyBlocked: true
          },
          { status: 400 }
        );
      }
      
      throw error;
    }

    if (!processedImageBase64) {
      return NextResponse.json(
        { success: false, error: 'Error al procesar la imagen con IA. No se pudo generar la imagen procesada.' },
        { status: 500 }
      );
    }

    // Convertir base64 a Buffer para subir directamente
    const imageBuffer = base64ToBuffer(processedImageBase64);
    const filename = `garment-processed-${Date.now()}.jpg`;
    
    // Subir directamente usando el buffer con Supabase
    const { supabase } = await import('@/lib/supabase');
    const path = `garments/${filename}`;
    
    const { error: uploadError } = await supabase.storage
      .from('chic-pic-images')
      .upload(path, imageBuffer, {
        contentType: 'image/jpeg',
        upsert: false
      });
    
    if (uploadError) {
      return NextResponse.json(
        { success: false, error: uploadError.message },
        { status: 500 }
      );
    }
    
    // Obtener URL pública
    const { data: urlData } = supabase.storage
      .from('chic-pic-images')
      .getPublicUrl(path);
    
    const processedImageUrl = urlData.publicUrl;

    console.log('✅ Imagen procesada y subida:', processedImageUrl);

    return NextResponse.json({
      success: true,
      processedImageUrl: processedImageUrl,
      storagePath: path,
      garmentData: garmentData || {
        name: 'Prenda procesada',
        description: 'Prenda procesada con IA',
        category: 'camiseta',
        color: 'No especificado',
        availableSizes: ['S', 'M', 'L']
      }
    });

  } catch (error) {
    console.error('❌ Error en process-garment-image:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Error desconocido al procesar imagen'
      },
      { status: 500 }
    );
  }
}

