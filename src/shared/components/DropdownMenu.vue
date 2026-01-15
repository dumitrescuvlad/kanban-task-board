<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'

interface Props {
  align?: 'left' | 'right'
}

const props = withDefaults(defineProps<Props>(), {
  align: 'right',
})

const open = ref(false)
const root = ref<HTMLElement | null>(null)

function toggle(): void {
  open.value = !open.value
}

function close(): void {
  open.value = false
}

function onDocClick(e: MouseEvent): void {
  if (!open.value) return
  const t = e.target as Node | null
  if (!t) return
  if (root.value && !root.value.contains(t)) close()
}

function onKeydown(e: KeyboardEvent): void {
  if (e.key === 'Escape') close()
}

onMounted(() => {
  document.addEventListener('click', onDocClick)
  window.addEventListener('keydown', onKeydown)
})

onUnmounted(() => {
  document.removeEventListener('click', onDocClick)
  window.removeEventListener('keydown', onKeydown)
})
</script>

<template>
  <div ref="root" class="relative inline-block">
    <div class="inline-flex" @click="toggle">
      <slot name="trigger" />
    </div>

    <div
      v-if="open"
      class="absolute z-40 mt-2 min-w-48 rounded-lg bg-white p-1 shadow-lg ring-1 ring-black/5"
      :class="props.align === 'right' ? 'right-0' : 'left-0'"
      role="menu"
    >
      <slot :close="close" />
    </div>
  </div>
</template>
