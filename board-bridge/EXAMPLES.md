# 🎯 Ejemplos de Uso del Board System

## Escenario 1: Flujo Completo de Proyecto

### Situación
Tienes que lanzar un nuevo producto y necesitas organizar todas las tareas.

### Paso a paso

```bash
# 1. Ver estado actual
board show-board

# 2. Crear el proyecto
board add-project "Lanzamiento Producto X" "Campaña de lanzamiento Q2 2026"
# Output: ✅ Proyecto creado: proj_ltxyz_abc - "Lanzamiento Producto X"

# 3. Crear tareas de diseño
board add-task "Diseñar empaque del producto" proj_ltxyz_abc --priority high
board add-task "Crear mockups para redes sociales" proj_ltxyz_abc --priority medium
board add-task "Diseñar landing page" proj_ltxyz_abc --priority high

# 4. Crear tareas de marketing
board add-task "Estrategia de contenidos" proj_ltxyz_abc --priority urgent
board add-task "Planificar anuncios pagados" proj_ltxyz_abc --priority medium
board add-task "Preparar email marketing" proj_ltxyz_abc --priority low

# 5. Ver el proyecto completo
board show-board proj_ltxyz_abc

# 6. Empezar a trabajar en una tarea
board find-task "empaque"
# Output: task_xyz123: Diseñar empaque del producto

board move-task task_xyz123 in-progress

# 7. Cuando termines la tarea
board move-task task_xyz123 done

# 8. Ver progreso del proyecto
board show-board proj_ltxyz_abc
```

---

## Escenario 2: Interacción con IA (Claude)

### Situación
Estás trabajando en un proyecto de desarrollo web y quieres que Claude te ayude a gestionar tareas.

### Conversación con Claude

**Tú:** "Estoy trabajando en el proyecto de rediseño web, crea una tarea para implementar el formulario de contacto"

**Claude ejecuta:**
```bash
# 1. Primero veo qué proyectos existen
board list-projects
# Output: proj_web_abc: Rediseño Web (2/8 tareas completadas)

# 2. Creo la tarea
board add-task "Implementar formulario de contacto" proj_web_abc --priority high

# 3. Confirmo
✅ Tarea creada: task_form_xyz - "Implementar formulario de contacto"
📋 Proyecto: Rediseño Web (proj_web_abc)
📍 Estado: todo
⚠️ Prioridad: high
```

**Tú:** "Mueve la tarea de login a en progreso"

**Claude ejecuta:**
```bash
# 1. Busco la tarea
board find-task "login"
# Output: task_login_abc: Implementar sistema de login

# 2. La muevo
board move-task task_login_abc in-progress

✅ Tarea task_login_abc: todo → in-progress
```

**Tú:** "Muéstrame todo el proyecto"

**Claude ejecuta:**
```bash
board show-board proj_web_abc

📋 BOARD - Actualizado: 3/25/2026

🗂️  Rediseño Web (proj_web_abc)
   Actualizar sitio corporativo

   📍 TODO
      ⚠️ task_form_xyz: Implementar formulario de contacto
      task_footer_abc: Actualizar footer
      task_seo_xyz: Optimizar SEO

   📍 IN-PROGRESS
      task_login_abc: Implementar sistema de login
      task_nav_xyz: Rediseñar navegación

   📍 REVIEW
      task_home_abc: Diseño de página de inicio

   📍 DONE
      task_plan_xyz: Planificación inicial
      task_wire_abc: Wireframes
```

---

## Escenario 3: Uso desde Cursor/VS Code

### Situación
Estás programando en Cursor y quieres que la IA gestione tus tareas del proyecto.

### En el chat de Cursor

**Tú:** "@workspace Crea una tarea para refactorizar el módulo de autenticación en mi proyecto de backend"

**Cursor ejecuta:**
```javascript
// Cursor detecta el comando y ejecuta:
const { exec } = require('child_process');

exec('board list-projects', (err, stdout) => {
  // Encuentra: proj_backend_xyz
  
  exec('board add-task "Refactorizar módulo de autenticación" proj_backend_xyz --priority medium', 
    (err, stdout) => {
      console.log(stdout);
      // ✅ Tarea creada: task_refactor_abc
    }
  );
});
```

**Tú:** "Muéstrame las tareas pendientes del backend"

**Cursor muestra:**
```bash
board show-board proj_backend_xyz

📍 TODO
   task_refactor_abc: Refactorizar módulo de autenticación
   task_api_xyz: Documentar API endpoints
   
📍 IN-PROGRESS
   task_db_abc: Migración de base de datos
```

---

## Escenario 4: Edición Manual + Sincronización con IA

### Situación
Editas manualmente el JSON para hacer cambios rápidos, luego pides ayuda a la IA.

