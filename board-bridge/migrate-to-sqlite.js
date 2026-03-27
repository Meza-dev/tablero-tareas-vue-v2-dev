const Database = require('better-sqlite3');
const fs = require('fs');
const path = require('path');

const BOARD_FILE = path.join(process.env.HOME || process.env.USERPROFILE || __dirname, 'board-data.json');

const DB_FILE = path.join(process.env.HOME || process.env.USERPROFILE || __dirname, 'board-db.sqlite');


console.log('🚀 Iniciando migración a SQLite...');

// 1. Leer JSON actual
if (!fs.existsSync(BOARD_FILE)) {
  console.error('❌ No se encontró el archivo board-data.json');
  process.exit(1);
}

const data = JSON.parse(fs.readFileSync(BOARD_FILE, 'utf8'));

// 2. Inicializar DB
const db = new Database(DB_FILE);

// Borrar tablas si existen para empezar limpio (solo para esta migración)
db.exec(`
  DROP TABLE IF EXISTS subtasks;
  DROP TABLE IF EXISTS tasks;
  DROP TABLE IF EXISTS projects;
`);

// 3. Crear tablas
db.exec(`
  CREATE TABLE projects (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    status TEXT DEFAULT 'active',
    created_at TEXT
  );

  CREATE TABLE tasks (
    id TEXT PRIMARY KEY,
    project_id TEXT,
    title TEXT NOT NULL,
    description TEXT,
    status TEXT DEFAULT 'todo',
    priority TEXT DEFAULT 'medium',
    due_date TEXT,
    created_at TEXT,
    updated_at TEXT,
    completed_at TEXT,
    tags TEXT,
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
  );

  CREATE TABLE subtasks (
    id TEXT PRIMARY KEY,
    task_id TEXT,
    text TEXT NOT NULL,
    completed INTEGER DEFAULT 0,
    created_at TEXT,
    FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE
  );
`);

console.log('✅ Tablas creadas correctamente.');

// 4. Migrar datos
const insertProject = db.prepare('INSERT INTO projects (id, name, description, status, created_at) VALUES (?, ?, ?, ?, ?)');
const insertTask = db.prepare(`
  INSERT INTO tasks (id, project_id, title, description, status, priority, due_date, created_at, updated_at, completed_at, tags)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`);
const insertSubtask = db.prepare('INSERT INTO subtasks (id, task_id, text, completed, created_at) VALUES (?, ?, ?, ?, ?)');

db.transaction(() => {
  for (const project of data.projects) {
    insertProject.run(
      project.id,
      project.name || 'Proyecto sin nombre',
      project.description || '',
      project.status || 'active',
      project.created || new Date().toISOString().split('T')[0]
    );

    if (project.tasks && Array.isArray(project.tasks)) {
      for (const task of project.tasks) {
        // Unificar campos del JSON viejo (unos usan 'title', otros 'titulo')
        const title = task.title || task.titulo || 'Sin título';
        const status = task.status || task.estado || 'todo';
        const priority = task.priority || task.prioridad || 'medium';
        const tags = Array.isArray(task.tags) ? task.tags.join(',') : (task.tags || '');

        insertTask.run(
          task.id,
          project.id,
          title,
          task.description || '',
          status,
          priority.toLowerCase(),
          task.fechaVencimiento || '',
          task.created || new Date().toISOString().split('T')[0],
          task.updated || new Date().toISOString().split('T')[0],
          task.completed || '',
          tags
        );

        if (task.subtasks && Array.isArray(task.subtasks)) {
          for (const st of task.subtasks) {
            insertSubtask.run(
              st.id,
              task.id,
              st.text,
              st.completed ? 1 : 0,
              st.created || new Date().toISOString().split('T')[0]
            );
          }
        }
      }
    }
  }
})();

console.log('🎉 Migración completada con éxito.');
db.close();
