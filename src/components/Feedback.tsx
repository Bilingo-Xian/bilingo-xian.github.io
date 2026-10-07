import { useEffect, useState } from 'react'
import { FEEDBACK_EMAIL } from '@/config'

const FEEDBACK_TYPES = [
  'Technical problem',
  'Feedback on an existing activity',
  'Idea for new content',
  'Something else',
]

type Status = 'idle' | 'sent'

/** Floating feedback button + modal form, shown on every page. */
export default function Feedback() {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false)
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-5 right-5 z-40 rounded-full bg-slate-800/90 hover:bg-slate-700 text-white
          shadow-lg px-5 py-3 text-sm font-semibold flex items-center gap-2 transition-all hover:scale-105"
      >
        📝 Feedback
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-[2px] grid place-items-center p-4"
          onClick={() => setOpen(false)}
        >
          <FeedbackDialog onClose={() => setOpen(false)} />
        </div>
      )}
    </>
  )
}

function FeedbackDialog({ onClose }: { onClose: () => void }) {
  const [name, setName] = useState('')
  const [type, setType] = useState(FEEDBACK_TYPES[0])
  const [message, setMessage] = useState('')
  const [status, setStatus] = useState<Status>('idle')

  function submit(e: React.FormEvent) {
    e.preventDefault()
    const subject = encodeURIComponent(`Bonus Box feedback: ${type}`)
    const body = encodeURIComponent(
      `Name: ${name || '(not given)'}\nType: ${type}\n\n${message}\n\n— sent from the Bilingo Bonus Box`,
    )
    window.location.href = `mailto:${FEEDBACK_EMAIL}?subject=${subject}&body=${body}`
    setStatus('sent')
  }

  return (
    <div
      className="w-full max-w-md rounded-3xl bg-white shadow-2xl p-6"
      onClick={(e) => e.stopPropagation()}
      role="dialog"
      aria-label="Feedback form"
    >
      {status === 'sent' ? (
        <div className="text-center py-6">
          <div className="text-5xl mb-3">📮</div>
          <h3 className="font-display text-2xl font-bold text-slate-800">Check your email app!</h3>
          <p className="mt-2 text-slate-500 text-sm">
            A pre-filled email to Alex should have opened — just press <b>send</b>.
            <br />
            Nothing opened? You can also communicate to Alex by <b>WeChat</b> for a follow up!
          </p>
          <button
            onClick={onClose}
            className="mt-5 rounded-full bg-orange-500 hover:bg-orange-400 text-white font-semibold px-6 py-2.5 transition-colors"
          >
            Close
          </button>
        </div>
      ) : (
        <form onSubmit={submit}>
          <div className="flex items-start justify-between mb-4">
            <h3 className="font-display text-2xl font-bold text-slate-800">📝 Feedback</h3>
            <button type="button" onClick={onClose} aria-label="Close" className="text-slate-300 hover:text-slate-500 text-2xl leading-none">
              ×
            </button>
          </div>

          <label className="block text-sm font-semibold text-slate-600 mb-1">Your name (optional)</label>
          <input
            name="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded-xl border border-slate-200 px-3 py-2.5 mb-3 focus:outline-none focus:ring-2 focus:ring-orange-300"
            placeholder="e.g. Alex"
          />

          <label className="block text-sm font-semibold text-slate-600 mb-1">Type</label>
          <select
            name="type"
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="w-full rounded-xl border border-slate-200 px-3 py-2.5 mb-3 bg-white focus:outline-none focus:ring-2 focus:ring-orange-300"
          >
            {FEEDBACK_TYPES.map((t) => (
              <option key={t}>{t}</option>
            ))}
          </select>

          <label className="block text-sm font-semibold text-slate-600 mb-1">Message</label>
          <textarea
            name="message"
            required
            rows={4}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="w-full rounded-xl border border-slate-200 px-3 py-2.5 mb-1 focus:outline-none focus:ring-2 focus:ring-orange-300 resize-none"
            placeholder="What's on your mind?"
          />

          <p className="text-xs text-slate-400 mb-4">
            You can also communicate to Alex by <b>WeChat</b> for a follow up!
          </p>

          <button
            type="submit"
            className="w-full rounded-full bg-orange-500 hover:bg-orange-400 text-white font-display font-semibold py-3 transition-colors"
          >
            Open email app & send 🚀
          </button>
        </form>
      )}
    </div>
  )
}
