# **To-Do List para la Migración y Pulido de la App (React → React Native)**

Lista unificada, coherente y técnicamente ejecutable.

---

## **1. Dashboard del Profesor**

### **Tareas**

1. Implementar pantalla de inicio del profesor con los siguientes módulos:

   * Salas activas.
   * Estudiantes conectados.
   * Progreso general.
   * Actividades recientes.
   * Reportes reales.
2. Implementar sección “Mis salas”.
3. Implementar módulo “Actividad reciente” mostrando las últimas salas creadas.
4. Conectar el módulo de reportes reales.

### **Criterios de aceptación**

* La vista de inicio del profesor debe cargar todas las métricas en un único fetch.
* “Actividad reciente” debe mostrar máximo 2 salas.
* “Reportes” debe redirigir a salas reales previamente creadas.

---

## **2. Gestión de Salas**

### **Tareas**

1. **Mostrar código de sala** al crear una sala o al ver su detalle.
2. Agregar **botón “Iniciar actividad”** cuando la sala está recién creada.
3. Una vez finalizada la actividad:

   * Mover la sala automáticamente a “Salas anteriores”.
   * Habilitar acceso a los reportes.
4. Mostrar lista de usuarios:

   * Conectados.
   * Conectándose.
   * Vista espejo en sala del profesor y sala de espera de estudiantes.

### **Criterios de aceptación**

* El código de sala debe ser visible siempre en detalle y tras crear.
* Sincronización en tiempo real para usuarios conectados mediante WebSockets o polling.

---

## **3. Inicio, Espera y Comienzo del Juego**

### **Tareas**

1. Implementar sala de espera funcional:

   * Los estudiantes deben quedar en espera hasta que el profesor presione “Comenzar actividad”.
2. Implementar sala de comienzo del juego:

   * Estado bloqueado para estudiantes hasta confirmación del profesor.
3. Eliminar botón de cierre de sesión dentro de la pantalla de configuración del profesor.

### **Criterios de aceptación**

* Cambio de estado debe emitirse en tiempo real a todos los estudiantes.
* La UI debe ser consistente con el estilo del student-dashboard original.

---

## **4. Sesión y Almacenamiento**

### **Tareas**

1. Implementar cerrar sesión global.
2. Al cerrar sesión:

   * Borrar todas las credenciales almacenadas en local storage / async storage.

### **Criterios de aceptación**

* Ningún token o sesión residual debe persistir después del logout.

---

## **5. Estilo Global y UI/UX**

### **Botones principales**

* Reducir bordes a **2px**.
* Añadir hover color **#83D3C9** con sombra.
* Aplicar a:

  * Unirse a sala.
  * Configuración.
  * Cerrar sesión.
  * Gestionar preguntas.
  * Reportes.
  * Mis salas.
* En el modal principal, los iconos de Profesor/Estudiante deben ser **negros** cuando están seleccionados.

### **Navbar**

1. Eliminar el borde inferior color **#3EF9F9**.
2. Mantener la sombra.
3. Unir logo + texto (eliminar espacio intermedio).

### **Landing Page**

1. “Minijuegos disponibles” en **grid 2×2** para la versión web.
2. Eliminar fondos de los botones.

### **Configuración (Profesor)**

* Eliminar el botón inferior de cerrar sesión.
* Usar ese mismo color para el botón de cerrar sesión del side-menu del profesor.

---

## **6. Gestión de Preguntas**

### **Tareas**

* Modificar barra de progreso para dividirse en **4 segmentos** (no 5).
* Actualmente se queda a mitad; corregir cálculo y animación.

### **Criterios de aceptación**

* Los puntos 1–4 deben alinearse exactamente con el avance real de la actividad.

---

## **7. Minijuegos**

### **Tareas**

1. Cambiar fondo de la barra de progreso:

   * Color base: **blanco**.
   * Color del progreso, tiempo actual y pregunta actual deben **coincidir exactamente** con los colores definidos en
     `educational-app-development/components/games/*` (adaptarlos a React Native).
2. Eliminar:

   * Tiempo restante.
   * Botón “← Salir”.
3. En la sección principal (nombre, pregunta actual, tiempo, número de pregunta “1/5”):

   * Agregar icono de **reloj** a la izquierda del tiempo.
   * Agregar icono de **estrella vacía** junto al número de pregunta.
   * Ambos iconos deben ser **blancos**.

---

## **8. Estilos para Sala de Espera y Sala de Comienzo (Estudiantes)**

### **Tareas**

* Replicar exactamente el estilo presente en
  `educational-app-development/components/student-dashboard.tsx`:

  * Colores de barras.
  * Fondos de botones.
  * Colores de texto.
  * Fondos de labels.
* Adaptar los estilos a React Native.

### **Criterios de aceptación**

* La experiencia visual debe ser idéntica a la versión web, respetando su lógica de colores y proporciones.
