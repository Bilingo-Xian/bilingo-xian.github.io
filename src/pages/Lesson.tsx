import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router'
import {
  findLesson,
  lessonFiles,
  fileUrl,
  fileLabel,
  UNIT_COLORS,
  TYPE_ICONS,
} from '@/lib/data'
import type { ContentFile, LessonData } from '@/types'

export default function Lesson() {
  const { levelId = '', unit = '', cycle = '' } = useParams()
  const lesson = findLevel()
  const [lightbox, setLightbox] = useState<string | null>(null)

  function findLevel(): LessonData | undefined {
    return findLesson(levelId, parseInt(unit, 10), parseInt(cycle, 10))
  }

  // close lightbox on Escape
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setLightbox(null)
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  if (!lesson) {
    return (
      <div className="min-h-screen grid place-items-center text-center p-6">
        <div>
          <div className="text-5xl mb-4">🧐</div>
          <h1 className="font-display text-2xl font-bold text-slate-700">Can't find that lesson!</h1>
          <Link to={`/level/${levelId}`} className="mt-4 inline-block text-orange-500 font-medium hover:underline">
            ← back to {levelId}
          </Link>
        </div>
      </div>
    )
  }

  const files = lessonFiles(lesson.code)
  const games = files.filter((f) => f.type === 'game')
  const videos = files.filter((f) => f.type === 'video')
  const images = files.filter((f) => f.type === 'image')
  const others = files.filter((f) => !['game', 'video', 'image'].includes(f.type))
  const color = UNIT_COLORS[lesson.unit] ?? UNIT_COLORS[1]

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 via-orange-50 to-rose-50 pb-20">
      {/* header */}
      <div className="mx-auto max-w-5xl px-6 pt-8">
        <Link
          to={`/level/${lesson.level}`}
          className="text-sm font-medium text-slate-500 hover:text-orange-500 transition-colors"
        >
          ← {lesson.level.replace('GE', 'GE ')} · all lessons
        </Link>

        <div className="mt-4 rounded-3xl bg-white shadow-sm border border-slate-100 p-6 md:p-8">
          <div className="flex flex-wrap items-center gap-3">
            <span className={`font-display text-lg font-bold text-white rounded-2xl px-4 py-1.5 ${color.bg}`}>
              {lesson.code}
            </span>
            <span className={`text-sm font-semibold ${color.text}`}>Unit {lesson.unit} · {lesson.unitTitle}</span>
          </div>
          <h1 className="mt-3 font-display text-4xl md:text-5xl font-bold text-slate-800">
            {lesson.classTitle}
          </h1>

          {/* target language */}
          <div className="mt-6 grid md:grid-cols-2 gap-5">
            <div className={`rounded-2xl p-5 ${color.soft}`}>
              <h2 className={`font-display font-semibold ${color.text} mb-3`}>🎯 Target Vocabulary</h2>
              <div className="flex flex-wrap gap-2">
                {lesson.vocabulary.map((v) => (
                  <span key={v} className="rounded-full bg-white px-3 py-1.5 text-sm font-medium text-slate-700 shadow-sm">
                    {v}
                  </span>
                ))}
              </div>
            </div>
            <div className="rounded-2xl p-5 bg-slate-50">
              <h2 className="font-display font-semibold text-slate-600 mb-3">🗣️ Target Structures</h2>
              <ul className="space-y-2">
                {lesson.structures.map((s) => (
                  <li key={s} className="rounded-xl bg-white px-3 py-2 text-sm font-medium text-slate-700 shadow-sm">
                    {s}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* materials */}
      <main className="mx-auto max-w-5xl px-6 mt-8 space-y-10">
        {files.length === 0 && (
          <div className="rounded-3xl border-2 border-dashed border-slate-300 bg-white/60 p-12 text-center text-slate-400">
            <div className="text-5xl mb-3">🚧</div>
            Bonus materials for this lesson are still being cooked… check back soon!
          </div>
        )}

        {games.length > 0 && (
          <section>
            <SectionTitle icon="🎮" title="Interactive Games" count={games.length} />
            <div className="grid gap-5">
              {games.map((f) => (
                <GameCard key={f.path} file={f} />
              ))}
            </div>
          </section>
        )}

        {videos.length > 0 && (
          <section>
            <SectionTitle icon="🎬" title="Videos" count={videos.length} />
            <div className="grid sm:grid-cols-2 gap-5">
              {videos.map((f) => (
                <div key={f.path} className="rounded-3xl bg-white shadow-sm border border-slate-100 overflow-hidden">
                  <video controls preload="metadata" className="w-full aspect-video bg-black" src={fileUrl(f.path)} />
                  <div className="px-4 py-3 text-sm font-medium text-slate-600 flex items-center justify-between gap-2">
                    <span className="truncate">{fileLabel(f.name)}</span>
                    <a href={fileUrl(f.path)} download className="shrink-0 text-slate-300 hover:text-orange-400" title="Download">
                      ⬇
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {images.length > 0 && (
          <section>
            <SectionTitle icon="🖼️" title="Pictures" count={images.length} />
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {images.map((f) => (
                <button
                  key={f.path}
                  onClick={() => setLightbox(f.path)}
                  className="group rounded-2xl overflow-hidden bg-white shadow-sm border border-slate-100
                    hover:shadow-md hover:-translate-y-0.5 transition-all"
                >
                  <img
                    src={fileUrl(f.path)}
                    alt={fileLabel(f.name)}
                    loading="lazy"
                    className="w-full aspect-square object-cover group-hover:scale-105 transition-transform duration-200"
                  />
                  <div className="px-3 py-2 text-xs font-medium text-slate-500 truncate">{fileLabel(f.name)}</div>
                </button>
              ))}
            </div>
          </section>
        )}

        {others.length > 0 && (
          <section>
            <SectionTitle icon="📁" title="Other Files" count={others.length} />
            <div className="grid sm:grid-cols-2 gap-3">
              {others.map((f) => (
                <a
                  key={f.path}
                  href={fileUrl(f.path)}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-3 rounded-2xl bg-white px-4 py-3 shadow-sm border border-slate-100
                    hover:border-orange-300 hover:shadow transition-all"
                >
                  <span className="text-2xl">{TYPE_ICONS[f.type]}</span>
                  <span className="text-sm font-medium text-slate-700 truncate">{f.name}</span>
                </a>
              ))}
            </div>
          </section>
        )}
      </main>

      {/* prev / next */}
      <PrevNext lesson={lesson} />

      {/* lightbox */}
      {lightbox && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm grid place-items-center p-6 cursor-zoom-out"
          onClick={() => setLightbox(null)}
        >
          <img
            src={fileUrl(lightbox)}
            alt={fileLabel(lightbox.split('/').pop() ?? '')}
            className="max-h-[85vh] max-w-full rounded-2xl shadow-2xl"
          />
          <button className="absolute top-5 right-6 text-white/80 hover:text-white text-4xl leading-none">×</button>
        </div>
      )}
    </div>
  )
}

function SectionTitle({ icon, title, count }: { icon: string; title: string; count: number }) {
  return (
    <h2 className="font-display text-2xl font-bold text-slate-800 mb-4">
      {icon} {title} <span className="text-base font-medium text-slate-400">×{count}</span>
    </h2>
  )
}

function GameCard({ file }: { file: ContentFile }) {
  const [playing, setPlaying] = useState(false)

  return (
    <div className="rounded-3xl bg-white shadow-sm border border-slate-100 overflow-hidden">
      {playing ? (
        <iframe
          src={fileUrl(file.path)}
          title={fileLabel(file.name)}
          className="w-full aspect-[4/3] bg-white"
          allowFullScreen
        />
      ) : (
        <button
          onClick={() => setPlaying(true)}
          className="group relative w-full aspect-[4/3] bg-gradient-to-br from-violet-100 via-fuchsia-50 to-amber-100
            grid place-items-center hover:from-violet-200 hover:to-amber-200 transition-colors"
        >
          <span className="rounded-full bg-white/90 shadow-md px-6 py-3 font-display font-bold text-violet-600
            group-hover:scale-105 transition-transform">
            ▶ Play here
          </span>
        </button>
      )}
      <div className="px-4 py-3 flex items-center justify-between gap-2">
        <span className="text-sm font-medium text-slate-600 truncate">{fileLabel(file.name)}</span>
        <a
          href={fileUrl(file.path)}
          target="_blank"
          rel="noreferrer"
          className="shrink-0 rounded-full bg-slate-100 hover:bg-orange-100 hover:text-orange-500 px-3 py-1 text-xs font-semibold text-slate-500 transition-colors"
        >
          fullscreen ↗
        </a>
      </div>
    </div>
  )
}

function PrevNext({ lesson }: { lesson: LessonData }) {
  const prev = findLesson(lesson.level, lesson.unit, lesson.cycle - 1)
    ?? (lesson.unit > 1 ? findLesson(lesson.level, lesson.unit - 1, 99) : undefined)
  const next = findLesson(lesson.level, lesson.unit, lesson.cycle + 1)
    ?? findLesson(lesson.level, lesson.unit + 1, 1)

  return (
    <nav className="mx-auto max-w-5xl px-6 mt-12 flex items-stretch justify-between gap-4">
      {prev ? (
        <Link
          to={`/lesson/${prev.level}/${prev.unit}/${prev.cycle}`}
          className="flex-1 rounded-2xl bg-white/80 border border-slate-200 px-5 py-4 hover:border-orange-300 hover:shadow transition-all"
        >
          <div className="text-xs font-semibold text-slate-400">← previous</div>
          <div className="font-display font-semibold text-slate-700">{prev.code} · {prev.classTitle}</div>
        </Link>
      ) : <div className="flex-1" />}
      {next ? (
        <Link
          to={`/lesson/${next.level}/${next.unit}/${next.cycle}`}
          className="flex-1 text-right rounded-2xl bg-white/80 border border-slate-200 px-5 py-4 hover:border-orange-300 hover:shadow transition-all"
        >
          <div className="text-xs font-semibold text-slate-400">next →</div>
          <div className="font-display font-semibold text-slate-700">{next.code} · {next.classTitle}</div>
        </Link>
      ) : <div className="flex-1" />}
    </nav>
  )
}
