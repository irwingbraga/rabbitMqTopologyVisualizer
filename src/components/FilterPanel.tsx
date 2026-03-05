import { useState, useEffect, useRef } from 'react'
import { SlidersHorizontal, Search, X, ChevronDown, ChevronUp } from 'lucide-react'
import { useTopologyStore } from '../store/topologyStore'

const EXCHANGE_TYPES = ['direct', 'fanout', 'topic', 'headers', 'x-delayed-message', 'x-consistent-hash']
const QUEUE_TYPES = ['classic', 'quorum', 'stream']

const EXCHANGE_COLORS: Record<string, string> = {
  direct: 'bg-blue-100 text-blue-700 border-blue-300',
  fanout: 'bg-green-100 text-green-700 border-green-300',
  topic: 'bg-purple-100 text-purple-700 border-purple-300',
  headers: 'bg-orange-100 text-orange-700 border-orange-300',
  'x-delayed-message': 'bg-yellow-100 text-yellow-700 border-yellow-300',
  'x-consistent-hash': 'bg-pink-100 text-pink-700 border-pink-300',
}

const QUEUE_COLORS: Record<string, string> = {
  classic: 'bg-teal-100 text-teal-700 border-teal-300',
  quorum: 'bg-indigo-100 text-indigo-700 border-indigo-300',
  stream: 'bg-pink-100 text-pink-700 border-pink-300',
}

export default function FilterPanel() {
  const { filters, setFilters, topology, selectedVhost, setSelectedVhost } = useTopologyStore()
  const [open, setOpen] = useState(false)
  // Local state for the search input — debounced before hitting the store/graph
  const [searchInput, setSearchInput] = useState(filters.searchText)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const handleSearchChange = (value: string) => {
    setSearchInput(value)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => setFilters({ searchText: value }), 300)
  }

  // Keep local input in sync if the filter is cleared externally (e.g. "Clear all")
  useEffect(() => {
    setSearchInput(filters.searchText)
  }, [filters.searchText])

  const toggleExchangeType = (type: string) => {
    const current = filters.exchangeTypes
    const next = current.includes(type) ? current.filter((t) => t !== type) : [...current, type]
    setFilters({ exchangeTypes: next })
  }

  const toggleQueueType = (type: string) => {
    const current = filters.queueTypes
    const next = current.includes(type) ? current.filter((t) => t !== type) : [...current, type]
    setFilters({ queueTypes: next })
  }

  const activeFilterCount =
    filters.exchangeTypes.length +
    filters.queueTypes.length +
    (filters.showInternal ? 0 : 1) +
    (filters.hideEmptyQueues ? 1 : 0)

  return (
    <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden">
      {/* Top bar: search + vhost + toggle */}
      <div className="flex items-center gap-2 p-2">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
          <input
            type="text"
            value={searchInput}
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder="Search exchanges, queues..."
            className="w-full pl-8 pr-7 py-1.5 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-300 transition"
          />
          {searchInput && (
            <button
              onClick={() => handleSearchChange('')}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </div>

        {/* Vhost selector */}
        {topology && topology.vhosts.length > 1 && (
          <select
            value={selectedVhost}
            onChange={(e) => setSelectedVhost(e.target.value)}
            className="text-xs border border-gray-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-orange-300 bg-white"
          >
            {topology.vhosts.map((v) => (
              <option key={v} value={v}>
                {v}
              </option>
            ))}
          </select>
        )}

        {/* Filter toggle */}
        <button
          onClick={() => setOpen((v) => !v)}
          className={`flex items-center gap-1.5 text-xs font-medium px-2.5 py-1.5 rounded-lg border transition-colors ${
            activeFilterCount > 0
              ? 'bg-orange-50 border-orange-300 text-orange-700'
              : 'border-gray-200 text-gray-600 hover:bg-gray-50'
          }`}
        >
          <SlidersHorizontal className="w-3.5 h-3.5" />
          Filters
          {activeFilterCount > 0 && (
            <span className="bg-orange-500 text-white rounded-full text-[10px] w-4 h-4 flex items-center justify-center font-bold">
              {activeFilterCount}
            </span>
          )}
          {open ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
        </button>
      </div>

      {/* Expanded filters */}
      {open && (
        <div className="border-t border-gray-100 p-3 space-y-3">
          {/* Exchange types */}
          <div>
            <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
              Exchange Types
            </p>
            <div className="flex flex-wrap gap-1.5">
              {EXCHANGE_TYPES.map((type) => (
                <button
                  key={type}
                  onClick={() => toggleExchangeType(type)}
                  className={`text-[11px] font-medium px-2 py-1 rounded-md border transition-all ${
                    filters.exchangeTypes.includes(type)
                      ? (EXCHANGE_COLORS[type] ?? 'bg-gray-100 text-gray-700 border-gray-300') + ' ring-1 ring-current'
                      : 'bg-white text-gray-500 border-gray-200 hover:border-gray-300'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          {/* Queue types */}
          <div>
            <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
              Queue Types
            </p>
            <div className="flex flex-wrap gap-1.5">
              {QUEUE_TYPES.map((type) => (
                <button
                  key={type}
                  onClick={() => toggleQueueType(type)}
                  className={`text-[11px] font-medium px-2 py-1 rounded-md border transition-all ${
                    filters.queueTypes.includes(type)
                      ? (QUEUE_COLORS[type] ?? 'bg-gray-100 text-gray-700 border-gray-300') + ' ring-1 ring-current'
                      : 'bg-white text-gray-500 border-gray-200 hover:border-gray-300'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          {/* Toggles */}
          <div className="flex flex-wrap gap-2">
            <label className="flex items-center gap-1.5 cursor-pointer">
              <input
                type="checkbox"
                checked={filters.showInternal}
                onChange={(e) => setFilters({ showInternal: e.target.checked })}
                className="rounded accent-orange-500"
              />
              <span className="text-xs text-gray-600">Show internal exchanges</span>
            </label>
            <label className="flex items-center gap-1.5 cursor-pointer">
              <input
                type="checkbox"
                checked={filters.hideEmptyQueues}
                onChange={(e) => setFilters({ hideEmptyQueues: e.target.checked })}
                className="rounded accent-orange-500"
              />
              <span className="text-xs text-gray-600">Hide empty queues</span>
            </label>
          </div>

          {/* Reset */}
          {activeFilterCount > 0 && (
            <button
              onClick={() =>
                setFilters({
                  exchangeTypes: [],
                  queueTypes: [],
                  showInternal: false,
                  searchText: '',
                  hideEmptyQueues: false,
                })
              }
              className="text-xs text-orange-600 hover:text-orange-700 font-medium flex items-center gap-1"
            >
              <X className="w-3 h-3" /> Clear all filters
            </button>
          )}
        </div>
      )}
    </div>
  )
}
