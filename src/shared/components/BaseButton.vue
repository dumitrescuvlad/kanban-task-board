<script setup lang="ts">
import { computed } from 'vue'

defineOptions({ name: 'BaseButton' })

type Variant = 'primary' | 'secondary' | 'danger'

interface Props {
  variant?: Variant
  disabled?: boolean
  type?: 'button' | 'submit' | 'reset'
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'secondary',
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
    'inline-flex items-center justify-center gap-2 rounded px-4 py-2 text-sm font-medium transition ' +
    'focus:outline-none focus:ring-2 focus:ring-sky-500 disabled:opacity-50 disabled:cursor-not-allowed'

  const variants: Record<Variant, string> = {
    primary: 'bg-sky-600 text-white hover:bg-sky-700',
    secondary: 'bg-gray-200 text-gray-700 hover:bg-gray-300',
    danger: 'bg-red-600 text-white hover:bg-red-700',
  }

  return `${base} ${variants[props.variant]}`
})
</script>

<template>
  <button :type="props.type" :disabled="props.disabled" :class="classes" @click="handleClick">
    <slot />
  </button>
</template>
