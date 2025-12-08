import axios from 'axios'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

// An axios instance with base config
const axiosInstance = axios.create({
  baseURL: `${API_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  timeout: 10000, // 10 second timeout
})

// Request interceptor to add auth token
axiosInstance.interceptors.request.use(
  (config) => {
    // Only run this in browser environment
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('auth_token')
      
      if (token) {
        config.headers.Authorization = `Bearer ${token}`
      }
    }
    
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor for error handling
axiosInstance.interceptors.response.use(
  (response) => {
    return response
  },
  (error) => {
    // Handle network errors
    if (!error.response) {
      console.error('Network error:', error.message)
      throw new Error('Network error. Please check your connection.')
    }

    // Handle 401 Unauthorized errors
    if (error.response?.status === 401) {
      // Clear auth data
      if (typeof window !== 'undefined') {
        localStorage.removeItem('auth_token')
        localStorage.removeItem('user')
        // Dispatch event for auth context to listen to
        window.dispatchEvent(new Event('unauthorized'))
      }
    }
    
    // Handle 422 Validation errors
    if (error.response?.status === 422) {
      // Laravel validation errors are returned as JSON
      return Promise.reject(error)
    }
    
    // Handle 500 server errors
    if (error.response?.status >= 500) {
      console.error('Server error:', error.response.data)
      throw new Error('Server error. Please try again later.')
    }
    
    // For other errors, pass along the error
    return Promise.reject(error)
  }
)

export default axiosInstance
