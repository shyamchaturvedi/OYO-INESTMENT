'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { testNetworkConnectivity, logNetworkDiagnostics } from '@/lib/network-diagnostics'

interface User {
  id: string
  fullName: string
  email: string
  mobile: string
  referralCode: string
  role: string
  status: string
  walletBalance: number
  totalEarnings: number
  kycStatus: string
  lastLoginAt?: string
  createdAt: string
}

interface AuthContextType {
  user: User | null
  loading: boolean
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
  logout: () => Promise<void>
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  const checkAuth = async () => {
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        console.log('No token found in localStorage')
        setLoading(false)
        return
      }

      console.log('Token found, verifying...')
      const response = await fetch('/api/auth/verify', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const userData = await response.json()
        console.log('Token verified, setting user:', userData.user)
        setUser(userData.user)
      } else {
        console.log('Token verification failed, removing token')
        localStorage.removeItem('token')
      }
    } catch (error) {
      console.error('Auth check failed:', error)
      localStorage.removeItem('token')
    } finally {
      setLoading(false)
    }
  }

  const login = async (email: string, password: string) => {
    try {
      console.log('Attempting login for:', email)
      
      // Log network diagnostics
      logNetworkDiagnostics()
      
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })

      console.log('Login response status:', response.status)
      console.log('Login response ok:', response.ok)

      const data = await response.json()
      console.log('Login response data:', data)

      if (response.ok) {
        localStorage.setItem('token', data.token)
        console.log('Setting user state:', data.user)
        setUser(data.user)
        console.log('User state set successfully')
        return { success: true }
      } else {
        return { success: false, error: data.error || 'Login failed' }
      }
    } catch (error) {
      console.error('Login error in context:', error)
      
      // Run network diagnostics on error
      console.log('Running network diagnostics due to error...')
      const diagnostics = await testNetworkConnectivity()
      console.log('Network diagnostics results:', diagnostics)
      
      return { success: false, error: 'Network error. Please check your connection and try again.' }
    }
  }

  const logout = async () => {
    try {
      const token = localStorage.getItem('token')
      if (token) {
        await fetch('/api/auth/logout', { 
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })
      }
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      localStorage.removeItem('token')
      setUser(null)
    }
  }

  const refreshUser = async () => {
    await checkAuth()
  }

  useEffect(() => {
    checkAuth()
  }, [])

  // Monitor user state changes
  useEffect(() => {
    console.log('User state changed:', { user: user?.fullName, loading })
  }, [user, loading])

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      login,
      logout,
      refreshUser
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}