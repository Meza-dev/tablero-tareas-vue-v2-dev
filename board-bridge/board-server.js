const express = require('express');
const Database = require('better-sqlite3');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = 3001;

// Configuración de rutas - PORTABILIDAD
const DB_FILE = process.env.BOARD_DB || path.join(__dirname, 'board-db.sqlite');


// Inicializar conexión
const db = new Database(DB_FILE);

app.use(cors());
app.use(express.json());

// Obtener el board completo (Compatible con el store de Vue)
app.get('/api/board', (req, res) => {
  try {
    const projects = db.prepare('SELECT * FROM projects').all();
    const allTasks = db.prepare('SELECT * FROM tasks').all();
    const allSubtasks = db.prepare('SELECT * FROM subtasks').all();

    // Recomponer la estructura anidada
    const formattedProjects = projects.map(p => {
      const pTasks = allTasks
        .filter(t => t.project_id === p.id)
        .map(t => {
          const tSubtasks = allSubtasks
            .filter(st => st.task_id === t.id)
            .map(st => ({
              id: st.id,
              text: st.text,
              completed: !!st.completed
            }));
          
          return {
            id: t.id,
            titulo: t.title, // Vue espera 'titulo' y 'prioridad'
            title: t.title,
            descripcion: t.description || '',
            prioridad: t.priority,
            priority: t.priority,
            estado: t.status,
            status: t.status,
            fechaVencimiento: t.due_date,
            created: t.created_at,
            updated: t.updated_at,
            completed: t.completed_at,
            tags: t.tags ? t.tags.split(',') : [],
            subtasks: tSubtasks
          };
        });
      
      return {
        id: p.id,
        name: p.name,
        description: p.description || '',
        status: p.status,
        created: p.created_at,
        tasks: pTasks
      };
    });

    res.json({
      version: "2.0-sqlite",
      last_updated: new Date().toISOString(),
      projects: formattedProjects,
      config: {
        valid_statuses: ["todo", "in-progress", "review", "done", "on-hold", "rejected"],
        valid_priorities: ["low", "medium", "high", "urgent"]
      }
    });
  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Guardar el board completo (Compatible con el store de Vue)
app.post('/api/board', (req, res) => {
  const { projects } = req.body;
  
  if (!projects || !Array.isArray(projects)) {
    return res.status(400).json({ error: 'Formato inválido: se requiere array de proyectos' });
  }

  try {
    const sync = db.transaction(() => {
      // 1. Limpiar tablas (Simplificación para sincronización completa del store)
      // Nota: En una app grande se usaría UPSERT o patch, pero para este caso el store envía todo
      db.prepare('DELETE FROM subtasks').run();
      db.prepare('DELETE FROM tasks').run();
      db.prepare('DELETE FROM projects').run();

      const insertProj = db.prepare('INSERT INTO projects (id, name, description, status, created_at) VALUES (?, ?, ?, ?, ?)');
      const insertTask = db.prepare(`
        INSERT INTO tasks (id, project_id, title, description, status, priority, due_date, created_at, updated_at, completed_at, tags)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);
      const insertSubtask = db.prepare('INSERT INTO subtasks (id, task_id, text, completed, created_at) VALUES (?, ?, ?, ?, ?)');

      for (const p of projects) {
        insertProj.run(p.id, p.name, p.description || '', p.status || 'active', p.created || '');
        
        if (p.tasks && Array.isArray(p.tasks)) {
          for (const t of p.tasks) {
            const tagsStr = Array.isArray(t.tags) ? t.tags.join(',') : (t.tags || '');
            insertTask.run(
              t.id, p.id, t.titulo || t.title, t.descripcion || t.description || '', 
              t.estado || t.status || 'todo', t.prioridad || t.priority || 'medium',
              t.fechaVencimiento || '', t.created || '', t.updated || '', t.completed || '', tagsStr
            );

            if (t.subtasks && Array.isArray(t.subtasks)) {
              for (const st of t.subtasks) {
                insertSubtask.run(st.id, t.id, st.text, st.completed ? 1 : 0, '');
              }
            }
          }
        }
      }
    });

    sync();
    res.json({ success: true, last_updated: new Date().toISOString() });
  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 SQLite Board Server running at http://localhost:${PORT}`);
  console.log(`💾 Source: ${DB_FILE}`);
});
