<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue'
import ToastHost from '@/shared/components/ToastHost.vue'
import { useKanbanStore } from '@/features/kanban/stores/kanban.store'

const store = useKanbanStore()

function onKeydown(e: KeyboardEvent) {
  const isMac = navigator.platform.toLowerCase().includes('mac')
  const mod = isMac ? e.metaKey : e.ctrlKey

  if (mod && e.key.toLowerCase() === 'z') {
    e.preventDefault()
    store.undo()
  }
}

onMounted(() => {
  window.addEventListener('keydown', onKeydown)
})

onUnmounted(() => {
  window.removeEventListener('keydown', onKeydown)
})
</script>

<template>
  <div class="min-h-screen bg-sky-600 text-gray-900">
    <main class="mx-auto max-w-6xl px-4 py-6">
      <slot />
    </main>

    <ToastHost />
  </div>
</template>
