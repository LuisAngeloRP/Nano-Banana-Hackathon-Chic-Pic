import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Shirt, User, Palette, Sparkles, Video } from 'lucide-react';
import GarmentGenerator from '@/components/GarmentGenerator';
import GarmentWardrobe from '@/components/GarmentWardrobe';
import ModelGenerator from '@/components/ModelGenerator';
import ModelCatalog from '@/components/ModelCatalog';
import FashionStylist from '@/components/FashionStylist';
import VideoGenerator from '@/components/VideoGenerator';

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-red-50 via-yellow-50 to-blue-50">
      <div className="container mx-auto py-8 px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 tracking-wide">
            <span className="text-red-500">c</span>
            <span className="text-blue-500">i</span>
            <span className="text-yellow-500">c</span>
            <span className="text-orange-500">i</span>
            <span className="text-green-500">b</span>
            <span className="text-blue-500">e</span>
            <span className="text-red-500">t</span>
          </h1>
          <p className="text-xl text-blue-600 font-handwriting italic">
            Moda Para Chicos y Chiquititos....!
          </p>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="wardrobe" className="w-full">
          <TabsList className="grid w-full grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 mb-8">
            <TabsTrigger value="wardrobe" className="flex items-center gap-2">
              <Shirt className="h-4 w-4" />
              Armario
            </TabsTrigger>
            <TabsTrigger value="models" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              Modelos
            </TabsTrigger>
            <TabsTrigger value="stylist" className="flex items-center gap-2">
              <Palette className="h-4 w-4" />
              Estilista
            </TabsTrigger>
            <TabsTrigger value="videos" className="flex items-center gap-2">
              <Video className="h-4 w-4" />
              Videos
            </TabsTrigger>
            <TabsTrigger value="about" className="flex items-center gap-2">
              <Sparkles className="h-4 w-4" />
              Acerca de
            </TabsTrigger>
          </TabsList>

          {/* Armario de Prendas */}
          <TabsContent value="wardrobe" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
                  <Shirt className="h-6 w-6 text-red-500" />
                  Generar Prendas
                </h2>
                <GarmentGenerator />
              </div>
              <div>
                <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
                  <Shirt className="h-6 w-6 text-orange-500" />
                  Mi Armario
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
                  Generar Modelos
                </h2>
                <ModelGenerator />
              </div>
              <div>
                <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
                  <User className="h-6 w-6 text-green-500" />
                  Catálogo de Modelos
                </h2>
                <ModelCatalog />
              </div>
            </div>
          </TabsContent>

          {/* Estilista de Moda */}
          <TabsContent value="stylist">
            <div>
              <h2 className="text-2xl font-semibold mb-6 flex items-center gap-2">
                <Palette className="h-6 w-6 text-yellow-500" />
                Estilista de Moda con IA
              </h2>
              <FashionStylist />
            </div>
          </TabsContent>

          {/* Generador de Videos */}
          <TabsContent value="videos">
            <div>
              <h2 className="text-2xl font-semibold mb-6 flex items-center gap-2">
                <Video className="h-6 w-6 text-purple-500" />
                Generador de Videos Promocionales
              </h2>
              <VideoGenerator />
            </div>
          </TabsContent>

          {/* Acerca del Proyecto */}
          <TabsContent value="about">
            <div className="max-w-4xl mx-auto space-y-6">
              <Card className="overflow-hidden">
                <div className="bg-gradient-to-r from-red-500 via-yellow-500 to-blue-500 p-1">
                  <div className="bg-white rounded-lg">
                    <CardHeader className="text-center pb-4">
                      <div className="flex justify-center mb-4">
                        <div className="relative">
                          <div className="text-6xl font-bold">
                            <span className="text-red-500">c</span>
                            <span className="text-blue-500">i</span>
                            <span className="text-yellow-500">c</span>
                            <span className="text-orange-500">i</span>
                            <span className="text-green-500">b</span>
                            <span className="text-blue-500">e</span>
                            <span className="text-red-500">t</span>
                          </div>
                          <div className="absolute -top-2 -right-2 w-6 h-6 bg-yellow-500 rounded-full animate-pulse flex items-center justify-center">
                            <span className="text-white text-xs">✨</span>
                          </div>
                        </div>
                      </div>
                      <CardTitle className="text-3xl bg-gradient-to-r from-red-600 via-yellow-600 to-blue-600 bg-clip-text text-transparent">
                        cicibet
                      </CardTitle>
                      <p className="text-lg text-blue-600 font-handwriting italic mt-2">
                        Moda Para Chicos y Chiquititos....!
                      </p>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="text-center">
                        <p className="text-lg text-muted-foreground leading-relaxed">
                          cicibet es una plataforma revolucionaria que utiliza inteligencia artificial 
                          para crear moda infantil. Diseña prendas únicas para niños, niñas y bebés, 
                          genera modelos virtuales y combínalos para crear looks adorables y coloridos.
                        </p>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
                        <Card className="bg-gradient-to-br from-red-50 to-red-100 border-red-200 hover:shadow-lg transition-shadow">
                          <CardContent className="p-6 text-center">
                            <Shirt className="h-12 w-12 text-red-500 mx-auto mb-4" />
                            <h3 className="font-bold text-lg mb-2">Generación de Prendas</h3>
                            <p className="text-sm text-muted-foreground">
                              Describe la prenda ideal para niños y nuestra IA la creará con calidad profesional
                            </p>
                          </CardContent>
                        </Card>
                        
                        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 hover:shadow-lg transition-shadow">
                          <CardContent className="p-6 text-center">
                            <User className="h-12 w-12 text-blue-500 mx-auto mb-4" />
                            <h3 className="font-bold text-lg mb-2">Modelos Infantiles</h3>
                            <p className="text-sm text-muted-foreground">
                              Crea modelos de niños, niñas y bebés diversos e inclusivos
                            </p>
                          </CardContent>
                        </Card>
                        
                        <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200 hover:shadow-lg transition-shadow">
                          <CardContent className="p-6 text-center">
                            <Palette className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
                            <h3 className="font-bold text-lg mb-2">Estilismo con IA</h3>
                            <p className="text-sm text-muted-foreground">
                              Combina prendas y modelos para crear looks únicos y divertidos
                            </p>
                          </CardContent>
                        </Card>
                      </div>
                    </CardContent>
                  </div>
                </div>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-yellow-500" />
                    Potenciado por Nano Banana
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="bg-gradient-to-r from-yellow-50 to-orange-50 p-6 rounded-lg border border-yellow-200">
                    <div className="flex items-start gap-4">
                      <div className="text-4xl">🍌</div>
                      <div>
                        <h4 className="font-bold text-lg text-yellow-800 mb-2">
                          Nano Banana - Gemini 2.5 Flash Image Preview (Free Tier)
                        </h4>
                        <p className="text-yellow-700 mb-4">
                          Utilizamos la tecnología más avanzada de Google para generar imágenes 
                          de moda infantil con calidad profesional y realismo excepcional.
                        </p>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div className="flex items-center gap-2">
                            <span className="text-yellow-600">🎨</span>
                            <span>Imágenes realistas</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-yellow-600">👶</span>
                            <span>Moda infantil</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-yellow-600">🔄</span>
                            <span>Edición inteligente</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-yellow-600">⚡</span>
                            <span>Generación rápida</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Desarrolladores</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-muted-foreground">
                    ¿Eres desarrollador y quieres conocer los detalles técnicos, contribuir al proyecto 
                    o implementar tu propia versión?
                  </p>
                  
                  <div className="flex gap-4">
                    <a 
                      href="https://github.com/cuis/Nano-Banana-Hackathon-Chic-Pic" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
                    >
                      <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                      </svg>
                      Ver en GitHub
                    </a>
                    <a 
                      href="https://developers.googleblog.com/es/introducing-gemini-25-flash-image/" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <span className="text-lg">🍌</span>
                      Documentación Nano Banana
                    </a>
                  </div>
                  
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-muted-foreground">
                      <strong>Tecnologías:</strong> Next.js, TypeScript, React, Tailwind CSS, 
                      shadcn/ui, Supabase, Google Gemini AI
                    </p>
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