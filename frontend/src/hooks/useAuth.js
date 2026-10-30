// frontend/src/hooks/useAuth.js

import { useState } from 'react'

const API_URL =
  import.meta.env.VITE_API_URL || 'http://localhost:8000'

function getInitialUser() {
  const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null
  const userData = typeof window !== 'undefined' ? localStorage.getItem('user') : null

  if (token && userData) {
    try {
      const parsed = JSON.parse(userData)
      const userId = parsed.user_id || parsed.id || parsed.sub || ''

      return {
        ...parsed,
        id: userId,
        user_id: userId,
        name:
          parsed.name ||
          parsed.full_name ||
          parsed.fullName ||
          parsed.username ||
          parsed.user_metadata?.name ||
          parsed.user_metadata?.full_name ||
          ''
      }
    } catch {
      localStorage.removeItem('access_token')
      localStorage.removeItem('user')
    }
  }
  return null
}

export function useAuth() {
  const [user, setUser] = useState(getInitialUser)
  const [role, setRole] = useState(() => (user ? user.role : null))
  const [loading, setLoading] = useState(false)

  const login = async (email, password) => {
    setLoading(true)
    try {
      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.detail || 'Login failed')
      }

      const userName =
        data.name ||
        data.full_name ||
        data.fullName ||
        data.username ||
        data.user_metadata?.name ||
        data.user_metadata?.full_name ||
        ''

      const userId = data.user_id || data.id || data.sub || ''

      const userData = {
        ...data,
        id: userId,
        user_id: userId,
        name: userName
      }

      localStorage.setItem(
        'access_token',
        data.access_token
      )

      localStorage.setItem(
        'user',
        JSON.stringify(userData)
      )

      setUser(userData)
      setRole(data.role)

      return {
        data: userData,
        error: null
      }
    } catch (error) {
      return {
        data: null,
        error
      }
    } finally {
      setLoading(false)
    }
  }

  const logout = async () => {
    localStorage.removeItem('access_token')
    localStorage.removeItem('user')

    setUser(null)
    setRole(null)

    return {
      error: null
    }
  }

  return {
    user,
    role,
    loading,
    login,
    logout
  }
}
