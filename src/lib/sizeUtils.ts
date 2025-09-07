import { ClothingSize, ShoeSize, FitType, ClothingCategory } from '@/types';

// Mapa de tallas de ropa a números para comparaciones
const CLOTHING_SIZE_ORDER: Record<ClothingSize, number> = {
  'XS': 1,
  'S': 2,
  'M': 3,
  'L': 4,
  'XL': 5,
  'XXL': 6
};

// Función para determinar el tipo de ajuste basado en las diferencias de tallas
export function determineFitType(
  garmentSize: ClothingSize | ShoeSize,
  modelSize: ClothingSize | ShoeSize,
  category: ClothingCategory
): FitType {
  // Para accesorios, siempre es perfecto
  if (category === 'accesorios') {
    return 'perfecto';
  }

  // Para zapatos, comparar números directamente
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

  // Para ropa, usar el orden de tallas
  const garmentOrder = CLOTHING_SIZE_ORDER[garmentSize as ClothingSize];
  const modelOrder = CLOTHING_SIZE_ORDER[modelSize as ClothingSize];
  const diff = garmentOrder - modelOrder;

  if (diff <= -2) return 'muy_ajustado';
  if (diff === -1) return 'ajustado';
  if (diff === 0) return 'perfecto';
  if (diff === 1) return 'suelto';
  return 'muy_suelto';
}

// Función para generar descripción del ajuste
export function generateFitDescription(
  fitType: FitType,
  garmentName: string,
  category: ClothingCategory
): string {
  const descriptions: Record<FitType, Record<ClothingCategory | 'default', string>> = {
    'muy_ajustado': {
      'camiseta': `La ${garmentName} queda muy ajustada, marcando la figura y posiblemente limitando el movimiento.`,
      'camisa': `La ${garmentName} queda muy ceñida al cuerpo, con las mangas y torso muy justos.`,
      'chaqueta': `La ${garmentName} queda muy ajustada, dificultando cerrarla y limitando la comodidad.`,
      'pantalon': `El ${garmentName} queda muy ajustado en cintura y piernas, marcando mucho la silueta.`,
      'falda': `La ${garmentName} queda muy ceñida en caderas y cintura, limitando el movimiento.`,
      'vestido': `El ${garmentName} queda muy ajustado en todas las áreas, marcando completamente la figura.`,
      'zapatos': `Los ${garmentName} quedan muy pequeños, causando incomodidad y posibles molestias.`,
      'accesorios': `El ${garmentName} se ajusta perfectamente.`,
      'default': `${garmentName} queda muy ajustado.`
    },
    'ajustado': {
      'camiseta': `La ${garmentName} queda ajustada pero cómoda, siguiendo las líneas del cuerpo sin apretar.`,
      'camisa': `La ${garmentName} queda bien ajustada, con un corte favorecedor y elegante.`,
      'chaqueta': `La ${garmentName} queda ajustada pero permite movimiento cómodo, con un corte entallado.`,
      'pantalon': `El ${garmentName} queda ajustado en cintura y piernas, con un corte favorecedor.`,
      'falda': `La ${garmentName} queda ajustada en caderas, creando una silueta elegante.`,
      'vestido': `El ${garmentName} queda ajustado, resaltando la figura de manera favorecedora.`,
      'zapatos': `Los ${garmentName} quedan un poco justos pero cómodos para usar.`,
      'accesorios': `El ${garmentName} se ajusta perfectamente.`,
      'default': `${garmentName} queda ajustado pero cómodo.`
    },
    'perfecto': {
      'camiseta': `La ${garmentName} queda perfecta, con el ajuste ideal para comodidad y estilo.`,
      'camisa': `La ${garmentName} tiene el ajuste perfecto, ni muy suelta ni muy ajustada.`,
      'chaqueta': `La ${garmentName} queda perfecta, permitiendo libertad de movimiento y un look impecable.`,
      'pantalon': `El ${garmentName} tiene el ajuste perfecto en cintura, caderas y largo.`,
      'falda': `La ${garmentName} queda perfecta, con el ajuste ideal en caderas y cintura.`,
      'vestido': `El ${garmentName} queda perfecto, con el ajuste ideal en todas las áreas.`,
      'zapatos': `Los ${garmentName} calzan perfectamente, proporcionando comodidad total.`,
      'accesorios': `El ${garmentName} se ajusta perfectamente.`,
      'default': `${garmentName} queda perfecto.`
    },
    'suelto': {
      'camiseta': `La ${garmentName} queda suelta pero elegante, proporcionando comodidad y un look relajado.`,
      'camisa': `La ${garmentName} queda suelta, creando un estilo cómodo y casual.`,
      'chaqueta': `La ${garmentName} queda suelta, permitiendo capas debajo y un look oversized.`,
      'pantalon': `El ${garmentName} queda suelto, proporcionando comodidad y un estilo relajado.`,
      'falda': `La ${garmentName} queda suelta en caderas, creando un look fluido y cómodo.`,
      'vestido': `El ${garmentName} queda suelto, proporcionando comodidad y un estilo elegante.`,
      'zapatos': `Los ${garmentName} quedan un poco grandes pero aún usables con calcetines.`,
      'accesorios': `El ${garmentName} se ajusta perfectamente.`,
      'default': `${garmentName} queda suelto pero cómodo.`
    },
    'muy_suelto': {
      'camiseta': `La ${garmentName} queda muy suelta, creando un look oversized muy pronunciado.`,
      'camisa': `La ${garmentName} queda muy holgada, con un estilo oversized muy marcado.`,
      'chaqueta': `La ${garmentName} queda muy suelta, con un estilo oversized que puede verse desproporcionado.`,
      'pantalon': `El ${garmentName} queda muy suelto, posiblemente necesitando cinturón para mantenerse en su lugar.`,
      'falda': `La ${garmentName} queda muy suelta, creando un volumen considerable.`,
      'vestido': `El ${garmentName} queda muy suelto, con un look oversized muy pronunciado.`,
      'zapatos': `Los ${garmentName} quedan muy grandes, dificultando caminar con comodidad.`,
      'accesorios': `El ${garmentName} se ajusta perfectamente.`,
      'default': `${garmentName} queda muy suelto.`
    }
  };

  return descriptions[fitType][category] || descriptions[fitType]['default'];
}

// Función para obtener el color de badge según el tipo de ajuste
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

// Función para obtener la descripción corta del ajuste
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

// Función para determinar la talla del modelo según la categoría de prenda
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
      // Para vestidos, usar la talla superior como referencia
      return upperBodySize;
    case 'zapatos':
      return shoeSize;
    case 'accesorios':
      // Los accesorios no tienen talla específica
      return upperBodySize; // Valor por defecto
    default:
      return upperBodySize;
  }
}

// Función para validar si una talla es válida para una categoría
export function isValidSizeForCategory(
  size: string,
  category: ClothingCategory
): boolean {
  if (category === 'zapatos') {
    const shoeSize = parseInt(size);
    return shoeSize >= 35 && shoeSize <= 46;
  }
  
  if (category === 'accesorios') {
    return true; // Los accesorios pueden tener cualquier "talla" descriptiva
  }
  
  return ['XS', 'S', 'M', 'L', 'XL', 'XXL'].includes(size);
}

// Función para obtener las tallas disponibles según la categoría
export function getAvailableSizesForCategory(category: ClothingCategory): string[] {
  if (category === 'zapatos') {
    return ['35', '36', '37', '38', '39', '40', '41', '42', '43', '44', '45', '46'];
  }
  
  if (category === 'accesorios') {
    return ['Único']; // Talla única para accesorios
  }
  
  return ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
}
