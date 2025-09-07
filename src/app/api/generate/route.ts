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

// Configuración de Gemini API
const API_KEY = process.env.GOOGLE_API_KEY || '';

let genAI: GoogleGenerativeAI | null = null;
let textModel: any = null;
let imageModel: any = null;

// Inicializar modelos si hay API key
if (API_KEY) {
  genAI = new GoogleGenerativeAI(API_KEY);
  // Modelo para texto (Gemini 1.5 Flash)
  textModel = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
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

// Prompts estándar
const GARMENT_PROMPT_BASE = `
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

const MODEL_PROMPT_BASE = `
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

const STYLING_PROMPT_BASE = `
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

// POST /api/generate - Generar imagen
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, description, garmentUrl, modelUrl } = body;

    console.log(`🎨 Generando imagen de ${type}:`, description);

    let prompt = '';
    let filename = '';

    // Configurar según el tipo con prompts optimizados para Nano Banana
    switch (type) {
      case 'garment':
        prompt = buildNanoBananaPrompt('garment', description);
        filename = generateFileName('garment', description);
        break;
        
      case 'model':
        prompt = buildNanoBananaPrompt('model', description);
        filename = generateFileName('model', description);
        break;
        
      case 'look':
        prompt = buildNanoBananaPrompt('styling', description, `Garment URL: ${garmentUrl}, Model URL: ${modelUrl}`);
        filename = generateFileName('look', description);
        break;
        
      default:
        return NextResponse.json({
          success: false,
          error: 'Tipo de generación no válido'
        }, { status: 400 });
    }

    // Si no hay API key, usar placeholder local
    if (!API_KEY) {
      console.warn('⚠️ API key no configurada. Usando placeholder local.');
      const localUrl = createLocalPlaceholder(type as 'garment' | 'model' | 'look', description, filename);
      
      return NextResponse.json({
        success: true,
        imageUrl: localUrl,
        filename,
        message: 'Imagen placeholder generada (configura API key para generación real)'
      });
    }

    // Intentar generar con Nano Banana (Gemini 2.5 Flash Image Preview)
    if (imageModel) {
      try {
        console.log('🍌 Enviando prompt a Nano Banana (Gemini 2.5 Flash Image Preview)...');
        console.log('📝 Prompt optimizado:', prompt.substring(0, 100) + '...');
        
        // Generar imagen real con Nano Banana
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
        
        // Procesar respuesta usando el handler especializado
        const processedResponse = processNanoBananaResponse(
          response, 
          type as 'garment' | 'model' | 'look', 
          description, 
          filename
        );
        
        logNanoBananaActivity('response_processed', type as 'garment' | 'model' | 'look', processedResponse.hasImage, {
          debugInfo: processedResponse.debugInfo
        });
        
        if (processedResponse.hasImage && processedResponse.imageData && processedResponse.mimeType) {
          // Validar imagen antes de guardar
          if (!validateNanoBananaImage(processedResponse.mimeType, processedResponse.imageData)) {
            console.warn('❌ Imagen de Nano Banana no pasó validación');
            const localUrl = createLocalPlaceholder(type as 'garment' | 'model' | 'look', description, filename);
            
            return NextResponse.json(buildNanoBananaResponse(true, {
              imageUrl: localUrl,
              filename,
              message: 'Imagen generada pero no pasó validación. Usando placeholder.',
              isRealImage: false
            }));
          }
          
          try {
            // Guardar imagen real
            const imageData = `data:${processedResponse.mimeType};base64,${processedResponse.imageData}`;
            const { saveRealImageLocally } = await import('@/lib/imageStorage.server');
            const localUrl = await saveRealImageLocally(imageData, filename);
            
            logNanoBananaActivity('image_saved', type as 'garment' | 'model' | 'look', true, {
              filename: filename.replace('.svg', '.jpg'),
              mimeType: processedResponse.mimeType,
              size: processedResponse.imageData.length
            });
            
            return NextResponse.json(buildNanoBananaResponse(true, {
              imageUrl: localUrl,
              filename: filename.replace('.svg', '.jpg'),
              aiDescription: `Imagen real generada con Nano Banana: ${description}`,
              message: '🍌 ¡Imagen generada con Nano Banana real y guardada!',
              isRealImage: true,
              model: 'gemini-2.5-flash-image-preview'
            }));
            
          } catch (saveError) {
            logNanoBananaActivity('save_failed', type as 'garment' | 'model' | 'look', false, {
              error: saveError instanceof Error ? saveError.message : 'Unknown error'
            });
            
            const localUrl = createLocalPlaceholder(type as 'garment' | 'model' | 'look', description, filename);
            
            return NextResponse.json(buildNanoBananaResponse(true, {
              imageUrl: localUrl,
              filename,
              message: 'Imagen generada con Nano Banana pero error al guardar. Usando placeholder.',
              isRealImage: false
            }));
          }
        } else {
          // No se encontró imagen, usar respuesta de texto si está disponible
          console.warn('⚠️ Nano Banana no devolvió imagen');
          
          const localUrl = createLocalPlaceholder(type as 'garment' | 'model' | 'look', description, filename);
          
          return NextResponse.json(buildNanoBananaResponse(true, {
            imageUrl: localUrl,
            filename,
            aiDescription: processedResponse.textResponse || 'Sin descripción disponible',
            message: 'Nano Banana procesó el prompt pero no generó imagen. Usando placeholder.',
            isRealImage: false
          }));
        }
        
      } catch (error) {
        console.error('❌ Error con Nano Banana:', error);
        
        // Si Nano Banana falla, intentar con modelo de texto como fallback
        if (textModel) {
          console.log('🔄 Fallback: Usando modelo de texto...');
          
          try {
            const result = await textModel.generateContent([prompt]);
            const response = await result.response;
            const aiDescription = response.text();
            
            const localUrl = createLocalPlaceholder(type as 'garment' | 'model' | 'look', description, filename);
            
            return NextResponse.json({
              success: true,
              imageUrl: localUrl,
              filename,
              aiDescription: aiDescription.substring(0, 200) + '...',
              message: 'Nano Banana no disponible. Usando generación con texto IA.'
            });
          } catch (textError) {
            console.error('❌ Error con modelo de texto:', textError);
          }
        }
        
        // Si llegamos aquí, todos los métodos fallaron
        // Si es error 403, dar mensaje específico
        if (error instanceof Error && error.message.includes('403')) {
          console.warn('🔑 Error 403: Problema con API key para Nano Banana');
          const localUrl = createLocalPlaceholder(type as 'garment' | 'model' | 'look', description, filename);
          
          return NextResponse.json({
            success: true,
            imageUrl: localUrl,
            filename,
            message: 'Error 403: Verifica acceso a Nano Banana. Usando placeholder.'
          });
        }
        
        // Fallback final a placeholder
        const localUrl = createLocalPlaceholder(type as 'garment' | 'model' | 'look', description, filename);
        
        return NextResponse.json({
          success: true,
          imageUrl: localUrl,
          filename,
          message: 'Error en Nano Banana. Usando placeholder.'
        });
      }
    }

    // Fallback final
    const localUrl = createLocalPlaceholder(type as 'garment' | 'model' | 'look', description, filename);
    
    return NextResponse.json({
      success: true,
      imageUrl: localUrl,
      filename,
      message: 'Modelo IA no disponible. Usando placeholder.'
    });

  } catch (error) {
    console.error('❌ Error en API de generación:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Error interno del servidor',
      details: error instanceof Error ? error.message : 'Error desconocido'
    }, { status: 500 });
  }
}

// GET /api/generate - Verificar estado del servicio
export async function GET() {
  return NextResponse.json({
    success: true,
    hasAPIKey: !!API_KEY,
    hasTextModel: !!textModel,
    hasImageModel: !!imageModel,
    message: 'Servicio de generación disponible'
  });
}
