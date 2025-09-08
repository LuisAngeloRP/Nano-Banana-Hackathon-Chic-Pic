// Funciones de almacenamiento de imágenes que funcionan en el cliente
// Separadas de las funciones de servidor para evitar errores de importación

/**
 * Convierte una imagen de Gemini (que viene como base64) a formato data URI
 */
export function formatImageAsDataURI(base64Data: string, mimeType: string = 'image/jpeg'): string {
  // Si ya es un data URI, devolverlo tal como está
  if (base64Data.startsWith('data:')) {
    return base64Data;
  }
  
  // Convertir base64 simple a data URI
  return `data:${mimeType};base64,${base64Data}`;
}

/**
 * Extrae solo los datos base64 de un data URI
 */
export function extractBase64FromDataURI(dataURI: string): string {
  if (!dataURI.startsWith('data:')) {
    return dataURI; // Ya es base64 puro
  }
  
  const base64Index = dataURI.indexOf('base64,');
  if (base64Index === -1) {
    return dataURI; // No es base64
  }
  
  return dataURI.substring(base64Index + 7);
}

/**
 * Genera un placeholder en base64 cuando no se puede generar la imagen real
 */
export function createBase64Placeholder(
  type: 'garment' | 'model' | 'look', 
  description: string,
  width: number = 400,
  height: number = 600
): string {
  // Crear SVG placeholder
  const svg = `
    <svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#f3f4f6;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#e5e7eb;stop-opacity:1" />
        </linearGradient>
      </defs>
      <rect width="100%" height="100%" fill="url(#grad)"/>
      <circle cx="${width/2}" cy="${height/3}" r="40" fill="#d1d5db" opacity="0.7"/>
      <rect x="${width/2 - 60}" y="${height/2}" width="120" height="80" rx="8" fill="#d1d5db" opacity="0.7"/>
      <text x="${width/2}" y="${height * 0.8}" text-anchor="middle" font-family="Arial, sans-serif" font-size="14" fill="#6b7280">
        ${type.toUpperCase()}
      </text>
      <text x="${width/2}" y="${height * 0.85}" text-anchor="middle" font-family="Arial, sans-serif" font-size="11" fill="#9ca3af">
        ${description.length > 30 ? description.substring(0, 30) + '...' : description}
      </text>
    </svg>
  `.trim();
  
  // Convertir SVG a base64
  const base64SVG = Buffer.from(svg).toString('base64');
  return `data:image/svg+xml;base64,${base64SVG}`;
}

/**
 * Valida si una cadena es un base64 válido
 */
export function isValidBase64(str: string): boolean {
  try {
    // Extraer base64 si es data URI
    const base64Data = extractBase64FromDataURI(str);
    
    // Verificar formato base64
    const base64Regex = /^[A-Za-z0-9+/]*={0,2}$/;
    if (!base64Regex.test(base64Data)) {
      return false;
    }
    
    // Intentar decodificar
    const decoded = Buffer.from(base64Data, 'base64').toString('base64');
    return decoded === base64Data;
  } catch {
    return false;
  }
}

/**
 * Obtiene información sobre una imagen base64
 */
export function getBase64ImageInfo(base64Data: string): {
  mimeType: string;
  size: number;
  isDataURI: boolean;
} {
  const isDataURI = base64Data.startsWith('data:');
  let mimeType = 'image/jpeg';
  
  if (isDataURI) {
    const mimeMatch = base64Data.match(/data:([^;]+);base64,/);
    if (mimeMatch) {
      mimeType = mimeMatch[1];
    }
  }
  
  const base64Only = extractBase64FromDataURI(base64Data);
  const size = Math.round((base64Only.length * 3) / 4); // Tamaño aproximado en bytes
  
  return {
    mimeType,
    size,
    isDataURI
  };
}

/**
 * Comprime una imagen base64 (simplificado)
 * En una implementación real, usarías una librería como sharp o canvas
 */
export function compressBase64Image(base64Data: string, quality: number = 0.8): string {
  // Para este ejemplo, simplemente retornamos la imagen original
  // En producción, implementarías compresión real aquí
  console.log(`Compresión simulada con calidad ${quality}`);
  return base64Data;
}

// Funciones de compatibilidad con el sistema anterior
export const createCustomPlaceholder = createBase64Placeholder;
export const generateFileName = (type: string, description: string) => {
  const timestamp = Date.now();
  const cleanDesc = description.toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\s+/g, '-')
    .substring(0, 20);
  return `${type}-${cleanDesc}-${timestamp}`;
};