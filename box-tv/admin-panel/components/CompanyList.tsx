'use client'

import { useState, useEffect } from 'react'
import CompanyCard from './CompanyCard'
import CompanyManager from './CompanyManager'
import DeviceEditModal from './DeviceEditModal'
import { api } from '@/lib/api'

interface Company {
  id: string
  nome: string
  descricao: string | null
  contato: string | null
  endereco: string | null
  devices: any[]
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
  company: { id: string; nome: string } | null
}

export default function CompanyList() {
  const [companies, setCompanies] = useState<Company[]>([])
  const [devicesWithoutCompany, setDevicesWithoutCompany] = useState<Device[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showCompanyManager, setShowCompanyManager] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState<'all' | 'with-devices' | 'without-devices'>('all')
  const [selectedDevice, setSelectedDevice] = useState<Device | null>(null)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)

  const fetchData = async () => {
    try {
      setLoading(true)
      setError('')

      // Buscar empresas
      const companiesResponse = await api.get('/companies')
      setCompanies(companiesResponse.data)

      // Buscar dispositivos sem empresa
      const devicesResponse = await api.get('/devices')
      const allDevices = devicesResponse.data
      const withoutCompany = allDevices
        .filter((d: Device) => !d.company_id || d.company_id === null)
        .map((d: Device) => ({
          ...d,
          volume: d.volume || 50,
          status: d.status || 'active',
        }))
      setDevicesWithoutCompany(withoutCompany)
      
      // Adicionar contagem de dispositivos às empresas
      const companiesWithDeviceCount = companiesResponse.data.map((company: Company) => {
        const companyDevices = allDevices.filter((d: Device) => d.company_id === company.id)
        return { ...company, deviceCount: companyDevices.length }
      })
      setCompanies(companiesWithDeviceCount)
    } catch (err: any) {
      setError('Erro ao carregar dados: ' + (err.message || 'Erro desconhecido'))
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
    // Atualizar a cada 30 segundos
    const interval = setInterval(fetchData, 30000)
    return () => clearInterval(interval)
  }, [])

  const handleCompanyChange = () => {
    fetchData()
  }

  if (loading && companies.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-lg text-gray-600">Carregando empresas...</div>
      </div>
    )
  }

  if (error && companies.length === 0) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-800">{error}</p>
        <button
          onClick={fetchData}
          className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
        >
          Tentar novamente
        </button>
      </div>
    )
  }

  // Filtrar empresas
  const filteredCompanies = companies.filter((company) => {
    // Filtro de busca
    const matchesSearch = 
      company.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      company.descricao?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      company.contato?.toLowerCase().includes(searchTerm.toLowerCase())
    
    // Filtro de status
    const matchesFilter = 
      filterStatus === 'all' ||
      (filterStatus === 'with-devices' && (company as any).deviceCount > 0) ||
      (filterStatus === 'without-devices' && (company as any).deviceCount === 0)
    
    return matchesSearch && matchesFilter
  })

  return (
    <div>
      {/* Header com Botões */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-gray-900">
            Empresas ({filteredCompanies.length})
          </h2>
          <div className="flex gap-2">
            <button
              onClick={() => setShowCompanyManager(!showCompanyManager)}
              className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors font-medium"
            >
              {showCompanyManager ? 'Ocultar' : 'Gerenciar'} Empresas
            </button>
            <button
              onClick={fetchData}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors font-medium"
            >
              🔄 Atualizar
            </button>
          </div>
        </div>
        
        {/* Filtros e Busca */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Busca */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                🔍 Buscar
              </label>
              <input
                type="text"
                placeholder="Buscar por nome, descrição ou contato..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            {/* Filtro de Status */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                📊 Filtrar por
              </label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as any)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">Todas as empresas</option>
                <option value="with-devices">Com dispositivos</option>
                <option value="without-devices">Sem dispositivos</option>
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

      {/* Gerenciador de Empresas (Colapsável) */}
      {showCompanyManager && (
        <div className="mb-6">
          <CompanyManager onCompanyChange={handleCompanyChange} />
        </div>
      )}

      {error && (
        <div className="mb-4 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-yellow-800">{error}</p>
        </div>
      )}

      {/* Lista de Empresas */}
      {companies.length === 0 && devicesWithoutCompany.length === 0 ? (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
          <p className="text-gray-600">Nenhuma empresa cadastrada.</p>
          <p className="text-sm text-gray-500 mt-2">
            Clique em "Gerenciar Empresas" para criar sua primeira empresa.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Cards das Empresas */}
          {filteredCompanies.length === 0 ? (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
              <p className="text-gray-600">Nenhuma empresa encontrada com os filtros aplicados.</p>
              <button
                onClick={() => {
                  setSearchTerm('')
                  setFilterStatus('all')
                }}
                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Limpar filtros
              </button>
            </div>
          ) : (
            filteredCompanies.map((company) => (
              <CompanyCard
                key={company.id}
                company={company}
                onCompanyChange={handleCompanyChange}
              />
            ))
          )}

          {/* Dispositivos Sem Empresa */}
          {devicesWithoutCompany.length > 0 && (
            <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
              <div className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <h3 className="text-xl font-bold text-gray-900">Sem Empresa</h3>
                  <span className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm font-semibold">
                    {devicesWithoutCompany.length} dispositivo(s)
                  </span>
                </div>
                <p className="text-sm text-gray-600 mb-4">
                  Dispositivos que ainda não foram associados a nenhuma empresa. Clique em "Editar" para associá-los.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {devicesWithoutCompany.map((device) => (
                    <div
                      key={device.id}
                      className="bg-gray-50 border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                    >
                      <div className="font-semibold text-gray-900 mb-1">
                        {device.nome || 'Dispositivo sem nome'}
                      </div>
                      <div className="text-xs text-gray-500 font-mono mb-2">
                        {device.uuid}
                      </div>
                      {device.ip_address && (
                        <div className="text-xs text-gray-600 mb-1">
                          IP: {device.ip_address}
                        </div>
                      )}
                      {device.mac_address && (
                        <div className="text-xs text-gray-600 mb-2">
                          MAC: {device.mac_address}
                        </div>
                      )}
                      <button
                        onClick={() => {
                          setSelectedDevice(device)
                          setIsEditModalOpen(true)
                        }}
                        className="w-full mt-3 px-3 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 transition-colors font-medium"
                      >
                        ✏️ Editar e Associar Empresa
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Modal de Edição de Dispositivo */}
      {isEditModalOpen && selectedDevice && (
        <DeviceEditModal
          device={selectedDevice}
          onClose={() => {
            setIsEditModalOpen(false)
            setSelectedDevice(null)
          }}
          onUpdate={() => {
            fetchData()
            setIsEditModalOpen(false)
            setSelectedDevice(null)
          }}
        />
      )}
    </div>
  )
}

