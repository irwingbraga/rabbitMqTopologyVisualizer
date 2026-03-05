import dagre from 'dagre'
import type { Node, Edge } from '@xyflow/react'
import type { TopologyData, RabbitConsumer } from '../types'

export type NodeType = 'exchange' | 'queue' | 'consumer'

export interface ExchangeNodeData {
  label: string
  exchangeType: string
  durable: boolean
  autoDelete: boolean
  internal: boolean
  vhost: string
  arguments: Record<string, unknown>
  messageCount?: number
}

export interface QueueNodeData {
  label: string
  queueType: string
  durable: boolean
  autoDelete: boolean
  exclusive: boolean
  vhost: string
  state?: string
  consumers: number
  messages: number
  messagesReady: number
  messagesUnacked: number
  arguments: Record<string, unknown>
}

export interface ConsumerNodeData {
  label: string
  consumerTag: string
  connectionName: string
  ackRequired: boolean
  prefetchCount: number
  active: boolean
  queueName: string
  vhost: string
}

export interface EdgeData {
  routingKey: string
  destinationType: 'queue' | 'exchange'
  arguments: Record<string, unknown>
}

const NODE_WIDTH = 220
const NODE_HEIGHT = 90
const CONSUMER_WIDTH = 200
const CONSUMER_HEIGHT = 70

export function buildTopologyGraph(
  topology: TopologyData,
  vhostFilter: string,
): { nodes: Node[]; edges: Edge[] } {
  const { exchanges, queues, bindings, consumers } = topology

  // Filter by vhost
  const filteredExchanges = exchanges.filter(
    (e) => !vhostFilter || e.vhost === vhostFilter,
  )
  const filteredQueues = queues.filter(
    (q) => !vhostFilter || q.vhost === vhostFilter,
  )
  const filteredBindings = bindings.filter(
    (b) => !vhostFilter || b.vhost === vhostFilter,
  )
  const filteredConsumers = consumers.filter(
    (c) => !vhostFilter || c.queue.vhost === vhostFilter,
  )

  const nodes: Node[] = []
  const edges: Edge[] = []

  // Build exchange nodes
  filteredExchanges.forEach((exchange) => {
    const nodeId = exchangeNodeId(exchange.name, exchange.vhost)
    nodes.push({
      id: nodeId,
      type: 'exchangeNode',
      position: { x: 0, y: 0 },
      data: {
        label: exchange.name || '(default)',
        exchangeType: exchange.type,
        durable: exchange.durable,
        autoDelete: exchange.auto_delete,
        internal: exchange.internal,
        vhost: exchange.vhost,
        arguments: exchange.arguments,
      } satisfies ExchangeNodeData,
    })
  })

  // Build queue nodes
  filteredQueues.forEach((queue) => {
    const nodeId = queueNodeId(queue.name, queue.vhost)
    const queueConsumers = filteredConsumers.filter(
      (c) => c.queue.name === queue.name && c.queue.vhost === queue.vhost,
    )
    nodes.push({
      id: nodeId,
      type: 'queueNode',
      position: { x: 0, y: 0 },
      data: {
        label: queue.name,
        queueType: queue.type || (queue.arguments?.['x-queue-type'] as string) || 'classic',
        durable: queue.durable,
        autoDelete: queue.auto_delete,
        exclusive: queue.exclusive,
        vhost: queue.vhost,
        state: queue.state,
        consumers: queue.consumers ?? queueConsumers.length,
        messages: queue.messages ?? 0,
        messagesReady: queue.messages_ready ?? 0,
        messagesUnacked: queue.messages_unacknowledged ?? 0,
        arguments: queue.arguments,
      } satisfies QueueNodeData,
    })
  })

  // Group consumers per queue and create consumer nodes
  const consumersByQueue = new Map<string, RabbitConsumer[]>()
  filteredConsumers.forEach((consumer) => {
    const key = queueNodeId(consumer.queue.name, consumer.queue.vhost)
    if (!consumersByQueue.has(key)) consumersByQueue.set(key, [])
    consumersByQueue.get(key)!.push(consumer)
  })

  consumersByQueue.forEach((queueConsumers, queueKey) => {
    // Group by connection
    const byConnection = new Map<string, RabbitConsumer[]>()
    queueConsumers.forEach((c) => {
      const conn = c.channel_details?.connection_name || 'unknown'
      if (!byConnection.has(conn)) byConnection.set(conn, [])
      byConnection.get(conn)!.push(c)
    })

    byConnection.forEach((connConsumers, connName) => {
      const consumerNodeId = `consumer-${queueKey}-${connName}`
      const firstConsumer = connConsumers[0]
      nodes.push({
        id: consumerNodeId,
        type: 'consumerNode',
        position: { x: 0, y: 0 },
        data: {
          label: connName.split(' -> ')[1] || connName,
          consumerTag: connConsumers.map((c) => c.consumer_tag).join(', '),
          connectionName: connName,
          ackRequired: firstConsumer.ack_required,
          prefetchCount: firstConsumer.prefetch_count,
          active: firstConsumer.active,
          queueName: firstConsumer.queue.name,
          vhost: firstConsumer.queue.vhost,
          count: connConsumers.length,
        } satisfies ConsumerNodeData & { count: number },
      })

      edges.push({
        id: `edge-${queueKey}-${consumerNodeId}`,
        source: queueKey,
        target: consumerNodeId,
        type: 'smoothstep',
        animated: firstConsumer.active,
        style: { stroke: '#f59e0b', strokeWidth: 1.5 },
        markerEnd: { type: 'arrowclosed' as const, color: '#f59e0b' },
      })
    })
  })

  // Build binding edges
  const edgeIds = new Set<string>()
  filteredBindings.forEach((binding) => {
    const sourceId = exchangeNodeId(binding.source, binding.vhost)
    const targetId =
      binding.destination_type === 'queue'
        ? queueNodeId(binding.destination, binding.vhost)
        : exchangeNodeId(binding.destination, binding.vhost)

    // Only create edge if both nodes exist
    const sourceExists = nodes.some((n) => n.id === sourceId)
    const targetExists = nodes.some((n) => n.id === targetId)
    if (!sourceExists || !targetExists) return

    const edgeId = `binding-${sourceId}-${targetId}-${binding.routing_key}`
    if (edgeIds.has(edgeId)) return
    edgeIds.add(edgeId)

    edges.push({
      id: edgeId,
      source: sourceId,
      target: targetId,
      type: 'smoothstep',
      animated: false,
      label: binding.routing_key || undefined,
      labelStyle: { fontSize: 10, fill: '#374151', fontWeight: 500 },
      labelBgStyle: { fill: '#f9fafb', fillOpacity: 0.9 },
      labelBgPadding: [4, 2],
      style: { stroke: '#94a3b8', strokeWidth: 1.5 },
      markerEnd: { type: 'arrowclosed' as const, color: '#94a3b8' },
      data: {
        routingKey: binding.routing_key,
        destinationType: binding.destination_type,
        arguments: binding.arguments,
      } satisfies EdgeData,
    })
  })

  // Apply dagre layout
  applyDagreLayout(nodes, edges)

  return { nodes, edges }
}

