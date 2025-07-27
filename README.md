
# ⚽ App de Asistencias y Estadísticas para Fútbol Infantil

**Versión Beta 1.0**

Este proyecto es una aplicación web **PWA** (Progressive Web App) para la gestión de equipos de fútbol infantil, que permite registrar y analizar asistencias a prácticas, partidos, participaciones, posiciones de jugadores y estadísticas. Está orientada a clubes, cuerpos técnicos, delegados o coordinadores que busquen profesionalizar la gestión deportiva de forma sencilla y offline.

---

## 🚀 Funcionalidades principales

- **Gestión de equipos y jugadores**  
  - Crear, editar, eliminar equipos.
  - Crear y editar jugadores, asignando número y doble posición (principal/secundaria) seleccionable, con distintivo visual por categoría (portero, defensa, mediocampo, delantero).
  - Estado activo/inactivo para el plantel.

- **Registro de prácticas y partidos**  
  - Crear prácticas con control detallado de asistencias, faltas y motivos.
  - Crear partidos con información clave: rival, fecha, hora, torneo, resultado.
  - Participación individual de jugadores en cada partido: minutos jugados, goles, entradas/salidas y cambios.

- **Estadísticas y visualización**  
  - Estadísticas detalladas de **prácticas** (asistencias/faltas, % de asistencia, motivos) y **partidos** (minutos jugados, goles, % participación, promedio por partido).
  - Tablas dinámicas y gráficos interactivos (barras) con posibilidad de filtrar por año y mes.
  - **Exportación profesional**: tablas a Excel y gráficos a PNG, ambos titulados y nombrados automáticamente según el contexto (ej: `Partidos_Julio_2025`).

- **Control de usuarios y estructura flexible**  
  - Permite gestionar múltiples equipos/categorías.
  - Asociación de cada jugador a su equipo.
  - El sistema es 100% local, sin registro ni dependencia de la nube (datos se guardan en el navegador).

- **Backup y restauración**
  - Exportación de todos los datos (equipos, jugadores, prácticas y partidos) en un archivo `.json`.
  - Importación/restauración de backups desde archivo, con advertencia de reemplazo de datos actuales.

---

## 📋 Tecnologías y arquitectura

- **Frontend:** React + Vite
- **UI:** React-Bootstrap + Recharts + React-Icons
- **Base de datos local:** IndexedDB vía Dexie.js (persistencia offline)
- **Despliegue:** Puede usarse como PWA y agregar a la pantalla de inicio del celular
- **Control de versiones:** Git + GitHub

---

## 🖥️ Estructura de carpetas principal

```
src/
 ├── components/
 │     ├── JugadorForm.jsx
 │     ├── PracticasStats.jsx
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

## 📝 Uso de posiciones de jugadores

- El sistema ofrece un **selector de posición principal y secundaria**, agrupadas por lugar en cancha, cada una con su color:
  - **Portero (PT):** violeta
  - **Defensas (DC, LD, LI):** azul
  - **Centrocampistas (MP, MC, ID, II, MCD):** verde
  - **Delanteros (SP, DC2, ED, EI):** rojo

Ambas posiciones se visualizan con badge y abreviatura, ejemplo:  
`DC` / `II`

---

## 📊 Estadísticas y reportes

- **Partidos:**  
  - Minutos jugados, partidos jugados, promedio por partido, goles, % participación.
- **Prácticas:**  
  - Asistencias, faltas, % asistencia, motivos de falta.
- **Filtrado:**  
  - Filtrar estadísticas por mes y año.
- **Exportación:**  
  - Descargar la tabla como Excel (incluye nombre del equipo, periodo y título).
  - Descargar gráficos como PNG (con nombre personalizado).

---

## 🔄 Backup y restauración

- **Backup:**  
  - Exporta todos los datos actuales del club a un archivo `.json` para resguardo.
- **Restauración:**  
  - Importa un archivo `.json` previamente exportado para reestablecer toda la base de datos.
- **Advertencia:**  
  - La restauración reemplaza todos los datos existentes.

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

## 🧑‍💻 Colaboración y pruebas beta

- **Cualquier usuario** puede instalar y usar la app en su navegador y móvil, sin configuración extra.
- **Feedback y bugs:**  
  Usa Issues en el repo de GitHub para reportar errores o sugerencias.

---

## 🚦 Estado actual y roadmap

### Estado actual (beta 1.0):
- Funcionalidades principales estables y probadas.
- Falta: control de asistencia a partidos, multi-usuario, permisos, sincronización nube (futuro), pulido UI/UX avanzado.

### Próximos pasos sugeridos:
- Control de asistencia a partidos (presente/ausente + motivo).
- Mejoras de usabilidad móvil.
- Roles de usuario y login (opcional).
- Sincronización entre dispositivos.
- Soporte a más deportes o categorías.

---

## ✨ Créditos y agradecimientos

- Desarrollado por Leonardo Almada y equipo colaborador.
- Inspirado en la gestión de clubes y la experiencia real en fútbol infantil.

---

## 📝 Licencia

Licencia MIT — uso libre con atribución.

---
