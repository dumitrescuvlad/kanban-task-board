<script setup lang="ts">
import { computed, ref } from 'vue'
import { useKanbanStore } from '@/features/kanban/stores/kanban.store'
import { useKanbanUiStore } from '@/features/kanban/stores/kanban.ui.store'

import KanbanColumn from '@/features/kanban/components/KanbanColumn.vue'

import BaseButton from '@/shared/components/BaseButton.vue'
import BaseInput from '@/shared/components/BaseInput.vue'
import Modal from '@/shared/components/Modal.vue'

import { useToasts } from '@/shared/composables/useToasts'
import { useAutoScrollDuringDrag } from '@/features/kanban/composables/useAutoScrollDuringDrag'

import type { CardPatch } from '@/features/kanban/types/kanban.types'

const store = useKanbanStore()
const ui = useKanbanUiStore()
const { show } = useToasts()

const boardScrollRef = ref<HTMLElement | null>(null)
useAutoScrollDuringDrag(boardScrollRef)

const columns = computed(() => store.getColumnsInOrder())
const labels = computed(() => store.getLabels())

const newColumnTitle = ref('')
const canAddColumn = computed(() => newColumnTitle.value.trim().length > 0)

const confirmOpen = ref(false)
const confirmKind = ref<'delete-column' | 'delete-card'>('delete-column')
const confirmTargetId = ref<string>('')

const confirmTitle = computed(() =>
  confirmKind.value === 'delete-column' ? 'Delete column?' : 'Delete card?',
)

function openConfirmDeleteColumn(columnId: string) {
  confirmKind.value = 'delete-column'
  confirmTargetId.value = columnId
  confirmOpen.value = true
}

function openConfirmDeleteCard(cardId: string) {
  confirmKind.value = 'delete-card'
  confirmTargetId.value = cardId
  confirmOpen.value = true
}

function closeConfirm() {
  confirmOpen.value = false
  confirmTargetId.value = ''
}

function confirmDelete() {
  const id = confirmTargetId.value
  if (!id) return

  if (confirmKind.value === 'delete-column') {
    store.removeColumn(id)
    show('Column deleted.', 'warning', {
      action: { label: 'Undo', onClick: store.undo },
      timeoutMs: 6000,
    })
  } else {
    store.removeCard(id)
    show('Card deleted.', 'warning', {
      action: { label: 'Undo', onClick: store.undo },
      timeoutMs: 6000,
    })
  }

  closeConfirm()
}

function handleAddColumn(): void {
  if (!canAddColumn.value) return
  store.addColumn(newColumnTitle.value.trim())
  newColumnTitle.value = ''
}

function handleAddCard(columnId: string, title: string): void {
  store.addCard(columnId, title)
}

function handleRenameColumn(columnId: string, title: string): void {
  store.renameColumn(columnId, title)
}

function handleRenameCard(cardId: string, title: string): void {
  store.renameCard(cardId, title)
}

function handleUpdateCard(cardId: string, patch: CardPatch): void {
  store.updateCard(cardId, patch)
}

function handleMoveCard(cardId: string, toColumnId: string, toIndex?: number): void {
  store.moveCard({ cardId, toColumnId, toIndex })
}

function handleMoveColumn(columnId: string, toIndex: number): void {
  store.moveColumn({ columnId, toIndex })
}

function filteredCards(columnId: string) {
  const q = ui.searchQuery.trim().toLowerCase()
  const labelId = ui.labelFilterId

  const cards = store.getCardsForColumn(columnId)

  return cards.filter((c) => {
    const matchesText =
      q.length === 0 ||
      c.title.toLowerCase().includes(q) ||
      (c.description ?? '').toLowerCase().includes(q)

    const matchesLabel = labelId === 'all' || c.labelIds.includes(labelId)

    return matchesText && matchesLabel
  })
}
</script>

<template>
  <section class="space-y-4">
    <div class="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h2 class="text-xl font-semibold text-white">Board</h2>
        <p class="text-sm text-white/70">Create your tasks and manage your workflow..</p>
      </div>

      <div class="flex flex-col gap-2 sm:flex-row sm:items-center">
        <BaseInput v-model="ui.searchQuery" placeholder="Search cards…" />
        <select
          v-model="ui.labelFilterId"
          class="w-full rounded border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 sm:w-56"
        >
          <option value="all">All labels</option>
          <option v-for="l in labels" :key="l.id" :value="l.id">
            {{ l.name }}
          </option>
        </select>
      </div>
    </div>

    <div class="rounded-lg bg-white/20 p-4">
      <div class="flex flex-col gap-2 sm:flex-row sm:items-center">
        <BaseInput
          v-model="newColumnTitle"
          placeholder="New column title…"
          @keydown.enter.prevent="handleAddColumn"
        />
        <BaseButton variant="primary" :disabled="!canAddColumn" @click="handleAddColumn">
          Add
        </BaseButton>

        <BaseButton variant="secondary" class="sm:ml-auto" @click="store.resetBoard">
          Reset
        </BaseButton>
      </div>
    </div>

    <div ref="boardScrollRef" id="board-scroll">
      <div class="grid gap-4 md:grid-cols-3">
        <KanbanColumn
          v-for="(col, index) in columns"
          :key="col.id"
          :column="col"
          :cards="filteredCards(col.id)"
          :labels="labels"
          :index="index"
          :onAddCard="handleAddCard"
          :onRenameColumn="handleRenameColumn"
          :onRenameCard="handleRenameCard"
          :onUpdateCard="handleUpdateCard"
          :onMoveCard="handleMoveCard"
          :onMoveColumn="handleMoveColumn"
          :onRequestDeleteColumn="openConfirmDeleteColumn"
          :onRequestDeleteCard="openConfirmDeleteCard"
        />
      </div>
    </div>

    <Modal :open="confirmOpen" :title="confirmTitle" @close="closeConfirm">
      <p class="text-sm text-gray-600">
        This action cannot be undone directly, but you can use <strong>Undo</strong> immediately
        after deletion.
      </p>

      <div class="mt-4 flex justify-end gap-2">
        <BaseButton variant="secondary" @click="closeConfirm">Cancel</BaseButton>
        <BaseButton variant="danger" @click="confirmDelete"> Delete </BaseButton>
      </div>
    </Modal>
  </section>
</template>
