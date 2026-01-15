import type {
  KanbanBoardStateV2,
  KanbanCard,
  KanbanColumn,
  ID,
} from '@/features/kanban/types/kanban.types'
import { defaultLabels } from '@/features/kanban/utils/labels'

type V1State = {
  columns: Record<ID, { id: ID; title: string; cardOrder: ID[] }>
  cards: Record<ID, { id: ID; columnId: ID; title: string; createdAt: number }>
  columnOrder: ID[]
}

export function migrateV1ToV2(v1: V1State): KanbanBoardStateV2 {
  const labels = defaultLabels()

  const columns: Record<ID, KanbanColumn> = {}
  for (const [id, col] of Object.entries(v1.columns)) {
    columns[id] = { id, title: col.title, cardOrder: [...col.cardOrder] }
  }

  const cards: Record<ID, KanbanCard> = {}
  for (const [id, c] of Object.entries(v1.cards)) {
    const createdAt = typeof c.createdAt === 'number' ? c.createdAt : Date.now()
    cards[id] = {
      id,
      columnId: c.columnId,
      title: c.title ?? 'Untitled',
      description: '',
      labelIds: [],
      dueAt: null,
      importance: 1,
      createdAt,
      updatedAt: createdAt,
    }
  }

  return {
    version: 2,
    columns,
    cards,
    columnOrder: Array.isArray(v1.columnOrder) ? [...v1.columnOrder] : [],
    labels,
  }
}
