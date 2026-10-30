import { motion } from 'framer-motion'
import { AlertOctagon, ArrowLeft } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'

export default function AccessDenied({ requestedRole }) {
  const { user, role } = useAuth()

  // Normalize role for display
  const userRole = role || user?.role || user?.user_metadata?.role || 'Unknown'
  const displayRole = userRole.toString().replace(/_/g, ' ')

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="max-w-md w-full bg-white dark:bg-slate-900 rounded-3xl p-8 border border-slate-200 dark:border-slate-800 shadow-2xl shadow-rose-500/10 text-center relative overflow-hidden"
      >
        {/* Ambient background glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-32 bg-rose-500/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col items-center">
          <div className="w-20 h-20 rounded-2xl bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 flex items-center justify-center mb-6 shadow-sm border border-rose-100 dark:border-rose-900/50">
            <AlertOctagon className="w-10 h-10" />
          </div>

          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white mb-2">
            Access Restricted
          </h1>
          
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-6 leading-relaxed">
            You do not have the required permissions to view the <strong className="text-slate-700 dark:text-slate-300 capitalize">{requestedRole}</strong> portal.
          </p>

          <div className="w-full bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4 mb-8 border border-slate-100 dark:border-slate-800 text-left space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Your Role</span>
              <span className="text-xs font-bold text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-950/50 px-2.5 py-0.5 rounded border border-teal-200 dark:border-teal-800/50 capitalize">
                {displayRole}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Requested Area</span>
              <span className="text-xs font-bold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/50 px-2.5 py-0.5 rounded border border-rose-200 dark:border-rose-800/50 capitalize">
                {requestedRole} Portal
              </span>
            </div>
          </div>

          <Link
            to="/dashboard"
            className="w-full flex items-center justify-center gap-2 py-3.5 bg-slate-900 hover:bg-slate-800 text-white dark:bg-teal-600 dark:hover:bg-teal-500 rounded-xl font-bold text-sm transition shadow-lg shadow-slate-900/20"
          >
            <ArrowLeft className="w-4 h-4" /> Return to My Dashboard
          </Link>
        </div>
      </motion.div>
    </div>
  )
}
