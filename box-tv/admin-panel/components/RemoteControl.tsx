'use client'

import { useState, useEffect } from 'react'
import { api } from '@/lib/api'

interface RemoteCommand {
  id: string
  device_uuid: string
  command_type: string
  parameters: any
  status: string
  result: string | null
  error_message: string | null
  created_at: string
  executed_at: string | null
}

interface Device {
  uuid: string
  nome: string
  status: string
  last_heartbeat: string
}

export default function RemoteControl() {
  const [devices, setDevices] = useState<Device[]>([])
  const [selectedDevice, setSelectedDevice] = useState<string>('')
  const [commands, setCommands] = useState<RemoteCommand[]>([])
  const [loading, setLoading] = useState(true)
  const [commandParams, setCommandParams] = useState<any>({})

  useEffect(() => {
    fetchDevices()
    fetchCommands()
    const interval = setInterval(() => {
      fetchCommands()
    }, 3000) // Atualizar a cada 3 segundos
    return () => clearInterval(interval)
  }, [selectedDevice])

  const fetchDevices = async () => {
    try {
      const res = await api.get('/devices')
      setDevices(res.data)
      if (res.data.length > 0 && !selectedDevice) {
        setSelectedDevice(res.data[0].uuid)
      }
    } catch (error) {
      console.error('Erro ao buscar dispositivos:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchCommands = async () => {
    try {
      const params: any = { limit: 50 }
      if (selectedDevice) {
        params.device_uuid = selectedDevice
      }
      const res = await api.get('/remote-commands', { params })
      setCommands(res.data)
    } catch (error) {
      console.error('Erro ao buscar comandos:', error)
    }
  }

  const sendCommand = async (commandType: string, parameters: any = {}) => {
    if (!selectedDevice) {
      alert('Selecione um dispositivo')
      return
    }

    try {
      console.log('📤 Enviando comando:', { commandType, parameters, device_uuid: selectedDevice })
      const response = await api.post('/remote-commands', {
        device_uuid: selectedDevice,
        command_type: commandType,
        parameters: parameters,
        executed_by: 'admin'
      })
      console.log('✅ Comando enviado com sucesso:', response.data)
      alert(`Comando "${commandType}" enviado com sucesso! O dispositivo irá executar em até 5 segundos.`)
      fetchCommands()
    } catch (error: any) {
      console.error('❌ Erro ao enviar comando:', error)
      const errorMessage = error.response?.data?.message || error.message || 'Erro desconhecido'
      alert(`Erro ao enviar comando: ${errorMessage}`)
    }
  }

  const sendBulkCommand = async (commandType: string, parameters: any = {}) => {
    if (!selectedDevice) {
      alert('Selecione um dispositivo ou empresa')
      return
    }

    try {
      await api.post('/remote-commands/bulk', {
        device_uuids: [selectedDevice],
        command_type: commandType,
        parameters: parameters,
        executed_by: 'admin'
      })
      alert('Comando em massa enviado com sucesso!')
      fetchCommands()
    } catch (error: any) {
      alert(`Erro ao enviar comando: ${error.response?.data?.message || error.message}`)
    }
  }

  const getDeviceName = (uuid: string) => {
    return devices.find(d => d.uuid === uuid)?.nome || uuid
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800'
      case 'failed': return 'bg-red-100 text-red-800'
      case 'executing': return 'bg-yellow-100 text-yellow-800'
      case 'pending': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const CommandButton = ({ type, label, icon, params = {} }: any) => (
    <button
      onClick={() => sendCommand(type, params)}
      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-apple-md"
    >
      {icon} {label}
    </button>
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-lg text-gray-600">Carregando...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-semibold text-gray-900 mb-2">Controle Remoto</h2>
        <p className="text-gray-600">Controle total dos dispositivos Android remotamente</p>
      </div>

      {/* Seletor de Dispositivo */}
      <div className="bg-white rounded-xl shadow-apple-lg p-6 border border-gray-100">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Selecionar Dispositivo
        </label>
        <select
          value={selectedDevice}
          onChange={(e) => setSelectedDevice(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Todos os dispositivos</option>
          {devices.map((device) => (
            <option key={device.uuid} value={device.uuid}>
              {device.nome} ({device.uuid.substring(0, 8)}...)
            </option>
          ))}
        </select>
      </div>

      {/* Painel de Comandos */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Controle de Reprodução */}
        <div className="bg-white rounded-xl shadow-apple-lg p-6 border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">🎵 Reprodução</h3>
          <div className="space-y-2">
            <CommandButton type="play" label="Play" icon="▶️" />
            <CommandButton type="pause" label="Pause" icon="⏸️" />
            <CommandButton type="stop" label="Stop" icon="⏹️" />
          </div>
        </div>

        {/* Controle de Volume */}
        <div className="bg-white rounded-xl shadow-apple-lg p-6 border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">🔊 Volume</h3>
          <div className="space-y-3">
            <input
              type="range"
              min="0"
              max="100"
              value={commandParams.volume || 50}
              onChange={(e) => setCommandParams({ ...commandParams, volume: parseInt(e.target.value) })}
              className="w-full"
            />
            <div className="text-center text-sm text-gray-600">
              Volume: {commandParams.volume || 50}%
            </div>
            <button
              onClick={() => sendCommand('set_volume', { volume: commandParams.volume || 50 })}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Definir Volume
            </button>
          </div>
        </div>

        {/* Configuração WiFi */}
        <div className="bg-white rounded-xl shadow-apple-lg p-6 border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">📶 WiFi</h3>
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">SSID (Nome da Rede)</label>
              <input
                type="text"
                value={commandParams.wifi_ssid || ''}
                onChange={(e) => setCommandParams({ ...commandParams, wifi_ssid: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Ex: MinhaRedeWiFi"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Senha (Opcional)</label>
              <input
                type="password"
                value={commandParams.wifi_password || ''}
                onChange={(e) => setCommandParams({ ...commandParams, wifi_password: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Deixe vazio para rede aberta"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de Segurança</label>
              <select
                value={commandParams.wifi_security || 'WPA2'}
                onChange={(e) => setCommandParams({ ...commandParams, wifi_security: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="OPEN">Aberta (Sem senha)</option>
                <option value="WEP">WEP</option>
                <option value="WPA">WPA</option>
                <option value="WPA2">WPA2</option>
                <option value="WPA3">WPA3</option>
              </select>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => sendCommand('connect_wifi', {
                  ssid: commandParams.wifi_ssid,
                  password: commandParams.wifi_password || null,
                  security_type: commandParams.wifi_security || 'WPA2'
                })}
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                disabled={!commandParams.wifi_ssid}
              >
                Conectar
              </button>
              <button
                onClick={() => sendCommand('disconnect_wifi', {})}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Desconectar
              </button>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => sendCommand('list_wifi_networks', {})}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
              >
                📋 Listar Redes
              </button>
              <button
                onClick={() => sendCommand('get_wifi_info', {})}
                className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm"
              >
                ℹ️ Info WiFi
              </button>
            </div>
          </div>
        </div>

        {/* Controle de Sistema */}
        <div className="bg-white rounded-xl shadow-apple-lg p-6 border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">⚙️ Sistema</h3>
          <div className="space-y-2">
            <CommandButton type="restart" label="Reiniciar App" icon="🔄" />
            <CommandButton type="reboot" label="Reiniciar Dispositivo" icon="🔄" />
            <CommandButton type="force_stop" label="Forçar Parada" icon="🛑" />
            <CommandButton type="clear_cache" label="Limpar Cache" icon="🗑️" />
          </div>
        </div>

        {/* Controle de Streaming */}
        <div className="bg-white rounded-xl shadow-apple-lg p-6 border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">📻 Streaming</h3>
          <div className="space-y-3">
            <input
              type="text"
              placeholder="URL de streaming"
              value={commandParams.url || ''}
              onChange={(e) => setCommandParams({ ...commandParams, url: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={() => sendCommand('set_streaming_url', { url: commandParams.url })}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Atualizar URL
            </button>
          </div>
        </div>

        {/* Controle de Brilho */}
        <div className="bg-white rounded-xl shadow-apple-lg p-6 border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">💡 Brilho</h3>
          <div className="space-y-3">
            <input
              type="range"
              min="0"
              max="100"
              value={commandParams.brightness || 50}
              onChange={(e) => setCommandParams({ ...commandParams, brightness: parseInt(e.target.value) })}
              className="w-full"
            />
            <div className="text-center text-sm text-gray-600">
              Brilho: {commandParams.brightness || 50}%
            </div>
            <button
              onClick={() => sendCommand('set_brightness', { brightness: commandParams.brightness || 50 })}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Definir Brilho
            </button>
          </div>
        </div>

        {/* Controle de Rede */}
        <div className="bg-white rounded-xl shadow-apple-lg p-6 border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">📶 Rede</h3>
          <div className="space-y-2">
            <CommandButton type="enable_wifi" label="Habilitar WiFi" icon="📶" />
            <CommandButton type="disable_wifi" label="Desabilitar WiFi" icon="📵" />
            <CommandButton type="enable_bluetooth" label="Habilitar Bluetooth" icon="📶" />
            <CommandButton type="disable_bluetooth" label="Desabilitar Bluetooth" icon="📵" />
          </div>
        </div>
      </div>

      {/* Histórico de Comandos */}
      <div className="bg-white rounded-xl shadow-apple-lg border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Histórico de Comandos</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Dispositivo</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Comando</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Resultado</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Data</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {commands.slice(0, 20).map((command) => (
                <tr key={command.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {getDeviceName(command.device_uuid)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {command.command_type}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(command.status)}`}>
                      {command.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600 max-w-xs truncate">
                    {command.result || command.error_message || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(command.created_at).toLocaleString('pt-BR')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

