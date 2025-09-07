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
import { LocalStorage } from '@/lib/storage';
import { Garment } from '@/types';

interface GarmentGeneratorProps {
  onGarmentGenerated?: (garment: Garment) => void;
}

export default function GarmentGenerator({ onGarmentGenerated }: GarmentGeneratorProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    color: '',
    size: [] as string[]
  });

  const categories = [
    'camiseta',
    'pantalon',
    'vestido', 
    'falda',
    'camisa',
    'chaqueta',
    'zapatos',
    'accesorios'
  ];

  const sizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];

  const handleSizeToggle = (size: string) => {
    setFormData(prev => ({
      ...prev,
      size: prev.size.includes(size) 
        ? prev.size.filter(s => s !== size)
        : [...prev.size, size]
    }));
  };

  const handleGenerate = async () => {
    if (!formData.name || !formData.description || !formData.category) {
      alert('Por favor completa todos los campos requeridos');
      return;
    }

    setIsGenerating(true);
    try {
      // Pasar todos los datos del formulario para una generación más precisa
      const garmentData = {
        name: formData.name,
        description: formData.description,
        category: formData.category,
        color: formData.color,
        size: formData.size
      };
      
      const imageUrl = await generateGarmentImage(garmentData);
      
      const newGarment = LocalStorage.addGarment({
        name: formData.name,
        description: formData.description,
        category: formData.category as any,
        color: formData.color,
        size: formData.size,
        imageUrl
      });

      onGarmentGenerated?.(newGarment);
      
      // Limpiar formulario
      setFormData({
        name: '',
        description: '',
        category: '',
        color: '',
        size: []
      });

      alert('¡Prenda generada exitosamente!');
    } catch (error) {
      console.error('Error:', error);
      if (error instanceof Error && error.message.includes('API key')) {
        alert('Error: API key no configurada. Ve a la sección "Acerca" para ver las instrucciones de configuración.');
      } else {
        alert('Prenda generada correctamente con placeholder. Configura la API key para usar generación real.');
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
            onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecciona una categoría" />
            </SelectTrigger>
            <SelectContent>
              {categories.map(cat => (
                <SelectItem key={cat} value={cat}>
                  {cat.charAt(0).toUpperCase() + cat.slice(1)}
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

        <div>
          <label className="text-sm font-medium mb-2 block">
            Tallas disponibles
          </label>
          <div className="flex flex-wrap gap-2">
            {sizes.map(size => (
              <Badge
                key={size}
                variant={formData.size.includes(size) ? "default" : "outline"}
                className="cursor-pointer"
                onClick={() => handleSizeToggle(size)}
              >
                {size}
              </Badge>
            ))}
          </div>
        </div>

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
