// Tipos de tallas para diferentes categorías de prendas
export type ClothingSize = 'XS' | 'S' | 'M' | 'L' | 'XL' | 'XXL';
export type ShoeSize = '35' | '36' | '37' | '38' | '39' | '40' | '41' | '42' | '43' | '44' | '45' | '46';

// Categorías de prendas con sus tipos específicos
export type ClothingCategory = 
  | 'camiseta' | 'camisa' | 'chaqueta' // Parte superior
  | 'pantalon' | 'falda' // Parte inferior  
  | 'vestido' // Cuerpo completo
  | 'zapatos' // Calzado
  | 'accesorios'; // Sin talla específica

// Tipo de ajuste de las prendas
export type FitType = 'muy_suelto' | 'suelto' | 'perfecto' | 'ajustado' | 'muy_ajustado';

export interface Garment {
  id: string;
  name: string;
  description: string;
  category: ClothingCategory;
  imageUrl: string; // URL de Supabase Storage
  thumbnailUrl?: string; // URL del thumbnail comprimido
  storagePath: string; // Ruta en Storage para eliminación
  color: string;
  // Las prendas ya no tienen talla fija - se selecciona en el estilista
  availableSizes: (ClothingSize | ShoeSize)[]; // Tallas disponibles para esta prenda
  createdAt: Date;
}

export interface Model {
  id: string;
  name: string;
  characteristics: string;
  gender: 'masculino' | 'femenino' | 'unisex';
  age: string;
  height: string;
  bodyType: string;
  hairColor: string;
  eyeColor: string;
  skinTone: string;
  // Tallas específicas del modelo
  upperBodySize: ClothingSize; // Talla para camisetas, camisas, chaquetas
  lowerBodySize: ClothingSize; // Talla para pantalones, faldas
  shoeSize: ShoeSize; // Talla de zapatos
  imageUrl: string; // URL de Supabase Storage
  thumbnailUrl?: string; // URL del thumbnail comprimido
  storagePath: string; // Ruta en Storage para eliminación
  createdAt: Date;
}

// Información de ajuste para cada prenda en un look
export interface GarmentFitInfo {
  garmentId: string;
  selectedSize: ClothingSize | ShoeSize; // Talla seleccionada para esta prenda en el look
  modelSize: ClothingSize | ShoeSize;
  fitType: FitType;
  fitDescription: string; // Descripción detallada del ajuste
}

// Información de prenda seleccionada en un look con su talla específica
export interface SelectedGarmentWithSize {
  garment: Garment;
  selectedSize: ClothingSize | ShoeSize;
}

export interface StyledLook {
  id: string;
  name: string;
  modelId: string;
  garmentIds: string[];
  imageUrl: string; // URL de Supabase Storage
  thumbnailUrl?: string; // URL del thumbnail comprimido
  storagePath: string; // Ruta en Storage para eliminación
  description: string;
  // Información de ajuste para cada prenda
  garmentFits: GarmentFitInfo[];
  createdAt: Date;
}

export interface GenerationRequest {
  type: 'garment' | 'model' | 'styling';
  description: string;
  additionalParams?: Record<string, any>;
}
