// Prompts específicos optimizados para generar modelos con Nano Banana
// Gemini 2.5 Flash Image Preview tiene restricciones especiales para personas

export const NANO_BANANA_MODEL_PROMPTS = {
  // Prompt principal en inglés (más efectivo para Nano Banana)
  primary: `
    CREATE IMAGE: Professional full body fashion model for premium catalog photography.
    
    - Ultra high definition studio photography (1024x1024)
    - Pure white seamless background
    - Professional studio lighting setup
    - Full body shot from head to feet
    - Natural confident modeling pose
    - Professional makeup and styling
    - Minimal neutral clothing/underwear
    - Commercial catalog quality
    - Sharp focus entire figure
    - Perfect anatomical proportions
    - Fashion industry standard
    
    GENERATE FULL BODY FASHION MODEL IMAGE NOW - NO TEXT DESCRIPTION.
  `,

  // Prompt alternativo si el principal falla
  alternative: `
    CREATE IMAGE: Full body fashion model for high-end catalog.
    
    - Studio photography white background
    - Professional model natural makeup
    - Full body head to feet visible
    - Fashion catalog quality
    - Clean commercial aesthetic
    - High resolution sharp details
    
    GENERATE FULL BODY MODEL IMAGE NOW - NO TEXT.
  `,

  // Prompt más simple como último recurso
  simple: `
    CREATE IMAGE: Full body fashion model photo.
    White background, professional lighting, catalog quality.
    GENERATE IMAGE NOW - NO TEXT.
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
