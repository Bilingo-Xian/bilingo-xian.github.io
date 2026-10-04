import type { ContentFile, LessonData, LevelInfo, TierData } from '@/types'
import curriculumJson from '@/data/curriculum.json'
import contentJson from '@/data/content.json'

// ---------------------------------------------------------------------------
// levels: only GE3 is live; the rest are "coming someday maybe"
// ---------------------------------------------------------------------------
export const LEVELS: LevelInfo[] = [2, 3, 4, 5, 6, 7, 8].map((n) => ({
  id: `GE${n}`,
  name: `GE ${n}`,
  active: n === 3,
  blurb: n === 3 ? 'Bonus activities ready to go!' : 'Coming someday maybe…',
}))

export function getLevel(id: string): LevelInfo | undefined {
  return LEVELS.find((l) => l.id === id)
}

// ---------------------------------------------------------------------------
// tier colors — straight from the master file (A/B/C cell fills)
// ---------------------------------------------------------------------------
const tierColors = (curriculumJson as { tierColors: Record<string, string> }).tierColors

export const TIER_COLORS: Record<'A' | 'B' | 'C', string> = {
  A: tierColors.A ?? '#00B050',
  B: tierColors.B ?? '#FFC000',
  C: tierColors.C ?? '#FF767A',
}

export const TIERS = ['A', 'B', 'C'] as const
export type Tier = (typeof TIERS)[number]

export function tierIsEmpty(t: TierData): boolean {
  return !t.A.length && !t.B.length && !t.C.length
}

// ---------------------------------------------------------------------------
// curriculum data (from the GE Master File)
// ---------------------------------------------------------------------------
const lessons = (curriculumJson as { lessons: LessonData[] }).lessons

export function lessonsForLevel(levelId: string): LessonData[] {
  return lessons.filter((l) => l.level === levelId)
}

export function findLesson(
  levelId: string,
  unit: number,
  cycle: number,
): LessonData | undefined {
  return lessons.find(
    (l) => l.level === levelId && l.unit === unit && l.cycle === cycle,
  )
}

export function unitsForLevel(levelId: string) {
  const seen = new Map<number, string>()
  for (const l of lessonsForLevel(levelId)) {
    if (!seen.has(l.unit)) seen.set(l.unit, l.unitTitle)
  }
  return [...seen.entries()].map(([unit, title]) => ({ unit, title }))
}

/** all searchable text for a lesson (titles, code, vocab, structures) */
export function searchBlob(l: LessonData): string {
  return [
    l.code,
    l.classTitle,
    l.unitTitle,
    ...l.vocabulary.A, ...l.vocabulary.B, ...l.vocabulary.C,
    ...l.structures.A, ...l.structures.B, ...l.structures.C,
  ].join(' ').toLowerCase()
}

// ---------------------------------------------------------------------------
// content manifest (scanned from public/content)
// ---------------------------------------------------------------------------
type ContentDb = Record<
  string,
  { lessons: Record<string, ContentFile[]>; extras: ContentFile[] }
>

const contentDb = contentJson as unknown as ContentDb

export function lessonFiles(lessonCode: string): ContentFile[] {
  const levelKey = lessonCode.split(' ')[0] // "GE3 U1C1" -> "GE3"
  return contentDb[levelKey]?.lessons?.[lessonCode] ?? []
}

export function levelExtras(levelId: string): ContentFile[] {
  return contentDb[levelId]?.extras ?? []
}

/** images that form a standalone picture set (not part of an HTML game) */
export function pictureSetImages(lessonCode: string): ContentFile[] {
  return lessonFiles(lessonCode).filter((f) => f.type === 'image' && f.role === 'set')
}

export function levelActivityCount(levelId: string) {
  const lessons = contentDb[levelId]?.lessons ?? {}
  let games = 0
  let videos = 0
  let sets = 0
  for (const files of Object.values(lessons)) {
    games += files.filter((f) => f.type === 'game').length
    videos += files.filter((f) => f.type === 'video').length
    if (files.some((f) => f.role === 'set')) sets += 1
  }
  return { games, videos, sets, total: games + videos + sets }
}

// ---------------------------------------------------------------------------
// helpers
// ---------------------------------------------------------------------------

/** Build a safe URL for a public/ file (handles spaces, em-dashes, #, etc.) */
export function fileUrl(path: string): string {
  return '/' + path.split('/').map(encodeURIComponent).join('/')
}

export function fileLabel(name: string): string {
  return name.replace(/\.[a-z0-9]+$/i, '').replace(/\s*-\s*1080p$|\s*-\s*720p$/i, '')
}

/** per-unit playful colors */
export const UNIT_COLORS: Record<number, { bg: string; text: string; ring: string; soft: string }> = {
  1: { bg: 'bg-amber-400', text: 'text-amber-700', ring: 'ring-amber-300', soft: 'bg-amber-50' },
  2: { bg: 'bg-rose-400', text: 'text-rose-700', ring: 'ring-rose-300', soft: 'bg-rose-50' },
  3: { bg: 'bg-sky-400', text: 'text-sky-700', ring: 'ring-sky-300', soft: 'bg-sky-50' },
  4: { bg: 'bg-violet-400', text: 'text-violet-700', ring: 'ring-violet-300', soft: 'bg-violet-50' },
  5: { bg: 'bg-emerald-400', text: 'text-emerald-700', ring: 'ring-emerald-300', soft: 'bg-emerald-50' },
}

export const TYPE_ICONS: Record<ContentFile['type'], string> = {
  game: '🎮',
  video: '🎬',
  image: '🖼️',
  pdf: '📄',
  doc: '📝',
  sheet: '📊',
  other: '📁',
}
