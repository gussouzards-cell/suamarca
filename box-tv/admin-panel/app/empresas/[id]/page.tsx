'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import DeviceCard from '@/components/DeviceCard'
import DeviceEvents from '@/components/DeviceEvents'
import { api } from '@/lib/api'
import { checkAuth } from '@/lib/auth'

interface Company {
  id: string
  nome: string
  descricao: string | null
  contato: string | null
  endereco: string | null
  created_at: string
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

export default function CompanyPage() {
  const params = useParams()
  const router = useRouter()
  const companyId = params.id as string

  const [company, setCompany] = useState<Company | null>(null)
  const [devices, setDevices] = useState<Device[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selectedDeviceForEvents, setSelectedDeviceForEvents] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState<'all' | 'online' | 'offline' | 'active' | 'inactive'>('all')
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards')

  useEffect(() => {
    if (!checkAuth()) {
      router.push('/')
      return
    }
    loadCompanyData()
    // Atualizar a cada 30 segundos
    const interval = setInterval(loadCompanyData, 30000)
    return () => clearInterval(interval)
  }, [companyId])

  const loadCompanyData = async () => {
    try {
      setLoading(true)
      setError('')

      // Buscar empresa
      const companyResponse = await api.get(`/companies/${companyId}`)
      setCompany(companyResponse.data)

      // Buscar dispositivos da empresa
      const devicesResponse = await api.get(`/companies/${companyId}/devices`)
      setDevices(devicesResponse.data)
    } catch (err: any) {
      setError('Erro ao carregar dados: ' + (err.response?.data?.message || err.message))
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleDeviceUpdate = async () => {
    // Aguardar um pouco para garantir que o backend processou e dispositivo sincronizou
    await new Promise(resolve => setTimeout(resolve, 800))
    loadCompanyData()
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-lg text-gray-600">Carregando empresa...</div>
      </div>
    )
  }

  if (error && !company) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-md p-6 max-w-md">
          <h2 className="text-xl font-bold text-red-600 mb-4">Erro</h2>
          <p className="text-gray-700 mb-4">{error}</p>
          <button
            onClick={() => router.push('/')}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Voltar para Home
          </button>
        </div>
      </div>
    )
  }

  if (!company) {
    return null
  }

  const onlineCount = devices.filter((device) => {
    if (!device.last_heartbeat) return false
    const lastHeartbeat = new Date(device.last_heartbeat)
    const now = new Date()
    const diffMinutes = (now.getTime() - lastHeartbeat.getTime()) / 1000 / 60
    return diffMinutes < 2
  }).length

