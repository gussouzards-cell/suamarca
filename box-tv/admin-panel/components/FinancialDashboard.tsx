'use client'

import { useState, useEffect } from 'react'
import { api } from '@/lib/api'

interface MonthlyRevenue {
  month: number
  year: number
  total_revenue: number
  company_count: number
  companies: Array<{
    company_id: string
    company_name: string
    device_count: number
    monthly_amount: number
    plan_name: string
  }>
}

interface CompanyRevenue {
  company_id: string
  month: number | null
  year: number | null
  total_revenue: number
  transaction_count: number
  transactions: any[]
}

export default function FinancialDashboard() {
  const [monthlyRevenue, setMonthlyRevenue] = useState<MonthlyRevenue | null>(null)
  const [companyRevenues, setCompanyRevenues] = useState<CompanyRevenue[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1)
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())

  useEffect(() => {
    fetchFinancialData()
    const interval = setInterval(fetchFinancialData, 60000) // Atualizar a cada 1 minuto
    return () => clearInterval(interval)
  }, [selectedMonth, selectedYear])

  const fetchFinancialData = async () => {
    try {
      setLoading(true)
      
      // Buscar receita mensal total
      const revenueRes = await api.get('/subscriptions/revenue/monthly', {
        params: { month: selectedMonth, year: selectedYear }
      })
      setMonthlyRevenue(revenueRes.data)

      // Buscar receita por empresa
      const companiesRes = await api.get('/companies')
      const companies = companiesRes.data

      const revenues = await Promise.all(
        companies.map(async (company: any) => {
          try {
            const revenueRes = await api.get(`/credits/revenue/${company.id}`, {
              params: { month: selectedMonth, year: selectedYear }
            })
            return revenueRes.data
          } catch (e) {
            return {
              company_id: company.id,
              total_revenue: 0,
              transaction_count: 0,
              transactions: []
            }
          }
        })
      )

      setCompanyRevenues(revenues)
    } catch (error) {
      console.error('Erro ao buscar dados financeiros:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value)
  }

  if (loading && !monthlyRevenue) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-lg text-gray-600">Carregando dados financeiros...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-semibold text-gray-900 mb-2">Dashboard Financeiro</h2>
          <p className="text-gray-600">Receitas e análise financeira do sistema</p>
        </div>
        <div className="flex gap-4">
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            {Array.from({ length: 12 }, (_, i) => i + 1).map((month) => (
              <option key={month} value={month}>
                {new Date(2000, month - 1).toLocaleString('pt-BR', { month: 'long' })}
              </option>
            ))}
          </select>
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(parseInt(e.target.value))}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i).map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Cards de Receita */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-600">Receita Total Mensal</h3>
            <div className="text-2xl">💰</div>
          </div>
          <p className="text-3xl font-bold text-green-600 mb-2">
            {monthlyRevenue ? formatCurrency(monthlyRevenue.total_revenue) : 'R$ 0,00'}
          </p>
          <p className="text-sm text-gray-500">
            {monthlyRevenue?.company_count || 0} empresas ativas
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-600">Média por Empresa</h3>
            <div className="text-2xl">📊</div>
          </div>
          <p className="text-3xl font-bold text-blue-600 mb-2">
            {monthlyRevenue && monthlyRevenue.company_count > 0
              ? formatCurrency(monthlyRevenue.total_revenue / monthlyRevenue.company_count)
              : 'R$ 0,00'}
          </p>
          <p className="text-sm text-gray-500">Valor médio mensal</p>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-600">Total de Dispositivos</h3>
            <div className="text-2xl">📱</div>
          </div>
          <p className="text-3xl font-bold text-purple-600 mb-2">
            {monthlyRevenue?.companies.reduce((sum, c) => sum + c.device_count, 0) || 0}
          </p>
          <p className="text-sm text-gray-500">Boxes ativas no sistema</p>
        </div>
      </div>

      {/* Tabela de Receita por Empresa */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Receita por Empresa</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Empresa
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Plano
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Dispositivos
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Receita Mensal
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Receita Total (Créditos)
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {monthlyRevenue?.companies.map((company) => {
                const creditRevenue = companyRevenues.find(
                  (r) => r.company_id === company.company_id
                )?.total_revenue || 0
                const totalRevenue = company.monthly_amount + creditRevenue

                return (
                  <tr key={company.company_id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {company.company_name}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-600">{company.plan_name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{company.device_count}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-semibold text-green-600">
                        {formatCurrency(company.monthly_amount)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-semibold text-blue-600">
                        {formatCurrency(creditRevenue)}
                      </div>
                    </td>
                  </tr>
                )
              })}
              {(!monthlyRevenue || monthlyRevenue.companies.length === 0) && (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                    Nenhuma receita encontrada para o período selecionado
                  </td>
                </tr>
              )}
            </tbody>
            {monthlyRevenue && monthlyRevenue.companies.length > 0 && (
              <tfoot className="bg-gray-50">
                <tr>
                  <td colSpan={3} className="px-6 py-4 text-sm font-semibold text-gray-900">
                    Total
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-green-600">
                    {formatCurrency(
                      monthlyRevenue.companies.reduce((sum, c) => sum + c.monthly_amount, 0)
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-blue-600">
                    {formatCurrency(
                      companyRevenues.reduce((sum, r) => sum + r.total_revenue, 0)
                    )}
                  </td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </div>
    </div>
  )
}






