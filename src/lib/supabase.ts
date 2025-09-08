import { createClient } from '@supabase/supabase-js';
import { Garment, Model, StyledLook, ClothingSize, ShoeSize, GarmentFitInfo } from '@/types';

// Configuración de Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Tipos de base de datos para Supabase
export interface DatabaseGarment {
  id: string;
  name: string;
  description: string;
  category: string;
  image_url: string; // URL de Supabase Storage
  thumbnail_url?: string; // URL del thumbnail comprimido
  storage_path: string; // Ruta en Storage para eliminación
  color: string;
  available_sizes: (ClothingSize | ShoeSize)[] | null;
  created_at: string;
}

export interface DatabaseModel {
  id: string;
  name: string;
  characteristics: string;
  gender: string;
  age: string;
  height: string;
  body_type: string;
  hair_color: string;
  eye_color: string;
  skin_tone: string;
  upper_body_size: ClothingSize;
  lower_body_size: ClothingSize;
  shoe_size: ShoeSize;
  image_url: string; // URL de Supabase Storage
  thumbnail_url?: string; // URL del thumbnail comprimido
  storage_path: string; // Ruta en Storage para eliminación
  created_at: string;
}

export interface DatabaseStyledLook {
  id: string;
  name: string;
  model_id: string;
  garment_ids: string[];
  image_url: string; // URL de Supabase Storage
  thumbnail_url?: string; // URL del thumbnail comprimido
  storage_path: string; // Ruta en Storage para eliminación
  description: string;
  garment_fits: GarmentFitInfo[];
  created_at: string;
}

// Clase para manejar operaciones de Supabase
export class SupabaseStorage {
  
