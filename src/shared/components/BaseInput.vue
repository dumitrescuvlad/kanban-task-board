<script setup lang="ts">
import { computed, ref } from 'vue'

defineOptions({ name: 'BaseInput', inheritAttrs: false })

interface Props {
  modelValue: string
  type?: string
  placeholder?: string
  id?: string
  disabled?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  type: 'text',
  placeholder: '',
  id: undefined,
  disabled: false,
})

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
}>()

const inputRef = ref<HTMLInputElement | null>(null)

const value = computed({
  get: () => props.modelValue,
  set: (v: string) => emit('update:modelValue', v),
})

// Allow parent components to focus this input
function focus() {
  inputRef.value?.focus()
}
function select() {
  inputRef.value?.select()
}

defineExpose({ focus, select })

const classes =
  'w-full rounded border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 ' +
  'placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 disabled:opacity-50'
</script>

<template>
  <input
    :id="props.id"
    ref="inputRef"
    v-model="value"
    :type="props.type"
    :placeholder="props.placeholder"
    :disabled="props.disabled"
    :class="classes"
    v-bind="$attrs"
  />
</template>
