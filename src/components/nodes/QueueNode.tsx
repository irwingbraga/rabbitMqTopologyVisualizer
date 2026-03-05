import { memo } from 'react'
import { Handle, Position, type NodeProps } from '@xyflow/react'
import { List, Users, MessageSquare, AlertCircle } from 'lucide-react'
import type { QueueNodeData } from '../../utils/topologyBuilder'

const QUEUE_STYLES: Record<string, { bg: string; border: string; text: string; badge: string }> = {
  classic: {
    bg: 'bg-teal-50',
    border: 'border-teal-400',
    text: 'text-teal-900',
    badge: 'bg-teal-100 text-teal-700 border-teal-300',
  },
  quorum: {
    bg: 'bg-indigo-50',
    border: 'border-indigo-400',
    text: 'text-indigo-900',
    badge: 'bg-indigo-100 text-indigo-700 border-indigo-300',
  },
  stream: {
    bg: 'bg-pink-50',
    border: 'border-pink-400',
    text: 'text-pink-900',
    badge: 'bg-pink-100 text-pink-700 border-pink-300',
  },
}

function getQueueStyle(type: string) {
  return QUEUE_STYLES[type] ?? QUEUE_STYLES.classic
}

function StateIndicator({ state }: { state?: string }) {
  if (!state || state === 'running') return null
  return (
    <AlertCircle className="w-3.5 h-3.5 text-amber-500" aria-label={`State: ${state}`} />
  )
}

function QueueNode({ data, selected }: NodeProps) {
  const d = data as unknown as QueueNodeData
  const style = getQueueStyle(d.queueType)

  return (
    <div
      className={`
        rounded-xl border-2 shadow-sm px-3 py-2.5 min-w-[180px] max-w-[220px]
        transition-all duration-150
        ${style.bg} ${style.border} ${style.text}
        ${selected ? 'ring-2 ring-offset-1 ring-current shadow-lg scale-105' : ''}
        ${d.exclusive ? 'border-dashed' : ''}
      `}
    >
      <Handle type="target" position={Position.Left} className="!w-2.5 !h-2.5 !bg-slate-400" />

      {/* Header */}
      <div className="flex items-center gap-1.5 mb-1.5">
        <List className="w-4 h-4" />
        <span className="text-xs font-bold uppercase tracking-wide opacity-70">Queue</span>
        <StateIndicator state={d.state} />
        {d.exclusive && (
          <span className="ml-auto text-[9px] bg-gray-200 text-gray-600 px-1 rounded">EXCL</span>
        )}
      </div>

      {/* Name */}
      <div className="text-sm font-semibold truncate" title={d.label}>
        {d.label}
      </div>

      {/* Badges */}
      <div className="flex flex-wrap gap-1 mt-1.5">
        <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded border ${style.badge}`}>
          {d.queueType}
        </span>
        {d.durable && (
          <span className="text-[10px] font-medium px-1.5 py-0.5 rounded border bg-gray-100 text-gray-600 border-gray-300">
            durable
          </span>
        )}
        {d.autoDelete && (
          <span className="text-[10px] font-medium px-1.5 py-0.5 rounded border bg-red-50 text-red-600 border-red-200">
            auto-del
          </span>
        )}
      </div>

      {/* Stats */}
      <div className="flex items-center gap-3 mt-2 pt-1.5 border-t border-current border-opacity-10">
        <span className="flex items-center gap-1 text-[11px] opacity-80">
          <MessageSquare className="w-3 h-3" />
          {d.messages}
        </span>
        <span className="flex items-center gap-1 text-[11px] opacity-80">
          <Users className="w-3 h-3" />
          {d.consumers}
        </span>
        {d.messagesUnacked > 0 && (
          <span className="flex items-center gap-1 text-[11px] text-amber-600 font-medium">
            <AlertCircle className="w-3 h-3" />
            {d.messagesUnacked}
          </span>
        )}
      </div>

      <Handle type="source" position={Position.Right} className="!w-2.5 !h-2.5 !bg-slate-400" />
    </div>
  )
}

export default memo(QueueNode)
