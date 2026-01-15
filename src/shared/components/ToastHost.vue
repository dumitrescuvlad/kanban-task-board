<script setup lang="ts">
import { computed } from 'vue'
import { useToasts } from '@/shared/composables/useToasts'

const { toasts, dismiss } = useToasts()

function tone(variant: string) {
  switch (variant) {
    case 'success':
      return 'bg-green-500 text-white'
    case 'warning':
      return 'bg-amber-500 text-white'
    case 'danger':
      return 'bg-red-500 text-white'
    default:
      return 'bg-gray-700 text-white'
  }
}

const list = computed(() => toasts.value)
</script>

<template>
  <div class="fixed right-4 top-4 z-50 flex w-[min(420px,calc(100vw-2rem))] flex-col gap-2">
    <div
      v-for="t in list"
      :key="t.id"
      class="rounded-lg p-3 shadow-lg"
      :class="tone(t.variant)"
      role="status"
      aria-live="polite"
    >
      <div class="flex items-start justify-between gap-3">
        <p class="text-sm leading-snug">{{ t.message }}</p>
        <button type="button" class="text-xs opacity-80 hover:opacity-100" @click="dismiss(t.id)">
          Close
        </button>
      </div>

      <div v-if="t.action" class="mt-2">
        <button
          type="button"
          class="text-xs underline underline-offset-2 opacity-90 hover:opacity-100"
          @click="t.action.onClick"
        >
          {{ t.action.label }}
        </button>
      </div>
    </div>
  </div>
</template>
