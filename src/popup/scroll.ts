export function observeScrollSize(element: HTMLElement, update: () => void): () => void {
  const observer = new ResizeObserver(update)
  observer.observe(element)
  // The viewport stays fixed when conditional settings change the content height.
  if (element.firstElementChild) observer.observe(element.firstElementChild)
  update()
  return () => observer.disconnect()
}
