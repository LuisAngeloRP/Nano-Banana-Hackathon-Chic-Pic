import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI, GenerativeModel } from '@google/generative-ai';
import { formatImageAsDataURI, extractBase64FromDataURI, createBase64Placeholder } from '@/lib/imageStorage.client';

// Configuración de Gemini API
const API_KEY = process.env.GOOGLE_API_KEY || '';

let genAI: GoogleGenerativeAI | null = null;
let imageModel: GenerativeModel | null = null;

// Inicializar modelos si hay API key
if (API_KEY) {
  genAI = new GoogleGenerativeAI(API_KEY);
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
    console.log('🍌 Nano Banana (Gemini 2.5 Flash Image Preview - Free Tier) para edición inicializado correctamente');
  } catch (error) {
    console.warn('⚠️ Nano Banana no disponible para edición:', error);
    imageModel = null;
  }
}

// Función para cargar imagen desde URL y convertirla a base64
async function loadImageFromUrl(imageUrl: string): Promise<{data: string, mimeType: string} | null> {
  try {
    console.log('📥 Descargando imagen desde URL para edición:', imageUrl);
    
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
    
    console.log('✅ Imagen descargada y convertida a base64 para edición');
    return { data: base64Data, mimeType };
  } catch (error) {
    console.error('Error cargando imagen desde URL:', error);
    return null;
  }
}

// Función para procesar imagen base64 para edición desde diferentes fuentes
async function processImageForEdit(imageData: string): Promise<{data: string, mimeType: string} | null> {
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

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, editData } = body;
    
    if (type !== 'edit' || !editData) {
      return NextResponse.json({
        success: false,
        error: 'Datos de edición no válidos'
      }, { status: 400 });
    }
    
    const { originalImageBase64, editPrompt, itemType, fullPrompt } = editData;
    
    if (!originalImageBase64) {
      return NextResponse.json({
        success: false,
        error: 'Imagen original requerida'
      }, { status: 400 });
    }
    
    console.log(`🎨 Editando imagen ${itemType} con prompt:`, editPrompt);
    
    // Si no hay API key, crear placeholder editado
    if (!API_KEY) {
      const placeholderBase64 = createBase64Placeholder(
        itemType as 'garment' | 'model' | 'look', 
        `Editado: ${editPrompt}`
      );
      
      return NextResponse.json({
        success: true,
        base64Image: placeholderBase64,
        message: 'Imagen placeholder editada (configura API key para edición real)',
        isRealImage: false
      });
    }
    
    // Si no hay modelo de imagen, usar placeholder
    if (!imageModel) {
      const placeholderBase64 = createBase64Placeholder(
        itemType as 'garment' | 'model' | 'look', 
        `Editado: ${editPrompt}`
      );
      
      return NextResponse.json({
        success: true,
        base64Image: placeholderBase64,
        message: 'Nano Banana no disponible. Usando placeholder editado.',
        isRealImage: false
      });
    }
    
    try {
      // Procesar imagen original
      const imageData = await processImageForEdit(originalImageBase64);
      
      if (!imageData) {
        return NextResponse.json({
          success: false,
          error: 'No se pudo procesar la imagen original'
        }, { status: 400 });
      }
      
      console.log(`🖼️ Procesando imagen original (${imageData.mimeType})`);
      
      // Preparar contenido para Nano Banana
      const contentParts = [
        { text: fullPrompt || `Edita esta imagen: ${editPrompt}` },
        {
          inlineData: {
            data: imageData.data,
            mimeType: imageData.mimeType
          }
        }
      ];
      
      // Generar imagen editada con Nano Banana
      console.log('🍌 Enviando imagen a Nano Banana para edición...');
      
      const result = await imageModel.generateContent({
        contents: [{
          role: 'user',
          parts: contentParts
        }]
      });
      
      const response = await result.response;
      console.log('✅ Respuesta de edición recibida de Nano Banana');
      
      // Procesar respuesta
      const candidates = response.candidates;
      if (!candidates || candidates.length === 0) {
        throw new Error('No se recibieron candidatos de Nano Banana');
      }
      
      const candidate = candidates[0];
      const parts = candidate.content?.parts;
      
      if (!parts || parts.length === 0) {
        throw new Error('No se recibieron partes del contenido');
      }
      
      // Buscar imagen en la respuesta
      let editedImageBase64: string | null = null;
      let editedMimeType = 'image/jpeg';
      
      for (const part of parts) {
        if (part.inlineData && part.inlineData.data) {
          editedImageBase64 = part.inlineData.data;
          editedMimeType = part.inlineData.mimeType || 'image/jpeg';
          break;
        }
      }
      
      if (editedImageBase64) {
        // Formatear como data URI
        const editedImageDataURI = formatImageAsDataURI(editedImageBase64, editedMimeType);
        
        console.log('✅ Imagen editada con Nano Banana exitosamente');
        
        return NextResponse.json({
          success: true,
          base64Image: editedImageDataURI,
          message: '🍌 ¡Imagen editada con Nano Banana real!',
          isRealImage: true,
          model: 'gemini-2.5-flash-image-preview'
        });
      } else {
        // Nano Banana no devolvió imagen, usar placeholder
        console.warn('⚠️ Nano Banana no devolvió imagen editada');
        
        const placeholderBase64 = createBase64Placeholder(
          itemType as 'garment' | 'model' | 'look', 
          `Editado: ${editPrompt}`
        );
        
        return NextResponse.json({
          success: true,
          base64Image: placeholderBase64,
          message: 'Nano Banana procesó la edición pero no devolvió imagen. Usando placeholder.',
          isRealImage: false
        });
      }
      
    } catch (error) {
      console.error('❌ Error editando con Nano Banana:', error);
      
      // Fallback a placeholder
      const placeholderBase64 = createBase64Placeholder(
        itemType as 'garment' | 'model' | 'look', 
        `Error editando: ${editPrompt}`
      );
      
      return NextResponse.json({
        success: true,
        base64Image: placeholderBase64,
        message: `Error en edición con Nano Banana: ${error instanceof Error ? error.message : 'Error desconocido'}`,
        isRealImage: false
      });
    }
    
  } catch (error) {
    console.error('❌ Error general en edición:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Error interno del servidor',
      details: error instanceof Error ? error.message : 'Error desconocido'
    }, { status: 500 });
  }
}