### Tu flujo de trabajo

1. **Editas manualmente** `~/board-data.json`:
```json
{
  "projects": [
    {
      "id": "proj_marketing_abc",
      "name": "Campaña Q2",
      "tasks": [
        {
          "id": "task_content_001",
          "title": "Crear 10 posts para Instagram",
          "status": "todo",
          "priority": "high"
        }
      ]
    }
  ]
}
```

2. **Guardas el archivo**

3. **Le pides a Claude:**
   "Muéstrame las tareas de marketing que tengo pendientes"

4. **Claude lee el archivo actualizado:**
```bash
board show-board proj_marketing_abc

📍 TODO
   ⚠️ task_content_001: Crear 10 posts para Instagram
```

5. **Claude detecta tu cambio manual y lo reconoce**
   "Tienes 1 tarea pendiente de alta prioridad: 'Crear 10 posts para Instagram'"

---

## Escenario 5: Múltiples Proyectos Simultáneos

### Situación
Trabajas en varios proyectos al mismo tiempo y necesitas organizarte.

### Comandos útiles

```bash
# Ver todos los proyectos
board list-projects

📁 PROYECTOS:
  proj_web_abc: Rediseño Web (3/8 tareas completadas)
  proj_app_xyz: App Móvil (0/12 tareas completadas)
  proj_marketing_def: Campaña Q2 (5/6 tareas completadas)

# Ver solo un proyecto específico
board show-board proj_app_xyz

# Buscar tareas en todos los proyectos
board find-task "diseño"

🔍 Buscando: "diseño"

📌 task_design_001: Diseñar pantalla de login
   Proyecto: App Móvil (proj_app_xyz)
   Estado: in-progress | Prioridad: high

📌 task_design_002: Diseño de landing page
   Proyecto: Rediseño Web (proj_web_abc)
   Estado: review | Prioridad: medium

# Mover tareas de diferentes proyectos
board move-task task_design_001 review
board move-task task_design_002 done
```

---

## Escenario 6: Integración con tu Interfaz Web

### Situación
Tu interfaz gráfica lee y escribe el mismo archivo que usan las IAs.

### Ejemplo de código para tu interfaz

```javascript
// api/board.js (backend de tu interfaz)

const fs = require('fs').promises;
const { exec } = require('child_process');
const util = require('util');
const execPromise = util.promisify(exec);

const BOARD_FILE = process.env.BOARD_FILE || '~/board-data.json';

// Endpoint GET /api/board - Leer todo el board
app.get('/api/board', async (req, res) => {
  const data = await fs.readFile(BOARD_FILE, 'utf8');
  res.json(JSON.parse(data));
});

// Endpoint POST /api/projects - Crear proyecto
app.post('/api/projects', async (req, res) => {
  const { name, description } = req.body;
  
  // Usar el CLI en vez de editar JSON directamente
  const { stdout } = await execPromise(
    `board add-project "${name}" "${description}"`
  );
  
  // Extraer el ID del output
  const projectId = stdout.match(/proj_[\w]+/)[0];
  
  res.json({ id: projectId, name, description });
});

// Endpoint POST /api/tasks - Crear tarea
app.post('/api/tasks', async (req, res) => {
  const { title, projectId, priority, status } = req.body;
  
  await execPromise(
    `board add-task "${title}" ${projectId} --priority ${priority} --status ${status}`
  );
  
  res.json({ success: true });
});

// Endpoint PATCH /api/tasks/:id - Mover tarea
app.patch('/api/tasks/:id', async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  
  await execPromise(`board move-task ${id} ${status}`);
  
  res.json({ success: true });
});

// WebSocket para actualizaciones en tiempo real
const wss = new WebSocketServer({ port: 8080 });

fs.watch(BOARD_FILE, (eventType) => {
  if (eventType === 'change') {
    // Notificar a todos los clientes conectados
    fs.readFile(BOARD_FILE, 'utf8').then(data => {
      wss.clients.forEach(client => {
        client.send(JSON.stringify({ type: 'board-update', data: JSON.parse(data) }));
      });
    });
  }
});
```

