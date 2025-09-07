'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Trash2, User, Search } from 'lucide-react';
import { LocalStorage } from '@/lib/storage';
import { Model } from '@/types';

interface ModelCatalogProps {
  onModelSelect?: (model: Model) => void;
  selectedModelId?: string;
}

export default function ModelCatalog({ onModelSelect, selectedModelId }: ModelCatalogProps) {
  const [models, setModels] = useState<Model[]>([]);
  const [filteredModels, setFilteredModels] = useState<Model[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [genderFilter, setGenderFilter] = useState('all');

  useEffect(() => {
    loadModels();
  }, []);

  useEffect(() => {
    filterModels();
  }, [models, searchTerm, genderFilter]);

  const loadModels = () => {
    const stored = LocalStorage.getModels();
    setModels(stored);
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

  const handleDelete = (id: string) => {
    if (confirm('¿Estás seguro de que quieres eliminar este modelo?')) {
      LocalStorage.deleteModel(id);
      loadModels();
    }
  };

  const handleSelect = (model: Model) => {
    onModelSelect?.(model);
  };

  const isSelected = (modelId: string) => {
    return selectedModelId === modelId;
  };

  const genderOptions = [
    { value: 'all', label: 'Todos los géneros' },
    { value: 'masculino', label: 'Masculino' },
    { value: 'femenino', label: 'Femenino' },
    { value: 'unisex', label: 'Unisex' }
  ];

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="h-5 w-5" />
          Catálogo de Modelos ({filteredModels.length})
        </CardTitle>
        
        <div className="flex gap-2 mt-4">
          <div className="flex-1">
            <Input
              placeholder="Buscar modelos..."
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
                ? "No hay modelos en el catálogo. ¡Genera tu primer modelo!"
                : "No se encontraron modelos con los filtros aplicados."
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
                        <p><span className="font-medium">Altura:</span> {model.height}</p>
                        <p><span className="font-medium">Tipo:</span> {model.bodyType}</p>
                        <p><span className="font-medium">Cabello:</span> {model.hairColor}</p>
                        <p><span className="font-medium">Ojos:</span> {model.eyeColor}</p>
                        <p><span className="font-medium">Piel:</span> {model.skinTone}</p>
                      </div>
                      
                      <p className="text-xs text-muted-foreground line-clamp-2 mt-2">
                        {model.characteristics}
                      </p>
                    </div>
                    
                    <div className="flex justify-between items-center mt-3">
                      <span className="text-xs text-muted-foreground">
                        {new Date(model.createdAt).toLocaleDateString()}
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(model.id);
                        }}
                        className="h-6 w-6 p-0 hover:bg-red-100 hover:text-red-600"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
