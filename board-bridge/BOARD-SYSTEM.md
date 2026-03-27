# 🧠 Board System — Documentación Maestra (V2.0 SQLite)

> Sistema universal y centralizado de gestión de proyectos y tareas con persistencia relacional.
> Optimizado para ser operado por IAs (Antigravity, Cursor, Claude) y usuarios humanos.

---

## ✅ Estado Actual del Sistema

| Componente | Estado | Descripción |
|---|---|---|
| `board-db.sqlite` | ✅ SQLITE | Base de datos relacional en `~/ (Home)`. Única fuente de verdad. |
| `board-cli.js` | ✅ SQLITE-NATIVE | CLI directo a la DB (sin necesidad de Locks manuales). |
| `board-server.js` | ✅ TRANSACTIONAL | Servidor API (Express) con soporte transaccional. |
| `AI-INSTRUCTIONS.md` | ✅ UNIVERSAL | Manual actualizado para que las IAs operen el tablero vía CLI. |
| PowerShell Alias | ✅ GLOBAL | Comando `board` disponible en todo el sistema. |
| App Vue (UI) | ✅ REAL-TIME | Sincronización automática cada 5s (Smart Polling). |

---

## ⚡ Instalación y Configuración

### 1. Pre-requisitos
- [Node.js v18+](https://nodejs.org)
- El paquete `better-sqlite3` instalado en el directorio del bridge.

### 2. Configuración de Seguridad (Windows)
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

### 3. Instalación de Dependencias
```powershell
cd C:\Users\jonas.meza\Documents\dev\files
npm install better-sqlite3 express cors
```

---

## 🤖 Comandos del CLI (`board --help`)

| Comando | Descripción |
|---|---|
| `board status` | Estadísticas globales del tablero, proyectos y tareas. |
| `board urgent` | Lista tareas urgentes (High, Urgent) o vencibles. |
| `board show-board` | Muestra el tablero completo o un proyecto específico (`board show-board <id>`). |
| `board add-project` | Crea un nuevo proyecto. |
| `board add-task` | Crea tarea (`--priority`, `--status`, `--due`). |
| `board move-task` | Cambia el estado (todo, in-progress, review, done). |
| `board remove-task` | Elimina una tarea por su ID. |
| `board remove-project` | Elimina un proyecto y todas sus tareas. |
| `board list-projects`| Lista todos los proyectos y su progreso. |
| `board find-task` | Busca tareas por nombre, descripción o ID. |

---

## 📂 Arquitectura Relacional

A diferencia de la V1, ahora utilizamos **SQLite** para evitar corrupción de datos y mejorar la velocidad:
- **Relaciones**: Los proyectos y las tareas están vinculados mediante IDs (`FOREIGN KEYS`).
- **Concurrencia**: Ya no necesitamos el archivo `.lock`. SQLite maneja las peticiones del Servidor y del CLI de forma simultánea y segura.
- **Ubicación**: Por defecto en `C:\Users\jonas.meza\board-db.sqlite`.

---

## 🔄 Flujo de Trabajo con IA

1. El usuario pide algo a la IA (ej: en Cursor o Antigravity).
2. La IA lee `AI-INSTRUCTIONS.md`.
3. La IA ejecuta comandos `board` vía terminal (ej: `board add-task "Analizar SQL" proj_xxx`).
4. **La Base de Datos se actualiza instantáneamente.**
5. **La Interfaz Web detecta el cambio en segundos y se actualiza sola.**

---

## 🚀 Roadmap

- [ ] **Backup automático**: Exportación periódica de la DB a JSON por seguridad.
- [ ] **Modo Multi-usuario**: Soporte para asignar tareas a diferentes perfiles.
- [ ] **Vistas de Calendario**: Implementación en la UI para visualizar fechas críticas.

---

*Versión del sistema: 2.0 | Última actualización: 2026-03-26*
