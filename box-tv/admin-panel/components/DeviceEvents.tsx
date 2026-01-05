'use client'

import { useState, useEffect } from 'react'
import { api } from '@/lib/api'

interface DeviceEvent {
  id: string
  device_uuid: string
  event_type: string
  description: string | null
  metadata: Record<string, any> | null
  created_at: string
}

interface DeviceEventsProps {
  deviceUuid: string
  onClose: () => void
}

const EVENT_TYPE_LABELS: Record<string, { label: string; color: string; icon: string }> = {
  registered: { label: 'Registrado', color: 'bg-blue-100 text-blue-800', icon: '📝' },
  connected: { label: 'Conectado', color: 'bg-green-100 text-green-800', icon: '🟢' },
  disconnected: { label: 'Desconectado', color: 'bg-red-100 text-red-800', icon: '🔴' },
  reconnected: { label: 'Reconectado', color: 'bg-yellow-100 text-yellow-800', icon: '🟡' },
  restarted: { label: 'Reiniciado', color: 'bg-purple-100 text-purple-800', icon: '🔄' },
  status_changed: { label: 'Status Alterado', color: 'bg-indigo-100 text-indigo-800', icon: '⚙️' },
  config_updated: { label: 'Config Atualizada', color: 'bg-gray-100 text-gray-800', icon: '🔧' },
  heartbeat_missed: { label: 'Heartbeat Perdido', color: 'bg-orange-100 text-orange-800', icon: '⚠️' },
}

export default function DeviceEvents({ deviceUuid, onClose }: DeviceEventsProps) {
  const [events, setEvents] = useState<DeviceEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadEvents()
  }, [deviceUuid])

  const loadEvents = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await api.get(`/devices/${deviceUuid}/events`)
      setEvents(response.data)
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erro ao carregar eventos')
      console.error('Erro ao carregar eventos:', err)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    })
  }

  const getEventTypeInfo = (eventType: string) => {
    return EVENT_TYPE_LABELS[eventType] || {
      label: eventType,
      color: 'bg-gray-100 text-gray-800',
      icon: '📌',
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-2xl font-bold text-gray-900">Histórico de Eventos</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl"
          >
            ×
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="text-center py-8">
              <div className="text-gray-500">Carregando eventos...</div>
            </div>
          ) : error ? (
            <div className="text-center py-8">
              <div className="text-red-500">{error}</div>
              <button
                onClick={loadEvents}
                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Tentar Novamente
              </button>
            </div>
          ) : events.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-gray-500">Nenhum evento registrado</div>
            </div>
          ) : (
            <div className="space-y-4">
              {events.map((event) => {
                const typeInfo = getEventTypeInfo(event.event_type)
                return (
                  <div
                    key={event.id}
                    className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{typeInfo.icon}</span>
                        <div>
                          <span
                            className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${typeInfo.color}`}
                          >
                            {typeInfo.label}
                          </span>
                          <div className="text-sm text-gray-600 mt-1">
                            {formatDate(event.created_at)}
                          </div>
                        </div>
                      </div>
                    </div>

                    {event.description && (
                      <div className="text-sm text-gray-700 mt-2 ml-11">
                        {event.description}
                      </div>
                    )}

                    {event.metadata && Object.keys(event.metadata).length > 0 && (
                      <div className="mt-3 ml-11 p-3 bg-gray-50 rounded text-xs">
                        <div className="font-semibold text-gray-600 mb-1">Detalhes:</div>
                        <pre className="text-gray-700 whitespace-pre-wrap">
                          {JSON.stringify(event.metadata, null, 2)}
                        </pre>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t p-4 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  )
}






