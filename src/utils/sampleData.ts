import type { RabbitDefinitions, RabbitExchange, RabbitQueue, RabbitBinding } from '../types'

const VHOST = '/'

const QUEUE_TYPES = ['classic', 'quorum', 'stream'] as const

const SERVICES = [
  'orders', 'payments', 'inventory', 'notifications', 'shipping',
  'users', 'products', 'reviews', 'analytics', 'reporting',
  'billing', 'subscriptions', 'catalog', 'search', 'recommendations',
  'auth', 'sessions', 'audit', 'events', 'workflows',
]

const ACTIONS = [
  'created', 'updated', 'deleted', 'processed', 'failed',
  'retried', 'scheduled', 'confirmed', 'cancelled', 'completed',
  'approved', 'rejected', 'pending', 'archived', 'synced',
]

function rand<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

function randInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

const exchanges: RabbitExchange[] = []
const queues: RabbitQueue[] = []
const bindings: RabbitBinding[] = []

// --- Exchanges ---
// One exchange per service × type variant
SERVICES.forEach((service) => {
  // Primary topic exchange per service
  exchanges.push({
    name: `${service}.exchange`,
    vhost: VHOST,
    type: 'topic',
    durable: true,
    auto_delete: false,
    internal: false,
    arguments: {},
  })

  // Direct exchange per service
  exchanges.push({
    name: `${service}.direct`,
    vhost: VHOST,
    type: 'direct',
    durable: true,
    auto_delete: false,
    internal: false,
    arguments: {},
  })

  // Dead-letter exchange (internal direct)
  exchanges.push({
    name: `${service}.dlx`,
    vhost: VHOST,
    type: 'direct',
    durable: true,
    auto_delete: false,
    internal: true,
    arguments: {},
  })
})

// Retry exchange per service
SERVICES.forEach((service) => {
  exchanges.push({
    name: `${service}.retry`,
    vhost: VHOST,
    type: 'topic',
    durable: true,
    auto_delete: false,
    internal: false,
    arguments: {},
  })
})

// Shared fanout exchanges
;['notifications.fanout', 'broadcast.fanout', 'alerts.fanout', 'metrics.fanout',
  'logs.fanout', 'telemetry.fanout', 'integrations.fanout', 'webhooks.fanout',
  'realtime.fanout', 'pubsub.fanout', 'system.fanout', 'platform.fanout'].forEach((name) => {
  exchanges.push({ name, vhost: VHOST, type: 'fanout', durable: true, auto_delete: false, internal: false, arguments: {} })
})

// Shared headers exchanges
;['events.headers', 'routing.headers', 'priority.headers', 'filtering.headers',
  'classification.headers', 'dispatch.headers', 'versioning.headers',
  'tenant.headers', 'region.headers', 'channel.headers'].forEach((name) => {
  exchanges.push({ name, vhost: VHOST, type: 'headers', durable: true, auto_delete: false, internal: false, arguments: {} })
})

// --- Queues ---
// ~15 queues per service
SERVICES.forEach((service) => {
  ACTIONS.forEach((action) => {
    const qtype = rand(QUEUE_TYPES)
    const msgs = randInt(0, 500)
    const consumers = randInt(0, 4)
    queues.push({
      name: `${service}.${action}`,
      vhost: VHOST,
      type: qtype,
      durable: true,
      auto_delete: false,
      exclusive: false,
      arguments: qtype === 'quorum' ? { 'x-queue-type': 'quorum' } : qtype === 'stream' ? { 'x-queue-type': 'stream' } : {},
      state: 'running',
      consumers,
      messages: msgs,
      messages_ready: Math.floor(msgs * 0.85),
      messages_unacknowledged: msgs - Math.floor(msgs * 0.85),
    })
  })

  // Dead letter queue per service
  queues.push({
    name: `${service}.dead-letter`,
    vhost: VHOST,
    type: 'classic',
    durable: true,
    auto_delete: false,
    exclusive: false,
    arguments: {},
    state: 'running',
    consumers: 0,
    messages: randInt(0, 50),
    messages_ready: randInt(0, 50),
    messages_unacknowledged: 0,
  })
})

// Extra standalone queues to push past 300
const EXTRAS = ['gateway', 'webhook', 'cron', 'batch', 'import', 'export', 'migration', 'cache']
EXTRAS.forEach((prefix) => {
  ACTIONS.slice(0, 8).forEach((action) => {
    const msgs = randInt(0, 200)
    queues.push({
      name: `${prefix}.${action}`,
      vhost: VHOST,
      type: rand(QUEUE_TYPES),
      durable: true,
      auto_delete: false,
      exclusive: false,
      arguments: {},
      state: 'running',
      consumers: randInt(0, 3),
      messages: msgs,
      messages_ready: msgs,
      messages_unacknowledged: 0,
    })
  })
})

// --- Bindings ---
// Bind each service's topic exchange to its action queues
SERVICES.forEach((service) => {
  ACTIONS.forEach((action) => {
    bindings.push({
      source: `${service}.exchange`,
      vhost: VHOST,
      destination: `${service}.${action}`,
      destination_type: 'queue',
      routing_key: `${service}.${action}.*`,
      arguments: {},
    })
  })

  // DLX bindings
  bindings.push({
    source: `${service}.dlx`,
    vhost: VHOST,
    destination: `${service}.dead-letter`,
    destination_type: 'queue',
    routing_key: 'dead',
    arguments: {},
  })

  // Cross-service: orders/payments/shipping pipe into notifications fanout
  if (['orders', 'payments', 'shipping', 'billing'].includes(service)) {
    bindings.push({
      source: `${service}.exchange`,
      vhost: VHOST,
      destination: 'notifications.fanout',
      destination_type: 'exchange',
      routing_key: `${service}.#`,
      arguments: {},
    })
  }

  // analytics and reporting receive from all services via direct
  ;['analytics', 'reporting', 'audit'].forEach((sink) => {
    if (sink !== service) {
      bindings.push({
        source: `${service}.direct`,
        vhost: VHOST,
        destination: `${sink}.created`,
        destination_type: 'queue',
        routing_key: `${service}.event`,
        arguments: {},
      })
    }
  })
})

// Fanout → notification queues
;['notifications.fanout', 'broadcast.fanout', 'alerts.fanout'].forEach((src) => {
  ;['notifications.created', 'notifications.updated', 'users.created'].forEach((dest) => {
    bindings.push({ source: src, vhost: VHOST, destination: dest, destination_type: 'queue', routing_key: '', arguments: {} })
  })
})

// Headers bindings
;['events.audit', 'audit.created', 'audit.updated'].forEach((dest) => {
  bindings.push({
    source: 'events.headers',
    vhost: VHOST,
    destination: dest,
    destination_type: 'queue',
    routing_key: '',
    arguments: { 'x-match': 'all', level: 'audit' },
  })
})

export const SAMPLE_DEFINITIONS: RabbitDefinitions = {
  rabbit_version: '3.12.0',
  product_name: 'RabbitMQ (large sample)',
  vhosts: [{ name: VHOST }],
  exchanges,
  queues,
  bindings,
}
