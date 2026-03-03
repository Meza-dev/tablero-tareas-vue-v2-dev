<script setup>
import { ref } from 'vue'
import { useTaskStore } from '../stores/taskStore'
import { useRouter } from 'vue-router'

const taskStore = useTaskStore()
const router = useRouter()

const showCreateModal = ref(false)
const newBoardName = ref('')
const isSubmitting = ref(false)
const alerts = ref([])

const addAlert = (message, type = 'success') => {
  const id = Date.now()
  alerts.value.push({ id, message, type })
  setTimeout(() => {
    alerts.value = alerts.value.filter(a => a.id !== id)
  }, 3000)
}

const goToBoard = (id) => {
  router.push({ name: 'tablero', params: { id } })
}

const handleCreateBoard = () => {
  if (!newBoardName.value.trim()) return
  if (isSubmitting.value) return
  
  isSubmitting.value = true
  try {
    const id = taskStore.addBoard(newBoardName.value)
    addAlert('Tablero creado')
    showCreateModal.value = false
    newBoardName.value = ''
    setTimeout(() => goToBoard(id), 500)
  } catch (err) {
    addAlert('Error al intentar crear', 'error')
  } finally {
    setTimeout(() => {
      isSubmitting.value = false
    }, 1000)
  }
}
</script>

<template>
  <div class="workspace-wrapper">
    <div class="ambient-glow"></div>
    
    <div class="alerts-container">
      <TransitionGroup name="alert">
        <div v-for="alert in alerts" :key="alert.id" class="alert-item" :class="alert.type">
          <svg v-if="alert.type === 'success'" class="alert-icon" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"></polyline></svg>
          <svg v-else class="alert-icon" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="3"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
          {{ alert.message }}
        </div>
      </TransitionGroup>
    </div>
    
    <div class="workspace-container">
      <header class="workspace-header">
        <h1>Proyectos</h1>
        <p class="subtitle">Gestiona tus tableros de alto rendimiento</p>
      </header>

      <div class="bento-grid">
        <div 
          v-for="board in taskStore.boards" 
          :key="board.id" 
          class="board-card"
          @click="goToBoard(board.id)"
        >
          <div class="card-content">
            <div class="board-header">
              <h3>{{ board.name }}</h3>
              <div class="header-right-actions">
                <button class="quick-delete-board" @click.stop="taskStore.deleteBoard(board.id)" title="Eliminar tablero">
                  <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                </button>
                <div class="status-indicator"></div>
              </div>
            </div>
            
            <div class="board-footer">
              <div class="progress-wrapper">
                <div class="progress-info">
                  <span class="task-count">{{ board.tasks?.length || 0 }} Tareas</span>
                </div>
                <div class="progress-container">
                  <div 
                    class="progress-bar" 
                    :style="{ width: (board.progress || 0) + '%' }"
                  ></div>
                </div>
              </div>
            </div>
          </div>
          <div class="card-glow"></div>
        </div>

        <div class="board-card create-card" @click="showCreateModal = true">
          <div class="plus-icon">+</div>
          <span class="cta-text">Crear Tablero</span>
        </div>
      </div>
    </div>

    <!-- Create Board Modal -->
    <Transition name="modal">
      <div v-if="showCreateModal" class="modal-overlay" @click.self="showCreateModal = false">
        <div class="modal-content">
          <header class="modal-header">
            <h2>Nuevo Tablero</h2>
            <button class="close-btn" @click="showCreateModal = false">&times;</button>
          </header>
          <div class="modal-body">
            <div class="input-group">
              <label>Nombre del Tablero</label>
              <input 
                v-model="newBoardName" 
                type="text" 
                placeholder="Ej. Sprint de Diseño" 
                @keyup.enter="handleCreateBoard"
                autofocus
              >
            </div>
          </div>
          <footer class="modal-footer">
            <button class="btn-secondary" @click="showCreateModal = false">Cancelar</button>
            <button 
              class="btn-primary" 
              @click="handleCreateBoard" 
              :disabled="!newBoardName.trim() || isSubmitting"
            >
              <span v-if="isSubmitting" class="loader-mini"></span>
              {{ isSubmitting ? 'Creando...' : 'Crear Tablero' }}
            </button>
          </footer>
        </div>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.workspace-wrapper {
  min-height: 100vh;
  background-color: var(--bg-color);
  position: relative;
  overflow: hidden;
  display: flex;
  flex-direction: column;
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

.workspace-container {
  position: relative;
  z-index: 1;
  max-width: 1200px;
  width: 100%;
  margin: 0 auto;
  padding: var(--space-16) var(--space-8);
}

.workspace-header {
  margin-bottom: var(--space-12);
  text-align: center;
}

.workspace-header h1 {
  font-size: 2.5rem;
  font-weight: 800;
  letter-spacing: -0.04em;
  color: var(--text-primary);
  margin-bottom: var(--space-2);
}

.subtitle {
  color: var(--text-secondary);
  font-size: 1.1rem;
}

.bento-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: var(--space-6);
  width: 100%;
}

.board-card {
  background-color: var(--surface-primary);
  backdrop-filter: var(--backdrop-blur);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
  height: 200px;
  cursor: pointer;
  transition: var(--transition-main);
  position: relative;
  overflow: hidden;
  display: flex;
  box-shadow: var(--shadow-premium);
}

.card-content {
  padding: var(--space-8);
  width: 100%;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  z-index: 2;
}

.board-card:hover {
  border-color: var(--border-hover);
  transform: translateY(-6px) scale(1.01);
  background-color: rgba(30, 32, 40, 0.9);
}

