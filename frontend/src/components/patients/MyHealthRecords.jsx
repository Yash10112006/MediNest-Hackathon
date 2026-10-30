// frontend/src/components/patients/MyHealthRecords.jsx

import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import {
  FileText,
  Activity,
  Image,
  StickyNote,
  Calendar,
  User,
  MapPin,
  Download,
  Search,
  Plus,
  ShieldCheck
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { useMockState, getPatientForUser } from '../../services/mockState'
import { useAuth } from '../../hooks/useAuth'

const typeConfig = {
  'Lab Report': {
    icon: Activity,
    color: 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400',
    badge: 'bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800'
  },
  'Ultrasound': {
    icon: Image,
    color: 'bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400',
    badge: 'bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800'
  },
  'Vital Signs': {
    icon: FileText,
    color: 'bg-teal-50 dark:bg-teal-950/40 text-teal-600 dark:text-teal-400',
    badge: 'bg-teal-100 dark:bg-teal-900/40 text-teal-700 dark:text-teal-300 border-teal-200 dark:border-teal-800'
  },
  'Prescription': {
    icon: StickyNote,
    color: 'bg-cyan-50 dark:bg-cyan-950/40 text-cyan-600 dark:text-cyan-400',
    badge: 'bg-cyan-100 dark:bg-cyan-900/40 text-cyan-700 dark:text-cyan-300 border-cyan-200 dark:border-cyan-800'
  }
}

function formatDate(dateStr) {
  if (!dateStr) return '—'
  return new Date(dateStr).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric'
  })
}

export default function MyHealthRecords() {
  const { state } = useMockState()
  const { user } = useAuth()

  const patient = useMemo(() => {
    if (!user) return null
    return getPatientForUser(user)
  }, [user, state.patients])

  const patientId = patient?.id || user?.id

  const records = useMemo(() => {
    if (!patientId) return []
    return (state.healthRecords || []).filter(
      r =>
        r.patientId === patientId ||
        r.patientId === user?.id ||
        (user?.email && r.patientEmail === user.email)
    )
  }, [state.healthRecords, patientId, user])

  const [search, setSearch] = useState('')

  const filtered = records.filter(r =>
    (r.title || '').toLowerCase().includes(search.toLowerCase()) ||
    (r.type || '').toLowerCase().includes(search.toLowerCase()) ||
    (r.doctor || '').toLowerCase().includes(search.toLowerCase())
  )

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
            <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-xs font-bold uppercase tracking-wider border border-indigo-500/20">
              ABDM Health Timeline
            </span>
            <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white mt-1 tracking-tight">
              My Health Records
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Lab reports, scans, vitals, and prescriptions — all in one place
            </p>
          </div>
          <Link
            to="/patient/dashboard"
            className="self-start sm:self-center text-sm text-slate-500 dark:text-slate-400 hover:text-teal-600 transition"
          >
            ← Back to Dashboard
          </Link>
        </motion.div>

        {/* Patient Summary Card */}
        {patient && (
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.05 }}
            className="bg-gradient-to-r from-slate-800 to-slate-900 rounded-3xl p-6 text-white mb-6 border border-slate-700"
          >
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-teal-500 to-emerald-600 flex items-center justify-center text-white font-extrabold text-xl shadow-lg">
                  {patient.name?.charAt(0) || 'P'}
                </div>
                <div>
                  <p className="font-extrabold text-xl">{patient.name}</p>
                  <p className="text-slate-400 text-sm">ABHA: {patient.abha_id || 'Not linked'}</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-3 text-sm">
                {[
                  { label: 'Age', value: patient.age ? `${patient.age} yrs` : 'Not set' },
                  { label: 'Blood', value: patient.bloodGroup || '—' },
                  { label: 'Gender', value: patient.gender || 'Not set' }
                ].map(({ label, value }) => (
                  <div key={label} className="bg-white/10 rounded-xl px-3 py-2 text-center">
                    <p className="text-slate-400 text-xs">{label}</p>
                    <p className="font-bold text-white">{value}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Latest vitals */}
            {patient.vitals && (
              <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3">
                {Object.entries(patient.vitals).map(([key, val]) => (
                  <div key={key} className="bg-white/5 border border-white/10 rounded-xl px-3 py-2">
                    <p className="text-slate-400 text-[10px] uppercase tracking-wide">{key.replace('_', ' ')}</p>
                    <p className="text-white font-bold text-sm mt-0.5">{val}</p>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        )}

        {/* Search */}
        <div className="relative mb-6">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search records by title, type, or doctor..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-11 pr-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-sm text-slate-800 dark:text-slate-200 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/40 focus:border-teal-500"
          />
        </div>

        {/* Records */}
        {filtered.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-10 text-center border border-slate-200 dark:border-slate-800">
            <FileText className="w-12 h-12 text-slate-300 dark:text-slate-700 mx-auto mb-3" />
            <p className="text-slate-500 dark:text-slate-400 font-medium">No records found</p>
            <p className="text-xs text-slate-400 mt-1">Uploaded lab reports and clinical notes will appear here</p>
          </div>
        ) : (
          <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-4">
            {filtered.map(record => {
              const cfg = typeConfig[record.type] || typeConfig['Lab Report']
              const Icon = cfg.icon
              return (
                <motion.div
                  key={record.id}
                  variants={itemVariants}
                  whileHover={{ y: -3 }}
                  className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-start gap-4"
                >
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 ${cfg.color}`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-start justify-between gap-2 mb-1">
                      <h3 className="font-bold text-slate-900 dark:text-white">{record.title}</h3>
                      <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${cfg.badge}`}>
                        {record.type}
                      </span>
                    </div>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">{record.summary}</p>
                    <div className="flex flex-wrap gap-3 mt-2.5 text-xs text-slate-400">
                      <span className="flex items-center gap-1">
                        <User className="w-3.5 h-3.5" /> {record.doctor}
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5" /> {record.facility}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" /> {formatDate(record.date)}
                      </span>
                    </div>
                  </div>
                  <button
                    title="Download"
                    className="flex-shrink-0 w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-teal-50 dark:hover:bg-teal-950/40 text-slate-500 dark:text-slate-400 hover:text-teal-600 flex items-center justify-center transition"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                </motion.div>
              )
            })}
          </motion.div>
        )}
      </div>
    </div>
  )
}
