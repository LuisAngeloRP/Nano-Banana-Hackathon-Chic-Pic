export interface Garment {
  id: string;
  name: string;
  description: string;
  category: 'camiseta' | 'pantalon' | 'vestido' | 'falda' | 'camisa' | 'chaqueta' | 'zapatos' | 'accesorios';
  imageUrl: string;
  color: string;
  size: string[];
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
  imageUrl: string;
  createdAt: Date;
}

export interface StyledLook {
  id: string;
  name: string;
  modelId: string;
  garmentIds: string[];
  imageUrl: string;
  description: string;
  createdAt: Date;
}

export interface GenerationRequest {
  type: 'garment' | 'model' | 'styling';
  description: string;
  additionalParams?: Record<string, any>;
}
