'use client'

import { useState, useEffect } from 'react'
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
  player_type?: string
  last_heartbeat: string | null
  created_at: string
  company_id: string | null
  company: Company | null
}

interface DeviceEditModalProps {
  device: Device
  onClose: () => void
  onUpdate: () => void
}

export default function DeviceEditModal({
  device,
  onClose,
  onUpdate,
}: DeviceEditModalProps) {
  const [nome, setNome] = useState(device.nome || '')
  const [ipAddress, setIpAddress] = useState(device.ip_address || '')
  const [macAddress, setMacAddress] = useState(device.mac_address || '')
  const [streamingUrl, setStreamingUrl] = useState(device.streaming_url || '')
  const [volume, setVolume] = useState(device.volume)
  const [status, setStatus] = useState(device.status)
  const [playerType, setPlayerType] = useState(device.player_type || 'webView')
  const [companyId, setCompanyId] = useState(device.company_id || '')
  const [companies, setCompanies] = useState<Company[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    loadCompanies()
  }, [])

  const loadCompanies = async () => {
    try {
      const response = await api.get('/companies')
      setCompanies(response.data)
    } catch (err) {
      console.error('Erro ao carregar empresas:', err)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess(false)

    try {
      const response = await api.put(`/devices/${device.uuid}`, {
        nome: nome || null,
        ip_address: ipAddress || null,
        mac_address: macAddress || null,
        streaming_url: streamingUrl || null,
        volume: volume,
        status: status,
        player_type: playerType,
        company_id: companyId || null,
      })

      // Aguardar um pouco para garantir que o dispositivo recebeu a atualização
      await new Promise(resolve => setTimeout(resolve, 800))
      
      setSuccess(true)
      
      // Aguardar mais um pouco antes de fechar para mostrar feedback visual
      setTimeout(() => {
        onUpdate()
        onClose()
      }, 2000)
    } catch (err: any) {
      setError('Erro ao atualizar: ' + (err.response?.data?.message || err.message || 'Erro desconhecido'))
      console.error(err)
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
        <div className="p-6">
          <h2 className="text-xl font-bold mb-4 text-gray-900">
            Editar Dispositivo
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nome
              </label>
              <input
                type="text"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Nome do dispositivo"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Endereço IP
              </label>
              <input
                type="text"
                value={ipAddress}
                onChange={(e) => setIpAddress(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                placeholder="192.168.1.100"
                pattern="^([0-9]{1,3}\.){3}[0-9]{1,3}$"
              />
              <p className="text-xs text-gray-500 mt-1">
                Formato: XXX.XXX.XXX.XXX
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Endereço MAC
              </label>
              <input
                type="text"
                value={macAddress}
                onChange={(e) => setMacAddress(e.target.value.toUpperCase())}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                placeholder="AA:BB:CC:DD:EE:FF"
                pattern="^([0-9A-Fa-f]{2}:){5}[0-9A-Fa-f]{2}$"
              />
              <p className="text-xs text-gray-500 mt-1">
                Formato: XX:XX:XX:XX:XX:XX
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                URL de Streaming
              </label>
              <input
                type="url"
                value={streamingUrl}
                onChange={(e) => setStreamingUrl(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="https://exemplo.com/stream.mp3"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Volume: {volume}%
              </label>
              <input
                type="range"
                min="0"
                max="100"
                value={volume}
                onChange={(e) => setVolume(parseInt(e.target.value))}
                className="w-full"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="active">Ativo</option>
                <option value="inactive">Inativo</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Player de Áudio
              </label>
              <select
                value={playerType}
                onChange={(e) => setPlayerType(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="webView">WebView (Recomendado)</option>
                <option value="exoPlayer">ExoPlayer</option>
              </select>
              <p className="text-xs text-gray-500 mt-1">
                WebView: Melhor compatibilidade com páginas web. ExoPlayer: Melhor para streams diretos.
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Player de Áudio
              </label>
              <select
                value={playerType}
                onChange={(e) => setPlayerType(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="webView">WebView (Recomendado)</option>
                <option value="exoPlayer">ExoPlayer</option>
              </select>
              <p className="text-xs text-gray-500 mt-1">
                WebView: Melhor compatibilidade com streams web. ExoPlayer: Melhor para streams diretos (MP3, AAC, etc.)
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Empresa
              </label>
              <select
                value={companyId}
                onChange={(e) => setCompanyId(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Sem empresa</option>
                {companies.map((company) => (
                  <option key={company.id} value={company.id}>
                    {company.nome}
                  </option>
                ))}
              </select>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded p-3">
                <p className="text-red-800 text-sm">{error}</p>
              </div>
            )}

      {success && (
        <div className="bg-green-50 border border-green-200 rounded p-3 flex items-center gap-2">
          <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          <p className="text-green-800 text-sm font-medium">
            Dispositivo atualizado! Sincronizando com hardware...
          </p>
        </div>
      )}

            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                disabled={loading}
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading && (
                  <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                )}
                {loading ? 'Salvando e sincronizando...' : 'Salvar'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}


