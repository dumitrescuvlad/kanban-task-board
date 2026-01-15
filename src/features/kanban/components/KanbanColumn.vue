<script setup lang="ts">
import { computed, ref, watch } from 'vue'

import BaseInput from '@/shared/components/BaseInput.vue'
import BaseButton from '@/shared/components/BaseButton.vue'
import IconButton from '@/shared/components/IconButton.vue'
import DropdownMenu from '@/shared/components/DropdownMenu.vue'
import Modal from '@/shared/components/Modal.vue'

import KanbanCardItem from '@/features/kanban/components/KanbanCard.vue'

import { EllipsisHorizontalIcon } from '@heroicons/vue/24/outline'

import { readDragPayload, writeDragPayload } from '@/features/kanban/utils/dnd'
import type { DragPayload, ColumnDragPayload } from '@/features/kanban/types/dnd.types'
import type {
  KanbanColumn,
  KanbanCard,
  KanbanLabel,
  CardPatch,
} from '@/features/kanban/types/kanban.types'

interface Props {
  column: KanbanColumn
  cards: KanbanCard[]
  labels: KanbanLabel[]
  index: number

  onAddCard: (columnId: string, title: string) => void
  onRenameColumn: (columnId: string, title: string) => void

  onRenameCard: (cardId: string, title: string) => void
  onUpdateCard: (cardId: string, patch: CardPatch) => void

  onMoveCard: (cardId: string, toColumnId: string, toIndex?: number) => void
  onMoveColumn: (columnId: string, toIndex: number) => void

  onRequestDeleteColumn: (columnId: string) => void
  onRequestDeleteCard: (cardId: string) => void
}

const props = defineProps<Props>()

const columnDraft = ref(props.column.title)

watch(
  () => props.column.title,
  (t) => {
    columnDraft.value = t
  },
)

function commitColumnTitle(): void {
  const trimmed = columnDraft.value.trim()
  if (!trimmed) {
    columnDraft.value = props.column.title
    return
  }
  if (trimmed !== props.column.title) {
    props.onRenameColumn(props.column.id, trimmed)
  }
}

function onColumnTitleKeydown(e: KeyboardEvent): void {
  if (e.key === 'Enter') {
    e.preventDefault()
    commitColumnTitle()
    ;(e.target as HTMLInputElement | null)?.blur()
  } else if (e.key === 'Escape') {
    e.preventDefault()
    columnDraft.value = props.column.title
    ;(e.target as HTMLInputElement | null)?.blur()
  }
}

const newCardTitle = ref('')
const canSubmitCard = computed(() => newCardTitle.value.trim().length > 0)

function submitCard(): void {
  if (!canSubmitCard.value) return
  props.onAddCard(props.column.id, newCardTitle.value.trim())
  newCardTitle.value = ''
}

function handleDeleteColumn(close: () => void): void {
  close()
  props.onRequestDeleteColumn(props.column.id)
}

const isCardDragOver = ref(false)
const dropIndex = ref<number | null>(null)
const listEl = ref<HTMLElement | null>(null)

function getDropIndex(e: DragEvent): number | undefined {
  if (!listEl.value) return undefined

  const target = e.target as HTMLElement | null
  if (!target) return undefined

  const cardEl = target.closest<HTMLElement>('[data-card-id]')
  if (!cardEl) return undefined

  const rect = cardEl.getBoundingClientRect()
  const midpoint = rect.top + rect.height / 2
  const isAfter = (e.clientY ?? 0) > midpoint

  const children = Array.from(listEl.value.querySelectorAll<HTMLElement>('[data-card-id]'))
  const index = children.indexOf(cardEl)
  if (index === -1) return undefined

  return isAfter ? index + 1 : index
}

function onCardDragOver(e: DragEvent): void {
  e.preventDefault()
  isCardDragOver.value = true
  if (e.dataTransfer) e.dataTransfer.dropEffect = 'move'

  const idx = getDropIndex(e)
  dropIndex.value = typeof idx === 'number' ? idx : null
}

function onCardDragLeave(): void {
  isCardDragOver.value = false
  dropIndex.value = null
}

