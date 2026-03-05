import { useState, useRef } from 'react'
import { Server, Upload, Eye, EyeOff, AlertCircle, Loader2, RefreshCw, Sparkles } from 'lucide-react'
import { useTopologyStore } from '../store/topologyStore'
import type { RabbitDefinitions } from '../types'
import { SAMPLE_DEFINITIONS } from '../utils/sampleData'

export default function ConnectionPanel() {
  const { connectToRabbitMQ, loadFromDefinitions, loading, error, clearError, topology, reset } =
    useTopologyStore()

  const [mode, setMode] = useState<'api' | 'json'>('api')
  const [url, setUrl] = useState(() => localStorage.getItem('rmq_url') ?? 'http://localhost:15672')
  const [username, setUsername] = useState(() => localStorage.getItem('rmq_username') ?? 'guest')
  const [password, setPassword] = useState(() => localStorage.getItem('rmq_password') ?? 'guest')
  const [vhost, setVhost] = useState(() => localStorage.getItem('rmq_vhost') ?? '')
  const [showPassword, setShowPassword] = useState(false)
  const [jsonError, setJsonError] = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  const handleConnect = async (e: React.FormEvent) => {
    e.preventDefault()
    clearError()
    localStorage.setItem('rmq_url', url)
    localStorage.setItem('rmq_username', username)
    localStorage.setItem('rmq_password', password)
    localStorage.setItem('rmq_vhost', vhost)
    await connectToRabbitMQ({ url, username, password, vhost })
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setJsonError(null)
    clearError()

    const reader = new FileReader()
    reader.onload = (ev) => {
      try {
        const definitions = JSON.parse(ev.target?.result as string) as RabbitDefinitions
        if (!definitions.exchanges && !definitions.queues) {
          setJsonError('Invalid RabbitMQ definitions file. Expected exchanges and/or queues.')
          return
        }
        loadFromDefinitions(definitions)
      } catch {
        setJsonError('Failed to parse JSON file. Make sure it is a valid RabbitMQ definitions export.')
      }
    }
    reader.readAsText(file)
  }

  const handlePaste = (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    const text = e.clipboardData.getData('text')
    setJsonError(null)
    try {
      const definitions = JSON.parse(text) as RabbitDefinitions
      if (!definitions.exchanges && !definitions.queues) {
        setJsonError('Invalid RabbitMQ definitions. Expected exchanges and/or queues properties.')
        return
      }
      loadFromDefinitions(definitions)
    } catch {
      // Not valid JSON yet, let user continue typing
    }
  }

  return (
    <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6 w-full max-w-md">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-orange-500 flex items-center justify-center">
          <Server className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-lg font-bold text-gray-900">RabbitMQ Topology Visualizer</h1>
          <p className="text-xs text-gray-500">Connect to a broker or import definitions</p>
        </div>
        {topology && (
          <button
            onClick={reset}
            className="ml-auto text-gray-400 hover:text-gray-600 transition-colors"
            title="Reset / disconnect"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Demo button */}
      <button
        onClick={() => loadFromDefinitions(SAMPLE_DEFINITIONS)}
        className="w-full flex items-center justify-center gap-2 py-2 mb-4 bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 text-white text-sm font-semibold rounded-lg transition-all shadow-sm"
      >
        <Sparkles className="w-4 h-4" />
        Try with sample data
      </button>

      {/* Mode tabs */}
      <div className="flex rounded-lg bg-gray-100 p-1 mb-5 gap-1">
        <button
          onClick={() => setMode('api')}
          className={`flex-1 flex items-center justify-center gap-2 py-1.5 rounded-md text-sm font-medium transition-all ${
            mode === 'api' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <Server className="w-3.5 h-3.5" />
          Management API
        </button>
        <button
          onClick={() => setMode('json')}
          className={`flex-1 flex items-center justify-center gap-2 py-1.5 rounded-md text-sm font-medium transition-all ${
            mode === 'json' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <Upload className="w-3.5 h-3.5" />
          Import JSON
        </button>
      </div>

      {/* API Connection Form */}
      {mode === 'api' && (
        <form onSubmit={handleConnect} className="space-y-3">
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Management URL</label>
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="http://localhost:15672"
              required
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition"
            />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Username</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full px-3 py-2 pr-9 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">
              Virtual Host <span className="font-normal text-gray-400">(leave blank for all)</span>
            </label>
            <input
              type="text"
              value={vhost}
              onChange={(e) => setVhost(e.target.value)}
              placeholder="/"
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition"
            />
          </div>

          {error && (
            <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
              <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
              <span className="whitespace-pre-line">{error}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-2.5 bg-orange-500 hover:bg-orange-600 disabled:bg-orange-300 text-white font-semibold rounded-lg transition-colors text-sm"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" /> Connecting...
              </>
            ) : (
              'Connect & Visualize'
            )}
          </button>
        </form>
      )}

      {/* JSON Import */}
      {mode === 'json' && (
        <div className="space-y-3">
          <div
            className="border-2 border-dashed border-gray-200 rounded-xl p-6 text-center cursor-pointer hover:border-orange-300 hover:bg-orange-50 transition-colors"
            onClick={() => fileRef.current?.click()}
          >
            <Upload className="w-8 h-8 text-gray-300 mx-auto mb-2" />
            <p className="text-sm font-medium text-gray-600">Click to upload definitions file</p>
            <p className="text-xs text-gray-400 mt-1">
              Export from RabbitMQ Management UI → Overview → Export definitions
            </p>
            <input
              ref={fileRef}
              type="file"
              accept=".json"
              className="hidden"
              onChange={handleFileUpload}
            />
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200" />
            </div>
            <div className="relative flex justify-center text-xs text-gray-400">
              <span className="bg-white px-2">or paste JSON below</span>
            </div>
          </div>

          <textarea
            rows={5}
            placeholder='{"exchanges": [...], "queues": [...], "bindings": [...]}'
            onPaste={handlePaste}
            className="w-full px-3 py-2 text-xs font-mono border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400 resize-none"
          />

          {(jsonError || error) && (
            <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
              <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
              <span>{jsonError ?? error}</span>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
