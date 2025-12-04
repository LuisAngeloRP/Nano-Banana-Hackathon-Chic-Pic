// Configuración específica para Nano Banana (Gemini 2.5 Flash Image Preview - Free Tier)

// Prompts optimizados para Nano Banana
export const NANO_BANANA_PROMPTS = {
  garment: `
    CREATE IMAGE: Professional children's fashion catalog photography showing a child's garment from front and back view in the same frame.
    
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
    
    GENERATE CHILDREN'S FASHION GARMENT IMAGE NOW - NO TEXT DESCRIPTION.
  `,
  
  model: `
    CREATE IMAGE: Professional full body fashion model in underwear for fashion styling.
    
    - High definition studio photography (1024x1024)
    - Pure white seamless background
    - Professional studio lighting setup
    - Full body composition from head to feet
    - Natural confident pose
    - Professional makeup and styling
    - Model wearing only basic underwear (bra/panties for women, briefs for men)
    - NO outer clothing, NO shirts, NO pants, NO dresses
    - Ready for clothing styling and fitting
    - Commercial fashion photography quality
    - Sharp focus on entire figure
    - Perfect anatomical proportions
    
    GENERATE FULL BODY MODEL IN UNDERWEAR NOW - NO TEXT DESCRIPTION.
  `,
  
  styling: `
    CREATE IMAGE: Professional fashion photography showing a child model wearing the described outfit.
    
    VISUAL COMPOSITION INSTRUCTIONS (when images provided):
    - Use the EXACT model shown in the first image (same child)
    - Take each garment from its individual product image
    - Place/fit each garment onto the model's body
    - Maintain the model's original appearance
    - Keep the garments' original colors, textures, and design details
    - Ensure realistic fit and draping on the model's body
    
    TEXT-BASED GENERATION (when no images provided):
    - Create a professional child model wearing the described clothing
    - Use the exact garment descriptions provided
    - Maintain child-appropriate styling and poses
    - Professional commercial catalog quality
    
    TECHNICAL REQUIREMENTS:
    - High definition studio photography (1024x1024)
    - Pure white seamless background
    - Professional studio lighting
    - Commercial fashion photography quality for children's clothing
    - Child-appropriate poses and expressions
    - Moda infantil profesional
    
    GENERATE FASHION IMAGE NOW - NO TEXT DESCRIPTION.
  `
};

// Configuración de calidad para Nano Banana
export const NANO_BANANA_CONFIG = {
  resolution: {
    width: 1024,
    height: 1024
  },
  quality: 'ultra-high',
  style: 'photorealistic',
  lighting: 'studio-professional',
  background: 'pure-white',
  aspect_ratio: '1:1', // Ideal para catálogos
  garment_composition: 'dual-view', // Vista frontal y trasera
  model_composition: 'full-body', // Cuerpo completo
  enhanced_detail: true // Mayor detalle para vistas duales y cuerpo completo
};

// Función para construir prompt completo con contexto mejorado
export function buildNanoBananaPrompt(
  type: 'garment' | 'model' | 'styling',
  description: string,
  additionalContext?: string
): string {
  const basePrompt = NANO_BANANA_PROMPTS[type];
  
  // Mejorar el prompt extrayendo información clave según el tipo
  let enhancedDescription = description;
  if (type === 'garment') {
    enhancedDescription = enhanceGarmentPrompt(description);
  } else if (type === 'model') {
    enhancedDescription = enhanceModelPrompt(description);
  }
  
    return `
    ${basePrompt}
    
    SPECIFIC REQUIREMENTS: ${enhancedDescription}
    
    ${additionalContext ? `ADDITIONAL CONTEXT: ${additionalContext}` : ''}
    
    GENERATE IMAGE NOW - NO TEXT DESCRIPTION.
  `.trim();
}

