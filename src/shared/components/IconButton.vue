<script setup lang="ts">
import { computed } from 'vue'

defineOptions({ name: 'IconButton' })

type Variant = 'default' | 'danger' | 'light'

interface Props {
  srLabel: string
  variant?: Variant
  disabled?: boolean
  type?: 'button' | 'submit' | 'reset'
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'light',
  disabled: false,
  type: 'button',
})

const emit = defineEmits<{
  click: [event: MouseEvent]
}>()

function handleClick(event: MouseEvent) {
  if (!props.disabled) {
    emit('click', event)
  }
}

const classes = computed(() => {
  const base =
    'inline-flex h-9 w-9 items-center justify-center rounded transition ' +
    'focus:outline-none focus:ring-2 focus:ring-sky-400 disabled:opacity-50 disabled:cursor-not-allowed'

  const variants: Record<Variant, string> = {
    default: 'bg-white/20 text-white hover:bg-white/30',
    light: 'text-gray-500 hover:bg-gray-100 hover:text-gray-700',
    danger: 'bg-red-500/20 text-red-100 hover:bg-red-500/30',
  }

  return `${base} ${variants[props.variant]}`
})
</script>

<template>
  <button :type="props.type" :disabled="props.disabled" :class="classes" @click="handleClick">
    <span class="sr-only">{{ props.srLabel }}</span>
    <slot />
  </button>
</template>
