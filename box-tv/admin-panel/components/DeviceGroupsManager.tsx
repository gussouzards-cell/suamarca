'use client'

import { useState, useEffect } from 'react'
import { api } from '@/lib/api'

interface Device {
  id: string
  uuid: string
  nome: string | null
}

interface DeviceGroup {
  id: string
  name: string
  description: string | null
  company_id: string | null
  devices: Device[]
  created_at: string
}

interface Company {
  id: string
  nome: string
}

export default function DeviceGroupsManager() {
  const [groups, setGroups] = useState<DeviceGroup[]>([])
  const [devices, setDevices] = useState<Device[]>([])
  const [companies, setCompanies] = useState<Company[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingGroup, setEditingGroup] = useState<DeviceGroup | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    company_id: '',
    device_ids: [] as string[],
  })

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [groupsRes, devicesRes, companiesRes] = await Promise.all([
        api.get('/device-groups'),
        api.get('/devices'),
        api.get('/companies'),
      ])
      setGroups(groupsRes.data)
      setDevices(devicesRes.data)
      setCompanies(companiesRes.data)
      setLoading(false)
    } catch (error) {
      console.error('Erro ao buscar grupos:', error)
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const payload = {
        ...formData,
        company_id: formData.company_id || undefined,
        description: formData.description || undefined,
      }

      if (editingGroup) {
        await api.patch(`/device-groups/${editingGroup.id}`, payload)
      } else {
        await api.post('/device-groups', payload)
      }

      resetForm()
      fetchData()
    } catch (error: any) {
      alert('Erro ao salvar grupo: ' + (error.response?.data?.message || error.message))
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este grupo?')) return

    try {
      await api.delete(`/device-groups/${id}`)
      fetchData()
    } catch (error) {
      alert('Erro ao excluir grupo')
    }
  }

  const handleApplyAction = async (groupId: string, action: string, value: string) => {
    if (!confirm(`Aplicar "${action}" = "${value}" em todos os dispositivos deste grupo?`)) return

    try {
      await api.post(`/device-groups/${groupId}/apply-action`, { action, value })
      alert('Ação aplicada com sucesso!')
    } catch (error) {
      alert('Erro ao aplicar ação')
    }
  }

  const handleEdit = (group: DeviceGroup) => {
    setEditingGroup(group)
    setFormData({
      name: group.name,
      description: group.description || '',
      company_id: group.company_id || '',
      device_ids: group.devices.map(d => d.id),
    })
    setShowForm(true)
  }

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      company_id: '',
      device_ids: [],
    })
    setEditingGroup(null)
    setShowForm(false)
  }

  const toggleDeviceSelection = (deviceId: string) => {
    setFormData(prev => ({
      ...prev,
      device_ids: prev.device_ids.includes(deviceId)
        ? prev.device_ids.filter(id => id !== deviceId)
        : [...prev.device_ids, deviceId]
    }))
  }

  if (loading) {
    return <div className="text-center py-8 text-gray-500">Carregando grupos...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Grupos de Dispositivos</h2>
          <p className="text-gray-600">Organize dispositivos em grupos para ações em massa</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-medium"
        >
          {showForm ? '✕ Cancelar' : '+ Novo Grupo'}
        </button>
      </div>

      {/* Formulário */}
      {showForm && (
        <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            {editingGroup ? 'Editar Grupo' : 'Novo Grupo'}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nome do Grupo *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Empresa (opcional)
                </label>
                <select
                  value={formData.company_id}
                  onChange={(e) => setFormData({ ...formData, company_id: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Todas as empresas</option>
                  {companies.map((company) => (
                    <option key={company.id} value={company.id}>
                      {company.nome}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Descrição
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                rows={3}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Dispositivos ({formData.device_ids.length} selecionado{formData.device_ids.length !== 1 ? 's' : ''})
              </label>
              <div className="border border-gray-300 rounded-md p-4 max-h-64 overflow-y-auto">
                {devices.length === 0 ? (
                  <p className="text-gray-500 text-sm">Nenhum dispositivo disponível</p>
                ) : (
                  <div className="space-y-2">
                    {devices.map((device) => (
                      <label key={device.id} className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-2 rounded">
                        <input
                          type="checkbox"
                          checked={formData.device_ids.includes(device.id)}
                          onChange={() => toggleDeviceSelection(device.id)}
                          className="rounded border-gray-300"
                        />
                        <span className="text-sm text-gray-900">
                          {device.nome || device.uuid}
                        </span>
                      </label>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="flex gap-2">
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-medium"
              >
                {editingGroup ? 'Atualizar' : 'Criar'} Grupo
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 font-medium"
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Lista de Grupos */}
      {groups.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <p className="text-gray-600">Nenhum grupo criado ainda.</p>
          <p className="text-sm text-gray-500 mt-2">
            Clique em "Novo Grupo" para criar seu primeiro grupo.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {groups.map((group) => (
            <div
              key={group.id}
              className="bg-white rounded-lg shadow-md p-6 border-l-4 border-blue-500"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">
                    {group.name}
                  </h3>
                  {group.description && (
                    <p className="text-sm text-gray-600 mb-2">{group.description}</p>
                  )}
                  <p className="text-sm text-gray-500">
                    {group.devices?.length || 0} dispositivo{(group.devices?.length || 0) !== 1 ? 's' : ''}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(group)}
                    className="px-3 py-1 text-sm bg-blue-100 text-blue-800 rounded-md hover:bg-blue-200 font-medium"
                  >
                    ✏️
                  </button>
                  <button
                    onClick={() => handleDelete(group.id)}
                    className="px-3 py-1 text-sm bg-red-100 text-red-800 rounded-md hover:bg-red-200 font-medium"
                  >
                    🗑️
                  </button>
                </div>
              </div>

              {/* Ações Rápidas */}
              <div className="mt-4 pt-4 border-t border-gray-200">
                <p className="text-xs font-medium text-gray-700 mb-2">Ações Rápidas:</p>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => handleApplyAction(group.id, 'status', 'active')}
                    className="px-3 py-1 text-xs bg-green-100 text-green-800 rounded hover:bg-green-200 font-medium"
                  >
                    ▶️ Play
                  </button>
                  <button
                    onClick={() => handleApplyAction(group.id, 'status', 'inactive')}
                    className="px-3 py-1 text-xs bg-yellow-100 text-yellow-800 rounded hover:bg-yellow-200 font-medium"
                  >
                    ⏸️ Pause
                  </button>
                  <button
                    onClick={() => {
                      const volume = prompt('Digite o volume (0-100):')
                      if (volume) handleApplyAction(group.id, 'volume', volume)
                    }}
                    className="px-3 py-1 text-xs bg-blue-100 text-blue-800 rounded hover:bg-blue-200 font-medium"
                  >
                    🔊 Volume
                  </button>
                </div>
              </div>

              {/* Lista de Dispositivos */}
              {group.devices && group.devices.length > 0 && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <p className="text-xs font-medium text-gray-700 mb-2">Dispositivos:</p>
                  <div className="space-y-1 max-h-32 overflow-y-auto">
                    {group.devices.map((device) => (
                      <div key={device.id} className="text-xs text-gray-600">
                        • {device.nome || device.uuid}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}