// Función para mejorar prompts específicos de prendas
function enhanceGarmentPrompt(description: string): string {
  // Extraer información específica si está estructurada
  const parts = description.split('|').map(part => part.trim());
  
  let enhanced = 'Children\'s clothing item. ';
  
  if (parts.length > 1) {
    // Es una descripción estructurada, mejorarla
    parts.forEach(part => {
      if (part.includes('Color principal:')) {
        const color = part.replace('Color principal:', '').trim();
        enhanced += `Primary color: ${color}. `;
      } else if (part.includes('Tallas disponibles:')) {
        const sizes = part.replace('Tallas disponibles:', '').trim();
        enhanced += `Available sizes for children: ${sizes}. `;
      } else if (part.includes('CAMISETA:') || part.includes('PANTALON:') || 
                 part.includes('VESTIDO:') || part.includes('FALDA:') ||
                 part.includes('CAMISA:') || part.includes('CHAQUETA:') ||
                 part.includes('ZAPATOS:') || part.includes('ACCESORIOS:')) {
        enhanced += `Children's ${part}. `;
      } else if (part.includes('Descripción:')) {
        const desc = part.replace('Descripción:', '').trim();
        enhanced += `Details for children's clothing: ${desc}. `;
      }
    });
    
    return enhanced.trim();
  }
  
  // Si no es estructurada, agregar contexto de moda infantil
  return `Children's clothing item. ${description}`;
}

// Función para mejorar prompts específicos de modelos
function enhanceModelPrompt(description: string): string {
  // Extraer información específica si está estructurada
  const parts = description.split('|').map(part => part.trim());
  
  if (parts.length > 1) {
    // Es una descripción estructurada, mejorarla
    let enhanced = '';
    
    parts.forEach(part => {
      if (part.includes('MODEL:')) {
        enhanced += `${part}. `;
      } else if (part.includes('Gender:')) {
        enhanced += `${part}. `;
      } else if (part.includes('Age:')) {
        enhanced += `${part}. `;
      } else if (part.includes('Height:')) {
        enhanced += `${part}. `;
      } else if (part.includes('Body type:')) {
        enhanced += `${part}. `;
      } else if (part.includes('Hair color:')) {
        enhanced += `${part}. `;
      } else if (part.includes('Eye color:')) {
        enhanced += `${part}. `;
      } else if (part.includes('Skin tone:')) {
        enhanced += `${part}. `;
      } else if (part.includes('Additional features:')) {
        const features = part.replace('Additional features:', '').trim();
        enhanced += `Special characteristics: ${features}. `;
      }
    });
    
    return enhanced.trim();
  }
  
  // Si no es estructurada, devolver tal como está
  return description;
}

// Parámetros de generación optimizados
export const GENERATION_PARAMS = {
  garment: {
    focus: 'dual_view_children_product',
    emphasis: 'front_and_back_texture_detail_children_clothing',
    lighting_setup: 'dual_product_photography_children',
    composition: 'front_and_back_view_children_garment',
    estimated_time: 20 // segundos (aumentado por complejidad dual)
  },
  model: {
    focus: 'full_body_portrait',
    emphasis: 'complete_figure_beauty',
    lighting_setup: 'full_body_studio',
    composition: 'head_to_feet',
    estimated_time: 25 // segundos (aumentado por cuerpo completo)
  },
  styling: {
    focus: 'fashion_editorial',
    emphasis: 'overall_composition',
    lighting_setup: 'fashion_photography',
    composition: 'model_with_garment',
    estimated_time: 30 // segundos (aumentado por complejidad)
  }
};

// Función para validar respuesta de Nano Banana
export function validateNanoBananaResponse(response: unknown): boolean {
  // Validaciones básicas para asegurar que la respuesta es válida
  if (!response) return false;
  
  // Aquí irían las validaciones específicas según la API real de Nano Banana
  // Por ejemplo: verificar que se recibió una imagen, validar formato, etc.
  
  return true;
}

// Función para procesar imagen de Nano Banana
export function processNanoBananaImage(imageData: unknown, filename: string): string {
  // Aquí iría el procesamiento específico de la imagen de Nano Banana
  // Por ejemplo: optimización, redimensionado, compresión, etc.
  
  // Por ahora retornamos la URL local estándar
  return `/generated-images/${filename}`;
}

// Función para generar imagen editada con Nano Banana
export async function generateEditedImage(
  type: 'garment' | 'model' | 'look',
  originalItem: { imageUrl: string } & Record<string, unknown>,
  editPrompt: string,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _originalDescription: string
): Promise<string> {
  try {
    console.log('Editando imagen con Nano Banana:', {
      type,
      imageUrl: originalItem.imageUrl,
      editPrompt
    });
    
    // Usar la nueva función de edición de imágenes
    const { editImageWithPrompt } = await import('./gemini');
    
    const editedImageUrl = await editImageWithPrompt(
      originalItem.imageUrl,
      editPrompt,
      type
    );
    
    return editedImageUrl;
    
  } catch (error) {
    console.error('Error en generateEditedImage:', error);
    // Si hay error con la API, mostrar mensaje más útil
    if (error instanceof Error && error.message.includes('API key')) {
      throw new Error('Error: API key no configurada. Ve a la sección "Acerca" para ver las instrucciones de configuración.');
    } else {
      throw new Error('Error al generar la imagen editada. Verifica tu conexión y configuración de API.');
    }
  }
}

