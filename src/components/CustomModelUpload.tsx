'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, Upload, Plus, User } from 'lucide-react';
import { SupabaseStorageAdapter } from '@/lib/storage.supabase';
import { Model, ClothingSize, ShoeSize } from '@/types';
import FileUpload from './FileUpload';

interface CustomModelUploadProps {
  onModelUploaded?: (model: Model) => void;
  onClose?: () => void;
}

export default function CustomModelUpload({ onModelUploaded, onClose }: CustomModelUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
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
    { value: 'masculino', label: 'Masculino' },
    { value: 'femenino', label: 'Femenino' },
    { value: 'unisex', label: 'Unisex' }
  ];

  const ageOptions = [
    'Niño/a (5-12 años)',
    'Adolescente (13-17 años)',
    'Adulto joven (18-30 años)',
    'Adulto (31-50 años)',
    'Adulto mayor (51+ años)'
  ];

  const heightOptions = [
    'Muy bajo/a (< 1.60m)',
    'Bajo/a (1.60-1.65m)',
    'Promedio (1.66-1.75m)',
    'Alto/a (1.76-1.85m)',
    'Muy alto/a (> 1.85m)'
  ];

  const bodyTypeOptions = [
    'Atlético',
    'Delgado',
    'Medio',
    'Curvilíneo',
    'Robusto',
    'Pera',
    'Manzana',
    'Reloj de arena'
  ];

  const hairColorOptions = [
    'Negro',
    'Castaño oscuro',
    'Castaño claro',
    'Rubio oscuro',
    'Rubio claro',
    'Pelirrojo',
    'Gris',
    'Blanco',
    'Teñido (colores fantasia)'
  ];

  const eyeColorOptions = [
    'Marrones',
    'Azules',
    'Verdes',
    'Avellana',
    'Grises',
    'Negros',
    'Ámbar'
  ];

  const skinToneOptions = [
    'Muy claro',
    'Claro',
    'Medio claro',
    'Medio',
    'Medio oscuro',
    'Oscuro',
    'Muy oscuro'
  ];

  const clothingSizes: ClothingSize[] = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
  const shoeSizes: ShoeSize[] = ['35', '36', '37', '38', '39', '40', '41', '42', '43', '44', '45', '46'];

  const handleImageUpload = (file: File, url: string, thumbnailUrl?: string) => {
    setUploadedImage(url);
    console.log('Imagen de modelo subida a Storage:', file.name, 'URL:', url);
  };

  const handleUpload = async () => {
    if (!formData.name || !formData.characteristics || !formData.gender || !uploadedImage ||
        !formData.upperBodySize || !formData.lowerBodySize || !formData.shoeSize) {
      alert('Por favor completa todos los campos requeridos, incluye las tallas y sube una imagen');
      return;
    }

    setIsUploading(true);
    try {
      const newModel = await SupabaseStorageAdapter.addModel({
        name: formData.name,
        characteristics: formData.characteristics,
        gender: formData.gender as any,
        age: formData.age || 'Adulto joven',
        height: formData.height || 'Promedio',
        bodyType: formData.bodyType || 'Medio',
        hairColor: formData.hairColor || 'Castaño',
        eyeColor: formData.eyeColor || 'Marrones',
        skinTone: formData.skinTone || 'Medio',
        upperBodySize: formData.upperBodySize,
        lowerBodySize: formData.lowerBodySize,
        shoeSize: formData.shoeSize,
        imageUrl: uploadedImage // URL de Supabase Storage
      });

      onModelUploaded?.(newModel);
      
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
      setUploadedImage(null);

      alert('¡Modelo subido exitosamente!');
      onClose?.();
    } catch (error) {
      console.error('Error subiendo modelo:', error);
      alert('Error al subir el modelo. Inténtalo de nuevo.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveImage = () => {
    setUploadedImage(null);
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="h-5 w-5" />
          Subir Modelo Personalizado
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Carga de imagen */}
        <div>
          <label className="text-sm font-medium mb-2 block">
            Fotografía del modelo *
          </label>
          <p className="text-xs text-muted-foreground mb-3">
            Sube una foto clara del modelo de cuerpo entero para mejores resultados
          </p>
          <FileUpload
            onFileUpload={handleImageUpload}
            currentImage={uploadedImage || undefined}
            onRemove={handleRemoveImage}
            maxSizeMB={10}
            disabled={isUploading}
            folder="models"
          />
        </div>

        {/* Información básica */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium mb-2 block">
              Nombre del modelo *
            </label>
            <Input
              placeholder="Ej: Ana García, Modelo 1, etc."
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              disabled={isUploading}
            />
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">
              Género *
            </label>
            <Select 
              value={formData.gender} 
              onValueChange={(value) => setFormData(prev => ({ ...prev, gender: value }))}
              disabled={isUploading}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecciona género" />
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
        </div>

        {/* Características físicas básicas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="text-sm font-medium mb-2 block">
              Edad
            </label>
            <Select 
              value={formData.age} 
              onValueChange={(value) => setFormData(prev => ({ ...prev, age: value }))}
              disabled={isUploading}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecciona edad" />
              </SelectTrigger>
              <SelectContent>
                {ageOptions.map(option => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">
              Altura
            </label>
            <Select 
              value={formData.height} 
              onValueChange={(value) => setFormData(prev => ({ ...prev, height: value }))}
              disabled={isUploading}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecciona altura" />
              </SelectTrigger>
              <SelectContent>
                {heightOptions.map(option => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">
              Tipo de cuerpo
            </label>
            <Select 
              value={formData.bodyType} 
              onValueChange={(value) => setFormData(prev => ({ ...prev, bodyType: value }))}
              disabled={isUploading}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecciona tipo" />
              </SelectTrigger>
              <SelectContent>
                {bodyTypeOptions.map(option => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Características físicas detalladas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="text-sm font-medium mb-2 block">
              Color de cabello
            </label>
            <Select 
              value={formData.hairColor} 
              onValueChange={(value) => setFormData(prev => ({ ...prev, hairColor: value }))}
              disabled={isUploading}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecciona color" />
              </SelectTrigger>
              <SelectContent>
                {hairColorOptions.map(option => (
                  <SelectItem key={option} value={option}>
                    {option}
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
              disabled={isUploading}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecciona color" />
              </SelectTrigger>
              <SelectContent>
                {eyeColorOptions.map(option => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">
              Tono de piel
            </label>
            <Select 
              value={formData.skinTone} 
              onValueChange={(value) => setFormData(prev => ({ ...prev, skinTone: value }))}
              disabled={isUploading}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecciona tono" />
              </SelectTrigger>
              <SelectContent>
                {skinToneOptions.map(option => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Tallas del modelo */}
        <div>
          <h3 className="text-sm font-medium mb-3">Tallas del modelo *</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">
                Talla superior *
              </label>
              <Select 
                value={formData.upperBodySize} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, upperBodySize: value as ClothingSize }))}
                disabled={isUploading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona talla" />
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
                Talla inferior *
              </label>
              <Select 
                value={formData.lowerBodySize} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, lowerBodySize: value as ClothingSize }))}
                disabled={isUploading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona talla" />
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
                Talla de zapatos *
              </label>
              <Select 
                value={formData.shoeSize} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, shoeSize: value as ShoeSize }))}
                disabled={isUploading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona talla" />
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

        {/* Características adicionales */}
        <div>
          <label className="text-sm font-medium mb-2 block">
            Características adicionales *
          </label>
          <Textarea
            placeholder="Describe características específicas del modelo: estilo, personalidad, expresión facial, pose natural, etc."
            value={formData.characteristics}
            onChange={(e) => setFormData(prev => ({ ...prev, characteristics: e.target.value }))}
            rows={3}
            disabled={isUploading}
          />
        </div>

        {/* Vista previa de tallas */}
        {(formData.upperBodySize || formData.lowerBodySize || formData.shoeSize) && (
          <div className="p-4 bg-gray-50 rounded-lg">
            <h4 className="text-sm font-medium mb-2">Resumen de tallas:</h4>
            <div className="flex flex-wrap gap-2">
              {formData.upperBodySize && (
                <Badge variant="outline">Superior: {formData.upperBodySize}</Badge>
              )}
              {formData.lowerBodySize && (
                <Badge variant="outline">Inferior: {formData.lowerBodySize}</Badge>
              )}
              {formData.shoeSize && (
                <Badge variant="outline">Zapatos: {formData.shoeSize}</Badge>
              )}
            </div>
          </div>
        )}

        {/* Botones de acción */}
        <div className="flex gap-2 pt-4">
          <Button 
            onClick={handleUpload} 
            disabled={isUploading || !uploadedImage || !formData.name || !formData.gender || 
                     !formData.upperBodySize || !formData.lowerBodySize || !formData.shoeSize}
            className="flex-1"
          >
            {isUploading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Subiendo...
              </>
            ) : (
              <>
                <Plus className="mr-2 h-4 w-4" />
                Subir Modelo
              </>
            )}
          </Button>
          
          {onClose && (
            <Button 
              variant="outline" 
              onClick={onClose}
              disabled={isUploading}
            >
              Cancelar
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
