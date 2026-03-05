import type { RabbitDefinitions } from '../types'

export const SAMPLE_DEFINITIONS: RabbitDefinitions = {
  rabbit_version: '3.12.0',
  product_name: 'RabbitMQ (sample)',
  vhosts: [{ name: '/' }],
  exchanges: [
    // Default exchange
    { name: '', vhost: '/', type: 'direct', durable: true, auto_delete: false, internal: false, arguments: {} },
    // Order processing
    { name: 'orders.exchange', vhost: '/', type: 'topic', durable: true, auto_delete: false, internal: false, arguments: {} },
    { name: 'orders.dlx', vhost: '/', type: 'direct', durable: true, auto_delete: false, internal: true, arguments: {} },
    // Notifications
    { name: 'notifications.fanout', vhost: '/', type: 'fanout', durable: true, auto_delete: false, internal: false, arguments: {} },
    // Events
    { name: 'events.headers', vhost: '/', type: 'headers', durable: true, auto_delete: false, internal: false, arguments: {} },
    // Inventory
    { name: 'inventory.direct', vhost: '/', type: 'direct', durable: true, auto_delete: false, internal: false, arguments: {} },
  ],
  queues: [
    { name: 'orders.created', vhost: '/', type: 'quorum', durable: true, auto_delete: false, exclusive: false, arguments: { 'x-queue-type': 'quorum' }, state: 'running', consumers: 2, messages: 14, messages_ready: 12, messages_unacknowledged: 2 },
    { name: 'orders.updated', vhost: '/', type: 'quorum', durable: true, auto_delete: false, exclusive: false, arguments: { 'x-queue-type': 'quorum' }, state: 'running', consumers: 1, messages: 3, messages_ready: 3, messages_unacknowledged: 0 },
    { name: 'orders.cancelled', vhost: '/', type: 'classic', durable: true, auto_delete: false, exclusive: false, arguments: {}, state: 'running', consumers: 1, messages: 0, messages_ready: 0, messages_unacknowledged: 0 },
    { name: 'orders.dead-letter', vhost: '/', type: 'classic', durable: true, auto_delete: false, exclusive: false, arguments: {}, state: 'running', consumers: 0, messages: 7, messages_ready: 7, messages_unacknowledged: 0 },
    { name: 'notifications.email', vhost: '/', type: 'classic', durable: true, auto_delete: false, exclusive: false, arguments: {}, state: 'running', consumers: 1, messages: 0, messages_ready: 0, messages_unacknowledged: 0 },
    { name: 'notifications.sms', vhost: '/', type: 'classic', durable: true, auto_delete: false, exclusive: false, arguments: {}, state: 'running', consumers: 1, messages: 2, messages_ready: 2, messages_unacknowledged: 0 },
    { name: 'notifications.push', vhost: '/', type: 'classic', durable: false, auto_delete: true, exclusive: false, arguments: {}, state: 'running', consumers: 0, messages: 0, messages_ready: 0, messages_unacknowledged: 0 },
    { name: 'inventory.stock-updates', vhost: '/', type: 'stream', durable: true, auto_delete: false, exclusive: false, arguments: { 'x-queue-type': 'stream' }, state: 'running', consumers: 3, messages: 1540, messages_ready: 1540, messages_unacknowledged: 0 },
    { name: 'events.audit', vhost: '/', type: 'classic', durable: true, auto_delete: false, exclusive: false, arguments: {}, state: 'running', consumers: 1, messages: 22, messages_ready: 22, messages_unacknowledged: 0 },
  ],
  bindings: [
    // orders.exchange → queues via topic routing
    { source: 'orders.exchange', vhost: '/', destination: 'orders.created', destination_type: 'queue', routing_key: 'orders.created.*', arguments: {} },
    { source: 'orders.exchange', vhost: '/', destination: 'orders.updated', destination_type: 'queue', routing_key: 'orders.updated.*', arguments: {} },
    { source: 'orders.exchange', vhost: '/', destination: 'orders.cancelled', destination_type: 'queue', routing_key: 'orders.cancelled.*', arguments: {} },
    // orders.exchange → notifications (exchange-to-exchange)
    { source: 'orders.exchange', vhost: '/', destination: 'notifications.fanout', destination_type: 'exchange', routing_key: 'orders.#', arguments: {} },
    // Dead-letter
    { source: 'orders.dlx', vhost: '/', destination: 'orders.dead-letter', destination_type: 'queue', routing_key: 'dead', arguments: {} },
    // Fanout → all notification queues
    { source: 'notifications.fanout', vhost: '/', destination: 'notifications.email', destination_type: 'queue', routing_key: '', arguments: {} },
    { source: 'notifications.fanout', vhost: '/', destination: 'notifications.sms', destination_type: 'queue', routing_key: '', arguments: {} },
    { source: 'notifications.fanout', vhost: '/', destination: 'notifications.push', destination_type: 'queue', routing_key: '', arguments: {} },
    // Headers exchange
    { source: 'events.headers', vhost: '/', destination: 'events.audit', destination_type: 'queue', routing_key: '', arguments: { 'x-match': 'all', level: 'audit' } },
    // Inventory direct
    { source: 'inventory.direct', vhost: '/', destination: 'inventory.stock-updates', destination_type: 'queue', routing_key: 'stock.update', arguments: {} },
  ],
}
