'use client'

import { useState, useMemo } from 'react'
import DeviceEditModal from './DeviceEditModal'
import DeviceEvents from './DeviceEvents'
import { api } from '@/lib/api'

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
  company: { id: string; nome: string } | null
}

interface DevicesTableProps {
  devices: Device[]
  onUpdate: () => void
}

type SortField = 'nome' | 'uuid' | 'status' | 'last_heartbeat' | 'company'
type SortDirection = 'asc' | 'desc'

export default function DevicesTable({ devices, onUpdate }: DevicesTableProps) {
  const [sortField, setSortField] = useState<SortField>('nome')
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc')
  const [selectedDevice, setSelectedDevice] = useState<Device | null>(null)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [selectedDeviceForEvents, setSelectedDeviceForEvents] = useState<string | null>(null)
  const [selectedDevices, setSelectedDevices] = useState<Set<string>>(new Set())

  const sortedDevices = useMemo(() => {
    return [...devices].sort((a, b) => {
      let aValue: any
      let bValue: any

      switch (sortField) {
        case 'nome':
          aValue = a.nome || ''
          bValue = b.nome || ''
          break
        case 'uuid':
          aValue = a.uuid
          bValue = b.uuid
          break
        case 'status':
          aValue = a.status
          bValue = b.status
          break
        case 'last_heartbeat':
          aValue = a.last_heartbeat ? new Date(a.last_heartbeat).getTime() : 0
          bValue = b.last_heartbeat ? new Date(b.last_heartbeat).getTime() : 0
          break
        case 'company':
          aValue = a.company?.nome || ''
          bValue = b.company?.nome || ''
          break
        default:
          return 0
      }

      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1
      return 0
    })
  }, [devices, sortField, sortDirection])

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('asc')
    }
  }

  const isOnline = (device: Device) => {
    if (!device.last_heartbeat) return false
    const lastHeartbeat = new Date(device.last_heartbeat)
    const now = new Date()
    const diffMinutes = (now.getTime() - lastHeartbeat.getTime()) / 1000 / 60
    return diffMinutes < 2
  }

  const handleSelectAll = () => {
    if (selectedDevices.size === devices.length) {
      setSelectedDevices(new Set())
    } else {
      setSelectedDevices(new Set(devices.map(d => d.id)))
    }
  }

  const handleSelectDevice = (deviceId: string) => {
    const newSelected = new Set(selectedDevices)
    if (newSelected.has(deviceId)) {
      newSelected.delete(deviceId)
    } else {
      newSelected.add(deviceId)
    }
    setSelectedDevices(newSelected)
  }

  const handleBulkAction = async (action: 'play' | 'pause' | 'restart') => {
    try {
      const promises = Array.from(selectedDevices).map(deviceId => {
        const device = devices.find(d => d.id === deviceId)
        if (!device) return Promise.resolve()
        
        switch (action) {
          case 'play':
            return api.put(`/devices/${device.uuid}`, { status: 'active' })
          case 'pause':
            return api.put(`/devices/${device.uuid}`, { status: 'inactive' })
          case 'restart':
            // Implementar restart se houver endpoint
            return Promise.resolve()
          default:
            return Promise.resolve()
        }
      })
      
      await Promise.all(promises)
      setSelectedDevices(new Set())
      onUpdate()
    } catch (error) {
      console.error('Erro ao executar ação em massa:', error)
    }
  }

  const exportToCSV = () => {
    const headers = ['Nome', 'UUID', 'IP', 'MAC', 'Status', 'Volume', 'Empresa', 'Último Heartbeat']
    const rows = devices.map(device => [
      device.nome || '',
      device.uuid,
      device.ip_address || '',
      device.mac_address || '',
      device.status,
      device.volume.toString(),
      device.company?.nome || '',
      device.last_heartbeat ? new Date(device.last_heartbeat).toLocaleString('pt-BR') : ''
    ])

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `dispositivos_${new Date().toISOString().split('T')[0]}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return <span className="text-gray-400">⇅</span>
    return sortDirection === 'asc' ? <span>↑</span> : <span>↓</span>
  }

  return (
    <>
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {/* Header com ações */}
        <div className="p-4 border-b border-gray-200 flex justify-between items-center">
          <div className="flex items-center gap-4">
            {selectedDevices.size > 0 && (
              <>
                <span className="text-sm text-gray-600">
                  {selectedDevices.size} selecionado{selectedDevices.size > 1 ? 's' : ''}
                </span>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleBulkAction('play')}
                    className="px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700"
                  >
                    ▶️ Play
                  </button>
                  <button
                    onClick={() => handleBulkAction('pause')}
                    className="px-3 py-1 text-sm bg-yellow-600 text-white rounded hover:bg-yellow-700"
                  >
                    ⏸️ Pause
                  </button>
                </div>
              </>
            )}
          </div>
          <button
            onClick={exportToCSV}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm font-medium"
          >
            📥 Exportar CSV
          </button>
        </div>

        {/* Tabela */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={selectedDevices.size === devices.length && devices.length > 0}
                    onChange={handleSelectAll}
                    className="rounded border-gray-300"
                  />
                </th>
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('nome')}
                >
                  <div className="flex items-center gap-2">
                    Nome <SortIcon field="nome" />
                  </div>
                </th>
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('uuid')}
                >
                  <div className="flex items-center gap-2">
                    UUID <SortIcon field="uuid" />
                  </div>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  IP / MAC
                </th>
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('status')}
                >
                  <div className="flex items-center gap-2">
                    Status <SortIcon field="status" />
                  </div>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Volume
                </th>
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('company')}
                >
                  <div className="flex items-center gap-2">
                    Empresa <SortIcon field="company" />
                  </div>
                </th>
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('last_heartbeat')}
                >
                  <div className="flex items-center gap-2">
                    Último Heartbeat <SortIcon field="last_heartbeat" />
                  </div>
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {sortedDevices.map((device) => (
                <tr key={device.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <input
                      type="checkbox"
                      checked={selectedDevices.has(device.id)}
                      onChange={() => handleSelectDevice(device.id)}
                      className="rounded border-gray-300"
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {device.nome || 'Sem nome'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500 font-mono">
                      {device.uuid.substring(0, 8)}...
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {device.ip_address && <div>IP: {device.ip_address}</div>}
                      {device.mac_address && <div className="text-gray-500">MAC: {device.mac_address}</div>}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <div
                        className={`w-2 h-2 rounded-full ${
                          isOnline(device) ? 'bg-green-500' : 'bg-gray-400'
                        }`}
                      />
                      <span className="text-sm text-gray-900">{device.status}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{device.volume}%</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {device.company?.nome || '-'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">
                      {device.last_heartbeat
                        ? new Date(device.last_heartbeat).toLocaleString('pt-BR')
                        : 'Nunca'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => {
                          setSelectedDevice(device)
                          setIsEditModalOpen(true)
                        }}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        ✏️
                      </button>
                      <button
                        onClick={() => setSelectedDeviceForEvents(device.uuid)}
                        className="text-purple-600 hover:text-purple-900"
                      >
                        📋
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {isEditModalOpen && selectedDevice && (
        <DeviceEditModal
          device={selectedDevice}
          onClose={() => {
            setIsEditModalOpen(false)
            setSelectedDevice(null)
            onUpdate()
          }}
        />
      )}

      {selectedDeviceForEvents && (
        <DeviceEvents
          deviceUuid={selectedDeviceForEvents}
          onClose={() => setSelectedDeviceForEvents(null)}
        />
      )}
    </>
  )
}