  const activeCount = devices.filter((d) => d.status === 'active').length

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push('/')}
                className="text-gray-600 hover:text-gray-900"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10 19l-7-7m0 0l7-7m-7 7h18"
                  />
                </svg>
              </button>
              <h1 className="text-2xl font-bold text-gray-900">{company.nome}</h1>
            </div>
            <button
              onClick={() => router.push('/')}
              className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
            >
              Voltar
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Informações da Empresa */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Informações da Empresa
              </h2>
              <div className="space-y-3">
                {company.descricao && (
                  <div>
                    <span className="text-sm font-medium text-gray-700">Descrição:</span>
                    <p className="text-sm text-gray-900 mt-1">{company.descricao}</p>
                  </div>
                )}
                {company.contato && (
                  <div>
                    <span className="text-sm font-medium text-gray-700">Contato:</span>
                    <p className="text-sm text-gray-900 mt-1">📞 {company.contato}</p>
                  </div>
                )}
                {company.endereco && (
                  <div>
                    <span className="text-sm font-medium text-gray-700">Endereço:</span>
                    <p className="text-sm text-gray-900 mt-1">📍 {company.endereco}</p>
                  </div>
                )}
                <div>
                  <span className="text-sm font-medium text-gray-700">Criada em:</span>
                  <p className="text-sm text-gray-900 mt-1">{formatDate(company.created_at)}</p>
                </div>
              </div>
            </div>

            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Estatísticas</h2>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-blue-50 rounded-lg p-4">
                  <div className="text-2xl font-bold text-blue-600">{devices.length}</div>
                  <div className="text-sm text-gray-600">Total de Dispositivos</div>
                </div>
                <div className="bg-green-50 rounded-lg p-4">
                  <div className="text-2xl font-bold text-green-600">{onlineCount}</div>
                  <div className="text-sm text-gray-600">Online</div>
                </div>
                <div className="bg-purple-50 rounded-lg p-4">
                  <div className="text-2xl font-bold text-purple-600">{activeCount}</div>
                  <div className="text-sm text-gray-600">Ativos</div>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="text-2xl font-bold text-gray-600">
                    {devices.length - onlineCount}
                  </div>
                  <div className="text-sm text-gray-600">Offline</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Dispositivos */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-900">
              Dispositivos ({devices.length})
            </h2>
            <div className="flex gap-2">
              <div className="flex border border-gray-300 rounded-md overflow-hidden">
                <button
                  onClick={() => setViewMode('cards')}
                  className={`px-4 py-2 text-sm font-medium ${
                    viewMode === 'cards'
                      ? 'bg-blue-600 text-white'
                      : 'bg-white text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  📋 Cards
                </button>
                <button
                  onClick={() => setViewMode('table')}
                  className={`px-4 py-2 text-sm font-medium ${
                    viewMode === 'table'
                      ? 'bg-blue-600 text-white'
                      : 'bg-white text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  📊 Tabela
                </button>
              </div>
              <button
                onClick={loadCompanyData}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors font-medium"
              >
                🔄 Atualizar
              </button>
            </div>
          </div>
          
          {/* Filtros e Busca */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Busca */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  🔍 Buscar
                </label>
                <input
                  type="text"
                  placeholder="Buscar por nome, UUID, IP ou MAC..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              {/* Filtro de Status */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  📊 Filtrar por status
                </label>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value as any)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="all">Todos</option>
                  <option value="online">Online</option>
                  <option value="offline">Offline</option>
                  <option value="active">Ativos</option>
                  <option value="inactive">Inativos</option>
                </select>
              </div>
            </div>
            
            {/* Limpar Filtros */}
            {(searchTerm || filterStatus !== 'all') && (
              <button
                onClick={() => {
                  setSearchTerm('')
                  setFilterStatus('all')
                }}
                className="mt-3 text-sm text-blue-600 hover:text-blue-800 font-medium"
              >
                ✕ Limpar filtros
              </button>
            )}
          </div>
        </div>

        {error && (
          <div className="mb-4 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <p className="text-yellow-800">{error}</p>
          </div>
        )}

        {/* Visualização em Cards */}
        {viewMode === 'cards' && (() => {
          // Filtrar dispositivos
          const now = new Date()
          const filteredDevices = devices.filter((device) => {
            // Filtro de busca
            const matchesSearch = 
              (device.nome?.toLowerCase().includes(searchTerm.toLowerCase()) || false) ||
              device.uuid.toLowerCase().includes(searchTerm.toLowerCase()) ||
              (device.ip_address?.toLowerCase().includes(searchTerm.toLowerCase()) || false) ||
              (device.mac_address?.toLowerCase().includes(searchTerm.toLowerCase()) || false)
            
            // Filtro de status
            let matchesFilter = true
            if (filterStatus === 'online') {
              if (!device.last_heartbeat) matchesFilter = false
              else {
                const lastHeartbeat = new Date(device.last_heartbeat)
                const diffMinutes = (now.getTime() - lastHeartbeat.getTime()) / 1000 / 60
                matchesFilter = diffMinutes < 2
              }
            } else if (filterStatus === 'offline') {
              if (!device.last_heartbeat) matchesFilter = true
              else {
                const lastHeartbeat = new Date(device.last_heartbeat)
                const diffMinutes = (now.getTime() - lastHeartbeat.getTime()) / 1000 / 60
                matchesFilter = diffMinutes >= 2
              }
            } else if (filterStatus === 'active') {
              matchesFilter = device.status === 'active'
            } else if (filterStatus === 'inactive') {
              matchesFilter = device.status !== 'active'
            }
            
            return matchesSearch && matchesFilter
          })
          
          return filteredDevices.length === 0 ? (
            <div className="bg-white rounded-lg shadow-md p-8 text-center">
              <p className="text-gray-600">
                {devices.length === 0 
                  ? 'Nenhum dispositivo associado a esta empresa.'
                  : 'Nenhum dispositivo encontrado com os filtros aplicados.'}
              </p>
              {devices.length > 0 && (
                <button
                  onClick={() => {
                    setSearchTerm('')
                    setFilterStatus('all')
                  }}
                  className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Limpar filtros
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredDevices.map((device) => (
                <DeviceCard
                  key={device.id}
                  device={device}
                  onUpdate={handleDeviceUpdate}
                />
              ))}
            </div>
          )
        })()}
        
        {/* Visualização em Tabela */}
        {viewMode === 'table' && (
          <DevicesTable devices={devices} onUpdate={loadCompanyData} />
        )}
      </main>

      {/* Modal de Eventos */}
      {selectedDeviceForEvents && (
        <DeviceEvents
          deviceUuid={selectedDeviceForEvents}
          onClose={() => setSelectedDeviceForEvents(null)}
        />
      )}
    </div>
  )
}