export function applyDagreLayout(nodes: Node[], edges: Edge[]) {
  const g = new dagre.graphlib.Graph()
  g.setDefaultEdgeLabel(() => ({}))
  g.setGraph({ rankdir: 'LR', ranksep: 120, nodesep: 60, edgesep: 30 })

  nodes.forEach((node) => {
    const w = node.type === 'consumerNode' ? CONSUMER_WIDTH : NODE_WIDTH
    const h = node.type === 'consumerNode' ? CONSUMER_HEIGHT : NODE_HEIGHT
    g.setNode(node.id, { width: w, height: h })
  })

  edges.forEach((edge) => {
    g.setEdge(edge.source, edge.target)
  })

  dagre.layout(g)

  nodes.forEach((node) => {
    const pos = g.node(node.id)
    if (pos) {
      const w = node.type === 'consumerNode' ? CONSUMER_WIDTH : NODE_WIDTH
      const h = node.type === 'consumerNode' ? CONSUMER_HEIGHT : NODE_HEIGHT
      node.position = { x: pos.x - w / 2, y: pos.y - h / 2 }
    }
  })
}

export function exchangeNodeId(name: string, vhost: string) {
  return `exchange-${vhost}-${name || '__default__'}`
}

export function queueNodeId(name: string, vhost: string) {
  return `queue-${vhost}-${name}`
}

export function filterTopologyNodes(
  nodes: Node[],
  edges: Edge[],
  filters: {
    exchangeTypes?: string[]
    queueTypes?: string[]
    showInternal?: boolean
    searchText?: string
    hideEmptyQueues?: boolean
  },
): { nodes: Node[]; edges: Edge[] } {
  const { exchangeTypes, queueTypes, showInternal = true, searchText = '', hideEmptyQueues = false } = filters
  const search = searchText.toLowerCase()

  const visibleNodeIds = new Set<string>()

  // First pass: determine which non-consumer nodes are visible
  nodes.forEach((node) => {
    if (node.type === 'exchangeNode') {
      const data = node.data as unknown as ExchangeNodeData
      if (exchangeTypes && exchangeTypes.length > 0 && !exchangeTypes.includes(data.exchangeType)) return
      if (!showInternal && data.internal) return
      if (search && !data.label.toLowerCase().includes(search)) return
      visibleNodeIds.add(node.id)
    } else if (node.type === 'queueNode') {
      const data = node.data as unknown as QueueNodeData
      if (queueTypes && queueTypes.length > 0 && !queueTypes.includes(data.queueType)) return
      if (hideEmptyQueues && data.messages === 0) return
      if (search && !data.label.toLowerCase().includes(search)) return
      visibleNodeIds.add(node.id)
    }
  })

  // Second pass: consumers follow their parent queue — visible iff the queue is visible
  nodes.forEach((node) => {
    if (node.type !== 'consumerNode') return
    const parentEdge = edges.find((e) => e.target === node.id)
    if (parentEdge && visibleNodeIds.has(parentEdge.source)) {
      visibleNodeIds.add(node.id)
    }
  })

  // Spread each node so applyDagreLayout mutates copies, never the originals in allNodes
  const filteredNodes = nodes
    .filter((node) => visibleNodeIds.has(node.id))
    .map((node) => ({ ...node }))

  const filteredEdges = edges.filter(
    (e) => visibleNodeIds.has(e.source) && visibleNodeIds.has(e.target),
  )

  return { nodes: filteredNodes, edges: filteredEdges }
}
