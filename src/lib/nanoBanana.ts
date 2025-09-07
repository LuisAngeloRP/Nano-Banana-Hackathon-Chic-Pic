// Configuración específica para Nano Banana (Gemini 2.5 Flash Image)

// Prompts optimizados para Nano Banana
export const NANO_BANANA_PROMPTS = {
  garment: `
    CREATE IMAGE: Professional fashion catalog photography showing a garment from front and back view in the same frame.
    
    - High definition studio photography (1024x1024)
    - Pure white seamless background
    - Professional softbox lighting on both views
    - Commercial catalog quality dual composition
    - Front and back view of the garment side by side
    - No human model, garment only
    - Premium fashion photography style
    - Sharp details and vibrant colors
    - Clean, wrinkle-free presentation
    
    GENERATE FASHION GARMENT IMAGE NOW - NO TEXT DESCRIPTION.
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
    Viste a la modelo con las prendas brindadas. La ropa debe ajustarse perfectamente al cuerpo del modelo. Imagen de catálogo profesional con fondo blanco.
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
  
  if (parts.length > 1) {
    // Es una descripción estructurada, mejorarla
    let enhanced = '';
    
    parts.forEach(part => {
      if (part.includes('Color principal:')) {
        const color = part.replace('Color principal:', '').trim();
        enhanced += `Primary color: ${color}. `;
      } else if (part.includes('Tallas disponibles:')) {
        const sizes = part.replace('Tallas disponibles:', '').trim();
        enhanced += `Available sizes: ${sizes}. `;
      } else if (part.includes('CAMISETA:') || part.includes('PANTALON:') || 
                 part.includes('VESTIDO:') || part.includes('FALDA:') ||
                 part.includes('CAMISA:') || part.includes('CHAQUETA:') ||
                 part.includes('ZAPATOS:') || part.includes('ACCESORIOS:')) {
        enhanced += `${part}. `;
      } else if (part.includes('Descripción:')) {
        const desc = part.replace('Descripción:', '').trim();
        enhanced += `Details: ${desc}. `;
      }
    });
    
    return enhanced.trim();
  }
  
  // Si no es estructurada, devolver tal como está
  return description;
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
    focus: 'dual_view_product',
    emphasis: 'front_and_back_texture_detail',
    lighting_setup: 'dual_product_photography',
    composition: 'front_and_back_view',
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
export function validateNanoBananaResponse(response: any): boolean {
  // Validaciones básicas para asegurar que la respuesta es válida
  if (!response) return false;
  
  // Aquí irían las validaciones específicas según la API real de Nano Banana
  // Por ejemplo: verificar que se recibió una imagen, validar formato, etc.
  
  return true;
}

// Función para procesar imagen de Nano Banana
export function processNanoBananaImage(imageData: any, filename: string): string {
  // Aquí iría el procesamiento específico de la imagen de Nano Banana
  // Por ejemplo: optimización, redimensionado, compresión, etc.
  
  // Por ahora retornamos la URL local estándar
  return `/generated-images/${filename}`;
}
