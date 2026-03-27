# 📋 Sistema Universal de Gestión de Proyectos

Sistema simple y agnóstico para gestionar proyectos y tareas que puede ser usado por **cualquier IA** (Claude, Cursor, ChatGPT, etc.) y tu interfaz gráfica existente.

---

## 🚀 Instalación Rápida

### 1. Copiar archivos a tu sistema

```bash
# Copiar el archivo de datos inicial
cp board-data.json ~/board-data.json

# Copiar el CLI
cp board-cli.js ~/board-cli.js
chmod +x ~/board-cli.js

# (Opcional) Crear un alias para facilitar el uso
echo 'alias board="node ~/board-cli.js"' >> ~/.bashrc
source ~/.bashrc
```

### 2. Verificar instalación

```bash
board help
```

Deberías ver la lista de comandos disponibles.

---

## 📖 Uso Básico

### Ver el tablero actual

```bash
board show-board
```

### Crear un proyecto nuevo

```bash
board add-project "Mi Proyecto Web" "Sitio web corporativo"
```

Esto te devolverá un ID como `proj_abc123_xyz`

### Crear una tarea

```bash
board add-task "Diseñar landing page" proj_abc123_xyz --priority high
```

### Mover una tarea a otro estado

```bash
board move-task task_def456_abc in-progress
```

### Buscar tareas

```bash
board find-task "diseñar"
```

### Listar todos los proyectos

```bash
board list-projects
```

---

## 🎨 Integración con tu Interfaz Gráfica

Tu interfaz solo necesita:

1. **Leer** el archivo `~/board-data.json`
2. **Escribir** en el mismo archivo cuando el usuario hace cambios

### Ejemplo simple en JavaScript:

```javascript
// Leer el board
const fs = require('fs');
const boardData = JSON.parse(fs.readFileSync('~/board-data.json', 'utf8'));

// Modificar datos (ejemplo: cambiar estado de una tarea)
const project = boardData.projects.find(p => p.id === 'proj_xxx');
const task = project.tasks.find(t => t.id === 'task_yyy');
task.status = 'in-progress';
task.updated = new Date().toISOString().split('T')[0];

// Guardar cambios
boardData.last_updated = new Date().toISOString();
fs.writeFileSync('~/board-data.json', JSON.stringify(boardData, null, 2));
```

### Sincronización automática

Para que tu interfaz se actualice cuando una IA hace cambios:

**Opción 1 - Polling:**
```javascript
// Revisar cada 2 segundos si el archivo cambió
setInterval(() => {
  fs.stat('~/board-data.json', (err, stats) => {
    if (stats.mtimeMs > lastChecked) {
      reloadBoard();
    }
  });
}, 2000);
```

**Opción 2 - File Watcher:**
```javascript
fs.watch('~/board-data.json', (eventType) => {
  if (eventType === 'change') {
    reloadBoard();
  }
});
```

---

## 🤖 Cómo las IAs Usan Este Sistema

### Para Claude (yo):

Simplemente dime qué quieres hacer:

- "Crea una tarea para diseñar el logo en el proyecto web"
- "Mueve la tarea de login a en progreso"
- "Crea un proyecto nuevo de marketing"

Yo automáticamente:
1. Leo el estado actual del board
2. Ejecuto los comandos necesarios
3. Te confirmo qué se hizo

### Para Cursor/VS Code:

Puedes pedirle a la IA de Cursor que ejecute comandos:

```
@workspace Crea una tarea "Implementar API" en el proyecto de backend
```

Cursor ejecutará:
```bash
board add-task "Implementar API" <project-id>
```

### Para otras IAs:

Comparte el archivo `AI-INSTRUCTIONS.md` con la IA. Ese archivo contiene todas las instrucciones necesarias para que cualquier asistente sepa cómo usar el sistema.

---

## 🗂️ Estructura del Archivo JSON

```json
{
  "version": "1.0",
  "last_updated": "2026-03-25T00:00:00Z",
  "projects": [
    {
      "id": "proj_xxx",           // ID único autogenerado
      "name": "Nombre",            // Nombre del proyecto
      "description": "Desc",       // Descripción opcional
      "created": "2026-03-25",     // Fecha de creación
      "status": "active",          // Estado del proyecto
      "tasks": [
        {
          "id": "task_yyy",        // ID único autogenerado
          "title": "Título",       // Título de la tarea
          "description": "Desc",   // Descripción opcional
          "status": "todo",        // Estado actual
          "priority": "medium",    // Prioridad
          "created": "2026-03-25", // Fecha de creación
          "updated": "2026-03-25", // Última actualización
          "tags": ["tag1"]         // Tags opcionales
        }
      ]
    }
  ],
  "config": {
    "valid_statuses": ["todo", "in-progress", "review", "done"],
    "valid_priorities": ["low", "medium", "high", "urgent"]
  }
}
```

---

## ⚙️ Configuración Avanzada

### Cambiar la ubicación del archivo

Por defecto, el archivo se guarda en `~/board-data.json`. Para cambiarlo:

```bash
export BOARD_FILE=/ruta/personalizada/mi-board.json
```

Agrégalo a tu `~/.bashrc` o `~/.zshrc` para que sea permanente:

```bash
echo 'export BOARD_FILE=/ruta/personalizada/mi-board.json' >> ~/.bashrc
```

### Usar con Google Drive / Dropbox

Guarda el archivo en una carpeta sincronizada:

