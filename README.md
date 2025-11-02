# Nunito Mobile

Aplicación educativa multiplataforma creada con **Expo** y **React Native** para reforzar la conciencia fonológica de estudiantes del Programa de Integración Escolar (PIE). El proyecto es el resultado de la migración del antiguo front-end web a una base de código móvil única.

## 🧭 Estructura del proyecto

```
Nunito/
├─ app/                 # Rutas gestionadas con Expo Router
│  ├─ _layout.tsx       # Layout raíz con SafeArea y StatusBar
│  └─ index.tsx         # Entrada de la pantalla principal (Home)
├─ src/
│  ├─ features/
│  │  └─ home/          # Pantallas y componentes del flujo principal
│  ├─ theme/            # Paleta y utilidades de estilo
│  └─ utils/            # Helpers compartidos
├─ assets/              # Recursos estáticos (imágenes, iconos, splash)
├─ app.config.ts        # Configuración de Expo
├─ index.ts             # Registro de la app para Expo
└─ tsconfig.json        # Paths y reglas TypeScript
```

## 🚀 Puesta en marcha

1. Instala las dependencias (se recomienda PNPM, aunque puedes usar npm o yarn):
   ```bash
   pnpm install
   ```
2. Ejecuta el servidor de desarrollo de Expo:
   ```bash
   pnpm start
   ```
   Selecciona la plataforma deseada (Android, iOS o Web) desde la consola interactiva de Expo.

### Scripts disponibles

| Comando        | Descripción                                |
| -------------- | ------------------------------------------ |
| `pnpm start`   | Inicia Expo Go y permite elegir plataforma |
| `pnpm android` | Lanza el proyecto en un emulador Android   |
| `pnpm ios`     | Abre el proyecto en un simulador iOS       |
| `pnpm web`     | Ejecuta el bundle en modo web              |
| `pnpm lint`    | Ejecuta ESLint sobre el código fuente      |

## 📦 Dependencias clave

- `expo` 54 con soporte para la nueva arquitectura.
- `expo-router` para navegación declarativa por archivos.
- `react-native-safe-area-context` y `expo-status-bar` para compatibilidad visual multiplataforma.

## 🛡️ Safe Area

Safe Area: implementado con react-native-safe-area-context.

## 📋 Migración

El proceso y estado de la migración desde la aplicación web original se documenta en [`MIGRATION_CHECKLIST.md`](./MIGRATION_CHECKLIST.md).

## 🖼️ Assets

Todos los recursos que antes se encontraban en `public/` fueron trasladados a la carpeta `assets/` y son referenciados mediante `require` o importaciones directas compatibles con Expo.

## 📄 Licencia

Este proyecto se distribuye bajo la licencia MIT.