function onCardDrop(e: DragEvent): void {
  e.preventDefault()
  isCardDragOver.value = false

  if (!e.dataTransfer) {
    dropIndex.value = null
    return
  }

  const payload: DragPayload | null = readDragPayload(e.dataTransfer)
  if (!payload || payload.entity !== 'card') {
    dropIndex.value = null
    return
  }

  const idx = getDropIndex(e)
  props.onMoveCard(payload.cardId, props.column.id, idx)
  dropIndex.value = null
}

const isColumnDragOver = ref(false)

function onColumnDragStart(e: DragEvent): void {
  if (!e.dataTransfer) return

  const payload: ColumnDragPayload = {
    entity: 'column',
    columnId: props.column.id,
  }

  writeDragPayload(e.dataTransfer, payload)
  e.dataTransfer.effectAllowed = 'move'
}

function onColumnDragOver(e: DragEvent): void {
  e.preventDefault()
  isColumnDragOver.value = true
  if (e.dataTransfer) e.dataTransfer.dropEffect = 'move'
}

function onColumnDragLeave(): void {
  isColumnDragOver.value = false
}

function onColumnDrop(e: DragEvent): void {
  e.preventDefault()
  isColumnDragOver.value = false

  if (!e.dataTransfer) return

  const payload: DragPayload | null = readDragPayload(e.dataTransfer)
  if (!payload || payload.entity !== 'column') return

  props.onMoveColumn(payload.columnId, props.index)
}

const detailsOpen = ref(false)
const detailsCardId = ref<string>('')

const activeCard = computed(() => props.cards.find((c) => c.id === detailsCardId.value) ?? null)

const detailsTitle = ref('')
const detailsDescription = ref('')
const detailsDue = ref<string>('')
const detailsLabelIds = ref<string[]>([])
const detailsImportance = ref<1 | 2 | 3>(1)

function openDetails(cardId: string) {
  const c = props.cards.find((x) => x.id === cardId)
  if (!c) return

  detailsCardId.value = cardId
  detailsTitle.value = c.title
  detailsDescription.value = c.description ?? ''
  detailsLabelIds.value = [...c.labelIds]
  detailsDue.value = c.dueAt ? new Date(c.dueAt).toISOString().slice(0, 10) : ''
  detailsImportance.value = c.importance ?? 1
  detailsOpen.value = true
}

function closeDetails() {
  detailsOpen.value = false
  detailsCardId.value = ''
}

function toggleLabel(id: string) {
  if (detailsLabelIds.value.includes(id)) {
    detailsLabelIds.value = detailsLabelIds.value.filter((x) => x !== id)
  } else {
    detailsLabelIds.value = [...detailsLabelIds.value, id]
  }
}

function saveDetails() {
  const cardId = detailsCardId.value
  if (!cardId) return

  const dueAt = detailsDue.value ? new Date(detailsDue.value + 'T00:00:00').getTime() : null

  props.onUpdateCard(cardId, {
    title: detailsTitle.value,
    description: detailsDescription.value,
    labelIds: detailsLabelIds.value,
    dueAt,
    importance: detailsImportance.value,
  })

  closeDetails()
}
</script>

