// app/i18n/index.ts
// Dictionary type is derived from `pt` (source of truth).
// Adding a key to pt.ts will cause a TypeScript error in en.ts until matched.
import { pt } from './pt'
import { en } from './en'

export { pt, en }
export type Dictionary = typeof pt
export type Locale = 'pt' | 'en'
export const dictionaries: Record<Locale, Dictionary> = { pt, en }
