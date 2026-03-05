import { ReactFlowProvider } from '@xyflow/react'
import { useTopologyStore } from './store/topologyStore'
import ConnectionPanel from './components/ConnectionPanel'
import TopologyGraph from './components/TopologyGraph'
import { LogOut } from 'lucide-react'

export default function App() {
  const { topology, reset } = useTopologyStore()

  return (
    <div className="w-screen h-screen bg-gray-50 flex flex-col overflow-hidden">
      {!topology ? (
        /* Welcome / connection screen */
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="w-full max-w-md flex flex-col items-center space-y-6">
            {/* Hero */}
            <div className="text-center space-y-2 w-full">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-orange-400 to-orange-600 shadow-lg mb-2">
                <svg viewBox="0 0 24 24" className="w-9 h-9 text-white fill-current">
                  <path d="M20.5 3h-17C2.67 3 2 3.67 2 4.5v15c0 .83.67 1.5 1.5 1.5h17c.83 0 1.5-.67 1.5-1.5v-15c0-.83-.67-1.5-1.5-1.5zm-1 5.5h-3v-3h3v3zm-5 0h-3v-3h3v3zm-5 0h-3v-3h3v3zm10 5.5h-3v-3h3v3zm-5 0h-3v-3h3v3zm-5 0h-3v-3h3v3zm10 5.5h-3v-3h3v3zm-5 0h-3v-3h3v3zm-5 0h-3v-3h3v3z" />
                </svg>
              </div>
              <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
                RabbitMQ Topology Visualizer
              </h1>
              <p className="text-gray-500 text-base max-w-sm mx-auto">
                Explore your entire messaging topology — exchanges, queues, bindings, and consumers — in a stunning interactive diagram.
              </p>
            </div>

            {/* Feature pills */}
            <div className="flex flex-wrap justify-center gap-2">
              {[
                'Exchange types color-coded',
                'Routing key labels',
                'Consumer tracking',
                'Zoom & pan',
                'Filtering',
                'JSON import',
              ].map((f) => (
                <span
                  key={f}
                  className="text-xs px-3 py-1 rounded-full bg-white border border-gray-200 text-gray-600 shadow-sm"
                >
                  {f}
                </span>
              ))}
            </div>

            <ConnectionPanel />
          </div>
        </div>
      ) : (
        /* Topology view */
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Thin top bar */}
          <div className="h-10 bg-white border-b border-gray-100 flex items-center px-4 gap-3 shrink-0 shadow-sm">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center">
                <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 text-white fill-current">
                  <path d="M20.5 3h-17C2.67 3 2 3.67 2 4.5v15c0 .83.67 1.5 1.5 1.5h17c.83 0 1.5-.67 1.5-1.5v-15c0-.83-.67-1.5-1.5-1.5zm-1 5.5h-3v-3h3v3zm-5 0h-3v-3h3v3zm-5 0h-3v-3h3v3zm10 5.5h-3v-3h3v3zm-5 0h-3v-3h3v3zm-5 0h-3v-3h3v3zm10 5.5h-3v-3h3v3zm-5 0h-3v-3h3v3zm-5 0h-3v-3h3v3z" />
                </svg>
              </div>
              <span className="font-bold text-gray-800 text-sm">RabbitMQ Topology Visualizer</span>
            </div>
            <button
              onClick={reset}
              className="ml-auto flex items-center gap-1.5 text-xs font-medium text-gray-500 hover:text-gray-800 px-2.5 py-1.5 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              Disconnect
            </button>
          </div>

          <div className="flex-1 overflow-hidden">
            <ReactFlowProvider>
              <TopologyGraph />
            </ReactFlowProvider>
          </div>
        </div>
      )}
    </div>
  )
}
