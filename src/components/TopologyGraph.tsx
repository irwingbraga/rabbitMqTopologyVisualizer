import { useCallback, useMemo } from 'react'
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  type NodeTypes,
  type NodeMouseHandler,
  useReactFlow,
  Panel,
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'

import ExchangeNode from './nodes/ExchangeNode'
import QueueNode from './nodes/QueueNode'
import ConsumerNode from './nodes/ConsumerNode'
import FilterPanel from './FilterPanel'
import NodeDetailPanel from './NodeDetailPanel'
import Legend from './Legend'
import StatsBar from './StatsBar'
import { useTopologyStore } from '../store/topologyStore'
import { LayoutGrid } from 'lucide-react'

const nodeTypes: NodeTypes = {
  exchangeNode: ExchangeNode,
  queueNode: QueueNode,
  consumerNode: ConsumerNode,
}

function FitViewButton() {
  const { fitView } = useReactFlow()
  return (
    <button
      onClick={() => fitView({ padding: 0.1, duration: 400 })}
      className="flex items-center gap-1.5 text-xs font-medium px-2.5 py-1.5 bg-white rounded-lg shadow-sm border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors"
    >
      <LayoutGrid className="w-3.5 h-3.5" />
      Fit view
    </button>
  )
}

export default function TopologyGraph() {
  const { nodes, edges, setHighlightedNodeId, highlightedNodeId } = useTopologyStore()

  // Changing this key forces ReactFlow to remount with fresh Dagre positions
  // whenever the filtered node set changes, eliminating layout gaps.
  const flowKey = useMemo(
    () => nodes.map((n) => n.id).join('|'),
    [nodes],
  )

  const onNodeClick: NodeMouseHandler = useCallback(
    (_event, node) => {
      setHighlightedNodeId(node.id === highlightedNodeId ? null : node.id)
    },
    [highlightedNodeId, setHighlightedNodeId],
  )

  const onPaneClick = useCallback(() => {
    setHighlightedNodeId(null)
  }, [setHighlightedNodeId])

  const styledNodes = useMemo(() => {
    if (!highlightedNodeId) return nodes
    return nodes.map((n) => ({
      ...n,
      style: {
        ...n.style,
        opacity: n.id === highlightedNodeId ? 1 : 0.35,
      },
    }))
  }, [nodes, highlightedNodeId])

  const styledEdges = useMemo(() => {
    if (!highlightedNodeId) return edges
    return edges.map((e) => ({
      ...e,
      style: {
        ...e.style,
        opacity:
          e.source === highlightedNodeId || e.target === highlightedNodeId ? 1 : 0.15,
      },
    }))
  }, [edges, highlightedNodeId])

  return (
    <div className="w-full h-full relative">
      <ReactFlow
        key={flowKey}
        nodes={styledNodes}
        edges={styledEdges}
        nodeTypes={nodeTypes}
        onNodeClick={onNodeClick}
        onPaneClick={onPaneClick}
        fitView
        fitViewOptions={{ padding: 0.1 }}
        minZoom={0.1}
        maxZoom={3}
        defaultEdgeOptions={{ type: 'smoothstep' }}
        proOptions={{ hideAttribution: true }}
      >
        <Background gap={20} size={1} color="#e5e7eb" />
        <Controls showInteractive={false} className="!shadow-md !border !border-gray-100 !rounded-xl" />
        <MiniMap
          nodeColor={(node) => {
            switch (node.type) {
              case 'exchangeNode': {
                const et = (node.data as { exchangeType?: string }).exchangeType ?? ''
                const colors: Record<string, string> = {
                  direct: '#93c5fd',
                  fanout: '#86efac',
                  topic: '#c4b5fd',
                  headers: '#fdba74',
                }
                return colors[et] ?? '#94a3b8'
              }
              case 'queueNode': {
                const qt = (node.data as { queueType?: string }).queueType ?? 'classic'
                const colors: Record<string, string> = {
                  classic: '#5eead4',
                  quorum: '#818cf8',
                  stream: '#f9a8d4',
                }
                return colors[qt] ?? '#5eead4'
              }
              case 'consumerNode':
                return '#fbbf24'
              default:
                return '#94a3b8'
            }
          }}
          maskColor="rgba(243,244,246,0.7)"
          className="!rounded-xl !shadow-md !border !border-gray-100"
          style={{ width: 160, height: 100 }}
        />

        <Panel position="top-right" className="!m-3">
          <FitViewButton />
        </Panel>
      </ReactFlow>

      {/* Outside ReactFlow so remounts don't affect focus or state */}
      <div className="absolute top-3 left-3 z-10 flex flex-col gap-2 w-[380px] pointer-events-none">
        <div className="pointer-events-auto">
          <FilterPanel />
        </div>
        <div className="pointer-events-auto">
          <StatsBar />
        </div>
      </div>

      <NodeDetailPanel />
      <Legend />
    </div>
  )
}
