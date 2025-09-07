/**
 * Cliente Supabase limpio - Solo Storage URLs (sin base64)
 */

import { createClient } from '@supabase/supabase-js';
import { Garment, Model, StyledLook, GarmentFitInfo, ClothingSize, ShoeSize, ClothingCategory } from '@/types';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Tipos de base de datos limpios para Supabase Storage
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

// Cliente limpio para Supabase Storage
export class SupabaseStorageClient {
  
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

      return (data as DatabaseGarment[]).map(this.dbGarmentToGarment);
    } catch (error) {
      console.error('Error en getGarments:', error);
      return [];
    }
  }

  static async addGarment(garment: Omit<Garment, 'id' | 'createdAt'>): Promise<Garment | null> {
    try {
      console.log('🔍 Datos de entrada para addGarment:', garment);
      
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

      console.log('📊 Datos para BD:', dbGarment);

      const { data, error } = await supabase
        .from('garments')
        .insert([dbGarment])
        .select()
        .single();

      if (error) {
        console.error('❌ Error detallado de Supabase:', {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code
        });
        return null;
      }

      console.log('✅ Prenda añadida exitosamente:', data);
      return this.dbGarmentToGarment(data as DatabaseGarment);
    } catch (error) {
      console.error('💥 Error en addGarment:', error);
      return null;
    }
  }

  static async deleteGarment(id: string): Promise<boolean> {
    try {
      // Obtener datos de la prenda para eliminar archivo de Storage
      const { data: garment } = await supabase
        .from('garments')
        .select('storage_path')
        .eq('id', id)
        .single();

      // Eliminar archivo de Storage si existe
      if (garment?.storage_path) {
        await supabase.storage
          .from('chic-pic-images')
          .remove([garment.storage_path]);
      }

      // Eliminar registro de base de datos
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

      return (data as DatabaseModel[]).map(this.dbModelToModel);
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

      return this.dbModelToModel(data as DatabaseModel);
    } catch (error) {
      console.error('Error en addModel:', error);
      return null;
    }
  }

  static async deleteModel(id: string): Promise<boolean> {
    try {
      // Obtener datos del modelo para eliminar archivo de Storage
      const { data: model } = await supabase
        .from('models')
        .select('storage_path')
        .eq('id', id)
        .single();

      // Eliminar archivo de Storage si existe
      if (model?.storage_path) {
        await supabase.storage
          .from('chic-pic-images')
          .remove([model.storage_path]);
      }

      // Eliminar registro de base de datos
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

      return (data as DatabaseStyledLook[]).map(this.dbStyledLookToStyledLook);
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

      return this.dbStyledLookToStyledLook(data as DatabaseStyledLook);
    } catch (error) {
      console.error('Error en addStyledLook:', error);
      return null;
    }
  }

  static async deleteStyledLook(id: string): Promise<boolean> {
    try {
      // Obtener datos del look para eliminar archivo de Storage
      const { data: look } = await supabase
        .from('styled_looks')
        .select('storage_path')
        .eq('id', id)
        .single();

      // Eliminar archivo de Storage si existe
      if (look?.storage_path) {
        await supabase.storage
          .from('chic-pic-images')
          .remove([look.storage_path]);
      }

      // Eliminar registro de base de datos
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

  // === MÉTODOS DE CONVERSIÓN ===
  
  private static dbGarmentToGarment(dbGarment: DatabaseGarment): Garment {
    return {
      id: dbGarment.id,
      name: dbGarment.name,
      description: dbGarment.description,
      category: dbGarment.category as ClothingCategory,
      imageUrl: dbGarment.image_url,
      thumbnailUrl: dbGarment.thumbnail_url,
      storagePath: dbGarment.storage_path,
      color: dbGarment.color,
      availableSizes: dbGarment.available_sizes || [],
      createdAt: new Date(dbGarment.created_at)
    };
  }

  private static dbModelToModel(dbModel: DatabaseModel): Model {
    return {
      id: dbModel.id,
      name: dbModel.name,
      characteristics: dbModel.characteristics,
      gender: dbModel.gender as 'masculino' | 'femenino' | 'unisex',
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
      createdAt: new Date(dbModel.created_at)
    };
  }

  private static dbStyledLookToStyledLook(dbLook: DatabaseStyledLook): StyledLook {
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
      createdAt: new Date(dbLook.created_at)
    };
  }
}
