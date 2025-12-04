import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { GoogleGenAI } from '@google/genai';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { readFile, unlink } from 'fs/promises';
import { join } from 'path';
import { tmpdir } from 'os';

const API_KEY = process.env.GOOGLE_API_KEY || '';
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
// Intentar usar service role key primero, luego anon key como fallback
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Inicializar el cliente de Google Generative AI para Veo
let ai: GoogleGenAI | null = null;
if (API_KEY) {
  ai = new GoogleGenAI({ apiKey: API_KEY });
}

// Inicializar el cliente de Gemini para análisis de imágenes
let genAI: GoogleGenerativeAI | null = null;
let textModel: ReturnType<typeof GoogleGenerativeAI.prototype.getGenerativeModel> | null = null;
if (API_KEY) {
  genAI = new GoogleGenerativeAI(API_KEY);
  textModel = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
}

// Función para analizar una imagen y generar una descripción detallada
async function analyzeImageForDescription(imageData: { data: string; mimeType: string }): Promise<string> {
  if (!textModel) {
    return 'Imagen de look de moda infantil';
  }

  try {
    const analysisPrompt = `Analiza esta imagen de un look de moda infantil y genera una descripción detallada y profesional que pueda usarse para generar un video promocional.

IMPORTANTE: Esta es una imagen de moda infantil. Describe:
- El modelo (niño/niña, características generales como edad aparente, color de cabello, expresión)
- Las prendas que lleva (tipo, colores, estilos, detalles)
- La composición y estilo de la imagen (fondo, iluminación, pose, ambiente)
- El mood y la estética general (alegre, elegante, casual, etc.)

Genera una descripción detallada en español que capture todos los elementos visuales importantes de la imagen, enfocándote en:
1. Características del modelo (sin ser demasiado específico sobre edad exacta)
2. Descripción completa de las prendas y su estilo
3. Colores y patrones
4. Estilo general y mood de la imagen
5. Composición y ambiente

Responde SOLO con la descripción detallada, sin texto adicional.`;

    const result = await textModel.generateContent({
      contents: [{
        role: 'user',
        parts: [
          { text: analysisPrompt },
          {
            inlineData: {
              data: imageData.data,
              mimeType: imageData.mimeType,
            },
          },
        ],
      }],
    });

    const response = await result.response;
    const description = response.text();
    
    console.log('✅ Descripción generada de la imagen:', description.substring(0, 200) + '...');
    return description;
  } catch (error) {
    console.error('❌ Error analizando imagen:', error);
    return 'Imagen de look de moda infantil con prendas coloridas y estilo alegre';
  }
}

// Función para cargar imagen desde URL y convertir a base64
async function loadImageFromUrl(imageUrl: string): Promise<{ data: string; mimeType: string } | null> {
  try {
    const response = await fetch(imageUrl);
    if (!response.ok) {
      throw new Error(`Error cargando imagen: ${response.statusText}`);
    }
    
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const base64 = buffer.toString('base64');
    
    // Determinar el tipo MIME
    const contentType = response.headers.get('content-type') || 'image/jpeg';
    
    return {
      data: base64,
      mimeType: contentType,
    };
  } catch (error) {
    console.error('Error cargando imagen:', error);
    return null;
  }
}



