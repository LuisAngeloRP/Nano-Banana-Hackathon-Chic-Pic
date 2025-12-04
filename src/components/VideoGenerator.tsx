'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Loader2, Video, Check, X, Play, Download } from 'lucide-react';
import { SupabaseStorageAdapter } from '@/lib/storage.supabase';
import { StyledLook } from '@/types';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface GeneratedVideo {
  id: string;
  videoUrl: string;
  thumbnailUrl?: string;
  description: string;
  lookIds: string[];
  createdAt: Date;
}

export default function VideoGenerator() {
  const [looks, setLooks] = useState<StyledLook[]>([]);
  const [selectedLooks, setSelectedLooks] = useState<StyledLook[]>([]);
  const [videoDescription, setVideoDescription] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedVideos, setGeneratedVideos] = useState<GeneratedVideo[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [currentVideoUrl, setCurrentVideoUrl] = useState<string | null>(null);

  useEffect(() => {
    loadLooks();
  }, []);

  const loadLooks = async () => {
    try {
      const looksData = await SupabaseStorageAdapter.getStyledLooks();
      setLooks(looksData);
    } catch (error) {
      console.error('Error cargando looks:', error);
      setError('Error al cargar los looks generados');
    }
  };

  const toggleLookSelection = (look: StyledLook) => {
    if (selectedLooks.find(l => l.id === look.id)) {
      setSelectedLooks(prev => prev.filter(l => l.id !== look.id));
    } else {
      setSelectedLooks(prev => [...prev, look]);
    }
  };

  const generateVideo = async () => {
    if (selectedLooks.length === 0) {
      setError('Por favor selecciona al menos un look');
      return;
    }

    if (!videoDescription.trim()) {
      setError('Por favor escribe una descripción para el video');
      return;
    }

    setIsGenerating(true);
    setError(null);
    setCurrentVideoUrl(null);

    try {
      const response = await fetch('/api/generate-video', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          lookIds: selectedLooks.map(l => l.id),
          lookImages: selectedLooks.map(l => ({
            imageUrl: l.imageUrl,
            name: l.name,
            description: l.description,
          })),
          description: videoDescription,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        
        // Manejar error específico de Veo 3.1 que requiere Vertex AI
        if (errorData.requiresVertexAI || errorData.modelNotFound) {
          throw new Error(
            'Veo 3.1 requiere Vertex AI y no está disponible a través de la API de Gemini estándar.\n\n' +
            'Para usar Veo 3.1, necesitas:\n' +
            '1. Configurar Vertex AI en Google Cloud\n' +
            '2. Usar el método predictLongRunning\n' +
            '3. Configurar Google Cloud Storage\n\n' +
            'Consulta VEO_3.1_SETUP.md para más detalles.'
          );
        }
        
        throw new Error(errorData.error || 'Error al generar el video');
      }

      const data = await response.json();
      
      if (data.videoUrl) {
        setCurrentVideoUrl(data.videoUrl);
        // Agregar a la lista de videos generados
        const newVideo: GeneratedVideo = {
          id: Date.now().toString(),
          videoUrl: data.videoUrl,
          thumbnailUrl: selectedLooks[0]?.imageUrl,
          description: videoDescription,
          lookIds: selectedLooks.map(l => l.id),
          createdAt: new Date(),
        };
        setGeneratedVideos(prev => [newVideo, ...prev]);
        
        // Limpiar selección
        setSelectedLooks([]);
        setVideoDescription('');
      } else {
        throw new Error('No se recibió URL del video');
      }
    } catch (error: unknown) {
      console.error('Error generando video:', error);
      const errorMessage = error instanceof Error ? error.message : 'Error al generar el video. Por favor intenta de nuevo.';
      setError(errorMessage);
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadVideo = async (videoUrl: string, filename: string) => {
    try {
      const response = await fetch(videoUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename || 'video-cicibet.mp4';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error descargando video:', error);
      setError('Error al descargar el video');
    }
  };

  return (
    <div className="space-y-6">
      {/* Generador de Videos */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Video className="h-5 w-5 text-purple-500" />
            Generador de Videos Promocionales
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Selección de Looks */}
          <div>
            <h3 className="font-semibold mb-3">
              1. Selecciona los Looks para el Video
            </h3>
            {selectedLooks.length > 0 && (
              <div className="mb-3">
                <p className="text-sm text-muted-foreground mb-2">
                  {selectedLooks.length} look{selectedLooks.length !== 1 ? 's' : ''} seleccionado{selectedLooks.length !== 1 ? 's' : ''}
                </p>
                <div className="flex flex-wrap gap-2">
                  {selectedLooks.map(look => (
                    <Badge key={look.id} variant="secondary" className="flex items-center gap-1">
                      {look.name}
                      <button
                        onClick={() => toggleLookSelection(look)}
                        className="ml-1 hover:text-destructive"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>
            )}
            {looks.length === 0 ? (
              <Alert>
                <AlertDescription>
                  No hay looks disponibles. Genera algunos looks primero en la sección &quot;Estilista&quot;.
                </AlertDescription>
              </Alert>
            ) : (
              <ScrollArea className="h-64 border rounded-lg p-4">
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {looks.map(look => {
                    const isSelected = selectedLooks.find(l => l.id === look.id);
                    return (
                      <Card
                        key={look.id}
                        className={`cursor-pointer hover:shadow-md transition-all ${
                          isSelected ? 'ring-2 ring-purple-500 bg-purple-50' : ''
                        }`}
                        onClick={() => toggleLookSelection(look)}
                      >
                        <CardContent className="p-3">
                          <div className="relative">
                            <img
                              src={look.imageUrl}
                              alt={look.name}
                              className="w-full aspect-square object-cover rounded mb-2"
                              loading="lazy"
                            />
                            {isSelected && (
                              <div className="absolute top-2 right-2 bg-purple-500 text-white rounded-full p-1">
                                <Check className="h-4 w-4" />
                              </div>
                            )}
                          </div>
                          <p className="text-xs font-medium text-center line-clamp-2">
                            {look.name}
                          </p>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </ScrollArea>
            )}
          </div>

          {/* Descripción del Video */}
          <div>
            <h3 className="font-semibold mb-3">
              2. Describe el Video Promocional
            </h3>
            <Textarea
              placeholder="Ejemplo: Video promocional mostrando los looks de verano de cicibet. Transiciones suaves entre los diferentes outfits, música alegre, colores vibrantes..."
              value={videoDescription}
              onChange={(e) => setVideoDescription(e.target.value)}
              rows={4}
              className="w-full"
            />
            <p className="text-xs text-muted-foreground mt-2">
              Describe cómo quieres que se vea el video promocional. La IA creará un video profesional basado en tus looks seleccionados.
            </p>
          </div>

          {/* Error */}
          {error && (
            <Alert variant="destructive">
              <AlertDescription className="whitespace-pre-line">
                {error}
                {error.includes('Vertex AI') && (
                  <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-sm font-semibold text-blue-900 mb-2">
                      💡 Información sobre Veo 3.1:
                    </p>
                    <ul className="text-sm text-blue-800 list-disc list-inside space-y-1">
                      <li>Veo 3.1 solo está disponible a través de Vertex AI</li>
                      <li>Requiere configuración adicional de Google Cloud</li>
                      <li>Consulta el archivo VEO_3.1_SETUP.md para instrucciones detalladas</li>
                    </ul>
                  </div>
                )}
              </AlertDescription>
            </Alert>
          )}

          {/* Botón de Generación */}
          <Button
            onClick={generateVideo}
            disabled={isGenerating || selectedLooks.length === 0 || !videoDescription.trim()}
            className="w-full"
            size="lg"
          >
            {isGenerating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generando Video...
              </>
            ) : (
              <>
                <Video className="mr-2 h-4 w-4" />
                Generar Video con Veo 3.1
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Video Generado */}
      {currentVideoUrl && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Play className="h-5 w-5 text-green-500" />
              Video Generado
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="relative w-full aspect-video bg-black rounded-lg overflow-hidden">
              <video
                src={currentVideoUrl}
                controls
                className="w-full h-full"
                autoPlay
                loop
              >
                Tu navegador no soporta la reproducción de video.
              </video>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={() => downloadVideo(currentVideoUrl, 'video-cicibet.mp4')}
                variant="outline"
                className="flex-1"
              >
                <Download className="mr-2 h-4 w-4" />
                Descargar Video
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Historial de Videos */}
      {generatedVideos.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Videos Generados</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {generatedVideos.map((video) => (
                <Card key={video.id}>
                  <CardContent className="p-4 space-y-3">
                    <div className="relative w-full aspect-video bg-black rounded-lg overflow-hidden">
                      <video
                        src={video.videoUrl}
                        controls
                        className="w-full h-full"
                      >
                        Tu navegador no soporta la reproducción de video.
                      </video>
                    </div>
                    <div>
                      <p className="text-sm font-medium mb-1">{video.description}</p>
                      <p className="text-xs text-muted-foreground">
                        {video.createdAt.toLocaleDateString('es-ES')}
                      </p>
                    </div>
                    <Button
                      onClick={() => downloadVideo(video.videoUrl, `video-cicibet-${video.id}.mp4`)}
                      variant="outline"
                      size="sm"
                      className="w-full"
                    >
                      <Download className="mr-2 h-3 w-3" />
                      Descargar
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

