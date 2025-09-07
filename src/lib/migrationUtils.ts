import { Garment, ClothingSize, ShoeSize } from '@/types';

/**
 * Migra prendas del formato anterior (con talla única) al nuevo formato (con tallas disponibles)
 */
export function migrateGarmentToNewFormat(oldGarment: any): Garment {
  // Si ya tiene el nuevo formato, devolverlo tal como está
  if (oldGarment.availableSizes && Array.isArray(oldGarment.availableSizes)) {
    return oldGarment as Garment;
  }

  // Si tiene el formato anterior con 'size' como string único
  if (oldGarment.size && typeof oldGarment.size === 'string') {
    return {
      ...oldGarment,
      availableSizes: [oldGarment.size] as (ClothingSize | ShoeSize)[],
      // Remover la propiedad antigua
      size: undefined
    } as Garment;
  }

  // Si tiene el formato anterior con 'size' como array
  if (oldGarment.size && Array.isArray(oldGarment.size)) {
    return {
      ...oldGarment,
      availableSizes: oldGarment.size as (ClothingSize | ShoeSize)[],
      // Remover la propiedad antigua
      size: undefined
    } as Garment;
  }

  // Si no tiene tallas definidas, asignar tallas por defecto según la categoría
  const defaultSizes = getDefaultSizesForCategory(oldGarment.category);
  
  return {
    ...oldGarment,
    availableSizes: defaultSizes,
    size: undefined
  } as Garment;
}

/**
 * Obtiene tallas por defecto según la categoría de la prenda
 */
function getDefaultSizesForCategory(category: string): (ClothingSize | ShoeSize)[] {
  switch (category) {
    case 'zapatos':
      return ['38', '39', '40', '41', '42'] as ShoeSize[];
    case 'accesorios':
      return ['Único'] as any[]; // Los accesorios pueden tener talla única
    default:
      return ['S', 'M', 'L'] as ClothingSize[];
  }
}

/**
 * Migra una lista completa de prendas
 */
export function migrateGarmentsList(garments: any[]): Garment[] {
  return garments.map(migrateGarmentToNewFormat);
}
