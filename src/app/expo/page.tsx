'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { ChevronLeft, ChevronRight, Play, Sparkles, Shirt, User, Palette, Video, Zap, Globe, Target } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

// Componente de fondo decorativo animado
function AnimatedBackground() {
  const colors = ['#df090d', '#1a378d', '#f8e641', '#f1a043', '#13a235'];
  
  // Valores predefinidos para evitar cambios en cada render
  const circles = [
    { size: 80, left: 10, top: 15, duration: 18, delay: 0 },
    { size: 60, left: 85, top: 20, duration: 20, delay: 1 },
    { size: 100, left: 20, top: 60, duration: 22, delay: 2 },
    { size: 70, left: 75, top: 70, duration: 19, delay: 0.5 },
    { size: 90, left: 5, top: 80, duration: 21, delay: 1.5 },
    { size: 55, left: 90, top: 10, duration: 17, delay: 2.5 },
    { size: 75, left: 50, top: 30, duration: 23, delay: 0.8 },
    { size: 65, left: 30, top: 85, duration: 18, delay: 1.2 },
    { size: 85, left: 70, top: 45, duration: 20, delay: 2.2 },
    { size: 58, left: 15, top: 50, duration: 19, delay: 0.3 },
    { size: 95, left: 60, top: 5, duration: 21, delay: 1.8 },
    { size: 68, left: 40, top: 95, duration: 17, delay: 2.8 },
  ];
  
  const stars = [
    { size: 30, left: 25, top: 25, duration: 12, delay: 0 },
    { size: 35, left: 80, top: 30, duration: 14, delay: 1 },
    { size: 28, left: 15, top: 70, duration: 13, delay: 2 },
    { size: 32, left: 70, top: 75, duration: 15, delay: 0.5 },
    { size: 29, left: 45, top: 15, duration: 11, delay: 1.5 },
    { size: 33, left: 55, top: 60, duration: 16, delay: 2.5 },
    { size: 31, left: 35, top: 40, duration: 14, delay: 0.8 },
    { size: 27, left: 90, top: 55, duration: 12, delay: 1.2 },
  ];
  
  const shapes = [
    { size: 50, left: 8, top: 35, duration: 15, delay: 0, rotation: 45 },
    { size: 45, left: 88, top: 40, duration: 16, delay: 1, rotation: 120 },
    { size: 55, left: 12, top: 75, duration: 14, delay: 2, rotation: 200 },
    { size: 48, left: 82, top: 80, duration: 17, delay: 0.5, rotation: 300 },
    { size: 52, left: 50, top: 10, duration: 13, delay: 1.5, rotation: 60 },
    { size: 46, left: 65, top: 90, duration: 18, delay: 2.5, rotation: 240 },
  ];
  
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" style={{ zIndex: 1 }}>
      {/* Círculos flotantes */}
      {circles.map((circle, i) => {
        const color = colors[i % colors.length];
        return (
          <div
            key={`circle-${i}`}
            className="absolute rounded-full"
            style={{
              width: `${circle.size}px`,
              height: `${circle.size}px`,
              backgroundColor: color,
              left: `${circle.left}%`,
              top: `${circle.top}%`,
              opacity: 0.4,
              animation: `float ${circle.duration}s ease-in-out infinite`,
              animationDelay: `${circle.delay}s`,
            }}
          />
        );
      })}
      
      {/* Estrellas */}
      {stars.map((star, i) => {
        const color = colors[i % colors.length];
        return (
          <div
            key={`star-${i}`}
            className="absolute"
            style={{
              width: `${star.size}px`,
              height: `${star.size}px`,
              left: `${star.left}%`,
              top: `${star.top}%`,
              opacity: 0.35,
              animation: `twinkle ${star.duration}s ease-in-out infinite`,
              animationDelay: `${star.delay}s`,
            }}
          >
            <svg viewBox="0 0 24 24" fill={color} className="w-full h-full">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
            </svg>
          </div>
        );
      })}
      
      {/* Formas geométricas */}
      {shapes.map((shape, i) => {
        const color = colors[i % colors.length];
        return (
          <div
            key={`shape-${i}`}
            className="absolute"
            style={{
              width: `${shape.size}px`,
              height: `${shape.size}px`,
              backgroundColor: color,
              left: `${shape.left}%`,
              top: `${shape.top}%`,
              opacity: 0.3,
              transform: `rotate(${shape.rotation}deg)`,
              clipPath: i % 3 === 0 
                ? 'polygon(50% 0%, 0% 100%, 100% 100%)' 
                : i % 3 === 1
                ? 'polygon(25% 0%, 100% 0%, 75% 100%, 0% 100%)'
                : 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)',
              animation: `float ${shape.duration}s ease-in-out infinite`,
              animationDelay: `${shape.delay}s`,
            }}
          />
        );
      })}
    </div>
  );
}

