import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI, GenerativeModel, EnhancedGenerateContentResponse } from '@google/generative-ai';
import { formatImageAsDataURI, extractBase64FromDataURI, createBase64Placeholder } from '@/lib/imageStorage.client';
import { buildNanoBananaPrompt } from '@/lib/nanoBanana';
import { 
  processNanoBananaResponse, 
  validateNanoBananaImage,
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
let textModel: GenerativeModel | null = null;
let imageModel: GenerativeModel | null = null;

// Inicializar modelos si hay API key
if (API_KEY) {
  genAI = new GoogleGenerativeAI(API_KEY);
  // Modelo para texto (Gemini 2.5 Flash)
  textModel = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
  // Modelo para imágenes (Nano Banana - Gemini 2.5 Flash Image Preview - Free Tier)
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
    console.log('🍌 Nano Banana (Gemini 2.5 Flash Image Preview - Free Tier) inicializado correctamente');
  } catch (error) {
    console.warn('⚠️ Nano Banana no disponible, usando fallback:', error);
    imageModel = null;
  }
}

// Función para cargar imagen desde URL y convertirla a base64
async function loadImageFromUrl(imageUrl: string): Promise<{data: string, mimeType: string} | null> {
  try {
    console.log('📥 Descargando imagen desde URL:', imageUrl);
    
    const response = await fetch(imageUrl);
    if (!response.ok) {
      console.error('Error descargando imagen:', response.status, response.statusText);
      return null;
    }
    
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const base64Data = buffer.toString('base64');
    
    // Determinar tipo MIME desde la respuesta o URL
    let mimeType = response.headers.get('content-type') || 'image/jpeg';
    if (!mimeType.startsWith('image/')) {
      // Inferir desde la extensión de la URL
      if (imageUrl.includes('.png')) mimeType = 'image/png';
      else if (imageUrl.includes('.webp')) mimeType = 'image/webp';
      else if (imageUrl.includes('.gif')) mimeType = 'image/gif';
      else mimeType = 'image/jpeg';
    }
    
    console.log('✅ Imagen descargada y convertida a base64');
    return { data: base64Data, mimeType };
  } catch (error) {
    console.error('Error cargando imagen desde URL:', error);
    return null;
  }
}

// Función para procesar imagen base64 desde diferentes fuentes
async function processImageData(imageData: string): Promise<{data: string, mimeType: string} | null> {
  // Si es data URI (base64), extraer componentes
  if (imageData.startsWith('data:')) {
    const mimeMatch = imageData.match(/data:([^;]+);base64,/);
    const mimeType = mimeMatch ? mimeMatch[1] : 'image/jpeg';
    const base64Data = extractBase64FromDataURI(imageData);
    return { data: base64Data, mimeType };
  }
  
  // Si es URL (Supabase Storage), descargar y convertir
  if (imageData.startsWith('http')) {
    return await loadImageFromUrl(imageData);
  }
  
  // Si es base64 puro, asumir JPEG
  return { data: imageData, mimeType: 'image/jpeg' };
}

// Función para analizar imagen del modelo y extraer características visuales
async function analyzeModelImage(modelImageUrl: string): Promise<string | null> {
  if (!textModel || !modelImageUrl) {
    return null;
  }

  try {
    console.log('🔍 Analizando imagen del modelo para extraer características visuales...');
    
    // Cargar y procesar la imagen
    const imageData = await processImageData(modelImageUrl);
    if (!imageData) {
      console.error('❌ No se pudo procesar la imagen del modelo');
      return null;
    }

    // Prompt para analizar características visuales del modelo
    const analysisPrompt = `Analiza esta imagen de un modelo de moda infantil y describe en detalle las características visuales del niño/niña de forma precisa y profesional.

IMPORTANTE: Esta es una imagen de moda infantil profesional. Describe las características visuales de manera apropiada y comercial.

Incluye en tu descripción:
- Género: niño o niña
- Edad aparente aproximada (ej: bebé de 6 meses, niño de 3 años, niña de 5 años, toddler)
- Color de cabello (ej: castaño oscuro, rubio claro, negro, pelirrojo, castaño)
- Estilo y longitud del cabello (ej: cabello corto con flequillo, cabello largo liso, cabello rizado corto, cabello ondulado)
- Color de ojos (ej: café, azul claro, verde, avellana, gris)
- Tono de piel (ej: muy claro, claro, medio, moreno claro, oscuro)
- Tipo de cuerpo (ej: delgado, promedio, robusto, bebé)
- Expresión facial (ej: sonrisa alegre, expresión neutral, expresión seria)
- Características faciales notables (ej: mejillas redondas, rostro ovalado)
- Cualquier otra característica visual relevante para moda infantil

Responde SOLO con la descripción de las características visuales en español, en formato profesional para catálogo de moda infantil.

Ejemplo de formato: "Niño de aproximadamente 5 años, cabello castaño corto con flequillo, ojos café, tono de piel medio, tipo de cuerpo promedio, expresión alegre y natural."`;

    // Enviar imagen al modelo de texto para análisis
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
    const modelDescription = response.text();
    
    console.log('✅ Características del modelo extraídas:', modelDescription);
    return modelDescription;
    
  } catch (error) {
    console.error('❌ Error analizando imagen del modelo:', error);
    return null;
  }
}

