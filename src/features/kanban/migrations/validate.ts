import type { KanbanBoardStateV2 } from '@/features/kanban/types/kanban.types'

export function isV2State(x: unknown): x is KanbanBoardStateV2 {
  if (!x || typeof x !== 'object') return false
  const s = x as Record<string, unknown>
  if (s.version !== 2) return false
  if (!s.columns || typeof s.columns !== 'object') return false
  if (!s.cards || typeof s.cards !== 'object') return false
  if (!Array.isArray(s.columnOrder)) return false
  if (!s.labels || typeof s.labels !== 'object') return false
  return true
}
