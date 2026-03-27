#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const Database = require('better-sqlite3');

// Configuración de rutas - Ahora es PORTÁTIL (usa la DB en la misma carpeta por defecto)
const DB_FILE = process.env.BOARD_DB || path.join(__dirname, 'board-db.sqlite');
const OLD_DB_FILE = path.join(process.env.HOME || process.env.USERPROFILE || __dirname, 'board-db.sqlite');

// Si no hay DB local pero hay una global, avisar o usar? 
// Por ahora preferimos la local para que sea "clonable", pero si el usuario acaba de migrar:
if (!fs.existsSync(DB_FILE) && fs.existsSync(OLD_DB_FILE) && OLD_DB_FILE !== DB_FILE) {
  console.log(`💡 Detectada base de datos previa en el Home. Copiándola a la carpeta local para portabilidad...`);
  fs.copyFileSync(OLD_DB_FILE, DB_FILE);
}


// Inicializar conexión
const db = new Database(DB_FILE);

// Generar ID único
function generateId(prefix) {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 5);
  return `${prefix}_${timestamp}_${random}`;
}

// Comandos
const commands = {
  init() {
    db.exec(`
      CREATE TABLE IF NOT EXISTS projects (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT,
        status TEXT DEFAULT 'active',
        created_at TEXT
      );

      CREATE TABLE IF NOT EXISTS tasks (
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

      CREATE TABLE IF NOT EXISTS subtasks (
        id TEXT PRIMARY KEY,
        task_id TEXT,
        text TEXT NOT NULL,
        completed INTEGER DEFAULT 0,
        created_at TEXT,
        FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE
      );
    `);
    console.log(`✅ Base de datos inicializada en: ${DB_FILE}`);
  },

  'add-project'(name, description = '') {
    const id = generateId('proj');
    const created = new Date().toISOString().split('T')[0];
    const stmt = db.prepare('INSERT INTO projects (id, name, description, status, created_at) VALUES (?, ?, ?, ?, ?)');
    stmt.run(id, name, description, 'active', created);
    console.log(`✅ Proyecto creado: ${id} - "${name}"`);
    return id;
  },

  'add-task'(title, projectId, options = {}) {
    const id = generateId('task');
    const now = new Date().toISOString().split('T')[0];
    const stmt = db.prepare(`
      INSERT INTO tasks (id, project_id, title, description, status, priority, due_date, created_at, updated_at, tags)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    
    stmt.run(
      id, 
      projectId, 
      title, 
      options.description || '', 
      options.status || 'todo', 
      options.priority || 'medium', 
      options.due || '', 
      now, 
      now, 
      options.tags ? (Array.isArray(options.tags) ? options.tags.join(',') : options.tags) : ''
    );

    console.log(`✅ Tarea creada: ${id} - "${title}" en proyecto ${projectId}`);
    return id;
  },

  'move-task'(taskId, newStatus) {
    const validStatuses = ['todo', 'in-progress', 'review', 'done', 'on-hold', 'rejected'];
    if (!validStatuses.includes(newStatus)) {
      console.error(`❌ Estado inválido: ${newStatus}. Válidos: ${validStatuses.join(', ')}`);
      process.exit(1);
    }

    const now = new Date().toISOString().split('T')[0];
    const stmt = db.prepare('UPDATE tasks SET status = ?, updated_at = ?, completed_at = ? WHERE id = ?');
    const completedAt = newStatus === 'done' ? now : null;
    const result = stmt.run(newStatus, now, completedAt, taskId);

    if (result.changes === 0) {
      console.error(`❌ Tarea no encontrada: ${taskId}`);
      process.exit(1);
    }
    console.log(`✅ Tarea ${taskId} movida a ${newStatus}`);
  },

  'remove-task'(taskId) {
    const stmt = db.prepare('DELETE FROM tasks WHERE id = ?');
    const result = stmt.run(taskId);
    if (result.changes === 0) {
      console.error(`❌ Tarea no encontrada: ${taskId}`);
      process.exit(1);
    }
    console.log(`✅ Tarea eliminada: ${taskId}`);
  },

  'remove-project'(projectId) {
    const stmt = db.prepare('DELETE FROM projects WHERE id = ?');
    const result = stmt.run(projectId);
    if (result.changes === 0) {
      console.error(`❌ Proyecto no encontrado: ${projectId}`);
      process.exit(1);
    }
    console.log(`✅ Proyecto eliminado: ${projectId}`);
  },

  'show-board'(projectId = null) {
    let projects;
    if (projectId) {
      projects = db.prepare('SELECT * FROM projects WHERE id = ?').all(projectId);
    } else {
      projects = db.prepare('SELECT * FROM projects').all();
    }

    if (projects.length === 0) {
      console.log('No hay proyectos.');
      return;
    }

    console.log(`\n📋 BOARD (SQLite) - ${new Date().toLocaleString()}\n`);

    for (const project of projects) {
      console.log(`\n🗂️  ${project.name} (${project.id})`);
      console.log(`   ${project.description || 'Sin descripción'}`);

      const tasks = db.prepare('SELECT * FROM tasks WHERE project_id = ?').all(project.id);
      const statuses = ['todo', 'in-progress', 'review', 'done'];

      statuses.forEach(status => {
        const filtered = tasks.filter(t => t.status === status);
        if (filtered.length > 0) {
          console.log(`\n   📍 ${status.toUpperCase()}`);
          filtered.forEach(t => {
            const priority = t.priority === 'high' || t.priority === 'urgent' ? '⚠️ ' : '';
            console.log(`      ${priority}${t.id}: ${t.title}`);
          });
        }
      });
    }
    console.log('\n');
  },

  'list-projects'() {
    const rows = db.prepare(`
      SELECT p.*, 
        (SELECT COUNT(*) FROM tasks WHERE project_id = p.id) as total,
        (SELECT COUNT(*) FROM tasks WHERE project_id = p.id AND status = 'done') as done
      FROM projects p
    `).all();

    console.log('\n📁 PROYECTOS:\n');
    rows.forEach(p => {
      console.log(`  ${p.id}: ${p.name} (${p.done}/${p.total} tareas completadas)`);
    });
    console.log('');
  },

  'find-task'(searchTerm) {
    const rows = db.prepare(`
      SELECT t.*, p.name as project_name 
      FROM tasks t 
      JOIN projects p ON t.project_id = p.id
      WHERE t.title LIKE ? OR t.description LIKE ? OR t.id = ?
    `).all(`%${searchTerm}%`, `%${searchTerm}%`, searchTerm);

    console.log(`\n🔍 Buscando: "${searchTerm}"\n`);
    if (rows.length === 0) {
      console.log('  No se encontraron tareas.\n');
      return;
    }

    rows.forEach(t => {
      console.log(`  📌 ${t.id}: ${t.title}`);
      console.log(`     Proyecto: ${t.project_name} (${t.project_id})`);
      console.log(`     Estado: ${t.status} | Prioridad: ${t.priority}`);
      console.log('');
    });
  },

  urgent() {
    const today = new Date().toISOString().split('T')[0];
    const rows = db.prepare(`
      SELECT t.*, p.name as project_name 
      FROM tasks t 
      JOIN projects p ON t.project_id = p.id
      WHERE (t.priority IN ('urgent', 'high') OR (t.due_date != '' AND t.due_date <= ?))
      AND t.status != 'done'
    `).all(today);

    console.log('\n🔴 TAREAS URGENTES Y VENCIDAS\n');
    if (rows.length === 0) {
      console.log('  🎉 No hay tareas urgentes ni vencidas.\n');
      return;
    }

    rows.forEach(t => {
      let icon = t.priority === 'urgent' ? '🔴' : '🟠';
      if (t.due_date && t.due_date < today) icon = '💀';
      console.log(`  ${icon} [${t.priority.toUpperCase()}] ${t.title}`);
      console.log(`     📁 ${t.project_name} | 📍 ${t.status} ${t.due_date ? '| Vence: ' + t.due_date : ''}`);
      console.log('');
    });
  },

  status() {
    const stats = db.prepare(`
      SELECT 
        (SELECT COUNT(*) FROM projects) as total_projects,
        (SELECT COUNT(*) FROM tasks) as total_tasks,
        (SELECT COUNT(*) FROM tasks WHERE status = 'done') as done_tasks
      FROM projects LIMIT 1
    `).get() || { total_projects: 0, total_tasks: 0, done_tasks: 0 };

    const pct = stats.total_tasks > 0 ? Math.round((stats.done_tasks / stats.total_tasks) * 100) : 0;

    console.log('\n📊 RESUMEN GLOBAL (SQLite)');
    console.log('═'.repeat(40));
    console.log(`  📁 Proyectos:           ${stats.total_projects}`);
    console.log(`  📋 Total tareas:        ${stats.total_tasks}`);
    console.log(`  ✅ Completadas:         ${stats.done_tasks} (${pct}%)`);
    console.log('');
    
    const byStatus = db.prepare('SELECT status, COUNT(*) as count FROM tasks GROUP BY status').all();
    console.log('  POR ESTADO:');
    byStatus.forEach(s => {
      console.log(`    ${s.status.padEnd(14)} ${s.count}`);
    });
    console.log('═'.repeat(40) + '\n');
  },

  help() {
    console.log(`
📋 BOARD CLI (SQLite Edition)

COMANDOS:
  board init                     Inicializa la base de datos
  board add-project "Nom" "Desc" Crea un proyecto
  board add-task "Tit" <proj-id> [--priority high] [--status todo] [--due YYYY-MM-DD]
  board move-task <task-id> <st> Cambia el estado
  board remove-task <task-id>    Elimina una tarea
  board remove-project <id>      Elimina un proyecto
  board show-board [id]          Muestra el tablero
  board list-projects            Lista proyectos
  board find-task "texto"        Busca tareas
  board urgent                   Tareas críticas
  board status                   Estadísticas
  board help                     Muestra esta ayuda

DB: ${DB_FILE}
`);
  }
};

// Main logic
const [,, command, ...args] = process.argv;

function parseArgs(args) {
  const options = {};
  for (let i = 0; i < args.length; i++) {
    if (args[i].startsWith('--')) {
      const key = args[i].substring(2);
      options[key] = args[i + 1];
      i++;
    }
  }
  return options;
}

if (!command || /^(help|--help|-h)$/.test(command)) {
  commands.help();
} else if (commands[command]) {
  const options = parseArgs(args);
  const plainArgs = args.filter(a => !a.startsWith('--'));
  
  // Si el comando tiene guiones (como add-task), llamarlo con los argumentos planeados
  if (command === 'add-task') {
    commands['add-task'](plainArgs[0], plainArgs[1], options);
  } else if (command === 'add-project') {
    commands['add-project'](plainArgs[0], plainArgs[1]);
  } else {
    commands[command](...plainArgs);
  }
} else {

  console.error(`❌ Comando desconocido: ${command}`);
  process.exit(1);
}
