'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { FolderOpen, Image, RefreshCw, Trash2 } from 'lucide-react';

interface ImageStats {
  garments: number;
  models: number;
  looks: number;
  total: number;
  lastUpdated: string;
}

export default function ImageStats() {
  const [stats, setStats] = useState<ImageStats | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/images');
      const data = await response.json();
      
      if (data.success) {
        setStats({
          garments: data.stats.garments,
          models: data.stats.models,
          looks: data.stats.looks,
          total: data.stats.total,
          lastUpdated: new Date(data.stats.lastUpdated).toLocaleString()
        });
      } else {
        console.error('Error en respuesta:', data.error);
        // Fallback a estadísticas vacías
        setStats({
          garments: 0,
          models: 0,
          looks: 0,
          total: 0,
          lastUpdated: new Date().toLocaleString()
        });
      }
    } catch (error) {
      console.error('Error cargando estadísticas:', error);
      // Fallback a estadísticas vacías en caso de error
      setStats({
        garments: 0,
        models: 0,
        looks: 0,
        total: 0,
        lastUpdated: new Date().toLocaleString()
      });
    } finally {
      setIsLoading(false);
    }
  };

  const openImagesFolder = () => {
    // En desarrollo, mostrar la ruta
    alert('Directorio de imágenes: public/generated-images/\n\nLas imágenes se guardan automáticamente en esta carpeta.');
  };

  const cleanOldImages = async () => {
    if (confirm('¿Estás seguro de que quieres limpiar las imágenes antiguas (7+ días)?')) {
      setIsLoading(true);
      try {
        const response = await fetch('/api/images?days=7', { method: 'DELETE' });
        const data = await response.json();
        
        if (data.success) {
          alert(data.message);
          loadStats(); // Recargar estadísticas
        } else {
          alert('Error limpiando imágenes: ' + data.error);
        }
      } catch (error) {
        console.error('Error:', error);
        alert('Error de conexión al limpiar imágenes');
      } finally {
        setIsLoading(false);
      }
    }
  };

  if (!stats) {
    return null;
  }

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Image className="h-5 w-5" />
          Almacenamiento Local de Imágenes
          <Button
            variant="ghost"
            size="sm"
            onClick={loadStats}
            disabled={isLoading}
            className="ml-auto"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-3 bg-pink-50 rounded-lg">
            <div className="text-2xl font-bold text-pink-600">{stats.garments}</div>
            <div className="text-sm text-pink-700">Prendas</div>
          </div>
          <div className="text-center p-3 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">{stats.models}</div>
            <div className="text-sm text-blue-700">Modelos</div>
          </div>
          <div className="text-center p-3 bg-purple-50 rounded-lg">
            <div className="text-2xl font-bold text-purple-600">{stats.looks}</div>
            <div className="text-sm text-purple-700">Looks</div>
          </div>
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-gray-600">{stats.total}</div>
            <div className="text-sm text-gray-700">Total</div>
          </div>
        </div>

        <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
          <div>
            <h4 className="font-semibold text-green-800">💾 Almacenamiento Local Activo</h4>
            <p className="text-sm text-green-700">
              Las imágenes se guardan en: <code className="bg-green-100 px-1 rounded">public/generated-images/</code>
            </p>
            <p className="text-xs text-green-600 mt-1">
              Última actualización: {stats.lastUpdated}
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={openImagesFolder}>
              <FolderOpen className="h-4 w-4 mr-2" />
              Ver Carpeta
            </Button>
            {stats.total > 0 && (
              <Button variant="outline" size="sm" onClick={cleanOldImages} disabled={isLoading}>
                <Trash2 className="h-4 w-4 mr-2" />
                Limpiar
              </Button>
            )}
          </div>
        </div>

        <div className="bg-blue-50 p-4 rounded-lg">
          <h4 className="font-semibold text-blue-800 mb-2">ℹ️ Información del Sistema</h4>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• <strong>Formato:</strong> JPG optimizado para web</li>
            <li>• <strong>Nomenclatura:</strong> tipo-descripcion-timestamp.jpg</li>
            <li>• <strong>Acceso:</strong> Disponible vía /generated-images/[filename]</li>
            <li>• <strong>Limpieza:</strong> Automática después de 7 días (configurable)</li>
          </ul>
        </div>

        <div className="flex gap-2">
          <Badge variant="outline" className="text-xs">
            📁 Directorio: public/generated-images/
          </Badge>
          <Badge variant="outline" className="text-xs">
            🔄 Auto-actualización
          </Badge>
          <Badge variant="outline" className="text-xs">
            🗂️ Organización por tipo
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
}
