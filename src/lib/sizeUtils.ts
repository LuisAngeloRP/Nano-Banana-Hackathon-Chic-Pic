import { ClothingSize, ShoeSize, FitType, ClothingCategory } from '@/types';

// Clothing size to number mapping for comparisons
const CLOTHING_SIZE_ORDER: Record<ClothingSize, number> = {
  'XS': 1,
  'S': 2,
  'M': 3,
  'L': 4,
  'XL': 5,
  'XXL': 6
};

// Function to determine fit type based on size differences
export function determineFitType(
  garmentSize: ClothingSize | ShoeSize,
  modelSize: ClothingSize | ShoeSize,
  category: ClothingCategory
): FitType {
  // For accessories, always perfect fit
  if (category === 'accesorios') {
    return 'perfecto';
  }

  // For shoes, compare numbers directly
  if (category === 'zapatos') {
    const garmentNum = parseInt(garmentSize as string);
    const modelNum = parseInt(modelSize as string);
    const diff = garmentNum - modelNum;
    
    if (diff <= -2) return 'muy_ajustado';
    if (diff === -1) return 'ajustado';
    if (diff === 0) return 'perfecto';
    if (diff === 1) return 'suelto';
    return 'muy_suelto';
  }

  // For clothing, use size order
  const garmentOrder = CLOTHING_SIZE_ORDER[garmentSize as ClothingSize];
  const modelOrder = CLOTHING_SIZE_ORDER[modelSize as ClothingSize];
  const diff = garmentOrder - modelOrder;

  if (diff <= -2) return 'muy_ajustado';
  if (diff === -1) return 'ajustado';
  if (diff === 0) return 'perfecto';
  if (diff === 1) return 'suelto';
  return 'muy_suelto';
}

// Function to generate fit description
export function generateFitDescription(
  fitType: FitType,
  garmentName: string,
  category: ClothingCategory
): string {
  const descriptions: Record<FitType, Record<ClothingCategory | 'default', string>> = {
    'muy_ajustado': {
      'camiseta': `La ${garmentName} queda muy ajustada, abrazando la figura y posiblemente limitando el movimiento.`,
      'camisa': `La ${garmentName} queda muy ceñida al cuerpo, con mangas y torso muy ajustados.`,
      'chaqueta': `La ${garmentName} queda muy ajustada, dificultando el cierre y limitando la comodidad.`,
      'pantalon': `El ${garmentName} queda muy ajustado en cintura y piernas, marcando significativamente la silueta.`,
      'falda': `La ${garmentName} queda muy ceñida en caderas y cintura, limitando el movimiento.`,
      'vestido': `El ${garmentName} queda muy ajustado en todas las áreas, delineando completamente la figura.`,
      'zapatos': `Los ${garmentName} están muy pequeños, causando incomodidad y posible dolor.`,
      'accesorios': `El ${garmentName} queda perfecto.`,
      'default': `${garmentName} queda muy ajustado.`
    },
    'ajustado': {
      'camiseta': `La ${garmentName} queda ceñida pero cómoda, siguiendo las líneas del cuerpo sin apretar.`,
      'camisa': `La ${garmentName} queda bien entallada, con un corte favorecedor y elegante.`,
      'chaqueta': `La ${garmentName} queda ceñida pero permite movimiento cómodo, con un corte entallado.`,
      'pantalon': `El ${garmentName} queda ceñido en cintura y piernas, con un corte favorecedor.`,
      'falda': `La ${garmentName} queda ceñida en las caderas, creando una silueta elegante.`,
      'vestido': `El ${garmentName} queda ceñido, resaltando la figura de manera favorecedora.`,
      'zapatos': `Los ${garmentName} quedan un poco ajustados pero cómodos de usar.`,
      'accesorios': `El ${garmentName} queda perfecto.`,
      'default': `${garmentName} queda ceñido pero cómodo.`
    },
    'perfecto': {
      'camiseta': `La ${garmentName} queda perfecta, con el ajuste ideal para comodidad y estilo.`,
      'camisa': `La ${garmentName} tiene el ajuste perfecto, ni muy holgada ni muy ajustada.`,
      'chaqueta': `La ${garmentName} queda perfecta, permitiendo libertad de movimiento y un aspecto impecable.`,
      'pantalon': `El ${garmentName} tiene el ajuste perfecto en cintura, caderas y largo.`,
      'falda': `La ${garmentName} queda perfecta, con el ajuste ideal en caderas y cintura.`,
      'vestido': `El ${garmentName} queda perfecto, con el ajuste ideal en todas las áreas.`,
      'zapatos': `Los ${garmentName} quedan perfectos, brindando total comodidad.`,
      'accesorios': `El ${garmentName} queda perfecto.`,
      'default': `${garmentName} queda perfecto.`
    },
    'suelto': {
      'camiseta': `La ${garmentName} queda holgada pero elegante, brindando comodidad y un aspecto relajado.`,
      'camisa': `La ${garmentName} queda holgada, creando un estilo cómodo y casual.`,
      'chaqueta': `La ${garmentName} queda holgada, permitiendo capas debajo y un look oversized.`,
      'pantalon': `El ${garmentName} queda holgado, brindando comodidad y un estilo relajado.`,
      'falda': `La ${garmentName} queda holgada en las caderas, creando un aspecto fluido y cómodo.`,
      'vestido': `El ${garmentName} queda holgado, brindando comodidad y un estilo elegante.`,
      'zapatos': `Los ${garmentName} están un poco grandes pero aún se pueden usar con calcetines.`,
      'accesorios': `El ${garmentName} queda perfecto.`,
      'default': `${garmentName} queda holgado pero cómodo.`
    },
    'muy_suelto': {
      'camiseta': `La ${garmentName} queda muy holgada, creando un aspecto oversized muy pronunciado.`,
      'camisa': `La ${garmentName} queda muy holgada, con un estilo oversized muy marcado.`,
      'chaqueta': `La ${garmentName} queda muy holgada, con un estilo oversized que puede verse desproporcionado.`,
      'pantalon': `El ${garmentName} queda muy holgado, posiblemente necesitando un cinturón para mantenerse en su lugar.`,
      'falda': `La ${garmentName} queda muy holgada, creando un volumen considerable.`,
      'vestido': `El ${garmentName} queda muy holgado, con un aspecto oversized muy pronunciado.`,
      'zapatos': `Los ${garmentName} están muy grandes, dificultando caminar cómodamente.`,
      'accesorios': `El ${garmentName} queda perfecto.`,
      'default': `${garmentName} queda muy holgado.`
    }
  };

  return descriptions[fitType][category] || descriptions[fitType]['default'];
}

