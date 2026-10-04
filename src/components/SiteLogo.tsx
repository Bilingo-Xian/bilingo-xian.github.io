import { Link } from 'react-router'

/** Bilingo logo pinned to the top-left corner of every page. */
export default function SiteLogo() {
  return (
    <Link
      to="/"
      aria-label="Bilingo Bonus Box — home"
      className="fixed top-4 left-4 z-40 block rounded-2xl bg-white/90 p-1.5 shadow-md ring-1 ring-slate-900/5 backdrop-blur
        hover:shadow-lg hover:scale-105 transition-all duration-200"
    >
      <img src="/logo.png" alt="Bilingo" className="h-9 w-auto md:h-20" />
    </Link>
  )
}
