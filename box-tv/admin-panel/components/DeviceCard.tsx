'use client'

import { useState, useEffect } from 'react'
import DeviceEditModal from './DeviceEditModal'
import DeviceEvents from './DeviceEvents'
import { api } from '@/lib/api'

interface Company {
  id: string
  nome: string
}

interface Device {
  id: string
  uuid: string
  nome: string | null
  ip_address: string | null
  mac_address: string | null
  streaming_url: string | null
  volume: number
  status: string
  last_heartbeat: string | null
  created_at: string
  company_id: string | null
  company: Company | null
}

interface DeviceCardProps {
  device: Device
  onUpdate: () => void
}

export default function DeviceCard({ device, onUpdate }: DeviceCardProps) {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isEventsModalOpen, setIsEventsModalOpen] = useState(false)
  const [isOnline, setIsOnline] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)

  // Verificar se está online (último heartbeat há menos de 2 minutos)
  const checkOnlineStatus = () => {
    if (!device.last_heartbeat) {
      setIsOnline(false)
      return
    }

    const lastHeartbeat = new Date(device.last_heartbeat)
    const now = new Date()
    const diffMinutes = (now.getTime() - lastHeartbeat.getTime()) / 1000 / 60

    setIsOnline(diffMinutes < 2)
  }

  useEffect(() => {
    checkOnlineStatus()
    const interval = setInterval(checkOnlineStatus, 10000) // Verificar a cada 10s
    return () => clearInterval(interval)
  }, [device.last_heartbeat])

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Nunca'
    const date = new Date(dateString)
    return date.toLocaleString('pt-BR')
  }

  return (
    <>
      <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-gray-200 hover:shadow-lg transition-shadow"
           style={{ borderLeftColor: isOnline ? '#10B981' : '#9CA3AF' }}>
        <div className="flex justify-between items-start mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-lg font-semibold text-gray-900">
                {device.nome || 'Dispositivo sem nome'}
              </h3>
              <div
                className={`w-2 h-2 rounded-full ${
                  isOnline ? 'bg-green-500 animate-pulse' : 'bg-gray-400'
                }`}
                title={isOnline ? 'Online' : 'Offline'}
              />
            </div>
            <p className="text-xs text-gray-500 font-mono">{device.uuid}</p>
          </div>
          <div className="flex items-center gap-2">
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
              isOnline ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
            }`}>
              {isOnline ? '🟢 Online' : '⚫ Offline'}
            </span>
          </div>
        </div>

        <div className="space-y-2 mb-4">
          {device.company && (
            <div>
              <span className="text-sm font-medium text-gray-700">Empresa: </span>
              <span className="text-sm text-blue-600 font-semibold">
                {device.company.nome}
              </span>
            </div>
          )}

          {device.ip_address && (
            <div>
              <span className="text-sm font-medium text-gray-700">IP: </span>
              <span className="text-sm text-gray-900 font-mono">
                {device.ip_address}
              </span>
            </div>
          )}

          {device.mac_address && (
            <div>
              <span className="text-sm font-medium text-gray-700">MAC: </span>
              <span className="text-sm text-gray-900 font-mono">
                {device.mac_address}
              </span>
            </div>
          )}

          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">Status: </span>
            <span
              className={`px-2 py-1 rounded-full text-xs font-semibold ${
                device.status === 'active' 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-red-100 text-red-800'
              }`}
            >
              {device.status === 'active' ? '▶️ Tocando' : '⏸️ Pausado'}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">Volume: </span>
            <div className="flex items-center gap-2">
              <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-500 transition-all"
                  style={{ width: `${device.volume}%` }}
                />
              </div>
              <span className="text-sm font-semibold text-gray-900 w-10 text-right">
                {device.volume}%
              </span>
            </div>
          </div>

          <div>
            <span className="text-sm font-medium text-gray-700">URL: </span>
            <span className="text-sm text-gray-600 break-all">
              {device.streaming_url || 'Não configurado'}
            </span>
          </div>

          <div>
            <span className="text-sm font-medium text-gray-700">
              Último contato:{' '}
            </span>
            <span className="text-sm text-gray-600">
              {formatDate(device.last_heartbeat)}
            </span>
          </div>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setIsEditModalOpen(true)}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
          >
            Editar
          </button>
          <button
            onClick={() => setIsEventsModalOpen(true)}
            className="flex-1 px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition"
          >
            Ver Eventos
          </button>
        </div>
      </div>

      {isEditModalOpen && (
        <DeviceEditModal
          device={device}
          onClose={() => setIsEditModalOpen(false)}
          onUpdate={onUpdate}
        />
      )}

      {isEventsModalOpen && (
        <DeviceEvents
          deviceUuid={device.uuid}
          onClose={() => setIsEventsModalOpen(false)}
        />
      )}
    </>
  )
}

