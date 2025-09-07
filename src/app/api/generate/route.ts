import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { generateFileName, createLocalPlaceholder } from '@/lib/imageStorage.server';
import { buildNanoBananaPrompt, GENERATION_PARAMS } from '@/lib/nanoBanana';
import { 
  processNanoBananaResponse, 
  validateNanoBananaImage, 
  buildNanoBananaResponse,
  logNanoBananaActivity 
} from '@/lib/nanoBananaHandler';
import { 
  buildModelPrompt, 
  sanitizeModelDescription, 
  validateModelDescription,
  MODEL_GENERATION_CONFIG 
} from '@/lib/nanoBananaModels';

// Configuración de Gemini API
const API_KEY = process.env.GOOGLE_API_KEY || '';

let genAI: GoogleGenerativeAI | null = null;
let textModel: any = null;
let imageModel: any = null;

// Inicializar modelos si hay API key
if (API_KEY) {
  genAI = new GoogleGenerativeAI(API_KEY);
  // Modelo para texto (Gemini 1.5 Flash)
  textModel = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
  // Modelo para imágenes (Nano Banana - Gemini 2.5 Flash Image Preview)
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
    console.log('🍌 Nano Banana (Gemini 2.5 Flash Image Preview) inicializado correctamente');
  } catch (error) {
    console.warn('⚠️ Nano Banana no disponible, usando fallback:', error);
    imageModel = null;
  }
}

