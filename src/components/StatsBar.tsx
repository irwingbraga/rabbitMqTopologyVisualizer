import { ArrowLeftRight, List, Users, Link2 } from 'lucide-react'
import { useTopologyStore } from '../store/topologyStore'

export default function StatsBar() {
  const { topology, selectedVhost, nodes, edges } = useTopologyStore()
  if (!topology) return null

  const vhostExchanges = topology.exchanges.filter((e) => e.vhost === selectedVhost).length
  const vhostQueues = topology.queues.filter((q) => q.vhost === selectedVhost).length
  const vhostConsumers = topology.consumers.filter((c) => c.queue.vhost === selectedVhost).length
  const vhostBindings = topology.bindings.filter((b) => b.vhost === selectedVhost).length

  const visibleExchanges = nodes.filter((n) => n.type === 'exchangeNode').length
  const visibleQueues = nodes.filter((n) => n.type === 'queueNode').length
  const visibleConsumers = nodes.filter((n) => n.type === 'consumerNode').length
  const visibleBindings = edges.filter((e) => e.id.startsWith('binding-')).length

  const filtered =
    visibleExchanges !== vhostExchanges ||
    visibleQueues !== vhostQueues ||
    visibleConsumers !== vhostConsumers

  return (
    <div className="flex items-center gap-1 bg-white rounded-xl shadow-sm border border-gray-100 px-3 py-1.5">
      <StatItem
        icon={<ArrowLeftRight className="w-3.5 h-3.5 text-blue-500" />}
        label="Exchanges"
        value={visibleExchanges}
        total={filtered ? vhostExchanges : undefined}
      />
      <div className="w-px h-4 bg-gray-200 mx-1" />
      <StatItem
        icon={<List className="w-3.5 h-3.5 text-teal-500" />}
        label="Queues"
        value={visibleQueues}
        total={filtered ? vhostQueues : undefined}
      />
      <div className="w-px h-4 bg-gray-200 mx-1" />
      <StatItem
        icon={<Link2 className="w-3.5 h-3.5 text-slate-400" />}
        label="Bindings"
        value={visibleBindings}
        total={filtered ? vhostBindings : undefined}
      />
      <div className="w-px h-4 bg-gray-200 mx-1" />
      <StatItem
        icon={<Users className="w-3.5 h-3.5 text-amber-500" />}
        label="Consumers"
        value={visibleConsumers}
        total={filtered ? vhostConsumers : undefined}
      />
    </div>
  )
}

function StatItem({
  icon,
  label,
  value,
  total,
}: {
  icon: React.ReactNode
  label: string
  value: number
  total?: number
}) {
  return (
    <div className="flex items-center gap-1.5 px-1">
      {icon}
      <div className="flex flex-col leading-none">
        <span className="text-[10px] text-gray-400">{label}</span>
        <span className="text-xs font-bold text-gray-800">
          {value}
          {total !== undefined && (
            <span className="font-normal text-gray-400">/{total}</span>
          )}
        </span>
      </div>
    </div>
  )
}
