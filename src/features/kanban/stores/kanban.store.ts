import { defineStore } from 'pinia'
import { useLocalStorage } from '@vueuse/core'

import type {
  KanbanBoardState,
  KanbanBoardStateV2,
  KanbanColumn,
  KanbanCard,
  KanbanLabel,
  CardPatch,
  ID,
} from '@/features/kanban/types/kanban.types'
import { createId } from '@/features/kanban/utils/id'
import { defaultLabels } from '@/features/kanban/utils/labels'
import { isV2State } from '@/features/kanban/migrations/validate'
import { migrateV1ToV2 } from '@/features/kanban/migrations/v1-to-v2'

const STORAGE_KEY_V2 = 'kanban:board:v2'
const STORAGE_KEY_V1 = 'kanban:board:v1'
const MAX_HISTORY = 25

type V1State = {
  columns: Record<ID, { id: ID; title: string; cardOrder: ID[] }>
  cards: Record<ID, { id: ID; columnId: ID; title: string; createdAt: number }>
  columnOrder: ID[]
}

function isV1State(x: unknown): x is V1State {
  if (!x || typeof x !== 'object') return false
  const s = x as Record<string, unknown>
  if (!s.columns || typeof s.columns !== 'object') return false
  if (!s.cards || typeof s.cards !== 'object') return false
  if (!Array.isArray(s.columnOrder)) return false
  return true
}

function cloneState<T>(v: T): T {
  // Always use JSON for Vue reactive objects - structuredClone can't handle them
  return JSON.parse(JSON.stringify(v)) as T
}

function createInitialState(): KanbanBoardStateV2 {
  const todoId = createId('col')
  const doingId = createId('col')
  const doneId = createId('col')

  const firstCardId = createId('card')
  const now = Date.now()

  const columns: Record<ID, KanbanColumn> = {
    [todoId]: { id: todoId, title: 'To do', cardOrder: [firstCardId] },
    [doingId]: { id: doingId, title: 'Doing', cardOrder: [] },
    [doneId]: { id: doneId, title: 'Done', cardOrder: [] },
  }

  const cards: Record<ID, KanbanCard> = {
    [firstCardId]: {
      id: firstCardId,
      columnId: todoId,
      title: 'First task',
      description: '',
      labelIds: [],
      dueAt: null,
      importance: 1,
      createdAt: now,
      updatedAt: now,
    },
  }

  return {
    version: 2,
    columns,
    cards,
    columnOrder: [todoId, doingId, doneId],
    labels: defaultLabels(),
  }
}

function loadAndMigrate(): KanbanBoardStateV2 {
  const rawV2 = localStorage.getItem(STORAGE_KEY_V2)
  if (rawV2) {
    try {
      const parsed = JSON.parse(rawV2) as unknown
      if (isV2State(parsed)) return parsed
    } catch {
      // ignore
    }
  }

  const rawV1 = localStorage.getItem(STORAGE_KEY_V1)
  if (rawV1) {
    try {
      const parsed = JSON.parse(rawV1) as unknown
      if (isV1State(parsed)) return migrateV1ToV2(parsed)
    } catch {
      // ignore
    }
  }

  return createInitialState()
}

