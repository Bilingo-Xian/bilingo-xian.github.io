import { Link } from 'react-router'
import { LEVELS, lessonsForLevel, lessonFiles } from '@/lib/data'

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 via-orange-50 to-rose-50">
      {/* header */}
      <header className="mx-auto max-w-5xl px-6 pt-14 pb-10 text-center">
        <div className="text-6xl mb-4">🎁</div>
        <h1 className="font-display text-5xl md:text-6xl font-bold text-slate-800 tracking-tight">
          Bilingo <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-500 via-rose-500 to-violet-500">Bonus Box</span>
        </h1>
        <p className="mt-4 text-lg text-slate-600 max-w-2xl mx-auto">
          All the bonus activities for the GE curriculum in one place —
          games, videos, and picture sets for every lesson. Open, click, teach! 🎉
        </p>
      </header>

      {/* level tiles */}
      <main className="mx-auto max-w-5xl px-6 pb-20">
        <h2 className="font-display text-sm font-semibold uppercase tracking-widest text-slate-400 mb-4">
          Pick your level
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-5">
          {LEVELS.map((level) =>
            level.active ? (
              <ActiveLevelCard key={level.id} levelId={level.id} />
            ) : (
              <ComingSoonCard key={level.id} name={level.name} />
            ),
          )}
        </div>

        {/* little note */}
        <div className="mt-12 rounded-3xl bg-white/70 backdrop-blur border border-white shadow-sm p-6 text-center text-sm text-slate-500">
          🔒 Internal use for Bilingo teachers · More levels migrate here as the curriculum update rolls on ·
          Missing something? Tell Alex and it shall appear.
        </div>
      </main>

      <footer className="pb-10 text-center text-xs text-slate-400">
        made with ❤️ (and a lot of ☕) for fun classes
      </footer>
    </div>
  )
}

function ActiveLevelCard({ levelId }: { levelId: string }) {
  const lessons = lessonsForLevel(levelId)
  const fileCount = lessons.reduce((n, l) => n + lessonFiles(l.code).length, 0)

  return (
    <Link
      to={`/level/${levelId}`}
      className="group relative col-span-2 md:col-span-1 md:row-span-2 rounded-3xl p-8
        bg-gradient-to-br from-amber-400 via-orange-400 to-rose-400
        shadow-lg shadow-orange-200 hover:shadow-xl hover:shadow-orange-300 hover:-translate-y-1
        transition-all duration-200 flex flex-col justify-between min-h-[220px]"
    >
      <div>
        <div className="font-display text-5xl font-bold text-white drop-shadow-sm">{ge3Name(levelId)}</div>
        <div className="mt-2 inline-block rounded-full bg-white/25 px-3 py-1 text-sm font-medium text-white">
          ✨ live now
        </div>
      </div>
      <div className="mt-6 flex items-end justify-between">
        <div className="text-white/95 text-sm font-medium">
          {lessons.length} lessons · {fileCount} activities
        </div>
        <div className="rounded-full bg-white text-orange-500 font-bold px-4 py-2 text-sm
          group-hover:scale-105 transition-transform">
          Open →
        </div>
      </div>
      <span className="absolute top-4 right-5 text-3xl group-hover:animate-bounce">🎈</span>
    </Link>
  )
}

function ge3Name(levelId: string) {
  return levelId.replace('GE', 'GE ')
}

function ComingSoonCard({ name }: { name: string }) {
  return (
    <div className="rounded-3xl p-6 bg-slate-100/80 border-2 border-dashed border-slate-300
      flex flex-col items-center justify-center text-center min-h-[140px] select-none">
      <div className="font-display text-2xl font-semibold text-slate-400">{name}</div>
      <div className="mt-2 text-sm text-slate-400">😴 Coming someday maybe…</div>
    </div>
  )
}
