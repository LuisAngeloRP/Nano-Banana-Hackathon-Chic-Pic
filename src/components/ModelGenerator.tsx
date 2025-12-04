'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, User, Plus } from 'lucide-react';
import { generateAndUploadModelImage } from '@/lib/gemini';
import { SupabaseStorageAdapter } from '@/lib/storage.supabase';
import { Model, ClothingSize, ShoeSize } from '@/types';

interface ModelGeneratorProps {
  onModelGenerated?: (model: Model) => void;
}

export default function ModelGenerator({ onModelGenerated }: ModelGeneratorProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    characteristics: '',
    gender: '',
    age: '',
    height: '',
    bodyType: '',
    hairColor: '',
    eyeColor: '',
    skinTone: '',
    upperBodySize: '' as ClothingSize | '',
    lowerBodySize: '' as ClothingSize | '',
    shoeSize: '' as ShoeSize | ''
  });

  const genderOptions = [
    { value: 'masculino', label: 'Niño' },
    { value: 'femenino', label: 'Niña' },
    { value: 'unisex', label: 'Unisex' }
  ];

  const bodyTypeOptions = [
    'Delgado', 'Promedio', 'Robusto', 'Bebé', 'Toddler'
  ];

  const hairColorOptions = [
    'Negro', 'Castaño', 'Rubio', 'Pelirrojo', 'Gris', 'Blanco'
  ];

  const eyeColorOptions = [
    'Café', 'Azul', 'Verde', 'Avellana', 'Gris', 'Negro'
  ];

  const skinToneOptions = [
    'Muy claro', 'Claro', 'Medio', 'Moreno', 'Oscuro', 'Muy oscuro'
  ];

  const clothingSizes: ClothingSize[] = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
  const shoeSizes: ShoeSize[] = ['20', '21', '22', '23', '24', '25', '26', '27', '28', '29', '30', '31', '32', '33', '34', '35', '36', '37', '38', '39', '40'];

  const handleGenerate = async () => {
    if (!formData.name || !formData.characteristics || !formData.gender || 
        !formData.upperBodySize || !formData.lowerBodySize || !formData.shoeSize) {
      alert('Por favor completa todos los campos requeridos incluyendo las tallas');
      return;
    }

    setIsGenerating(true);
    try {
      // Pasar todos los datos del formulario para una generación más precisa
      const modelData = {
        name: formData.name,
        characteristics: formData.characteristics,
        gender: formData.gender,
        age: formData.age || 'Niño/Niña',
        height: formData.height || 'Promedio',
        bodyType: formData.bodyType || 'Promedio',
        hairColor: formData.hairColor || 'Castaño',
        eyeColor: formData.eyeColor || 'Café',
        skinTone: formData.skinTone || 'Medio'
      };

      console.log('🎨 Generating model image with AI and uploading to Supabase Storage...');
      const imageResult = await generateAndUploadModelImage(modelData);
      
      const newModel = await SupabaseStorageAdapter.addModel({
        name: formData.name,
        characteristics: formData.characteristics,
        gender: formData.gender as Model['gender'],
        age: formData.age || 'Niño/Niña',
        height: formData.height || 'Promedio',
        bodyType: formData.bodyType || 'Promedio',
        hairColor: formData.hairColor || 'Castaño',
        eyeColor: formData.eyeColor || 'Café',
        skinTone: formData.skinTone || 'Medio',
        upperBodySize: formData.upperBodySize,
        lowerBodySize: formData.lowerBodySize,
        shoeSize: formData.shoeSize,
        imageUrl: imageResult.url,
        thumbnailUrl: imageResult.thumbnailUrl,
        storagePath: imageResult.storagePath
      });

      onModelGenerated?.(newModel);
      
      // Limpiar formulario
      setFormData({
        name: '',
        characteristics: '',
        gender: '',
        age: '',
        height: '',
        bodyType: '',
        hairColor: '',
        eyeColor: '',
        skinTone: '',
        upperBodySize: '' as ClothingSize | '',
        lowerBodySize: '' as ClothingSize | '',
        shoeSize: '' as ShoeSize | ''
      });

      alert('¡Modelo generado exitosamente!');
    } catch (error) {
      console.error('Error:', error);
      if (error instanceof Error && error.message.includes('API key')) {
        alert('Error: API key no configurada. Ve a la sección "Acerca de" para ver las instrucciones de configuración.');
      } else {
        alert('Modelo generado correctamente con placeholder. Configura la API key para usar la generación real.');
      }
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="h-5 w-5" />
          Generador de Modelos con IA
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label className="text-sm font-medium mb-2 block">
            Nombre del modelo *
          </label>
          <Input
            placeholder="Ej: Niño modelo alegre"
            value={formData.name}
            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
          />
        </div>

        <div>
          <label className="text-sm font-medium mb-2 block">
            Género *
          </label>
          <Select 
            value={formData.gender} 
            onValueChange={(value) => setFormData(prev => ({ ...prev, gender: value }))}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecciona el género" />
            </SelectTrigger>
            <SelectContent>
              {genderOptions.map(option => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium mb-2 block">
              Edad
            </label>
            <Input
              placeholder="Ej: 5 años, Bebé, Toddler"
              value={formData.age}
              onChange={(e) => setFormData(prev => ({ ...prev, age: e.target.value }))}
            />
          </div>
          <div>
            <label className="text-sm font-medium mb-2 block">
              Estatura
            </label>
            <Input
              placeholder="Ej: 1.10m, Pequeño, Promedio"
              value={formData.height}
              onChange={(e) => setFormData(prev => ({ ...prev, height: e.target.value }))}
            />
          </div>
        </div>

        <div>
          <label className="text-sm font-medium mb-2 block">
            Tipo de cuerpo
          </label>
          <Select 
            value={formData.bodyType} 
            onValueChange={(value) => setFormData(prev => ({ ...prev, bodyType: value }))}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecciona el tipo de cuerpo" />
            </SelectTrigger>
            <SelectContent>
              {bodyTypeOptions.map(type => (
                <SelectItem key={type} value={type}>
                  {type}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium mb-2 block">
              Color de cabello
            </label>
            <Select 
              value={formData.hairColor} 
              onValueChange={(value) => setFormData(prev => ({ ...prev, hairColor: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Color de cabello" />
              </SelectTrigger>
              <SelectContent>
                {hairColorOptions.map(color => (
                  <SelectItem key={color} value={color}>
                    {color}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-sm font-medium mb-2 block">
              Color de ojos
            </label>
            <Select 
              value={formData.eyeColor} 
              onValueChange={(value) => setFormData(prev => ({ ...prev, eyeColor: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Color de ojos" />
              </SelectTrigger>
              <SelectContent>
                {eyeColorOptions.map(color => (
                  <SelectItem key={color} value={color}>
                    {color}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div>
          <label className="text-sm font-medium mb-2 block">
            Tono de piel
          </label>
          <Select 
            value={formData.skinTone} 
            onValueChange={(value) => setFormData(prev => ({ ...prev, skinTone: value }))}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecciona el tono de piel" />
            </SelectTrigger>
            <SelectContent>
              {skinToneOptions.map(tone => (
                <SelectItem key={tone} value={tone}>
                  {tone}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Sección de Tallas */}
        <div className="space-y-4 border-t pt-4">
          <h3 className="font-semibold text-lg">Tallas del Modelo *</h3>
          <p className="text-sm text-muted-foreground">
            Especifica las tallas del modelo para un ajuste preciso de las prendas.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">
                Talla Superior *
              </label>
              <Select 
                value={formData.upperBodySize} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, upperBodySize: value as ClothingSize }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Talla para camisetas..." />
                </SelectTrigger>
                <SelectContent>
                  {clothingSizes.map(size => (
                    <SelectItem key={size} value={size}>
                      {size}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="text-sm font-medium mb-2 block">
                Talla Inferior *
              </label>
              <Select 
                value={formData.lowerBodySize} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, lowerBodySize: value as ClothingSize }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Talla para pantalones..." />
                </SelectTrigger>
                <SelectContent>
                  {clothingSizes.map(size => (
                    <SelectItem key={size} value={size}>
                      {size}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="text-sm font-medium mb-2 block">
                Talla de Zapatos *
              </label>
              <Select 
                value={formData.shoeSize} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, shoeSize: value as ShoeSize }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Número de zapato" />
                </SelectTrigger>
                <SelectContent>
                  {shoeSizes.map(size => (
                    <SelectItem key={size} value={size}>
                      {size}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <div>
          <label className="text-sm font-medium mb-2 block">
            Características adicionales *
          </label>
          <Textarea
            placeholder="Describe características específicas del modelo: expresión, postura, estilo, etc. Recuerda que es para niños, niñas o bebés."
            value={formData.characteristics}
            onChange={(e) => setFormData(prev => ({ ...prev, characteristics: e.target.value }))}
            rows={3}
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
              Generando modelo...
            </>
          ) : (
            <>
              <Plus className="mr-2 h-4 w-4" />
              Generar Modelo con IA
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
