import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Shirt, User, Palette, Sparkles } from 'lucide-react';
import GarmentGenerator from '@/components/GarmentGenerator';
import GarmentWardrobe from '@/components/GarmentWardrobe';
import ModelGenerator from '@/components/ModelGenerator';
import ModelCatalog from '@/components/ModelCatalog';
import FashionStylist from '@/components/FashionStylist';
import APIStatus from '@/components/APIStatus';
import ImageStats from '@/components/ImageStats';
import CacheManager from '@/components/CacheManager';

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50">
      <div className="container mx-auto py-8 px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="relative">
              <Sparkles className="h-8 w-8 text-pink-500" />
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-purple-500 rounded-full animate-pulse"></div>
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
              Chic Pic
            </h1>
          </div>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            AI fashion system powered by Nano Banana. Generate garments, models and create unique looks 
            with artificial intelligence for professional catalogs.
          </p>
        </div>

        {/* Status and Cache Management */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          <APIStatus />
          <ImageStats />
          <CacheManager />
        </div>

        {/* Main Content */}
        <Tabs defaultValue="wardrobe" className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-8">
            <TabsTrigger value="wardrobe" className="flex items-center gap-2">
              <Shirt className="h-4 w-4" />
              Wardrobe
            </TabsTrigger>
            <TabsTrigger value="models" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              Models
            </TabsTrigger>
            <TabsTrigger value="stylist" className="flex items-center gap-2">
              <Palette className="h-4 w-4" />
              Stylist
            </TabsTrigger>
            <TabsTrigger value="about" className="flex items-center gap-2">
              <Sparkles className="h-4 w-4" />
              About
            </TabsTrigger>
          </TabsList>

          {/* Armario de Prendas */}
          <TabsContent value="wardrobe" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
                  <Shirt className="h-6 w-6 text-pink-500" />
                  Generate Garments
                </h2>
                <GarmentGenerator />
              </div>
              <div>
                <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
                  <Shirt className="h-6 w-6 text-purple-500" />
                  My Wardrobe
                </h2>
                <GarmentWardrobe />
              </div>
            </div>
          </TabsContent>

          {/* Catálogo de Modelos */}
          <TabsContent value="models" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
                  <User className="h-6 w-6 text-blue-500" />
                  Generate Models
                </h2>
                <ModelGenerator />
              </div>
              <div>
                <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
                  <User className="h-6 w-6 text-green-500" />
                  Model Catalog
                </h2>
                <ModelCatalog />
              </div>
            </div>
          </TabsContent>

          {/* Estilista de Moda */}
          <TabsContent value="stylist">
            <div>
              <h2 className="text-2xl font-semibold mb-6 flex items-center gap-2">
                <Palette className="h-6 w-6 text-orange-500" />
                AI Fashion Stylist
              </h2>
              <FashionStylist />
            </div>
          </TabsContent>

          {/* Acerca del Proyecto */}
          <TabsContent value="about">
            <div className="max-w-4xl mx-auto space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-yellow-500" />
                    About Chic Pic
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-muted-foreground">
                    Chic Pic is an innovative fashion system that uses artificial intelligence 
                    to revolutionize the way clothing is created and combined.
                  </p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                    <Card className="bg-pink-50 border-pink-200">
                      <CardContent className="p-4 text-center">
                        <Shirt className="h-8 w-8 text-pink-500 mx-auto mb-2" />
                        <h3 className="font-semibold">Garment Generation</h3>
                        <p className="text-sm text-muted-foreground">
                          Create unique garments with natural language descriptions
                        </p>
                      </CardContent>
                    </Card>
                    
                    <Card className="bg-blue-50 border-blue-200">
                      <CardContent className="p-4 text-center">
                        <User className="h-8 w-8 text-blue-500 mx-auto mb-2" />
                        <h3 className="font-semibold">Virtual Models</h3>
                        <p className="text-sm text-muted-foreground">
                          Generate diverse models to represent your brand
                        </p>
                      </CardContent>
                    </Card>
                    
                    <Card className="bg-purple-50 border-purple-200">
                      <CardContent className="p-4 text-center">
                        <Palette className="h-8 w-8 text-purple-500 mx-auto mb-2" />
                        <h3 className="font-semibold">AI Styling</h3>
                        <p className="text-sm text-muted-foreground">
                          Combine garments and models to create unique looks
                        </p>
                      </CardContent>
                    </Card>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Technologies Used</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center">
                      <div className="w-12 h-12 bg-black rounded-lg flex items-center justify-center mx-auto mb-2">
                        <span className="text-white font-bold text-xs">▲</span>
                      </div>
                      <p className="text-sm font-medium">Next.js</p>
                    </div>
                    <div className="text-center">
                      <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center mx-auto mb-2">
                        <span className="text-white font-bold text-xs">TS</span>
                      </div>
                      <p className="text-sm font-medium">TypeScript</p>
                    </div>
                    <div className="text-center">
                      <div className="w-12 h-12 bg-slate-900 rounded-lg flex items-center justify-center mx-auto mb-2">
                        <span className="text-white font-bold text-xs">UI</span>
                      </div>
                      <p className="text-sm font-medium">shadcn/ui</p>
                    </div>
                    <div className="text-center">
                      <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center mx-auto mb-2">
                        <span className="text-white font-bold text-xs">AI</span>
                      </div>
                      <p className="text-sm font-medium">Nano Banana</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Configuration</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <h4 className="font-semibold text-yellow-800 mb-2">⚠️ Required Configuration</h4>
                      <p className="text-sm text-yellow-700">
                        To use AI functionalities, you need to configure your Google Gemini API key:
                      </p>
                      <ol className="list-decimal list-inside text-sm text-yellow-700 mt-2 space-y-1">
                        <li>Create a <code className="bg-yellow-100 px-1 rounded">.env.local</code> file in the project root</li>
                        <li>Add your API key: <code className="bg-yellow-100 px-1 rounded">GOOGLE_API_KEY=your_api_key_here</code></li>
                        <li>Restart the development server</li>
                      </ol>
                    </div>
                    
                    <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                      <h4 className="font-semibold text-blue-800 mb-2">📝 Note</h4>
                      <p className="text-sm text-blue-700">
                        This version uses placeholders for generated images. 
                        In production, you would integrate with Google&apos;s real image generation API.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
        </div>
      </main>
  );
}