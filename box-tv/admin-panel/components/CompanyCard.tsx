'use client'

import { useRouter } from 'next/navigation'

interface Device {
  id: string
  uuid: string
  nome: string | null
  status: string
  last_heartbeat: string | null
}

interface Company {
  id: string
  nome: string
  descricao: string | null
  contato: string | null
  endereco: string | null
  devices: Device[]
  created_at: string
}

interface CompanyCardProps {
  company: Company
  onCompanyChange?: () => void
}

export default function CompanyCard({ company, onCompanyChange }: CompanyCardProps) {
  const router = useRouter()

  const devices = company.devices || []
  
  const onlineCount = devices.filter((device) => {
    if (!device.last_heartbeat) return false
    const lastHeartbeat = new Date(device.last_heartbeat)
    const now = new Date()
    const diffMinutes = (now.getTime() - lastHeartbeat.getTime()) / 1000 / 60
    return diffMinutes < 2
  }).length

  const activeCount = devices.filter((d) => d.status === 'active').length

  const handleClick = () => {
    router.push(`/empresas/${company.id}`)
  }

  return (
    <div
      className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden cursor-pointer hover:shadow-lg transition-all"
      onClick={handleClick}
    >
      <div className="p-6">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h3 className="text-xl font-bold text-gray-900">{company.nome}</h3>
              <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-semibold">
                {devices.length} dispositivo(s)
              </span>
            </div>
            
            {company.descricao && (
              <p className="text-sm text-gray-600 mb-2 line-clamp-2">{company.descricao}</p>
            )}

            <div className="flex gap-4 text-sm text-gray-600 mb-2">
              <div className="flex items-center gap-1">
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                <span>{onlineCount} online</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                <span>{activeCount} ativo(s)</span>
              </div>
            </div>

            {company.contato && (
              <p className="text-xs text-gray-500">📞 {company.contato}</p>
            )}
          </div>

          <div className="flex items-center gap-2 ml-4">
            <span className="text-sm text-gray-500">Ver detalhes</span>
            <svg
              className="w-5 h-5 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </div>
        </div>
      </div>
    </div>
  )
}

