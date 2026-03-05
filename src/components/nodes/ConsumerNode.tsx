import { memo } from 'react'
import { Handle, Position, type NodeProps } from '@xyflow/react'
import { Terminal, CheckCircle, XCircle } from 'lucide-react'
import type { ConsumerNodeData } from '../../utils/topologyBuilder'

function ConsumerNode({ data, selected }: NodeProps) {
  const d = data as unknown as ConsumerNodeData & { count?: number }

  return (
    <div
      className={`
        rounded-xl border-2 shadow-sm px-3 py-2 min-w-[160px] max-w-[200px]
        bg-amber-50 border-amber-400 text-amber-900
        transition-all duration-150
        ${selected ? 'ring-2 ring-offset-1 ring-amber-500 shadow-lg scale-105' : ''}
        ${!d.active ? 'opacity-60' : ''}
      `}
    >
      <Handle type="target" position={Position.Left} className="!w-2.5 !h-2.5 !bg-amber-400" />

      {/* Header */}
      <div className="flex items-center gap-1.5 mb-1">
        <Terminal className="w-4 h-4" />
        <span className="text-xs font-bold uppercase tracking-wide opacity-70">Consumer</span>
        {d.active ? (
          <CheckCircle className="w-3.5 h-3.5 text-green-500 ml-auto" aria-label="Active" />
        ) : (
          <XCircle className="w-3.5 h-3.5 text-red-400 ml-auto" aria-label="Inactive" />
        )}
      </div>

      {/* Connection name */}
      <div className="text-sm font-semibold truncate" title={d.label}>
        {d.label}
      </div>

      {/* Details */}
      <div className="flex flex-wrap gap-1 mt-1.5">
        {(d.count ?? 1) > 1 && (
          <span className="text-[10px] font-medium px-1.5 py-0.5 rounded border bg-amber-100 text-amber-700 border-amber-300">
            {d.count} consumers
          </span>
        )}
        {d.ackRequired && (
          <span className="text-[10px] font-medium px-1.5 py-0.5 rounded border bg-gray-100 text-gray-600 border-gray-300">
            ack
          </span>
        )}
        {d.prefetchCount > 0 && (
          <span className="text-[10px] font-medium px-1.5 py-0.5 rounded border bg-gray-100 text-gray-600 border-gray-300">
            pf:{d.prefetchCount}
          </span>
        )}
      </div>
    </div>
  )
}

export default memo(ConsumerNode)
