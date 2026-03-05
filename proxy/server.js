import express from 'express'
import axios from 'axios'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import { existsSync } from 'fs'

const app = express()
const PORT = process.env.PORT || 3001
const __dirname = dirname(fileURLToPath(import.meta.url))

// Proxy endpoint — connection details come from request headers so the
// browser never contacts RabbitMQ directly (avoids CORS entirely).
app.use('/rabbitmq-proxy', async (req, res) => {
  const targetUrl = req.headers['x-rabbitmq-url']
  const username = req.headers['x-rabbitmq-user'] ?? ''
  const password = req.headers['x-rabbitmq-password'] ?? ''

  if (!targetUrl) {
    res.status(400).json({ error: 'Missing X-RabbitMQ-URL header' })
    return
  }

  try {
    const base = String(targetUrl).replace(/\/$/, '')
    const url = `${base}/api${req.path}`

    const response = await axios.get(url, {
      auth: { username: String(username), password: String(password) },
      timeout: 15000,
      params: req.query,
    })

    res.json(response.data)
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const status = error.response?.status ?? 502
      res.status(status).json({
        error: error.message,
        details: error.response?.data,
      })
    } else {
      res.status(500).json({ error: 'Internal proxy error' })
    }
  }
})

// Serve the built React app (production mode)
const distPath = join(__dirname, '..', 'dist')
if (existsSync(distPath)) {
  app.use(express.static(distPath))
  app.get('*', (_req, res) => {
    res.sendFile(join(distPath, 'index.html'))
  })
}

app.listen(PORT, () => {
  console.log(`RabbitMQ Topology Visualizer running on http://localhost:${PORT}`)
})
