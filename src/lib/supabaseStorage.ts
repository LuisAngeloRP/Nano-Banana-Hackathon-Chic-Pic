/**
 * Servicio de Supabase Storage para manejo optimizado de imágenes
 * Reemplaza el sistema base64 con URLs de Supabase Storage
 */

import { supabase } from './supabase';

// Configuración del storage
const STORAGE_CONFIG = {
  BUCKET_NAME: 'chic-pic-images', // Nombre correcto en minúsculas
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
  ALLOWED_TYPES: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'],
  QUALITY: {
    THUMBNAIL: 0.6,
    MEDIUM: 0.8,
    FULL: 0.9
  }
};

export interface UploadResult {
  success: boolean;
  url?: string;
  thumbnailUrl?: string;
  error?: string;
  path?: string;
}

export interface ImageVariants {
  thumbnail: string;
  medium: string;
  full: string;
}

class SupabaseStorageService {
  
  /**
   * Inicializar bucket (asume que existe, no intenta verificar)
   */
  async initializeBucket(): Promise<void> {
    // Simplemente asumir que el bucket existe
    // Ya que fue creado manualmente desde el Dashboard
    console.log('✅ Usando bucket:', STORAGE_CONFIG.BUCKET_NAME);
    console.log('📋 Bucket configurado manualmente desde Dashboard');
  }

  /**
   * Validar archivo antes de subir
   */
  private validateFile(file: File): { valid: boolean; error?: string } {
    // Verificar tipo
    if (!STORAGE_CONFIG.ALLOWED_TYPES.includes(file.type)) {
      return {
        valid: false,
        error: `Tipo de archivo no permitido. Tipos válidos: ${STORAGE_CONFIG.ALLOWED_TYPES.join(', ')}`
      };
    }

    // Verificar tamaño
    if (file.size > STORAGE_CONFIG.MAX_FILE_SIZE) {
      const maxSizeMB = STORAGE_CONFIG.MAX_FILE_SIZE / (1024 * 1024);
      return {
        valid: false,
        error: `Archivo demasiado grande. Máximo ${maxSizeMB}MB permitidos.`
      };
    }

    return { valid: true };
  }

