import { Garment, Model, StyledLook } from '@/types';
import { SupabaseStorage } from './supabase';

// Nueva clase de almacenamiento que usa Supabase
// Mantiene la misma interfaz que LocalStorage para compatibilidad
export class SupabaseStorageAdapter {
  
  // === GESTIÓN DE PRENDAS ===
  static async getGarments(): Promise<Garment[]> {
    return await SupabaseStorage.getGarments();
  }

  static async addGarment(garment: Omit<Garment, 'id' | 'createdAt'>): Promise<Garment> {
    const result = await SupabaseStorage.addGarment(garment);
    if (!result) {
      throw new Error('No se pudo añadir la prenda a Supabase');
    }
    return result;
  }

  static async deleteGarment(id: string): Promise<void> {
    const success = await SupabaseStorage.deleteGarment(id);
    if (!success) {
      throw new Error('No se pudo eliminar la prenda de Supabase');
    }
  }

  static async updateGarment(id: string, updatedGarment: Garment): Promise<void> {
    const success = await SupabaseStorage.updateGarment(id, updatedGarment);
    if (!success) {
      throw new Error('No se pudo actualizar la prenda en Supabase');
    }
  }

  // === GESTIÓN DE MODELOS ===
  static async getModels(): Promise<Model[]> {
    return await SupabaseStorage.getModels();
  }

  static async addModel(model: Omit<Model, 'id' | 'createdAt'>): Promise<Model> {
    const result = await SupabaseStorage.addModel(model);
    if (!result) {
      throw new Error('No se pudo añadir el modelo a Supabase');
    }
    return result;
  }

  static async deleteModel(id: string): Promise<void> {
    const success = await SupabaseStorage.deleteModel(id);
    if (!success) {
      throw new Error('No se pudo eliminar el modelo de Supabase');
    }
  }

  static async updateModel(id: string, updatedModel: Model): Promise<void> {
    const success = await SupabaseStorage.updateModel(id, updatedModel);
    if (!success) {
      throw new Error('No se pudo actualizar el modelo en Supabase');
    }
  }

  // === GESTIÓN DE LOOKS ===
  static async getStyledLooks(): Promise<StyledLook[]> {
    return await SupabaseStorage.getStyledLooks();
  }

  static async addStyledLook(look: Omit<StyledLook, 'id' | 'createdAt'>): Promise<StyledLook> {
    const result = await SupabaseStorage.addStyledLook(look);
    if (!result) {
      throw new Error('No se pudo añadir el look a Supabase');
    }
    return result;
  }

  static async deleteStyledLook(id: string): Promise<void> {
    const success = await SupabaseStorage.deleteStyledLook(id);
    if (!success) {
      throw new Error('No se pudo eliminar el look de Supabase');
    }
  }

  static async updateStyledLook(id: string, updatedLook: StyledLook): Promise<void> {
    const success = await SupabaseStorage.updateStyledLook(id, updatedLook);
    if (!success) {
      throw new Error('No se pudo actualizar el look en Supabase');
    }
  }

  // === UTILIDADES ADICIONALES ===
  
  /**
   * Migra todos los datos de LocalStorage a Supabase
   */
  static async migrateFromLocalStorage(): Promise<{
    garments: number;
    models: number;
    looks: number;
    errors: string[];
  }> {
    const results = { garments: 0, models: 0, looks: 0, errors: [] as string[] };

    try {
      // Verificar si estamos en el navegador
      if (typeof window === 'undefined') {
        throw new Error('La migración solo puede ejecutarse en el navegador');
      }

      console.log('🔄 Iniciando migración de LocalStorage a Supabase...');

      // Migrar prendas
      try {
        const localGarments = JSON.parse(localStorage.getItem('chic-pic-garments') || '[]');
        console.log(`📦 Migrando ${localGarments.length} prendas...`);
        
        for (const garment of localGarments) {
          try {
            const result = await SupabaseStorage.addGarment({
              name: garment.name,
              description: garment.description,
              category: garment.category,
              imageUrl: garment.imageUrl,
              color: garment.color,
              availableSizes: garment.availableSizes,
            });
            if (result) results.garments++;
          } catch (error) {
            results.errors.push(`Error migrando prenda "${garment.name}": ${error}`);
          }
        }
      } catch (error) {
        results.errors.push(`Error migrando prendas: ${error}`);
      }

      // Migrar modelos
      try {
        const localModels = JSON.parse(localStorage.getItem('chic-pic-models') || '[]');
        console.log(`👤 Migrando ${localModels.length} modelos...`);
        
        for (const model of localModels) {
          try {
            const result = await SupabaseStorage.addModel({
              name: model.name,
              characteristics: model.characteristics,
              gender: model.gender,
              age: model.age,
              height: model.height,
              bodyType: model.bodyType,
              hairColor: model.hairColor,
              eyeColor: model.eyeColor,
              skinTone: model.skinTone,
              upperBodySize: model.upperBodySize,
              lowerBodySize: model.lowerBodySize,
              shoeSize: model.shoeSize,
              imageUrl: model.imageUrl,
            });
            if (result) results.models++;
          } catch (error) {
            results.errors.push(`Error migrando modelo "${model.name}": ${error}`);
          }
        }
      } catch (error) {
        results.errors.push(`Error migrando modelos: ${error}`);
      }

      // Migrar looks
      try {
        const localLooks = JSON.parse(localStorage.getItem('chic-pic-styled-looks') || '[]');
        console.log(`✨ Migrando ${localLooks.length} looks...`);
        
        for (const look of localLooks) {
          try {
            const result = await SupabaseStorage.addStyledLook({
              name: look.name,
              modelId: look.modelId,
              garmentIds: look.garmentIds,
              imageUrl: look.imageUrl,
              description: look.description,
              garmentFits: look.garmentFits,
            });
            if (result) results.looks++;
          } catch (error) {
            results.errors.push(`Error migrando look "${look.name}": ${error}`);
          }
        }
      } catch (error) {
        results.errors.push(`Error migrando looks: ${error}`);
      }

      console.log('✅ Migración completada:', results);
      return results;
      
    } catch (error) {
      console.error('❌ Error en migración:', error);
      results.errors.push(`Error general: ${error}`);
      return results;
    }
  }

  /**
   * Limpia todos los datos de LocalStorage después de la migración exitosa
   */
  static clearLocalStorage(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('chic-pic-garments');
      localStorage.removeItem('chic-pic-models');
      localStorage.removeItem('chic-pic-styled-looks');
      console.log('🧹 LocalStorage limpiado');
    }
  }

  /**
   * Verifica la conectividad con Supabase
   */
  static async testConnection(): Promise<boolean> {
    return await SupabaseStorage.testConnection();
  }

  /**
   * Obtiene estadísticas de la base de datos
   */
  static async getStats(): Promise<{
    garments: number;
    models: number;
    looks: number;
    connected: boolean;
  }> {
    try {
      const [garments, models, looks, connected] = await Promise.all([
        this.getGarments(),
        this.getModels(),
        this.getStyledLooks(),
        this.testConnection()
      ]);

      return {
        garments: garments.length,
        models: models.length,
        looks: looks.length,
        connected
      };
    } catch (error) {
      console.error('Error obteniendo estadísticas:', error);
      return {
        garments: 0,
        models: 0,
        looks: 0,
        connected: false
      };
    }
  }
}

// Exportar también como alias para compatibilidad
export const Storage = SupabaseStorageAdapter;
