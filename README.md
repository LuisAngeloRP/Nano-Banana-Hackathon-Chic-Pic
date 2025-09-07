# Chic Pic 🎨✨

Sistema de moda con IA powered by Nano Banana (Gemini 2.5 Flash). Genera prendas, modelos y crea looks únicos con inteligencia artificial para catálogos profesionales.

## 🌟 Características

- **Generación de Prendas IA**: Crea prendas únicas con descripciones en lenguaje natural
- **Catálogo de Modelos**: Genera modelos diversos con características específicas
- **Estilista Virtual**: Combina prendas y modelos para crear looks profesionales
- **Interfaz Moderna**: Diseñada con shadcn/ui y Tailwind CSS
- **Experiencia Intuitiva**: Navegación por tabs con funcionalidades separadas

## 🚀 Tecnologías

- **Frontend**: Next.js 15 + TypeScript
- **UI**: shadcn/ui + Tailwind CSS
- **IA**: Google Gemini (Nano Banana) para generación de imágenes
- **Almacenamiento**: LocalStorage (demo) - expandible a bases de datos

## 📋 Funcionalidades Principales

### 1. Armario de Prendas
- **Generador**: Crea prendas con IA usando descripciones detalladas
- **Catálogo**: Visualiza, busca y gestiona tu colección de prendas
- **Filtros**: Por categoría, color, talla, etc.

### 2. Catálogo de Modelos
- **Generador**: Crea modelos diversos especificando características físicas
- **Gestión**: Organiza modelos por género, edad, tipo de cuerpo
- **Personalización**: Define características detalladas (altura, color de ojos, etc.)

### 3. Estilista IA
- **Combinación**: Selecciona modelo + prendas para crear looks
- **Generación**: Produce imágenes profesionales de catálogo
- **Gestión**: Guarda y organiza los looks creados

## 🛠️ Instalación y Configuración

### Prerrequisitos
- Node.js 18+ 
- npm o yarn
- API Key de Google Gemini

### Pasos de Instalación

1. **Clonar el repositorio**
   ```bash
   git clone [url-del-repo]
   cd Nano-Banana-Hackathon-Chic-Pic
   ```

2. **Instalar dependencias**
   ```bash
   npm install
   ```

3. **Configurar variables de entorno**
   ```bash
   cp .env.example .env.local
   ```
   
   Edita `.env.local` y añade tu API key:
   ```env
   GOOGLE_API_KEY=tu_api_key_de_google_gemini
   ```

### Obtener API Key de Google Gemini

1. **Ve a Google AI Studio**
   - Visita: https://aistudio.google.com/
   - Inicia sesión con tu cuenta de Google

2. **Crear API Key**
   - Haz clic en "Get API Key" o "Crear clave de API"
   - Selecciona o crea un proyecto de Google Cloud
   - Genera una nueva API key

3. **Verificar acceso a Nano Banana**
   - Asegúrate de tener acceso a Gemini 2.5 Flash Image
   - Nano Banana puede estar en preview/beta

4. **Configurar en la aplicación**
   - Copia la API key generada
   - Pégala en el archivo `.env.local`
   - Reinicia el servidor de desarrollo

4. **Ejecutar en desarrollo**
   ```bash
   npm run dev
   ```

5. **Ejecutar en desarrollo**
   ```bash
   npm run dev
   ```

6. **Abrir en el navegador**
   ```
   http://localhost:3000
   ```

### 💾 Sistema de Almacenamiento Local

Las imágenes generadas se guardan automáticamente en:
```
public/
└── generated-images/
    ├── garment-camiseta-elegante-1234567890.jpg
    ├── model-alex-profesional-1234567891.jpg
    └── look-casual-verano-1234567892.jpg
```

**Características:**
- ✅ **Persistencia**: Las imágenes se mantienen entre sesiones
- ✅ **Organización**: Nomenclatura automática por tipo y descripción
- ✅ **Acceso**: Disponibles vía HTTP en `/generated-images/[filename]`
- ✅ **Limpieza**: Eliminación automática de archivos antiguos
- ✅ **Estadísticas**: Panel de control con métricas en tiempo real

## 🔧 Configuración de la API

### Google Gemini API Key

1. Ve a [Google AI Studio](https://makersuite.google.com/)
2. Crea o selecciona un proyecto
3. Genera una API key
4. Añádela a tu archivo `.env.local`

### Nota Importante
Esta versión demo usa placeholders para las imágenes. Para producción:
- Integra con la API real de generación de imágenes
- Implementa almacenamiento persistente (base de datos)
- Añade autenticación de usuarios

## 📱 Uso de la Aplicación

### Paso 1: Generar Prendas
1. Ve a la pestaña "Armario"
2. Completa el formulario de generación
3. Describe la prenda detalladamente
4. Haz clic en "Generar Prenda con IA"

### Paso 2: Crear Modelos
1. Ve a la pestaña "Modelos"
2. Define las características del modelo
3. Especifica género, edad, tipo de cuerpo, etc.
4. Genera el modelo con IA

### Paso 3: Crear Looks
1. Ve a la pestaña "Estilista"
2. Selecciona un modelo del catálogo
3. Elige las prendas a combinar
4. Genera el look final

## 🎨 Arquitectura del Proyecto

```
src/
├── app/                    # App Router de Next.js
│   ├── layout.tsx         # Layout principal
│   └── page.tsx           # Página principal
├── components/            # Componentes React
│   ├── ui/               # Componentes de shadcn/ui
│   ├── GarmentGenerator.tsx
│   ├── GarmentWardrobe.tsx
│   ├── ModelGenerator.tsx
│   ├── ModelCatalog.tsx
│   └── FashionStylist.tsx
├── lib/                   # Utilidades y configuración
│   ├── gemini.ts         # Configuración de Gemini API
│   ├── storage.ts        # Gestión de almacenamiento
│   └── utils.ts          # Utilidades generales
└── types/                # Tipos de TypeScript
    └── index.ts
```

## 🔮 Futuras Mejoras

- [ ] Integración real con APIs de generación de imágenes
- [ ] Base de datos persistente (PostgreSQL/MongoDB)
- [ ] Autenticación de usuarios
- [ ] Colaboración en tiempo real
- [ ] Exportación de catálogos
- [ ] Integración con e-commerce
- [ ] Análisis de tendencias
- [ ] Recomendaciones IA

## 🤝 Contribuciones

Las contribuciones son bienvenidas. Por favor:

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/nueva-funcionalidad`)
3. Commit tus cambios (`git commit -am 'Añade nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver `LICENSE` para más detalles.

## 🙏 Agradecimientos

- **Nano Banana (Google Gemini)** por las capacidades de IA
- **shadcn/ui** por los componentes elegantes
- **Next.js** por el framework
- **Tailwind CSS** por el styling

---

**Desarrollado con ❤️ para el Nano Banana Hackathon**