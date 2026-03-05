import { X, ArrowLeftRight, List, Terminal, ExternalLink } from 'lucide-react'
import { useTopologyStore } from '../store/topologyStore'
import type { ExchangeNodeData, QueueNodeData, ConsumerNodeData } from '../utils/topologyBuilder'

function DetailRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between py-1.5 border-b border-gray-50 last:border-0">
      <span className="text-xs text-gray-500 font-medium w-28 shrink-0">{label}</span>
      <span className="text-xs text-gray-800 text-right break-all">{value}</span>
    </div>
  )
}

function Badge({ children, color = 'gray' }: { children: React.ReactNode; color?: string }) {
  const colors: Record<string, string> = {
    gray: 'bg-gray-100 text-gray-600',
    green: 'bg-green-100 text-green-700',
    red: 'bg-red-100 text-red-600',
    blue: 'bg-blue-100 text-blue-700',
    amber: 'bg-amber-100 text-amber-700',
  }
  return (
    <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${colors[color] ?? colors.gray}`}>
      {children}
    </span>
  )
}

export default function NodeDetailPanel() {
  const { nodes, highlightedNodeId, setHighlightedNodeId, edges } = useTopologyStore()

  if (!highlightedNodeId) return null

  const node = nodes.find((n) => n.id === highlightedNodeId)
  if (!node) return null

  const connectedEdges = edges.filter(
    (e) => e.source === highlightedNodeId || e.target === highlightedNodeId,
  )

  const renderExchangeDetails = (d: ExchangeNodeData) => (
    <>
      <div className="flex items-center gap-2 mb-3">
        <ArrowLeftRight className="w-5 h-5 text-blue-500" />
        <div>
          <h3 className="font-bold text-gray-900 text-sm">{d.label || '(default exchange)'}</h3>
          <p className="text-xs text-gray-500">Exchange · {d.vhost}</p>
        </div>
      </div>
      <div className="space-y-0">
        <DetailRow label="Type" value={<Badge color="blue">{d.exchangeType}</Badge>} />
        <DetailRow label="Durable" value={<Badge color={d.durable ? 'green' : 'gray'}>{d.durable ? 'yes' : 'no'}</Badge>} />
        <DetailRow label="Auto-delete" value={<Badge color={d.autoDelete ? 'amber' : 'gray'}>{d.autoDelete ? 'yes' : 'no'}</Badge>} />
        <DetailRow label="Internal" value={<Badge color={d.internal ? 'amber' : 'gray'}>{d.internal ? 'yes' : 'no'}</Badge>} />
        {Object.keys(d.arguments ?? {}).length > 0 && (
          <DetailRow
            label="Arguments"
            value={
              <code className="text-[10px] bg-gray-100 px-1 py-0.5 rounded">
                {JSON.stringify(d.arguments, null, 2)}
              </code>
            }
          />
        )}
      </div>
    </>
  )

  const renderQueueDetails = (d: QueueNodeData) => (
    <>
      <div className="flex items-center gap-2 mb-3">
        <List className="w-5 h-5 text-teal-500" />
        <div>
          <h3 className="font-bold text-gray-900 text-sm break-all">{d.label}</h3>
          <p className="text-xs text-gray-500">Queue · {d.vhost}</p>
        </div>
      </div>
      <div className="space-y-0">
        <DetailRow label="Type" value={<Badge color="blue">{d.queueType}</Badge>} />
        <DetailRow label="State" value={<Badge color={d.state === 'running' || !d.state ? 'green' : 'red'}>{d.state ?? 'unknown'}</Badge>} />
        <DetailRow label="Durable" value={<Badge color={d.durable ? 'green' : 'gray'}>{d.durable ? 'yes' : 'no'}</Badge>} />
        <DetailRow label="Exclusive" value={<Badge color={d.exclusive ? 'amber' : 'gray'}>{d.exclusive ? 'yes' : 'no'}</Badge>} />
        <DetailRow label="Auto-delete" value={<Badge color={d.autoDelete ? 'amber' : 'gray'}>{d.autoDelete ? 'yes' : 'no'}</Badge>} />
        <DetailRow label="Messages" value={<span className="font-bold text-gray-900">{d.messages}</span>} />
        <DetailRow label="Ready" value={d.messagesReady} />
        <DetailRow label="Unacked" value={<span className={d.messagesUnacked > 0 ? 'text-amber-600 font-bold' : ''}>{d.messagesUnacked}</span>} />
        <DetailRow label="Consumers" value={d.consumers} />
      </div>
    </>
  )

  const renderConsumerDetails = (d: ConsumerNodeData & { count?: number }) => (
    <>
      <div className="flex items-center gap-2 mb-3">
        <Terminal className="w-5 h-5 text-amber-500" />
        <div>
          <h3 className="font-bold text-gray-900 text-sm break-all">{d.label}</h3>
          <p className="text-xs text-gray-500">Consumer · {d.vhost}</p>
        </div>
      </div>
      <div className="space-y-0">
        <DetailRow label="Status" value={<Badge color={d.active ? 'green' : 'red'}>{d.active ? 'active' : 'inactive'}</Badge>} />
        <DetailRow label="Queue" value={d.queueName} />
        <DetailRow label="Connection" value={<span className="text-[11px] break-all">{d.connectionName}</span>} />
        <DetailRow label="Consumer tag" value={<span className="text-[11px] break-all font-mono">{d.consumerTag}</span>} />
        <DetailRow label="Ack required" value={<Badge color={d.ackRequired ? 'green' : 'amber'}>{d.ackRequired ? 'yes' : 'no'}</Badge>} />
        <DetailRow label="Prefetch" value={d.prefetchCount || 'unlimited'} />
        {(d.count ?? 1) > 1 && <DetailRow label="Count" value={`${d.count} consumers`} />}
      </div>
    </>
  )

  return (
    <div className="absolute right-4 top-4 z-10 w-72 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 bg-gray-50 border-b border-gray-100">
        <span className="text-xs font-semibold text-gray-600 uppercase tracking-wider">Details</span>
        <button
          onClick={() => setHighlightedNodeId(null)}
          className="text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="p-3">
        {node.type === 'exchangeNode' && renderExchangeDetails(node.data as unknown as ExchangeNodeData)}
        {node.type === 'queueNode' && renderQueueDetails(node.data as unknown as QueueNodeData)}
        {node.type === 'consumerNode' && renderConsumerDetails(node.data as unknown as ConsumerNodeData & { count?: number })}

        {/* Connected edges */}
        {connectedEdges.length > 0 && (
          <div className="mt-3 pt-3 border-t border-gray-100">
            <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-1">
              <ExternalLink className="w-3 h-3" />
              Bindings ({connectedEdges.length})
            </p>
            <div className="space-y-1 max-h-32 overflow-y-auto">
              {connectedEdges.map((edge) => {
                const isSource = edge.source === highlightedNodeId
                const routingKey = (edge.data as { routingKey?: string })?.routingKey
                return (
                  <div key={edge.id} className="flex items-center gap-1.5 text-[11px]">
                    <span className={`font-medium ${isSource ? 'text-green-600' : 'text-blue-600'}`}>
                      {isSource ? '→' : '←'}
                    </span>
                    <span className="text-gray-600 truncate">
                      {isSource ? edge.target : edge.source}
                    </span>
                    {routingKey && (
                      <code className="ml-auto shrink-0 text-[9px] bg-gray-100 text-gray-600 px-1 rounded">
                        {routingKey}
                      </code>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
