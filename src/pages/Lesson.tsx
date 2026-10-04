import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router'
import {
  findLesson,
  lessonFiles,
  pictureSetImages,
  fileUrl,
  fileLabel,
  tierIsEmpty,
  TIER_COLORS,
  TIERS,
  UNIT_COLORS,
  TYPE_ICONS,
} from '@/lib/data'
import type { ContentFile, LessonData, TierData } from '@/types'

export default function Lesson() {
  const { levelId = '', unit = '', cycle = '' } = useParams()
  const lesson = findLesson(levelId, parseInt(unit, 10), parseInt(cycle, 10))
  const [lightbox, setLightbox] = useState<string | null>(null)

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
  const setImages = pictureSetImages(lesson.code)
  const others = files.filter((f) => !['game', 'video', 'image'].includes(f.type))
  const color = UNIT_COLORS[lesson.unit] ?? UNIT_COLORS[1]
  const hasMaterialsBelow = games.length > 0 || setImages.length > 0

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 via-orange-50 to-rose-50 pb-28">
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
            <span className={`text-sm font-semibold ${color.text}`}>
              Unit {lesson.unit} · {lesson.unitTitle}
            </span>
          </div>
          <h1 className="mt-3 font-display text-4xl md:text-5xl font-bold text-slate-800">
            {lesson.classTitle}
          </h1>

          {/* target language + activities */}
          <div className="mt-6 grid md:grid-cols-2 gap-5 items-start">
            <div className="space-y-5">
              <TierBox title="Target Vocabulary" icon="🎯" tiers={lesson.vocabulary} variant="chips" />
              <TierBox title="Target Structures" icon="🗣️" tiers={lesson.structures} variant="list" />
            </div>
            <div className="space-y-5">
              <TierBox
                title="Target Grammar"
                icon="📐"
                tiers={lesson.grammar}
                variant="list"
                emptyNote="No new grammar focus — review and combine previous patterns."
              />
              <ActivitiesBox lesson={lesson} hasMaterialsBelow={hasMaterialsBelow} />
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

        {setImages.length > 0 && (
          <section>
            <SectionTitle icon="🖼️" title="Picture Set" count={setImages.length} />
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {setImages.map((f) => (
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

// ---------------------------------------------------------------------------
// tiered A/B/C box (vocabulary / structures / grammar)
// ---------------------------------------------------------------------------
function TierBox({
  title,
  icon,
  tiers,
  variant,
  emptyNote,
}: {
  title: string
  icon: string
  tiers: TierData
  variant: 'chips' | 'list'
  emptyNote?: string
}) {
  return (
    <div className="rounded-2xl p-4 bg-slate-50 border border-slate-200">
      <h2 className="font-display font-semibold text-slate-600 mb-3">
        {icon} {title}
      </h2>
      {tierIsEmpty(tiers) ? (
        <p className="text-sm text-slate-400 italic">{emptyNote ?? 'No targets listed for this lesson.'}</p>
      ) : (
        <div className="space-y-2">
          {TIERS.map(
            (tier) =>
              tiers[tier].length > 0 && (
                <div
                  key={tier}
                  className="relative rounded-xl border-l-4 p-3 pr-9"
                  style={{
                    borderColor: TIER_COLORS[tier],
                    backgroundColor: `${TIER_COLORS[tier]}14`,
                  }}
                >
                  <span
                    className="absolute top-2 right-2 w-5 h-5 grid place-items-center rounded-md text-[11px] font-black"
                    style={{ backgroundColor: TIER_COLORS[tier], color: '#1c1917' }}
                  >
                    {tier.toLowerCase()}
                  </span>
                  {variant === 'chips' ? (
                    <div className="flex flex-wrap gap-1.5">
                      {tiers[tier].map((v) => (
                        <span key={v} className="rounded-full bg-white/90 px-2.5 py-1 text-sm font-medium text-slate-700 shadow-sm">
                          {v}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <ul className="space-y-1.5">
                      {tiers[tier].map((s) => (
                        <li key={s} className="text-sm font-medium text-slate-700 leading-snug">
                          {s}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ),
          )}
        </div>
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------
// bonus activities (from the master file), purple & scrollable
// ---------------------------------------------------------------------------
function ActivitiesBox({ lesson, hasMaterialsBelow }: { lesson: LessonData; hasMaterialsBelow: boolean }) {
  const LINKED = /html|interactive|picture/i
  return (
    <div className="rounded-2xl p-4 bg-violet-50 border border-violet-200">
      <h2 className="font-display font-semibold text-violet-700 mb-3">🎲 Bonus Activity Ideas</h2>
      {lesson.activities.length === 0 ? (
        <p className="text-sm text-violet-300 italic">No extra activities listed — improvise and have fun!</p>
      ) : (
        <ol className="space-y-2.5 max-h-72 overflow-y-auto pr-2">
          {lesson.activities.map((a, i) => (
            <li key={i} className="text-sm text-slate-700 leading-snug flex gap-2">
              <span className="shrink-0 font-display font-bold text-violet-400">{i + 1}.</span>
              <span>
                {a}
                {hasMaterialsBelow && LINKED.test(a) && (
                  <span className="text-violet-500 font-semibold"> (see below)</span>
                )}
              </span>
            </li>
          ))}
        </ol>
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
          open in new tab ↗
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
    <nav className="mx-auto max-w-5xl px-6 mt-12 flex flex-col sm:flex-row gap-4">
      {prev ? (
        <Link
          to={`/lesson/${prev.level}/${prev.unit}/${prev.cycle}`}
          className="rounded-2xl bg-white/80 border border-slate-200 px-5 py-4 hover:border-orange-300 hover:shadow transition-all sm:w-64"
        >
          <div className="text-xs font-semibold text-slate-400">← previous lesson</div>
          <div className="font-display font-semibold text-slate-700">{prev.code} · {prev.classTitle}</div>
        </Link>
      ) : (
        <div className="sm:w-64" />
      )}
      {next ? (
        <Link
          to={`/lesson/${next.level}/${next.unit}/${next.cycle}`}
          className="flex-1 group rounded-2xl bg-gradient-to-r from-amber-400 to-rose-400 px-6 py-4 shadow-lg shadow-orange-200
            hover:shadow-xl hover:-translate-y-0.5 transition-all"
        >
          <div className="text-xs font-semibold text-white/80">next lesson →</div>
          <div className="font-display font-bold text-white text-lg">
            {next.code} · {next.classTitle}
          </div>
          <div className="text-white/80 text-sm mt-0.5 group-hover:translate-x-1 transition-transform">keep going! 🚀</div>
        </Link>
      ) : (
        <div className="flex-1 rounded-2xl border-2 border-dashed border-slate-300 grid place-items-center p-4 text-slate-400 text-sm">
          🏁 That's the last GE3 lesson — for now!
        </div>
      )}
    </nav>
  )
}
