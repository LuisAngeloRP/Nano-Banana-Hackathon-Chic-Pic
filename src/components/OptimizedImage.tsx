'use client';

import { useState, useEffect, useRef } from 'react';
import { imageCache } from '@/lib/imageCache';
import { cn } from '@/lib/utils';
import { Loader2, ImageIcon } from 'lucide-react';

interface OptimizedImageProps {
  src: string; // URL de Supabase Storage o base64 (retrocompatibilidad)
  alt: string;
  className?: string;
  width?: number;
  height?: number;
  lazy?: boolean;
  useCompressed?: boolean; // Usar versión comprimida para thumbnails (solo para base64)
  onLoad?: () => void;
  onError?: () => void;
  placeholder?: React.ReactNode;
}

export default function OptimizedImage({
  src,
  alt,
  className,
  width,
  height,
  lazy = true,
  useCompressed = false,
  onLoad,
  onError,
  placeholder
}: OptimizedImageProps) {
  const [imageSrc, setImageSrc] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [isVisible, setIsVisible] = useState(!lazy);
  const imgRef = useRef<HTMLImageElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  // Intersection Observer para lazy loading
  useEffect(() => {
    if (!lazy || isVisible) return;

    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
            observerRef.current?.disconnect();
          }
        });
      },
      {
        rootMargin: '50px' // Comenzar a cargar 50px antes de que sea visible
      }
    );

    if (imgRef.current) {
      observerRef.current.observe(imgRef.current);
    }

    return () => {
      observerRef.current?.disconnect();
    };
  }, [lazy, isVisible]);

  // Cargar imagen optimizada
  useEffect(() => {
    if (!isVisible || !src) return;

    let isMounted = true;

    const loadOptimizedImage = async () => {
      try {
        setIsLoading(true);
        setHasError(false);

        // Verificar si es URL de Supabase Storage o base64
        const isBase64 = src.startsWith('data:');
        const isSupabaseUrl = src.includes('supabase') && !isBase64;

        if (isSupabaseUrl) {
          // Para URLs de Supabase Storage, usar directamente (ya están optimizadas)
          console.log('🌐 Cargando desde Supabase Storage:', src);
          setImageSrc(src);
        } else if (isBase64) {
          // Para base64, usar el sistema de caché existente
          const cachedImage = await imageCache.getImage(src, useCompressed);
          
          if (isMounted) {
            if (cachedImage) {
              console.log('🚀 Imagen base64 cargada desde caché');
              setImageSrc(cachedImage);
            } else {
              console.log('💾 Cacheando imagen base64 nueva');
              await imageCache.cacheImage(src);
              setImageSrc(src);
            }
          }
        } else {
          // Para otras URLs, usar directamente
          console.log('🔗 Cargando URL externa:', src);
          setImageSrc(src);
        }
      } catch (error) {
        console.warn('Error cargando imagen optimizada:', error);
        if (isMounted) {
          setImageSrc(src); // Fallback a la imagen original
        }
      }
    };

    loadOptimizedImage();

    return () => {
      isMounted = false;
    };
  }, [src, isVisible, useCompressed]);

  const handleImageLoad = () => {
    setIsLoading(false);
    onLoad?.();
  };

  const handleImageError = () => {
    setIsLoading(false);
    setHasError(true);
    onError?.();
  };

  // Placeholder mientras carga
  const renderPlaceholder = () => {
    if (placeholder) {
      return placeholder;
    }

    return (
      <div 
        className={cn(
          "flex items-center justify-center bg-gray-100 text-gray-400",
          className
        )}
        style={{ width, height }}
      >
        {isLoading ? (
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span className="text-xs">Cargando...</span>
          </div>
        ) : hasError ? (
          <div className="flex flex-col items-center gap-2">
            <ImageIcon className="h-6 w-6" />
            <span className="text-xs">Error al cargar</span>
          </div>
        ) : null}
      </div>
    );
  };

  // Si no es visible aún (lazy loading), mostrar placeholder
  if (!isVisible) {
    return (
      <div 
        ref={imgRef}
        className={cn("bg-gray-100", className)}
        style={{ width, height }}
      />
    );
  }

  // Si está cargando o hay error, mostrar placeholder
  if (isLoading || hasError || !imageSrc) {
    return renderPlaceholder();
  }

  return (
    <>
      {/* Placeholder que se oculta cuando la imagen carga */}
      {isLoading && renderPlaceholder()}
      
      {/* Imagen optimizada */}
      <img
        ref={imgRef}
        src={imageSrc}
        alt={alt}
        className={cn(
          className,
          isLoading ? "opacity-0 absolute" : "opacity-100"
        )}
        width={width}
        height={height}
        onLoad={handleImageLoad}
        onError={handleImageError}
        loading={lazy ? "lazy" : "eager"}
        decoding="async"
        style={{
          transition: 'opacity 0.3s ease-in-out',
          ...(!isLoading && { position: 'static' })
        }}
      />
    </>
  );
}
