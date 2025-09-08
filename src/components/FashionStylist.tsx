'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, Palette, Wand2, X, Edit3 } from 'lucide-react';
import { generateAndUploadStyledImage } from '@/lib/gemini';
import { SupabaseStorageAdapter } from '@/lib/storage.supabase';
import { Garment, Model, StyledLook, GarmentFitInfo, SelectedGarmentWithSize, ClothingSize, ShoeSize } from '@/types';
// import OptimizedImage from './OptimizedImage'; // Removido para cargar imágenes directamente
import { 
  determineFitType, 
  generateFitDescription, 
  getModelSizeForCategory,
  getFitBadgeColor,
  getFitShortDescription 
} from '@/lib/sizeUtils';
import DetailEditor from './DetailEditor';

export default function FashionStylist() {
  const [selectedModel, setSelectedModel] = useState<Model | null>(null);
  const [selectedGarments, setSelectedGarments] = useState<SelectedGarmentWithSize[]>([]);
  const [lookName, setLookName] = useState('');
  const [lookDescription, setLookDescription] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  // Ya no necesitamos la función base64ToFile - se maneja internamente
  const [generatedLooks, setGeneratedLooks] = useState<StyledLook[]>([]);
  const [selectedLookForEdit, setSelectedLookForEdit] = useState<StyledLook | null>(null);
  const [isDetailEditorOpen, setIsDetailEditorOpen] = useState(false);

  const [models, setModels] = useState<Model[]>([]);
  const [garments, setGarments] = useState<Garment[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [modelsData, garmentsData, looksData] = await Promise.all([
        SupabaseStorageAdapter.getModels(),
        SupabaseStorageAdapter.getGarments(),
        SupabaseStorageAdapter.getStyledLooks()
      ]);
      setModels(modelsData);
      setGarments(garmentsData);
      setGeneratedLooks(looksData);
    } catch (error) {
      console.error('Error loading Supabase data:', error);
    }
  };

  const handleModelSelect = (model: Model) => {
    setSelectedModel(model);
  };

  const handleGarmentSelect = (garment: Garment) => {
    if (!selectedGarments.find(g => g.garment.id === garment.id)) {
      // Si la prenda solo tiene una talla disponible, seleccionarla automáticamente
      const defaultSize = garment.availableSizes && garment.availableSizes.length === 1 
        ? garment.availableSizes[0] 
        : (garment.availableSizes && garment.availableSizes.length > 0 ? garment.availableSizes[0] : 'M' as ClothingSize);
      
      setSelectedGarments(prev => [...prev, {
        garment,
        selectedSize: defaultSize
      }]);
    }
  };

  const removeGarment = (garmentId: string) => {
    setSelectedGarments(prev => prev.filter(g => g.garment.id !== garmentId));
  };

  const updateGarmentSize = (garmentId: string, newSize: ClothingSize | ShoeSize) => {
    setSelectedGarments(prev => 
      prev.map(g => 
        g.garment.id === garmentId 
          ? { ...g, selectedSize: newSize }
          : g
      )
    );
  };

  const generateLook = async () => {
    if (!selectedModel || selectedGarments.length === 0) {
      alert('Please select a model and at least one garment');
      return;
    }

    if (!lookName) {
      alert('Please enter a name for the look');
      return;
    }

    setIsGenerating(true);
    try {
      // Generar información de ajuste para cada prenda
      const garmentFits: GarmentFitInfo[] = selectedGarments.map(selectedGarment => {
        const { garment, selectedSize } = selectedGarment;
        const modelSize = getModelSizeForCategory(
          selectedModel.upperBodySize,
          selectedModel.lowerBodySize,
          selectedModel.shoeSize,
          garment.category
        );
        
        const fitType = determineFitType(selectedSize, modelSize, garment.category);
        const fitDescription = generateFitDescription(fitType, garment.name, garment.category);
        
        return {
          garmentId: garment.id,
          selectedSize: selectedSize,
          modelSize: modelSize,
          fitType: fitType,
          fitDescription: fitDescription
        };
      });

      // Preparar datos estructurados para styling inteligente con información de ajuste
      const stylingData = {
        modelUrl: selectedModel.imageUrl,
        garments: selectedGarments.map(selectedGarment => ({
          imageUrl: selectedGarment.garment.imageUrl,
          category: selectedGarment.garment.category,
          name: selectedGarment.garment.name,
          color: selectedGarment.garment.color,
          size: selectedGarment.selectedSize
        })),
        modelSizes: {
          upperBodySize: selectedModel.upperBodySize,
          lowerBodySize: selectedModel.lowerBodySize,
          shoeSize: selectedModel.shoeSize
        },
        garmentFits: garmentFits,
        lookName: lookName,
        lookDescription: lookDescription
      };

      console.log('🎨 Starting intelligent styling with size information:', stylingData);
      
      // Create intelligent look description with fit information
      const fitDescriptions = garmentFits.map(fit => 
        `${fit.fitDescription}`
      ).join(' ');
      
      const enhancedDescription = lookDescription 
        ? `${lookDescription}\n\nGarment fit: ${fitDescriptions}`
        : `Look created with ${selectedGarments.length} garments. ${fitDescriptions}`;
      
      // Generate AI image and upload directly to Supabase Storage
      console.log('🎨 Generating look image with AI and uploading to Supabase Storage...');
      const imageResult = await generateAndUploadStyledImage(stylingData);

      const newLook = await SupabaseStorageAdapter.addStyledLook({
        name: lookName,
        modelId: selectedModel.id,
        garmentIds: selectedGarments.map(g => g.garment.id),
        imageUrl: imageResult.url, // URL de Supabase Storage
        thumbnailUrl: imageResult.thumbnailUrl,
        storagePath: imageResult.storagePath,
        description: enhancedDescription,
        garmentFits: garmentFits
      });

      setGeneratedLooks(prev => [newLook, ...prev]);
      
      // Limpiar formulario
      setLookName('');
      setLookDescription('');
      setSelectedGarments([]);
      setSelectedModel(null);

      alert('Look generated successfully with fit analysis!');
    } catch (error) {
      console.error('Error:', error);
      if (error instanceof Error && error.message.includes('API key')) {
        alert('Error: API key not configured. Go to the "About" section to see configuration instructions.');
      } else {
        alert('Look generated correctly with placeholder. Configure the API key to use real generation.');
      }
    } finally {
      setIsGenerating(false);
    }
  };

  const deleteLook = async (id: string) => {
    if (confirm('Are you sure you want to delete this look?')) {
      try {
        await SupabaseStorageAdapter.deleteStyledLook(id);
        setGeneratedLooks(prev => prev.filter(l => l.id !== id));
      } catch (error) {
        console.error('Error deleting look:', error);
        alert('Error deleting the look');
      }
    }
  };

  const handleEditLook = (look: StyledLook) => {
    setSelectedLookForEdit(look);
    setIsDetailEditorOpen(true);
  };

  const handleLookUpdated = (updatedItem: Garment | Model | StyledLook) => {
    const updatedLook = updatedItem as StyledLook;
    setGeneratedLooks(prev => prev.map(l => l.id === updatedLook.id ? updatedLook : l));
  };

  const handleCloseDetailEditor = () => {
    setIsDetailEditorOpen(false);
    setSelectedLookForEdit(null);
  };

  return (
    <div className="space-y-6">
      {/* Generador de Looks */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="h-5 w-5" />
            AI Fashion Stylist
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Selección de Modelo */}
          <div>
            <h3 className="font-semibold mb-3">1. Select a Model</h3>
            {selectedModel ? (
              <Card className="border-green-200 bg-green-50">
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    <img
                      src={selectedModel.imageUrl}
                      alt={selectedModel.name}
                      className="w-16 h-16 object-cover rounded-lg"
                      loading="eager"
                    />
                    <div className="flex-1">
                      <h4 className="font-semibold">{selectedModel.name}</h4>
                      <p className="text-sm text-muted-foreground">
                        {selectedModel.gender} • {selectedModel.age} • {selectedModel.bodyType}
                      </p>
                      <div className="flex flex-wrap gap-1 mt-1">
                        <Badge variant="outline" className="text-xs">
                          Upper: {selectedModel.upperBodySize || 'Not specified'}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          Lower: {selectedModel.lowerBodySize || 'Not specified'}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          Shoes: {selectedModel.shoeSize || 'Not specified'}
                        </Badge>
                      </div>
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
                    ? "No models available. Generate some first."
                    : "Click on a model to select it:"
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
                            loading="lazy"
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
            <h3 className="font-semibold mb-3">2. Select Garments</h3>
            {selectedGarments.length > 0 && (
              <div className="mb-4">
                <p className="text-sm text-muted-foreground mb-2">Selected garments:</p>
                <div className="space-y-3">
                  {selectedGarments.map(selectedGarment => (
                    <div key={selectedGarment.garment.id} className="flex items-center gap-2 p-3 border rounded-lg">
                      <img
                        src={selectedGarment.garment.imageUrl}
                        alt={selectedGarment.garment.name}
                        className="w-12 h-12 object-cover rounded"
                        loading="eager"
                      />
                      <div className="flex-1">
                        <p className="font-medium text-sm">{selectedGarment.garment.name}</p>
                        <p className="text-xs text-muted-foreground">{selectedGarment.garment.category}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Select 
                          value={selectedGarment.selectedSize} 
                          onValueChange={(newSize) => updateGarmentSize(selectedGarment.garment.id, newSize as ClothingSize | ShoeSize)}
                        >
                          <SelectTrigger className="w-20">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {selectedGarment.garment.availableSizes?.map(size => (
                              <SelectItem key={size} value={size}>
                                {size}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeGarment(selectedGarment.garment.id)}
                          className="h-8 w-8 p-0 hover:bg-red-100 hover:text-red-600"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            <div>
              <p className="text-sm text-muted-foreground mb-3">
                {garments.length === 0 
                    ? "No garments available. Generate some first."
                    : "Click on garments to add them to the look:"
                }
              </p>
              <ScrollArea className="h-32">
                <div className="flex gap-2">
                  {garments.map(garment => (
                    <Card
                      key={garment.id}
                      className={`cursor-pointer hover:shadow-md transition-all min-w-24 ${
                        selectedGarments.find(g => g.garment.id === garment.id) 
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
                          loading="lazy"
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
            <h3 className="font-semibold">3. Configure the Look</h3>
            
            <div>
              <label className="text-sm font-medium mb-2 block">
                Look name *
              </label>
              <Input
                placeholder="Ex: Summer casual look"
                value={lookName}
                onChange={(e) => setLookName(e.target.value)}
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">
                Pose and Presentation Instructions (optional)
              </label>
              <Textarea
                placeholder="Ex: 'back pose showing the jacket', 'elegant gesture with hand on waist', 'profile view', 'relaxed sitting pose', etc."
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
                  Generating look...
                </>
              ) : (
                <>
                  <Wand2 className="mr-2 h-4 w-4" />
                  Generate Look with AI
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Galería de Looks Generados */}
      <Card>
        <CardHeader>
          <CardTitle>Generated Looks ({generatedLooks.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {generatedLooks.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No looks generated yet. Create your first look!
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
                          loading="lazy"
                        />
                      </div>
                      
                      <h4 className="font-semibold mb-2">{look.name}</h4>
                      
                      {model && (
                        <p className="text-sm text-muted-foreground mb-2">
                          Model: {model.name}
                        </p>
                      )}
                      
                      <div className="space-y-2">
                        <p className="text-xs font-medium">Garments used:</p>
                        <div className="flex flex-wrap gap-1">
                          {usedGarments.map(garment => (
                            <Badge key={garment.id} variant="outline" className="text-xs">
                              {garment.name}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      
                      {/* Información de Ajuste */}
                      {look.garmentFits && look.garmentFits.length > 0 && (
                        <div className="space-y-2 mt-3 border-t pt-2">
                          <p className="text-xs font-medium">Garment fit:</p>
                          <div className="space-y-1">
                            {look.garmentFits.map(fit => {
                              const garment = usedGarments.find(g => g.id === fit.garmentId);
                              if (!garment) return null;
                              
                              return (
                                <div key={fit.garmentId} className="flex items-center justify-between text-xs">
                                  <div className="flex-1 mr-2">
                                    <span className="truncate">{garment.name}</span>
                                    <span className="text-muted-foreground ml-1">(Size {fit.selectedSize})</span>
                                  </div>
                                  <Badge 
                                    variant="outline" 
                                    className={`text-xs ${getFitBadgeColor(fit.fitType)}`}
                                  >
                                    {getFitShortDescription(fit.fitType)}
                                  </Badge>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}
                      
                      {look.description && (
                        <p className="text-xs text-muted-foreground mt-2 line-clamp-3">
                          {look.description}
                        </p>
                      )}
                      
                      <div className="flex justify-between items-center mt-4">
                        <span className="text-xs text-muted-foreground">
                          {new Date(look.createdAt).toLocaleDateString()}
                        </span>
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditLook(look)}
                            className="h-6 w-6 p-0 hover:bg-blue-100 hover:text-blue-600"
                            title="Edit look"
                          >
                            <Edit3 className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => deleteLook(look.id)}
                            className="h-6 w-6 p-0 hover:bg-red-100 hover:text-red-600"
                            title="Delete look"
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Modal de edición detallada para looks */}
      <DetailEditor
        isOpen={isDetailEditorOpen}
        onClose={handleCloseDetailEditor}
        item={selectedLookForEdit}
        type="look"
        onItemUpdated={handleLookUpdated}
      />
    </div>
  );
}
