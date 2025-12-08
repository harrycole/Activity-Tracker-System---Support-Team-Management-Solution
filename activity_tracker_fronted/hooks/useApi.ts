import { useState, useCallback, useRef } from 'react'
import axiosInstance from '@/lib/axiosInstance'
import type { AxiosRequestConfig } from 'axios'

interface UseApiOptions {
  onSuccess?: (data: any) => void
  onError?: (error: any) => void
  showError?: boolean // Whether to automatically show errors
}

export function useApi() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<any>(null)
  const [data, setData] = useState<any>(null)
  const abortControllerRef = useRef<AbortController | null>(null)

  const callApi = useCallback(async (
    method: 'get' | 'post' | 'put' | 'delete' | 'patch',
    url: string,
    payload?: any,
    options?: UseApiOptions
  ) => {
    // Cancel previous request if it exists
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }

    // Create new AbortController for this request
    abortControllerRef.current = new AbortController()
    
    setLoading(true)
    setError(null)
    
    try {
      const config: AxiosRequestConfig = {
        signal: abortControllerRef.current.signal,
      }

      let response
      switch (method) {
        case 'get':
        case 'delete':
          response = await axiosInstance[method](url, config)
          break
        case 'post':
        case 'put':
        case 'patch':
          response = await axiosInstance[method](url, payload, config)
          break
      }

      setData(response.data)
      
      if (options?.onSuccess) {
        options.onSuccess(response.data)
      }
      
      return response.data
    } catch (err: any) {
      // Ignore abort errors
      if (err.name === 'AbortError' || err.code === 'ECONNABORTED') {
        return
      }
      
      setError(err.response?.data || err.message)
      
      if (options?.onError) {
        options.onError(err)
      }
      
      throw err
    } finally {
      setLoading(false)
      abortControllerRef.current = null
    }
  }, [])

  const get = useCallback((url: string, options?: UseApiOptions) => 
    callApi('get', url, undefined, options), [callApi])
  
  const post = useCallback((url: string, data: any, options?: UseApiOptions) => 
    callApi('post', url, data, options), [callApi])
  
  const put = useCallback((url: string, data: any, options?: UseApiOptions) => 
    callApi('put', url, data, options), [callApi])
  
  const del = useCallback((url: string, options?: UseApiOptions) => 
    callApi('delete', url, undefined, options), [callApi])

  // Cleanup function for component unmount
  const cancel = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }
  }, [])

  return {
    loading,
    error,
    data,
    get,
    post,
    put,
    delete: del,
    cancel,
    reset: () => {
      setError(null)
      setData(null)
    },
  }
}

// Optional: Create a simpler hook for common operations
export function useLazyApi<T = any>() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<any>(null)
  const [data, setData] = useState<T | null>(null)

  const execute = useCallback(async (
    method: 'get' | 'post' | 'put' | 'delete',
    url: string,
    body?: any
  ) => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await axiosInstance[method](url, body)
      setData(response.data)
      return response.data
    } catch (err: any) {
      setError(err.response?.data || err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  return {
    loading,
    error,
    data,
    execute,
    reset: () => {
      setError(null)
      setData(null)
    },
  }
}
