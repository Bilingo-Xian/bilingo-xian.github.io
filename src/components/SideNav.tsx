import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router'
import { LEVELS, lessonsForLevel, unitsForLevel, UNIT_COLORS } from '@/lib/data'

/**
 * Slide-in jump panel, available on every page:
 * book -> unit -> lesson, plus the coming-soon levels.
 */
export default function SideNav() {
  const [open, setOpen] = useState(false)
  const location = useLocation()

  // highlight the current lesson when the panel is opened from a lesson page
  const current = (() => {
    const m = location.pathname.match(/\/lesson\/(GE\d+)\/(\d+)\/(\d+)/)
    return m ? { level: m[1], unit: +m[2], cycle: +m[3] } : null
  })()

  // close on Escape, lock body scroll while open
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false)
    window.addEventListener('keydown', onKey)
    document.body.style.overflow = open ? 'hidden' : ''
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [open])

  const ge3 = LEVELS.find((l) => l.active)!

  return (
    <>
      {/* pull tab */}
      <button
        onClick={() => setOpen(true)}
        aria-label="Open lesson navigator"
        className="fixed right-0 top-1/2 -translate-y-1/2 z-40 rounded-l-2xl bg-white shadow-md ring-1 ring-slate-900/5
          px-2.5 py-4 hover:pr-4 transition-all duration-200 flex flex-col items-center gap-1.5"
      >
        <span className="text-xl">📚</span>
        <span
          className="text-[11px] font-bold text-slate-500 tracking-wide"
          style={{ writingMode: 'vertical-rl' }}
        >
          JUMP TO
        </span>
      </button>

      {/* backdrop */}
      {open && (
        <div
          className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-[2px]"
          onClick={() => setOpen(false)}
        />
      )}

      {/* panel */}
      <aside
        className={`fixed inset-y-0 right-0 z-50 w-80 max-w-[88vw] bg-white shadow-2xl flex flex-col
          transition-transform duration-300 ease-in-out ${open ? 'translate-x-0' : 'translate-x-full'}`}
        aria-hidden={!open}
      >
        <header className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <h2 className="font-display text-lg font-bold text-slate-800">📚 Jump to a lesson</h2>
          <button
            onClick={() => setOpen(false)}
            aria-label="Close panel"
            className="rounded-full w-8 h-8 grid place-items-center text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors text-xl leading-none"
          >
            ×
          </button>
        </header>

        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-5">
          {/* live level */}
          <section>
            <div className="flex items-center gap-2 mb-2 px-1">
              <span className="font-display font-bold text-orange-500">{ge3.id.replace('GE', 'GE ')}</span>
              <span className="text-[11px] font-semibold uppercase tracking-wide text-emerald-600 bg-emerald-50 rounded-full px-2 py-0.5">
                ✓ live
              </span>
            </div>
            {unitsForLevel(ge3.id).map(({ unit, title }) => {
              const color = UNIT_COLORS[unit] ?? UNIT_COLORS[1]
              return (
                <div key={unit} className="mb-3">
                  <div className={`rounded-xl px-3 py-1.5 mb-1.5 ${color.soft}`}>
                    <span className={`text-xs font-bold ${color.text}`}>
                      Unit {unit} · {title}
                    </span>
                  </div>
                  <div className="space-y-0.5">
                    {lessonsForLevel(ge3.id)
                      .filter((l) => l.unit === unit)
                      .map((l) => {
                        const isCurrent =
                          current?.level === l.level && current.unit === l.unit && current.cycle === l.cycle
                        return (
                          <Link
                            key={l.code}
                            to={`/lesson/${l.level}/${l.unit}/${l.cycle}`}
                            onClick={() => setOpen(false)}
                            className={`flex items-baseline gap-2 rounded-lg px-3 py-1.5 text-sm transition-colors
                              ${isCurrent ? `${color.soft} ring-1 ${color.ring} font-semibold` : 'hover:bg-slate-50'}`}
                          >
                            <span className={`text-[11px] font-bold shrink-0 ${color.text}`}>{l.code}</span>
                            <span className="text-slate-600 truncate">{l.classTitle}</span>
                          </Link>
                        )
                      })}
                  </div>
                </div>
              )
            })}
          </section>

          {/* coming soon */}
          <section className="pt-3 border-t border-dashed border-slate-200">
            {LEVELS.filter((l) => !l.active).map((l) => (
              <div
                key={l.id}
                className="flex items-center justify-between rounded-xl px-3 py-2 mb-1 bg-slate-50 text-slate-400 select-none"
              >
                <span className="font-display font-semibold">{l.id.replace('GE', 'GE ')}</span>
                <span className="text-xs">😴 coming someday maybe…</span>
              </div>
            ))}
          </section>
        </div>

        <footer className="px-5 py-3 border-t border-slate-100 text-xs text-slate-400 text-center">
          Bilingo Bonus Box · internal use
        </footer>
      </aside>
    </>
  )
}
