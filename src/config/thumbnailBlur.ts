export const MIN_BLUR_LEVEL = 1
export const MAX_BLUR_LEVEL = 24
export const DEFAULT_BLUR_LEVEL = 12

export function normalizeBlurLevel(value: unknown): number {
  if (typeof value !== 'number' || !Number.isFinite(value)) return DEFAULT_BLUR_LEVEL
  return Math.min(MAX_BLUR_LEVEL, Math.max(MIN_BLUR_LEVEL, Math.round(value)))
}
