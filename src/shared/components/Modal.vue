<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue'

defineOptions({ name: 'BaseModal' })

interface Props {
  open: boolean
  title: string
}

const props = defineProps<Props>()

const emit = defineEmits<{
  (e: 'close'): void
}>()

function onKeydown(e: KeyboardEvent) {
  if (e.key === 'Escape') emit('close')
}

onMounted(() => window.addEventListener('keydown', onKeydown))
onUnmounted(() => window.removeEventListener('keydown', onKeydown))
</script>

<template>
  <div v-if="props.open" class="fixed inset-0 z-50">
    <div class="absolute inset-0 bg-black/50" @click="emit('close')" />

    <div
      class="relative mx-auto mt-24 w-[min(640px,calc(100vw-2rem))] rounded-lg bg-white p-5 shadow-xl"
      role="dialog"
      aria-modal="true"
    >
      <div class="flex items-start justify-between gap-3">
        <div>
          <h3 class="text-base font-semibold text-gray-900">
            {{ props.title }}
          </h3>
        </div>

        <button
          type="button"
          class="text-sm text-gray-500 hover:text-gray-700"
          @click="emit('close')"
        >
          Close
        </button>
      </div>

      <div class="mt-4">
        <slot />
      </div>
    </div>
  </div>
</template>
