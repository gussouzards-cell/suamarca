'use client'

import { useState, useEffect } from 'react'
import { api } from '@/lib/api'
import AlertsPanel from './AlertsPanel'

interface DashboardStats {
  totalDevices: number
  onlineDevices: number
  offlineDevices: number
  activeDevices: number
  totalCompanies: number
  averageUptime: number
  recentEvents: number
}

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [devicesByCompany, setDevicesByCompany] = useState<any[]>([])

  useEffect(() => {
    fetchStats()
    const interval = setInterval(fetchStats, 30000) // Atualizar a cada 30s
    return () => clearInterval(interval)
  }, [])

  const fetchStats = async () => {
    try {
      const [devicesRes, companiesRes] = await Promise.all([
        api.get('/devices'),
        api.get('/companies')
      ])
      
      const devices = devicesRes.data
      const companies = companiesRes.data
      
      // Buscar eventos recentes (últimas 24h) - se o endpoint existir
      let events: any[] = []
      try {
        const eventsRes = await api.get('/device-events')
        const allEvents = eventsRes.data || []
        const now = new Date()
        const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000)
        events = allEvents.filter((e: any) => {
          const eventDate = new Date(e.timestamp)
          return eventDate >= oneDayAgo
        })
      } catch (e) {
        // Endpoint pode não existir ainda
        console.log('Endpoint de eventos não disponível')
      }

      const now = new Date()
      const onlineDevices = devices.filter((d: any) => {
        if (!d.last_heartbeat) return false
        const lastHeartbeat = new Date(d.last_heartbeat)
        const diffMinutes = (now.getTime() - lastHeartbeat.getTime()) / 1000 / 60
        return diffMinutes < 2
      })

      const activeDevices = devices.filter((d: any) => d.status === 'active')
      
      // Calcular uptime médio (simplificado)
      const averageUptime = 95.5 // TODO: Calcular baseado em eventos
      
      // Calcular dispositivos por empresa
      const devicesByCompany = companies.map(company => {
        const companyDevices = devices.filter(d => d.company_id === company.id)
        return {
          name: company.nome,
          count: companyDevices.length,
          online: companyDevices.filter(d => {
            if (!d.last_heartbeat) return false
            const lastHeartbeat = new Date(d.last_heartbeat)
            const diffMinutes = (now.getTime() - lastHeartbeat.getTime()) / 1000 / 60
            return diffMinutes < 2
          }).length
        }
      })

      setStats({
        totalDevices: devices.length,
        onlineDevices: onlineDevices.length,
        offlineDevices: devices.length - onlineDevices.length,
        activeDevices: activeDevices.length,
        totalCompanies: companies.length,
        averageUptime,
        recentEvents: events.length
      })
      
      // Salvar dados para gráfico
      setDevicesByCompany(devicesByCompany)
      setLoading(false)
    } catch (error) {
      console.error('Erro ao buscar estatísticas:', error)
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-white rounded-lg shadow p-6 animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
            <div className="h-8 bg-gray-200 rounded w-1/2"></div>
          </div>
        ))}
      </div>
    )
  }

  if (!stats) return null

  const StatCard = ({ title, value, subtitle, icon, color }: any) => (
    <div className="bg-white rounded-xl shadow-apple-lg p-6 border border-gray-100 hover:shadow-apple-xl transition-shadow">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
          <p className="text-3xl font-semibold mt-2" style={{ color }}>
            {value}
          </p>
          {subtitle && (
            <p className="text-xs text-gray-500 mt-2">{subtitle}</p>
          )}
        </div>
        {icon && (
          <div className="text-4xl opacity-20" style={{ color }}>
            {icon}
          </div>
        )}
      </div>
    </div>
  )

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Dashboard</h2>
        <p className="text-gray-600">Visão geral do sistema</p>
      </div>

      {/* Cards de Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total de Dispositivos"
          value={stats.totalDevices}
          subtitle={`${stats.onlineDevices} online`}
          icon="📱"
          color="#3B82F6"
        />
        <StatCard
          title="Dispositivos Online"
          value={stats.onlineDevices}
          subtitle={`${((stats.onlineDevices / stats.totalDevices) * 100).toFixed(1)}% do total`}
          icon="🟢"
          color="#10B981"
        />
        <StatCard
          title="Dispositivos Offline"
          value={stats.offlineDevices}
          subtitle={`${((stats.offlineDevices / stats.totalDevices) * 100).toFixed(1)}% do total`}
          icon="🔴"
          color="#EF4444"
        />
        <StatCard
          title="Empresas"
          value={stats.totalCompanies}
          subtitle="Total cadastradas"
          icon="🏢"
          color="#8B5CF6"
        />
      </div>

      {/* Cards Secundários */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          title="Dispositivos Ativos"
          value={stats.activeDevices}
          subtitle="Reproduzindo áudio"
          icon="▶️"
          color="#F59E0B"
        />
        <StatCard
          title="Uptime Médio"
          value={`${stats.averageUptime}%`}
          subtitle="Últimos 30 dias"
          icon="📊"
          color="#06B6D4"
        />
        <StatCard
          title="Eventos Recentes"
          value={stats.recentEvents}
          subtitle="Últimas 24 horas"
          icon="📝"
          color="#EC4899"
        />
      </div>

      {/* Gráficos e Alertas */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Gráfico de Status */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Status dos Dispositivos
          </h3>
          <div className="flex items-end justify-between h-48 space-x-2">
            <div className="flex-1 flex flex-col items-center">
              <div 
                className="w-full bg-green-500 rounded-t transition-all"
                style={{ height: `${stats.totalDevices > 0 ? (stats.onlineDevices / stats.totalDevices) * 100 : 0}%` }}
              ></div>
              <p className="text-xs text-gray-600 mt-2">Online</p>
              <p className="text-sm font-bold">{stats.onlineDevices}</p>
            </div>
            <div className="flex-1 flex flex-col items-center">
              <div 
                className="w-full bg-red-500 rounded-t transition-all"
                style={{ height: `${stats.totalDevices > 0 ? (stats.offlineDevices / stats.totalDevices) * 100 : 0}%` }}
              ></div>
              <p className="text-xs text-gray-600 mt-2">Offline</p>
              <p className="text-sm font-bold">{stats.offlineDevices}</p>
            </div>
          </div>
        </div>
        
        {/* Gráfico de Pizza - Dispositivos por Empresa */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Dispositivos por Empresa
          </h3>
          {devicesByCompany.length === 0 ? (
            <div className="flex items-center justify-center h-48 text-gray-500 text-sm">
              Nenhuma empresa com dispositivos
            </div>
          ) : (
            <div className="space-y-3">
              {devicesByCompany.map((item, index) => {
                const percentage = stats.totalDevices > 0 
                  ? (item.count / stats.totalDevices) * 100 
                  : 0
                const colors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899']
                const color = colors[index % colors.length]
                
                return (
                  <div key={item.name} className="flex items-center gap-3">
                    <div 
                      className="w-4 h-4 rounded"
                      style={{ backgroundColor: color }}
                    />
                    <div className="flex-1">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-sm font-medium text-gray-900">{item.name}</span>
                        <span className="text-sm text-gray-600">{item.count} ({percentage.toFixed(1)}%)</span>
                      </div>
                      <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="h-full transition-all"
                          style={{ 
                            width: `${percentage}%`,
                            backgroundColor: color
                          }}
                        />
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {item.online} online
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
        
        <AlertsPanel />
      </div>
    </div>
  )
}