<template>
  <div
    class="rounded-lg bg-gray-100 p-3 transition"
    :class="isCardDragOver ? 'ring-2 ring-sky-500' : ''"
    @dragover="onCardDragOver"
    @dragleave="onCardDragLeave"
    @drop="onCardDrop"
  >
    <div
      class="mb-3 flex items-center justify-between rounded px-3 py-2 text-xs text-gray-600 transition"
      :class="isColumnDragOver ? 'bg-sky-100 ring-2 ring-sky-400' : 'bg-gray-200'"
      draggable="true"
      @dragstart="onColumnDragStart"
      @dragover="onColumnDragOver"
      @dragleave="onColumnDragLeave"
      @drop="onColumnDrop"
    >
      <span class="font-medium">Column</span>

      <DropdownMenu align="right">
        <template #trigger>
          <IconButton srLabel="Column actions">
            <EllipsisHorizontalIcon class="h-5 w-5" />
          </IconButton>
        </template>

        <template #default="{ close }">
          <button
            type="button"
            class="w-full rounded px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-100"
            @click="handleDeleteColumn(close)"
          >
            Delete column
          </button>
        </template>
      </DropdownMenu>
    </div>

    <div class="mb-4">
      <BaseInput v-model="columnDraft" @blur="commitColumnTitle" @keydown="onColumnTitleKeydown" />
      <p class="mt-1 text-xs text-gray-500">Rename column (Enter to save, Esc to cancel)</p>
    </div>

    <div class="mb-4 flex gap-2">
      <BaseInput
        v-model="newCardTitle"
        placeholder="Add a card…"
        @keydown.enter.prevent="submitCard"
      />
      <BaseButton variant="primary" :disabled="!canSubmitCard" @click="submitCard">Add</BaseButton>
    </div>

    <div class="space-y-2">
      <p v-if="cards.length === 0" class="text-sm text-gray-500">No cards</p>

      <div ref="listEl" class="space-y-2">
        <div v-if="dropIndex === 0" class="h-0.5 rounded bg-sky-500" />

        <div v-for="(card, idx) in cards" :key="card.id" :data-card-id="card.id">
          <KanbanCardItem
            :card="card"
            :index="idx"
            :labels="labels"
            :onRename="props.onRenameCard"
            :onRequestDelete="props.onRequestDeleteCard"
            :onOpenDetails="openDetails"
          />

          <div v-if="dropIndex === idx + 1" class="mt-2 h-0.5 rounded bg-sky-500" />
        </div>

        <div
          v-if="dropIndex === null && isCardDragOver && cards.length === 0"
          class="h-0.5 rounded bg-sky-500"
        />
      </div>
    </div>

    <Modal :open="detailsOpen" title="Card details" @close="closeDetails">
      <div v-if="activeCard" class="space-y-4">
        <div>
          <p class="mb-1 text-xs text-gray-500">Title</p>
          <BaseInput v-model="detailsTitle" />
        </div>

        <div>
          <p class="mb-1 text-xs text-gray-500">Description</p>
          <textarea
            v-model="detailsDescription"
            class="min-h-28 w-full rounded border border-gray-300 bg-white p-3 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-sky-500"
          />
        </div>

        <div>
          <p class="mb-1 text-xs text-gray-500">Due date</p>
          <input
            v-model="detailsDue"
            type="date"
            class="w-full rounded border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900"
          />
        </div>

        <div>
          <p class="mb-2 text-xs text-gray-500">Importance</p>
          <div class="flex gap-2">
            <button
              type="button"
              class="rounded px-4 py-2 text-sm font-medium"
              :class="
                detailsImportance === 1
                  ? 'bg-yellow-400 text-yellow-900'
                  : 'bg-gray-200 text-gray-600'
              "
              @click="detailsImportance = 1"
            >
              Low
            </button>
            <button
              type="button"
              class="rounded px-4 py-2 text-sm font-medium"
              :class="
                detailsImportance === 2 ? 'bg-orange-400 text-white' : 'bg-gray-200 text-gray-600'
              "
              @click="detailsImportance = 2"
            >
              Medium
            </button>
            <button
              type="button"
              class="rounded px-4 py-2 text-sm font-medium"
              :class="
                detailsImportance === 3 ? 'bg-red-500 text-white' : 'bg-gray-200 text-gray-600'
              "
              @click="detailsImportance = 3"
            >
              High
            </button>
          </div>
        </div>

        <div>
          <p class="mb-2 text-xs text-gray-500">Labels</p>
          <div class="flex flex-wrap gap-2">
            <button
              v-for="l in labels"
              :key="l.id"
              type="button"
              class="rounded border px-3 py-1 text-xs"
              :class="
                detailsLabelIds.includes(l.id)
                  ? 'border-sky-500 bg-sky-100 text-sky-700'
                  : 'border-gray-300 bg-white text-gray-700'
              "
              @click="toggleLabel(l.id)"
            >
              {{ l.name }}
            </button>
          </div>
        </div>

        <div class="flex justify-end gap-2">
          <BaseButton variant="secondary" @click="closeDetails">Cancel</BaseButton>
          <BaseButton variant="primary" @click="saveDetails">Save</BaseButton>
        </div>
      </div>
    </Modal>
  </div>
</template>
