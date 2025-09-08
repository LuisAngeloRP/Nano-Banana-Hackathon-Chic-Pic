'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { CheckCircle, XCircle, AlertTriangle, RefreshCw, ExternalLink } from 'lucide-react';
import { getAPIStatus } from '@/lib/gemini';

export default function APIStatus() {
  const [status, setStatus] = useState<{hasAPIKey: boolean, hasTextModel: boolean, hasImageModel: boolean, apiKeyLength: number} | null>(null);
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
    if (hasAPIKey && hasTextModel) return 'Configured';
    if (hasAPIKey) return 'Partial configuration';
    return 'Not configured';
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
          Nano Banana API Status
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
              <strong>API Key not configured</strong>
              <p className="mt-2">To use Nano Banana (Gemini 2.5 Flash Image), you need to configure your API key:</p>
              <ol className="list-decimal list-inside mt-2 space-y-1 text-sm">
                <li>Go to <a href="https://aistudio.google.com/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline inline-flex items-center gap-1">Google AI Studio <ExternalLink className="h-3 w-3" /></a></li>
                <li>Create an API key for Gemini</li>
                <li>Create a <code className="bg-gray-100 px-1 rounded">.env.local</code> file in the project root</li>
                <li>Add: <code className="bg-gray-100 px-1 rounded">GOOGLE_API_KEY=your_api_key_here</code></li>
                <li>Restart the development server</li>
              </ol>
            </AlertDescription>
          </Alert>
        )}

        {hasAPIKey && !hasTextModel && (
          <Alert className="border-yellow-200 bg-yellow-50">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <strong>Initialization error</strong>
              <p className="mt-2">The API key is configured but there&apos;s a problem with model initialization. Verify that:</p>
              <ul className="list-disc list-inside mt-2 space-y-1 text-sm">
                <li>The API key is valid and active</li>
                <li>You have access to Gemini API</li>
                <li>There are no extra characters or spaces in the API key</li>
              </ul>
            </AlertDescription>
          </Alert>
        )}

        {hasAPIKey && hasTextModel && (
          <Alert className="border-green-200 bg-green-50">
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>
              <strong>API configured correctly!</strong>
              <p className="mt-2">
                {hasImageModel 
                  ? "🍌 Nano Banana (Gemini 2.5 Flash Image Preview) is configured to generate real high-quality images."
                  : "API configured. Using placeholders until Nano Banana is available."
                }
              </p>
              <div className="mt-2 space-y-1">
                <p className="text-sm">
                  <strong>Nano Banana Status:</strong> {hasImageModel ? "✅ Gemini 2.5 Flash Image Preview" : "⏳ Pending availability"}
                </p>
                {hasImageModel && (
                  <p className="text-xs text-green-700">
                    ✨ Real image generation active • Optimized prompts • Automatic validation • Local storage
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
          {showDetails ? 'Hide' : 'Show'} technical details
        </Button>

        {showDetails && (
          <div className="bg-gray-50 p-4 rounded-lg text-sm">
            <h4 className="font-semibold mb-2">Configuration details:</h4>
            <ul className="space-y-1">
              <li className="flex justify-between">
                <span>API Key present:</span>
                <Badge variant={hasAPIKey ? 'default' : 'destructive'}>
                  {hasAPIKey ? 'Yes' : 'No'}
                </Badge>
              </li>
              <li className="flex justify-between">
                <span>API Key length:</span>
                <span>{apiKeyLength} characters</span>
              </li>
              <li className="flex justify-between">
                <span>Text model:</span>
                <Badge variant={hasTextModel ? 'default' : 'destructive'}>
                  {hasTextModel ? 'Initialized' : 'Error'}
                </Badge>
              </li>
              <li className="flex justify-between">
                <span>Image model:</span>
                <Badge variant={hasImageModel ? 'default' : 'destructive'}>
                  {hasImageModel ? 'Initialized' : 'Error'}
                </Badge>
              </li>
            </ul>
          </div>
        )}

        <div className="bg-blue-50 p-4 rounded-lg">
          <h4 className="font-semibold text-blue-800 mb-2">🍌 About Nano Banana</h4>
          <div className="space-y-2 text-blue-700 text-sm">
            <p>
              <strong>Nano Banana</strong> is the codename for Gemini 2.5 Flash Image, Google&apos;s most advanced image generation model.
            </p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>🎨 Realistic image generation from text</li>
              <li>👥 Character and style consistency</li>
              <li>🔄 Intelligent conversational editing</li>
              <li>🏷️ Automatic SynthID watermarks</li>
            </ul>
            <div className="mt-3 p-2 bg-blue-100 rounded">
              <p className="text-xs">
                <strong>Current status:</strong> {hasImageModel 
                  ? "🍌 Nano Banana (gemini-2.5-flash-image-preview) configured and ready to generate real professional fashion images with catalog quality."
                  : "Using fallback with placeholders. Configure API key to activate Nano Banana."
                }
              </p>
              {hasImageModel && (
                <div className="mt-2 text-xs space-y-1">
                  <p>🎯 <strong>Model:</strong> gemini-2.5-flash-image-preview</p>
                  <p>⚙️ <strong>Config:</strong> Temperature 0.7, TopP 0.8, MaxTokens 8192</p>
                  <p>🔍 <strong>Validation:</strong> MIME types, size, base64 format</p>
                  <p>💾 <strong>Storage:</strong> Local JPG files with metadata</p>
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
              Official documentation <ExternalLink className="h-3 w-3" />
            </a>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
