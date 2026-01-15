export type ID = string

export interface KanbanLabel {
  id: ID
  name: string
  color:
    | 'slate'
    | 'red'
    | 'orange'
    | 'amber'
    | 'yellow'
    | 'lime'
    | 'green'
    | 'emerald'
    | 'teal'
    | 'cyan'
    | 'sky'
    | 'blue'
    | 'indigo'
    | 'violet'
    | 'purple'
    | 'fuchsia'
    | 'pink'
    | 'rose'
}

export interface KanbanCard {
  id: ID
  columnId: ID
  title: string
  description?: string
  labelIds: ID[]
  dueAt?: number | null
  importance: 1 | 2 | 3
  createdAt: number
  updatedAt: number
}

export type CardPatch = Partial<
  Pick<KanbanCard, 'title' | 'description' | 'labelIds' | 'dueAt' | 'importance'>
>

export interface KanbanColumn {
  id: ID
  title: string
  cardOrder: ID[]
}

export interface KanbanBoardStateV2 {
  version: 2
  columns: Record<ID, KanbanColumn>
  cards: Record<ID, KanbanCard>
  columnOrder: ID[]
  labels: Record<ID, KanbanLabel>
}

export type KanbanBoardState = KanbanBoardStateV2
