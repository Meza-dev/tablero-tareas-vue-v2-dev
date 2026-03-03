<script setup>
import { ref, computed } from 'vue'
import { useTaskStore } from '../stores/taskStore'
import { useRouter } from 'vue-router'

const props = defineProps({
  id: {
    type: String,
    required: true
  }
})

const taskStore = useTaskStore()
const router = useRouter()

const board = computed(() => taskStore.boards.find(b => b.id === props.id))

// Modals State
const showTaskModal = ref(false)
const selectedTask = ref(null)
const isEditing = ref(false)

// Form State
const taskForm = ref({
  titulo: '',
  descripcion: '',
  prioridad: 'Media',
  estado: 'pendiente'
})

const tasksByStatus = computed(() => {
  const grouped = {}
  taskStore.columns.forEach(col => {
    grouped[col.id] = board.value?.tasks.filter(t => t.estado === col.id) || []
  })
  return grouped
})

const goBack = () => router.push({ name: 'home' })

const priorityConfig = (priority) => {
  const configs = {
    'Alta': { color: '#EF4444', label: 'High' },
    'Media': { color: '#F59E0B', label: 'Medium' },
    'Baja': { color: '#10B981', label: 'Low' }
  }
  return configs[priority] || { color: 'var(--accent-color)', label: priority }
}

// DRAG AND DROP
const onDragStart = (evt, task) => {
  evt.dataTransfer.dropEffect = 'move'
  evt.dataTransfer.effectAllowed = 'move'
  evt.dataTransfer.setData('taskId', task.id)
  evt.dataTransfer.setData('sourceBoardId', props.id)
}

const onDrop = (evt, newStatus) => {
  const taskId = evt.dataTransfer.getData('taskId')
  taskStore.moveTask(props.id, taskId, newStatus)
}

// MODAL LOGIC
const openCreateModal = (status = 'pendiente') => {
  isEditing.value = false
  taskForm.value = { titulo: '', descripcion: '', prioridad: 'Media', estado: status }
  showTaskModal.value = true
}

const openEditModal = (task) => {
  selectedTask.value = task
  isEditing.value = true
  taskForm.value = { ...task }
  showTaskModal.value = true
}

const handleTaskSubmit = () => {
  if (!taskForm.value.titulo.trim()) return
  
  if (isEditing.value) {
    taskStore.updateTask(props.id, selectedTask.value.id, taskForm.value)
  } else {
    taskStore.addTask(props.id, taskForm.value)
  }
  showTaskModal.value = false
}

const deleteTask = () => {
  if (confirm('¿Estás seguro de eliminar esta tarea?')) {
    taskStore.deleteTask(props.id, selectedTask.value.id)
    showTaskModal.value = false
  }
}

const confirmDeleteBoard = () => {
  if (confirm(`¿Estás seguro de que deseas eliminar el tablero "${board.value.name}"? Esta acción no se puede deshacer.`)) {
    taskStore.deleteBoard(props.id)
    goBack()
  }
}

// SUBTASKS LOGIC
const newSubtaskText = ref('')
const handleAddSubtask = () => {
  if (!newSubtaskText.value.trim()) return
  taskStore.addSubtask(props.id, selectedTask.value.id, newSubtaskText.value)
  newSubtaskText.value = ''
}

const completedSubtasksCount = computed(() => {
  if (!selectedTask.value?.subtasks) return 0
  return selectedTask.value.subtasks.filter(st => st.completed).length
})

const getTaskProgress = (task) => {
  if (!task.subtasks || task.subtasks.length === 0) return 0
  const completed = task.subtasks.filter(st => st.completed).length
  return Math.round((completed / task.subtasks.length) * 100)
}
</script>