.board-card:hover .card-glow {
  opacity: 1;
}

.card-glow {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: radial-gradient(circle at top right, rgba(99, 102, 241, 0.1), transparent 70%);
  opacity: 0;
  transition: opacity 0.5s ease;
  pointer-events: none;
}

.board-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.header-right-actions {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: var(--space-2);
}

.quick-delete-board {
  background: transparent;
  border: none;
  color: var(--text-muted);
  cursor: pointer;
  padding: 6px;
  border-radius: 6px;
  opacity: 0;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.board-card:hover .quick-delete-board {
  opacity: 1;
}

.quick-delete-board:hover {
  background: rgba(239, 68, 68, 0.15);
  color: #EF4444;
}

.status-indicator {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background-color: var(--accent-color);
  box-shadow: 0 0 10px var(--accent-color);
  margin-top: var(--space-2);
}

.progress-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--space-2);
}

.task-count {
  font-size: 0.85rem;
  color: var(--text-secondary);
  font-weight: 500;
}

.percentage {
  font-size: 0.85rem;
  color: var(--text-primary);
  font-weight: 600;
}

.progress-container {
  width: 100%;
  height: 4px;
  background-color: rgba(255, 255, 255, 0.05);
  border-radius: 2px;
  overflow: hidden;
}

.progress-bar {
  height: 100%;
  background-color: var(--accent-color);
  box-shadow: 0 0 12px var(--accent-color);
  transition: width 0.8s cubic-bezier(0.4, 0, 0.2, 1);
}

/* Create Card Styling */
.create-card {
  border-style: dashed;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background-color: rgba(255, 255, 255, 0.02);
  gap: var(--space-3);
  box-shadow: none;
}

.create-card:hover {
  background-color: rgba(99, 102, 241, 0.05);
  border-style: solid;
  border-color: var(--accent-color);
}

.plus-icon {
  font-size: 2.5rem;
  color: var(--accent-color);
  font-weight: 200;
}

.cta-text {
  font-size: 0.95rem;
  color: var(--text-secondary);
  font-weight: 600;
  letter-spacing: 0.02em;
}

/* Modal Styling */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background-color: var(--surface-primary);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
  width: 90%;
  max-width: 450px;
  box-shadow: var(--shadow-premium);
  overflow: hidden;
}

.modal-header {
  padding: var(--space-6);
  border-bottom: 1px solid var(--border-color);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-header h2 {
  font-size: 1.25rem;
  font-weight: 700;
  margin: 0;
  color: var(--text-primary);
}

.close-btn {
  background: transparent;
  border: none;
  font-size: 1.5rem;
  color: var(--text-secondary);
  cursor: pointer;
  line-height: 1;
}

.modal-body {
  padding: var(--space-8);
}

.input-group {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.input-group label {
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.input-group input {
  background-color: var(--bg-color);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  padding: var(--space-4);
  color: var(--text-primary);
  font-size: 1rem;
  outline: none;
  transition: var(--transition-main);
}

.input-group input:focus {
  border-color: var(--accent-color);
  box-shadow: 0 0 0 2px var(--accent-glow);
}

.modal-footer {
  padding: var(--space-6);
  border-top: 1px solid var(--border-color);
  display: flex;
  justify-content: flex-end;
  gap: var(--space-4);
  background-color: rgba(255, 255, 255, 0.02);
}

.btn-secondary {
  background: transparent;
  color: var(--text-secondary);
  font-weight: 600;
  padding: var(--space-3) var(--space-6);
  border-radius: var(--radius-md);
  transition: var(--transition-main);
}

.btn-secondary:hover {
  color: var(--text-primary);
  background: rgba(255, 255, 255, 0.05);
}

.btn-primary {
  background-color: var(--accent-color);
  color: white;
  font-weight: 700;
  padding: var(--space-3) var(--space-6);
  border-radius: var(--radius-md);
  box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
  transition: var(--transition-main);
}

.btn-primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
}

.btn-primary:not(:disabled):hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(99, 102, 241, 0.4);
}

/* Modal Transition */
.modal-enter-active,
.modal-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.modal-enter-from {
  opacity: 0;
  transform: scale(0.9) translateY(20px);
}

.modal-leave-to {
  opacity: 0;
  transform: scale(0.9) translateY(20px);
}

@media (max-width: 768px) {
  .workspace-container {
    padding: var(--space-8) var(--space-4);
  }
  .workspace-header h1 {
    font-size: 2rem;
  }
}

/* Alert System Styles */
.alerts-container {
  position: fixed;
  top: 24px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 2000;
  display: flex;
  flex-direction: column;
  gap: 12px;
  pointer-events: none;
}

.alert-item {
  background: var(--surface-primary);
  border: 1px solid var(--border-color);
  padding: 12px 24px;
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
  color: var(--text-primary);
  font-weight: 600;
  backdrop-filter: blur(12px);
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 300px;
  justify-content: center;
}

.alert-item.success {
  border-left: 4px solid #10b981;
}

.alert-item.error {
  border-left: 4px solid #ef4444;
}

/* Alert Transitions */
.alert-enter-active, .alert-leave-active {
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}
.alert-enter-from, .alert-leave-to {
  opacity: 0;
  transform: translateY(-20px) scale(0.9);
}

/* Loader Styles */
.loader-mini {
  width: 14px;
  height: 14px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: #fff;
  border-radius: 50%;
  animation: spin 0.6s linear infinite;
  display: inline-block;
  margin-right: 8px;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
</style>
