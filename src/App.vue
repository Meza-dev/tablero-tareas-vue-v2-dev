<script setup>
import { onMounted, onUnmounted } from 'vue'
import { RouterView } from 'vue-router'
import { useTaskStore } from '@/stores/taskStore'

const taskStore = useTaskStore()

onMounted(async () => {
  await taskStore.fetchBoard()
  taskStore.startPolling(5000) // Revisar cambios cada 5 segundos
})

onUnmounted(() => {
  taskStore.stopPolling()
})
</script>

<template>
  <main class="app-main">
    <RouterView v-slot="{ Component }">
      <transition name="fade" mode="out-in">
        <component :is="Component" />
      </transition>
    </RouterView>
  </main>
</template>

<style>
.app-main {
  background-color: var(--bg-color);
  min-height: 100vh;
}

/* Transición refinada Silicon Valley */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 200ms cubic-bezier(0.4, 0, 0.2, 1), transform 200ms cubic-bezier(0.4, 0, 0.2, 1);
}

.fade-enter-from {
  opacity: 0;
  transform: scale(0.98);
}

.fade-leave-to {
  opacity: 0;
  transform: scale(1.02);
}
</style>
