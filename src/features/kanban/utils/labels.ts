import type { KanbanLabel, ID } from '@/features/kanban/types/kanban.types'
import { createId } from '@/features/kanban/utils/id'

export function defaultLabels(): Record<ID, KanbanLabel> {
  const bug = createId('lbl')
  const feature = createId('lbl')
  const priority = createId('lbl')

  return {
    [bug]: { id: bug, name: 'Bug', color: 'red' },
    [feature]: { id: feature, name: 'Feature', color: 'blue' },
    [priority]: { id: priority, name: 'High Priority', color: 'amber' },
  }
}