// Función helper para detectar y extraer información de errores de cuota (429)
function extractQuotaErrorInfo(error: unknown): { isQuotaError: boolean; retryDelay?: number; message?: string } {
  if (!error || typeof error !== 'object') {
    return { isQuotaError: false };
  }

  const errorObj = error as Record<string, unknown>;
  
  // Verificar si es un error 429
  if (errorObj.status === 429 || (errorObj.message && String(errorObj.message).includes('429'))) {
    let retryDelay: number | undefined;
    const message = 'Cuota de API excedida. Por favor, espera antes de reintentar.';

    // Intentar extraer retryDelay del errorDetails
    if (errorObj.errorDetails && Array.isArray(errorObj.errorDetails)) {
      for (const detail of errorObj.errorDetails) {
        if (detail && typeof detail === 'object') {
          const detailObj = detail as Record<string, unknown>;
          
          // Buscar RetryInfo
          if (detailObj['@type'] === 'type.googleapis.com/google.rpc.RetryInfo') {
            const retryInfo = detailObj as { retryDelay?: string };
            if (retryInfo.retryDelay) {
              // El formato es "19s" o "19.616520489s"
              const match = retryInfo.retryDelay.match(/(\d+\.?\d*)/);
              if (match) {
                retryDelay = Math.ceil(parseFloat(match[1])) + 1; // Añadir 1 segundo de margen
              }
            }
          }
        }
      }
    }

    // También buscar en el mensaje de error directamente
    if (!retryDelay && errorObj.message) {
      const messageStr = String(errorObj.message);
      const retryMatch = messageStr.match(/retry in ([\d.]+)s/i);
      if (retryMatch) {
        retryDelay = Math.ceil(parseFloat(retryMatch[1])) + 1;
      }
    }

    return {
      isQuotaError: true,
      retryDelay,
      message: retryDelay 
        ? `Cuota excedida. Reintentando en ${retryDelay} segundos...`
        : message
    };
  }

  return { isQuotaError: false };
}

// Función helper para esperar un tiempo determinado
function sleep(seconds: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, seconds * 1000));
}

