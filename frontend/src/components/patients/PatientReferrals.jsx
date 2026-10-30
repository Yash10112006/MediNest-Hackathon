// frontend/src/components/patients/PatientReferrals.jsx

import { useMemo } from 'react'
import { motion } from 'framer-motion'
import {
  GitBranch,
  ArrowRight,
  AlertTriangle,
  CheckCircle,
  Clock,
  User,
  MapPin,
  FileText
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { useMockState, getPatientForUser } from '../../services/mockState'
import { useAuth } from '../../hooks/useAuth'

const urgencyConfig = {
  High: { color: 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800', dot: 'bg-rose-500', icon: AlertTriangle },
  Medium: { color: 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800', dot: 'bg-amber-500', icon: Clock },
  Low: { color: 'bg-teal-50 dark:bg-teal-950/40 text-teal-700 dark:text-teal-300 border-teal-200 dark:border-teal-800', dot: 'bg-teal-500', icon: CheckCircle }
}

const statusConfig = {
  Accepted: { color: 'text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-950/40 border-teal-200 dark:border-teal-800', label: 'Accepted' },
  Pending: { color: 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800', label: 'Pending' },
  Completed: { color: 'text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700', label: 'Completed' },
  Rejected: { color: 'text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800', label: 'Rejected' }
}

function timeAgo(isoStr) {
  if (!isoStr) return '—'
  const diff = Date.now() - new Date(isoStr).getTime()
  const days = Math.floor(diff / 86400000)
  if (days === 0) return 'Today'
  if (days === 1) return 'Yesterday'
  return `${days} days ago`
}

export default function PatientReferrals() {
  const { state } = useMockState()
  const { user } = useAuth()

  const patient = useMemo(() => {
    if (!user) return null
    return getPatientForUser(user)
  }, [user, state.patients])

  const patientId = patient?.id || user?.id

  const referrals = useMemo(() => {
    if (!patientId) return []
    return (state.referrals || []).filter(
      r =>
        r.patientId === patientId ||
        r.patientId === user?.id ||
        (user?.email && r.patientEmail === user.email)
    )
  }, [state.referrals, patientId, user])

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.1 } }
  }
  const itemVariants = {
    hidden: { opacity: 0, y: 24 },
    visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 260, damping: 22 } }
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-8 px-6 transition-colors">
      <div className="max-w-4xl mx-auto">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8"
        >
          <div>
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-bold uppercase tracking-wider border border-emerald-500/20">
              Continuity of Care
            </span>
            <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white mt-1 tracking-tight">
              My Referrals
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Track referrals from your ASHA worker or primary health center to higher facilities
            </p>
          </div>
          <Link
            to="/patient/dashboard"
            className="self-start sm:self-center text-sm text-slate-500 dark:text-slate-400 hover:text-teal-600 transition"
          >
            ← Back to Dashboard
          </Link>
        </motion.div>

        {/* Flow Explanation */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm mb-8"
        >
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4">How MediNest Referral Tracking Works</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
            <div className="flex flex-col items-center p-3 rounded-2xl bg-slate-50 dark:bg-slate-800">
              <span className="w-8 h-8 rounded-full bg-teal-100 dark:bg-teal-900/50 text-teal-700 dark:text-teal-300 font-bold text-sm flex items-center justify-center mb-2">1</span>
              <p className="text-xs font-bold text-slate-800 dark:text-slate-200">ASHA / PHC Creates</p>
              <p className="text-[11px] text-slate-400 mt-0.5">Identifies need & creates digital referral</p>
            </div>
            <div className="flex flex-col items-center p-3 rounded-2xl bg-slate-50 dark:bg-slate-800">
              <span className="w-8 h-8 rounded-full bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300 font-bold text-sm flex items-center justify-center mb-2">2</span>
              <p className="text-xs font-bold text-slate-800 dark:text-slate-200">CHC / Hospital Accepts</p>
              <p className="text-[11px] text-slate-400 mt-0.5">Specialist reviews & accepts case</p>
            </div>
            <div className="flex flex-col items-center p-3 rounded-2xl bg-slate-50 dark:bg-slate-800">
              <span className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300 font-bold text-sm flex items-center justify-center mb-2">3</span>
              <p className="text-xs font-bold text-slate-800 dark:text-slate-200">Consultation Done</p>
              <p className="text-[11px] text-slate-400 mt-0.5">Care notes synced to ABDM record</p>
            </div>
          </div>
        </motion.div>

        {/* Referrals List */}
        {referrals.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-12 text-center border border-slate-200 dark:border-slate-800">
            <GitBranch className="w-12 h-12 text-slate-300 dark:text-slate-700 mx-auto mb-3" />
            <p className="text-slate-500 dark:text-slate-400 font-medium">No referrals on record</p>
            <p className="text-xs text-slate-400 mt-1">If your ASHA worker or doctor creates a referral, it will appear here</p>
          </div>
        ) : (
          <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-5">
            {referrals.map(ref => {
              const urg = urgencyConfig[ref.urgency] || urgencyConfig.Medium
              const stat = statusConfig[ref.status] || statusConfig.Pending

              return (
                <motion.div
                  key={ref.id}
                  variants={itemVariants}
                  whileHover={{ y: -3 }}
                  className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm transition-all duration-300"
                >
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                    <div>
                      {/* Badges */}
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold border ${urg.color}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${urg.dot}`} />
                          {ref.urgency} Urgency
                        </span>
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${stat.color}`}>
                          {stat.label}
                        </span>
                        <span className="text-xs text-slate-400 font-mono">{ref.id}</span>
                        <span className="text-xs text-slate-400">• {timeAgo(ref.createdAt)}</span>
                      </div>

                      {/* Specialist */}
                      <h3 className="text-xl font-bold text-slate-900 dark:text-white mt-1">
                        {ref.target}
                      </h3>
                      {ref.targetFacility && (
                        <p className="text-xs text-teal-600 dark:text-teal-400 font-semibold mt-0.5 flex items-center gap-1">
                          <MapPin className="w-3 h-3" /> {ref.targetFacility}
                        </p>
                      )}

                      {/* Reason */}
                      <div className="mt-3 bg-slate-50 dark:bg-slate-800/60 rounded-2xl p-3.5 border border-slate-100 dark:border-slate-800">
                        <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider mb-1">Reason for Referral</p>
                        <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
                          {ref.reason}
                        </p>
                        {ref.notes && (
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 pt-2 border-t border-slate-200/50 dark:border-slate-700">
                            📝 {ref.notes}
                          </p>
                        )}
                      </div>

                      {/* Source */}
                      <p className="text-xs text-slate-400 mt-3 flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5 text-slate-400" /> Referred by: <strong className="text-slate-600 dark:text-slate-300">{ref.source}</strong>
                      </p>
                    </div>

                    {/* Action */}
                    {ref.status === 'Accepted' && (
                      <Link
                        to="/patient/appointments"
                        className="self-start sm:self-center flex items-center gap-1 px-4 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold shadow-md shadow-teal-500/20 flex-shrink-0 transition"
                      >
                        View Appointment <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    )}
                  </div>
                </motion.div>
              )
            })}
          </motion.div>
        )}
      </div>
    </div>
  )
}
