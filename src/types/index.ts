export interface LessonData {
  level: string
  unit: number
  cycle: number
  code: string // e.g. "GE3 U1C1"
  unitTitle: string
  classTitle: string
  vocabulary: string[]
  structures: string[]
}

export interface ContentFile {
  name: string
  type: 'game' | 'video' | 'image' | 'pdf' | 'doc' | 'sheet' | 'other'
  path: string
}

export interface LevelInfo {
  id: string // GE3
  name: string // GE 3
  active: boolean
  blurb: string
}
