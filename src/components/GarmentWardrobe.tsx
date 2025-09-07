'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Trash2, Shirt, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { LocalStorage } from '@/lib/storage';
import { Garment } from '@/types';

interface GarmentWardrobeProps {
  onGarmentSelect?: (garment: Garment) => void;
  selectedGarments?: string[];
  multiSelect?: boolean;
}

export default function GarmentWardrobe({ 
  onGarmentSelect, 
  selectedGarments = [], 
  multiSelect = false 
}: GarmentWardrobeProps) {
  const [garments, setGarments] = useState<Garment[]>([]);
  const [filteredGarments, setFilteredGarments] = useState<Garment[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');

  useEffect(() => {
    loadGarments();
  }, []);

  useEffect(() => {
    filterGarments();
  }, [garments, searchTerm, categoryFilter]);

  const loadGarments = () => {
    const stored = LocalStorage.getGarments();
    setGarments(stored);
  };

  const filterGarments = () => {
    let filtered = garments;

    if (searchTerm) {
      filtered = filtered.filter(garment =>
        garment.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        garment.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        garment.color.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (categoryFilter !== 'all') {
      filtered = filtered.filter(garment => garment.category === categoryFilter);
    }

    setFilteredGarments(filtered);
  };

  const handleDelete = (id: string) => {
    if (confirm('¿Estás seguro de que quieres eliminar esta prenda?')) {
      LocalStorage.deleteGarment(id);
      loadGarments();
    }
  };

  const handleSelect = (garment: Garment) => {
    onGarmentSelect?.(garment);
  };

  const isSelected = (garmentId: string) => {
    return selectedGarments.includes(garmentId);
  };

  const categories = [
    { value: 'all', label: 'Todas las categorías' },
    { value: 'camiseta', label: 'Camisetas' },
    { value: 'pantalon', label: 'Pantalones' },
    { value: 'vestido', label: 'Vestidos' },
    { value: 'falda', label: 'Faldas' },
    { value: 'camisa', label: 'Camisas' },
    { value: 'chaqueta', label: 'Chaquetas' },
    { value: 'zapatos', label: 'Zapatos' },
    { value: 'accesorios', label: 'Accesorios' }
  ];

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shirt className="h-5 w-5" />
          Armario de Prendas ({filteredGarments.length})
        </CardTitle>
        
        <div className="flex gap-2 mt-4">
          <div className="flex-1">
            <Input
              placeholder="Buscar prendas..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full"
            />
          </div>
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {categories.map(cat => (
                <SelectItem key={cat.value} value={cat.value}>
                  {cat.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      
      <CardContent>
        <ScrollArea className="h-96">
          {filteredGarments.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {garments.length === 0 
                ? "No hay prendas en el armario. ¡Genera tu primera prenda!"
                : "No se encontraron prendas con los filtros aplicados."
              }
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredGarments.map((garment) => (
                <Card 
                  key={garment.id} 
                  className={`cursor-pointer transition-all hover:shadow-md ${
                    isSelected(garment.id) ? 'ring-2 ring-blue-500' : ''
                  }`}
                  onClick={() => handleSelect(garment)}
                >
                  <CardContent className="p-4">
                    <div className="aspect-square bg-gray-100 rounded-lg mb-3 overflow-hidden">
                      <img
                        src={garment.imageUrl}
                        alt={garment.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    
                    <h3 className="font-semibold text-sm mb-2 line-clamp-2">
                      {garment.name}
                    </h3>
                    
                    <div className="space-y-2">
                      <Badge variant="secondary" className="text-xs">
                        {garment.category}
                      </Badge>
                      
                      {garment.color && (
                        <p className="text-xs text-muted-foreground">
                          Color: {garment.color}
                        </p>
                      )}
                      
                      {garment.size.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {garment.size.map(size => (
                            <Badge key={size} variant="outline" className="text-xs">
                              {size}
                            </Badge>
                          ))}
                        </div>
                      )}
                      
                      <p className="text-xs text-muted-foreground line-clamp-2">
                        {garment.description}
                      </p>
                    </div>
                    
                    <div className="flex justify-between items-center mt-3">
                      <span className="text-xs text-muted-foreground">
                        {new Date(garment.createdAt).toLocaleDateString()}
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(garment.id);
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
