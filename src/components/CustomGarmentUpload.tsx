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
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
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

  const handleImageUpload = (file: File, url: string, thumbnailUrl?: string, storagePath?: string) => {
    setUploadedImage(url);
    setStoragePath(storagePath || '');
    console.log('Imagen subida a Storage:', file.name, 'URL:', url);
  };
  
  const [storagePath, setStoragePath] = useState('');

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

  const handleUpload = async () => {
    if (!formData.name || !formData.description || !formData.category || !uploadedImage) {
      alert('Por favor completa todos los campos requeridos y sube una imagen');
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
        description: formData.description,
        category: formData.category,
        color: formData.color,
        availableSizes: formData.customSizes,
        imageUrl: uploadedImage, // URL de Supabase Storage
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

      alert('¡Prenda subida exitosamente!');
      onClose?.();
    } catch (error) {
      console.error('Error subiendo prenda:', error);
      alert('Error al subir la prenda. Inténtalo de nuevo.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveImage = () => {
    setUploadedImage(null);
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
      <CardContent className="space-y-6">
        {/* Carga de imagen */}
        <div>
          <label className="text-sm font-medium mb-2 block">
            Imagen de la prenda *
          </label>
          <FileUpload
            onFileUpload={handleImageUpload}
            currentImage={uploadedImage || undefined}
            onRemove={handleRemoveImage}
            maxSizeMB={10}
            disabled={isUploading}
            folder="garments"
          />
        </div>

        {/* Información básica */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium mb-2 block">
              Nombre de la prenda *
            </label>
            <Input
              placeholder="Ej: Camiseta básica blanca"
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
        <div className="flex gap-2 pt-4">
          <Button 
            onClick={handleUpload} 
            disabled={isUploading || !uploadedImage || !formData.name || !formData.category}
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
                Subir Prenda
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
