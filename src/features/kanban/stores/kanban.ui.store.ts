import { defineStore } from 'pinia'
import { useLocalStorage } from '@vueuse/core'
import type { ID } from '@/features/kanban/types/kanban.types'

export const useKanbanUiStore = defineStore('kanban-ui', () => {
  const searchQuery = useLocalStorage<string>('kanban:ui:search', '')
  const labelFilterId = useLocalStorage<ID | 'all'>('kanban:ui:label', 'all')

  return {
    searchQuery,
    labelFilterId,
  }
})