```bash
export BOARD_FILE=~/Dropbox/board-data.json
# o
export BOARD_FILE=~/Google\ Drive/board-data.json
```

Ahora el board se sincronizará automáticamente entre dispositivos.

---

## 🎯 Ventajas de Este Sistema

### ✅ **Simple**
- Un solo archivo JSON
- Comandos CLI claros
- Sin base de datos, sin servidor

### ✅ **Universal**
- Funciona con cualquier IA
- Compatible con cualquier lenguaje de programación
- Editable manualmente si es necesario

### ✅ **Sincronizado**
- Tu interfaz y las IAs leen el mismo archivo
- Cambios manuales son detectados automáticamente
- Sin conflictos de versiones

### ✅ **Extensible**
- Fácil agregar nuevos campos al JSON
- Puedes crear comandos CLI personalizados
- Integración simple con otros sistemas

---

## 📝 Ejemplos de Uso Completos

### Escenario 1: Crear un proyecto nuevo con tareas

```bash
# Crear proyecto
PROJECT_ID=$(board add-project "Rediseño Web" "Actualizar sitio corporativo" | grep -oP 'proj_\w+')

# Crear tareas
board add-task "Wireframes iniciales" $PROJECT_ID --priority high
board add-task "Diseño de mockups" $PROJECT_ID --priority high
board add-task "Desarrollo frontend" $PROJECT_ID --priority medium
board add-task "Testing" $PROJECT_ID --priority low

# Ver el proyecto
board show-board $PROJECT_ID
```

### Escenario 2: Workflow de desarrollo

```bash
# Ver tareas pendientes
board show-board

# Encontrar tarea
board find-task "API"

# Mover a en progreso
board move-task task_abc123 in-progress

# Cuando termines
board move-task task_abc123 done
```

### Escenario 3: Desde tu interfaz web

```javascript
// Al cargar la página
async function loadBoard() {
  const response = await fetch('/api/board'); // Tu endpoint que lee board-data.json
  const data = await response.json();
  renderProjects(data.projects);
}

// Al crear una tarea desde la UI
async function createTask(title, projectId, priority) {
  await fetch('/api/tasks', {
    method: 'POST',
    body: JSON.stringify({ title, projectId, priority })
  });
  // Tu backend ejecuta: board add-task "..." ...
  loadBoard(); // Recargar
}

// Al arrastrar una tarea a otra columna
async function moveTask(taskId, newStatus) {
  await fetch(`/api/tasks/${taskId}`, {
    method: 'PATCH',
    body: JSON.stringify({ status: newStatus })
  });
  // Tu backend ejecuta: board move-task ... ...
  loadBoard();
}
```

---

## 🔧 Comandos de Mantenimiento

### Hacer backup del board

```bash
cp ~/board-data.json ~/board-backup-$(date +%Y%m%d).json
```

### Restaurar backup

```bash
cp ~/board-backup-20260325.json ~/board-data.json
```

### Ver cambios recientes

```bash
board show-board | head -20
```

---

## 🆘 Solución de Problemas

### El comando `board` no funciona

```bash
# Verifica que el alias esté configurado
alias board

# Si no está, créalo temporalmente
alias board="node ~/board-cli.js"

# O usa el comando completo
node ~/board-cli.js help
```

### Error: "No se encuentra el archivo"

```bash
# Inicializa el board
board init
```

### La interfaz no se actualiza

```bash
# Verifica que el archivo existe y tiene permisos
ls -la ~/board-data.json

# Verifica el contenido
cat ~/board-data.json
```

### IDs muy largos

Los IDs se autogeneran con timestamp + random para evitar colisiones. Si prefieres IDs más cortos, puedes modificar la función `generateId()` en `board-cli.js`.

---

## 📚 Archivos del Sistema

- **`board-data.json`**: Archivo de datos (proyectos y tareas)
- **`board-cli.js`**: Herramienta CLI para gestionar el board
- **`AI-INSTRUCTIONS.md`**: Documentación para IAs
- **`README.md`**: Esta guía

---

## 🎓 Próximos Pasos

1. **Instala el sistema** siguiendo la sección "Instalación Rápida"
2. **Crea un proyecto de prueba** con algunas tareas
3. **Integra tu interfaz gráfica** para leer/escribir el JSON
4. **Comparte `AI-INSTRUCTIONS.md`** con las IAs que uses
5. **Prueba crear tareas desde diferentes IAs** y verifica que se sincronicen

---

## 💬 Preguntas Frecuentes

**¿Puedo editar el JSON manualmente?**  
Sí, totalmente. Respeta la estructura y todo funcionará.

**¿Qué pasa si dos IAs modifican el archivo al mismo tiempo?**  
La última escritura gana. Para evitar esto, implementa locks o usa Git.

**¿Puedo usar esto con Git?**  
¡Sí! El archivo JSON es perfecto para versionarse con Git.

**¿Funciona en Windows?**  
Sí, solo necesitas Node.js instalado y ajustar las rutas (`%USERPROFILE%\board-data.json`).

**¿Puedo agregar campos personalizados?**  
Sí, agrega los campos que necesites al JSON. Las IAs los ignorarán o podrás instruirlas para usarlos.

---

## 📄 Licencia

Este sistema es de código abierto. Úsalo, modifícalo y compártelo libremente.

---

**¿Necesitas ayuda?** Solo dime qué quieres hacer y te ayudo a configurarlo.
