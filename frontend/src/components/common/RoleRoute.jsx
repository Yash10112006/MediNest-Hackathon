// frontend/src/components/common/RoleRoute.jsx

import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import AccessDenied from './AccessDenied'

function normalizeRole(userRole) {
  const role = (userRole || '').toString().toLowerCase().trim()

  if (role === 'patient' || role === 'user') {
    return 'patient'
  }

  if (role.includes('doctor')) {
    return 'doctor'
  }

  if (role.includes('asha')) {
    return 'asha'
  }

  if (
    role === 'hospital_admin' ||
    role === 'hospital admin' ||
    role === 'hospital' ||
    role === 'admin'
  ) {
    return 'hospital_admin'
  }

  return 'patient'
}

export default function RoleRoute({ allowedRoles }) {
  const { user, role, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">

        <div className="text-center">

          <div className="w-12 h-12 border-4 border-teal-600 border-t-transparent rounded-full animate-spin mx-auto" />

          <p className="mt-4 text-sm text-slate-500 dark:text-slate-400 font-medium">
            Verifying your access...
          </p>

        </div>

      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  const rawRole =
    role ||
    user?.role ||
    user?.user_metadata?.role ||
    user?.user_metadata?.user_role ||
    'patient'

  const currentRole = normalizeRole(rawRole)

  const normalizedAllowed = allowedRoles.map(normalizeRole)

  const hasAccess = normalizedAllowed.includes(currentRole)

  if (!hasAccess) {
    return (
      <AccessDenied
        requestedRole={allowedRoles[0]}
      />
    )
  }

  return <Outlet />
}