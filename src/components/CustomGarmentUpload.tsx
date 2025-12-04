'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, Upload, Plus } from 'lucide-react';
import { SupabaseStorageAdapter } from '@/lib/storage.supabase';
import { Garment, ClothingCategory, ClothingSize, ShoeSize } from '@/types';
import { getAvailableSizesForCategory } from '@/lib/sizeUtils';
import FileUpload from './FileUpload';

interface CustomGarmentUploadProps {
  onGarmentUploaded?: (garment: Garment) => void;
  onClose?: () => void;
}

export default function CustomGarmentUpload({ onGarmentUploaded, onClose }: CustomGarmentUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [originalImageUrl, setOriginalImageUrl] = useState<string | null>(null);
  const [processedImageUrl, setProcessedImageUrl] = useState<string | null>(null);
  const [annotations, setAnnotations] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '' as ClothingCategory | '',
    color: '',
    customSizes: [] as (ClothingSize | ShoeSize)[]
  });

  const clothingCategories = [
    { value: 'camiseta', label: 'Camiseta' },
    { value: 'pantalon', label: 'Pantalón' },
    { value: 'vestido', label: 'Vestido' },
    { value: 'falda', label: 'Falda' },
    { value: 'camisa', label: 'Camisa' },
    { value: 'chaqueta', label: 'Chaqueta' },
    { value: 'zapatos', label: 'Zapatos' },
    { value: 'accesorios', label: 'Accesorios' }
  ];

  const [storagePath, setStoragePath] = useState('');

  const handleImageUpload = (file: File, url: string, thumbnailUrl?: string, storagePath?: string) => {
    setOriginalImageUrl(url);
    setUploadedImage(url);
    setProcessedImageUrl(null);
    setStoragePath(storagePath || '');
    console.log('Imagen subida a Storage:', file.name, 'URL:', url);
  };

  const handleCategoryChange = (category: ClothingCategory) => {
    const defaultSizes = getAvailableSizesForCategory(category) as (ClothingSize | ShoeSize)[];
    setFormData(prev => ({
      ...prev,
      category,
      customSizes: defaultSizes
    }));
  };

  const toggleSize = (size: ClothingSize | ShoeSize) => {
    setFormData(prev => ({
      ...prev,
      customSizes: prev.customSizes.includes(size)
        ? prev.customSizes.filter(s => s !== size)
        : [...prev.customSizes, size]
    }));
  };

  const handleProcessImage = async () => {
    if (!originalImageUrl) {
      alert('Por favor sube una imagen primero');
      return;
    }

    setIsProcessing(true);
    try {
      // Llamar a la API para procesar la imagen con IA
      const response = await fetch('/api/process-garment-image', {
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
      if (data.garmentData) {
        setFormData(prev => ({
          ...prev,
          name: data.garmentData.name || prev.name,
          description: data.garmentData.description || prev.description,
          category: (data.garmentData.category as ClothingCategory) || prev.category,
          color: data.garmentData.color || prev.color,
          customSizes: data.garmentData.availableSizes || prev.customSizes
        }));

        // Si la categoría cambió, actualizar tallas disponibles
        if (data.garmentData.category && data.garmentData.category !== formData.category) {
          const defaultSizes = getAvailableSizesForCategory(data.garmentData.category as ClothingCategory);
          setFormData(prev => ({
            ...prev,
            category: data.garmentData.category as ClothingCategory,
            customSizes: defaultSizes.length > 0 ? defaultSizes as (ClothingSize | ShoeSize)[] : prev.customSizes
          }));
        }
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

    if (!formData.name || !formData.category) {
      alert('Por favor completa al menos el nombre y la categoría');
      return;
    }

    if (formData.customSizes.length === 0) {
      alert('Por favor selecciona al menos una talla disponible');
      return;
    }

    setIsUploading(true);
    try {
      const newGarment = await SupabaseStorageAdapter.addGarment({
        name: formData.name,
        description: formData.description || 'Prenda procesada con IA',
        category: formData.category,
        color: formData.color || 'No especificado',
        availableSizes: formData.customSizes,
        imageUrl: uploadedImage, // URL de la imagen procesada
        storagePath: storagePath // Ruta para eliminación
      });

      onGarmentUploaded?.(newGarment);
      
      // Limpiar formulario
      setFormData({
        name: '',
        description: '',
        category: '' as ClothingCategory | '',
        color: '',
        customSizes: []
      });
      setUploadedImage(null);
      setOriginalImageUrl(null);
      setProcessedImageUrl(null);
      setAnnotations('');

      alert('¡Prenda subida exitosamente!');
      onClose?.();
    } catch (error) {
      console.error('Error uploading garment:', error);
      alert('Error al subir la prenda. Intenta de nuevo.');
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

  // Obtener tallas disponibles para la categoría seleccionada
  const getAvailableSizesForSelection = () => {
    if (!formData.category) return [];
    return getAvailableSizesForCategory(formData.category as ClothingCategory) as (ClothingSize | ShoeSize)[];
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="h-5 w-5" />
          Subir Prenda Personalizada
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 md:space-y-6">
        {/* Carga de imagen */}
        <div>
          <label className="text-sm font-medium mb-2 block">
            Imagen de la prenda (foto o archivo) *
          </label>
          <FileUpload
            onFileUpload={handleImageUpload}
            currentImage={processedImageUrl || originalImageUrl || undefined}
            onRemove={handleRemoveImage}
            maxSizeMB={10}
            disabled={isUploading || isProcessing}
            folder="garments"
          />
          
          {/* Campo de anotaciones */}
          {originalImageUrl && (
            <div className="mt-4">
              <label className="text-sm font-medium mb-2 block">
                Anotaciones (opcional)
              </label>
              <Textarea
                placeholder="Ej: Solo considera el polo azul, Solo considera el pantalón, Ignora el resto de la ropa..."
                value={annotations}
                onChange={(e) => setAnnotations(e.target.value)}
                rows={2}
                disabled={isProcessing || isUploading}
                className="text-sm"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Indica qué prenda específica quieres procesar si hay múltiples prendas en la foto
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
                    <Upload className="mr-2 h-4 w-4" />
                    Procesar Imagen con IA
                  </>
                )}
              </Button>
              
              {processedImageUrl && (
                <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-sm text-green-700">
                    ✓ Imagen procesada exitosamente. La IA ha generado automáticamente los datos de la prenda.
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
              Nombre de la prenda *
            </label>
            <Input
              placeholder="Ej: Camiseta blanca básica"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              disabled={isUploading}
            />
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">
              Color *
            </label>
            <Input
              placeholder="Ej: Blanco, Negro, Azul marino"
              value={formData.color}
              onChange={(e) => setFormData(prev => ({ ...prev, color: e.target.value }))}
              disabled={isUploading}
            />
          </div>
        </div>

        {/* Categoría */}
        <div>
          <label className="text-sm font-medium mb-2 block">
            Categoría *
          </label>
          <Select 
            value={formData.category} 
            onValueChange={handleCategoryChange}
            disabled={isUploading}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecciona una categoría" />
            </SelectTrigger>
            <SelectContent>
              {clothingCategories.map(cat => (
                <SelectItem key={cat.value} value={cat.value}>
                  {cat.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Descripción */}
        <div>
          <label className="text-sm font-medium mb-2 block">
            Descripción *
          </label>
          <Textarea
            placeholder="Describe la prenda: material, estilo, ocasión de uso, etc."
            value={formData.description}
            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            rows={3}
            disabled={isUploading}
          />
        </div>

        {/* Tallas disponibles */}
        {formData.category && (
          <div>
            <label className="text-sm font-medium mb-2 block">
              Tallas disponibles *
            </label>
            <p className="text-xs text-muted-foreground mb-3">
              Selecciona las tallas que están disponibles para esta prenda
            </p>
            <div className="flex flex-wrap gap-2">
              {getAvailableSizesForSelection().map(size => (
                <Badge
                  key={size}
                  variant={formData.customSizes.includes(size) ? "default" : "outline"}
                  className={`cursor-pointer transition-colors ${
                    formData.customSizes.includes(size) 
                      ? "bg-blue-500 hover:bg-blue-600" 
                      : "hover:bg-gray-100"
                  } ${isUploading ? "opacity-50 cursor-not-allowed" : ""}`}
                  onClick={() => !isUploading && toggleSize(size)}
                >
                  {size}
                </Badge>
              ))}
            </div>
            {formData.customSizes.length > 0 && (
              <p className="text-xs text-muted-foreground mt-2">
                Tallas seleccionadas: {formData.customSizes.join(', ')}
              </p>
            )}
          </div>
        )}

        {/* Botones de acción */}
        <div className="flex flex-col sm:flex-row gap-2 pt-4">
          <Button 
            onClick={handleUpload} 
            disabled={isUploading || isProcessing || !uploadedImage || !formData.name || !formData.category}
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
                Guardar Prenda
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
