// Performance optimization utilities

// Cache for API responses
const responseCache = new Map<string, { data: unknown; timestamp: number }>()
const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes

export function getCachedResponse(key: string) {
  const cached = responseCache.get(key)
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data
  }
  responseCache.delete(key)
  return null
}

export function setCachedResponse(key: string, data: unknown) {
  responseCache.set(key, { data, timestamp: Date.now() })
}

// Debounce function for search and input
export function debounce<T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number,
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout
  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      clearTimeout(timeout)
      func(...args)
    }
    clearTimeout(timeout)
    timeout = setTimeout(later, wait)
  }
}

// Throttle function for scroll and resize events
export function throttle<T extends (...args: unknown[]) => unknown>(
  func: T,
  limit: number,
): (...args: Parameters<T>) => void {
  let inThrottle: boolean
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args)
      inThrottle = true
      setTimeout(() => (inThrottle = false), limit)
    }
  }
}

// Lazy load images
export function lazyLoadImages() {
  if ("IntersectionObserver" in window) {
    const imageObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const img = entry.target as HTMLImageElement
          img.src = img.dataset.src || ""
          img.classList.remove("lazy")
          imageObserver.unobserve(img)
        }
      })
    })

    document.querySelectorAll("img.lazy").forEach((img) => imageObserver.observe(img))
  }
}

// Prefetch resources
export function prefetchResource(url: string, as: "script" | "style" | "image" = "script") {
  const link = document.createElement("link")
  link.rel = "prefetch"
  link.as = as
  link.href = url
  document.head.appendChild(link)
}

// Measure performance
export function measurePerformance(label: string) {
  const start = performance.now()
  return () => {
    const end = performance.now()
    console.log(`[Performance] ${label}: ${(end - start).toFixed(2)}ms`)
  }
}
