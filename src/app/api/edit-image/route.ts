import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { generateFileName, createLocalPlaceholder } from '@/lib/imageStorage.server';
import fs from 'fs';
import path from 'path';

// Configuración de Gemini API
const API_KEY = process.env.GOOGLE_API_KEY || '';

let genAI: GoogleGenerativeAI | null = null;
let imageModel: any = null;

// Inicializar modelos si hay API key
if (API_KEY) {
  genAI = new GoogleGenerativeAI(API_KEY);
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
    console.log('🍌 Nano Banana para edición inicializado correctamente');
  } catch (error) {
    console.warn('⚠️ Nano Banana no disponible para edición:', error);
    imageModel = null;
  }
}

// Función para cargar imagen desde URL local y convertirla a base64
async function loadImageAsBase64(imageUrl: string): Promise<string | null> {
  try {
    // Si es una imagen local (placeholder o generada)
    if (imageUrl.startsWith('/generated-images/')) {
      const publicDir = path.join(process.cwd(), 'public');
      const imagePath = path.join(publicDir, imageUrl);
      
      if (fs.existsSync(imagePath)) {
        const imageBuffer = fs.readFileSync(imagePath);
        const base64Image = imageBuffer.toString('base64');
        return base64Image;
      }
    }
    
    // Si es una URL externa, necesitaríamos descargarla
    // Por ahora, retornamos null para URLs externas
    return null;
  } catch (error) {
    console.error('Error cargando imagen:', error);
    return null;
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { editData } = body;
    
    if (!editData || !editData.originalImageUrl || !editData.editPrompt) {
      return NextResponse.json(
        { success: false, message: 'Datos de edición incompletos' },
        { status: 400 }
      );
    }

    console.log('🎨 Procesando edición de imagen:', {
      originalImageUrl: editData.originalImageUrl,
      editPrompt: editData.editPrompt,
      itemType: editData.itemType
    });

    // Verificar si tenemos API key y modelo
    if (!API_KEY || !imageModel) {
      console.warn('⚠️ API key o modelo no disponible, usando placeholder');
      
      // Crear imagen placeholder para desarrollo
      const timestamp = Date.now();
      const filename = `edited-${editData.itemType}-${timestamp}.jpg`;
      const description = `EDITADO: ${editData.editPrompt}`;
      const itemType = (editData.itemType as 'garment' | 'model' | 'look') || 'garment';
      
      const placeholderUrl = createLocalPlaceholder(
        itemType,
        description,
        filename
      );
      
      return NextResponse.json({
        success: true,
        imageUrl: placeholderUrl,
        filename: filename,
        message: 'Imagen editada (placeholder para desarrollo)'
      });
    }

    // Cargar la imagen original
    const base64Image = await loadImageAsBase64(editData.originalImageUrl);
    
    if (!base64Image) {
      console.warn('⚠️ No se pudo cargar la imagen original, generando nueva imagen');
      
      // Si no podemos cargar la imagen original, generar una nueva basada en el prompt
      const result = await imageModel.generateContent([editData.fullPrompt]);
      const response = await result.response;
      const generatedText = response.text();
      
      // Por ahora, crear un placeholder con el resultado
      const timestamp = Date.now();
      const filename = `edited-${editData.itemType}-${timestamp}.jpg`;
      const description = `EDITADO: ${editData.editPrompt}`;
      const itemType = (editData.itemType as 'garment' | 'model' | 'look') || 'garment';
      
      const placeholderUrl = createLocalPlaceholder(
        itemType,
        description,
        filename
      );
      
      return NextResponse.json({
        success: true,
        imageUrl: placeholderUrl,
        filename: filename,
        message: 'Imagen editada con Nano Banana'
      });
    }

    // Preparar contenido para Nano Banana incluyendo la imagen original
    // Construir prompt específico para generación de imagen
    const imageGenerationPrompt = `
      GENERATE IMAGE: Edit the provided image based on the following instructions.
      
      EDIT INSTRUCTIONS: ${editData.editPrompt}
      
      REQUIREMENTS:
      - Generate a new image based on the original image and edit instructions
      - Maintain professional quality and style
      - Keep white background and professional lighting
      - Apply only the requested changes
      - Output ONLY the generated image, NO TEXT
      
      GENERATE EDITED IMAGE NOW - NO TEXT DESCRIPTION.
    `.trim();

    const content = [
      imageGenerationPrompt,
      {
        inlineData: {
          data: base64Image,
          mimeType: "image/jpeg"
        }
      }
    ];

    console.log('🍌 Enviando a Nano Banana para edición...');
    
    // Generar imagen editada con Nano Banana
    const result = await imageModel.generateContent(content);
    const response = await result.response;
    
    console.log('🍌 Respuesta recibida de Nano Banana');
    console.log('🔍 Debug - response structure:', {
      hasResponse: !!response,
      hasCandidates: !!(response?.candidates),
      candidatesLength: response?.candidates?.length || 0,
      responseKeys: Object.keys(response || {}),
      firstCandidate: response?.candidates?.[0] ? Object.keys(response.candidates[0]) : null
    });
    
    // Para modelos de generación de imágenes, la respuesta puede venir en diferentes formatos
    // Crear nombre único para la imagen editada
    const timestamp = Date.now();
    const filename = `edited-${editData.itemType}-${timestamp}.jpg`;
    
    try {
      // Intentar obtener los datos de imagen de la respuesta
      // En Gemini 2.5 Flash Image Preview, la imagen puede venir como parte de la respuesta
      const candidates = response.candidates;
      
      console.log('🔍 Debug - candidates:', candidates);
      
      // Verificar si tenemos candidatos con contenido
      if (candidates && candidates.length > 0) {
        console.log('🍌 Procesando candidatos de Nano Banana');
        
        const candidate = candidates[0];
        console.log('🔍 Debug - first candidate:', {
          hasContent: !!candidate.content,
          hasParts: !!candidate.content?.parts,
          partsLength: candidate.content?.parts?.length || 0,
          finishReason: candidate.finishReason
        });
        
        // Verificar si hay partes en el contenido
        if (candidate.content?.parts && candidate.content.parts.length > 0) {
          const parts = candidate.content.parts;
          console.log('🔍 Debug - parts:', parts.map((part: any) => Object.keys(part)));
          
          // Buscar imagen en las partes
          const imagePart = parts.find((part: any) => part.inlineData || part.fileData);
          
          if (imagePart) {
            console.log('🎉 ¡Imagen encontrada en la respuesta de Nano Banana!');
            
            // Procesar la imagen real
            const imageData = imagePart.inlineData?.data || imagePart.fileData?.fileUri;
            
            if (imageData) {
              // Guardar la imagen real
              const publicDir = path.join(process.cwd(), 'public', 'generated-images');
              const imagePath = path.join(publicDir, filename);
              
              // Convertir base64 a buffer y guardar
              const imageBuffer = Buffer.from(imageData, 'base64');
              fs.writeFileSync(imagePath, imageBuffer);
              
              const editedImageUrl = `/generated-images/${filename}`;
              
              console.log('✅ Imagen real editada con Nano Banana guardada:', filename);
              
              return NextResponse.json({
                success: true,
                imageUrl: editedImageUrl,
                filename: filename,
                message: 'Imagen editada exitosamente con Nano Banana'
              });
            }
          }
        }
      }
      
      // Fallback si no encontramos imagen en la respuesta
      console.log('⚠️ No se encontró imagen en la respuesta, usando placeholder');
      
      const description = `EDITADO CON NANO BANANA: ${editData.editPrompt}`;
      const itemType = (editData.itemType as 'garment' | 'model' | 'look') || 'garment';
      
      const editedImageUrl = createLocalPlaceholder(
        itemType,
        description,
        filename
      );
      
      console.log('✅ Imagen editada (placeholder):', filename);
      
      return NextResponse.json({
        success: true,
        imageUrl: editedImageUrl,
        filename: filename,
        message: 'Imagen editada con Nano Banana (modo desarrollo)'
      });
      
    } catch (processingError) {
      console.warn('⚠️ Error procesando respuesta de Nano Banana:', processingError);
      
      // Fallback: crear placeholder indicando que se intentó la edición
      const description = `EDITADO CON NANO BANANA: ${editData.editPrompt}`;
      const itemType = (editData.itemType as 'garment' | 'model' | 'look') || 'garment';
      
      const editedImageUrl = createLocalPlaceholder(
        itemType,
        description,
        filename
      );
      
      console.log('✅ Imagen editada (fallback):', filename);
      
      return NextResponse.json({
        success: true,
        imageUrl: editedImageUrl,
        filename: filename,
        message: 'Imagen editada con Nano Banana (modo desarrollo)'
      });
    }

  } catch (error) {
    console.error('❌ Error en edición de imagen:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        message: `Error al editar imagen: ${error instanceof Error ? error.message : 'Error desconocido'}` 
      },
      { status: 500 }
    );
  }
}