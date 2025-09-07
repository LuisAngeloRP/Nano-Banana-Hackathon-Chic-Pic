import fs from 'fs';
import path from 'path';

// Directorio donde se guardarán las imágenes
const IMAGES_DIR = path.join(process.cwd(), 'public', 'generated-images');

// Crear directorio si no existe
export function ensureImagesDirectory() {
  if (!fs.existsSync(IMAGES_DIR)) {
    fs.mkdirSync(IMAGES_DIR, { recursive: true });
    console.log('📁 Directorio de imágenes creado:', IMAGES_DIR);
  }
}

// Función para generar nombre único de archivo
export function generateFileName(type: 'garment' | 'model' | 'look', description: string): string {
  const timestamp = Date.now();
  const sanitizedDesc = description
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 30);
  
  return `${type}-${sanitizedDesc}-${timestamp}.svg`;
}

// Función para crear imagen placeholder local (genera archivo SVG mejorado)
export function createLocalPlaceholder(type: 'garment' | 'model' | 'look', description: string, filename: string): string {
  try {
    ensureImagesDirectory();
    
    const filePath = path.join(IMAGES_DIR, filename);
    
    // Configuración de colores y estilos
    const configs = {
      garment: {
        bg: '#f8f9fa',
        primary: '#495057',
        secondary: '#6c757d',
        accent: '#e9ecef',
        icon: '👔',
        title: 'PRENDA GENERADA'
      },
      model: {
        bg: '#e3f2fd',
        primary: '#1565c0',
        secondary: '#1976d2',
        accent: '#bbdefb',
        icon: '👤',
        title: 'MODELO GENERADO'
      },
      look: {
        bg: '#f3e5f5',
        primary: '#7b1fa2',
        secondary: '#8e24aa',
        accent: '#e1bee7',
        icon: '✨',
        title: 'LOOK GENERADO'
      }
    };
    
    const config = configs[type];
    const shortDesc = description.substring(0, 40);
    const lines = shortDesc.match(/.{1,20}/g) || [shortDesc];
    
    // Crear SVG profesional con mejor diseño
    const svgContent = `
      <svg width="400" height="600" xmlns="http://www.w3.org/2000/svg">
        <!-- Fondo con gradiente sutil -->
        <defs>
          <linearGradient id="bg-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:${config.bg};stop-opacity:1" />
            <stop offset="100%" style="stop-color:${config.accent};stop-opacity:1" />
          </linearGradient>
          <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="2" dy="2" stdDeviation="3" flood-color="rgba(0,0,0,0.1)"/>
          </filter>
        </defs>
        
        <!-- Fondo -->
        <rect width="400" height="600" fill="url(#bg-gradient)"/>
        
        <!-- Contenedor principal -->
        <rect x="20" y="150" width="360" height="300" fill="white" rx="12" filter="url(#shadow)" opacity="0.95"/>
        
        <!-- Icono -->
        <text x="200" y="200" text-anchor="middle" font-size="48">
          ${config.icon}
        </text>
        
        <!-- Título -->
        <text x="200" y="240" text-anchor="middle" font-family="Arial, sans-serif" font-size="16" font-weight="bold" fill="${config.primary}">
          ${config.title}
        </text>
        
        <!-- Línea decorativa -->
        <line x1="150" y1="250" x2="250" y2="250" stroke="${config.secondary}" stroke-width="2"/>
        
        <!-- Descripción -->
        ${lines.map((line, index) => `
          <text x="200" y="${280 + index * 20}" text-anchor="middle" font-family="Arial, sans-serif" font-size="12" fill="${config.secondary}">
            ${line.trim()}
          </text>
        `).join('')}
        
        <!-- Marca -->
        <text x="200" y="420" text-anchor="middle" font-family="Arial, sans-serif" font-size="10" fill="${config.primary}" opacity="0.7">
          Generado con Nano Banana IA
        </text>
        
        <!-- Timestamp -->
        <text x="200" y="440" text-anchor="middle" font-family="Arial, sans-serif" font-size="8" fill="${config.secondary}" opacity="0.5">
          ${new Date().toLocaleString()}
        </text>
        
        <!-- Bordes decorativos -->
        <rect x="10" y="10" width="380" height="580" fill="none" stroke="${config.accent}" stroke-width="2" rx="8"/>
        <rect x="15" y="15" width="370" height="570" fill="none" stroke="${config.primary}" stroke-width="1" rx="6" opacity="0.3"/>
      </svg>
    `;
    
    // Guardar archivo SVG
    fs.writeFileSync(filePath, svgContent.trim());
    
    console.log(`💾 Placeholder SVG ${type} creado:`, filename);
    return `/generated-images/${filename}`;
    
  } catch (error) {
    console.error('Error creando placeholder local:', error);
    // Fallback a URL externa si falla completamente
    const colors = {
      garment: 'f8f9fa',
      model: 'e3f2fd',
      look: 'f3e5f5'
    };
    
    const color = colors[type];
    const title = type === 'garment' ? 'PRENDA' : type === 'model' ? 'MODELO' : 'LOOK';
    const encodedDesc = encodeURIComponent(description.substring(0, 25));
    
    return `https://via.placeholder.com/400x600/${color}/333?text=${title}%20IA%0A${encodedDesc}`;
  }
}

