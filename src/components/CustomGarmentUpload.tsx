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
    { value: 'camiseta', label: 'T-shirt' },
    { value: 'pantalon', label: 'Pants' },
    { value: 'vestido', label: 'Dress' },
    { value: 'falda', label: 'Skirt' },
    { value: 'camisa', label: 'Shirt' },
    { value: 'chaqueta', label: 'Jacket' },
    { value: 'zapatos', label: 'Shoes' },
    { value: 'accesorios', label: 'Accessories' }
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
      alert('Please complete all required fields and upload an image');
      return;
    }

    if (formData.customSizes.length === 0) {
      alert('Please select at least one available size');
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

      alert('Garment uploaded successfully!');
      onClose?.();
    } catch (error) {
      console.error('Error uploading garment:', error);
      alert('Error uploading the garment. Try again.');
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
          Upload Custom Garment
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Carga de imagen */}
        <div>
          <label className="text-sm font-medium mb-2 block">
            Garment image *
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
              Garment name *
            </label>
            <Input
              placeholder="Ex: Basic white t-shirt"
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
              placeholder="Ex: White, Black, Navy blue"
              value={formData.color}
              onChange={(e) => setFormData(prev => ({ ...prev, color: e.target.value }))}
              disabled={isUploading}
            />
          </div>
        </div>

        {/* Categoría */}
        <div>
          <label className="text-sm font-medium mb-2 block">
            Category *
          </label>
          <Select 
            value={formData.category} 
            onValueChange={handleCategoryChange}
            disabled={isUploading}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select a category" />
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
            Description *
          </label>
          <Textarea
            placeholder="Describe the garment: material, style, occasion of use, etc."
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
              Available sizes *
            </label>
            <p className="text-xs text-muted-foreground mb-3">
              Select the sizes that are available for this garment
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
                Selected sizes: {formData.customSizes.join(', ')}
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
                Uploading...
              </>
            ) : (
              <>
                <Plus className="mr-2 h-4 w-4" />
                Upload Garment
              </>
            )}
          </Button>
          
          {onClose && (
            <Button 
              variant="outline" 
              onClick={onClose}
              disabled={isUploading}
            >
              Cancel
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
