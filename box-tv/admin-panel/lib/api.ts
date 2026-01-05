import axios from 'axios'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api'

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Interceptor para tratamento de erros
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      // Erro da API
      throw new Error(
        error.response.data?.message || 'Erro ao comunicar com a API'
      )
    } else if (error.request) {
      // Erro de rede
      throw new Error('Erro de conexão. Verifique se o backend está rodando.')
    } else {
      // Outro erro
      throw new Error('Erro desconhecido')
    }
  }
)