<template>
  <div v-if="board" class="board-wrapper">
    <div class="ambient-glow"></div>

    <div class="board-container">
      <header class="board-header">
        <div class="header-left">
          <nav class="breadcrumb" @click="goBack">
            <span class="root-link">Proyectos</span>
            <span class="separator">/</span>
            <span class="current-board">{{ board.name }}</span>
            <button class="delete-board-header" @click.stop="confirmDeleteBoard" title="Eliminar este tablero">
              <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
            </button>
          </nav>
        </div>
        
        <div class="header-right">
          <button class="btn-primary-premium" @click="openCreateModal()">
            <span class="icon">+</span>
            <span>Nueva Tarea</span>
          </button>
        </div>
      </header>

      <div class="kanban-scroller">
        <div class="kanban-board">
          <div 
            v-for="column in taskStore.columns" 
            :key="column.id" 
            class="kanban-column"
            @drop="onDrop($event, column.id)"
            @dragover.prevent
            @dragenter.prevent
          >
            <div class="column-header">
              <div class="status-marker" :style="{ backgroundColor: column.color }"></div>
              <h4>{{ column.name }}</h4>
              <span class="count">{{ tasksByStatus[column.id].length }}</span>
            </div>

            <div class="task-list">
              <transition-group name="list">
                <div 
                  v-for="task in tasksByStatus[column.id]" 
                  :key="task.id" 
                  class="task-card"
                  draggable="true"
                  @dragstart="onDragStart($event, task)"
                  @click="openEditModal(task)"
                >
                  <div class="card-meta">
                    <span 
                      class="priority-tag" 
                      :style="{ color: priorityConfig(task.prioridad).color, backgroundColor: priorityConfig(task.prioridad).color + '15' }"
                    >
                      {{ priorityConfig(task.prioridad).label }}
                    </span>
                    <div class="meta-right">
                      <span class="task-id">TM-{{ task.id.slice(0, 4) }}</span>
                      <button class="quick-delete" @click.stop="taskStore.deleteTask(id, task.id)" title="Eliminar tarea">
                        <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                      </button>
                    </div>
                  </div>
                  <h5 class="task-title">{{ task.titulo }}</h5>
                  <p v-if="task.descripcion" class="task-desc">{{ task.descripcion }}</p>
                  
                  <div class="card-footer">
                    <div class="footer-left">
                      <div v-if="task.subtasks?.length > 0" class="progress-mini" :title="`${getTaskProgress(task)}% completado`">
                        <div class="progress-bar-container">
                          <div class="progress-bar" :style="{ width: getTaskProgress(task) + '%' }"></div>
                        </div>
                        <span class="progress-text">{{ task.subtasks.filter(st => st.completed).length }}/{{ task.subtasks.length }}</span>
                      </div>
                    </div>
                    <div class="avatar-mini">{{ task.titulo[0] }}</div>
                  </div>
                </div>
              </transition-group>
              
              <div 
                class="add-task-inline" 
                @click="openCreateModal(column.id)"
              >
                + Añadir Tarea
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Task Detail / Create Modal -->
    <Transition name="modal">
      <div v-if="showTaskModal" class="modal-overlay" @click.self="showTaskModal = false">
        <div class="modal-content task-modal">
          <header class="modal-header">
            <div class="header-info">
              <div class="status-pill" :style="{ backgroundColor: taskStore.columns.find(c => c.id === taskForm.estado)?.color + '20', color: taskStore.columns.find(c => c.id === taskForm.estado)?.color }">
                {{ taskStore.columns.find(c => c.id === taskForm.estado)?.name }}
              </div>
              <span v-if="isEditing" class="task-id-large">TM-{{ selectedTask.id.slice(0, 4) }}</span>
            </div>
            <button class="close-btn" @click="showTaskModal = false">&times;</button>
          </header>
          
          <div class="modal-body">
            <input 
              v-model="taskForm.titulo" 
              class="title-input" 
              placeholder="Título de la tarea"
              @keyup.enter="handleTaskSubmit"
            >
            
            <div class="meta-inputs">
              <div class="input-item">
                <label>Prioridad</label>
                <select v-model="taskForm.prioridad">
                  <option>Baja</option>
                  <option>Media</option>
                  <option>Alta</option>
                </select>
              </div>
              <div class="input-item">
                <label>Estado</label>
                <select v-model="taskForm.estado">
                  <option v-for="col in taskStore.columns" :key="col.id" :value="col.id">
                    {{ col.name }}
                  </option>
                </select>
              </div>
            </div>

            <div class="desc-section">
              <label>Descripción</label>
              <textarea 
                v-model="taskForm.descripcion" 
                placeholder="Añade una descripción detallada..."
                rows="4"
              ></textarea>
            </div>

            <!-- Subtasks Section -->
            <div v-if="isEditing" class="subtasks-section">
              <label>Lista de verificación ({{ completedSubtasksCount }}/{{ selectedTask.subtasks?.length || 0 }})</label>
              <div class="subtasks-list">
                <div v-for="st in selectedTask.subtasks" :key="st.id" class="subtask-item">
                  <input 
                    type="checkbox" 
                    :checked="st.completed" 
                    @change="taskStore.toggleSubtask(id, selectedTask.id, st.id)"
                  >
                  <span :class="{ completed: st.completed }">{{ st.text }}</span>
                  <button class="remove-st" @click="taskStore.deleteSubtask(id, selectedTask.id, st.id)">&times;</button>
                </div>
              </div>
              <div class="add-subtask">
                <input 
                  v-model="newSubtaskText" 
                  placeholder="Añadir paso..."
                  @keyup.enter="handleAddSubtask"
                >
                <button @click="handleAddSubtask">Añadir</button>
              </div>
            </div>
          </div>

          <footer class="modal-footer">
            <button v-if="isEditing" class="btn-danger" @click="deleteTask">Eliminar</button>
            <div class="footer-right">
              <button class="btn-secondary" @click="showTaskModal = false">Cancelar</button>
              <button class="btn-primary" @click="handleTaskSubmit">
                {{ isEditing ? 'Guardar Cambios' : 'Crear Tarea' }}
              </button>
            </div>
          </footer>
        </div>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.board-wrapper {
  min-height: 100vh;
  background-color: var(--bg-color);
  position: relative;
  overflow: hidden;
}