// Function to get badge color according to fit type
export function getFitBadgeColor(fitType: FitType): string {
  const colors: Record<FitType, string> = {
    'muy_ajustado': 'bg-red-100 text-red-700',
    'ajustado': 'bg-orange-100 text-orange-700',
    'perfecto': 'bg-green-100 text-green-700',
    'suelto': 'bg-blue-100 text-blue-700',
    'muy_suelto': 'bg-purple-100 text-purple-700'
  };
  return colors[fitType];
}

// Function to get short fit description
export function getFitShortDescription(fitType: FitType): string {
  const descriptions: Record<FitType, string> = {
    'muy_ajustado': 'Muy Ajustado',
    'ajustado': 'Ajustado',
    'perfecto': 'Perfecto',
    'suelto': 'Suelto',
    'muy_suelto': 'Muy Suelto'
  };
  return descriptions[fitType];
}

// Function to determine model size according to garment category
export function getModelSizeForCategory(
  upperBodySize: ClothingSize,
  lowerBodySize: ClothingSize,
  shoeSize: ShoeSize,
  category: ClothingCategory
): ClothingSize | ShoeSize {
  switch (category) {
    case 'camiseta':
    case 'camisa':
    case 'chaqueta':
      return upperBodySize;
    case 'pantalon':
    case 'falda':
      return lowerBodySize;
    case 'vestido':
      // For dresses, use upper body size as reference
      return upperBodySize;
    case 'zapatos':
      return shoeSize;
    case 'accesorios':
      // Accessories don't have specific size
      return upperBodySize; // Default value
    default:
      return upperBodySize;
  }
}

// Function to validate if a size is valid for a category
export function isValidSizeForCategory(
  size: string,
  category: ClothingCategory
): boolean {
  if (category === 'zapatos') {
    const shoeSize = parseInt(size);
    return shoeSize >= 35 && shoeSize <= 46;
  }
  
  if (category === 'accesorios') {
    return true; // Accessories can have any descriptive "size"
  }
  
  return ['XS', 'S', 'M', 'L', 'XL', 'XXL'].includes(size);
}

// Function to get available sizes according to category
export function getAvailableSizesForCategory(category: ClothingCategory): string[] {
  if (category === 'zapatos') {
    return ['35', '36', '37', '38', '39', '40', '41', '42', '43', '44', '45', '46'];
  }
  
  if (category === 'accesorios') {
    return ['Talla Única']; // One size for accessories
  }
  
  return ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
}