// Función para generar con Nano Banana y retornar base64
async function generateWithNanoBanana(
  type: 'garment' | 'model' | 'look',
  description: string,
  garmentImages?: string[],
  modelImage?: string,
  additionalData?: Record<string, unknown>
): Promise<{
  success: boolean;
  base64Image?: string;
  message: string;
  attempts?: number;
  blocked?: boolean;
  finishReason?: string;
  usedAlternative?: boolean;
  debugInfo?: Record<string, unknown>;
}> {
  if (!imageModel) {
    throw new Error('Nano Banana no disponible');
  }

  const isModelGeneration = type === 'model';
  const maxRetries = isModelGeneration ? MODEL_GENERATION_CONFIG.maxRetries : 3; // Aumentar retries para manejar cuotas
  
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
        // Para looks/styling, manejar el nuevo sistema inteligente
        let additionalContext = '';
        
        if (additionalData?.stylingData && additionalData?.garments) {
          // Nuevo sistema: combinación visual específica
          additionalContext = `VISUAL COMBINATION MODE:
- FIRST IMAGE: Model to be dressed (use this exact model)
- SUBSEQUENT IMAGES: Individual garments to place on the model
- TASK: Visually combine - take model from first image, take garments from other images, dress the model
- PRESERVE: Model's appearance and garment details exactly as shown
- RESULT: Single image showing the model wearing all the provided garments`;
        } else {
          // Sistema legacy
          additionalContext = `VISUAL COMBINATION: Combine model and garment images`;
        }
        
        prompt = buildNanoBananaPrompt('styling', description, additionalContext);
      }
      
      console.log('📝 Prompt optimizado:', prompt.substring(0, 100) + '...');
      
      // Preparar contenido para Nano Banana
      const contentParts: Array<{text: string} | {inlineData: {data: string, mimeType: string}}> = [{ text: prompt }];
      
      // Si es tipo 'look' y tenemos imágenes, agregarlas como input
      if (type === 'look') {
        console.log('🖼️ Procesando imágenes para combinación...');
        
        // Agregar imagen del modelo si existe
        if (modelImage) {
          const modelImageData = await processImageData(modelImage);
          if (modelImageData) {
            contentParts.push({
              inlineData: {
                data: modelImageData.data,
                mimeType: modelImageData.mimeType
              }
            });
            console.log('✅ Imagen de modelo procesada');
          } else {
            console.error('❌ Error procesando imagen de modelo');
          }
        }
        
        // Agregar imágenes de prendas si existen
        if (garmentImages && garmentImages.length > 0) {
          for (const garmentImage of garmentImages) {
            const garmentImageData = await processImageData(garmentImage);
            if (garmentImageData) {
              contentParts.push({
                inlineData: {
                  data: garmentImageData.data,
                  mimeType: garmentImageData.mimeType
                }
              });
              console.log('✅ Imagen de prenda procesada');
            } else {
              console.error('❌ Error procesando imagen de prenda');
            }
          }
        }
      }
      
      // Generar imagen con Nano Banana
      const result = await imageModel.generateContent({
        contents: [{
          role: 'user',
          parts: contentParts
        }]
      });
      
      const response = await result.response;
      console.log('✅ Respuesta de Nano Banana recibida');
      
      // VERIFICACIÓN TEMPRANA: Detectar bloqueos de seguridad ANTES de procesar
      if (response.candidates && response.candidates.length > 0) {
        const candidate = response.candidates[0] as { finishReason?: string; finishMessage?: string; safetyRatings?: unknown[] };
        const finishReason = candidate?.finishReason;
        
        // Si hay un bloqueo de seguridad, intentar alternativa sin imágenes
        if (finishReason === 'IMAGE_SAFETY' || finishReason === 'SAFETY' || finishReason === 'RECITATION') {
          const finishMessage = candidate?.finishMessage || '';
          console.error(`🚫 BLOQUEO DE SEGURIDAD DETECTADO EN INTENTO ${attempt}: ${finishReason}`);
          console.error('   Esto significa que Nano Banana detectó contenido inapropiado en las imágenes.');
          
          // Para looks con IMAGE_SAFETY, intentar generar desde cero sin combinar imágenes
          if (type === 'look' && finishReason === 'IMAGE_SAFETY' && attempt === 1 && additionalData?.stylingData) {
            console.log('💡 Intentando alternativa: generar look completo desde cero con descripción textual...');
            
            // Construir descripción completa del look sin usar imágenes
            const stylingData = additionalData.stylingData as { modelSizes?: { upperBodySize?: string; lowerBodySize?: string; shoeSize?: string }; lookDescription?: string };
            const garments = additionalData.garments as Array<{ category?: string; name?: string; color?: string; size?: string }>;
            
            // Analizar imagen del modelo para extraer características visuales
            let modelDescription = '';
            if (modelImage) {
              console.log('🔍 Analizando imagen del modelo para construir descripción textual...');
              const analyzedDescription = await analyzeModelImage(modelImage);
              if (analyzedDescription) {
                modelDescription = analyzedDescription;
                console.log('✅ Descripción del modelo construida desde la imagen');
              }
            }
            
            // Si no se pudo analizar la imagen, usar información disponible del modelo
            if (!modelDescription && stylingData.modelSizes) {
              modelDescription = `Child model, ${stylingData.modelSizes.upperBodySize || 'M'} size, ${stylingData.modelSizes.lowerBodySize || 'M'} pants size, shoe size ${stylingData.modelSizes.shoeSize || '28'}`;
            }
            
            let textDescription = `CREATE IMAGE: Professional fashion photography of a child model wearing the following outfit:\n\n`;
            
            // Agregar descripción detallada del modelo basada en el análisis de la imagen
            if (modelDescription) {
              textDescription += `MODEL DESCRIPTION: ${modelDescription}\n\n`;
            } else {
              textDescription += `MODEL: Child model for fashion catalog.\n\n`;
            }
            
            // Agregar descripción de cada prenda
            if (garments && Array.isArray(garments)) {
              textDescription += `OUTFIT DETAILS:\n`;
              garments.forEach((garment: { category?: string; name?: string; color?: string; size?: string }) => {
                textDescription += `- ${garment.category}: ${garment.name}`;
                if (garment.color) textDescription += ` in ${garment.color}`;
                if (garment.size) textDescription += ` (size ${garment.size})`;
                textDescription += `\n`;
              });
            }
            
            // Agregar instrucciones de pose si están disponibles
            if (stylingData.lookDescription) {
              textDescription += `\nPOSE AND PRESENTATION: ${stylingData.lookDescription}\n`;
            }
            
            textDescription += `\nTECHNICAL REQUIREMENTS:
- Professional fashion photography style for children's clothing
- White seamless background
- High quality studio lighting
- Sharp focus and professional composition
- Child-appropriate pose and expression
- Commercial catalog quality
- Moda infantil profesional

GENERATE COMPLETE FASHION IMAGE NOW - NO TEXT DESCRIPTION.`;
            
            // Intentar generar sin imágenes, solo con texto
            try {
              const textOnlyPrompt = buildNanoBananaPrompt('styling', textDescription);
              const textOnlyResult = await imageModel.generateContent({
                contents: [{
                  role: 'user',
                  parts: [{ text: textOnlyPrompt }]
                }]
              });
              
              const textOnlyResponse = await textOnlyResult.response;
              const textOnlyProcessed = processNanoBananaResponse(
                textOnlyResponse as EnhancedGenerateContentResponse,
                type,
                textDescription,
                `temp-${Date.now()}`
              );
              
              if (textOnlyProcessed.hasImage && textOnlyProcessed.imageData && textOnlyProcessed.mimeType) {
                if (validateNanoBananaImage(textOnlyProcessed.mimeType, textOnlyProcessed.imageData)) {
                  const base64Image = formatImageAsDataURI(textOnlyProcessed.imageData, textOnlyProcessed.mimeType);
                  console.log('✅ Look generado exitosamente usando método alternativo (solo texto)');
                  
                  return {
                    success: true,
                    base64Image,
                    message: `🍌 ¡Look generado usando método alternativo (sin combinar imágenes)!`,
                    attempts: attempt,
                    usedAlternative: true
                  };
                }
              }
            } catch (altError) {
              console.error('❌ Método alternativo también falló:', altError);
            }
          }
          
          // Si la alternativa falló o no aplica, retornar error
          console.error('   No se pudo usar método alternativo. Bloqueo permanente.');
          if (finishMessage) {
            console.error('   Mensaje:', finishMessage);
          }
          
          const safetyMessage = finishReason === 'IMAGE_SAFETY' 
            ? 'Nano Banana bloqueó la combinación de imágenes (probablemente por contenido de menores). Se intentó generar el look desde cero pero también fue bloqueado. Intenta con descripciones más simples o diferentes prendas.'
            : `Nano Banana bloqueó la generación por razones de seguridad (${finishReason}). Intenta con descripciones más simples o diferentes imágenes.`;
          
          return {
            success: false,
            message: safetyMessage + (finishMessage ? ` Detalles: ${finishMessage}` : ''),
            attempts: attempt,
            blocked: true,
            finishReason: finishReason
          };
        }
      }
      
      // Logging adicional para debugging
      if (type === 'look') {
        console.log('🔍 Debugging respuesta de look:');
        console.log('- Tiene candidates:', !!response.candidates);
        console.log('- Número de candidates:', response.candidates?.length || 0);
        if (response.candidates && response.candidates.length > 0) {
          const candidate = response.candidates[0] as { finishReason?: string; finishMessage?: string; safetyRatings?: unknown[]; content?: { parts?: unknown[] } };
          console.log('- Candidate keys:', Object.keys(candidate || {}));
          console.log('- Finish reason:', candidate?.finishReason);
          console.log('- Finish message:', candidate?.finishMessage);
          console.log('- Safety ratings:', candidate?.safetyRatings);
          console.log('- Tiene content:', !!candidate?.content);
          console.log('- Content keys:', candidate?.content ? Object.keys(candidate.content) : 'N/A');
          console.log('- Parts length:', candidate?.content?.parts?.length || 0);
        }
      }
      
      // Procesar respuesta
      const processedResponse = processNanoBananaResponse(
        response as EnhancedGenerateContentResponse, 
        type, 
        description, 
        `temp-${Date.now()}`
      );
      
      logNanoBananaActivity('response_processed', type, processedResponse.hasImage, {
        debugInfo: processedResponse.debugInfo,
        attempt
      });
      
      if (processedResponse.hasImage && processedResponse.imageData && processedResponse.mimeType) {
        // ¡Éxito! Validar imagen antes de retornar
        if (!validateNanoBananaImage(processedResponse.mimeType, processedResponse.imageData)) {
          console.warn(`❌ Intento ${attempt}: Imagen no pasó validación`);
          if (attempt < maxRetries) {
            continue; // Reintentar
          }
          throw new Error('Imagen no pasó validación después de todos los intentos');
        }
        
        // Formatear como data URI
        const base64Image = formatImageAsDataURI(processedResponse.imageData, processedResponse.mimeType);
        
        logNanoBananaActivity('image_generated', type, true, {
          mimeType: processedResponse.mimeType,
          size: processedResponse.imageData.length,
          attempt
        });
        
        return {
          success: true,
          base64Image,
          message: `🍌 ¡Imagen generada con Nano Banana real (intento ${attempt})!`,
          attempts: attempt
        };
        
      } else {
        const debugInfo = processedResponse.debugInfo || {};
        const finishReason = debugInfo.finishReason as string;
        const blocked = debugInfo.blocked as boolean;
        
        if (blocked || finishReason) {
          console.warn(`⚠️ Intento ${attempt}: Respuesta bloqueada por Nano Banana`);
          console.warn(`   Finish reason: ${finishReason || 'unknown'}`);
          console.warn(`   Safety ratings:`, debugInfo.safetyRatings);
          
          // Si está bloqueado por seguridad de imagen, NO reintentar - es un bloqueo permanente
          if (finishReason === 'IMAGE_SAFETY' || finishReason === 'SAFETY' || finishReason === 'RECITATION') {
            const finishMessage = (typeof debugInfo.finishMessage === 'string' ? debugInfo.finishMessage : '') || '';
            const safetyMessage = finishReason === 'IMAGE_SAFETY' 
              ? 'Nano Banana detectó contenido inapropiado en las imágenes de entrada. Esto puede suceder con imágenes de modelos o cuando se combinan múltiples imágenes. Intenta con diferentes imágenes o genera el look directamente sin combinar imágenes.'
              : `Nano Banana bloqueó la generación por razones de seguridad (${finishReason}). Intenta con descripciones más simples o diferentes imágenes.`;
            
            return {
              success: false,
              message: safetyMessage + (finishMessage ? ` Detalles: ${finishMessage}` : ''),
              attempts: attempt,
              blocked: true,
              finishReason: finishReason
            };
          }
        }
        
        console.warn(`⚠️ Intento ${attempt}: Nano Banana no devolvió imagen`);
        console.warn(`   Debug info:`, JSON.stringify(debugInfo, null, 2));
        
        if (attempt < maxRetries) {
          console.log(`🔄 Reintentando con prompt alternativo...`);
          
          // Para looks, intentar un enfoque diferente en el siguiente intento
          if (type === 'look' && attempt === 1) {
            console.log('💡 Cambiando estrategia: intentando con prompt más simple...');
          }
          
          continue; // Reintentar
        }
        
        // Último intento fallido
        const errorMessage = finishReason 
          ? `Nano Banana no pudo generar la imagen (${finishReason}). Intenta con descripciones más simples.`
          : `Nano Banana procesó el prompt pero no generó imagen después de ${attempt} intento(s). Verifica que las imágenes sean válidas y el prompt sea apropiado.`;
        
        return {
          success: false,
          message: errorMessage,
          attempts: attempt,
          debugInfo: debugInfo
        };
      }
      
    } catch (error) {
      console.error(`❌ Error en intento ${attempt}:`, error);
      
      // Verificar si es un error de cuota (429)
      const quotaInfo = extractQuotaErrorInfo(error);
      
      if (quotaInfo.isQuotaError) {
        console.warn(`⚠️ Error de cuota detectado: ${quotaInfo.message}`);
        
        if (attempt < maxRetries) {
          // Si tenemos un retryDelay, esperar ese tiempo
          if (quotaInfo.retryDelay) {
            console.log(`⏳ Esperando ${quotaInfo.retryDelay} segundos antes de reintentar...`);
            await sleep(quotaInfo.retryDelay);
          } else {
            // Si no tenemos retryDelay específico, usar backoff exponencial
            const backoffDelay = Math.min(2 ** attempt * 5, 60); // Máximo 60 segundos
            console.log(`⏳ Esperando ${backoffDelay} segundos (backoff exponencial)...`);
            await sleep(backoffDelay);
          }
          console.log(`🔄 Reintentando después de esperar (intento ${attempt + 1}/${maxRetries})...`);
          continue; // Reintentar
        } else {
          // Último intento fallido por cuota
          throw new Error(`Cuota de API excedida después de ${attempt} intentos. Por favor, espera unos minutos antes de volver a intentar.`);
        }
      }
      
      // Para otros errores, reintentar normalmente
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
    const { type, description, garmentImages, modelImage, garments, stylingData } = body;
    
    console.log(`🎨 Generando imagen de ${type} con Supabase:`, description);
    
    // Validar tipo
    if (!['garment', 'model', 'look'].includes(type)) {
      return NextResponse.json({
        success: false,
        error: 'Tipo de generación no válido'
      }, { status: 400 });
    }
    
    // Si no hay API key, usar placeholder en base64
    if (!API_KEY) {
      const placeholderBase64 = createBase64Placeholder(type as 'garment' | 'model' | 'look', description);
      return NextResponse.json({
        success: true,
        base64Image: placeholderBase64,
        message: 'Imagen placeholder generada (configura API key para generación real)',
        isRealImage: false
      });
    }
    
    // Intentar generar con Nano Banana
    if (imageModel) {
      try {
        const result = await generateWithNanoBanana(
          type as 'garment' | 'model' | 'look',
          description,
          garmentImages,
          modelImage,
          { stylingData, garments }
        );
        
        if (result.success && result.base64Image) {
          return NextResponse.json({
            success: true,
            base64Image: result.base64Image,
            message: result.message,
            isRealImage: true,
            model: 'gemini-2.5-flash-image-preview',
            attempts: result.attempts
          });
        } else {
          // Nano Banana falló, usar placeholder
          const placeholderBase64 = createBase64Placeholder(type as 'garment' | 'model' | 'look', description);
          
          return NextResponse.json({
            success: true,
            base64Image: placeholderBase64,
            message: result.message,
            isRealImage: false,
            attempts: result.attempts
          });
        }
        
      } catch (error) {
        console.error('❌ Error con Nano Banana:', error);
        
        // Verificar si es un error de cuota
        const quotaInfo = extractQuotaErrorInfo(error);
        
        if (quotaInfo.isQuotaError) {
          console.warn('⚠️ Cuota de API excedida. Usando fallback...');
        }
        
        // Fallback a modelo de texto para generar descripción
        if (textModel) {
          console.log('🔄 Fallback: Usando modelo de texto...');
          
          try {
            const prompt = buildNanoBananaPrompt(
              type === 'model' ? 'model' : type === 'garment' ? 'garment' : 'styling',
              description
            );
            
            const result = await textModel.generateContent(prompt);
            const response = await result.response;
            const text = response.text();
            
            const placeholderBase64 = createBase64Placeholder(type as 'garment' | 'model' | 'look', text.substring(0, 100));
            
            return NextResponse.json({
              success: true,
              base64Image: placeholderBase64,
              message: quotaInfo.isQuotaError 
                ? 'Cuota de API excedida. Descripción generada con IA + placeholder.'
                : 'Nano Banana falló. Descripción generada con IA + placeholder.',
              aiDescription: text.substring(0, 200) + '...',
              isRealImage: false
            });
            
          } catch (textError) {
            console.error('❌ Error con modelo de texto:', textError);
          }
        }
        
        // Último recurso: placeholder básico
        const placeholderBase64 = createBase64Placeholder(type as 'garment' | 'model' | 'look', description);
        
        return NextResponse.json({
          success: true,
          base64Image: placeholderBase64,
          message: quotaInfo.isQuotaError
            ? 'Cuota de API excedida. Usando placeholder básico. Por favor, espera unos minutos antes de volver a intentar.'
            : 'Error en generación. Usando placeholder básico.',
          isRealImage: false
        });
      }
    }
    
    // Si no hay modelo de imagen, usar placeholder
    const placeholderBase64 = createBase64Placeholder(type as 'garment' | 'model' | 'look', description);
    
    return NextResponse.json({
      success: true,
      base64Image: placeholderBase64,
      message: 'Nano Banana no disponible. Usando placeholder.',
      isRealImage: false
    });
    
  } catch (error) {
    console.error('❌ Error general en la API:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Error interno del servidor',
      details: error instanceof Error ? error.message : 'Error desconocido'
    }, { status: 500 });
  }
}
