import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import api from '../lib/axios'
import toast from 'react-hot-toast'

export interface User {
  id: string
  email: string
  firstName: string
  lastName: string
  phone?: string
  role: 'CLIENT' | 'ADMIN' | 'MANAGER'
  createdAt: string
}

interface AuthState {
  user: User | null
  token: string | null
  isLoading: boolean
  login: (email: string, password: string) => Promise<boolean>
  register: (data: RegisterData) => Promise<boolean>
  logout: () => void
  initializeAuth: () => void
  updateProfile: (data: UpdateProfileData) => Promise<boolean>
}

interface RegisterData {
  email: string
  password: string
  firstName: string
  lastName: string
  phone?: string
}

interface UpdateProfileData {
  firstName?: string
  lastName?: string
  phone?: string
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isLoading: false,

      login: async (email: string, password: string) => {
        set({ isLoading: true })
        try {
          const response = await api.post('/api/auth/login', { email, password })
          const { user, token } = response.data
          
          set({ user, token, isLoading: false })
          
          toast.success('Login successful!')
          return true
        } catch (error: any) {
          set({ isLoading: false })
          const message = error.response?.data?.error?.message || 'Login failed'
          toast.error(message)
          return false
        }
      },

      register: async (data: RegisterData) => {
        set({ isLoading: true })
        try {
          const response = await api.post('/api/auth/register', data)
          const { user, token } = response.data
          
          set({ user, token, isLoading: false })
          
          toast.success('Registration successful!')
          return true
        } catch (error: any) {
          set({ isLoading: false })
          const message = error.response?.data?.error?.message || 'Registration failed'
          toast.error(message)
          return false
        }
      },

      logout: () => {
        set({ user: null, token: null })
        toast.success('Logged out successfully')
      },

      updateProfile: async (data: UpdateProfileData) => {
        try {
          const response = await api.put('/api/auth/profile', data)
          const { user } = response.data
          
          set({ user })
          toast.success('Профіль успішно оновлено!')
          return true
        } catch (error: any) {
          const message = error.response?.data?.error?.message || 'Failed to update profile'
          toast.error(message)
          return false
        }
      },

      initializeAuth: async () => {
        const { token } = get()
        if (!token) return

        try {
          // Verify token
          const response = await api.get('/api/auth/verify')
          const { user } = response.data
          
          set({ user })
        } catch (error) {
          // Token is invalid, clear auth state
          set({ user: null, token: null })
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ token: state.token }),
    }
  )
)
