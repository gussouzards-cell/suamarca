'use client'

import { useState, useEffect } from 'react'
import DeviceCard from './DeviceCard'
import CompanyManager from './CompanyManager'
import { api } from '@/lib/api'

interface Company {
  id: string
  nome: string
}

interface Device {
  id: string
  uuid: string
  nome: string | null
  streaming_url: string | null
  volume: number
  status: string
  last_heartbeat: string | null
  created_at: string
  company_id: string | null
  company: Company | null
}

export default function DeviceList() {
  const [devices, setDevices] = useState<Device[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [groupByCompany, setGroupByCompany] = useState(true)

  const fetchDevices = async () => {
    try {
      setLoading(true)
      const response = await api.get('/devices')
      setDevices(response.data)
      setError('')
    } catch (err: any) {
      setError('Erro ao carregar dispositivos: ' + (err.message || 'Erro desconhecido'))
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDevices()
    // Atualizar a cada 30 segundos
    const interval = setInterval(fetchDevices, 30000)
    return () => clearInterval(interval)
  }, [])

  const handleDeviceUpdate = () => {
    fetchDevices()
  }

  const handleCompanyChange = () => {
    fetchDevices()
  }

  // Agrupar dispositivos por empresa
  const groupedDevices = () => {
    if (!groupByCompany) {
      return { 'Sem Empresa': devices }
    }

    const grouped: Record<string, Device[]> = {}
    
    devices.forEach((device) => {
      const companyName = device.company?.nome || 'Sem Empresa'
      if (!grouped[companyName]) {
        grouped[companyName] = []
      }
      grouped[companyName].push(device)
    })

    return grouped
  }

  if (loading && devices.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-lg text-gray-600">Carregando dispositivos...</div>
      </div>
    )
  }

  if (error && devices.length === 0) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-800">{error}</p>
        <button
          onClick={fetchDevices}
          className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
        >
          Tentar novamente
        </button>
      </div>
    )
  }

  const grouped = groupedDevices()

  return (
    <div>
      <CompanyManager onCompanyChange={handleCompanyChange} />

      <div className="mb-6 flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-900">
          Dispositivos ({devices.length})
        </h2>
        <div className="flex gap-2">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={groupByCompany}
              onChange={(e) => setGroupByCompany(e.target.checked)}
              className="w-4 h-4"
            />
            <span className="text-sm text-gray-700">Agrupar por empresa</span>
          </label>
          <button
            onClick={fetchDevices}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Atualizar
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-4 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-yellow-800">{error}</p>
        </div>
      )}

      {devices.length === 0 ? (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
          <p className="text-gray-600">Nenhum dispositivo encontrado.</p>
          <p className="text-sm text-gray-500 mt-2">
            Os dispositivos aparecerão aqui quando se conectarem à API.
          </p>
        </div>
      ) : (
        <div className="space-y-8">
          {Object.entries(grouped).map(([companyName, companyDevices]) => (
            <div key={companyName}>
              <div className="mb-4 flex items-center gap-3">
                <h3 className="text-lg font-semibold text-gray-800">
                  {companyName}
                </h3>
                <span className="px-3 py-1 bg-gray-200 text-gray-700 rounded-full text-sm">
                  {companyDevices.length} dispositivo(s)
                </span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {companyDevices.map((device) => (
                  <DeviceCard
                    key={device.id}
                    device={device}
                    onUpdate={handleDeviceUpdate}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}


