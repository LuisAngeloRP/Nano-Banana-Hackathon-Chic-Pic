'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
// Badge import removed - not used
import { Loader2, Shirt, Plus } from 'lucide-react';
import { generateAndUploadGarmentImage } from '@/lib/gemini';
import { SupabaseStorageAdapter } from '@/lib/storage.supabase';
import { Garment, ClothingCategory, ClothingSize, ShoeSize } from '@/types';
import { getAvailableSizesForCategory } from '@/lib/sizeUtils';

interface GarmentGeneratorProps {
  onGarmentGenerated?: (garment: Garment) => void;
}

export default function GarmentGenerator({ onGarmentGenerated }: GarmentGeneratorProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '' as ClothingCategory | '',
    color: ''
  });

  const categories: { value: ClothingCategory; label: string }[] = [
    { value: 'camiseta', label: 'T-shirt' },
    { value: 'camisa', label: 'Shirt' },
    { value: 'chaqueta', label: 'Jacket' },
    { value: 'pantalon', label: 'Pants' },
    { value: 'falda', label: 'Skirt' },
    { value: 'vestido', label: 'Dress' },
    { value: 'zapatos', label: 'Shoes' },
    { value: 'accesorios', label: 'Accessories' }
  ];

  // Las tallas se asignarán automáticamente según la categoría

  const handleCategoryChange = (category: ClothingCategory) => {
    setFormData(prev => ({
      ...prev,
      category
    }));
  };

  // Ya no necesitamos la función base64ToFile aquí - se maneja internamente

  const handleGenerate = async () => {
    if (!formData.name || !formData.description || !formData.category) {
      alert('Please complete all required fields');
      return;
    }

    setIsGenerating(true);
    try {
      // Generar tallas disponibles automáticamente según la categoría
      const availableSizes = getAvailableSizesForCategory(formData.category as ClothingCategory) as (ClothingSize | ShoeSize)[];
      
      // Pasar todos los datos del formulario para una generación más precisa
      const garmentData = {
        name: formData.name,
        description: formData.description,
        category: formData.category,
        color: formData.color,
        size: availableSizes // Pasar las tallas disponibles automáticamente
      };
      
      console.log('🎨 Generating image with AI and uploading to Supabase Storage...');
      const imageResult = await generateAndUploadGarmentImage(garmentData);
      
      // Crear prenda con URLs de Storage
      const newGarment = await SupabaseStorageAdapter.addGarment({
        name: formData.name,
        description: formData.description,
        category: formData.category,
        color: formData.color,
        availableSizes: availableSizes,
        imageUrl: imageResult.url,
        thumbnailUrl: imageResult.thumbnailUrl,
        storagePath: imageResult.storagePath
      });

      onGarmentGenerated?.(newGarment);
      
      // Limpiar formulario
      setFormData({
        name: '',
        description: '',
        category: '' as ClothingCategory | '',
        color: ''
      });

      alert('Garment generated successfully!');
    } catch (error) {
      console.error('Error:', error);
      if (error instanceof Error && error.message.includes('API key')) {
        alert('Error: API key not configured. Go to the "About" section to see configuration instructions.');
      } else {
        alert('Error generating garment: ' + (error instanceof Error ? error.message : 'Unknown error'));
      }
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shirt className="h-5 w-5" />
          AI Garment Generator
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label className="text-sm font-medium mb-2 block">
            Garment name *
          </label>
          <Input
            placeholder="Ex: Elegant summer t-shirt"
            value={formData.name}
            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
          />
        </div>

        <div>
          <label className="text-sm font-medium mb-2 block">
            Category *
          </label>
          <Select 
            value={formData.category} 
            onValueChange={(value) => handleCategoryChange(value as ClothingCategory)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select a category" />
            </SelectTrigger>
            <SelectContent>
              {categories.map(cat => (
                <SelectItem key={cat.value} value={cat.value}>
                  {cat.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="text-sm font-medium mb-2 block">
            Color
          </label>
          <Input
              placeholder="Ex: Navy blue, Scarlet red, etc."
            value={formData.color}
            onChange={(e) => setFormData(prev => ({ ...prev, color: e.target.value }))}
          />
        </div>

        {/* Información sobre tallas */}
        {formData.category && (
          <div className="bg-blue-50 p-3 rounded-md">
            <p className="text-sm text-blue-700 font-medium mb-1">
              📝 Available sizes
            </p>
            <p className="text-xs text-blue-600">
              This garment will be available in standard sizes for {formData.category}:
              <span className="font-medium ml-1">
                {getAvailableSizesForCategory(formData.category).join(', ')}
              </span>
            </p>
            <p className="text-xs text-blue-500 mt-1">
              ℹ️ In the stylist you can select the specific size for each look.
            </p>
          </div>
        )}

        <div>
          <label className="text-sm font-medium mb-2 block">
            Detailed description *
          </label>
          <Textarea
            placeholder="Describe the garment in detail: style, material, special features, etc."
            value={formData.description}
            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            rows={4}
          />
        </div>

        <Button 
          onClick={handleGenerate} 
          disabled={isGenerating}
          className="w-full"
        >
          {isGenerating ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Generating garment...
            </>
          ) : (
            <>
              <Plus className="mr-2 h-4 w-4" />
              Generate Garment with AI
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
