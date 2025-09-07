// Funciones para el lado del cliente (sin acceso a fs)

// Función para crear placeholder del lado del cliente
export function createCustomPlaceholder(type: 'garment' | 'model' | 'look', description: string): string {
  const colors = {
    garment: { bg: 'f8f9fa', text: '495057' },
    model: { bg: 'e3f2fd', text: '1565c0' },
    look: { bg: 'f3e5f5', text: '7b1fa2' }
  };
  
  const config = colors[type];
  const title = type === 'garment' ? 'PRENDA' : type === 'model' ? 'MODELO' : 'LOOK';
  const encodedDesc = encodeURIComponent(description.substring(0, 25));
  
  return `https://via.placeholder.com/400x600/${config.bg}/${config.text}?text=${title}%20IA%0A${encodedDesc}`;
}

// Función para obtener estadísticas (del lado del cliente)
export async function getImageStats() {
  try {
    const response = await fetch('/api/images');
    const data = await response.json();
    
    if (data.success) {
      return data.stats;
    } else {
      throw new Error(data.error);
    }
  } catch (error) {
    console.error('Error obteniendo estadísticas:', error);
    return {
      garments: 0,
      models: 0,
      looks: 0,
      total: 0,
      lastUpdated: new Date().toISOString()
    };
  }
}

// Función para limpiar imágenes antiguas (del lado del cliente)
export async function cleanOldImagesClient(days: number = 7) {
  try {
    const response = await fetch(`/api/images?days=${days}`, { method: 'DELETE' });
    const data = await response.json();
    
    if (data.success) {
      return data;
    } else {
      throw new Error(data.error);
    }
  } catch (error) {
    console.error('Error limpiando imágenes:', error);
    throw error;
  }
}