// Función para generar video usando Veo 3.1 con el SDK oficial
async function generateVideoWithVeo(
  lookImages: Array<{ imageUrl: string; name: string; description: string }>,
  description: string
): Promise<Buffer> {
  if (!ai) {
    throw new Error('Google Generative AI no está inicializado. Verifica tu API key.');
  }

  // Cargar todas las imágenes de los looks
  const imagePromises = lookImages.map(look => loadImageFromUrl(look.imageUrl));
  const imageDataArray = await Promise.all(imagePromises);
  
  // Filtrar imágenes válidas
  const validImages = imageDataArray.filter((img): img is {data: string, mimeType: string} => img !== null);
  
  if (validImages.length === 0) {
    throw new Error('No se pudieron cargar las imágenes de los looks');
  }

  // Construir prompt descriptivo para el video
  const looksDescription = lookImages.map(look => 
    `- ${look.name}: ${look.description}`
  ).join('\n');

  const videoPrompt = `
    Crea un video promocional profesional de moda infantil para cicibet.
    
    Descripción del video: ${description}
    
    Looks a mostrar:
    ${looksDescription}
    
    El video debe:
    - Mostrar los looks de moda infantil de manera atractiva y profesional
    - Tener transiciones suaves entre los diferentes looks
    - Usar colores vibrantes y alegres apropiados para niños
    - Mantener un estilo de catálogo profesional
    - Ser adecuado para promoción de moda infantil
    - Duración: 8 segundos
    - Estilo: Dinámico pero elegante, enfocado en mostrar las prendas y modelos infantiles
    - Resolución: Alta calidad, formato horizontal (16:9)
    
    Genera un video promocional de alta calidad que muestre estos looks de manera atractiva.
  `;

  console.log('🎬 Generando video con Veo 3.1 usando SDK oficial...');
  console.log('Número de imágenes:', validImages.length);
  console.log('Prompt:', videoPrompt.substring(0, 200) + '...');

  try {
    // Preparar la configuración según la documentación oficial
    // durationSeconds debe ser un número, no un string
    const baseConfig = {
      aspectRatio: '16:9',
      resolution: '720p',
      durationSeconds: 8, // Número, no string
    };

    // Agregar imágenes de referencia si están disponibles
    // El SDK espera imageBytes como string (base64), no como Buffer
    const config = validImages.length > 0 ? {
      ...baseConfig,
      referenceImages: validImages.map(img => ({
        image: {
          imageBytes: img.data, // Ya es base64 string desde loadImageFromUrl
          mimeType: img.mimeType,
        },
        referenceType: 'asset' as const, // 'asset' para productos/prendas
      })),
    } : baseConfig;

    // Iniciar la generación de video usando el SDK
    console.log('📤 Iniciando generación con Veo 3.1...');
    let operation = await ai.models.generateVideos({
      model: 'veo-3.1-generate-preview',
      prompt: videoPrompt,
      config: config as Parameters<typeof ai.models.generateVideos>[0]['config'],
    });

    console.log('✅ Operación iniciada:', operation.name);

    // Poll the operation status until the video is ready
    while (!operation.done) {
      console.log('⏳ Esperando generación de video...');
      await new Promise((resolve) => setTimeout(resolve, 10000));
      operation = await ai.operations.getVideosOperation({
        operation: operation,
      });
    }

    // Verificar si hubo error
    if (operation.error) {
      throw new Error(`Error en la operación: ${JSON.stringify(operation.error)}`);
    }

    // Verificar si fue filtrado por RAI (Responsible AI) debido a imágenes de niños
    const response = operation.response;
    if (response?.raiMediaFilteredReasons && response.raiMediaFilteredReasons.length > 0) {
      const filteredReason = response.raiMediaFilteredReasons[0];
      console.warn('⚠️ Video filtrado por RAI:', filteredReason);
      
      // Si el filtro es por imágenes de niños, analizar las imágenes y generar descripciones detalladas
      if (filteredReason.includes('photorealistic children') || filteredReason.includes('children')) {
        console.log('🔄 Analizando imágenes de referencia para generar descripciones detalladas...');
        
        // Analizar cada imagen de referencia para generar descripciones detalladas
        const imageDescriptions: string[] = [];
        for (let i = 0; i < validImages.length; i++) {
          const img = validImages[i];
          const look = lookImages[i];
          console.log(`📝 Analizando imagen ${i + 1}/${validImages.length} para look: ${look.name}`);
          
          const imageDescription = await analyzeImageForDescription(img);
          imageDescriptions.push(`Look "${look.name}": ${imageDescription}`);
        }
        
        const detailedDescriptions = imageDescriptions.join('\n\n');
        
        console.log('✅ Descripciones detalladas generadas, creando prompt mejorado...');
        
        // Mejorar el prompt para incluir descripciones detalladas de las imágenes
        const enhancedPrompt = `
          Crea un video promocional profesional de moda infantil para cicibet.
          
          Descripción del video: ${description}
          
          DESCRIPCIONES DETALLADAS DE LOS LOOKS (basadas en análisis de imágenes):
          ${detailedDescriptions}
          
          INFORMACIÓN ADICIONAL DE LOS LOOKS:
          ${looksDescription}
          
          El video debe mostrar:
          - Modelos infantiles diversos y alegres que reflejen las características descritas en los looks
          - Los looks de moda infantil de manera atractiva y profesional, siguiendo las descripciones detalladas
          - Transiciones suaves entre los diferentes outfits
          - Colores, estilos y detalles específicos mencionados en las descripciones
          - Estilo de catálogo profesional de moda infantil
          - Ambiente alegre y divertido, apropiado para promoción de moda infantil
          - Duración: 8 segundos
          - Estilo: Dinámico pero elegante, enfocado en mostrar las prendas y modelos infantiles
          - Resolución: Alta calidad, formato horizontal (16:9)
          - Los modelos deben lucir las prendas de manera natural y alegre, manteniendo el estilo y mood descritos
          - Movimientos suaves y naturales de niños jugando o moviéndose
          
          IMPORTANTE: Usa las descripciones detalladas de los looks como guía principal para recrear el estilo, colores, prendas y mood de cada look en el video. No necesitas replicar exactamente las imágenes, pero sí mantener la esencia y características visuales descritas.
          
          Genera un video promocional de alta calidad que muestre estos looks de moda infantil de manera atractiva y profesional, basándote en las descripciones detalladas proporcionadas.
        `;
        
        // Reintentar sin imágenes de referencia
        let retryOperation = await ai.models.generateVideos({
          model: 'veo-3.1-generate-preview',
          prompt: enhancedPrompt,
          config: {
            aspectRatio: '16:9',
            resolution: '720p',
            durationSeconds: 8,
            // No incluir referenceImages
          },
        });

        console.log('✅ Operación de reintento iniciada:', retryOperation.name);

        // Poll the retry operation
        while (!retryOperation.done) {
          console.log('⏳ Esperando generación de video (sin imágenes de referencia)...');
          await new Promise((resolve) => setTimeout(resolve, 10000));
          retryOperation = await ai.operations.getVideosOperation({
            operation: retryOperation,
          });
        }

        if (retryOperation.error) {
          throw new Error(`Error en la operación de reintento: ${JSON.stringify(retryOperation.error)}`);
        }

        const retryResponse = retryOperation.response;
        if (!retryResponse?.generatedVideos || retryResponse.generatedVideos.length === 0) {
          throw new Error(
            'No se pudo generar el video. Veo 3.1 tiene restricciones para contenido con niños. ' +
            'Intenta con una descripción más general del estilo sin referencias específicas a imágenes.'
          );
        }

        const generatedVideo = retryResponse.generatedVideos[0];
        console.log('🎥 Video generado exitosamente (sin imágenes de referencia)');

        if (!generatedVideo.video) {
          throw new Error('El video generado no tiene archivo asociado');
        }

        // Descargar el video usando el SDK a un archivo temporal
        const tempFilePath = join(tmpdir(), `veo-video-${Date.now()}.mp4`);
        console.log('📥 Descargando video a:', tempFilePath);
        
        await ai.files.download({
          file: generatedVideo.video,
          downloadPath: tempFilePath,
        });

        // Leer el archivo descargado
        const videoBuffer = await readFile(tempFilePath);
        console.log('✅ Video descargado, tamaño:', videoBuffer.length, 'bytes');

        // Limpiar archivo temporal
        try {
          await unlink(tempFilePath);
        } catch (cleanupError) {
          console.warn('⚠️ No se pudo eliminar archivo temporal:', cleanupError);
        }

        return videoBuffer;
      } else {
        // Otro tipo de filtro RAI
        throw new Error(
          `Video bloqueado por políticas de seguridad: ${filteredReason}. ` +
          'Intenta con diferentes imágenes o descripción.'
        );
      }
    }

    // Obtener el video generado (caso normal)
    if (!response?.generatedVideos || response.generatedVideos.length === 0) {
      console.error('❌ Respuesta completa:', JSON.stringify(operation, null, 2).substring(0, 1000));
      throw new Error('No se generaron videos en la respuesta');
    }

    const generatedVideo = response.generatedVideos[0];
    console.log('🎥 Video generado exitosamente');

    if (!generatedVideo.video) {
      throw new Error('El video generado no tiene archivo asociado');
    }

    // Descargar el video usando el SDK a un archivo temporal
    const tempFilePath = join(tmpdir(), `veo-video-${Date.now()}.mp4`);
    console.log('📥 Descargando video a:', tempFilePath);
    
    await ai.files.download({
      file: generatedVideo.video,
      downloadPath: tempFilePath,
    });

    // Leer el archivo descargado
    const videoBuffer = await readFile(tempFilePath);
    console.log('✅ Video descargado, tamaño:', videoBuffer.length, 'bytes');

    // Limpiar archivo temporal
    try {
      await unlink(tempFilePath);
    } catch (cleanupError) {
      console.warn('⚠️ No se pudo eliminar archivo temporal:', cleanupError);
    }

    return videoBuffer;
  } catch (error: unknown) {
    console.error('Error generando video con Veo 3.1:', error);
    
    const errorMessage = error instanceof Error ? error.message : String(error);
    if (errorMessage.includes('429') || errorMessage.includes('quota')) {
      throw new Error('Límite de cuota excedido. Por favor espera unos minutos.');
    }
    
    if (errorMessage.includes('SAFETY') || errorMessage.includes('IMAGE_SAFETY')) {
      throw new Error('El contenido fue bloqueado por políticas de seguridad. Intenta con diferentes imágenes o descripción.');
    }
    
    throw error;
  }
}

