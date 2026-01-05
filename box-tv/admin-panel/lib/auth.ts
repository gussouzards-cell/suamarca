const AUTH_KEY = 'radio_indoor_auth'

export const login = () => {
  localStorage.setItem(AUTH_KEY, 'true')
}

export const logout = () => {
  localStorage.removeItem(AUTH_KEY)
}

export const checkAuth = (): boolean => {
  if (typeof window === 'undefined') return false
  return localStorage.getItem(AUTH_KEY) === 'true'
}