// Función para generar con Nano Banana con reintentos para modelos
async function generateWithNanoBanana(
  type: 'garment' | 'model' | 'look',
  description: string,
  filename: string,
  garmentUrl?: string,
  modelUrl?: string
) {
  if (!imageModel) {
    throw new Error('Nano Banana no disponible');
  }

  const isModelGeneration = type === 'model';
  const maxRetries = isModelGeneration ? MODEL_GENERATION_CONFIG.maxRetries : 1;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`🍌 Intento ${attempt}/${maxRetries} - Enviando prompt a Nano Banana...`);
      
      // Construir prompt según el tipo y el intento
      let prompt: string;
      if (type === 'model') {
        // Validar y limpiar descripción del modelo
        const validation = validateModelDescription(description);
        const sanitizedDescription = sanitizeModelDescription(description);
        
        if (!validation.isValid && attempt === 1) {
          console.warn('⚠️ Descripción de modelo tiene problemas:', validation.issues);
        }
        
        prompt = buildModelPrompt(sanitizedDescription, attempt);
        console.log('🧹 Descripción sanitizada para modelo:', sanitizedDescription);
      } else if (type === 'garment') {
        prompt = buildNanoBananaPrompt('garment', description);
      } else {
        prompt = buildNanoBananaPrompt('styling', description, `Garment URL: ${garmentUrl}, Model URL: ${modelUrl}`);
      }
      
      console.log('📝 Prompt optimizado:', prompt.substring(0, 100) + '...');
      
      // Generar imagen con Nano Banana
      const result = await imageModel.generateContent({
        contents: [{
          role: 'user',
          parts: [{
            text: prompt
          }]
        }]
      });
      
      const response = await result.response;
      console.log('✅ Respuesta de Nano Banana recibida');
      
      // Procesar respuesta
      const processedResponse = processNanoBananaResponse(
        response, 
        type, 
        description, 
        filename
      );
      
      logNanoBananaActivity('response_processed', type, processedResponse.hasImage, {
        debugInfo: processedResponse.debugInfo,
        attempt
      });
      
      if (processedResponse.hasImage && processedResponse.imageData && processedResponse.mimeType) {
        // ¡Éxito! Validar imagen antes de guardar
        if (!validateNanoBananaImage(processedResponse.mimeType, processedResponse.imageData)) {
          console.warn(`❌ Intento ${attempt}: Imagen no pasó validación`);
          if (attempt < maxRetries) {
            continue; // Reintentar
          }
          throw new Error('Imagen no pasó validación después de todos los intentos');
        }
        
        // Guardar imagen real
        const imageData = `data:${processedResponse.mimeType};base64,${processedResponse.imageData}`;
        const { saveRealImageLocally } = await import('@/lib/imageStorage.server');
        const localUrl = await saveRealImageLocally(imageData, filename);
        
        logNanoBananaActivity('image_saved', type, true, {
          filename: filename.replace('.svg', '.jpg'),
          mimeType: processedResponse.mimeType,
          size: processedResponse.imageData.length,
          attempt
        });
        
        return {
          success: true,
          imageUrl: localUrl,
          filename: filename.replace('.svg', '.jpg'),
          aiDescription: `Imagen real generada con Nano Banana (intento ${attempt}): ${description}`,
          message: '🍌 ¡Imagen generada con Nano Banana real y guardada!',
          isRealImage: true,
          model: 'gemini-2.5-flash-image-preview',
          attempts: attempt
        };
        
      } else {
        console.warn(`⚠️ Intento ${attempt}: Nano Banana no devolvió imagen`);
        if (attempt < maxRetries) {
          console.log(`🔄 Reintentando con prompt alternativo...`);
          continue; // Reintentar
        }
        
        // Último intento fallido
        return {
          success: false,
          textResponse: processedResponse.textResponse,
          message: `Nano Banana procesó el prompt pero no generó imagen después de ${attempt} intento(s).`,
          attempts: attempt
        };
      }
      
    } catch (error) {
      console.error(`❌ Error en intento ${attempt}:`, error);
      if (attempt < maxRetries) {
        console.log(`🔄 Reintentando debido a error...`);
        continue; // Reintentar
      }
      throw error; // Último intento, propagar error
    }
  }
  
  throw new Error('Se agotaron todos los intentos');
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, description, garmentUrl, modelUrl } = body;
    
    console.log(`🎨 Generando imagen de ${type}:`, description);
    
    // Validar tipo
    if (!['garment', 'model', 'look'].includes(type)) {
      return NextResponse.json({
        success: false,
        error: 'Tipo de generación no válido'
      }, { status: 400 });
    }
    
    // Generar nombre de archivo
    const filename = generateFileName(type, description);
    
    // Si no hay API key, usar placeholder
    if (!API_KEY) {
      const localUrl = createLocalPlaceholder(type as 'garment' | 'model' | 'look', description, filename);
      return NextResponse.json({
        success: true,
        imageUrl: localUrl,
        filename,
        message: 'Imagen placeholder generada (configura API key para generación real)'
      });
    }
    
    // Intentar generar con Nano Banana
    if (imageModel) {
      try {
        const result = await generateWithNanoBanana(
          type as 'garment' | 'model' | 'look',
          description,
          filename,
          garmentUrl,
          modelUrl
        );
        
        if (result.success) {
          return NextResponse.json(buildNanoBananaResponse(true, result));
        } else {
          // Nano Banana falló, usar placeholder con información
          const localUrl = createLocalPlaceholder(type as 'garment' | 'model' | 'look', description, filename);
          
          return NextResponse.json(buildNanoBananaResponse(true, {
            imageUrl: localUrl,
            filename,
            aiDescription: result.textResponse || 'Sin descripción disponible',
            message: result.message,
            isRealImage: false
          }));
        }
        
      } catch (error) {
        console.error('❌ Error con Nano Banana:', error);
        
        // Fallback a modelo de texto
        if (textModel) {
          console.log('🔄 Fallback: Usando modelo de texto...');
          
          try {
            const prompt = buildNanoBananaPrompt(
              type === 'model' ? 'model' : type === 'garment' ? 'garment' : 'styling',
              description
            );
            
            const result = await textModel.generateContent([prompt]);
            const response = await result.response;
            const text = response.text();
            
            const localUrl = createLocalPlaceholder(type as 'garment' | 'model' | 'look', description, filename);
            
            return NextResponse.json(buildNanoBananaResponse(true, {
              imageUrl: localUrl,
              filename,
              aiDescription: text.substring(0, 200) + '...',
              message: 'Nano Banana falló. Descripción generada con IA + placeholder.',
              isRealImage: false
            }));
            
          } catch (textError) {
            console.error('❌ Error con modelo de texto:', textError);
          }
        }
        
        // Último recurso: placeholder básico
        const localUrl = createLocalPlaceholder(type as 'garment' | 'model' | 'look', description, filename);
        
        return NextResponse.json(buildNanoBananaResponse(true, {
          imageUrl: localUrl,
          filename,
          message: 'Error en generación. Usando placeholder básico.',
          isRealImage: false
        }));
      }
    }
    
    // Si no hay modelo de imagen, usar placeholder
    const localUrl = createLocalPlaceholder(type as 'garment' | 'model' | 'look', description, filename);
    
    return NextResponse.json(buildNanoBananaResponse(true, {
      imageUrl: localUrl,
      filename,
      message: 'Nano Banana no disponible. Usando placeholder.',
      isRealImage: false
    }));
    
  } catch (error) {
    console.error('❌ Error general en la API:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Error interno del servidor',
      details: error instanceof Error ? error.message : 'Error desconocido'
    }, { status: 500 });
  }
}
