import axios, { AxiosInstance } from 'axios'
import type {
  RabbitExchange,
  RabbitQueue,
  RabbitBinding,
  RabbitConsumer,
  RabbitVhost,
  TopologyData,
} from '../types'

export class RabbitMQApiError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
  ) {
    super(message)
    this.name = 'RabbitMQApiError'
  }
}

export class RabbitMQApiService {
  private client: AxiosInstance

  constructor(baseUrl: string, username: string, password: string) {
    // Normalize base URL
    const normalizedUrl = baseUrl.replace(/\/$/, '')

    this.client = axios.create({
      baseURL: `${normalizedUrl}/api`,
      auth: { username, password },
      timeout: 15000,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  private async get<T>(path: string): Promise<T> {
    try {
      const response = await this.client.get<T>(path)
      return response.data
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const status = error.response?.status
        if (status === 401) throw new RabbitMQApiError('Authentication failed. Check username and password.', 401)
        if (status === 403) throw new RabbitMQApiError('Access denied. User may lack permissions.', 403)
        if (status === 404) throw new RabbitMQApiError(`Endpoint not found: ${path}`, 404)
        if (error.code === 'ECONNREFUSED' || error.code === 'ERR_NETWORK') {
          throw new RabbitMQApiError('Cannot connect to RabbitMQ. Check the URL and ensure the management plugin is enabled.')
        }
        throw new RabbitMQApiError(error.message, status)
      }
      throw error
    }
  }

  async getVhosts(): Promise<RabbitVhost[]> {
    return this.get<RabbitVhost[]>('/vhosts')
  }

  async getExchanges(vhost?: string): Promise<RabbitExchange[]> {
    const path = vhost ? `/exchanges/${encodeURIComponent(vhost)}` : '/exchanges'
    return this.get<RabbitExchange[]>(path)
  }

  async getQueues(vhost?: string): Promise<RabbitQueue[]> {
    const path = vhost ? `/queues/${encodeURIComponent(vhost)}` : '/queues'
    return this.get<RabbitQueue[]>(path)
  }

  async getBindings(vhost?: string): Promise<RabbitBinding[]> {
    const path = vhost ? `/bindings/${encodeURIComponent(vhost)}` : '/bindings'
    return this.get<RabbitBinding[]>(path)
  }

  async getConsumers(): Promise<RabbitConsumer[]> {
    return this.get<RabbitConsumer[]>('/consumers')
  }

  async getTopology(vhost?: string): Promise<TopologyData> {
    const [exchanges, queues, bindings, consumers, vhosts] = await Promise.all([
      this.getExchanges(vhost),
      this.getQueues(vhost),
      this.getBindings(vhost),
      this.getConsumers().catch(() => [] as RabbitConsumer[]),
      this.getVhosts(),
    ])

    return {
      exchanges,
      queues,
      bindings,
      consumers,
      vhosts: vhosts.map((v) => v.name),
    }
  }

  async testConnection(): Promise<boolean> {
    await this.get('/overview')
    return true
  }
}
