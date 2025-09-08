'use client';

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Upload, X, Image as ImageIcon, Loader2 } from 'lucide-react';
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
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateFile = (file: File): string | null => {
    // Validate file type
    if (!file.type.startsWith('image/')) {
      return 'Please select a valid image file';
    }

    // Validate size
    const fileSizeMB = file.size / (1024 * 1024);
    if (fileSizeMB > maxSizeMB) {
      return `File is too large. Maximum ${maxSizeMB}MB allowed`;
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
        console.log('✅ Image uploaded to Supabase Storage:', result.url);
      } else {
        setError(result.error || 'Error uploading the image');
      }
    } catch (err) {
      setError('Error uploading the file');
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
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleButtonClick = () => {
    if (!disabled && fileInputRef.current) {
      fileInputRef.current.click();
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
    <div className={cn("space-y-4", className)}>
      {/* Upload area */}
      <Card
        className={cn(
          "border-2 border-dashed transition-all cursor-pointer",
          isDragging ? "border-blue-500 bg-blue-50" : "border-gray-300",
          disabled ? "opacity-50 cursor-not-allowed" : "hover:border-gray-400",
          error ? "border-red-300 bg-red-50" : ""
        )}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleButtonClick}
      >
        <CardContent className="p-6">
          <div className="flex flex-col items-center justify-center space-y-4">
            {isProcessing ? (
              <>
                <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
                <p className="text-sm text-muted-foreground">
                  Processing image...
                </p>
              </>
            ) : (
              <>
                <div className="p-3 bg-gray-100 rounded-full">
                  <Upload className="h-6 w-6 text-gray-600" />
                </div>
                <div className="text-center">
                  <p className="text-sm font-medium">
                    Drag an image here or click to select
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Supported formats: JPG, PNG, WEBP, GIF (max. {maxSizeMB}MB)
                  </p>
                </div>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Hidden input */}
      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        onChange={handleInputChange}
        className="hidden"
        disabled={disabled}
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
                    alt="Current image"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium">Current image</p>
                <p className="text-xs text-muted-foreground">
                  Upload a new image to replace it
                </p>
              </div>
              {onRemove && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleRemove}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
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
