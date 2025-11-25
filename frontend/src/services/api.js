import axios from 'axios'

const API_BASE_URL = 'http://localhost:8000/api/v1'

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // Important for cookies
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor to add token to headers
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor for token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true

      try {
        const refreshToken = localStorage.getItem('refreshToken')
        if (refreshToken) {
          const response = await axios.post(
            `${API_BASE_URL}/users/refresh-token`,
            { refreshToken },
            { withCredentials: true }
          )

          const { accessToken, refreshToken: newRefreshToken } = response.data.data
          localStorage.setItem('accessToken', accessToken)
          localStorage.setItem('refreshToken', newRefreshToken)

          originalRequest.headers.Authorization = `Bearer ${accessToken}`
          return api(originalRequest)
        }
      } catch (refreshError) {
        localStorage.removeItem('accessToken')
        localStorage.removeItem('refreshToken')
        window.location.href = '/login'
        return Promise.reject(refreshError)
      }
    }

    return Promise.reject(error)
  }
)

export const registerUser = async (formData) => {
  const response = await api.post('/users/register', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  })
  return response.data
}

export const loginUser = async (credentials) => {
  const response = await api.post('/users/login', credentials)
  return response.data
}

export const logoutUser = async () => {
  const response = await api.post('/users/logout')
  return response.data
}

export const refreshToken = async (refreshTokenValue) => {
  const response = await api.post('/users/refresh-token', {
    refreshToken: refreshTokenValue,
  })
  return response.data
}

// Transaction APIs
export const getTransactions = async (params = {}) => {
  const response = await api.get('/transactions', { params })
  return response.data
}

export const getTransaction = async (id) => {
  const response = await api.get(`/transactions/${id}`)
  return response.data
}

export const createTransaction = async (data) => {
  const response = await api.post('/transactions', data)
  return response.data
}

export const updateTransaction = async (id, data) => {
  const response = await api.put(`/transactions/${id}`, data)
  return response.data
}

export const deleteTransaction = async (id) => {
  const response = await api.delete(`/transactions/${id}`)
  return response.data
}

export const getTransactionStats = async (params = {}) => {
  const response = await api.get('/transactions/stats', { params })
  return response.data
}

// Budget APIs
export const getBudgets = async (params = {}) => {
  const response = await api.get('/budgets', { params })
  return response.data
}

export const getBudget = async (id) => {
  const response = await api.get(`/budgets/${id}`)
  return response.data
}

export const createBudget = async (data) => {
  const response = await api.post('/budgets', data)
  return response.data
}

export const updateBudget = async (id, data) => {
  const response = await api.put(`/budgets/${id}`, data)
  return response.data
}

export const deleteBudget = async (id) => {
  const response = await api.delete(`/budgets/${id}`)
  return response.data
}

// Shared Account APIs
export const getSharedAccounts = async () => {
  const response = await api.get('/shared-accounts')
  return response.data
}

export const getSharedAccount = async (id) => {
  const response = await api.get(`/shared-accounts/${id}`)
  return response.data
}

export const createSharedAccount = async (data) => {
  const response = await api.post('/shared-accounts', data)
  return response.data
}

export const updateSharedAccount = async (id, data) => {
  const response = await api.put(`/shared-accounts/${id}`, data)
  return response.data
}

export const deleteSharedAccount = async (id) => {
  const response = await api.delete(`/shared-accounts/${id}`)
  return response.data
}

export const addMemberToSharedAccount = async (id, userId) => {
  const response = await api.post(`/shared-accounts/${id}/members`, { userId })
  return response.data
}

export const removeMemberFromSharedAccount = async (id, userId) => {
  const response = await api.delete(`/shared-accounts/${id}/members`, { data: { userId } })
  return response.data
}

export default api
