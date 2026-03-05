import { useState } from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'

const EXCHANGE_TYPES = [
  { type: 'direct', color: 'bg-blue-100 border-blue-400 text-blue-800', label: 'Direct' },
  { type: 'fanout', color: 'bg-green-100 border-green-400 text-green-800', label: 'Fanout' },
  { type: 'topic', color: 'bg-purple-100 border-purple-400 text-purple-800', label: 'Topic' },
  { type: 'headers', color: 'bg-orange-100 border-orange-400 text-orange-800', label: 'Headers' },
  { type: 'other', color: 'bg-slate-100 border-slate-400 text-slate-800', label: 'Other' },
]

const QUEUE_TYPES = [
  { type: 'classic', color: 'bg-teal-100 border-teal-400 text-teal-800', label: 'Classic' },
  { type: 'quorum', color: 'bg-indigo-100 border-indigo-400 text-indigo-800', label: 'Quorum' },
  { type: 'stream', color: 'bg-pink-100 border-pink-400 text-pink-800', label: 'Stream' },
]

export default function Legend() {
  const [open, setOpen] = useState(true)

  return (
    <div className="absolute bottom-10 left-4 z-10 bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden min-w-[200px]">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-3 py-2 text-xs font-semibold text-gray-600 uppercase tracking-wider bg-gray-50 border-b border-gray-100 hover:bg-gray-100 transition-colors"
      >
        Legend
        {open ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronUp className="w-3.5 h-3.5" />}
      </button>

      {open && (
        <div className="p-2.5 space-y-2.5">
          <div>
            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Exchanges</p>
            <div className="space-y-1">
              {EXCHANGE_TYPES.map((e) => (
                <div key={e.type} className="flex items-center gap-2">
                  <div className={`w-10 h-5 rounded border-2 ${e.color} shrink-0`} />
                  <span className="text-xs text-gray-600">{e.label}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="border-t border-gray-100 pt-2">
            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Queues</p>
            <div className="space-y-1">
              {QUEUE_TYPES.map((q) => (
                <div key={q.type} className="flex items-center gap-2">
                  <div className={`w-10 h-5 rounded border-2 ${q.color} shrink-0`} />
                  <span className="text-xs text-gray-600">{q.label}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="border-t border-gray-100 pt-2">
            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Consumers</p>
            <div className="flex items-center gap-2">
              <div className="w-10 h-5 rounded border-2 bg-amber-100 border-amber-400 shrink-0" />
              <span className="text-xs text-gray-600">Consumer</span>
            </div>
          </div>

          <div className="border-t border-gray-100 pt-2">
            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Edges</p>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <div className="w-10 h-0.5 bg-slate-400 shrink-0 relative">
                  <span className="absolute right-0 top-1/2 -translate-y-1/2 text-slate-400 text-[10px]">▶</span>
                </div>
                <span className="text-xs text-gray-600">Binding</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-10 h-0.5 bg-amber-400 shrink-0 animate-pulse relative">
                  <span className="absolute right-0 top-1/2 -translate-y-1/2 text-amber-400 text-[10px]">▶</span>
                </div>
                <span className="text-xs text-gray-600">Active consumer</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
