'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Database, Trash2, RefreshCw, HardDrive, Zap } from 'lucide-react';
import { imageCache } from '@/lib/imageCache';

interface CacheStats {
  memoryItems: number;
  memorySize: string;
}

export default function CacheManager() {
  const [stats, setStats] = useState<CacheStats>({ memoryItems: 0, memorySize: '0MB' });
  const [isClearing, setIsClearing] = useState(false);
  const [isCleaning, setIsCleaning] = useState(false);
  const [isClient, setIsClient] = useState(false);

  const loadStats = () => {
    if (typeof window !== 'undefined') {
      const currentStats = imageCache.getCacheStats();
      setStats(currentStats);
    }
  };

  useEffect(() => {
    // Verificar que estamos en el cliente
    setIsClient(typeof window !== 'undefined');
    
    if (typeof window !== 'undefined') {
      loadStats();
      
      // Actualizar estadísticas cada 5 segundos
      const interval = setInterval(loadStats, 5000);
      
      return () => clearInterval(interval);
    }
  }, []);

  const handleClearCache = async () => {
    setIsClearing(true);
    try {
      await imageCache.clearAllCache();
      loadStats();
      console.log('✅ Caché limpiado completamente');
    } catch (error) {
      console.error('Error limpiando caché:', error);
    } finally {
      setIsClearing(false);
    }
  };

  const handleCleanExpired = async () => {
    setIsCleaning(true);
    try {
      await imageCache.cleanExpiredCache();
      loadStats();
      console.log('✅ Caché expirado limpiado');
    } catch (error) {
      console.error('Error limpiando caché expirado:', error);
    } finally {
      setIsCleaning(false);
    }
  };

  const getMemorySizeMB = () => {
    return parseFloat(stats.memorySize.replace('MB', '')) || 0;
  };

  const getMemoryUsagePercentage = () => {
    const maxSizeMB = 50; // 50MB máximo configurado
    const currentSizeMB = getMemorySizeMB();
    return Math.min((currentSizeMB / maxSizeMB) * 100, 100);
  };

  const getItemsUsagePercentage = () => {
    const maxItems = 50; // 50 items máximo configurado
    return Math.min((stats.memoryItems / maxItems) * 100, 100);
  };

  // Si no estamos en el cliente, mostrar mensaje
  if (!isClient) {
    return (
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-sm">
            <Database className="h-4 w-4" />
            Caché de Imágenes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4 text-muted-foreground text-sm">
            Cargando sistema de caché...
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-sm">
          <Database className="h-4 w-4" />
          Caché de Imágenes
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Estadísticas de memoria */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="flex items-center gap-1">
              <Zap className="h-3 w-3" />
              Memoria RAM
            </span>
            <Badge variant="outline" className="text-xs">
              {stats.memoryItems} elementos
            </Badge>
          </div>
          <Progress value={getItemsUsagePercentage()} className="h-2" />
          <div className="text-xs text-muted-foreground text-center">
            {stats.memoryItems}/50 elementos ({stats.memorySize}/50MB)
          </div>
        </div>

        {/* Uso de almacenamiento */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="flex items-center gap-1">
              <HardDrive className="h-3 w-3" />
              Uso de memoria
            </span>
            <Badge 
              variant={getMemoryUsagePercentage() > 80 ? "destructive" : "outline"} 
              className="text-xs"
            >
              {getMemoryUsagePercentage().toFixed(1)}%
            </Badge>
          </div>
          <Progress 
            value={getMemoryUsagePercentage()} 
            className="h-2"
          />
        </div>

        {/* Beneficios del caché */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-3">
          <div className="text-xs text-green-800 font-medium mb-1">
            Beneficios activos:
          </div>
          <ul className="text-xs text-green-700 space-y-1">
            <li>• Carga instantánea de imágenes visitadas</li>
            <li>• Thumbnails comprimidos automáticos</li>
            <li>• Persistencia entre sesiones</li>
            <li>• Lazy loading inteligente</li>
          </ul>
        </div>

        {/* Controles de gestión */}
        <div className="flex gap-2 pt-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleCleanExpired}
            disabled={isCleaning}
            className="flex-1"
          >
            {isCleaning ? (
              <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
            ) : (
              <RefreshCw className="h-3 w-3 mr-1" />
            )}
            Limpiar
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={handleClearCache}
            disabled={isClearing}
            className="flex-1 text-red-600 hover:text-red-700"
          >
            {isClearing ? (
              <Trash2 className="h-3 w-3 mr-1 animate-pulse" />
            ) : (
              <Trash2 className="h-3 w-3 mr-1" />
            )}
            Borrar
          </Button>
        </div>

        <div className="text-xs text-muted-foreground text-center pt-2 border-t">
          El caché se limpia automáticamente cada hora
        </div>
      </CardContent>
    </Card>
  );
}
