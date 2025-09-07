// Prompts específicos optimizados para generar modelos con Nano Banana
// Gemini 2.5 Flash Image Preview tiene restricciones especiales para personas

export const NANO_BANANA_MODEL_PROMPTS = {
  // Prompt principal en inglés (más efectivo para Nano Banana)
  primary: `
    Create a hyper-realistic fashion model portrait for a premium fashion catalog.

    TECHNICAL SPECIFICATIONS:
    - Resolution: Ultra high definition (minimum 1024x1024)
    - Background: Pure white seamless studio backdrop
    - Lighting: Professional studio setup with soft key lighting
    - Style: High-end fashion photography, commercial catalog quality
    - Format: Professional fashion model headshot or portrait

    MODEL REQUIREMENTS:
    - Professional fashion model appearance
    - Natural, confident expression
    - Perfect modeling posture
    - Professional makeup and styling
    - Neutral or minimal clothing/styling
    - Commercial catalog suitable appearance
    - Clean, professional aesthetic

    QUALITY STANDARDS:
    - Photorealistic commercial photography quality
    - Sharp focus on facial features
    - Professional lighting without harsh shadows
    - Clear, bright composition
    - Fashion industry standard quality

    Generate fashion model photo now.
  `,

  // Prompt alternativo si el principal falla
  alternative: `
    Professional fashion photography of a model for a high-end catalog.
    
    Requirements:
    - Studio photography with white background
    - Professional model with natural makeup
    - Fashion catalog quality
    - Clean, commercial aesthetic
    - High resolution and sharp details
    
    Create this fashion model image.
  `,

  // Prompt más simple como último recurso
  simple: `
    Fashion model portrait photo for catalog.
    White background, professional lighting, high quality.
    Commercial fashion photography style.
  `
};

// Configuración especial para modelos
export const MODEL_GENERATION_CONFIG = {
  // Más intentos para modelos debido a restricciones de Nano Banana
  maxRetries: 3,
  
  // Estrategia de fallback
  fallbackStrategy: [
    'primary',
    'alternative', 
    'simple'
  ],
  
  // Parámetros específicos para modelos
  generationParams: {
    temperature: 0.6, // Más conservador para modelos
    topP: 0.7,
    topK: 30,
    maxOutputTokens: 8192
  },
  
  // Tiempo estimado aumentado
  estimatedTime: 30 // segundos
};

// Función para construir prompt de modelo con fallbacks
export function buildModelPrompt(
  description: string,
  attemptNumber: number = 1
): string {
  let promptKey: keyof typeof NANO_BANANA_MODEL_PROMPTS;
  
  // Seleccionar prompt según el número de intento
  if (attemptNumber === 1) {
    promptKey = 'primary';
  } else if (attemptNumber === 2) {
    promptKey = 'alternative';
  } else {
    promptKey = 'simple';
  }
  
  const basePrompt = NANO_BANANA_MODEL_PROMPTS[promptKey];
  
  return `
    ${basePrompt}
    
    Model description: ${description}
    
    Important: This image will be used in a professional fashion catalog called "Chic Pic".
    Quality must be exceptional and commercially viable.
    
    Generate the fashion model photo now.
  `.trim();
}

// Función para validar si una descripción es apropiada para modelos
export function validateModelDescription(description: string): {
  isValid: boolean;
  suggestions?: string[];
  issues?: string[];
} {
  const issues: string[] = [];
  const suggestions: string[] = [];
  
  // Palabras que pueden causar problemas con modelos
  const problematicWords = [
    'sexy', 'provocative', 'sensual', 'nude', 'naked',
    'revealing', 'intimate', 'seductive'
  ];
  
  // Buscar palabras problemáticas
  const lowerDesc = description.toLowerCase();
  problematicWords.forEach(word => {
    if (lowerDesc.includes(word)) {
      issues.push(`La palabra "${word}" puede causar restricciones`);
      suggestions.push(`Usar términos más comerciales como "elegante", "profesional", "sofisticado"`);
    }
  });
  
  // Verificar que tenga información básica
  const hasGender = /género|gender|masculino|femenino|male|female/i.test(description);
  const hasAge = /edad|age|\d+\s*(años|years|año)/i.test(description);
  
  if (!hasGender) {
    suggestions.push('Especificar género del modelo');
  }
  
  if (!hasAge) {
    suggestions.push('Especificar edad aproximada');
  }
  
  return {
    isValid: issues.length === 0,
    issues: issues.length > 0 ? issues : undefined,
    suggestions: suggestions.length > 0 ? suggestions : undefined
  };
}

// Función para limpiar descripción de modelo
export function sanitizeModelDescription(description: string): string {
  let cleaned = description;
  
  // Reemplazar términos problemáticos con alternativas seguras
  const replacements: Record<string, string> = {
    'sexy': 'elegante',
    'provocative': 'sofisticado',
    'sensual': 'atractivo',
    'revealing': 'moderno',
    'seductive': 'carismático'
  };
  
  Object.entries(replacements).forEach(([problematic, safe]) => {
    const regex = new RegExp(problematic, 'gi');
    cleaned = cleaned.replace(regex, safe);
  });
  
  return cleaned;
}

// Tipos para TypeScript
export interface ModelGenerationResult {
  success: boolean;
  prompt: string;
  attemptNumber: number;
  fallbackUsed: boolean;
  sanitizedDescription?: string;
  validationIssues?: string[];
}