  /**
   * Generar nombre único para archivo
   */
  private generateFileName(originalName: string, suffix?: string): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8);
    const extension = originalName.split('.').pop()?.toLowerCase() || 'jpg';
    const baseName = originalName.split('.')[0].toLowerCase().replace(/[^a-z0-9]/g, '-');
    
    const finalSuffix = suffix ? `-${suffix}` : '';
    return `${timestamp}-${random}-${baseName}${finalSuffix}.${extension}`;
  }

  /**
   * Comprimir imagen en el cliente
   */
  private compressImage(file: File, quality: number, maxWidth?: number): Promise<File> {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();

      img.onload = () => {
        // Calcular dimensiones
        let { width, height } = img;
        
        if (maxWidth && width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }

        canvas.width = width;
        canvas.height = height;

        // Dibujar imagen comprimida
        ctx?.drawImage(img, 0, 0, width, height);
        
        canvas.toBlob(
          (blob) => {
            if (blob) {
              const compressedFile = new File([blob], file.name, {
                type: 'image/jpeg',
                lastModified: Date.now()
              });
              resolve(compressedFile);
            } else {
              reject(new Error('Error comprimiendo imagen'));
            }
          },
          'image/jpeg',
          quality
        );
      };

      img.onerror = () => reject(new Error('Error cargando imagen'));
      img.src = URL.createObjectURL(file);
    });
  }

  /**
   * Subir imagen con múltiples variantes
   */
  async uploadImage(file: File, folder: string = 'general'): Promise<UploadResult> {
    try {
      // Validar archivo
      const validation = this.validateFile(file);
      if (!validation.valid) {
        return { success: false, error: validation.error };
      }

      // Inicializar bucket
      await this.initializeBucket();

      // Generar nombres de archivo
      const originalFileName = this.generateFileName(file.name);
      const thumbnailFileName = this.generateFileName(file.name, 'thumb');
      
      const originalPath = `${folder}/${originalFileName}`;
      const thumbnailPath = `${folder}/${thumbnailFileName}`;

      // Comprimir para thumbnail
      const thumbnailFile = await this.compressImage(file, STORAGE_CONFIG.QUALITY.THUMBNAIL, 300);

      // Subir imagen original
      const { error: originalError } = await supabase.storage
        .from(STORAGE_CONFIG.BUCKET_NAME)
        .upload(originalPath, file);

      if (originalError) {
        console.error('Error subiendo imagen original:', originalError);
        return { success: false, error: originalError.message };
      }

      // Subir thumbnail
      const { error: thumbnailError } = await supabase.storage
        .from(STORAGE_CONFIG.BUCKET_NAME)
        .upload(thumbnailPath, thumbnailFile);

      if (thumbnailError) {
        console.error('Error subiendo thumbnail:', thumbnailError);
        // Continuar aunque falle el thumbnail
      }

      // Obtener URLs públicas
      const { data: originalUrl } = supabase.storage
        .from(STORAGE_CONFIG.BUCKET_NAME)
        .getPublicUrl(originalPath);

      const { data: thumbnailUrl } = supabase.storage
        .from(STORAGE_CONFIG.BUCKET_NAME)
        .getPublicUrl(thumbnailPath);

      console.log('✅ Imagen subida exitosamente:', originalUrl.publicUrl);

      return {
        success: true,
        url: originalUrl.publicUrl,
        thumbnailUrl: thumbnailError ? originalUrl.publicUrl : thumbnailUrl.publicUrl,
        path: originalPath
      };

    } catch (error) {
      console.error('Error en uploadImage:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error desconocido'
      };
    }
  }

  /**
   * Subir imagen específica para prendas
   */
  async uploadGarmentImage(file: File): Promise<UploadResult> {
    return this.uploadImage(file, 'garments');
  }

  /**
   * Subir imagen específica para modelos
   */
  async uploadModelImage(file: File): Promise<UploadResult> {
    return this.uploadImage(file, 'models');
  }

  /**
   * Subir imagen específica para looks
   */
  async uploadLookImage(file: File): Promise<UploadResult> {
    return this.uploadImage(file, 'looks');
  }

  /**
   * Eliminar imagen del storage
   */
  async deleteImage(path: string): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase.storage
        .from(STORAGE_CONFIG.BUCKET_NAME)
        .remove([path]);

      if (error) {
        console.error('Error eliminando imagen:', error);
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error) {
      console.error('Error en deleteImage:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error desconocido'
      };
    }
  }

  /**
   * Obtener URL optimizada con transformaciones
   */
  getOptimizedUrl(url: string, options?: {
    width?: number;
    height?: number;
    quality?: number;
    format?: 'webp' | 'jpeg' | 'png';
  }): string {
    // Supabase Storage no tiene transformaciones automáticas como Cloudinary
    // Pero podemos usar la URL base y agregar parámetros si están disponibles
    return url;
  }

  /**
   * Obtener estadísticas del storage
   */
  async getStorageStats(): Promise<{
    totalFiles: number;
    totalSize: string;
    byFolder: Record<string, number>;
  }> {
    try {
      const { data: files, error } = await supabase.storage
        .from(STORAGE_CONFIG.BUCKET_NAME)
        .list();

      if (error || !files) {
        return { totalFiles: 0, totalSize: '0B', byFolder: {} };
      }

      const totalFiles = files.length;
      const byFolder: Record<string, number> = {};

      // Contar archivos por carpeta
      files.forEach(file => {
        const folder = file.name.includes('/') ? file.name.split('/')[0] : 'root';
        byFolder[folder] = (byFolder[folder] || 0) + 1;
      });

      return {
        totalFiles,
        totalSize: `${files.reduce((acc, file) => acc + (file.metadata?.size || 0), 0)}B`,
        byFolder
      };
    } catch (error) {
      console.error('Error obteniendo estadísticas:', error);
      return { totalFiles: 0, totalSize: '0B', byFolder: {} };
    }
  }

  /**
   * Migrar imagen base64 existente a Supabase Storage
   */
  async migrateBase64ToStorage(base64: string, fileName: string, folder: string = 'migrated'): Promise<UploadResult> {
    try {
      // Convertir base64 a File
      const response = await fetch(base64);
      const blob = await response.blob();
      const file = new File([blob], fileName, { type: blob.type });

      // Subir usando el método normal
      return this.uploadImage(file, folder);
    } catch (error) {
      console.error('Error migrando base64:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error en migración'
      };
    }
  }
}

// Instancia singleton
export const supabaseStorage = new SupabaseStorageService();

// Funciones de conveniencia
export const uploadGarmentImage = (file: File) => supabaseStorage.uploadGarmentImage(file);
export const uploadModelImage = (file: File) => supabaseStorage.uploadModelImage(file);
export const uploadLookImage = (file: File) => supabaseStorage.uploadLookImage(file);
export const deleteImage = (path: string) => supabaseStorage.deleteImage(path);
export const getStorageStats = () => supabaseStorage.getStorageStats();
