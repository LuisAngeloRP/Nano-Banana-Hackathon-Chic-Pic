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
      // Use Supabase Storage statistics instead of the obsolete API
      const { SupabaseStorageAdapter } = await import('@/lib/storage.supabase');
      const data = await SupabaseStorageAdapter.getStats();
      
      setStats({
        garments: data.garments,
        models: data.models,
        looks: data.looks,
        total: data.garments + data.models + data.looks,
        lastUpdated: new Date().toLocaleString()
      });
    } catch (error) {
      console.error('Error loading statistics:', error);
      // Fallback to empty statistics in case of error
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

  const openStorageDashboard = () => {
    // Open the Supabase Storage dashboard
    alert('Images are stored in Supabase Storage.\n\nYou can view and manage images from the Supabase Dashboard in the Storage section.');
  };

  const cleanOldImages = async () => {
    // Function disabled - images in Supabase Storage are managed from the dashboard
    alert('Image cleanup is performed from the Supabase Storage Dashboard.\n\nThis function is not available in the web interface for security reasons.');
  };

  if (!stats) {
    return null;
  }

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Image className="h-5 w-5" />
          Local Image Storage
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
            <div className="text-sm text-pink-700">Garments</div>
          </div>
          <div className="text-center p-3 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">{stats.models}</div>
            <div className="text-sm text-blue-700">Models</div>
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
            <h4 className="font-semibold text-green-800">💾 Active Local Storage</h4>
            <p className="text-sm text-green-700">
              Images are saved in: <code className="bg-green-100 px-1 rounded">public/generated-images/</code>
            </p>
            <p className="text-xs text-green-600 mt-1">
              Last updated: {stats.lastUpdated}
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={openStorageDashboard}>
              <FolderOpen className="h-4 w-4 mr-2" />
              View Folder
            </Button>
            {stats.total > 0 && (
              <Button variant="outline" size="sm" onClick={cleanOldImages} disabled={isLoading}>
                <Trash2 className="h-4 w-4 mr-2" />
                Clean
              </Button>
            )}
          </div>
        </div>

        <div className="bg-blue-50 p-4 rounded-lg">
          <h4 className="font-semibold text-blue-800 mb-2">ℹ️ System Information</h4>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• <strong>Format:</strong> Web-optimized JPG</li>
            <li>• <strong>Naming:</strong> type-description-timestamp.jpg</li>
            <li>• <strong>Access:</strong> Available via /generated-images/[filename]</li>
            <li>• <strong>Cleanup:</strong> Automatic after 7 days (configurable)</li>
          </ul>
        </div>

        <div className="flex gap-2">
          <Badge variant="outline" className="text-xs">
            📁 Directory: public/generated-images/
          </Badge>
          <Badge variant="outline" className="text-xs">
            🔄 Auto-refresh
          </Badge>
          <Badge variant="outline" className="text-xs">
            🗂️ Organized by type
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
}
