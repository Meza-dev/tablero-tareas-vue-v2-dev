<script setup>
const props = defineProps({
  task: {
    type: Object,
    required: true
  }
})

const getPriorityColor = (priority) => {
  switch (priority) {
    case 'Alta': return '#ef4444';
    case 'Media': return '#f59e0b';
    case 'Baja': return '#10b981';
    default: return '#94a3b8';
  }
}
</script>

<template>
  <div class="task-card">
    <div class="card-header">
      <span class="priority-badge" :style="{ backgroundColor: getPriorityColor(task.priority) + '20', color: getPriorityColor(task.priority) }">
        {{ task.priority }}
      </span>
      <div class="drag-handle">⠿</div>
    </div>
    
    <h4 class="task-title">{{ task.titulo }}</h4>
    <p v-if="task.descripcion" class="task-desc">{{ task.descripcion.substring(0, 60) + (task.descripcion.length > 60 ? '...' : '') }}</p>
    
    <div class="card-footer">
      <div class="user-avatar">👤</div>
      <div class="task-id">#{{ task.id.substring(0, 4) }}</div>
    </div>
  </div>
</template>

<style scoped>
.task-card {
  background: var(--surface-color);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  padding: 1rem;
  cursor: grab;
  transition: all 0.2s;
  position: relative;
  overflow: hidden;
}

.task-card:hover {
  transform: translateY(-4px) scale(1.02);
  border-color: var(--accent-color);
  box-shadow: var(--shadow-lg);
}

.task-card:active {
  cursor: grabbing;
  opacity: 0.8;
}

.card-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.75rem;
}

.priority-badge {
  font-size: 0.7rem;
  font-weight: 700;
  text-transform: uppercase;
  padding: 2px 8px;
  border-radius: 4px;
}

.drag-handle {
  color: var(--text-secondary);
  opacity: 0.5;
  font-size: 1.2rem;
}

.task-title {
  font-size: 1rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
  color: var(--text-primary);
}

.task-desc {
  font-size: 0.85rem;
  color: var(--text-secondary);
  margin-bottom: 1rem;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  white-space: pre-wrap;
}

.card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: auto;
  padding-top: 0.5rem;
  border-top: 1px solid rgba(255, 255, 255, 0.05);
}

.user-avatar {
  font-size: 1rem;
}

.task-id {
  font-size: 0.7rem;
  color: var(--text-secondary);
}
</style>