/**
 * Sistema de caché inteligente para imágenes base64
 * Combina caché en memoria, IndexedDB y optimizaciones de rendimiento
 */

// Caché en memoria para acceso rápido
const memoryCache = new Map<string, string>();
const cacheTimestamps = new Map<string, number>();

// Configuración del caché
const CACHE_CONFIG = {
  // Tiempo de vida del caché (24 horas)
  TTL: 24 * 60 * 60 * 1000,
  // Máximo de imágenes en memoria (50 imágenes)
  MAX_MEMORY_ITEMS: 50,
  // Tamaño máximo en memoria (50MB aproximadamente)
  MAX_MEMORY_SIZE: 50 * 1024 * 1024,
  // Nombre de la base de datos IndexedDB
  DB_NAME: 'ChicPicImageCache',
  DB_VERSION: 1,
  STORE_NAME: 'images'
};

interface CachedImage {
  id: string;
  base64: string;
  timestamp: number;
  size: number;
  compressed?: string; // Versión comprimida para thumbnails
}

class ImageCacheManager {
  private db: IDBDatabase | null = null;
  private currentMemorySize = 0;
  private isClient = false;

  constructor() {
    // Solo inicializar en el cliente
    this.isClient = typeof window !== 'undefined';
    if (this.isClient) {
      this.initDB();
    }
  }

