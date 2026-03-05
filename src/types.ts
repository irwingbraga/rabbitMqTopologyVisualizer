// RabbitMQ API types

export type ExchangeType = 'direct' | 'fanout' | 'topic' | 'headers' | 'x-delayed-message' | 'x-consistent-hash' | string

export type QueueType = 'classic' | 'quorum' | 'stream'

export interface RabbitExchange {
  name: string
  vhost: string
  type: ExchangeType
  durable: boolean
  auto_delete: boolean
  internal: boolean
  arguments: Record<string, unknown>
}

export interface RabbitQueue {
  name: string
  vhost: string
  type: QueueType
  durable: boolean
  auto_delete: boolean
  exclusive: boolean
  arguments: Record<string, unknown>
  state?: 'running' | 'idle' | 'crashed' | string
  consumers?: number
  messages?: number
  messages_ready?: number
  messages_unacknowledged?: number
}

export interface RabbitBinding {
  source: string
  vhost: string
  destination: string
  destination_type: 'queue' | 'exchange'
  routing_key: string
  arguments: Record<string, unknown>
}

export interface RabbitConsumer {
  consumer_tag: string
  channel_details: {
    name: string
    connection_name: string
    user: string
    vhost: string
    node: string
  }
  queue: {
    name: string
    vhost: string
  }
  ack_required: boolean
  prefetch_count: number
  active: boolean
}

export interface RabbitVhost {
  name: string
  description?: string
  tags?: string[]
  tracing?: boolean
}

// Parsed topology for visualization
export interface TopologyData {
  exchanges: RabbitExchange[]
  queues: RabbitQueue[]
  bindings: RabbitBinding[]
  consumers: RabbitConsumer[]
  vhosts: string[]
}

// JSON export format from RabbitMQ management UI
export interface RabbitDefinitions {
  rabbit_version?: string
  rabbitmq_version?: string
  product_name?: string
  product_version?: string
  users?: unknown[]
  vhosts?: { name: string }[]
  permissions?: unknown[]
  topic_permissions?: unknown[]
  parameters?: unknown[]
  global_parameters?: unknown[]
  policies?: unknown[]
  queues?: RabbitQueue[]
  exchanges?: RabbitExchange[]
  bindings?: RabbitBinding[]
}

// Connection settings
export interface ConnectionSettings {
  url: string
  username: string
  password: string
  vhost: string
}
