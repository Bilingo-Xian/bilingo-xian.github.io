export interface TierData {
  A: string[]
  B: string[]
  C: string[]
}

export interface LessonData {
  level: string
  unit: number
  cycle: number
  code: string // e.g. "GE3 U1C1"
  unitTitle: string
  classTitle: string
  vocabulary: TierData
  structures: TierData
  grammar: TierData
  activities: string[]
}

export interface ContentFile {
  name: string
  type: 'game' | 'video' | 'image' | 'pdf' | 'doc' | 'sheet' | 'other'
  path: string
  /** images only: part of an HTML game (hidden) vs a standalone picture set (shown) */
  role?: 'asset' | 'set'
}

export interface LevelInfo {
  id: string // GE3
  name: string // GE 3
  active: boolean
  blurb: string
}
