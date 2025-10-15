# Plan de Migración a React Native con Expo

Este documento registra el avance de la migración del proyecto web (old_nunito) hacia la nueva aplicación móvil basada en Expo Router.

## Tareas Principales
- [x] Documentar plan de migración y crear registro de progreso.
- [x] Configurar arquitectura base en `app/` y `src/` siguiendo la guía propuesta.
- [x] Migrar y referenciar los activos gráficos necesarios en `assets/` (eliminar `public/`).
- [x] Portar las pantallas principales y componentes clave a implementaciones nativas.
- [x] Adaptar la lógica del flujo principal (inicio, profesor, estudiante, juegos y reportes).
- [x] Ajustar configuración de TypeScript, alias y dependencias específicas de Expo.
- [ ] Validar la compilación/bundle de Expo tras los cambios (pendiente de ejecución local).
- [x] Limpieza final del proyecto (eliminar recursos web obsoletos y actualizar documentación).

## Bitácora de Iteraciones
- **Iteración 1:** Creación del plan de trabajo y del checklist de seguimiento.
- **Iteración 2:** Configuración de arquitectura Expo, migración de pantallas nativas y traslado de assets.
  - Intento de `expo export` para validar build web fallido por restricciones de red (fetch ENETUNREACH).
- **Iteración 3:** Reintento de validación (`expo export --platform web`), falla reiterada por bloqueo de red hacia servicios de Expo.
- **Iteración 4:** Portamos los mini juegos interactivos (imagen-palabra, conteo de sílabas, rimas y reconocimiento auditivo) a componentes nativos y los integramos con el `GameLauncher`.
- **Iteración 5:** Limpieza final: eliminación del código legado `old_nunito`, depuración de configuraciones obsoletas y actualización del README.
