# 🚀 Configuración Rápida de Chic Pic

## ⚡ Pasos Rápidos

1. **Clonar y instalar**:
   ```bash
   git clone [repo-url]
   cd Nano-Banana-Hackathon-Chic-Pic
   npm install
   ```

2. **Configurar API Key**:
   ```bash
   echo "GOOGLE_API_KEY=tu_api_key_aqui" > .env.local
   ```

3. **Ejecutar**:
   ```bash
   npm run dev
   ```

4. **Abrir**: http://localhost:3000

## 🔑 Obtener API Key

1. Ve a: https://aistudio.google.com/
2. Crea una API key para Gemini
3. Cópiala al archivo `.env.local`
4. Reinicia el servidor

## ⚠️ Importante

- **Nano Banana**: Es Gemini 2.5 Flash Image para generación de imágenes
- **Estado actual**: La app funciona con placeholders mientras configuras la API real
- **Verificación**: Revisa el estado de la API en la aplicación

## 🎯 Funcionalidades

- ✅ **Armario**: Genera y gestiona prendas
- ✅ **Modelos**: Crea catálogo de modelos  
- ✅ **Estilista**: Combina prendas + modelos = looks únicos

## 🆘 Problemas Comunes

**Error 403**: API key no válida o sin acceso
- Verifica que la API key sea correcta
- Confirma acceso a Gemini 2.5 Flash Image

**No genera imágenes**: Funcionamiento normal en modo demo
- La app usa placeholders hasta configurar API real
- Todas las funcionalidades están disponibles

---

¡Listo para crear moda con IA! 🎨✨