export const useKanbanStore = defineStore('kanban', () => {
  const state = useLocalStorage<KanbanBoardState>(STORAGE_KEY_V2, loadAndMigrate(), {
    serializer: {
      read: (v: string) => JSON.parse(v) as KanbanBoardState,
      write: (v: KanbanBoardState) => JSON.stringify(v),
    },
  })

  const history = useLocalStorage<KanbanBoardStateV2[]>('kanban:undo:v2', [], {
    serializer: {
      read: (v: string) => JSON.parse(v) as KanbanBoardStateV2[],
      write: (v: KanbanBoardStateV2[]) => JSON.stringify(v),
    },
  })

  function pushHistory(): void {
    const snapshot = cloneState(state.value as KanbanBoardStateV2)
    history.value.unshift(snapshot)
    history.value = history.value.slice(0, MAX_HISTORY)
  }

  function canUndo(): boolean {
    return history.value.length > 0
  }

  function undo(): void {
    const prev = history.value.shift()
    if (!prev) return
    state.value = prev
  }

  function getColumnsInOrder(): KanbanColumn[] {
    const s = state.value as KanbanBoardStateV2
    return s.columnOrder.map((id) => s.columns[id]).filter((c): c is KanbanColumn => Boolean(c))
  }

  function getCardsForColumn(columnId: ID): KanbanCard[] {
    const s = state.value as KanbanBoardStateV2
    const col = s.columns[columnId]
    if (!col) return []
    return col.cardOrder.map((id) => s.cards[id]).filter((c): c is KanbanCard => Boolean(c))
  }

  function getLabels(): KanbanLabel[] {
    const s = state.value as KanbanBoardStateV2
    return Object.values(s.labels)
  }

  function resetBoard(): void {
    pushHistory()
    state.value = createInitialState()
  }

  function addColumn(title: string): void {
    const trimmed = title.trim()
    if (!trimmed) return

    pushHistory()

    const s = state.value as KanbanBoardStateV2
    const id = createId('col')
    s.columns[id] = { id, title: trimmed, cardOrder: [] }
    s.columnOrder.push(id)
  }

  function removeColumn(columnId: ID): void {
    const s = state.value as KanbanBoardStateV2
    const col = s.columns[columnId]
    if (!col) return

    pushHistory()

    for (const cardId of col.cardOrder) delete s.cards[cardId]
    delete s.columns[columnId]
    s.columnOrder = s.columnOrder.filter((id) => id !== columnId)
  }

  function addCard(columnId: ID, title: string): void {
    const trimmed = title.trim()
    if (!trimmed) return

    const s = state.value as KanbanBoardStateV2
    const col = s.columns[columnId]
    if (!col) return

    pushHistory()

    const id = createId('card')
    const now = Date.now()
    s.cards[id] = {
      id,
      columnId,
      title: trimmed,
      description: '',
      labelIds: [],
      dueAt: null,
      importance: 1,
      createdAt: now,
      updatedAt: now,
    }
    col.cardOrder.unshift(id)
  }

  function removeCard(cardId: ID): void {
    const s = state.value as KanbanBoardStateV2
    const card = s.cards[cardId]
    if (!card) return

    pushHistory()

    const col = s.columns[card.columnId]
    if (col) col.cardOrder = col.cardOrder.filter((id) => id !== cardId)
    delete s.cards[cardId]
  }

  function renameColumn(columnId: ID, title: string): void {
    const s = state.value as KanbanBoardStateV2
    const col = s.columns[columnId]
    if (!col) return

    const trimmed = title.trim()
    if (!trimmed) return

    pushHistory()
    col.title = trimmed
  }

  function renameCard(cardId: ID, title: string): void {
    const s = state.value as KanbanBoardStateV2
    const card = s.cards[cardId]
    if (!card) return

    const trimmed = title.trim()
    if (!trimmed) return

    pushHistory()
    card.title = trimmed
    card.updatedAt = Date.now()
  }

  function updateCard(cardId: ID, patch: CardPatch): void {
    const s = state.value as KanbanBoardStateV2
    const card = s.cards[cardId]
    if (!card) return

    pushHistory()

    if (typeof patch.title === 'string') {
      const trimmed = patch.title.trim()
      if (trimmed) card.title = trimmed
    }
    if (typeof patch.description === 'string') card.description = patch.description
    if (Array.isArray(patch.labelIds)) card.labelIds = patch.labelIds

    if (patch.dueAt === null || typeof patch.dueAt === 'number') {
      card.dueAt = patch.dueAt
    }

    if (patch.importance === 1 || patch.importance === 2 || patch.importance === 3) {
      card.importance = patch.importance
    }

    card.updatedAt = Date.now()
  }

  function moveCard(params: { cardId: ID; toColumnId: ID; toIndex?: number }): void {
    const { cardId, toColumnId, toIndex } = params

    const s = state.value as KanbanBoardStateV2
    const card = s.cards[cardId]
    if (!card) return

    const fromCol = s.columns[card.columnId]
    const toCol = s.columns[toColumnId]
    if (!fromCol || !toCol) return

    pushHistory()

    const isSameColumn = card.columnId === toColumnId
    const fromIndex = fromCol.cardOrder.indexOf(cardId)
    if (fromIndex === -1) return

    fromCol.cardOrder.splice(fromIndex, 1)
    card.columnId = toColumnId

    const rawIndex = typeof toIndex === 'number' ? toIndex : toCol.cardOrder.length
    const adjustedIndex =
      isSameColumn && typeof toIndex === 'number' && toIndex > fromIndex ? rawIndex - 1 : rawIndex

    const insertIndex = Math.max(0, Math.min(adjustedIndex, toCol.cardOrder.length))
    toCol.cardOrder.splice(insertIndex, 0, cardId)

    card.updatedAt = Date.now()
  }

  function moveColumn(params: { columnId: ID; toIndex: number }): void {
    const { columnId, toIndex } = params

    const s = state.value as KanbanBoardStateV2
    const order = s.columnOrder
    const fromIndex = order.indexOf(columnId)
    if (fromIndex === -1) return

    const clamped = Math.max(0, Math.min(toIndex, order.length - 1))
    if (clamped === fromIndex) return

    pushHistory()

    order.splice(fromIndex, 1)
    const adjusted = clamped > fromIndex ? clamped - 1 : clamped
    order.splice(adjusted, 0, columnId)
  }

  return {
    state,
    history,
    canUndo,
    undo,

    getColumnsInOrder,
    getCardsForColumn,
    getLabels,

    resetBoard,
    addColumn,
    removeColumn,
    addCard,
    removeCard,
    renameColumn,
    renameCard,
    updateCard,
    moveCard,
    moveColumn,
  }
})