// Función para construir prompt específico de edición (no utilizada actualmente)
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function buildEditingPrompt(
  type: 'garment' | 'model' | 'look',
  originalItem: { imageUrl?: string; name?: string; category?: string; color?: string; gender?: string; age?: string; bodyType?: string; hairColor?: string; eyeColor?: string; skinTone?: string; garmentIds?: string[] } & Record<string, unknown>,
  editPrompt: string,
  originalDescription: string
): string {
  const baseEditPrompt = NANO_BANANA_EDIT_PROMPTS[type];
  
  let contextualInfo = '';
  
  switch (type) {
    case 'garment':
      contextualInfo = `
        PRENDA ORIGINAL:
        - Nombre: ${originalItem.name}
        - Categoría: ${originalItem.category}
        - Color: ${originalItem.color || 'No especificado'}
        - Descripción: ${originalDescription}
      `;
      break;
      
    case 'model':
      contextualInfo = `
        MODELO ORIGINAL:
        - Nombre: ${originalItem.name}
        - Género: ${originalItem.gender}
        - Edad: ${originalItem.age}
        - Tipo de cuerpo: ${originalItem.bodyType}
        - Cabello: ${originalItem.hairColor}
        - Ojos: ${originalItem.eyeColor}
        - Piel: ${originalItem.skinTone}
        - Características: ${originalDescription}
      `;
      break;
      
    case 'look':
      contextualInfo = `
        LOOK ORIGINAL:
        - Nombre: ${originalItem.name}
        - Descripción: ${originalDescription}
        - Número de prendas: ${originalItem.garmentIds?.length || 0}
      `;
      break;
  }
  
  return `
    ${baseEditPrompt}
    
    ${contextualInfo}
    
    CAMBIOS SOLICITADOS: ${editPrompt}
    
    INSTRUCCIONES ESPECÍFICAS:
    - Mantén la calidad profesional de la imagen original
    - Aplica solo los cambios solicitados
    - Preserva el estilo general y composición
    - Mantén la iluminación y fondo profesional
    - Asegúrate de que el resultado sea coherente y realista
    
    GENERATE EDITED IMAGE NOW - NO TEXT DESCRIPTION.
  `.trim();
}

// Prompts específicos para edición con Nano Banana
export const NANO_BANANA_EDIT_PROMPTS = {
  garment: `
    EDIT IMAGE: Modify the existing children's fashion garment image based on specific instructions.
    
    - Maintain high definition studio photography (1024x1024)
    - Keep pure white seamless background
    - Preserve professional softbox lighting
    - Maintain commercial catalog quality for children's clothing
    - Apply only the requested modifications
    - Keep the dual view composition (front and back)
    - Ensure the garment remains wrinkle-free and professional
    - Preserve sharp details and vibrant, child-friendly colors
    - Maintain children's clothing proportions and sizing
  `,
  
  model: `
    EDIT IMAGE: Modify the existing fashion model image based on specific instructions.
    
    - Maintain high definition studio photography (1024x1024)
    - Keep pure white seamless background
    - Preserve professional studio lighting setup
    - Maintain full body composition from head to feet
    - Apply only the requested modifications
    - Keep natural confident pose
    - Preserve professional makeup and styling quality
    - Maintain perfect anatomical proportions
  `,
  
  look: `
    EDIT IMAGE: Modify the existing styled look image based on specific instructions.
    
    - Maintain high definition fashion photography (1024x1024)
    - Keep pure white seamless background
    - Preserve professional fashion photography lighting
    - Apply only the requested modifications
    - Ensure garments fit perfectly on the model
    - Maintain overall composition and styling quality
    - Keep commercial catalog professional appearance
  `
};

// Función para validar prompt de edición
export function validateEditPrompt(prompt: string): boolean {
  if (!prompt || prompt.trim().length < 10) {
    return false;
  }
  
  // Verificar que no contenga contenido inapropiado
  const inappropriateTerms = ['nude', 'naked', 'sexual', 'inappropriate'];
  const lowerPrompt = prompt.toLowerCase();
  
  return !inappropriateTerms.some(term => lowerPrompt.includes(term));
}

