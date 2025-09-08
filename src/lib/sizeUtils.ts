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
  if (category === 'accessories') {
    return 'perfect';
  }

  // For shoes, compare numbers directly
  if (category === 'shoes') {
    const garmentNum = parseInt(garmentSize as string);
    const modelNum = parseInt(modelSize as string);
    const diff = garmentNum - modelNum;
    
    if (diff <= -2) return 'very_tight';
    if (diff === -1) return 'tight';
    if (diff === 0) return 'perfect';
    if (diff === 1) return 'loose';
    return 'very_loose';
  }

  // For clothing, use size order
  const garmentOrder = CLOTHING_SIZE_ORDER[garmentSize as ClothingSize];
  const modelOrder = CLOTHING_SIZE_ORDER[modelSize as ClothingSize];
  const diff = garmentOrder - modelOrder;

  if (diff <= -2) return 'very_tight';
  if (diff === -1) return 'tight';
  if (diff === 0) return 'perfect';
  if (diff === 1) return 'loose';
  return 'very_loose';
}

// Function to generate fit description
export function generateFitDescription(
  fitType: FitType,
  garmentName: string,
  category: ClothingCategory
): string {
  const descriptions: Record<FitType, Record<ClothingCategory | 'default', string>> = {
    'very_tight': {
      'shirt': `The ${garmentName} fits very tightly, hugging the figure and possibly limiting movement.`,
      'blouse': `The ${garmentName} fits very snugly to the body, with sleeves and torso very tight.`,
      'jacket': `The ${garmentName} fits very tightly, making it difficult to close and limiting comfort.`,
      'pants': `The ${garmentName} fits very tightly at waist and legs, emphasizing the silhouette significantly.`,
      'skirt': `The ${garmentName} fits very snugly at hips and waist, limiting movement.`,
      'dress': `The ${garmentName} fits very tightly in all areas, completely outlining the figure.`,
      'shoes': `The ${garmentName} are too small, causing discomfort and possible pain.`,
      'accessories': `The ${garmentName} fits perfectly.`,
      'default': `${garmentName} fits very tightly.`
    },
    'tight': {
      'shirt': `The ${garmentName} fits snugly but comfortably, following the body lines without squeezing.`,
      'blouse': `The ${garmentName} fits well-tailored, with a flattering and elegant cut.`,
      'jacket': `The ${garmentName} fits snugly but allows comfortable movement, with a fitted cut.`,
      'pants': `The ${garmentName} fits snugly at waist and legs, with a flattering cut.`,
      'skirt': `The ${garmentName} fits snugly at hips, creating an elegant silhouette.`,
      'dress': `The ${garmentName} fits snugly, highlighting the figure in a flattering way.`,
      'shoes': `The ${garmentName} are a bit snug but comfortable to wear.`,
      'accessories': `The ${garmentName} fits perfectly.`,
      'default': `${garmentName} fits snugly but comfortably.`
    },
    'perfect': {
      'shirt': `The ${garmentName} fits perfectly, with the ideal fit for comfort and style.`,
      'blouse': `The ${garmentName} has the perfect fit, neither too loose nor too tight.`,
      'jacket': `The ${garmentName} fits perfectly, allowing freedom of movement and an impeccable look.`,
      'pants': `The ${garmentName} has the perfect fit at waist, hips, and length.`,
      'skirt': `The ${garmentName} fits perfectly, with the ideal fit at hips and waist.`,
      'dress': `The ${garmentName} fits perfectly, with the ideal fit in all areas.`,
      'shoes': `The ${garmentName} fit perfectly, providing total comfort.`,
      'accessories': `The ${garmentName} fits perfectly.`,
      'default': `${garmentName} fits perfectly.`
    },
    'loose': {
      'shirt': `The ${garmentName} fits loosely but elegantly, providing comfort and a relaxed look.`,
      'blouse': `The ${garmentName} fits loosely, creating a comfortable and casual style.`,
      'jacket': `The ${garmentName} fits loosely, allowing layers underneath and an oversized look.`,
      'pants': `The ${garmentName} fits loosely, providing comfort and a relaxed style.`,
      'skirt': `The ${garmentName} fits loosely at hips, creating a fluid and comfortable look.`,
      'dress': `The ${garmentName} fits loosely, providing comfort and an elegant style.`,
      'shoes': `The ${garmentName} are a bit large but still wearable with socks.`,
      'accessories': `The ${garmentName} fits perfectly.`,
      'default': `${garmentName} fits loosely but comfortably.`
    },
    'very_loose': {
      'shirt': `The ${garmentName} fits very loosely, creating a very pronounced oversized look.`,
      'blouse': `The ${garmentName} fits very loosely, with a very marked oversized style.`,
      'jacket': `The ${garmentName} fits very loosely, with an oversized style that may look disproportionate.`,
      'pants': `The ${garmentName} fits very loosely, possibly needing a belt to stay in place.`,
      'skirt': `The ${garmentName} fits very loosely, creating considerable volume.`,
      'dress': `The ${garmentName} fits very loosely, with a very pronounced oversized look.`,
      'shoes': `The ${garmentName} are too large, making it difficult to walk comfortably.`,
      'accessories': `The ${garmentName} fits perfectly.`,
      'default': `${garmentName} fits very loosely.`
    }
  };

  return descriptions[fitType][category] || descriptions[fitType]['default'];
}

// Function to get badge color according to fit type
export function getFitBadgeColor(fitType: FitType): string {
  const colors: Record<FitType, string> = {
    'very_tight': 'bg-red-100 text-red-700',
    'tight': 'bg-orange-100 text-orange-700',
    'perfect': 'bg-green-100 text-green-700',
    'loose': 'bg-blue-100 text-blue-700',
    'very_loose': 'bg-purple-100 text-purple-700'
  };
  return colors[fitType];
}

// Function to get short fit description
export function getFitShortDescription(fitType: FitType): string {
  const descriptions: Record<FitType, string> = {
    'very_tight': 'Very Tight',
    'tight': 'Tight',
    'perfect': 'Perfect',
    'loose': 'Loose',
    'very_loose': 'Very Loose'
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
    case 'shirt':
    case 'blouse':
    case 'jacket':
      return upperBodySize;
    case 'pants':
    case 'skirt':
      return lowerBodySize;
    case 'dress':
      // For dresses, use upper body size as reference
      return upperBodySize;
    case 'shoes':
      return shoeSize;
    case 'accessories':
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
  if (category === 'shoes') {
    const shoeSize = parseInt(size);
    return shoeSize >= 35 && shoeSize <= 46;
  }
  
  if (category === 'accessories') {
    return true; // Accessories can have any descriptive "size"
  }
  
  return ['XS', 'S', 'M', 'L', 'XL', 'XXL'].includes(size);
}

// Function to get available sizes according to category
export function getAvailableSizesForCategory(category: ClothingCategory): string[] {
  if (category === 'shoes') {
    return ['35', '36', '37', '38', '39', '40', '41', '42', '43', '44', '45', '46'];
  }
  
  if (category === 'accessories') {
    return ['One Size']; // One size for accessories
  }
  
  return ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
}
