import { useMemo, useState } from 'react'
import { Link, useParams } from 'react-router'
import {
  getLevel,
  lessonsForLevel,
  lessonFiles,
  levelActivityCount,
  levelExtras,
  unitsForLevel,
  searchBlob,
  UNIT_COLORS,
  TYPE_ICONS,
  fileUrl,
} from '@/lib/data'
import type { LessonData } from '@/types'

export default function Level() {
  const { levelId = '' } = useParams()
  const level = getLevel(levelId)

  if (!level) {
    return (
      <div className="min-h-screen grid place-items-center text-center p-6">
        <div>
          <div className="text-5xl mb-4">🤔</div>
          <h1 className="font-display text-2xl font-bold text-slate-700">No such level (yet!)</h1>
          <Link to="/" className="mt-4 inline-block text-orange-500 font-medium hover:underline">
            ← back to all levels
          </Link>
        </div>
      </div>
    )
  }

  if (!level.active) {
    return (
      <div className="min-h-screen grid place-items-center text-center p-6 bg-slate-50">
        <div>
          <div className="text-6xl mb-4">😴</div>
          <h1 className="font-display text-4xl font-bold text-slate-500">{level.name}</h1>
          <p className="mt-3 text-slate-400">Coming someday maybe…</p>
          <Link to="/" className="mt-6 inline-block text-orange-500 font-medium hover:underline">
            ← back to all levels
          </Link>
        </div>
      </div>
    )
  }

  return <LevelContent levelId={level.id} />
}

function LevelContent({ levelId }: { levelId: string }) {
  const lessons = lessonsForLevel(levelId)
  const units = unitsForLevel(levelId)
  const extras = levelExtras(levelId)
  const [query, setQuery] = useState('')

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return lessons
    // search everything: codes, lesson titles, unit titles, vocab and structures
    return lessons.filter((l) => searchBlob(l).includes(q))
  }, [lessons, query])

  const counts = levelActivityCount(levelId)

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 via-orange-50 to-rose-50 pb-20">
      {/* top bar */}
      <div className="mx-auto max-w-5xl px-6 pt-8">
        <Link to="/" className="text-sm font-medium text-slate-500 hover:text-orange-500 transition-colors">
          ← all levels
        </Link>
        <div className="mt-4 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="font-display text-4xl md:text-5xl font-bold text-slate-800">
              {levelId.replace('GE', 'GE ')} <span className="text-2xl text-slate-400 font-semibold">· General English</span>
            </h1>
            <p className="mt-2 text-slate-600">
              {lessons.length} lessons · {counts.total} bonus activities · tap a lesson to see target language & materials
            </p>
          </div>
          {extras.map((f) => (
            <a
              key={f.path}
              href={fileUrl(f.path)}
              target="_blank"
              rel="noreferrer"
              className="rounded-full bg-white shadow-sm border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 hover:border-orange-300 hover:text-orange-500 transition-colors"
            >
              📖 {f.name.replace(/\.pdf$/i, '')}
            </a>
          ))}
        </div>

        {/* search */}
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="🔍 Search a lesson, topic or word… (try “family” or “animals”)"
          className="mt-6 w-full rounded-2xl border border-slate-200 bg-white px-5 py-3 shadow-sm
            placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-300 focus:border-orange-300"
        />
      </div>

      {/* units */}
      <main className="mx-auto max-w-5xl px-6 mt-8 space-y-10">
        {units.map(({ unit, title }) => {
          const color = UNIT_COLORS[unit] ?? UNIT_COLORS[1]
          const unitLessons = filtered.filter((l) => l.unit === unit)
          if (unitLessons.length === 0) return null
          return (
            <section key={unit}>
              <div className="flex items-center gap-3 mb-4">
                <span className={`font-display text-lg font-bold text-white rounded-2xl px-4 py-1.5 ${color.bg}`}>
                  Unit {unit}
                </span>
                <h2 className={`font-display text-xl font-semibold ${color.text}`}>{title}</h2>
              </div>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {unitLessons.map((lesson) => (
                  <LessonCard key={lesson.code} lesson={lesson} color={color} />
                ))}
              </div>
            </section>
          )
        })}
        {filtered.length === 0 && (
          <div className="text-center py-16 text-slate-400">
            <div className="text-5xl mb-3">🙈</div>
            Nothing found for “{query}” — try another word!
          </div>
        )}
      </main>
    </div>
  )
}

function LessonCard({ lesson, color }: { lesson: LessonData; color: (typeof UNIT_COLORS)[number] }) {
  const files = lessonFiles(lesson.code)
  const counts = files.reduce<Record<string, number>>((acc, f) => {
    acc[f.type] = (acc[f.type] ?? 0) + 1
    return acc
  }, {})

  return (
    <Link
      to={`/lesson/${lesson.level}/${lesson.unit}/${lesson.cycle}`}
      className={`group rounded-3xl bg-white p-5 shadow-sm border border-slate-100
        hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200
        ${files.length ? `hover:ring-2 ${color.ring}` : 'opacity-80'}`}
    >
      <div className="flex items-center justify-between">
        <span className={`text-xs font-bold tracking-wide uppercase ${color.text}`}>{lesson.code}</span>
        {files.length > 0 ? (
          <span className="text-xs font-medium text-slate-400">{files.length} file{files.length > 1 ? 's' : ''}</span>
        ) : (
          <span className="text-xs font-medium text-slate-300">soon…</span>
        )}
      </div>
      <h3 className="mt-2 font-display text-xl font-semibold text-slate-800 group-hover:text-slate-900">
        {lesson.classTitle}
      </h3>
      <div className="mt-3 flex flex-wrap gap-x-3 gap-y-1 text-sm">
        {files.length === 0 ? (
          <span className="text-slate-300 text-sm">materials coming soon</span>
        ) : (
          (Object.keys(counts) as (keyof typeof TYPE_ICONS)[]).map((t) => (
            <span key={t} className="text-slate-500" title={t}>
              {TYPE_ICONS[t]} {counts[t]}
            </span>
          ))
        )}
      </div>
    </Link>
  )
}
