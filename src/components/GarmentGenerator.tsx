'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, Shirt, Plus } from 'lucide-react';
import { generateGarmentImage } from '@/lib/gemini';
import { SupabaseStorageAdapter } from '@/lib/storage.supabase';
import { supabaseStorage } from '@/lib/supabaseStorage';
import { Garment, ClothingCategory, ClothingSize, ShoeSize } from '@/types';
import { getAvailableSizesForCategory, isValidSizeForCategory } from '@/lib/sizeUtils';

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
    { value: 'camiseta', label: 'Camiseta' },
    { value: 'camisa', label: 'Camisa' },
    { value: 'chaqueta', label: 'Chaqueta' },
    { value: 'pantalon', label: 'Pantalón' },
    { value: 'falda', label: 'Falda' },
    { value: 'vestido', label: 'Vestido' },
    { value: 'zapatos', label: 'Zapatos' },
    { value: 'accesorios', label: 'Accesorios' }
  ];

  // Las tallas se asignarán automáticamente según la categoría

  const handleCategoryChange = (category: ClothingCategory) => {
    setFormData(prev => ({
      ...prev,
      category
    }));
  };

  // Función auxiliar para convertir base64 a File
  const base64ToFile = (base64String: string, filename: string): File => {
    const arr = base64String.split(',');
    const mime = arr[0].match(/:(.*?);/)![1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new File([u8arr], filename, { type: mime });
  };

  const handleGenerate = async () => {
    if (!formData.name || !formData.description || !formData.category) {
      alert('Por favor completa todos los campos requeridos');
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
      
      console.log('🎨 Generando imagen con IA...');
      const base64Image = await generateGarmentImage(garmentData);
      
      console.log('📤 Subiendo imagen a Supabase Storage...');
      // Convertir base64 a File
      const filename = `generated-garment-${Date.now()}.jpg`;
      const imageFile = base64ToFile(base64Image, filename);
      
      // Subir a Supabase Storage
      const uploadResult = await supabaseStorage.uploadImage(imageFile, 'garments');
      
      if (!uploadResult.success || !uploadResult.url) {
        throw new Error(uploadResult.error || 'Error al subir imagen a Storage');
      }

      console.log('✅ Imagen subida a Storage:', uploadResult.url);
      
      // Crear prenda con URLs de Storage
      const newGarment = await SupabaseStorageAdapter.addGarment({
        name: formData.name,
        description: formData.description,
        category: formData.category,
        color: formData.color,
        availableSizes: availableSizes,
        imageUrl: uploadResult.url,
        thumbnailUrl: uploadResult.thumbnailUrl,
        storagePath: uploadResult.path || ''
      });

      onGarmentGenerated?.(newGarment);
      
      // Limpiar formulario
      setFormData({
        name: '',
        description: '',
        category: '' as ClothingCategory | '',
        color: ''
      });

      alert('¡Prenda generada exitosamente!');
    } catch (error) {
      console.error('Error:', error);
      if (error instanceof Error && error.message.includes('API key')) {
        alert('Error: API key no configurada. Ve a la sección "Acerca" para ver las instrucciones de configuración.');
      } else {
        alert('Error al generar prenda: ' + (error instanceof Error ? error.message : 'Error desconocido'));
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
          Generador de Prendas IA
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label className="text-sm font-medium mb-2 block">
            Nombre de la prenda *
          </label>
          <Input
            placeholder="Ej: Camiseta elegante de verano"
            value={formData.name}
            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
          />
        </div>

        <div>
          <label className="text-sm font-medium mb-2 block">
            Categoría *
          </label>
          <Select 
            value={formData.category} 
            onValueChange={(value) => handleCategoryChange(value as ClothingCategory)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecciona una categoría" />
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
            placeholder="Ej: Azul marino, Rojo escarlata, etc."
            value={formData.color}
            onChange={(e) => setFormData(prev => ({ ...prev, color: e.target.value }))}
          />
        </div>

        {/* Información sobre tallas */}
        {formData.category && (
          <div className="bg-blue-50 p-3 rounded-md">
            <p className="text-sm text-blue-700 font-medium mb-1">
              📝 Tallas disponibles
            </p>
            <p className="text-xs text-blue-600">
              Esta prenda estará disponible en las tallas estándar para {formData.category}:
              <span className="font-medium ml-1">
                {getAvailableSizesForCategory(formData.category).join(', ')}
              </span>
            </p>
            <p className="text-xs text-blue-500 mt-1">
              ℹ️ En el estilista podrás seleccionar la talla específica para cada look.
            </p>
          </div>
        )}

        <div>
          <label className="text-sm font-medium mb-2 block">
            Descripción detallada *
          </label>
          <Textarea
            placeholder="Describe la prenda en detalle: estilo, material, características especiales, etc."
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
              Generando prenda...
            </>
          ) : (
            <>
              <Plus className="mr-2 h-4 w-4" />
              Generar Prenda con IA
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
