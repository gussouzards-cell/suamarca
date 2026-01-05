'use client'

import { useState, useEffect } from 'react'
import CompanyList from '@/components/CompanyList'
import Dashboard from '@/components/Dashboard'
import SchedulesManager from '@/components/SchedulesManager'
import DeviceGroupsManager from '@/components/DeviceGroupsManager'
import FinancialDashboard from '@/components/FinancialDashboard'
import CreditsManager from '@/components/CreditsManager'
import RemoteControl from '@/components/RemoteControl'
import Login from '@/components/Login'
import { checkAuth, logout } from '@/lib/auth'

export default function Home() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'dashboard' | 'companies' | 'schedules' | 'groups' | 'financial' | 'credits' | 'remote'>('dashboard')

  useEffect(() => {
    const auth = checkAuth()
    setIsAuthenticated(auth)
    setLoading(false)
  }, [])

  const handleLogout = () => {
    logout()
    setIsAuthenticated(false)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Carregando...</div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Login onLogin={() => setIsAuthenticated(true)} />
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-8">
              <h1 className="text-2xl font-bold text-gray-900">
                📻 Rádio Indoor
              </h1>
              <nav className="flex space-x-4">
                <button
                  onClick={() => setActiveTab('dashboard')}
                  className={`px-4 py-2 rounded-md font-medium transition-colors ${
                    activeTab === 'dashboard'
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  📊 Dashboard
                </button>
                <button
                  onClick={() => setActiveTab('companies')}
                  className={`px-4 py-2 rounded-md font-medium transition-colors ${
                    activeTab === 'companies'
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  🏢 Empresas
                </button>
                <button
                  onClick={() => setActiveTab('schedules')}
                  className={`px-4 py-2 rounded-md font-medium transition-colors ${
                    activeTab === 'schedules'
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  ⏰ Agendamentos
                </button>
                <button
                  onClick={() => setActiveTab('groups')}
                  className={`px-4 py-2 rounded-md font-medium transition-colors ${
                    activeTab === 'groups'
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  👥 Grupos
                </button>
                <button
                  onClick={() => setActiveTab('financial')}
                  className={`px-4 py-2 rounded-md font-medium transition-colors ${
                    activeTab === 'financial'
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  💰 Financeiro
                </button>
                <button
                  onClick={() => setActiveTab('credits')}
                  className={`px-4 py-2 rounded-md font-medium transition-colors ${
                    activeTab === 'credits'
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  💳 Créditos
                </button>
                <button
                  onClick={() => setActiveTab('remote')}
                  className={`px-4 py-2 rounded-md font-medium transition-colors ${
                    activeTab === 'remote'
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  🎮 Controle Remoto
                </button>
              </nav>
            </div>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors font-medium"
            >
              Sair
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'dashboard' && <Dashboard />}
        {activeTab === 'companies' && <CompanyList />}
        {activeTab === 'schedules' && <SchedulesManager />}
        {activeTab === 'groups' && <DeviceGroupsManager />}
        {activeTab === 'financial' && <FinancialDashboard />}
        {activeTab === 'credits' && <CreditsManager />}
        {activeTab === 'remote' && <RemoteControl />}
      </main>
    </div>
  )
}


