import { useEffect } from 'react'
import { useAuthStore } from '../stores/authStore'

export default function AuthInitializer() {
  const { initializeAuth } = useAuthStore()

  useEffect(() => {
    initializeAuth()
  }, [initializeAuth])

  return null // This component doesn't render anything
}