```javascript
// frontend.js (tu interfaz web)

let ws = new WebSocket('ws://localhost:8080');

// Escuchar actualizaciones en tiempo real
ws.onmessage = (event) => {
  const { type, data } = JSON.parse(event.data);
  if (type === 'board-update') {
    renderBoard(data); // Actualizar UI
  }
};

// Crear tarea desde la UI
async function createTaskFromUI(title, projectId, priority) {
  await fetch('/api/tasks', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title, projectId, priority, status: 'todo' })
  });
  
  // La actualización llegará automáticamente por WebSocket
}

// Drag and drop para mover tareas
function onTaskDrop(taskId, newColumn) {
  const statusMap = {
    'column-todo': 'todo',
    'column-progress': 'in-progress',
    'column-review': 'review',
    'column-done': 'done'
  };
  
  const newStatus = statusMap[newColumn];
  
  fetch(`/api/tasks/${taskId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status: newStatus })
  });
}
```

---

## Escenario 7: Backup Automático

### Situación
Quieres asegurarte de no perder tus datos.

### Script de backup automático

```bash
#!/bin/bash
# backup-board.sh

BOARD_FILE=~/board-data.json
BACKUP_DIR=~/board-backups

mkdir -p $BACKUP_DIR

# Crear backup con timestamp
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
cp $BOARD_FILE "$BACKUP_DIR/board-backup-$TIMESTAMP.json"

# Mantener solo los últimos 30 backups
ls -t $BACKUP_DIR/board-backup-*.json | tail -n +31 | xargs -r rm

echo "✅ Backup creado: board-backup-$TIMESTAMP.json"
```

### Configurar cron para backup diario

```bash
# Editar crontab
crontab -e

# Agregar esta línea (backup todos los días a las 23:00)
0 23 * * * /ruta/a/backup-board.sh
```

---

## Escenario 8: Uso con Git

### Situación
Quieres versionar tu board con Git para tener historial completo.

### Setup

```bash
cd ~
git init board-project
cd board-project

# Mover o copiar el board
mv ~/board-data.json ./board-data.json

# Actualizar BOARD_FILE
export BOARD_FILE=~/board-project/board-data.json

# Primer commit
git add board-data.json
git commit -m "Initial board setup"

# Cada vez que hagas cambios
git add board-data.json
git commit -m "Agregadas tareas de marketing"
```

### Ver historial de cambios

```bash
# Ver commits
git log --oneline

# Ver cambios en una versión específica
git show abc123:board-data.json

# Restaurar versión anterior
git checkout HEAD~3 -- board-data.json
```

---

## Escenario 9: Colaboración en Equipo

### Situación
Tu equipo comparte el mismo board en Dropbox/Google Drive.

### Setup

```bash
# Configurar en todos los equipos
export BOARD_FILE=~/Dropbox/team-board/board-data.json

# O en Google Drive
export BOARD_FILE=~/Google\ Drive/team-board/board-data.json

# Agregar a ~/.bashrc
echo 'export BOARD_FILE=~/Dropbox/team-board/board-data.json' >> ~/.bashrc
```

### Workflow del equipo

**Desarrollador 1:**
```bash
board add-task "Implementar API de usuarios" proj_backend_abc --priority high
```

**Desarrollador 2 (30 segundos después):**
```bash
board show-board

# Ve la tarea creada por Desarrollador 1
📍 TODO
   ⚠️ task_api_xyz: Implementar API de usuarios
```

**Designer (usando Claude):**
"Crea una tarea para diseñar la pantalla de perfil"
→ Claude ejecuta `board add-task ...`

**Project Manager (desde interfaz web):**
→ Mueve tareas a "done" desde la UI
→ Todos ven los cambios automáticamente

---

## Tips y Trucos

### 1. Alias útiles
```bash
# En ~/.bashrc
alias bt="board show-board"  # Ver todo rápido
alias bp="board list-projects"  # Listar proyectos
alias bf="board find-task"  # Buscar tarea
```

### 2. Crear proyecto con template de tareas
```bash
# create-web-project.sh
#!/bin/bash
PROJECT_ID=$(board add-project "$1" "$2" | grep -oP 'proj_\w+')

board add-task "Wireframes" $PROJECT_ID --priority high
board add-task "Diseño visual" $PROJECT_ID --priority high
board add-task "Desarrollo frontend" $PROJECT_ID --priority medium
board add-task "Desarrollo backend" $PROJECT_ID --priority medium
board add-task "Testing" $PROJECT_ID --priority low
board add-task "Deploy" $PROJECT_ID --priority low

echo "✅ Proyecto $1 creado con 6 tareas template"
board show-board $PROJECT_ID
```

### 3. Estadísticas rápidas
```bash
# Ver cuántas tareas tienes en total
cat ~/board-data.json | jq '[.projects[].tasks[]] | length'

# Ver cuántas están completadas
cat ~/board-data.json | jq '[.projects[].tasks[] | select(.status=="done")] | length'

# Ver tareas de alta prioridad
cat ~/board-data.json | jq '.projects[].tasks[] | select(.priority=="high" or .priority=="urgent") | .title'
```

---

¿Necesitas un ejemplo específico de cómo usar el board en tu situación particular? ¡Dime y te lo preparo!