.ambient-glow {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 100vh;
  background: var(--bg-ambient);
  pointer-events: none;
  z-index: 0;
}

.board-container {
  position: relative;
  z-index: 1;
  padding: var(--space-8) var(--space-12);
  display: flex;
  flex-direction: column;
  height: 100vh;
}

.board-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: var(--space-8);
}

.breadcrumb {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  cursor: pointer;
  padding: var(--space-2) var(--space-4);
  background: rgba(255, 255, 255, 0.03);
  border-radius: var(--radius-sm);
  border: 1px solid var(--border-color);
  transition: var(--transition-main);
}

.breadcrumb:hover {
  background: rgba(255, 255, 255, 0.06);
  border-color: var(--border-hover);
}

.root-link {
  color: var(--text-secondary);
  font-size: 0.9rem;
}

.current-board {
  color: var(--text-primary);
  font-weight: 700;
  font-size: 1rem;
}

.delete-board-header {
  background: transparent;
  border: none;
  color: var(--text-muted);
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  margin-left: var(--space-2);
}

.delete-board-header:hover {
  background: rgba(239, 68, 68, 0.15);
  color: #EF4444;
}

.btn-primary-premium {
  background: var(--accent-color);
  color: white;
  padding: var(--space-3) var(--space-6);
  border-radius: var(--radius-md);
  font-weight: 700;
  box-shadow: 0 4px 20px rgba(99, 102, 241, 0.3);
  transition: var(--transition-main);
}

.btn-primary-premium:hover {
  transform: translateY(-2px);
  background: #7477ff;
}

.kanban-scroller {
  flex: 1;
  overflow-x: auto;
  padding-bottom: var(--space-8);
}

.kanban-board {
  display: flex;
  gap: var(--space-6);
  height: 100%;
}

