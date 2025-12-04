'use client';

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Upload, X, Loader2, Camera } from 'lucide-react';
import { cn } from '@/lib/utils';
import { supabaseStorage } from '@/lib/supabaseStorage';

interface FileUploadProps {
  onFileUpload: (file: File, url: string, thumbnailUrl?: string, storagePath?: string) => void;
  accept?: string;
  maxSizeMB?: number;
  className?: string;
  disabled?: boolean;
  currentImage?: string;
  onRemove?: () => void;
  folder?: string; // Folder in Supabase Storage
}

export default function FileUpload({
  onFileUpload,
  accept = "image/*",
  maxSizeMB = 5,
  className,
  disabled = false,
  currentImage,
  onRemove,
  folder = "general"
}: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showCamera, setShowCamera] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const validateFile = (file: File): string | null => {
    // Validar tipo de archivo
    if (!file.type.startsWith('image/')) {
      return 'Por favor selecciona un archivo de imagen válido';
    }

    // Validar tamaño
    const fileSizeMB = file.size / (1024 * 1024);
    if (fileSizeMB > maxSizeMB) {
      return `El archivo es demasiado grande. Máximo ${maxSizeMB}MB permitido`;
    }

    return null;
  };

  const handleFileSelect = async (file: File) => {
    setError(null);
    
    // Validate file
    const validationError = validateFile(file);
    if (validationError) {
      setError(validationError);
      return;
    }

    setIsProcessing(true);
    try {
      // Upload to Supabase Storage
      const result = await supabaseStorage.uploadImage(file, folder);
      
      if (result.success && result.url) {
        onFileUpload(file, result.url, result.thumbnailUrl, result.path);
        console.log('✅ Imagen subida a Supabase Storage:', result.url);
      } else {
        setError(result.error || 'Error al subir la imagen');
      }
    } catch (err) {
      setError('Error al subir el archivo');
      console.error('Error uploading to Supabase Storage:', err);
    } finally {
      setIsProcessing(false);
    }
  };


  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (!disabled) {
      setIsDragging(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (disabled) return;

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    e.stopPropagation();
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileSelect(files[0]);
    }
    // Limpiar el input para permitir seleccionar el mismo archivo de nuevo
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleButtonClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled && fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleCameraClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled && cameraInputRef.current) {
      cameraInputRef.current.click();
    }
  };

  const handleCameraChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    e.stopPropagation();
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileSelect(files[0]);
    }
    // Limpiar el input para permitir tomar otra foto
    if (cameraInputRef.current) {
      cameraInputRef.current.value = '';
    }
  };

  const handleRemove = () => {
    if (onRemove) {
      onRemove();
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className={cn("space-y-4", className)} onContextMenu={(e) => e.preventDefault()}>
      {/* Upload area */}
      <Card
        className={cn(
          "border-2 border-dashed transition-all",
          isDragging ? "border-blue-500 bg-blue-50" : "border-gray-300",
          disabled ? "opacity-50 cursor-not-allowed" : "",
          error ? "border-red-300 bg-red-50" : ""
        )}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <CardContent className="p-4 md:p-6">
          <div className="flex flex-col items-center justify-center space-y-4">
            {isProcessing ? (
              <>
                <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
                <p className="text-sm text-muted-foreground">
                  Procesando imagen...
                </p>
              </>
            ) : (
              <>
                <div className="p-3 bg-gray-100 rounded-full">
                  <Upload className="h-6 w-6 text-gray-600" />
                </div>
                <div className="text-center">
                  <p className="text-sm font-medium">
                    Arrastra una imagen aquí o haz clic para seleccionar
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Formatos soportados: JPG, PNG, WEBP, GIF (máx. {maxSizeMB}MB)
                  </p>
                </div>
                {/* Botones de acción */}
                <div className="flex flex-col sm:flex-row gap-2 w-full max-w-md">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleButtonClick}
                    disabled={disabled}
                    className="flex-1"
                    onMouseDown={(e) => e.preventDefault()}
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Seleccionar archivo
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleCameraClick}
                    disabled={disabled}
                    className="flex-1"
                    onMouseDown={(e) => e.preventDefault()}
                  >
                    <Camera className="h-4 w-4 mr-2" />
                    Tomar foto
                  </Button>
                </div>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Hidden inputs */}
      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        onChange={handleInputChange}
        className="hidden"
        disabled={disabled}
        onClick={(e) => {
          // Prevenir que el click se propague
          e.stopPropagation();
        }}
      />
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleCameraChange}
        className="hidden"
        disabled={disabled}
        onClick={(e) => {
          // Prevenir que el click se propague
          e.stopPropagation();
        }}
      />

      {/* Show error */}
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {/* Current image preview */}
      {currentImage && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-4">
              <div className="flex-shrink-0">
                <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden">
                  <img
                    src={currentImage}
                    alt="Imagen actual"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium">Imagen actual</p>
                <p className="text-xs text-muted-foreground">
                  Sube una nueva imagen para reemplazarla
                </p>
              </div>
              {onRemove && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleRemove}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50 flex-shrink-0"
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
