# ⚽ App de Asistencias y Estadísticas para Fútbol Infantil

**Versión Beta 2.0**  
*Gestión avanzada y estadísticas para equipos de fútbol infantil. Totalmente offline, profesional, intuitiva y personalizable.*

---

## ✨ Introducción

Esta aplicación está pensada para clubes, delegados, entrenadores y familias que buscan **profesionalizar la gestión y el control de asistencia, partidos, jugadores y campeonatos** de fútbol infantil, de forma sencilla y totalmente **offline**.

Desarrollada como una **PWA** (Progressive Web App), permite registrar y analizar la actividad de equipos/categorías desde cualquier dispositivo, sin depender de servicios externos ni de internet.

---

## ⚠️ Advertencias importantes

- **Beta pública**: aunque estable, aún puede haber detalles menores pendientes o mejoras en camino.
- **Datos locales**: toda la información se guarda **solo en el navegador**. No hay sincronización automática en la nube.
- **Backup manual**: recuerda realizar copias de seguridad periódicas desde el menú de configuración.
- **No compatible con múltiples dispositivos al mismo tiempo**: los datos no se comparten automáticamente entre computadoras o teléfonos.
- **Exportar antes de actualizar la app**: si cambias de navegador, equipo o reinstalas la app, realiza antes un backup y luego restaura.

---

## 💡 Sugerencias de uso y buenas prácticas

- Crea primero el **equipo/categoría**. Todo lo que registres se asociará al equipo seleccionado.
- **Carga la plantilla de jugadores** y, si es posible, define sus posiciones y números.
- Utiliza los **campeonatos** para separar partidos de diferentes torneos y poder filtrar estadísticas fácilmente.
- Marca a los jugadores inactivos si ya no participan, así conservarás el historial sin mezclarlos en nuevos partidos o prácticas.
- Utiliza las funciones de **backup** y **restauración** con frecuencia, especialmente antes de actualizaciones o limpiezas de datos.
- Explora la app en modo escritorio y móvil: todo está optimizado para ambos entornos.

---

## 🚀 ¿Qué trae la Beta 2.0?

### Principales novedades y mejoras

- **Gestión de campeonatos/torneos**: módulo dedicado, selección rápida desde partidos, creación ágil.
- **Equipos reutilizables y selección global**: todo es multi-equipo, siempre sabés en cuál estás trabajando.
- **Jugadores activos/inactivos**: filtro automático, ayuda visual, sin riesgo de errores.
- **Tablas y formularios pro**: ordenables, filtrables, comprimidos en móvil y con tooltips e íconos explicativos.
- **Badges y colores para campeonatos**: identifica de un vistazo el tipo de torneo o partido.
- **Acciones directas**: edición y eliminación siempre a mano, con confirmaciones flotantes y modales de seguridad.
- **Backup y restauración mejorados**: ahora con mensajes claros y advertencias.
- **Cierre automático del menú al seleccionar equipo**: experiencia mobile más cómoda y profesional.
- **Mejoras de usabilidad**: ayudas contextuales, navegación optimizada y edición rápida de registros.

---

## 📝 Funcionalidades principales (Beta 2.0)

### 🏆 Equipos y campeonatos
- Crear, editar y eliminar equipos/categorías.
- Selección global visible (navbar).
- Gestión completa de campeonatos (alta, edición, activación/inactivación, borrado).
- Agregar campeonatos desde la pantalla de partidos.

### 👥 Jugadores
- Alta, edición, baja y reactivación de jugadores.
- Asignación de número, posiciones y estado.
- Solo activos en nuevas asignaciones; inactivos quedan visibles para historial.

### 📅 Entrenamientos (Prácticas)
- Registro de cada práctica: fecha, hora, lugar, duración.
- Control detallado de asistencias con motivo.
- Edición avanzada: campos comprimidos, badges de inactivo, tooltips, edición masiva.

### 🏟️ Partidos
- Registro de rival, torneo, goles, duración, etc.
- Participaciones y cambios gestionados fácil.
- Botón de alta rápida de campeonato junto al select.
- Sólo jugadores activos pueden ser agregados a nuevos partidos.
- Resumen automático del partido: participantes, minutos jugados, goleadores, etc.

### 📈 Estadísticas y reportes
- Estadísticas de asistencia y partidos, filtradas por año, mes, torneo.
- Exportación a Excel y gráficos.
- Análisis de posiciones y roles de cada jugador.

### 💾 Backup y restauración
- Exportación/importación de datos desde configuración.
- Confirmaciones flotantes y advertencias.

### 🖥️ Experiencia de usuario
- PWA instalable: funciona offline y se puede agregar a inicio.
- Navegación y tablas responsive, controles comprimidos en móvil.
- Iconos claros (React-Icons), badges de colores y tooltips explicativos.
- Menú hamburguesa se cierra automáticamente.

---

## 📋 Tecnologías y arquitectura

- **Frontend:** React + Vite
- **UI:** React-Bootstrap + Recharts + React-Icons
- **Base de datos local:** IndexedDB vía Dexie.js
- **PWA:** Instalación directa desde el navegador.
- **Control de versiones:** Git + GitHub

---

## 🗂️ Estructura principal del proyecto

```
src/
 ├── components/
 │     ├── JugadorForm.jsx
 │     ├── EntrenamientosStats.jsx
 │     ├── PartidosStats.jsx
 │     └── ...
 ├── pages/
 │     ├── Jugadores.jsx
 │     ├── Estadisticas.jsx
 │     └── ...
 ├── data/
 │     └── posiciones.js
 ├── hooks/
 │     └── useDB.js
 ├── utils/
 │     └── posiciones.js
 │     ├── exportarEstadisticas.js
 │     └── exportarGraficoComoPNG.js
 ├── context/
 │     ├── EquipoContext.js
 │     └── ThemeContext.js
 └── App.jsx
```

---

## 🛠️ Instalación y ejecución local

1. **Clonar el repositorio:**
   ```sh
   git clone https://github.com/leoalmada-dev/app-asistencias.git
   cd app-asistencias
   ```

2. **Instalar dependencias:**
   ```sh
   npm install
   ```

3. **Iniciar la app en modo desarrollo:**
   ```sh
   npm run dev
   ```
   Accede a [http://localhost:5173](http://localhost:5173) (o el puerto que indique la consola).

4. **Desplegar (build) para producción:**
   ```sh
   npm run build
   ```
   Los archivos finales estarán en `dist/` para subirlos a un servidor estático.

---

## 📱 Instalación como PWA

- Desde el navegador (Chrome/Edge móvil o escritorio), abre la app y selecciona “Agregar a la pantalla de inicio”.
- La app funcionará offline y se puede usar como una app nativa desde el celular o tablet.

---

## 📝 Changelog Beta 2.0

-  Orden y visualización mejorada en listados de partidos, entrenamientos y campeonatos.
- Nuevos iconos, badges y tooltips en toda la app.
- Botón para agregar campeonatos directo desde el formulario de partidos.
- Confirmaciones y alertas visuales para cada acción.
- Resumen de asistencia y goles por partido.
- Accesibilidad y diseño responsive mejorado.
- Corrección de errores menores y limpieza de código.
- Feedback automático en todas las operaciones (agregar, editar, eliminar).
- Backups integrados y advertencias de borrado.
- Mejor gestión de datos de inactivos.

---

## 👨‍💻 Créditos y agradecimientos
- Desarrollado por: Leonardo Almada
- Inspirado en necesidades reales de gestión de clubes infantiles.

---

## 📝 Licencia

- Licencia MIT — uso libre con atribución.

---