// Función para obtener lista de imágenes guardadas
export function getStoredImages(): { garments: string[], models: string[], looks: string[] } {
  try {
    ensureImagesDirectory();
    
    const files = fs.readdirSync(IMAGES_DIR).filter(f => f !== '.gitignore' && f !== 'README.md');
    
    return {
      garments: files.filter(f => f.startsWith('garment-')),
      models: files.filter(f => f.startsWith('model-')),
      looks: files.filter(f => f.startsWith('look-'))
    };
  } catch (error) {
    console.error('Error leyendo imágenes guardadas:', error);
    return { garments: [], models: [], looks: [] };
  }
}

// Función para limpiar imágenes antiguas (opcional)
export function cleanOldImages(daysOld: number = 7): void {
  try {
    ensureImagesDirectory();
    
    const files = fs.readdirSync(IMAGES_DIR).filter(f => f !== '.gitignore' && f !== 'README.md');
    const cutoffTime = Date.now() - (daysOld * 24 * 60 * 60 * 1000);
    
    let deletedCount = 0;
    
    files.forEach(file => {
      const filePath = path.join(IMAGES_DIR, file);
      const stats = fs.statSync(filePath);
      
      if (stats.mtime.getTime() < cutoffTime) {
        fs.unlinkSync(filePath);
        deletedCount++;
      }
    });
    
    if (deletedCount > 0) {
      console.log(`🧹 ${deletedCount} imágenes antiguas eliminadas`);
    }
  } catch (error) {
    console.error('Error limpiando imágenes antiguas:', error);
  }
}

// Función para guardar imagen real (cuando esté disponible la API de Nano Banana)
export async function saveRealImageLocally(imageData: Buffer | string, filename: string): Promise<string> {
  try {
    ensureImagesDirectory();
    
    // Cambiar extensión a jpg para imágenes reales
    const realFilename = filename.replace('.svg', '.jpg');
    const filePath = path.join(IMAGES_DIR, realFilename);
    
    if (typeof imageData === 'string' && imageData.startsWith('data:')) {
      // Si es una imagen base64
      const base64Data = imageData.replace(/^data:image\/\w+;base64,/, '');
      fs.writeFileSync(filePath, base64Data, 'base64');
    } else if (Buffer.isBuffer(imageData)) {
      // Si es un buffer
      fs.writeFileSync(filePath, imageData);
    } else {
      throw new Error('Formato de imagen no soportado');
    }
    
    console.log('💾 Imagen real de Nano Banana guardada:', realFilename);
    return `/generated-images/${realFilename}`;
    
  } catch (error) {
    console.error('Error guardando imagen real:', error);
    throw error;
  }
}