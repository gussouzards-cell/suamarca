'use client'

import { useState, useEffect } from 'react'
import { api } from '@/lib/api'

interface Schedule {
  id: string
  name: string
  description: string | null
  type: string
  device_uuid: string | null
  company_id: string | null
  value: string
  cron_expression: string
  enabled: boolean
  last_executed: string | null
  next_execution: string | null
  created_at: string
}

interface Company {
  id: string
  nome: string
}

export default function SchedulesManager() {
  const [schedules, setSchedules] = useState<Schedule[]>([])
  const [companies, setCompanies] = useState<Company[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingSchedule, setEditingSchedule] = useState<Schedule | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    type: 'volume',
    device_uuid: '',
    company_id: '',
    value: '',
    cron_expression: '0 8 * * *', // 8h todo dia
    enabled: true,
  })

  useEffect(() => {
    fetchData()
    const interval = setInterval(fetchData, 30000) // Atualizar a cada 30s
    return () => clearInterval(interval)
  }, [])

  const fetchData = async () => {
    try {
      const [schedulesRes, companiesRes] = await Promise.all([
        api.get('/schedules'),
        api.get('/companies'),
      ])
      setSchedules(schedulesRes.data)
      setCompanies(companiesRes.data)
      setLoading(false)
    } catch (error) {
      console.error('Erro ao buscar agendamentos:', error)
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const payload = {
        ...formData,
        device_uuid: formData.device_uuid || undefined,
        company_id: formData.company_id || undefined,
        description: formData.description || undefined,
      }

      if (editingSchedule) {
        await api.patch(`/schedules/${editingSchedule.id}`, payload)
      } else {
        await api.post('/schedules', payload)
      }

      resetForm()
      fetchData()
    } catch (error: any) {
      alert('Erro ao salvar agendamento: ' + (error.response?.data?.message || error.message))
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este agendamento?')) return

    try {
      await api.delete(`/schedules/${id}`)
      fetchData()
    } catch (error) {
      alert('Erro ao excluir agendamento')
    }
  }

  const handleToggle = async (id: string) => {
    try {
      await api.patch(`/schedules/${id}/toggle`)
      fetchData()
    } catch (error) {
      alert('Erro ao alterar status do agendamento')
    }
  }

  const handleEdit = (schedule: Schedule) => {
    setEditingSchedule(schedule)
    setFormData({
      name: schedule.name,
      description: schedule.description || '',
      type: schedule.type,
      device_uuid: schedule.device_uuid || '',
      company_id: schedule.company_id || '',
      value: schedule.value,
      cron_expression: schedule.cron_expression,
      enabled: schedule.enabled,
    })
    setShowForm(true)
  }

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      type: 'volume',
      device_uuid: '',
      company_id: '',
      value: '',
      cron_expression: '0 8 * * *',
      enabled: true,
    })
    setEditingSchedule(null)
    setShowForm(false)
  }

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'volume': return 'Volume'
      case 'stream_url': return 'URL de Stream'
      case 'status': return 'Status (Play/Pause)'
      case 'restart': return 'Reiniciar'
      default: return type
    }
  }

  const formatCron = (cron: string) => {
    const parts = cron.split(' ')
    if (parts.length >= 2) {
      const hour = parts[1] !== '*' ? parts[1].padStart(2, '0') : '*'
      const minute = parts[0] !== '*' ? parts[0].padStart(2, '0') : '*'
      return `${hour}:${minute}`
    }
    return cron
  }

  if (loading) {
    return <div className="text-center py-8 text-gray-500">Carregando agendamentos...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Agendamentos</h2>
          <p className="text-gray-600">Gerencie ações automáticas para seus dispositivos</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-medium"
        >
          {showForm ? '✕ Cancelar' : '+ Novo Agendamento'}
        </button>
      </div>

      {/* Formulário */}
      {showForm && (
        <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            {editingSchedule ? 'Editar Agendamento' : 'Novo Agendamento'}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nome *
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
                  Tipo de Ação *
                </label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                >
                  <option value="volume">Alterar Volume</option>
                  <option value="stream_url">Alterar URL de Stream</option>
                  <option value="status">Alterar Status (Play/Pause)</option>
                  <option value="restart">Reiniciar Dispositivo</option>
                </select>
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

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Valor *
                </label>
                <input
                  type="text"
                  required
                  value={formData.value}
                  onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                  placeholder={formData.type === 'volume' ? '0-100' : formData.type === 'status' ? 'active ou inactive' : 'URL ou valor'}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Horário (Cron) *
                </label>
                <input
                  type="text"
                  required
                  value={formData.cron_expression}
                  onChange={(e) => setFormData({ ...formData, cron_expression: e.target.value })}
                  placeholder="0 8 * * * (8h todo dia)"
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 font-mono"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Formato: minuto hora dia mês dia-semana (ex: 0 8 * * * = 8h todo dia)
                </p>
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
            </div>

            <div className="flex items-center gap-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.enabled}
                  onChange={(e) => setFormData({ ...formData, enabled: e.target.checked })}
                  className="rounded border-gray-300"
                />
                <span className="ml-2 text-sm text-gray-700">Habilitado</span>
              </label>
            </div>

            <div className="flex gap-2">
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-medium"
              >
                {editingSchedule ? 'Atualizar' : 'Criar'} Agendamento
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

      {/* Lista de Agendamentos */}
      {schedules.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <p className="text-gray-600">Nenhum agendamento criado ainda.</p>
          <p className="text-sm text-gray-500 mt-2">
            Clique em "Novo Agendamento" para criar seu primeiro agendamento.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {schedules.map((schedule) => (
            <div
              key={schedule.id}
              className="bg-white rounded-lg shadow-md p-6 border-l-4"
              style={{
                borderLeftColor: schedule.enabled ? '#10B981' : '#9CA3AF',
              }}
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {schedule.name}
                    </h3>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        schedule.enabled
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {schedule.enabled ? 'Ativo' : 'Inativo'}
                    </span>
                  </div>

                  {schedule.description && (
                    <p className="text-sm text-gray-600 mb-3">{schedule.description}</p>
                  )}

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500">Tipo:</span>
                      <p className="font-medium">{getTypeLabel(schedule.type)}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Valor:</span>
                      <p className="font-medium">{schedule.value}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Horário:</span>
                      <p className="font-medium font-mono">{formatCron(schedule.cron_expression)}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Próxima execução:</span>
                      <p className="font-medium">
                        {schedule.next_execution
                          ? new Date(schedule.next_execution).toLocaleString('pt-BR')
                          : '-'}
                      </p>
                    </div>
                  </div>

                  {schedule.last_executed && (
                    <p className="text-xs text-gray-500 mt-2">
                      Última execução: {new Date(schedule.last_executed).toLocaleString('pt-BR')}
                    </p>
                  )}
                </div>

                <div className="flex gap-2 ml-4">
                  <button
                    onClick={() => handleToggle(schedule.id)}
                    className={`px-3 py-1 text-sm rounded-md font-medium ${
                      schedule.enabled
                        ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
                        : 'bg-green-100 text-green-800 hover:bg-green-200'
                    }`}
                  >
                    {schedule.enabled ? '⏸️ Desativar' : '▶️ Ativar'}
                  </button>
                  <button
                    onClick={() => handleEdit(schedule)}
                    className="px-3 py-1 text-sm bg-blue-100 text-blue-800 rounded-md hover:bg-blue-200 font-medium"
                  >
                    ✏️ Editar
                  </button>
                  <button
                    onClick={() => handleDelete(schedule.id)}
                    className="px-3 py-1 text-sm bg-red-100 text-red-800 rounded-md hover:bg-red-200 font-medium"
                  >
                    🗑️ Excluir
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}






