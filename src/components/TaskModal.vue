<script setup>
import { ref, onMounted } from 'vue'

const props = defineProps({
  task: {
    type: Object,
    required: true
  },
  isNew: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['close', 'save', 'delete'])

const localTask = ref({ ...props.task })

const handleSave = () => {
  if (localTask.value.titulo.trim()) {
    emit('save', localTask.value)
  }
}

const priorities = ['Baja', 'Media', 'Alta']
const statuses = [
  { id: 'pendiente', name: 'Pendiente' },
  { id: 'en-curso', name: 'En Curso' },
  { id: 'completada', name: 'Completada' },
  { id: 'rechazada', name: 'Rechazada' },
  { id: 'en-espera', name: 'En Espera' }
]
</script>

<template>
  <div class="modal-backdrop" @click.self="$emit('close')">
    <div class="modal-card">
      <div class="modal-header">
        <input 
          v-model="localTask.titulo" 
          class="title-input" 
          placeholder="Título de la tarea..."
          autofocus
        />
        <button class="close-btn" @click="$emit('close')">×</button>
      </div>

      <div class="modal-body">
        <div class="form-group">
          <label>Descripción</label>
          <textarea 
            v-model="localTask.descripcion" 
            placeholder="Añade una descripción detallada... 
Tip: Puedes usar guiones (-) para listas"
            rows="6"
          ></textarea>
        </div>

        <div class="settings-row">
          <div class="form-group half">
            <label>Estado</label>
            <select v-model="localTask.estado">
              <option v-for="s in statuses" :key="s.id" :value="s.id">{{ s.name }}</option>
            </select>
          </div>

          <div class="form-group half">
            <label>Prioridad</label>
            <div class="priority-selector">
              <button 
                v-for="p in priorities" 
                :key="p"
                class="priority-btn"
                :class="{ active: localTask.prioridad === p, [p.toLowerCase()]: true }"
                @click="localTask.prioridad = p"
              >
                {{ p }}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div class="modal-footer">
        <button v-if="!isNew" class="btn-delete" @click="emit('delete', task.id)">
          Eliminar Tarea
        </button>
        <div class="spacer"></div>
        <button class="btn-ghost" @click="$emit('close')">Cancelar</button>
        <button class="btn-primary" @click="handleSave">
          {{ isNew ? 'Crear Tarea' : 'Guardar Cambios' }}
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.modal-card {
  background: var(--surface-color);
  width: 100%;
  max-width: 650px;
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-lg);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  border: 1px solid var(--glass-border);
}

.modal-header {
  padding: 1.5rem 2rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  border-bottom: 1px solid var(--border-color);
}

.title-input {
  background: transparent;
  border: none;
  font-size: 1.5rem;
  font-weight: 700;
  color: white;
  width: 100%;
  outline: none;
  font-family: 'Outfit', sans-serif;
}

.close-btn {
  font-size: 2rem;
  background: transparent;
  color: var(--text-secondary);
  padding: 0;
}

.modal-body {
  padding: 2rem;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

label {
  display: block;
  font-size: 0.85rem;
  color: var(--text-secondary);
  margin-bottom: 0.5rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

textarea {
  width: 100%;
  background: var(--bg-color);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  color: white;
  padding: 1rem;
  font-family: inherit;
  font-size: 1rem;
  resize: vertical;
  outline: none;
}

textarea:focus {
  border-color: var(--accent-color);
}

.settings-row {
  display: flex;
  gap: 1.5rem;
}

.form-group.half {
  flex: 1;
}

select {
  width: 100%;
  background: var(--bg-color);
  border: 1px solid var(--border-color);
  color: white;
  padding: 0.75rem;
  border-radius: var(--radius-md);
  outline: none;
}

.priority-selector {
  display: flex;
  gap: 0.5rem;
}

.priority-btn {
  flex: 1;
  font-size: 0.8rem;
  background: var(--bg-color);
  border: 1px solid var(--border-color);
  color: var(--text-secondary);
  padding: 0.5rem;
}

.priority-btn.active.alta { background: rgba(239, 68, 68, 0.2); color: #ef4444; border-color: #ef4444; }
.priority-btn.active.media { background: rgba(245, 158, 11, 0.2); color: #f59e0b; border-color: #f59e0b; }
.priority-btn.active.baja { background: rgba(16, 185, 129, 0.2); color: #10b981; border-color: #10b981; }

.modal-footer {
  padding: 1.5rem 2rem;
  background: rgba(0, 0, 0, 0.2);
  display: flex;
  align-items: center;
  gap: 1rem;
}

.btn-delete {
  background: transparent;
  color: #ef4444;
  padding: 0.5rem;
  font-size: 0.9rem;
}

.btn-delete:hover {
  text-decoration: underline;
}

.spacer {
  flex: 1;
}
</style>