.kanban-column {
  min-width: 300px;
  max-width: 300px;
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.column-header {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding: 0 var(--space-2);
}

.status-marker {
  width: 8px;
  height: 8px;
  border-radius: 50%;
}

.column-header h4 {
  font-size: 0.8rem;
  font-weight: 700;
  color: var(--text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.08em;
  flex: 1;
}

.count {
  font-size: 0.7rem;
  background: rgba(255, 255, 255, 0.04);
  padding: 2px 8px;
  border-radius: 10px;
  color: var(--text-muted);
}

.task-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
  min-height: 200px;
}

.task-card {
  background-color: var(--surface-secondary);
  border: 1px solid var(--border-color);
  padding: var(--space-6);
  border-radius: var(--radius-lg);
  transition: var(--transition-main);
  cursor: grab;
  position: relative;
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.task-card:hover {
  border-color: rgba(255, 255, 255, 0.2);
  transform: translateY(-2px);
  background-color: var(--surface-elevated);
}

.card-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.priority-tag {
  font-size: 0.6rem;
  font-weight: 800;
  text-transform: uppercase;
  padding: 2px 6px;
  border-radius: 4px;
}

.meta-right {
  display: flex;
  align-items: center;
  gap: var(--space-2);
}

.task-id {
  font-size: 0.65rem;
  color: var(--text-muted);
  font-family: monospace;
}

.quick-delete {
  background: transparent;
  border: none;
  color: var(--text-muted);
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  opacity: 0;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.task-card:hover .quick-delete {
  opacity: 1;
}

.quick-delete:hover {
  background: rgba(239, 68, 68, 0.15);
  color: #EF4444;
}

.task-title {
  font-size: 0.95rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
}

.task-desc {
  font-size: 0.8rem;
  color: var(--text-secondary);
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.avatar-mini {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: var(--accent-color);
  color: white;
  font-size: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
}

.add-task-inline {
  padding: var(--space-3);
  border: 1px dashed var(--border-color);
  border-radius: var(--radius-md);
  text-align: center;
  color: var(--text-muted);
  font-size: 0.85rem;
  cursor: pointer;
  transition: var(--transition-main);
}

.add-task-inline:hover {
  background: rgba(255, 255, 255, 0.03);
  color: var(--text-secondary);
  border-color: var(--text-muted);
}

/* Modal Styling */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.85);
  backdrop-filter: blur(10px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.task-modal {
  width: 95%;
  max-width: 650px;
  background-color: var(--surface-primary);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-premium);
  overflow: hidden;
}

.modal-header {
  padding: var(--space-6) var(--space-8);
  border-bottom: 1px solid var(--border-color);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-body {
  padding: var(--space-8) var(--space-10); /* Adjusted to be generous */
}

/* Fallback if space-10 is not defined, we'll use space-8 */
.modal-body {
  padding: var(--space-8);
}

.header-info {
  display: flex;
  align-items: center;
  gap: var(--space-4);
}

.status-pill {
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
}

.task-id-large {
  font-family: monospace;
  color: var(--text-muted);
  font-size: 0.85rem;
}

.title-input {
  width: 100%;
  background: transparent;
  border: none;
  font-size: 1.75rem;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: var(--space-6);
  outline: none;
}

.meta-inputs {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--space-8);
  margin-bottom: var(--space-8);
}

.input-item label, .desc-section label {
  display: block;
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  color: var(--text-muted);
  margin-bottom: var(--space-2);
}

.input-item select, .desc-section textarea {
  width: 100%;
  background-color: var(--bg-color);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  padding: var(--space-4);
  color: var(--text-primary);
  outline: none;
  font-family: inherit;
}

.modal-footer {
  padding: var(--space-6) var(--space-8);
  border-top: 1px solid var(--border-color);
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: rgba(255, 255, 255, 0.02);
}

.btn-danger {
  background: transparent;
  color: #EF4444;
  font-weight: 600;
  padding: var(--space-2) var(--space-4);
  border-radius: var(--radius-md);
  border: 1px solid rgba(239, 68, 68, 0.2);
  transition: var(--transition-main);
}

.btn-danger:hover {
  background: rgba(239, 68, 68, 0.1);
}

.footer-right {
  display: flex;
  gap: var(--space-4);
}

/* Modal Transitions */
.modal-enter-active, .modal-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}
.modal-enter-from, .modal-leave-to {
  opacity: 0;
  transform: scale(0.95) translateY(20px);
}

/* Subtasks Section Styles */
.subtasks-section {
  margin-top: var(--space-8);
  padding-top: var(--space-8);
  border-top: 1px solid var(--border-color);
}

.subtasks-section label {
  display: block;
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  color: var(--text-muted);
  margin-bottom: var(--space-4);
}

.subtasks-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
  margin-bottom: var(--space-6);
}

.subtask-item {
  display: flex;
  align-items: center;
  gap: var(--space-4);
  padding: var(--space-3) var(--space-4);
  background: var(--surface-secondary);
  border-radius: var(--radius-md);
  border: 1px solid transparent;
  transition: var(--transition-main);
}

.subtask-item:hover {
  border-color: var(--border-color);
}

.subtask-item input[type="checkbox"] {
  width: 18px;
  height: 18px;
  accent-color: var(--accent-color);
  cursor: pointer;
}

.subtask-item span {
  flex: 1;
  font-size: 0.9rem;
  color: var(--text-primary);
}

.subtask-item span.completed {
  color: var(--text-muted);
  text-decoration: line-through;
}

.remove-st {
  background: transparent;
  border: none;
  color: var(--text-muted);
  font-size: 1.25rem;
  cursor: pointer;
  padding: 0 4px;
  opacity: 0;
  transition: opacity 0.2s;
}

.subtask-item:hover .remove-st {
  opacity: 1;
}

.add-subtask {
  display: flex;
  gap: var(--space-3);
}

.add-subtask input {
  flex: 1;
  background: var(--bg-color);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  padding: var(--space-3) var(--space-4);
  color: var(--text-primary);
  outline: none;
}

.add-subtask button {
  background: var(--surface-secondary);
  border: 1px solid var(--border-color);
  color: var(--text-primary);
  padding: 0 var(--space-6);
  border-radius: var(--radius-md);
  cursor: pointer;
  font-weight: 600;
  transition: var(--transition-main);
}

.add-subtask button:hover {
  background: var(--border-color);
}

/* Card Progress Styles */
.footer-left {
  flex: 1;
  display: flex;
  align-items: center;
}

.progress-mini {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  background: rgba(255, 255, 255, 0.05);
  padding: 4px 10px;
  border-radius: 20px;
  width: fit-content;
}

.progress-bar-container {
  width: 40px;
  height: 4px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 2px;
  overflow: hidden;
}

.progress-bar {
  height: 100%;
  background: var(--accent-color);
  border-radius: 2px;
  transition: width 0.3s ease;
}

.progress-text {
  font-size: 0.7rem;
  color: var(--text-muted);
  font-weight: 600;
}
</style>