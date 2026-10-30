// frontend/src/components/patients/PatientPrescriptions.jsx

import { useMemo } from 'react'
import { motion } from 'framer-motion'
import {
  Pill,
  Clock,
  User,
  Calendar,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  CheckCircle,
  FileText
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { useState } from 'react'
import { useMockState, getPatientForUser } from '../../services/mockState'
import { useAuth } from '../../hooks/useAuth'

function formatDate(dateStr) {
  if (!dateStr) return '—'
  return new Date(dateStr).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric'
  })
}

export default function PatientPrescriptions() {
  const { state } = useMockState()
  const { user } = useAuth()

  const patient = useMemo(() => {
    if (!user) return null
    return getPatientForUser(user)
  }, [user, state.patients])

  const patientId = patient?.id || user?.id

  const prescriptions = useMemo(() => {
    if (!patientId) return []
    return (state.prescriptions || []).filter(
      p =>
        p.patientId === patientId ||
        p.patientId === user?.id ||
        (user?.email && p.patientEmail === user.email)
    )
  }, [state.prescriptions, patientId, user])

  const activePrescriptions = prescriptions.filter(p => p.status === 'Active')
  const pastPrescriptions = prescriptions.filter(p => p.status !== 'Active')

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.08, delayChildren: 0.1 } }
  }
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 260, damping: 20 } }
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
            <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 text-xs font-bold uppercase tracking-wider border border-cyan-500/20">
              e-Prescriptions
            </span>
            <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white mt-1 tracking-tight">
              My Medicines
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Active prescriptions and medication history
            </p>
          </div>
          <Link
            to="/patient/dashboard"
            className="self-start sm:self-center text-sm text-slate-500 dark:text-slate-400 hover:text-teal-600 transition"
          >
            ← Back to Dashboard
          </Link>
        </motion.div>

        {/* Active Prescriptions */}
        <section className="mb-10">
          <h2 className="text-lg font-bold text-slate-800 dark:text-slate-200 mb-4 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-cyan-500 animate-pulse" />
            Active Medications ({activePrescriptions.length})
          </h2>
          {activePrescriptions.length === 0 ? (
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-10 text-center border border-slate-200 dark:border-slate-800">
              <Pill className="w-12 h-12 text-slate-300 dark:text-slate-700 mx-auto mb-3" />
              <p className="text-slate-500 dark:text-slate-400 font-medium">No active prescriptions</p>
              <p className="text-xs text-slate-400 mt-1">Medicines prescribed by your doctor will appear here</p>
            </div>
          ) : (
            <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-4">
              {activePrescriptions.map(rx => (
                <PrescriptionCard key={rx.id} rx={rx} variants={itemVariants} active />
              ))}
            </motion.div>
          )}
        </section>

        {/* Past Prescriptions */}
        {pastPrescriptions.length > 0 && (
          <section>
            <h2 className="text-lg font-bold text-slate-800 dark:text-slate-200 mb-4 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-slate-400" />
              Past Prescriptions ({pastPrescriptions.length})
            </h2>
            <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-4">
              {pastPrescriptions.map(rx => (
                <PrescriptionCard key={rx.id} rx={rx} variants={itemVariants} />
              ))}
            </motion.div>
          </section>
        )}
      </div>
    </div>
  )
}

function PrescriptionCard({ rx, variants, active }) {
  const [expanded, setExpanded] = useState(true)

  return (
    <motion.div
      variants={variants}
      className={`bg-white dark:bg-slate-900 rounded-3xl p-6 border shadow-sm transition-all ${active ? 'border-cyan-200 dark:border-cyan-900/60 shadow-cyan-900/5' : 'border-slate-200/80 dark:border-slate-800 opacity-75'}`}
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pb-4 border-b border-slate-100 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-900 dark:text-white text-base">By {rx.doctor}</span>
            <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${active ? 'bg-cyan-50 dark:bg-cyan-950/50 text-cyan-600 dark:text-cyan-400 border border-cyan-200 dark:border-cyan-800' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'}`}>
              {rx.status}
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-1">
            <Calendar className="w-3 h-3" /> Prescribed: {formatDate(rx.date)}
            {rx.nextReviewDate && ` • Next Review: ${formatDate(rx.nextReviewDate)}`}
          </p>
        </div>
        <button
          onClick={() => setExpanded(!expanded)}
          className="text-xs text-slate-400 hover:text-slate-600 flex items-center gap-1 self-end sm:self-center"
        >
          {expanded ? 'Hide Details' : 'Show Details'} {expanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
        </button>
      </div>

      {expanded && (
        <div className="space-y-3">
          <div className="grid sm:grid-cols-2 gap-3">
            {(rx.medicines || []).map((med, idx) => (
              <div key={idx} className="bg-slate-50 dark:bg-slate-800/60 rounded-2xl p-3.5 border border-slate-100 dark:border-slate-700 flex items-start gap-3">
                <div className="w-8 h-8 rounded-xl bg-cyan-100 dark:bg-cyan-900/50 flex items-center justify-center text-cyan-600 dark:text-cyan-400 font-bold text-xs flex-shrink-0">
                  {idx + 1}
                </div>
                <div>
                  <p className="font-bold text-slate-800 dark:text-slate-200 text-sm">{med.name}</p>
                  <p className="text-xs text-cyan-600 dark:text-cyan-400 font-medium mt-0.5">⏱ {med.frequency}</p>
                  {med.duration && <p className="text-[11px] text-slate-400">📅 Duration: {med.duration}</p>}
                  {med.instructions && <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">📌 {med.instructions}</p>}
                </div>
              </div>
            ))}
          </div>

          {rx.instructions && (
            <div className="bg-amber-50/70 dark:bg-amber-950/30 rounded-2xl p-3.5 border border-amber-200/60 dark:border-amber-900/50">
              <p className="text-xs font-semibold text-amber-700 dark:text-amber-300 flex items-center gap-1.5">
                <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" /> Special Instructions
              </p>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
                {rx.instructions}
              </p>
            </div>
          )}
        </div>
      )}
    </motion.div>
  )
}
