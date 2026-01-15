import { onMounted, onUnmounted, type Ref } from 'vue'

export function useAutoScrollDuringDrag(containerRef: Ref<HTMLElement | null>) {
  let raf = 0
  let lastEvent: DragEvent | null = null

  function tick() {
    if (!lastEvent || !containerRef.value) return

    const container = containerRef.value
    const rect = container.getBoundingClientRect()
    const y = lastEvent.clientY

    const edge = 80 // Increased detection zone slightly
    const speed = 14

    // Scroll Up
    if (y < rect.top + edge) {
      container.scrollTop -= speed
    }
    // Scroll Down
    else if (y > rect.bottom - edge) {
      container.scrollTop += speed
    }

    raf = window.requestAnimationFrame(tick)
  }

  function onDragOver(e: DragEvent) {
    lastEvent = e
    if (!raf) raf = window.requestAnimationFrame(tick)
  }

  function onDragEnd() {
    lastEvent = null
    if (raf) window.cancelAnimationFrame(raf)
    raf = 0
  }

  onMounted(() => {
    window.addEventListener('dragover', onDragOver)
    window.addEventListener('dragend', onDragEnd)
    window.addEventListener('drop', onDragEnd)
  })

  onUnmounted(() => {
    window.removeEventListener('dragover', onDragOver)
    window.removeEventListener('dragend', onDragEnd)
    window.removeEventListener('drop', onDragEnd)
    if (raf) window.cancelAnimationFrame(raf)
  })
}
