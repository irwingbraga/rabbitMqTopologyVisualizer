import { memo } from 'react'
import { Handle, Position, type NodeProps } from '@xyflow/react'
import { ArrowLeftRight, Radio, Hash, Filter, Zap, HelpCircle } from 'lucide-react'
import type { ExchangeNodeData } from '../../utils/topologyBuilder'

const EXCHANGE_STYLES: Record<string, { bg: string; border: string; text: string; badge: string }> = {
  direct: {
    bg: 'bg-blue-50',
    border: 'border-blue-400',
    text: 'text-blue-900',
    badge: 'bg-blue-100 text-blue-700 border-blue-300',
  },
  fanout: {
    bg: 'bg-green-50',
    border: 'border-green-400',
    text: 'text-green-900',
    badge: 'bg-green-100 text-green-700 border-green-300',
  },
  topic: {
    bg: 'bg-purple-50',
    border: 'border-purple-400',
    text: 'text-purple-900',
    badge: 'bg-purple-100 text-purple-700 border-purple-300',
  },
  headers: {
    bg: 'bg-orange-50',
    border: 'border-orange-400',
    text: 'text-orange-900',
    badge: 'bg-orange-100 text-orange-700 border-orange-300',
  },
}

function getExchangeStyle(type: string) {
  return EXCHANGE_STYLES[type] ?? {
    bg: 'bg-slate-50',
    border: 'border-slate-400',
    text: 'text-slate-900',
    badge: 'bg-slate-100 text-slate-700 border-slate-300',
  }
}

function ExchangeIcon({ type }: { type: string }) {
  const cls = 'w-4 h-4'
  switch (type) {
    case 'direct': return <ArrowLeftRight className={cls} />
    case 'fanout': return <Radio className={cls} />
    case 'topic': return <Hash className={cls} />
    case 'headers': return <Filter className={cls} />
    case 'x-delayed-message': return <Zap className={cls} />
    default: return <HelpCircle className={cls} />
  }
}

function ExchangeNode({ data, selected }: NodeProps) {
  const d = data as unknown as ExchangeNodeData
  const style = getExchangeStyle(d.exchangeType)
  const isDefault = !d.label || d.label === '(default)'

  return (
    <div
      className={`
        rounded-xl border-2 shadow-sm px-3 py-2.5 min-w-[180px] max-w-[220px]
        transition-all duration-150
        ${style.bg} ${style.border} ${style.text}
        ${selected ? 'ring-2 ring-offset-1 ring-current shadow-lg scale-105' : ''}
        ${d.internal ? 'opacity-75' : ''}
      `}
    >
      <Handle type="target" position={Position.Left} className="!w-2.5 !h-2.5 !bg-slate-400" />

      {/* Header */}
      <div className="flex items-center gap-1.5 mb-1.5">
        <ExchangeIcon type={d.exchangeType} />
        <span className="text-xs font-bold uppercase tracking-wide opacity-70">Exchange</span>
        {d.internal && (
          <span className="ml-auto text-[9px] bg-gray-200 text-gray-600 px-1 rounded">INT</span>
        )}
      </div>

      {/* Name */}
      <div className={`text-sm font-semibold truncate ${isDefault ? 'italic opacity-60' : ''}`}>
        {d.label || '(default)'}
      </div>

      {/* Badges */}
      <div className="flex flex-wrap gap-1 mt-1.5">
        <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded border ${style.badge}`}>
          {d.exchangeType}
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

      <Handle type="source" position={Position.Right} className="!w-2.5 !h-2.5 !bg-slate-400" />
    </div>
  )
}

export default memo(ExchangeNode)
