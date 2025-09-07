'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Loader2, Palette, Wand2, X } from 'lucide-react';
import { generateStyledImage } from '@/lib/gemini';
import { LocalStorage } from '@/lib/storage';
import { Garment, Model, StyledLook } from '@/types';

export default function FashionStylist() {
  const [selectedModel, setSelectedModel] = useState<Model | null>(null);
  const [selectedGarments, setSelectedGarments] = useState<Garment[]>([]);
  const [lookName, setLookName] = useState('');
  const [lookDescription, setLookDescription] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedLooks, setGeneratedLooks] = useState<StyledLook[]>([]);

  const [models, setModels] = useState<Model[]>([]);
  const [garments, setGarments] = useState<Garment[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    setModels(LocalStorage.getModels());
    setGarments(LocalStorage.getGarments());
    setGeneratedLooks(LocalStorage.getStyledLooks());
  };

  const handleModelSelect = (model: Model) => {
    setSelectedModel(model);
  };

  const handleGarmentSelect = (garment: Garment) => {
    if (!selectedGarments.find(g => g.id === garment.id)) {
      setSelectedGarments(prev => [...prev, garment]);
    }
  };

  const removeGarment = (garmentId: string) => {
    setSelectedGarments(prev => prev.filter(g => g.id !== garmentId));
  };

  const generateLook = async () => {
    if (!selectedModel || selectedGarments.length === 0) {
      alert('Por favor selecciona un modelo y al menos una prenda');
      return;
    }

    if (!lookName) {
      alert('Por favor ingresa un nombre para el look');
      return;
    }

    setIsGenerating(true);
    try {
      // Preparar datos estructurados para styling inteligente
      const stylingData = {
        modelUrl: selectedModel.imageUrl,
        garments: selectedGarments.map(garment => ({
          imageUrl: garment.imageUrl,
          category: garment.category,
          name: garment.name,
          color: garment.color
        })),
        lookName: lookName,
        lookDescription: lookDescription
      };

      console.log('🎨 Iniciando styling inteligente:', stylingData);
      
      // Usar el nuevo sistema de combinación inteligente de imágenes
      const imageUrl = await generateStyledImage(stylingData);

      const newLook = LocalStorage.addStyledLook({
        name: lookName,
        modelId: selectedModel.id,
        garmentIds: selectedGarments.map(g => g.id),
        imageUrl,
        description: lookDescription || `Look creado con ${selectedGarments.length} prendas`
      });

      setGeneratedLooks(prev => [newLook, ...prev]);
      
      // Limpiar formulario
      setLookName('');
      setLookDescription('');
      setSelectedGarments([]);
      setSelectedModel(null);

      alert('¡Look generado exitosamente!');
    } catch (error) {
      console.error('Error:', error);
      if (error instanceof Error && error.message.includes('API key')) {
        alert('Error: API key no configurada. Ve a la sección "Acerca" para ver las instrucciones de configuración.');
      } else {
        alert('Look generado correctamente con placeholder. Configura la API key para usar generación real.');
      }
    } finally {
      setIsGenerating(false);
    }
  };

  const deleteLook = (id: string) => {
    if (confirm('¿Estás seguro de que quieres eliminar este look?')) {
      LocalStorage.deleteStyledLook(id);
      setGeneratedLooks(prev => prev.filter(l => l.id !== id));
    }
  };

  return (
    <div className="space-y-6">
      {/* Generador de Looks */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="h-5 w-5" />
            Estilista de Moda IA
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Selección de Modelo */}
          <div>
            <h3 className="font-semibold mb-3">1. Selecciona un Modelo</h3>
            {selectedModel ? (
              <Card className="border-green-200 bg-green-50">
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    <img
                      src={selectedModel.imageUrl}
                      alt={selectedModel.name}
                      className="w-16 h-16 object-cover rounded-lg"
                    />
                    <div className="flex-1">
                      <h4 className="font-semibold">{selectedModel.name}</h4>
                      <p className="text-sm text-muted-foreground">
                        {selectedModel.gender} • {selectedModel.age} • {selectedModel.bodyType}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedModel(null)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div>
                <p className="text-sm text-muted-foreground mb-3">
                  {models.length === 0 
                    ? "No hay modelos disponibles. Genera algunos primero."
                    : "Haz clic en un modelo para seleccionarlo:"
                  }
                </p>
                <ScrollArea className="h-32">
                  <div className="flex gap-2">
                    {models.map(model => (
                      <Card
                        key={model.id}
                        className="cursor-pointer hover:shadow-md transition-all min-w-24"
                        onClick={() => handleModelSelect(model)}
                      >
                        <CardContent className="p-2">
                          <img
                            src={model.imageUrl}
                            alt={model.name}
                            className="w-16 h-16 object-cover rounded mb-1"
                          />
                          <p className="text-xs font-medium text-center line-clamp-1">
                            {model.name}
                          </p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </ScrollArea>
              </div>
            )}
          </div>

          {/* Selección de Prendas */}
          <div>
            <h3 className="font-semibold mb-3">2. Selecciona Prendas</h3>
            {selectedGarments.length > 0 && (
              <div className="mb-4">
                <p className="text-sm text-muted-foreground mb-2">Prendas seleccionadas:</p>
                <div className="flex flex-wrap gap-2">
                  {selectedGarments.map(garment => (
                    <Badge
                      key={garment.id}
                      variant="secondary"
                      className="cursor-pointer hover:bg-red-100"
                      onClick={() => removeGarment(garment.id)}
                    >
                      {garment.name} <X className="ml-1 h-3 w-3" />
                    </Badge>
                  ))}
                </div>
              </div>
            )}
            
            <div>
              <p className="text-sm text-muted-foreground mb-3">
                {garments.length === 0 
                  ? "No hay prendas disponibles. Genera algunas primero."
                  : "Haz clic en las prendas para agregarlas al look:"
                }
              </p>
              <ScrollArea className="h-32">
                <div className="flex gap-2">
                  {garments.map(garment => (
                    <Card
                      key={garment.id}
                      className={`cursor-pointer hover:shadow-md transition-all min-w-24 ${
                        selectedGarments.find(g => g.id === garment.id) 
                          ? 'ring-2 ring-blue-500' 
                          : ''
                      }`}
                      onClick={() => handleGarmentSelect(garment)}
                    >
                      <CardContent className="p-2">
                        <img
                          src={garment.imageUrl}
                          alt={garment.name}
                          className="w-16 h-16 object-cover rounded mb-1"
                        />
                        <p className="text-xs font-medium text-center line-clamp-1">
                          {garment.name}
                        </p>
                        <Badge variant="outline" className="text-xs mt-1 w-full text-center">
                          {garment.category}
                        </Badge>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </ScrollArea>
            </div>
          </div>

          {/* Configuración del Look */}
          <div className="space-y-4">
            <h3 className="font-semibold">3. Configura el Look</h3>
            
            <div>
              <label className="text-sm font-medium mb-2 block">
                Nombre del look *
              </label>
              <Input
                placeholder="Ej: Look casual de verano"
                value={lookName}
                onChange={(e) => setLookName(e.target.value)}
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">
                Descripción (opcional)
              </label>
              <Textarea
                placeholder="Describe el estilo, ocasión o características especiales del look..."
                value={lookDescription}
                onChange={(e) => setLookDescription(e.target.value)}
                rows={3}
              />
            </div>

            <Button 
              onClick={generateLook} 
              disabled={isGenerating || !selectedModel || selectedGarments.length === 0}
              className="w-full"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generando look...
                </>
              ) : (
                <>
                  <Wand2 className="mr-2 h-4 w-4" />
                  Generar Look con IA
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Galería de Looks Generados */}
      <Card>
        <CardHeader>
          <CardTitle>Looks Generados ({generatedLooks.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {generatedLooks.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No hay looks generados aún. ¡Crea tu primer look!
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {generatedLooks.map(look => {
                const model = models.find(m => m.id === look.modelId);
                const usedGarments = garments.filter(g => look.garmentIds.includes(g.id));
                
                return (
                  <Card key={look.id}>
                    <CardContent className="p-4">
                      <div className="aspect-square bg-gray-100 rounded-lg mb-3 overflow-hidden">
                        <img
                          src={look.imageUrl}
                          alt={look.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      
                      <h4 className="font-semibold mb-2">{look.name}</h4>
                      
                      {model && (
                        <p className="text-sm text-muted-foreground mb-2">
                          Modelo: {model.name}
                        </p>
                      )}
                      
                      <div className="space-y-2">
                        <p className="text-xs font-medium">Prendas usadas:</p>
                        <div className="flex flex-wrap gap-1">
                          {usedGarments.map(garment => (
                            <Badge key={garment.id} variant="outline" className="text-xs">
                              {garment.name}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      
                      {look.description && (
                        <p className="text-xs text-muted-foreground mt-2 line-clamp-2">
                          {look.description}
                        </p>
                      )}
                      
                      <div className="flex justify-between items-center mt-4">
                        <span className="text-xs text-muted-foreground">
                          {new Date(look.createdAt).toLocaleDateString()}
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteLook(look.id)}
                          className="h-6 w-6 p-0 hover:bg-red-100 hover:text-red-600"
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
