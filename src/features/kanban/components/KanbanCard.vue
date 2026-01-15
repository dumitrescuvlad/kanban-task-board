<script setup lang="ts">
import { nextTick, ref, watch, computed } from 'vue'

import IconButton from '@/shared/components/IconButton.vue'
import DropdownMenu from '@/shared/components/DropdownMenu.vue'
import BaseInput from '@/shared/components/BaseInput.vue'

import { EllipsisHorizontalIcon, TrashIcon, PencilSquareIcon } from '@heroicons/vue/24/outline'

import { writeDragPayload } from '@/features/kanban/utils/dnd'
import type { CardDragPayload } from '@/features/kanban/types/dnd.types'
import type { KanbanCard, KanbanLabel } from '@/features/kanban/types/kanban.types'

interface Props {
  card: KanbanCard
  index: number
  labels: KanbanLabel[]

  onRename?: (cardId: string, title: string) => void
  onRequestDelete?: (cardId: string) => void
  onOpenDetails?: (cardId: string) => void
}

const props = defineProps<Props>()

function handleOpenDetails(close: () => void): void {
  close()
  props.onOpenDetails?.(props.card.id)
}

function handleDeleteCard(close: () => void): void {
  close()
  props.onRequestDelete?.(props.card.id)
}

const isEditing = ref(false)
const draftTitle = ref(props.card.title)

watch(
  () => props.card.title,
  (t) => {
    if (!isEditing.value) draftTitle.value = t
  },
)

function startEdit(): void {
  isEditing.value = true
  draftTitle.value = props.card.title

  void nextTick(() => {
    const el = document.getElementById(`card-edit-${props.card.id}`) as HTMLInputElement | null
    el?.focus()
    el?.select()
  })
}

function cancelEdit(): void {
  isEditing.value = false
  draftTitle.value = props.card.title
}

function commitEdit(): void {
  const trimmed = draftTitle.value.trim()
  if (!trimmed) {
    cancelEdit()
    return
  }

  if (trimmed !== props.card.title) {
    props.onRename?.(props.card.id, trimmed)
  }

  isEditing.value = false
}

function onKeyDown(e: KeyboardEvent): void {
  if (e.key === 'Enter') {
    e.preventDefault()
    commitEdit()
  } else if (e.key === 'Escape') {
    e.preventDefault()
    cancelEdit()
  }
}

const labelMap = computed(() => {
  const m = new Map<string, KanbanLabel>()
  for (const l of props.labels) m.set(l.id, l)
  return m
})

const cardLabels = computed(() =>
  props.card.labelIds
    .map((id) => labelMap.value.get(id))
    .filter((x): x is KanbanLabel => Boolean(x)),
)

const dueTextValue = computed<string | null>(() => {
  if (!props.card.dueAt) return null
  return new Date(props.card.dueAt).toISOString().slice(0, 10)
})

const dueTone = computed<string>(() => {
  if (!props.card.dueAt) return ''
  const now = Date.now()
  if (props.card.dueAt < now) return 'bg-red-100 text-red-700'
  return 'bg-gray-100 text-gray-700'
})

const importanceBorder = computed<string>(() => {
  const importance = props.card.importance ?? 1
  switch (importance) {
    case 3:
      return 'border-l-4 border-l-red-500'
    case 2:
      return 'border-l-4 border-l-orange-400'
    default:
      return 'border-l-4 border-l-yellow-400'
  }
})

function labelTone(color: KanbanLabel['color']): string {
  const map: Record<KanbanLabel['color'], string> = {
    slate: 'bg-gray-200 text-gray-700',
    red: 'bg-red-500 text-white',
    orange: 'bg-orange-500 text-white',
    amber: 'bg-amber-500 text-white',
    yellow: 'bg-yellow-400 text-yellow-900',
    lime: 'bg-lime-500 text-white',
    green: 'bg-green-500 text-white',
    emerald: 'bg-emerald-500 text-white',
    teal: 'bg-teal-500 text-white',
    cyan: 'bg-cyan-500 text-white',
    sky: 'bg-sky-500 text-white',
    blue: 'bg-blue-500 text-white',
    indigo: 'bg-indigo-500 text-white',
    violet: 'bg-violet-500 text-white',
    purple: 'bg-purple-500 text-white',
    fuchsia: 'bg-fuchsia-500 text-white',
    pink: 'bg-pink-500 text-white',
    rose: 'bg-rose-500 text-white',
  }
  return map[color]
}

function onDragStart(e: DragEvent): void {
  if (!e.dataTransfer) return

  const payload: CardDragPayload = {
    entity: 'card',
    cardId: props.card.id,
    fromColumnId: props.card.columnId,
    fromIndex: props.index,
  }

  writeDragPayload(e.dataTransfer, payload)
  e.dataTransfer.effectAllowed = 'move'
}
</script>

<template>
  <div
    :class="['cursor-grab rounded-lg bg-white p-3 shadow transition-colors hover:bg-green-50 hover:shadow-md active:cursor-grabbing', importanceBorder]"
    draggable="true"
    @dragstart="onDragStart"
  >
    <div class="flex items-start justify-between gap-3">
      <div class="min-w-0 w-full">
        <div class="flex flex-wrap gap-2">
          <span
            v-for="l in cardLabels"
            :key="l.id"
            class="rounded px-2 py-0.5 text-[11px] font-medium"
            :class="labelTone(l.color)"
          >
            {{ l.name }}
          </span>

          <span
            v-if="dueTextValue"
            class="rounded px-2 py-0.5 text-[11px]"
            :class="dueTone"
          >
            Due {{ dueTextValue }}
          </span>
        </div>

        <div v-if="!isEditing" class="mt-2">
          <p class="break-words text-sm text-gray-900" @click="startEdit" @dblclick="startEdit">
            {{ props.card.title }}
          </p>
          <p class="mt-1 text-xs text-gray-500">
            {{ new Date(props.card.createdAt).toLocaleString() }}
          </p>
        </div>

        <div v-else class="mt-2 space-y-2">
          <BaseInput
            :id="`card-edit-${props.card.id}`"
            v-model="draftTitle"
            @keydown="onKeyDown"
            @blur="commitEdit"
          />
          <p class="text-xs text-gray-500">Enter to save, Esc to cancel</p>
        </div>
      </div>

      <DropdownMenu align="right">
        <template #trigger>
          <IconButton srLabel="Card actions">
            <EllipsisHorizontalIcon class="h-5 w-5" />
          </IconButton>
        </template>

        <template #default="{ close }">
          <button
            type="button"
            class="w-full rounded px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-100"
            @click="handleOpenDetails(close)"
          >
            <span class="inline-flex items-center gap-2">
              <PencilSquareIcon class="h-4 w-4" /> Details
            </span>
          </button>

          <button
            type="button"
            class="w-full rounded px-3 py-2 text-left text-sm text-red-600 hover:bg-gray-100"
            @click="handleDeleteCard(close)"
          >
            <span class="inline-flex items-center gap-2">
              <TrashIcon class="h-4 w-4" /> Delete
            </span>
          </button>
        </template>
      </DropdownMenu>
    </div>
  </div>
</template>
