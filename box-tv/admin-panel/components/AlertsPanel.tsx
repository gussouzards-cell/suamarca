'use client'

import { useState, useEffect } from 'react'
import { api } from '@/lib/api'

interface Alert {
  id: string
  type: string
  device_uuid: string | null
  message: string
  details: string | null
  status: string
  channel: string | null
  created_at: string
}

export default function AlertsPanel() {
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'pending' | 'sent' | 'acknowledged' | 'resolved'>('all')

  useEffect(() => {
    fetchAlerts()
    const interval = setInterval(fetchAlerts, 30000) // Atualizar a cada 30s
    return () => clearInterval(interval)
  }, [filter])

  const fetchAlerts = async () => {
    try {
      setLoading(true)
      const params = filter !== 'all' ? { status: filter } : {}
      const response = await api.get('/alerts', { params })
      setAlerts(response.data)
    } catch (error) {
      console.error('Erro ao buscar alertas:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAcknowledge = async (id: string) => {
    try {
      await api.patch(`/alerts/${id}/acknowledge`)
      fetchAlerts()
    } catch (error) {
      console.error('Erro ao reconhecer alerta:', error)
    }
  }

  const handleResolve = async (id: string) => {
    try {
      await api.patch(`/alerts/${id}/resolve`)
      fetchAlerts()
    } catch (error) {
      console.error('Erro ao resolver alerta:', error)
    }
  }

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'device_offline': return '🔴'
      case 'device_online': return '🟢'
      case 'stream_error': return '⚠️'
      case 'volume_high': return '🔊'
      case 'volume_low': return '🔉'
      default: return '📢'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'sent': return 'bg-blue-100 text-blue-800'
      case 'acknowledged': return 'bg-purple-100 text-purple-800'
      case 'resolved': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const pendingCount = alerts.filter(a => a.status === 'pending').length

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Alertas</h3>
          {pendingCount > 0 && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 mt-1">
              {pendingCount} pendente{pendingCount > 1 ? 's' : ''}
            </span>
          )}
        </div>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value as any)}
          className="px-3 py-2 border border-gray-300 rounded-md text-sm"
        >
          <option value="all">Todos</option>
          <option value="pending">Pendentes</option>
          <option value="sent">Enviados</option>
          <option value="acknowledged">Reconhecidos</option>
          <option value="resolved">Resolvidos</option>
        </select>
      </div>

      {loading ? (
        <div className="text-center py-8 text-gray-500">Carregando alertas...</div>
      ) : alerts.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          Nenhum alerta encontrado
        </div>
      ) : (
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {alerts.map((alert) => (
            <div
              key={alert.id}
              className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-2xl">{getAlertIcon(alert.type)}</span>
                    <span className="font-medium text-gray-900">{alert.message}</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(alert.status)}`}>
                      {alert.status}
                    </span>
                  </div>
                  {alert.details && (
                    <p className="text-sm text-gray-600 mb-2">{alert.details}</p>
                  )}
                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    <span>📅 {new Date(alert.created_at).toLocaleString('pt-BR')}</span>
                    {alert.device_uuid && (
                      <span className="font-mono">UUID: {alert.device_uuid.substring(0, 8)}...</span>
                    )}
                    {alert.channel && <span>📧 {alert.channel}</span>}
                  </div>
                </div>
                <div className="flex gap-2 ml-4">
                  {alert.status === 'pending' && (
                    <>
                      <button
                        onClick={() => handleAcknowledge(alert.id)}
                        className="px-3 py-1 text-xs bg-purple-600 text-white rounded hover:bg-purple-700"
                      >
                        Reconhecer
                      </button>
                      <button
                        onClick={() => handleResolve(alert.id)}
                        className="px-3 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700"
                      >
                        Resolver
                      </button>
                    </>
                  )}
                  {alert.status === 'sent' && (
                    <button
                      onClick={() => handleResolve(alert.id)}
                      className="px-3 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700"
                    >
                      Resolver
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}






