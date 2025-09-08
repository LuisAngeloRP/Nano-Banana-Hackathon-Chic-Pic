'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Trash2, User, Search, Edit3, Upload, Plus } from 'lucide-react';
import { SupabaseStorageAdapter } from '@/lib/storage.supabase';
import { Model, Garment, StyledLook } from '@/types';
import DetailEditor from './DetailEditor';
import CustomModelUpload from './CustomModelUpload';
// import OptimizedImage from './OptimizedImage'; // Removido para cargar imágenes directamente

interface ModelCatalogProps {
  onModelSelect?: (model: Model) => void;
  selectedModelId?: string;
}

export default function ModelCatalog({ onModelSelect, selectedModelId }: ModelCatalogProps) {
  const [models, setModels] = useState<Model[]>([]);
  const [filteredModels, setFilteredModels] = useState<Model[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [genderFilter, setGenderFilter] = useState('all');
  const [selectedModelForEdit, setSelectedModelForEdit] = useState<Model | null>(null);
  const [isDetailEditorOpen, setIsDetailEditorOpen] = useState(false);
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);

  useEffect(() => {
    loadModels();
  }, []);

  useEffect(() => {
    filterModels();
  }, [models, searchTerm, genderFilter]);

  const loadModels = async () => {
    try {
      const stored = await SupabaseStorageAdapter.getModels();
      setModels(stored);
    } catch (error) {
      console.error('Error loading models:', error);
    }
  };

  const filterModels = () => {
    let filtered = models;

    if (searchTerm) {
      filtered = filtered.filter(model =>
        model.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        model.characteristics.toLowerCase().includes(searchTerm.toLowerCase()) ||
        model.age.toLowerCase().includes(searchTerm.toLowerCase()) ||
        model.bodyType.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (genderFilter !== 'all') {
      filtered = filtered.filter(model => model.gender === genderFilter);
    }

    setFilteredModels(filtered);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this model?')) {
      try {
        await SupabaseStorageAdapter.deleteModel(id);
        loadModels();
      } catch (error) {
        console.error('Error deleting model:', error);
        alert('Error deleting the model');
      }
    }
  };

  const handleSelect = (model: Model) => {
    onModelSelect?.(model);
  };

  const isSelected = (modelId: string) => {
    return selectedModelId === modelId;
  };

  const handleEditModel = (model: Model) => {
    setSelectedModelForEdit(model);
    setIsDetailEditorOpen(true);
  };

  const handleModelUpdated = (updatedItem: Garment | Model | StyledLook) => {
    loadModels(); // Recargar la lista
  };

  const handleCloseDetailEditor = () => {
    setIsDetailEditorOpen(false);
    setSelectedModelForEdit(null);
  };

  const handleModelUploaded = (newModel: Model) => {
    setModels(prev => [newModel, ...prev]);
    setIsUploadDialogOpen(false);
  };

  const handleCloseUploadDialog = () => {
    setIsUploadDialogOpen(false);
  };

  const genderOptions = [
    { value: 'all', label: 'All genders' },
    { value: 'masculino', label: 'Male' },
    { value: 'femenino', label: 'Female' },
    { value: 'unisex', label: 'Unisex' }
  ];

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Model Catalog ({filteredModels.length})
          </CardTitle>
          
          <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <Upload className="h-4 w-4 mr-2" />
                Upload Model
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Upload New Model</DialogTitle>
              </DialogHeader>
              <CustomModelUpload 
                onModelUploaded={handleModelUploaded}
                onClose={handleCloseUploadDialog}
              />
            </DialogContent>
          </Dialog>
        </div>
        
        <div className="flex gap-2 mt-4">
          <div className="flex-1">
            <Input
              placeholder="Search models..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full"
            />
          </div>
          <Select value={genderFilter} onValueChange={setGenderFilter}>
            <SelectTrigger className="w-48">
              <SelectValue />
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
      </CardHeader>
      
      <CardContent>
        <ScrollArea className="h-96">
          {filteredModels.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {models.length === 0 
                ? "No models in the catalog. Generate your first model!"
                : "No models found with the applied filters."
              }
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredModels.map((model) => (
                <Card 
                  key={model.id} 
                  className={`cursor-pointer transition-all hover:shadow-md ${
                    isSelected(model.id) ? 'ring-2 ring-blue-500' : ''
                  }`}
                  onClick={() => handleSelect(model)}
                >
                  <CardContent className="p-4">
                    <div className="aspect-square bg-gray-100 rounded-lg mb-3 overflow-hidden">
                      <img
                        src={model.imageUrl}
                        alt={model.name}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    </div>
                    
                    <h3 className="font-semibold text-sm mb-2 line-clamp-2">
                      {model.name}
                    </h3>
                    
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="text-xs">
                          {model.gender}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {model.age}
                        </Badge>
                      </div>
                      
                      <div className="text-xs text-muted-foreground space-y-1">
                        <p><span className="font-medium">Height:</span> {model.height}</p>
                        <p><span className="font-medium">Type:</span> {model.bodyType}</p>
                        <p><span className="font-medium">Hair:</span> {model.hairColor}</p>
                        <p><span className="font-medium">Eyes:</span> {model.eyeColor}</p>
                        <p><span className="font-medium">Skin:</span> {model.skinTone}</p>
                      </div>
                      
                      {/* Información de Tallas */}
                      <div className="border-t pt-2 mt-2">
                        <p className="text-xs font-medium text-muted-foreground mb-1">Sizes:</p>
                        <div className="flex flex-wrap gap-1">
                          <Badge variant="outline" className="text-xs">
                            Upper: {model.upperBodySize || 'Not specified'}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            Lower: {model.lowerBodySize || 'Not specified'}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            Shoes: {model.shoeSize || 'Not specified'}
                          </Badge>
                        </div>
                      </div>
                      
                      <p className="text-xs text-muted-foreground line-clamp-2 mt-2">
                        {model.characteristics}
                      </p>
                    </div>
                    
                    <div className="flex justify-between items-center mt-3">
                      <span className="text-xs text-muted-foreground">
                        {new Date(model.createdAt).toLocaleDateString()}
                      </span>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEditModel(model);
                          }}
                          className="h-6 w-6 p-0 hover:bg-blue-100 hover:text-blue-600"
                          title="Edit model"
                        >
                          <Edit3 className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(model.id);
                          }}
                          className="h-6 w-6 p-0 hover:bg-red-100 hover:text-red-600"
                          title="Delete model"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </ScrollArea>
      </CardContent>
      
      {/* Modal de edición detallada */}
      <DetailEditor
        isOpen={isDetailEditorOpen}
        onClose={handleCloseDetailEditor}
        item={selectedModelForEdit}
        type="model"
        onItemUpdated={handleModelUpdated}
      />
    </Card>
  );
}
