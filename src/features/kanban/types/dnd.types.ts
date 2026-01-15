export type DndEntity = 'card' | 'column'

export interface DragPayloadBase {
  entity: DndEntity
}

export interface CardDragPayload extends DragPayloadBase {
  entity: 'card'
  cardId: string
  fromColumnId: string
  fromIndex: number
}

export interface ColumnDragPayload extends DragPayloadBase {
  entity: 'column'
  columnId: string
}

export type DragPayload = CardDragPayload | ColumnDragPayload
