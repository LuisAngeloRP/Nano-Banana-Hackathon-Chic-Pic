import { NextRequest, NextResponse } from 'next/server';
import { getStoredImages, cleanOldImages } from '@/lib/imageStorage.server';

// GET /api/images - Obtener estadísticas de imágenes
export async function GET() {
  try {
    const storedImages = getStoredImages();
    const total = storedImages.garments.length + storedImages.models.length + storedImages.looks.length;
    
    return NextResponse.json({
      success: true,
      stats: {
        garments: storedImages.garments.length,
        models: storedImages.models.length,
        looks: storedImages.looks.length,
        total,
        lastUpdated: new Date().toISOString()
      },
      files: storedImages
    });
  } catch (error) {
    console.error('Error obteniendo estadísticas de imágenes:', error);
    return NextResponse.json({
      success: false,
      error: 'Error interno del servidor'
    }, { status: 500 });
  }
}

// DELETE /api/images - Limpiar imágenes antiguas
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const daysOld = parseInt(searchParams.get('days') || '7');
    
    cleanOldImages(daysOld);
    
    // Obtener estadísticas actualizadas
    const storedImages = getStoredImages();
    const total = storedImages.garments.length + storedImages.models.length + storedImages.looks.length;
    
    return NextResponse.json({
      success: true,
      message: `Imágenes anteriores a ${daysOld} días han sido limpiadas`,
      stats: {
        garments: storedImages.garments.length,
        models: storedImages.models.length,
        looks: storedImages.looks.length,
        total,
        lastUpdated: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Error limpiando imágenes:', error);
    return NextResponse.json({
      success: false,
      error: 'Error interno del servidor'
    }, { status: 500 });
  }
}