  /**
   * Inicializar IndexedDB
   */
  private async initDB(): Promise<void> {
    // Solo funciona en el cliente
    if (!this.isClient || typeof indexedDB === 'undefined') {
      return Promise.resolve();
    }

    return new Promise((resolve, reject) => {
      const request = indexedDB.open(CACHE_CONFIG.DB_NAME, CACHE_CONFIG.DB_VERSION);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(CACHE_CONFIG.STORE_NAME)) {
          const store = db.createObjectStore(CACHE_CONFIG.STORE_NAME, { keyPath: 'id' });
          store.createIndex('timestamp', 'timestamp', { unique: false });
        }
      };
    });
  }

  /**
   * Generar clave de caché única
   */
  private generateCacheKey(base64: string): string {
    // Usar hash simple del contenido para generar ID único
    let hash = 0;
    const str = base64.substring(0, 100); // Solo los primeros 100 caracteres para eficiencia
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convertir a 32-bit integer
    }
    return `img_${Math.abs(hash)}`;
  }

  /**
   * Comprimir imagen base64 para thumbnails
   */
  private compressImage(base64: string, quality: number = 0.7): Promise<string> {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d')!;

        // Reducir dimensiones para thumbnails
        const maxWidth = 300;
        const maxHeight = 300;
        let { width, height } = img;

        if (width > height) {
          if (width > maxWidth) {
            height = (height * maxWidth) / width;
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = (width * maxHeight) / height;
            height = maxHeight;
          }
        }

        canvas.width = width;
        canvas.height = height;

        ctx.drawImage(img, 0, 0, width, height);
        const compressedBase64 = canvas.toDataURL('image/jpeg', quality);
        resolve(compressedBase64);
      };
      img.src = base64;
    });
  }

  /**
   * Obtener imagen del caché
   */
  async getImage(base64: string, useCompressed: boolean = false): Promise<string | null> {
    // Si no está en el cliente, devolver null
    if (!this.isClient) {
      return null;
    }

    const cacheKey = this.generateCacheKey(base64);

    // 1. Verificar caché en memoria primero (más rápido)
    if (memoryCache.has(cacheKey)) {
      const timestamp = cacheTimestamps.get(cacheKey);
      if (timestamp && Date.now() - timestamp < CACHE_CONFIG.TTL) {
        console.log('🚀 Cache hit (memoria):', cacheKey);
        return memoryCache.get(cacheKey)!;
      } else {
        // Limpiar caché expirado
        this.removeFromMemoryCache(cacheKey);
      }
    }

    // 2. Verificar IndexedDB (solo si está disponible)
    if (this.db) {
      try {
        const cachedImage = await this.getFromIndexedDB(cacheKey);
        if (cachedImage && Date.now() - cachedImage.timestamp < CACHE_CONFIG.TTL) {
          const imageToReturn = useCompressed && cachedImage.compressed 
            ? cachedImage.compressed 
            : cachedImage.base64;
          
          // Agregar a memoria para próximos accesos
          this.addToMemoryCache(cacheKey, imageToReturn);
          console.log('💾 Cache hit (IndexedDB):', cacheKey);
          return imageToReturn;
        }
      } catch (error) {
        console.warn('Error accediendo a IndexedDB cache:', error);
      }
    }

    return null;
  }

  /**
   * Guardar imagen en caché
   */
  async cacheImage(base64: string): Promise<string> {
    const cacheKey = this.generateCacheKey(base64);
    
    // Si no está en el cliente, solo devolver la clave
    if (!this.isClient) {
      return cacheKey;
    }

    const timestamp = Date.now();
    const size = base64.length;

    // Generar versión comprimida para thumbnails
    let compressed: string | undefined;
    try {
      compressed = await this.compressImage(base64, 0.6);
    } catch (error) {
      console.warn('Error comprimiendo imagen:', error);
    }

    const cachedImage: CachedImage = {
      id: cacheKey,
      base64,
      timestamp,
      size,
      compressed
    };

    // Guardar en memoria
    this.addToMemoryCache(cacheKey, base64);

    // Guardar en IndexedDB (solo si está disponible)
    if (this.db) {
      try {
        await this.saveToIndexedDB(cachedImage);
        console.log('💾 Imagen guardada en caché:', cacheKey);
      } catch (error) {
        console.warn('Error guardando en IndexedDB:', error);
      }
    }

    return cacheKey;
  }

  /**
   * Agregar a caché en memoria con gestión de límites
   */
  private addToMemoryCache(key: string, base64: string): void {
    const size = base64.length;

    // Si excede el límite, limpiar caché más antiguo
    if (memoryCache.size >= CACHE_CONFIG.MAX_MEMORY_ITEMS || 
        this.currentMemorySize + size > CACHE_CONFIG.MAX_MEMORY_SIZE) {
      this.cleanOldestMemoryCache();
    }

    memoryCache.set(key, base64);
    cacheTimestamps.set(key, Date.now());
    this.currentMemorySize += size;
  }

  /**
   * Remover del caché en memoria
   */
  private removeFromMemoryCache(key: string): void {
    const base64 = memoryCache.get(key);
    if (base64) {
      this.currentMemorySize -= base64.length;
      memoryCache.delete(key);
      cacheTimestamps.delete(key);
    }
  }

  /**
   * Limpiar el caché en memoria más antiguo
   */
  private cleanOldestMemoryCache(): void {
    let oldestKey = '';
    let oldestTime = Date.now();

    for (const [key, timestamp] of cacheTimestamps.entries()) {
      if (timestamp < oldestTime) {
        oldestTime = timestamp;
        oldestKey = key;
      }
    }

    if (oldestKey) {
      this.removeFromMemoryCache(oldestKey);
    }
  }

  /**
   * Guardar en IndexedDB
   */
  private async saveToIndexedDB(cachedImage: CachedImage): Promise<void> {
    if (!this.db) await this.initDB();
    if (!this.db) throw new Error('IndexedDB no disponible');

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([CACHE_CONFIG.STORE_NAME], 'readwrite');
      const store = transaction.objectStore(CACHE_CONFIG.STORE_NAME);
      const request = store.put(cachedImage);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Obtener de IndexedDB
   */
  private async getFromIndexedDB(key: string): Promise<CachedImage | null> {
    if (!this.db) await this.initDB();
    if (!this.db) return null;

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([CACHE_CONFIG.STORE_NAME], 'readonly');
      const store = transaction.objectStore(CACHE_CONFIG.STORE_NAME);
      const request = store.get(key);

      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Limpiar caché expirado
   */
  async cleanExpiredCache(): Promise<void> {
    if (!this.isClient) return;
    if (!this.db) await this.initDB();
    if (!this.db) return;

    const cutoffTime = Date.now() - CACHE_CONFIG.TTL;

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([CACHE_CONFIG.STORE_NAME], 'readwrite');
      const store = transaction.objectStore(CACHE_CONFIG.STORE_NAME);
      const index = store.index('timestamp');
      const request = index.openCursor(IDBKeyRange.upperBound(cutoffTime));

      request.onsuccess = (event) => {
        const cursor = (event.target as IDBRequest).result;
        if (cursor) {
          cursor.delete();
          cursor.continue();
        } else {
          resolve();
        }
      };

      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Obtener estadísticas del caché
   */
  getCacheStats(): { memoryItems: number; memorySize: string; } {
    return {
      memoryItems: memoryCache.size,
      memorySize: `${(this.currentMemorySize / (1024 * 1024)).toFixed(2)}MB`
    };
  }

  /**
   * Limpiar todo el caché
   */
  async clearAllCache(): Promise<void> {
    // Limpiar memoria
    memoryCache.clear();
    cacheTimestamps.clear();
    this.currentMemorySize = 0;

    // Limpiar IndexedDB (solo en cliente)
    if (!this.isClient) return;
    if (!this.db) await this.initDB();
    if (!this.db) return;

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([CACHE_CONFIG.STORE_NAME], 'readwrite');
      const store = transaction.objectStore(CACHE_CONFIG.STORE_NAME);
      const request = store.clear();

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }
}

// Instancia singleton del gestor de caché
export const imageCache = new ImageCacheManager();

/**
 * Hook para usar el caché de imágenes de forma optimizada
 */
export function useCachedImage(base64: string, useCompressed: boolean = false): string {
  // Si la imagen ya está en caché en memoria, devolverla inmediatamente
  const cacheKey = imageCache['generateCacheKey'](base64);
  const cached = memoryCache.get(cacheKey);
  
  if (cached) {
    return cached;
  }

  // Si no está en caché, usar la original y cachear en background
  setTimeout(async () => {
    try {
      const cachedImage = await imageCache.getImage(base64, useCompressed);
      if (!cachedImage) {
        await imageCache.cacheImage(base64);
      }
    } catch (error) {
      console.warn('Error cacheando imagen:', error);
    }
  }, 0);

  return base64; // Devolver original mientras se cachea
}

/**
 * Función para precargar imágenes importantes
 */
export async function preloadImages(base64Images: string[]): Promise<void> {
  const promises = base64Images.map(async (base64) => {
    try {
      const cached = await imageCache.getImage(base64);
      if (!cached) {
        await imageCache.cacheImage(base64);
      }
    } catch (error) {
      console.warn('Error precargando imagen:', error);
    }
  });

  await Promise.all(promises);
  console.log(`✅ Precargadas ${base64Images.length} imágenes`);
}

// Limpiar caché expirado al inicializar (solo en cliente)
if (typeof window !== 'undefined') {
  // Esperar a que el DOM esté listo
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      // Limpiar caché expirado cada hora
      setInterval(() => {
        imageCache.cleanExpiredCache().catch(console.warn);
      }, 60 * 60 * 1000);

      // Limpiar al cargar la página
      setTimeout(() => {
        imageCache.cleanExpiredCache().catch(console.warn);
      }, 1000);
    });
  } else {
    // DOM ya está listo
    setInterval(() => {
      imageCache.cleanExpiredCache().catch(console.warn);
    }, 60 * 60 * 1000);

    setTimeout(() => {
      imageCache.cleanExpiredCache().catch(console.warn);
    }, 1000);
  }
}
