# 📋 Board System - Guía para Asistentes de IA (V2.0 SQLite)

## 🎯 Propósito

Este sistema permite a **cualquier IA** (Claude, Cursor, ChatGPT, Antigravity, etc.) gestionar proyectos y tareas de forma universal mediante una base de datos **SQLite** centralizada y comandos CLI optimizados.

---

## 📁 Estructura del Sistema

### Base de datos: `board-db.sqlite`

**Ubicación por defecto:** `~/board-db.sqlite` (configurable con `BOARD_DB`)

**Esquema:**
El sistema utiliza 3 tablas principales:
1. `projects` (id, name, description, status, created_at)
2. `tasks` (id, project_id, title, description, status, priority, due_date, created_at, updated_at, completed_at, tags)
3. `subtasks` (id, task_id, text, completed, created_at)

---

## 🤖 Instrucciones para IAs

### Principio básico

**SIEMPRE consulta el estado actual mediante el CLI antes de hacer cambios.** No asumas el estado basado en mensajes previos del usuario, ya que él puede haber interactuado con la interfaz web o modificado la DB.

### Comandos disponibles

#### 1. Inicializar / Verificar DB
```bash
node board-cli.js init
```

#### 2. Crear proyecto
```bash
node board-cli.js add-project "Nombre del Proyecto" "Descripción opcional"
```
Retorna el ID del proyecto creado (`proj_xxx`).

#### 3. Crear tarea
```bash
node board-cli.js add-task "Título de la tarea" <project-id> --status todo --priority medium --due YYYY-MM-DD
```
Opciones:
- `--status`: `todo` | `in-progress` | `review` | `done` | `on-hold` | `rejected`
- `--priority`: `low` | `medium` | `high` | `urgent`
- `--due`: Fecha en formato YYYY-MM-DD

#### 4. Mover tarea a otro estado
```bash
node board-cli.js move-task <task-id> <nuevo-estado>
```

#### 5. Ver el tablero
```bash
node board-cli.js show-board
# O ver un proyecto específico:
node board-cli.js show-board <project-id>
```

#### 6. Listar proyectos
```bash
node board-cli.js list-projects
```

#### 7. Buscar tareas
```bash
node board-cli.js find-task "término de búsqueda"
```

#### 8. Otras herramientas de diagnóstico
- `board status`: Resumen estadístico global.
- `board urgent`: Lista tareas que requiren atención inmediata.
- `board remove-task <id>`: Eliminar tarea.
- `board remove-project <id>`: Eliminar proyecto completo.

---

## 🧠 Comportamiento Inteligente Recomendado

### Identificación de IDs
Si el usuario menciona una tarea por su nombre (ej: "pasa login a hecho"), **primero busca el ID** usando `board find-task "login"` antes de intentar moverla.

### Gestión de Proyectos
Si el usuario pide crear una tarea y no especifica proyecto, usa `board list-projects` para ver los activos y trata de inferir el más adecuado o pregunta.

---

## 🔄 Sincronización con Interfaz Gráfica

La base de datos SQLite es la **única fuente de verdad**. 

- ✅ La interfaz web (Vue) consulta el Servidor API (`board-server.js`) que lee la DB.
- ✅ Las IAs (tú) leen y escriben la DB mediante el CLI (`board-cli.js`).
- ✅ La sincronización es instantánea a nivel de base de datos.
- ✅ La UI detecta cambios automáticamente cada 5 segundos.

---

## 🚨 Reglas Importantes

### ✅ Haz esto:
- Usa SIEMPRE los comandos CLI para modificar datos.
- Confirma los resultados al usuario con el ID generado.
- Valida que los IDs existen antes de operar sobre ellos.

### ❌ NO hagas esto:
- No intentes editar la base de datos SQLite directamente con herramientas de texto.
- No asumas que tienes la última versión de los datos sin consultar el CLI.

---

## 📊 Formato de Respuesta al Usuario

Al ejecutar comandos, sé descriptivo:
`✅ Tarea 'Diseñar Landing' (task_abc123) creada en el proyecto POTA (proj_xyz789).`

---

**Última actualización:** 2026-03-26  
**Versión del sistema:** 2.0 (SQLite)  
**Compatibilidad:** Universal (Shell + Node.js)