// Función para subir video a Supabase Storage
async function uploadVideoToSupabase(videoBuffer: Buffer, filename: string): Promise<{ url: string; path: string }> {
  if (!SUPABASE_URL) {
    throw new Error(
      'Configuración de Supabase no encontrada. ' +
      'Por favor configura NEXT_PUBLIC_SUPABASE_URL en tu archivo .env.local'
    );
  }

  if (!SUPABASE_SERVICE_KEY) {
    throw new Error(
      'Clave de Supabase no encontrada. ' +
      'Por favor configura SUPABASE_SERVICE_ROLE_KEY o NEXT_PUBLIC_SUPABASE_ANON_KEY en tu archivo .env.local'
    );
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
  
  const storagePath = `videos/${Date.now()}-${filename}`;
  
  const { error } = await supabase.storage
    .from('cicibet-storage')
    .upload(storagePath, videoBuffer, {
      contentType: 'video/mp4',
      upsert: false,
    });

  if (error) {
    console.error('Error subiendo video a Supabase:', error);
    throw new Error(`Error subiendo video: ${error.message}`);
  }

  // Obtener URL pública
  const { data: urlData } = supabase.storage
    .from('cicibet-storage')
    .getPublicUrl(storagePath);

  return {
    url: urlData.publicUrl,
    path: storagePath,
  };
}

export async function POST(request: NextRequest) {
  try {
    if (!API_KEY) {
      return NextResponse.json(
        { error: 'API key de Google no configurada' },
        { status: 500 }
      );
    }

    const body = await request.json();
    const { lookImages, description } = body;

    if (!lookImages || !Array.isArray(lookImages) || lookImages.length === 0) {
      return NextResponse.json(
        { error: 'Se requiere al menos una imagen de look' },
        { status: 400 }
      );
    }

    if (!description || typeof description !== 'string' || !description.trim()) {
      return NextResponse.json(
        { error: 'Se requiere una descripción del video' },
        { status: 400 }
      );
    }

    console.log('📹 Iniciando generación de video...');
    console.log('Looks seleccionados:', lookImages.length);
    console.log('Descripción:', description.substring(0, 100));

    // Generar video con Veo 3.1
    const videoBuffer = await generateVideoWithVeo(lookImages, description);
    
    console.log('✅ Video generado, tamaño:', videoBuffer.length, 'bytes');

    // Subir video a Supabase Storage
    const { url, path } = await uploadVideoToSupabase(videoBuffer, 'video-promocional.mp4');
    
    console.log('✅ Video subido a Supabase:', url);

    return NextResponse.json({
      success: true,
      videoUrl: url,
      storagePath: path,
      message: 'Video generado exitosamente',
    });
  } catch (error: unknown) {
    console.error('Error en generate-video:', error);
    
    const errorMessage = error instanceof Error ? error.message : String(error);
    // Manejar error 404 específico de modelo no encontrado
    if (errorMessage.includes('404') || errorMessage.includes('not found') || errorMessage.includes('is not found')) {
      console.error('❌ Error 404: Modelo veo-3.1-generate-preview no encontrado');
      console.error('Detalles del error:', errorMessage);
      
      return NextResponse.json(
        { 
          error: 'El modelo veo-3.1-generate-preview no está disponible a través de la API de Gemini estándar. ' +
                 'Veo 3.1 requiere Vertex AI y el método predictLongRunning.\n\n' +
                 'Para usar Veo 3.1 necesitas:\n' +
                 '1. Configurar Vertex AI en Google Cloud\n' +
                 '2. Usar @google-cloud/aiplatform SDK\n' +
                 '3. Configurar Google Cloud Storage\n' +
                 '4. Usar el método predictLongRunning\n\n' +
                 'Consulta VEO_3.1_SETUP.md para instrucciones detalladas.\n' +
                 'Documentación: https://cloud.google.com/vertex-ai/generative-ai/docs/video/generate-videos-from-text',
          requiresVertexAI: true,
          modelNotFound: true,
          modelName: 'veo-3.1-generate-preview',
        },
        { status: 404 }
      );
    }
    
    // Manejar errores específicos
    if (errorMessage.includes('quota') || errorMessage.includes('429')) {
      return NextResponse.json(
        { 
          error: 'Límite de cuota excedido. Por favor espera unos minutos antes de intentar de nuevo.',
          quotaExceeded: true,
        },
        { status: 429 }
      );
    }

    if (errorMessage.includes('SAFETY') || errorMessage.includes('IMAGE_SAFETY')) {
      return NextResponse.json(
        { 
          error: 'El contenido fue bloqueado por políticas de seguridad. Intenta con diferentes imágenes o descripción.',
          safetyBlocked: true,
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: errorMessage || 'Error al generar el video' },
      { status: 500 }
    );
  }
}