  // === GESTIÓN DE PRENDAS ===
  static async getGarments(): Promise<Garment[]> {
    try {
      const { data, error } = await supabase
        .from('garments')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error obteniendo prendas:', error);
        return [];
      }

      return data.map(this.mapDatabaseGarmentToGarment);
    } catch (error) {
      console.error('Error en getGarments:', error);
      return [];
    }
  }

  static async addGarment(garment: Omit<Garment, 'id' | 'createdAt'>): Promise<Garment | null> {
    try {
      const dbGarment: Omit<DatabaseGarment, 'id' | 'created_at'> = {
        name: garment.name,
        description: garment.description,
        category: garment.category,
        image_url: garment.imageUrl, // URL de Supabase Storage
        thumbnail_url: garment.thumbnailUrl || undefined,
        storage_path: garment.storagePath, // Ruta para eliminación
        color: garment.color,
        available_sizes: garment.availableSizes || null,
      };

      const { data, error } = await supabase
        .from('garments')
        .insert([dbGarment])
        .select()
        .single();

      if (error) {
        console.error('Error añadiendo prenda:', error);
        return null;
      }

      return this.mapDatabaseGarmentToGarment(data);
    } catch (error) {
      console.error('Error en addGarment:', error);
      return null;
    }
  }

  static async updateGarment(id: string, garment: Garment): Promise<boolean> {
    try {
      const dbGarment: Partial<DatabaseGarment> = {
        name: garment.name,
        description: garment.description,
        category: garment.category,
        image_url: garment.imageUrl,
        thumbnail_url: garment.thumbnailUrl,
        storage_path: garment.storagePath,
        color: garment.color,
        available_sizes: garment.availableSizes || null,
      };

      const { error } = await supabase
        .from('garments')
        .update(dbGarment)
        .eq('id', id);

      if (error) {
        console.error('Error actualizando prenda:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error en updateGarment:', error);
      return false;
    }
  }

  static async deleteGarment(id: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('garments')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error eliminando prenda:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error en deleteGarment:', error);
      return false;
    }
  }

  // === GESTIÓN DE MODELOS ===
  static async getModels(): Promise<Model[]> {
    try {
      const { data, error } = await supabase
        .from('models')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error obteniendo modelos:', error);
        return [];
      }

      return data.map(this.mapDatabaseModelToModel);
    } catch (error) {
      console.error('Error en getModels:', error);
      return [];
    }
  }

  static async addModel(model: Omit<Model, 'id' | 'createdAt'>): Promise<Model | null> {
    try {
      const dbModel: Omit<DatabaseModel, 'id' | 'created_at'> = {
        name: model.name,
        characteristics: model.characteristics,
        gender: model.gender,
        age: model.age,
        height: model.height,
        body_type: model.bodyType,
        hair_color: model.hairColor,
        eye_color: model.eyeColor,
        skin_tone: model.skinTone,
        upper_body_size: model.upperBodySize,
        lower_body_size: model.lowerBodySize,
        shoe_size: model.shoeSize,
        image_url: model.imageUrl, // URL de Supabase Storage
        thumbnail_url: model.thumbnailUrl || undefined,
        storage_path: model.storagePath, // Ruta para eliminación
      };

      const { data, error } = await supabase
        .from('models')
        .insert([dbModel])
        .select()
        .single();

      if (error) {
        console.error('Error añadiendo modelo:', error);
        return null;
      }

      return this.mapDatabaseModelToModel(data);
    } catch (error) {
      console.error('Error en addModel:', error);
      return null;
    }
  }

  static async updateModel(id: string, model: Model): Promise<boolean> {
    try {
      const dbModel: Partial<DatabaseModel> = {
        name: model.name,
        characteristics: model.characteristics,
        gender: model.gender,
        age: model.age,
        height: model.height,
        body_type: model.bodyType,
        hair_color: model.hairColor,
        eye_color: model.eyeColor,
        skin_tone: model.skinTone,
        upper_body_size: model.upperBodySize,
        lower_body_size: model.lowerBodySize,
        shoe_size: model.shoeSize,
        image_url: model.imageUrl,
        thumbnail_url: model.thumbnailUrl,
        storage_path: model.storagePath,
      };

      const { error } = await supabase
        .from('models')
        .update(dbModel)
        .eq('id', id);

      if (error) {
        console.error('Error actualizando modelo:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error en updateModel:', error);
      return false;
    }
  }

  static async deleteModel(id: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('models')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error eliminando modelo:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error en deleteModel:', error);
      return false;
    }
  }

  // === GESTIÓN DE LOOKS ===
  static async getStyledLooks(): Promise<StyledLook[]> {
    try {
      const { data, error } = await supabase
        .from('styled_looks')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error obteniendo looks:', error);
        return [];
      }

      return data.map(this.mapDatabaseStyledLookToStyledLook);
    } catch (error) {
      console.error('Error en getStyledLooks:', error);
      return [];
    }
  }

  static async addStyledLook(look: Omit<StyledLook, 'id' | 'createdAt'>): Promise<StyledLook | null> {
    try {
      const dbLook: Omit<DatabaseStyledLook, 'id' | 'created_at'> = {
        name: look.name,
        model_id: look.modelId,
        garment_ids: look.garmentIds,
        image_url: look.imageUrl, // URL de Supabase Storage
        thumbnail_url: look.thumbnailUrl || undefined,
        storage_path: look.storagePath, // Ruta para eliminación
        description: look.description,
        garment_fits: look.garmentFits,
      };

      const { data, error } = await supabase
        .from('styled_looks')
        .insert([dbLook])
        .select()
        .single();

      if (error) {
        console.error('Error añadiendo look:', error);
        return null;
      }

      return this.mapDatabaseStyledLookToStyledLook(data);
    } catch (error) {
      console.error('Error en addStyledLook:', error);
      return null;
    }
  }

  static async updateStyledLook(id: string, look: StyledLook): Promise<boolean> {
    try {
      const dbLook: Partial<DatabaseStyledLook> = {
        name: look.name,
        model_id: look.modelId,
        garment_ids: look.garmentIds,
        image_url: look.imageUrl,
        thumbnail_url: look.thumbnailUrl,
        storage_path: look.storagePath,
        description: look.description,
        garment_fits: look.garmentFits,
      };

      const { error } = await supabase
        .from('styled_looks')
        .update(dbLook)
        .eq('id', id);

      if (error) {
        console.error('Error actualizando look:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error en updateStyledLook:', error);
      return false;
    }
  }

  static async deleteStyledLook(id: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('styled_looks')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error eliminando look:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error en deleteStyledLook:', error);
      return false;
    }
  }

  // === FUNCIONES DE MAPEO ===
  private static mapDatabaseGarmentToGarment(dbGarment: DatabaseGarment): Garment {
    return {
      id: dbGarment.id,
      name: dbGarment.name,
      description: dbGarment.description,
      category: dbGarment.category as Garment['category'],
      imageUrl: dbGarment.image_url,
      thumbnailUrl: dbGarment.thumbnail_url,
      storagePath: dbGarment.storage_path,
      color: dbGarment.color,
      availableSizes: dbGarment.available_sizes || [],
      createdAt: new Date(dbGarment.created_at),
    };
  }

  private static mapDatabaseModelToModel(dbModel: DatabaseModel): Model {
    return {
      id: dbModel.id,
      name: dbModel.name,
      characteristics: dbModel.characteristics,
      gender: dbModel.gender as Model['gender'],
      age: dbModel.age,
      height: dbModel.height,
      bodyType: dbModel.body_type,
      hairColor: dbModel.hair_color,
      eyeColor: dbModel.eye_color,
      skinTone: dbModel.skin_tone,
      upperBodySize: dbModel.upper_body_size,
      lowerBodySize: dbModel.lower_body_size,
      shoeSize: dbModel.shoe_size,
      imageUrl: dbModel.image_url,
      thumbnailUrl: dbModel.thumbnail_url,
      storagePath: dbModel.storage_path,
      createdAt: new Date(dbModel.created_at),
    };
  }

  private static mapDatabaseStyledLookToStyledLook(dbLook: DatabaseStyledLook): StyledLook {
    return {
      id: dbLook.id,
      name: dbLook.name,
      modelId: dbLook.model_id,
      garmentIds: dbLook.garment_ids,
      imageUrl: dbLook.image_url,
      thumbnailUrl: dbLook.thumbnail_url,
      storagePath: dbLook.storage_path,
      description: dbLook.description,
      garmentFits: dbLook.garment_fits,
      createdAt: new Date(dbLook.created_at),
    };
  }

  // === UTILIDADES ===
  static async testConnection(): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('garments')
        .select('count', { count: 'exact', head: true });

      return !error;
    } catch (error) {
      console.error('Error probando conexión:', error);
      return false;
    }
  }

  // === MIGRACIÓN DESDE LOCALSTORAGE ===
  static async migrateFromLocalStorage(): Promise<{
    garments: number;
    models: number;
    looks: number;
  }> {
    const results = { garments: 0, models: 0, looks: 0 };

    try {
      // Migrar prendas
      const localGarments = JSON.parse(localStorage.getItem('chic-pic-garments') || '[]');
      for (const garment of localGarments) {
        const result = await this.addGarment({
          name: garment.name,
          description: garment.description,
          category: garment.category,
          imageUrl: garment.imageUrl,
          storagePath: garment.storagePath || `garments/${garment.id || Date.now()}.jpg`,
          color: garment.color,
          availableSizes: garment.availableSizes,
        });
        if (result) results.garments++;
      }

      // Migrar modelos
      const localModels = JSON.parse(localStorage.getItem('chic-pic-models') || '[]');
      for (const model of localModels) {
        const result = await this.addModel({
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
          storagePath: model.storagePath || `models/${model.id || Date.now()}.jpg`,
        });
        if (result) results.models++;
      }

      // Migrar looks
      const localLooks = JSON.parse(localStorage.getItem('chic-pic-styled-looks') || '[]');
      for (const look of localLooks) {
        const result = await this.addStyledLook({
          name: look.name,
          modelId: look.modelId,
          garmentIds: look.garmentIds,
          imageUrl: look.imageUrl,
          storagePath: look.storagePath || `looks/${look.id || Date.now()}.jpg`,
          description: look.description,
          garmentFits: look.garmentFits,
        });
        if (result) results.looks++;
      }

      return results;
    } catch (error) {
      console.error('Error en migración:', error);
      return results;
    }
  }
}
