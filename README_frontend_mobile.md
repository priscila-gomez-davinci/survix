# Survix — Frontend & Mobile

Survix es una plataforma digital orientada a estimular la vida outdoor. Permite a los usuarios descubrir actividades en la naturaleza, acceder a guías de supervivencia, explorar rutas en un mapa interactivo y conocer equipamiento recomendado para cada actividad.

## Tecnologías

- **TypeScript** — lenguaje principal
- **React Native + Expo** — framework multiplataforma (web + Android + iOS desde una sola codebase)
- **Expo Router** — navegación basada en sistema de archivos
- **EAS (Expo Application Services)** — build y distribución mobile
- **Google OAuth** — autenticación social
- **React Native Maps** — integración de mapa interactivo

## Requisitos previos

- Node.js v18+
- npm (viene con Node.js)
- EAS CLI: `npm install -g eas-cli`
- Cuenta en Expo con acceso al proyecto

## Instalación

```bash
git clone https://github.com/priscila-gomez-davinci/survix.git
cd survix/mobile
npm install
```

## Variables de entorno

Crear un archivo `.env` dentro de `mobile/` con las siguientes variables:

```
EXPO_PUBLIC_API_URL=http://localhost:8000
GOOGLE_CLIENT_ID=tu_google_client_id
FIREBASE_API_KEY=tu_firebase_api_key
FIREBASE_PROJECT_ID=tu_firebase_project_id
```

> ⚠️ Nunca subir el archivo `.env` al repositorio.

## Cómo correr el proyecto

### Versión web

```bash
cd mobile
npx expo start --web
# Abre automáticamente en http://localhost:8081
```

### En dispositivo físico (Expo Go)

```bash
npx expo start
# Escanear el QR con la app Expo Go
```

### En emulador Android

```bash
npx expo start
# Presionar 'a' en la terminal (requiere Android Studio + AVD configurado)
```

### Generar APK de prueba

```bash
eas login          # usuario: scilafeuersturm
eas build --platform android --profile preview
```

## Arquitectura técnica

El frontend sigue una estructura por capas:

```
mobile/
├── app/            ← rutas y pantallas (Expo Router)
├── components/     ← componentes reutilizables
├── assets/         ← imágenes y fuentes
└── .env            ← variables de entorno (no subir a git)
```

La app se conecta al backend mediante HTTP REST. El mapa tiene implementación específica para web (`*.web.tsx`) y para mobile (nativo). El panel de administración está disponible únicamente en la versión web.

## Librerías principales

| Librería | Uso |
|---|---|
| expo | Framework base multiplataforma |
| expo-router | Navegación por sistema de archivos |
| react-native-maps | Mapa interactivo con rutas y actividades |
| @react-native-google-signin/google-signin | Autenticación con Google |
| expo-location | Geolocalización del usuario |
| axios / fetch | Comunicación con la API del backend |

## Autores

- **Priscila Gómez** — Frontend Web y Mobile
- **Lucas Sain** — Testing y funcional
