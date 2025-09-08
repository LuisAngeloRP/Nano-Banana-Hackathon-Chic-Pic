'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
// Badge import removed - not used
import { Loader2, Edit3, Check, X, RefreshCw, Sparkles } from 'lucide-react';
import { Garment, Model, StyledLook } from '@/types';
import { generateEditedImage } from '@/lib/nanoBanana';
import { SupabaseStorageAdapter } from '@/lib/storage.supabase';

interface DetailEditorProps {
  isOpen: boolean;
  onClose: () => void;
  item: Garment | Model | StyledLook | null;
  type: 'garment' | 'model' | 'look';
  onItemUpdated: (updatedItem: Garment | Model | StyledLook) => void;
}

export default function DetailEditor({ 
  isOpen, 
  onClose, 
  item, 
  type, 
  onItemUpdated 
}: DetailEditorProps) {
  const [editPrompt, setEditPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [iterationHistory, setIterationHistory] = useState<string[]>([]);


  if (!item) return null;

  const getItemTitle = () => {
    switch (type) {
      case 'garment':
        return (item as Garment).name;
      case 'model':
        return (item as Model).name;
      case 'look':
        return (item as StyledLook).name;
      default:
        return 'Item';
    }
  };

  const getItemDescription = () => {
    switch (type) {
      case 'garment':
        return (item as Garment).description;
      case 'model':
        return (item as Model).characteristics;
      case 'look':
        return (item as StyledLook).description;
      default:
        return '';
    }
  };

  const getItemImage = () => {
    return item.imageUrl;
  };

  const getItemDetails = () => {
    switch (type) {
      case 'garment':
        const garment = item as Garment;
        return [
          { label: 'Category', value: garment.category },
          { label: 'Color', value: garment.color || 'Not specified' },
          { label: 'Sizes', value: garment.availableSizes?.join(', ') || 'Not specified' },
          { label: 'Created', value: new Date(garment.createdAt).toLocaleDateString() }
        ];
      case 'model':
        const model = item as Model;
        return [
          { label: 'Gender', value: model.gender },
          { label: 'Age', value: model.age },
          { label: 'Height', value: model.height },
          { label: 'Body type', value: model.bodyType },
          { label: 'Hair', value: model.hairColor },
          { label: 'Eyes', value: model.eyeColor },
          { label: 'Skin', value: model.skinTone },
          { label: 'Sizes', value: `Upper: ${model.upperBodySize}, Lower: ${model.lowerBodySize}, Shoes: ${model.shoeSize}` },
          { label: 'Created', value: new Date(model.createdAt).toLocaleDateString() }
        ];
      case 'look':
        const look = item as StyledLook;
        return [
          { label: 'Model ID', value: look.modelId },
          { label: 'Garments', value: `${look.garmentIds.length} garments` },
          { label: 'Created', value: new Date(look.createdAt).toLocaleDateString() }
        ];
      default:
        return [];
    }
  };

  const handleGenerateEdit = async () => {
    if (!editPrompt.trim()) {
      alert('Please enter a description of the changes you want to make');
      return;
    }

    setIsGenerating(true);
    try {
      const editedImageUrl = await generateEditedImage(
        type,
        item as unknown as { imageUrl: string } & Record<string, unknown>,
        editPrompt,
        getItemDescription()
      );
      
      setPreviewImage(editedImageUrl);
      setShowConfirmation(true);
      
      // Agregar a historial de iteraciones
      setIterationHistory(prev => [...prev, editPrompt]);
      
    } catch (error) {
      console.error('Error generating edit:', error);
      alert('Error generating the edit. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleConfirmChanges = async () => {
    if (!previewImage) return;

    // Actualizar el elemento con la nueva imagen
    const updatedItem = {
      ...item,
      imageUrl: previewImage
    };

    // Guardar en localStorage según el tipo
    try {
      switch (type) {
        case 'garment':
          await SupabaseStorageAdapter.updateGarment(item.id, updatedItem as Garment);
          break;
        case 'model':
          await SupabaseStorageAdapter.updateModel(item.id, updatedItem as Model);
          break;
        case 'look':
          await SupabaseStorageAdapter.updateStyledLook(item.id, updatedItem as StyledLook);
          break;
      }
    } catch (error) {
      console.error('Error updating item:', error);
      alert('Error updating the item');
      return;
    }

    onItemUpdated(updatedItem);
    
    // Limpiar estado
    setPreviewImage(null);
    setShowConfirmation(false);
    setEditPrompt('');
    
    alert('Changes saved successfully!');
  };

  const handleDiscardChanges = () => {
    setPreviewImage(null);
    setShowConfirmation(false);
    setEditPrompt('');
  };

  const handleContinueIterating = () => {
    setShowConfirmation(false);
    // Mantener el previewImage para referencia, pero permitir nueva edición
  };

  const handleClose = () => {
    setEditPrompt('');
    setPreviewImage(null);
    setShowConfirmation(false);
    setIterationHistory([]);
    onClose();
  };

  const getTypeIcon = () => {
    switch (type) {
      case 'garment':
        return '👗';
      case 'model':
        return '👤';
      case 'look':
        return '✨';
      default:
        return '📝';
    }
  };

  const getTypeName = () => {
    switch (type) {
      case 'garment':
        return 'Garment';
      case 'model':
        return 'Model';
      case 'look':
        return 'Look';
      default:
        return 'Item';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span className="text-2xl">{getTypeIcon()}</span>
            Edit {getTypeName()}: {getItemTitle()}
          </DialogTitle>
          <DialogDescription>
            Make quick changes using Nano Banana with a simple prompt
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Panel izquierdo: Información actual */}
          <div className="space-y-4">
            <Card>
              <CardContent className="p-4">
                <h3 className="font-semibold mb-3">Current Information</h3>
                
                {/* Imagen actual */}
                <div className="aspect-square bg-gray-100 rounded-lg mb-4 overflow-hidden">
                  <img
                    src={getItemImage()}
                    alt={getItemTitle()}
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Descripción */}
                <div className="mb-4">
                  <h4 className="font-medium text-sm mb-2">Description:</h4>
                  <p className="text-sm text-muted-foreground">
                    {getItemDescription()}
                  </p>
                </div>

                {/* Detalles específicos */}
                <div className="space-y-2">
                  <h4 className="font-medium text-sm">Details:</h4>
                  {getItemDetails().map((detail, index) => (
                    <div key={index} className="flex justify-between text-xs">
                      <span className="font-medium">{detail.label}:</span>
                      <span className="text-muted-foreground text-right max-w-[60%]">
                        {detail.value}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Historial de iteraciones */}
            {iterationHistory.length > 0 && (
              <Card>
                <CardContent className="p-4">
                  <h3 className="font-semibold mb-3">Change History</h3>
                  <div className="space-y-2">
                    {iterationHistory.map((prompt, index) => (
                      <div key={index} className="text-xs bg-blue-50 p-2 rounded">
                        <span className="font-medium">Change #{index + 1}:</span>
                        <p className="text-muted-foreground mt-1">{prompt}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Panel derecho: Editor */}
          <div className="space-y-4">
            {!showConfirmation ? (
              /* Modo edición */
              <Card>
                <CardContent className="p-4">
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <Edit3 className="h-4 w-4" />
                    Quick AI Editing
                  </h3>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium mb-2 block">
                        Describe the changes you want to make:
                      </label>
                      <Textarea
                        placeholder="Ex: Change color to navy blue, add golden buttons, make the cut more fitted..."
                        value={editPrompt}
                        onChange={(e) => setEditPrompt(e.target.value)}
                        rows={4}
                        className="resize-none"
                      />
                    </div>

                    <div className="bg-blue-50 p-3 rounded-lg">
                      <p className="text-xs text-blue-700">
                        <Sparkles className="h-3 w-3 inline mr-1" />
                        <strong>Tips:</strong> Be specific in your changes. 
                        You can mention colors, textures, shapes, styles, etc.
                      </p>
                    </div>


                    <Button 
                      onClick={handleGenerateEdit}
                      disabled={isGenerating || !editPrompt.trim()}
                      className="w-full"
                    >
                      {isGenerating ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Generating changes...
                        </>
                      ) : (
                        <>
                          <Sparkles className="mr-2 h-4 w-4" />
                          Generate Changes with AI
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              /* Modo confirmación */
              <Card>
                <CardContent className="p-4">
                  <h3 className="font-semibold mb-3">Change Preview</h3>
                  
                  {/* Imagen editada */}
                  <div className="aspect-square bg-gray-100 rounded-lg mb-4 overflow-hidden">
                    <img
                      src={previewImage || ''}
                      alt="Vista previa editada"
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div className="bg-amber-50 p-3 rounded-lg mb-4">
                    <p className="text-sm text-amber-700">
                      <strong>Applied change:</strong> {editPrompt}
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Button 
                      onClick={handleConfirmChanges}
                      className="w-full bg-green-600 hover:bg-green-700"
                    >
                      <Check className="mr-2 h-4 w-4" />
                      Confirm and Save Changes
                    </Button>
                    
                    <Button 
                      onClick={handleContinueIterating}
                      variant="outline"
                      className="w-full"
                    >
                      <RefreshCw className="mr-2 h-4 w-4" />
                      Continue Iterating
                    </Button>
                    
                    <Button 
                      onClick={handleDiscardChanges}
                      variant="destructive"
                      className="w-full"
                    >
                      <X className="mr-2 h-4 w-4" />
                      Discard Changes
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Vista previa lado a lado cuando está iterando */}
            {showConfirmation && (
              <Card>
                <CardContent className="p-4">
                  <h3 className="font-semibold mb-3">Comparison</h3>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <p className="text-xs font-medium mb-2 text-center">Original</p>
                      <div className="aspect-square bg-gray-100 rounded overflow-hidden">
                        <img
                          src={getItemImage()}
                          alt="Original"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </div>
                    <div>
                      <p className="text-xs font-medium mb-2 text-center">Edited</p>
                      <div className="aspect-square bg-gray-100 rounded overflow-hidden">
                        <img
                          src={previewImage || ''}
                          alt="Editado"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
