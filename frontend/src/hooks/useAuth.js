// frontend/src/hooks/useAuth.js

import { useState, useEffect } from 'react'

const API_URL =
  import.meta.env.VITE_API_URL || 'http://localhost:8000'

export function useAuth() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [role, setRole] = useState(null)

  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem('access_token')
    const userData = localStorage.getItem('user')

    if (token && userData) {
      try {
        const parsed = JSON.parse(userData)

        // Normalize user's real name
        const normalizedUser = {
          ...parsed,
          name:
            parsed.name ||
            parsed.full_name ||
            parsed.fullName ||
            parsed.username ||
            parsed.user_metadata?.name ||
            parsed.user_metadata?.full_name ||
            ''
        }

        setUser(normalizedUser)
        setRole(normalizedUser.role)
      } catch (e) {
        localStorage.removeItem('access_token')
        localStorage.removeItem('user')
      }
    }

    setLoading(false)
  }, [])

  const login = async (email, password) => {
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

      /*
       * Get the real name returned by the backend.
       */
      const userName =
        data.name ||
        data.full_name ||
        data.fullName ||
        data.username ||
        data.user_metadata?.name ||
        data.user_metadata?.full_name ||
        ''

      const userData = {
        ...data,
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