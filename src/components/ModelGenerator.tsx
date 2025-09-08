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
    { value: 'masculino', label: 'Male' },
    { value: 'femenino', label: 'Female' },
    { value: 'unisex', label: 'Unisex' }
  ];

  const bodyTypeOptions = [
    'Athletic', 'Slim', 'Average', 'Curvy', 'Robust'
  ];

  const hairColorOptions = [
    'Black', 'Brown', 'Blonde', 'Red', 'Gray', 'White'
  ];

  const eyeColorOptions = [
    'Brown', 'Blue', 'Green', 'Hazel', 'Gray', 'Black'
  ];

  const skinToneOptions = [
    'Very light', 'Light', 'Medium', 'Tanned', 'Dark', 'Very dark'
  ];

  const clothingSizes: ClothingSize[] = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
  const shoeSizes: ShoeSize[] = ['35', '36', '37', '38', '39', '40', '41', '42', '43', '44', '45', '46'];

  const handleGenerate = async () => {
    if (!formData.name || !formData.characteristics || !formData.gender || 
        !formData.upperBodySize || !formData.lowerBodySize || !formData.shoeSize) {
      alert('Please complete all required fields including sizes');
      return;
    }

    setIsGenerating(true);
    try {
      // Pasar todos los datos del formulario para una generación más precisa
      const modelData = {
        name: formData.name,
        characteristics: formData.characteristics,
        gender: formData.gender,
        age: formData.age || 'Young adult',
        height: formData.height || 'Average',
        bodyType: formData.bodyType || 'Athletic',
        hairColor: formData.hairColor || 'Brown',
        eyeColor: formData.eyeColor || 'Brown',
        skinTone: formData.skinTone || 'Medium'
      };

      console.log('🎨 Generating model image with AI and uploading to Supabase Storage...');
      const imageResult = await generateAndUploadModelImage(modelData);
      
      const newModel = await SupabaseStorageAdapter.addModel({
        name: formData.name,
        characteristics: formData.characteristics,
        gender: formData.gender as any,
        age: formData.age || 'Young adult',
        height: formData.height || 'Average',
        bodyType: formData.bodyType || 'Athletic',
        hairColor: formData.hairColor || 'Brown',
        eyeColor: formData.eyeColor || 'Brown',
        skinTone: formData.skinTone || 'Medium',
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

      alert('Model generated successfully!');
    } catch (error) {
      console.error('Error:', error);
      if (error instanceof Error && error.message.includes('API key')) {
        alert('Error: API key not configured. Go to the "About" section to see configuration instructions.');
      } else {
        alert('Model generated correctly with placeholder. Configure the API key to use real generation.');
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
          AI Model Generator
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label className="text-sm font-medium mb-2 block">
            Model name *
          </label>
          <Input
            placeholder="Ex: Alex Professional Model"
            value={formData.name}
            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
          />
        </div>

        <div>
          <label className="text-sm font-medium mb-2 block">
            Gender *
          </label>
          <Select 
            value={formData.gender} 
            onValueChange={(value) => setFormData(prev => ({ ...prev, gender: value }))}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select gender" />
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
              Age
            </label>
            <Input
              placeholder="Ex: 25 years, Young adult"
              value={formData.age}
              onChange={(e) => setFormData(prev => ({ ...prev, age: e.target.value }))}
            />
          </div>
          <div>
            <label className="text-sm font-medium mb-2 block">
              Height
            </label>
            <Input
              placeholder="Ex: 1.75m, Tall"
              value={formData.height}
              onChange={(e) => setFormData(prev => ({ ...prev, height: e.target.value }))}
            />
          </div>
        </div>

        <div>
          <label className="text-sm font-medium mb-2 block">
            Body type
          </label>
          <Select 
            value={formData.bodyType} 
            onValueChange={(value) => setFormData(prev => ({ ...prev, bodyType: value }))}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select body type" />
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
              Hair color
            </label>
            <Select 
              value={formData.hairColor} 
              onValueChange={(value) => setFormData(prev => ({ ...prev, hairColor: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Hair color" />
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
              Eye color
            </label>
            <Select 
              value={formData.eyeColor} 
              onValueChange={(value) => setFormData(prev => ({ ...prev, eyeColor: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Eye color" />
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
            Skin tone
          </label>
          <Select 
            value={formData.skinTone} 
            onValueChange={(value) => setFormData(prev => ({ ...prev, skinTone: value }))}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select skin tone" />
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
          <h3 className="font-semibold text-lg">Model Sizes *</h3>
          <p className="text-sm text-muted-foreground">
            Specify the model's sizes for precise garment fitting.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">
                Upper Size *
              </label>
              <Select 
                value={formData.upperBodySize} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, upperBodySize: value as ClothingSize }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Size for shirts, t-shirts..." />
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
                Lower Size *
              </label>
              <Select 
                value={formData.lowerBodySize} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, lowerBodySize: value as ClothingSize }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Size for pants, skirts..." />
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
                Shoe Size *
              </label>
              <Select 
                value={formData.shoeSize} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, shoeSize: value as ShoeSize }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Shoe number" />
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
            Additional characteristics *
          </label>
          <Textarea
            placeholder="Describe specific model characteristics: expression, posture, style, etc."
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
              Generating model...
            </>
          ) : (
            <>
              <Plus className="mr-2 h-4 w-4" />
              Generate Model with AI
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
