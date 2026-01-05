'use client'

import { useState, useEffect } from 'react'
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

interface CompanyManagerProps {
  onCompanyChange: () => void
}

export default function CompanyManager({ onCompanyChange }: CompanyManagerProps) {
  const [companies, setCompanies] = useState<Company[]>([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingCompany, setEditingCompany] = useState<Company | null>(null)
  const [formData, setFormData] = useState({
    nome: '',
    descricao: '',
    contato: '',
    endereco: '',
  })

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

  const handleOpenModal = (company?: Company) => {
    if (company) {
      setEditingCompany(company)
      setFormData({
        nome: company.nome,
        descricao: company.descricao || '',
        contato: company.contato || '',
        endereco: company.endereco || '',
      })
    } else {
      setEditingCompany(null)
      setFormData({
        nome: '',
        descricao: '',
        contato: '',
        endereco: '',
      })
    }
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setEditingCompany(null)
    setFormData({
      nome: '',
      descricao: '',
      contato: '',
      endereco: '',
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      if (editingCompany) {
        await api.put(`/companies/${editingCompany.id}`, formData)
      } else {
        await api.post('/companies', formData)
      }
      handleCloseModal()
      loadCompanies()
      onCompanyChange()
    } catch (err: any) {
      alert('Erro ao salvar empresa: ' + (err.response?.data?.message || err.message))
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir esta empresa?')) return

    try {
      await api.delete(`/companies/${id}`)
      loadCompanies()
      onCompanyChange()
    } catch (err: any) {
      alert('Erro ao excluir empresa: ' + (err.response?.data?.message || err.message))
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-gray-900">Empresas</h2>
        <button
          onClick={() => handleOpenModal()}
          className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
        >
          + Nova Empresa
        </button>
      </div>

      {companies.length === 0 ? (
        <p className="text-gray-500 text-center py-4">Nenhuma empresa cadastrada</p>
      ) : (
        <div className="space-y-2">
          {companies.map((company) => (
            <div
              key={company.id}
              className="flex justify-between items-center p-3 border border-gray-200 rounded hover:bg-gray-50"
            >
              <div>
                <div className="font-semibold text-gray-900">{company.nome}</div>
                {company.descricao && (
                  <div className="text-sm text-gray-600">{company.descricao}</div>
                )}
                <div className="text-xs text-gray-500 mt-1">
                  {company.devices?.length || 0} dispositivo(s)
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleOpenModal(company)}
                  className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
                >
                  Editar
                </button>
                <button
                  onClick={() => handleDelete(company.id)}
                  className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700"
                >
                  Excluir
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h3 className="text-xl font-bold mb-4">
              {editingCompany ? 'Editar Empresa' : 'Nova Empresa'}
            </h3>
            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nome *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.nome}
                    onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Descrição
                  </label>
                  <textarea
                    value={formData.descricao}
                    onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={3}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Contato
                  </label>
                  <input
                    type="text"
                    value={formData.contato}
                    onChange={(e) => setFormData({ ...formData, contato: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Endereço
                  </label>
                  <input
                    type="text"
                    value={formData.endereco}
                    onChange={(e) => setFormData({ ...formData, endereco: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div className="flex gap-2 mt-6">
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Salvar
                </button>
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="flex-1 px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}






