'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, Plus, User } from 'lucide-react';
import { SupabaseStorageAdapter } from '@/lib/storage.supabase';
import { Model, ClothingSize, ShoeSize } from '@/types';
import FileUpload from './FileUpload';

interface CustomModelUploadProps {
  onModelUploaded?: (model: Model) => void;
  onClose?: () => void;
}

export default function CustomModelUpload({ onModelUploaded, onClose }: CustomModelUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [originalImageUrl, setOriginalImageUrl] = useState<string | null>(null);
  const [processedImageUrl, setProcessedImageUrl] = useState<string | null>(null);
  const [annotations, setAnnotations] = useState('');
  const [storagePath, setStoragePath] = useState<string>('');
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

  const ageOptions = [
    'Bebé (0-2 años)',
    'Toddler (2-4 años)',
    'Niño pequeño (5-8 años)',
    'Niño (9-12 años)',
    'Adolescente (13-17 años)'
  ];

  const heightOptions = [
    'Muy pequeño (< 1.00m)',
    'Pequeño (1.00-1.20m)',
    'Promedio (1.21-1.40m)',
    'Alto (1.41-1.60m)',
    'Muy alto (> 1.60m)'
  ];

  const bodyTypeOptions = [
    'Delgado',
    'Promedio',
    'Robusto',
    'Bebé',
    'Toddler'
  ];

  const hairColorOptions = [
    'Negro',
    'Castaño oscuro',
    'Castaño',
    'Rubio oscuro',
    'Rubio claro',
    'Pelirrojo',
    'Gris',
    'Blanco'
  ];

  const eyeColorOptions = [
    'Café',
    'Azul',
    'Verde',
    'Avellana',
    'Gris',
    'Negro'
  ];

  const skinToneOptions = [
    'Muy claro',
    'Claro',
    'Medio claro',
    'Medio',
    'Moreno claro',
    'Oscuro',
    'Muy oscuro'
  ];

  const clothingSizes: ClothingSize[] = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
  const shoeSizes: ShoeSize[] = ['35', '36', '37', '38', '39', '40', '41', '42', '43', '44', '45', '46'];

  const handleImageUpload = (file: File, url: string, thumbnailUrl?: string, storagePath?: string) => {
    setOriginalImageUrl(url);
    setUploadedImage(url);
    setProcessedImageUrl(null);
    setStoragePath(storagePath || '');
    console.log('Imagen de modelo subida a Storage:', file.name, 'URL:', url);
  };

  const handleProcessImage = async () => {
    if (!originalImageUrl) {
      alert('Por favor sube una imagen primero');
      return;
    }

    setIsProcessing(true);
    try {
      // Llamar a la API para procesar la imagen con IA
      const response = await fetch('/api/process-model-image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          imageUrl: originalImageUrl,
          annotations: annotations.trim() || undefined
        })
      });

      const data = await response.json();

      if (!data.success) {
        // Manejar errores de cuota específicamente
        if (response.status === 429 || data.quotaExceeded) {
          throw new Error('Se ha excedido la cuota de la API de Google Gemini. Por favor espera unos minutos antes de intentar nuevamente. Si el problema persiste, verifica tu plan de Google Gemini API.');
        }
        
        // Manejar errores de seguridad
        if (data.safetyBlocked || response.status === 400) {
          throw new Error(data.error || 'La imagen fue bloqueada por políticas de seguridad. Intenta con una imagen diferente o más clara.');
        }
        
        throw new Error(data.error || 'Error al procesar la imagen');
      }

      // Actualizar con la imagen procesada y datos generados
      setProcessedImageUrl(data.processedImageUrl);
      setUploadedImage(data.processedImageUrl);
      
      // Auto-completar formulario con datos generados por IA
      if (data.modelData) {
        setFormData(prev => ({
          ...prev,
          name: data.modelData.name || prev.name,
          characteristics: data.modelData.characteristics || prev.characteristics,
          gender: data.modelData.gender || prev.gender,
          age: data.modelData.age || prev.age,
          height: data.modelData.height || prev.height,
          bodyType: data.modelData.bodyType || prev.bodyType,
          hairColor: data.modelData.hairColor || prev.hairColor,
          eyeColor: data.modelData.eyeColor || prev.eyeColor,
          skinTone: data.modelData.skinTone || prev.skinTone,
          upperBodySize: (data.modelData.upperBodySize as ClothingSize) || prev.upperBodySize,
          lowerBodySize: (data.modelData.lowerBodySize as ClothingSize) || prev.lowerBodySize,
          shoeSize: (data.modelData.shoeSize as ShoeSize) || prev.shoeSize
        }));
      }

      alert('¡Imagen procesada exitosamente! Revisa y ajusta los datos si es necesario.');
    } catch (error) {
      console.error('Error procesando imagen:', error);
      alert(error instanceof Error ? error.message : 'Error al procesar la imagen. Intenta de nuevo.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleUpload = async () => {
    if (!uploadedImage) {
      alert('Por favor sube y procesa una imagen primero');
      return;
    }

    if (!formData.name || !formData.gender) {
      alert('Por favor completa al menos el nombre y el género');
      return;
    }

    if (!formData.upperBodySize || !formData.lowerBodySize || !formData.shoeSize) {
      alert('Por favor completa todas las tallas requeridas');
      return;
    }

    setIsUploading(true);
    try {
      const newModel = await SupabaseStorageAdapter.addModel({
        name: formData.name,
        characteristics: formData.characteristics || 'Modelo procesado con IA',
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
        imageUrl: uploadedImage, // URL de la imagen procesada
        storagePath: storagePath // Ruta para eliminación
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
      setOriginalImageUrl(null);
      setProcessedImageUrl(null);
      setAnnotations('');

      alert('¡Modelo subido exitosamente!');
      onClose?.();
    } catch (error) {
      console.error('Error uploading model:', error);
      alert('Error al subir el modelo. Intenta de nuevo.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveImage = () => {
    setUploadedImage(null);
    setOriginalImageUrl(null);
    setProcessedImageUrl(null);
    setAnnotations('');
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="h-5 w-5" />
          Subir Modelo Personalizado
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 md:space-y-6">
        {/* Carga de imagen */}
        <div>
          <label className="text-sm font-medium mb-2 block">
            Fotografía del modelo (foto o archivo) *
          </label>
          <p className="text-xs text-muted-foreground mb-3">
            Sube una foto clara de cuerpo completo del modelo para mejores resultados
          </p>
          <FileUpload
            onFileUpload={handleImageUpload}
            currentImage={processedImageUrl || originalImageUrl || undefined}
            onRemove={handleRemoveImage}
            maxSizeMB={10}
            disabled={isUploading || isProcessing}
            folder="models"
          />
          
          {/* Campo de anotaciones */}
          {originalImageUrl && (
            <div className="mt-4">
              <label className="text-sm font-medium mb-2 block">
                Anotaciones (opcional)
              </label>
              <Textarea
                placeholder="Ej: Solo considera al niño de la izquierda, Enfócate en el modelo principal, etc."
                value={annotations}
                onChange={(e) => setAnnotations(e.target.value)}
                rows={2}
                disabled={isProcessing || isUploading}
                className="text-sm"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Indica qué modelo específico quieres procesar si hay múltiples personas en la foto
              </p>
              
              {/* Botón de procesar */}
              <Button
                onClick={handleProcessImage}
                disabled={isProcessing || isUploading || !originalImageUrl}
                className="mt-3 w-full sm:w-auto"
                variant="default"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Procesando con IA...
                  </>
                ) : (
                  <>
                    <User className="mr-2 h-4 w-4" />
                    Procesar Imagen con IA
                  </>
                )}
              </Button>
              
              {processedImageUrl && (
                <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-sm text-green-700">
                    ✓ Imagen procesada exitosamente. La IA ha generado automáticamente los datos del modelo.
                  </p>
                </div>
              )}
            </div>
          )}
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
        </div>

        {/* Características físicas básicas */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
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
                <SelectValue placeholder="Selecciona la edad" />
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
              Estatura
            </label>
            <Select 
              value={formData.height} 
              onValueChange={(value) => setFormData(prev => ({ ...prev, height: value }))}
              disabled={isUploading}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecciona la estatura" />
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
                <SelectValue placeholder="Selecciona el tipo" />
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
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
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
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
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
        <div className="flex flex-col sm:flex-row gap-2 pt-4">
          <Button 
            onClick={handleUpload} 
            disabled={isUploading || isProcessing || !uploadedImage || !formData.name || !formData.gender || 
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
                Guardar Modelo
              </>
            )}
          </Button>
          
          {onClose && (
            <Button 
              variant="outline" 
              onClick={onClose}
              disabled={isUploading}
              className="sm:w-auto w-full"
            >
              Cancelar
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
