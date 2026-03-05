import { create } from 'zustand'
import type { Node, Edge } from '@xyflow/react'
import type { TopologyData, ConnectionSettings, RabbitDefinitions } from '../types'
import { RabbitMQApiService } from '../services/rabbitmqApi'
import { buildTopologyGraph, filterTopologyNodes, applyDagreLayout } from '../utils/topologyBuilder'

export interface FilterState {
  exchangeTypes: string[]
  queueTypes: string[]
  showInternal: boolean
  searchText: string
  hideEmptyQueues: boolean
}

interface TopologyStore {
  // Source data
  topology: TopologyData | null
  connection: ConnectionSettings | null

  // Graph data
  allNodes: Node[]
  allEdges: Edge[]
  nodes: Node[]
  edges: Edge[]

  // UI state
  selectedVhost: string
  loading: boolean
  error: string | null
  filters: FilterState
  highlightedNodeId: string | null

  // Actions
  connectToRabbitMQ: (settings: ConnectionSettings) => Promise<void>
  loadFromDefinitions: (definitions: RabbitDefinitions) => void
  setSelectedVhost: (vhost: string) => void
  setFilters: (filters: Partial<FilterState>) => void
  setHighlightedNodeId: (id: string | null) => void
  clearError: () => void
  reset: () => void
}

const defaultFilters: FilterState = {
  exchangeTypes: [],
  queueTypes: [],
  showInternal: false,
  searchText: '',
  hideEmptyQueues: false,
}

function applyFiltersAndRebuild(
  topology: TopologyData,
  vhost: string,
  filters: FilterState,
): { nodes: Node[]; edges: Edge[]; allNodes: Node[]; allEdges: Edge[] } {
  const { nodes: allNodes, edges: allEdges } = buildTopologyGraph(topology, vhost)
  const { nodes, edges } = filterTopologyNodes(allNodes, allEdges, filters)
  applyDagreLayout(nodes, edges)
  return { nodes, edges, allNodes, allEdges }
}

export const useTopologyStore = create<TopologyStore>((set, get) => ({
  topology: null,
  connection: null,
  allNodes: [],
  allEdges: [],
  nodes: [],
  edges: [],
  selectedVhost: '/',
  loading: false,
  error: null,
  filters: defaultFilters,
  highlightedNodeId: null,

  connectToRabbitMQ: async (settings: ConnectionSettings) => {
    set({ loading: true, error: null })
    try {
      const service = new RabbitMQApiService(settings.url, settings.username, settings.password)
      const topology = await service.getTopology(settings.vhost || undefined)

      const vhost = settings.vhost || (topology.vhosts[0] ?? '/')
      const { nodes, edges, allNodes, allEdges } = applyFiltersAndRebuild(
        topology,
        vhost,
        get().filters,
      )

      set({
        topology,
        connection: settings,
        selectedVhost: vhost,
        nodes,
        edges,
        allNodes,
        allEdges,
        loading: false,
      })
    } catch (error) {
      set({
        loading: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      })
    }
  },

  loadFromDefinitions: (definitions: RabbitDefinitions) => {
    const vhosts = (definitions.vhosts ?? []).map((v) => v.name)

    const topology: TopologyData = {
      exchanges: definitions.exchanges ?? [],
      queues: definitions.queues ?? [],
      bindings: definitions.bindings ?? [],
      consumers: [],
      vhosts: vhosts.length > 0 ? vhosts : ['/'],
    }

    const vhost = vhosts[0] ?? '/'
    const { nodes, edges, allNodes, allEdges } = applyFiltersAndRebuild(
      topology,
      vhost,
      get().filters,
    )

    set({
      topology,
      connection: null,
      selectedVhost: vhost,
      nodes,
      edges,
      allNodes,
      allEdges,
      error: null,
    })
  },

  setSelectedVhost: (vhost: string) => {
    const { topology, filters } = get()
    if (!topology) return
    const { nodes, edges, allNodes, allEdges } = applyFiltersAndRebuild(topology, vhost, filters)
    set({ selectedVhost: vhost, nodes, edges, allNodes, allEdges })
  },

  setFilters: (newFilters: Partial<FilterState>) => {
    const { topology, filters } = get()
    const merged = { ...filters, ...newFilters }
    set({ filters: merged })
    if (!topology) return
    const { nodes, edges } = filterTopologyNodes(get().allNodes, get().allEdges, merged)
    // Re-run layout so filtered nodes compact together instead of leaving gaps
    applyDagreLayout(nodes, edges)
    set({ nodes, edges })
  },

  setHighlightedNodeId: (id: string | null) => set({ highlightedNodeId: id }),

  clearError: () => set({ error: null }),

  reset: () =>
    set({
      topology: null,
      connection: null,
      allNodes: [],
      allEdges: [],
      nodes: [],
      edges: [],
      selectedVhost: '/',
      loading: false,
      error: null,
      filters: defaultFilters,
      highlightedNodeId: null,
    }),
}))
