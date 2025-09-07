// Configuración específica para Nano Banana (Gemini 2.5 Flash Image)

// Prompts optimizados para Nano Banana
export const NANO_BANANA_PROMPTS = {
  garment: `
    Genera una imagen hiperrealista de una prenda de vestir para catálogo de moda de alta gama.
    
    Especificaciones técnicas:
    - Resolución: Alta definición (mínimo 1024x1024)
    - Iluminación: Softbox profesional con sombras suaves
    - Fondo: Blanco puro (#FFFFFF) sin texturas
    - Ángulo: Frontal centrado con ligera perspectiva 3/4
    - Estilo: Fotografía comercial de lujo, estilo editorial
    
    Características de la prenda:
    - Presentación impecable sin arrugas
    - Colores vibrantes y precisos
    - Texturas claramente definidas
    - Detalles de costura y materiales visibles
    - Sin modelo humano, solo la prenda
    
    Calidad requerida:
    - Fotorrealismo nivel catálogo premium
    - Nitidez cristalina en todos los detalles
    - Colores calibrados para impresión
    - Composición centrada y equilibrada
  `,
  
  model: `
    Genera una imagen hiperrealista de un modelo profesional para catálogo de moda.
    
    Especificaciones técnicas:
    - Resolución: Alta definición (mínimo 1024x1024)
    - Iluminación: Setup de estudio profesional con luz principal y de relleno
    - Fondo: Blanco puro (#FFFFFF) sin gradientes
    - Pose: Natural, elegante, apropiada para moda
    - Estilo: Fotografía de retrato comercial de alta gama
    
    Características del modelo:
    - Expresión neutra pero atractiva
    - Postura confiada y profesional
    - Maquillaje natural y profesional
    - Cabello bien peinado y estilizado
    - Ropa interior neutra o ropa básica simple
    
    Calidad requerida:
    - Realismo fotográfico nivel editorial
    - Piel con textura natural sin sobreexposición
    - Ojos enfocados y expresivos
    - Composición desde cintura hacia arriba o cuerpo completo
    - Proporciones anatómicas perfectas
  `,
  
  styling: `
    Genera una imagen hiperrealista combinando un modelo y prendas específicas para crear un look de catálogo de moda profesional.
    
    Especificaciones técnicas:
    - Resolución: Alta definición (mínimo 1024x1024)
    - Iluminación: Setup completo de estudio con múltiples fuentes
    - Fondo: Blanco puro (#FFFFFF) infinito
    - Composición: Cuerpo completo o 3/4 según la prenda
    - Estilo: Fotografía editorial de moda de lujo
    
    Características del styling:
    - Ajuste perfecto de todas las prendas al modelo
    - Caída natural de la ropa
    - Coordinación de colores y estilos
    - Pose que realce las prendas
    - Expresión que complemente el estilo
    
    Calidad requerida:
    - Fotorrealismo nivel campaña publicitaria
    - Interacción natural entre modelo y ropa
    - Sombras y pliegues realistas
    - Colores precisos y vibrantes
    - Composición que destaque tanto modelo como prendas
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
  aspect_ratio: '1:1' // Ideal para catálogos
};

// Función para construir prompt completo con contexto
export function buildNanoBananaPrompt(
  type: 'garment' | 'model' | 'styling',
  description: string,
  additionalContext?: string
): string {
  const basePrompt = NANO_BANANA_PROMPTS[type];
  
  return `
    ${basePrompt}
    
    Descripción específica: ${description}
    
    ${additionalContext ? `Contexto adicional: ${additionalContext}` : ''}
    
    Recordatorio: Esta imagen será utilizada en un catálogo profesional de moda llamado "Chic Pic".
    La calidad debe ser excepcional y comercialmente viable.
    
    Generar imagen ahora.
  `.trim();
}

// Parámetros de generación optimizados
export const GENERATION_PARAMS = {
  garment: {
    focus: 'product',
    emphasis: 'texture_and_detail',
    lighting_setup: 'product_photography',
    estimated_time: 15 // segundos
  },
  model: {
    focus: 'portrait',
    emphasis: 'natural_beauty',
    lighting_setup: 'beauty_portrait',
    estimated_time: 20 // segundos
  },
  styling: {
    focus: 'fashion_editorial',
    emphasis: 'overall_composition',
    lighting_setup: 'fashion_photography',
    estimated_time: 25 // segundos
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
