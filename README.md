# UneedT

**Plataforma de gestión académica personal — tareas, calendario, hábitos, recordatorios y seguimiento académico en una sola app.**

[![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react&logoColor=white)](https://react.dev)
[![Vite](https://img.shields.io/badge/Vite-8-646CFF?style=flat-square&logo=vite&logoColor=white)](https://vitejs.dev)
[![Supabase](https://img.shields.io/badge/Supabase-Realtime-3ECF8E?style=flat-square&logo=supabase&logoColor=white)](https://supabase.com)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![Gemini AI](https://img.shields.io/badge/Gemini-AI-4285F4?style=flat-square&logo=google&logoColor=white)](https://ai.google.dev)

---

## Descripción

UneedT es una aplicación web progresiva (PWA) diseñada para estudiantes que necesitan centralizar su gestión académica. Integra un calendario interactivo, gestión de tareas con arrastrar y soltar, módulo académico, seguimiento de hábitos, recordatorios y clasificación automática de tareas mediante IA (Gemini API).

Construida sobre Supabase para persistencia en tiempo real y sincronización entre dispositivos.

---

## Módulos principales

| Módulo | Descripción |
|--------|-------------|
| **📅 Calendario** | Vista mensual interactiva con eventos y tareas por día |
| **✅ Tareas** | Lista de tareas con drag-and-drop (DnD Kit) y clasificación por IA |
| **📆 Vista diaria** | Detalle de tareas y eventos de un día específico |
| **🎓 Módulo Académico** | Seguimiento de materias, notas y progreso académico |
| **💪 Hábitos** | Registro y seguimiento de hábitos diarios |
| **🔔 Recordatorios** | Alertas y recordatorios programados |

---

## Stack tecnológico

| Categoría | Herramienta |
|-----------|-------------|
| Framework | React 19 |
| Build tool | Vite 8 |
| Backend / Base de datos | Supabase (PostgreSQL + Realtime) |
| Estilos | Tailwind CSS 4 |
| State management | Zustand |
| Animaciones | Framer Motion |
| Drag & Drop | DnD Kit |
| Gráficas | Recharts |
| Clasificación IA | Gemini API (Google) |
| PWA | Service Worker |

---

## Instalación

```bash
git clone https://github.com/ignacioperez1504/Task-Box.git
cd Task-Box

npm install
```

### Variables de entorno

Crear un archivo `.env` en la raíz con:

```env
VITE_SUPABASE_URL=tu_supabase_url
VITE_SUPABASE_ANON_KEY=tu_supabase_anon_key
VITE_GEMINI_API_KEY=tu_gemini_api_key
```

```bash
npm run dev
```

---

## Características destacadas

- **Supabase Realtime** — sincronización instantánea entre sesiones/dispositivos
- **Clasificación con Gemini AI** — las tareas se clasifican automáticamente por categoría y prioridad
- **PWA** — instalable como app nativa en móvil y escritorio (Service Worker)
- **Drag & Drop** — reorganización intuitiva de tareas con DnD Kit
- **Animaciones fluidas** — transiciones y microinteracciones con Framer Motion
- **Dark mode** — diseño oscuro con Tailwind CSS

---

## Estructura del proyecto

```
Task-Box/
├── src/
│   ├── components/
│   │   ├── academic/       # AcademicModule
│   │   ├── habits/         # HabitModule
│   │   ├── reminders/      # ReminderModule
│   │   ├── calendar/       # Calendar view
│   │   ├── tasks/          # TaskList + DayTasksView
│   │   └── ui/             # Sidebar, FAB, Modals, CustomCursor
│   ├── App.jsx             # Routing principal entre módulos
│   └── main.jsx
├── package.json
└── vite.config.js
```

---

## Autores

Proyecto personal desarrollado por Ignacio Pérez Chaves — Universidad de Antioquia.
