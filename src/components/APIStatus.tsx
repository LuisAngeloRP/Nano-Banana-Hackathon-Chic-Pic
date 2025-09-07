'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { CheckCircle, XCircle, AlertTriangle, RefreshCw, ExternalLink } from 'lucide-react';
import { getAPIStatus } from '@/lib/gemini';

export default function APIStatus() {
  const [status, setStatus] = useState<any>(null);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    checkStatus();
  }, []);

  const checkStatus = () => {
    const apiStatus = getAPIStatus();
    setStatus(apiStatus);
  };

  if (!status) {
    return null;
  }

  const { hasAPIKey, hasTextModel, hasImageModel, apiKeyLength } = status;

  const getStatusColor = () => {
    if (hasAPIKey && hasTextModel) return 'green';
    if (hasAPIKey) return 'yellow';
    return 'red';
  };

  const getStatusText = () => {
    if (hasAPIKey && hasTextModel) return 'Configurado';
    if (hasAPIKey) return 'Configuración parcial';
    return 'No configurado';
  };

  const getStatusIcon = () => {
    const color = getStatusColor();
    if (color === 'green') return <CheckCircle className="h-4 w-4 text-green-500" />;
    if (color === 'yellow') return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
    return <XCircle className="h-4 w-4 text-red-500" />;
  };

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {getStatusIcon()}
          Estado de Nano Banana API
          <Badge variant={getStatusColor() === 'green' ? 'default' : 'destructive'}>
            {getStatusText()}
          </Badge>
          <Button
            variant="ghost"
            size="sm"
            onClick={checkStatus}
            className="ml-auto"
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {!hasAPIKey && (
          <Alert className="border-red-200 bg-red-50">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <strong>API Key no configurada</strong>
              <p className="mt-2">Para usar Nano Banana (Gemini 2.5 Flash Image), necesitas configurar tu API key:</p>
              <ol className="list-decimal list-inside mt-2 space-y-1 text-sm">
                <li>Ve a <a href="https://aistudio.google.com/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline inline-flex items-center gap-1">Google AI Studio <ExternalLink className="h-3 w-3" /></a></li>
                <li>Crea una API key para Gemini</li>
                <li>Crea un archivo <code className="bg-gray-100 px-1 rounded">.env.local</code> en la raíz del proyecto</li>
                <li>Añade: <code className="bg-gray-100 px-1 rounded">GOOGLE_API_KEY=tu_api_key_aqui</code></li>
                <li>Reinicia el servidor de desarrollo</li>
              </ol>
            </AlertDescription>
          </Alert>
        )}

        {hasAPIKey && !hasTextModel && (
          <Alert className="border-yellow-200 bg-yellow-50">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <strong>Error de inicialización</strong>
              <p className="mt-2">La API key está configurada pero hay un problema con la inicialización del modelo. Verifica que:</p>
              <ul className="list-disc list-inside mt-2 space-y-1 text-sm">
                <li>La API key sea válida y esté activa</li>
                <li>Tengas acceso a Gemini API</li>
                <li>No haya caracteres extra o espacios en la API key</li>
              </ul>
            </AlertDescription>
          </Alert>
        )}

        {hasAPIKey && hasTextModel && (
          <Alert className="border-green-200 bg-green-50">
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>
              <strong>¡API configurada correctamente!</strong>
              <p className="mt-2">
                {hasImageModel 
                  ? "🍌 Nano Banana (Gemini 2.5 Flash Image Preview) está configurado para generar imágenes reales de alta calidad."
                  : "API configurada. Usando placeholders hasta que Nano Banana esté disponible."
                }
              </p>
              <div className="mt-2 space-y-1">
                <p className="text-sm">
                  <strong>Estado Nano Banana:</strong> {hasImageModel ? "✅ Gemini 2.5 Flash Image Preview" : "⏳ Pendiente de disponibilidad"}
                </p>
                {hasImageModel && (
                  <p className="text-xs text-green-700">
                    ✨ Generación real de imágenes activa • Prompts optimizados • Validación automática • Guardado local
                  </p>
                )}
              </div>
            </AlertDescription>
          </Alert>
        )}

        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowDetails(!showDetails)}
        >
          {showDetails ? 'Ocultar' : 'Mostrar'} detalles técnicos
        </Button>

        {showDetails && (
          <div className="bg-gray-50 p-4 rounded-lg text-sm">
            <h4 className="font-semibold mb-2">Detalles de configuración:</h4>
            <ul className="space-y-1">
              <li className="flex justify-between">
                <span>API Key presente:</span>
                <Badge variant={hasAPIKey ? 'default' : 'destructive'}>
                  {hasAPIKey ? 'Sí' : 'No'}
                </Badge>
              </li>
              <li className="flex justify-between">
                <span>Longitud API Key:</span>
                <span>{apiKeyLength} caracteres</span>
              </li>
              <li className="flex justify-between">
                <span>Modelo de texto:</span>
                <Badge variant={hasTextModel ? 'default' : 'destructive'}>
                  {hasTextModel ? 'Inicializado' : 'Error'}
                </Badge>
              </li>
              <li className="flex justify-between">
                <span>Modelo de imagen:</span>
                <Badge variant={hasImageModel ? 'default' : 'destructive'}>
                  {hasImageModel ? 'Inicializado' : 'Error'}
                </Badge>
              </li>
            </ul>
          </div>
        )}

        <div className="bg-blue-50 p-4 rounded-lg">
          <h4 className="font-semibold text-blue-800 mb-2">🍌 Acerca de Nano Banana</h4>
          <div className="space-y-2 text-blue-700 text-sm">
            <p>
              <strong>Nano Banana</strong> es el nombre en clave de Gemini 2.5 Flash Image, el modelo de generación de imágenes más avanzado de Google.
            </p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>🎨 Generación de imágenes realistas desde texto</li>
              <li>👥 Consistencia de personajes y estilo</li>
              <li>🔄 Ediciones conversacionales inteligentes</li>
              <li>🏷️ Marcas de agua SynthID automáticas</li>
            </ul>
            <div className="mt-3 p-2 bg-blue-100 rounded">
              <p className="text-xs">
                <strong>Estado actual:</strong> {hasImageModel 
                  ? "🍌 Nano Banana (gemini-2.5-flash-image-preview) configurado y listo para generar imágenes reales de moda profesionales con calidad de catálogo."
                  : "Usando fallback con placeholders. Configura API key para activar Nano Banana."
                }
              </p>
              {hasImageModel && (
                <div className="mt-2 text-xs space-y-1">
                  <p>🎯 <strong>Modelo:</strong> gemini-2.5-flash-image-preview</p>
                  <p>⚙️ <strong>Config:</strong> Temperature 0.7, TopP 0.8, MaxTokens 8192</p>
                  <p>🔍 <strong>Validación:</strong> MIME types, tamaño, formato base64</p>
                  <p>💾 <strong>Guardado:</strong> Archivos JPG locales con metadata</p>
                </div>
              )}
            </div>
          </div>
          <div className="mt-3">
            <a 
              href="https://developers.googleblog.com/es/introducing-gemini-25-flash-image/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline inline-flex items-center gap-1 text-sm"
            >
              Documentación oficial <ExternalLink className="h-3 w-3" />
            </a>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
