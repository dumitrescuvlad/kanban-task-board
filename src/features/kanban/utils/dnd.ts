import type { DragPayload } from '@/features/kanban/types/dnd.types'

const MIME = 'application/x-kanban-dnd'

export function writeDragPayload(dt: DataTransfer, payload: DragPayload): void {
  dt.setData(MIME, JSON.stringify(payload))
}

export function readDragPayload(dt: DataTransfer): DragPayload | null {
  const raw = dt.getData(MIME)
  if (!raw) return null

  try {
    return JSON.parse(raw) as DragPayload
  } catch {
    return null
  }
}