type Slide = {
  id: number;
  title: string;
  content: React.ReactNode;
  bgGradient?: string;
};

export default function ExpoPresentation() {
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides: Slide[] = [
    {
      id: 0,
      title: 'Bienvenida',
      bgGradient: 'bg-white',
      content: (
        <div className="flex flex-col items-center justify-center h-full text-center space-y-8">
          <div className="relative">
            <Image
              src="/logo_cicibet.png"
              alt="cicibet"
              width={400}
              height={200}
              className="h-auto w-auto"
              priority
            />
          </div>
          <h2 className="text-6xl font-bold text-gray-800 mb-4">
            Cicibet Studio AI
          </h2>
          <p className="text-3xl text-gray-600 font-handwriting italic">
            Donde la moda infantil se encuentra con la magia de la IA
          </p>
          <div className="mt-8 text-gray-500">
            <p className="text-xl">Presiona las flechas o usa ← → para navegar</p>
          </div>
        </div>
      ),
    },
    {
      id: 1,
      title: 'El Desafío',
      bgGradient: 'bg-white',
      content: (
        <div className="space-y-8">
          <h2 className="text-6xl font-bold text-gray-800 mb-4 text-center">
            El Desafío
          </h2>
          <p className="text-4xl text-center text-gray-700 mb-8 font-semibold">
            &quot;La brecha entre la imaginación y la realidad en el e-commerce infantil&quot;
          </p>
          <div className="grid grid-cols-2 gap-6">
            <Card className="bg-red-200 border-2 border-red-300">
              <CardContent className="p-6">
                <User className="h-14 w-14 text-red-600 mb-4" />
                <h3 className="text-3xl font-bold text-gray-800 mb-3">Para el Cliente (Padres)</h3>
                <ul className="text-gray-700 text-xl space-y-2">
                  <li>• Comprar ropa online para bebés es difícil</li>
                  <li>• Las fotos estáticas no transmiten emoción</li>
                  <li>• Imposible saber &quot;cómo le quedaría&quot; realmente</li>
                  <li>• Sin comprarlo primero, no hay certeza</li>
                </ul>
              </CardContent>
            </Card>
            <Card className="bg-blue-200 border-2 border-blue-300">
              <CardContent className="p-6">
                <Palette className="h-14 w-14 text-blue-600 mb-4" />
                <h3 className="text-3xl font-bold text-gray-800 mb-3">Para Cicibet (Diseñadores)</h3>
                <ul className="text-gray-700 text-xl space-y-2">
                  <li>• Sesiones de fotos con bebés son costosas</li>
                  <li>• Logísticamente complejas (bebés lloran, se mueven)</li>
                  <li>• Prototipar nuevas colecciones toma semanas</li>
                  <li>• Tiempos de espera largos para ver resultados</li>
                </ul>
              </CardContent>
            </Card>
          </div>
          <Card className="bg-yellow-200 border-2 border-yellow-300 mt-6">
            <CardContent className="p-6">
              <h3 className="text-3xl font-bold text-gray-800 mb-3 text-center">La Fricción</h3>
              <p className="text-gray-700 text-2xl text-center">
                Falta de personalización y tiempos de espera largos para ver resultados visuales
              </p>
            </CardContent>
          </Card>
        </div>
      ),
    },
    {
      id: 2,
      title: 'La Solución',
      bgGradient: 'bg-white',
      content: (
        <div className="space-y-8">
          <h2 className="text-6xl font-bold text-gray-800 mb-4 text-center">
            La Solución
          </h2>
          <div className="text-center mb-8">
            <h3 className="text-5xl font-bold text-gray-800 mb-4">
              Cicibet Studio AI
            </h3>
            <p className="text-3xl text-gray-700 mb-6">
              Una plataforma integral de Virtual Try-On y generación de video publicitario impulsada por IA
            </p>
          </div>
          <div className="grid grid-cols-2 gap-6">
            <Card className="bg-green-200 border-2 border-green-300">
              <CardContent className="p-6">
                <Sparkles className="h-14 w-14 text-green-600 mb-4" />
                <h3 className="text-3xl font-bold text-gray-800 mb-2">La Promesa</h3>
                <p className="text-gray-700 text-xl">
                  Democratizamos la producción de moda de alta calidad
                </p>
              </CardContent>
            </Card>
            <Card className="bg-yellow-200 border-2 border-yellow-300">
              <CardContent className="p-6">
                <Zap className="h-14 w-14 text-yellow-600 mb-4" />
                <h3 className="text-3xl font-bold text-gray-800 mb-2">El Resultado</h3>
                <p className="text-gray-700 text-xl">
                  Convertimos una foto plana en una experiencia viva en segundos
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      ),
    },
    {
      id: 3,
      title: 'La Magia de los 30 Segundos',
      bgGradient: 'bg-white',
      content: (
        <div className="space-y-8">
          <h2 className="text-6xl font-bold text-gray-800 mb-4 text-center">
            La Magia de los 30 Segundos
          </h2>
          <p className="text-3xl text-center text-gray-700 mb-8">
            En el tiempo que te toma atar las agujetas de un zapato, nosotros creamos una campaña completa
          </p>
          <div className="space-y-4">
            <Card className="bg-red-200 border-2 border-red-300">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="text-5xl font-bold text-red-600">0-5s</div>
                  <div>
                    <h3 className="text-3xl font-bold text-gray-800 mb-2">Carga la Prenda</h3>
                    <p className="text-gray-700 text-xl">
                      Sube foto plana o genérala con texto
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-blue-200 border-2 border-blue-300">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="text-5xl font-bold text-blue-600">5-10s</div>
                  <div>
                    <h3 className="text-3xl font-bold text-gray-800 mb-2">Carga el Bebé</h3>
                    <p className="text-gray-700 text-xl">
                      Sube foto del bebé (cliente real) o selecciona modelo AI de Cicibet
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-yellow-200 border-2 border-yellow-300">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="text-5xl font-bold text-yellow-600">10-20s</div>
                  <div>
                    <h3 className="text-3xl font-bold text-gray-800 mb-2">Fusión Inteligente (Try-On)</h3>
                    <p className="text-gray-700 text-xl">
                      La IA ajusta la prenda al cuerpo del bebé respetando luces y sombras
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-green-200 border-2 border-green-300">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="text-5xl font-bold text-green-600">20-30s</div>
                  <div>
                    <h3 className="text-3xl font-bold text-gray-800 mb-2">Generación de Video</h3>
                    <p className="text-gray-700 text-xl">
                      La imagen cobra vida; el bebé sonríe, se mueve y la ropa fluye naturalmente
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          <Card className="bg-orange-200 border-2 border-orange-300 mt-6">
            <CardContent className="p-6 text-center">
              <h3 className="text-4xl font-bold text-gray-800 mb-2">¡Resultado Final!</h3>
              <p className="text-gray-700 text-2xl">
                Listo para compartir en Instagram/TikTok o para aprobar un diseño
              </p>
            </CardContent>
          </Card>
        </div>
      ),
    },
    {
      id: 4,
      title: 'Funcionalidades Clave',
      bgGradient: 'bg-white',
      content: (
        <div className="space-y-8">
          <h2 className="text-6xl font-bold text-gray-800 mb-8 text-center">
            Funcionalidades Clave
          </h2>
          <div className="grid grid-cols-2 gap-6">
            <Card className="bg-red-200 border-2 border-red-300">
              <CardContent className="p-6">
                <Palette className="h-14 w-14 text-red-600 mb-4" />
                <h3 className="text-3xl font-bold text-gray-800 mb-2">🎨 Smart Catalog Gen</h3>
                <p className="text-gray-700 text-xl">
                  Sube fotos de prendas planas o dibuja bocetos y la IA genera la textura realista
                </p>
              </CardContent>
            </Card>
            <Card className="bg-blue-200 border-2 border-blue-300">
              <CardContent className="p-6">
                <User className="h-14 w-14 text-blue-600 mb-4" />
                <h3 className="text-3xl font-bold text-gray-800 mb-2">👶 Baby Model Hub</h3>
                <p className="text-gray-700 text-xl">
                  Sube la foto de tu bebé o elige entre diversos modelos inclusivos de la base de datos de Cicibet
                </p>
              </CardContent>
            </Card>
            <Card className="bg-yellow-200 border-2 border-yellow-300">
              <CardContent className="p-6">
                <Sparkles className="h-14 w-14 text-yellow-600 mb-4" />
                <h3 className="text-3xl font-bold text-gray-800 mb-2">✨ Magic Try-On</h3>
                <p className="text-gray-700 text-xl">
                  Algoritmos de deformación y fusión que visten al bebé digitalmente con realismo fotográfico
                </p>
              </CardContent>
            </Card>
            <Card className="bg-green-200 border-2 border-green-300">
              <CardContent className="p-6">
                <Video className="h-14 w-14 text-green-600 mb-4" />
                <h3 className="text-3xl font-bold text-gray-800 mb-2">🎥 Ad-Maker Video</h3>
                <p className="text-gray-700 text-xl">
                  Convierte el resultado estático en un video publicitario corto (6s - 10s) listo para redes sociales
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      ),
    },
    {
      id: 5,
      title: 'Target Audience',
      bgGradient: 'bg-white',
      content: (
        <div className="space-y-8">
          <h2 className="text-6xl font-bold text-gray-800 mb-8 text-center">
            ¿Para quién es esto?
          </h2>
          <div className="grid grid-cols-2 gap-6">
            <Card className="bg-red-200 border-2 border-red-300">
              <CardContent className="p-6">
                <User className="h-14 w-14 text-red-600 mb-4" />
                <h3 className="text-3xl font-bold text-gray-800 mb-3">A. El Cliente Final (B2C)</h3>
                <p className="text-gray-700 text-xl font-semibold mb-3">Experiencia Emocional</p>
                <div className="space-y-2">
                  <p className="text-gray-700 text-lg"><strong>Perfil:</strong> Madres y padres tech-savvy que aman compartir fotos de sus bebés</p>
                  <p className="text-gray-700 text-lg"><strong>Uso:</strong> Suben la foto de su hijo, prueban todo el catálogo de Cicibet y compran lo que mejor le queda</p>
                  <p className="text-gray-700 text-lg"><strong>Valor:</strong> &quot;Ve a tu hijo vestido con Cicibet antes de que llegue el paquete&quot;</p>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-blue-200 border-2 border-blue-300">
              <CardContent className="p-6">
                <Palette className="h-14 w-14 text-blue-600 mb-4" />
                <h3 className="text-3xl font-bold text-gray-800 mb-3">B. El Equipo Cicibet (B2B)</h3>
                <p className="text-gray-700 text-xl font-semibold mb-3">Eficiencia Operativa</p>
                <div className="space-y-2">
                  <p className="text-gray-700 text-lg"><strong>Perfil:</strong> Diseñadores de moda y equipo de Marketing</p>
                  <p className="text-gray-700 text-lg"><strong>Uso:</strong> Prueban estampados y cortes en modelos virtuales sin coser una sola prenda física</p>
                  <p className="text-gray-700 text-lg"><strong>Valor:</strong> Reducción de costos de producción en un 80% y Time-to-Market acelerado</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      ),
    },
    {
      id: 6,
      title: 'Diferenciación',
      bgGradient: 'bg-white',
      content: (
        <div className="space-y-8">
          <h2 className="text-6xl font-bold text-gray-800 mb-4 text-center">
            Diferenciación y Ventaja Competitiva
          </h2>
          <p className="text-4xl text-center text-gray-700 mb-8 font-semibold">
            &quot;¿Por qué Cicibet Studio AI y no otros?&quot;
          </p>
          <div className="grid grid-cols-2 gap-6">
            <Card className="bg-red-200 border-2 border-red-300">
              <CardContent className="p-6">
                <Target className="h-14 w-14 text-red-600 mb-4" />
                <h3 className="text-3xl font-bold text-gray-800 mb-2">Enfoque en Niños</h3>
                <p className="text-gray-700 text-xl">
                  <strong>Niche Mastery:</strong> La mayoría de IAs de try-on están entrenadas con adultos. Nuestros modelos entienden la anatomía y proporciones de bebés (que es muy difícil de lograr)
                </p>
              </CardContent>
            </Card>
            <Card className="bg-blue-200 border-2 border-blue-300">
              <CardContent className="p-6">
                <Video className="h-14 w-14 text-blue-600 mb-4" />
                <h3 className="text-3xl font-bold text-gray-800 mb-2">Video Commerce</h3>
                <p className="text-gray-700 text-xl">
                  No nos quedamos en la foto. Entregamos video, que es el formato rey en redes sociales hoy
                </p>
              </CardContent>
            </Card>
            <Card className="bg-yellow-200 border-2 border-yellow-300">
              <CardContent className="p-6">
                <Sparkles className="h-14 w-14 text-yellow-600 mb-4" />
                <h3 className="text-3xl font-bold text-gray-800 mb-2">Hiper-Personalización</h3>
                <p className="text-gray-700 text-xl">
                  No es &quot;un bebé cualquiera&quot;, es TU bebé usando la marca. Eso dispara la tasa de conversión
                </p>
              </CardContent>
            </Card>
            <Card className="bg-green-200 border-2 border-green-300">
              <CardContent className="p-6">
                <Zap className="h-14 w-14 text-green-600 mb-4" />
                <h3 className="text-3xl font-bold text-gray-800 mb-2">Velocidad Extrema</h3>
                <p className="text-gray-700 text-xl">
                  De foto plana a video publicitario en 30 segundos. Sin esperas, sin complicaciones
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      ),
    },
    {
      id: 7,
      title: 'Experiencia del Cliente',
      bgGradient: 'bg-white',
      content: (
        <div className="space-y-8">
          <h2 className="text-6xl font-bold text-gray-800 mb-4 text-center">
            Experiencia del Cliente (CX)
          </h2>
          <p className="text-3xl text-center text-gray-700 mb-8">
            Todo gira en torno a reducir la incertidumbre y aumentar la emoción
          </p>
          <div className="grid grid-cols-3 gap-6">
            <Card className="bg-red-200 border-2 border-red-300">
              <CardContent className="p-6">
                <Play className="h-14 w-14 text-red-600 mb-4" />
                <h3 className="text-3xl font-bold text-gray-800 mb-2">Gamificación</h3>
                <p className="text-gray-700 text-xl">
                  Convertimos la compra en un juego de &quot;vestir al bebé&quot;
                </p>
              </CardContent>
            </Card>
            <Card className="bg-blue-200 border-2 border-blue-300">
              <CardContent className="p-6">
                <Globe className="h-14 w-14 text-blue-600 mb-4" />
                <h3 className="text-3xl font-bold text-gray-800 mb-2">Shareability</h3>
                <p className="text-gray-700 text-xl">
                  El botón &quot;Compartir video con la Abuela&quot; crea viralidad orgánica para Cicibet
                </p>
              </CardContent>
            </Card>
            <Card className="bg-yellow-200 border-2 border-yellow-300">
              <CardContent className="p-6">
                <Target className="h-14 w-14 text-yellow-600 mb-4" />
                <h3 className="text-3xl font-bold text-gray-800 mb-2">Fidelización</h3>
                <p className="text-gray-700 text-xl">
                  Los padres regresan a la app no solo a comprar, sino a jugar con los nuevos estilos de la temporada
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      ),
    },
    {
      id: 8,
      title: 'Visual de Impacto',
      bgGradient: 'bg-white',
      content: (
        <div className="flex flex-col items-center justify-center h-full text-center space-y-8">
          <div className="grid grid-cols-3 gap-8 items-center w-full max-w-6xl">
            <div className="space-y-4">
              <div className="bg-gray-100 rounded-lg p-6 border-2 border-gray-300">
                <Shirt className="h-20 w-20 text-gray-400 mx-auto mb-4" />
                <p className="text-2xl font-bold text-gray-700">Tela Plana</p>
                <p className="text-xl text-gray-600 mt-2">Foto Casera</p>
              </div>
            </div>
            <div className="flex flex-col items-center">
              <div className="text-7xl font-bold text-orange-500 mb-4">→</div>
              <div className="bg-yellow-200 border-2 border-yellow-400 rounded-lg px-8 py-4">
                <p className="text-4xl font-bold text-gray-800">30</p>
                <p className="text-2xl font-bold text-gray-800">SEGUNDOS</p>
              </div>
            </div>
            <div className="space-y-4">
              <div className="bg-green-100 rounded-lg p-6 border-2 border-green-300">
                <Video className="h-20 w-20 text-green-600 mx-auto mb-4" />
                <p className="text-2xl font-bold text-gray-700">Video Cinemático</p>
                <p className="text-xl text-gray-600 mt-2">Bebé Sonriendo</p>
              </div>
            </div>
          </div>
          <div className="mt-8 space-y-4">
            <h2 className="text-6xl font-bold text-gray-800">
              Cicibet Studio AI
            </h2>
            <p className="text-4xl text-gray-700 font-semibold">
              Innovación que se siente. Moda que emociona.
            </p>
          </div>
        </div>
      ),
    },
  ];

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  };

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        nextSlide();
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        prevSlide();
      } else if (e.key === 'f' || e.key === 'F') {
        toggleFullscreen();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="fixed inset-0 bg-white overflow-hidden" style={{ fontFamily: 'var(--font-poppins), sans-serif' }}>
      {/* Slide Container */}
      <div
        className="h-full w-full transition-all duration-500 ease-in-out flex items-center justify-center p-8 relative"
        style={{ zIndex: 2 }}
      >
        {/* Fondo decorativo animado - dentro del contenedor */}
        <AnimatedBackground />
        
        <div className="max-w-7xl w-full h-full flex flex-col relative z-10">
          {/* Slide Content */}
          <div className="flex-1 flex items-center justify-center">
            {slides[currentSlide].content}
          </div>

          {/* Navigation Controls */}
          <div className="flex items-center justify-between mt-8">
            <Button
              onClick={prevSlide}
              variant="outline"
              size="lg"
              className="bg-red-200 border-2 border-red-300 text-gray-800 hover:bg-red-300 text-lg px-6 py-3"
            >
              <ChevronLeft className="h-7 w-7 mr-2" />
              Anterior
            </Button>

            {/* Slide Indicators */}
            <div className="flex gap-2">
              {slides.map((_, index) => (
                <button
                  key={index}
                  onClick={() => goToSlide(index)}
                  className={`h-3 rounded-full transition-all ${
                    index === currentSlide
                      ? 'w-8 bg-blue-500'
                      : 'w-3 bg-gray-300 hover:bg-gray-400'
                  }`}
                  aria-label={`Ir a slide ${index + 1}`}
                />
              ))}
            </div>

            <Button
              onClick={nextSlide}
              variant="outline"
              size="lg"
              className="bg-blue-200 border-2 border-blue-300 text-gray-800 hover:bg-blue-300 text-lg px-6 py-3"
            >
              Siguiente
              <ChevronRight className="h-7 w-7 ml-2" />
            </Button>
          </div>

          {/* Slide Counter */}
          <div className="text-center mt-4 text-gray-600">
            <p className="text-xl">
              {currentSlide + 1} / {slides.length}
            </p>
            <p className="text-base mt-2">Presiona F para pantalla completa</p>
          </div>
        </div>
      </div>
    </div>
  );
}

