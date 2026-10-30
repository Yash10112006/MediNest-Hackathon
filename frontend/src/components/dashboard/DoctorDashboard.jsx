import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useAuth } from '../../hooks/useAuth'
import { Users, Calendar, Activity, Clock, HeartPulse, TrendingUp, UserCircle, ArrowRight, ShieldCheck, CheckCircle, Lock } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useMockState } from '../../services/mockState'

export default function DoctorDashboard() {
  const { user, role } = useAuth()
  const navigate = useNavigate()
  const { state, doctorRequestAccess } = useMockState()

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.08, delayChildren: 0.1 }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { type: 'spring', stiffness: 260, damping: 20 }
    }
  }

  const statCards = [
    { title: 'Total Patients', value: state.patients.length + 41, icon: Users, color: 'teal' },
    { title: "Today's Appointments", value: 8, icon: Calendar, color: 'emerald' },
    { title: 'Pending Referrals', value: state.referrals.filter(r => r.status === 'Pending').length, icon: Activity, color: 'amber' },
    { title: 'Follow-ups Due', value: 5, icon: Clock, color: 'rose' }
  ]

  // Combine static appointments with dynamic referrals for demo purposes
  const queue = [
    ...state.referrals.map(r => {
      const patient = state.patients.find(p => p.id === r.patientId)
      return {
        id: r.id,
        patientId: patient.id,
        patient_name: patient.name,
        abha_id: patient.abha_id,
        time: 'ASAP',
        type: 'Referral',
        status: r.status,
        age: patient.age,
        gender: patient.gender,
        hasAccess: patient.authorizedDoctors?.includes('Dr. Sharma'),
        accessRequested: patient.accessRequestedBy === 'Dr. Sharma'
      }
    }),
    { id: '1', patient_name: 'Rahul Gupta', abha_id: 'ABHA-1234567890', time: '10:00 AM', type: 'Consultation', status: 'Confirmed', age: 45, gender: 'Male', hasAccess: true }
  ]

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-8 px-6 transition-colors">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8"
        >
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-teal-500/10 text-teal-600 dark:text-teal-400 text-xs font-bold uppercase tracking-wider border border-teal-500/20">
                Doctor Consultation Portal
              </span>
              <span className="flex items-center gap-1 text-xs text-slate-400">
                <ShieldCheck className="w-3.5 h-3.5 text-teal-500" /> Human-in-the-Loop Active
              </span>
            </div>
            <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white mt-1 tracking-tight">
              Good Morning, {user?.name || user?.user_metadata?.name || 'Dr. Sharma'} 👋
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Verify AI triage explanations, e-prescriptions, and hospital referral requests.
            </p>
          </div>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/doctor/triage')}
            className="bg-gradient-to-r from-teal-600 to-emerald-600 text-white px-6 py-3 rounded-2xl flex items-center gap-2 shadow-lg shadow-teal-600/25 text-sm font-bold transition"
          >
            <HeartPulse className="w-4 h-4 animate-pulse" /> Launch AI Triage Engine
          </motion.button>
        </motion.div>

        {/* Stats Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-8"
        >
          {statCards.map((stat, index) => (
            <StatCard
              key={index}
              variants={itemVariants}
              icon={stat.icon}
              title={stat.title}
              value={stat.value}
              color={stat.color}
            />
          ))}
        </motion.div>

        {/* Appointments Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm p-6 overflow-hidden"
        >
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                Today's Consultations & Referrals
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Incoming ASHA referrals and scheduled clinic queue
              </p>
            </div>
            <button className="text-xs font-bold text-teal-600 dark:text-teal-400 flex items-center gap-1 hover:underline">
              View All <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  <th className="py-3.5 px-4">Patient Details</th>
                  <th className="py-3.5 px-4">ABHA ID</th>
                  <th className="py-3.5 px-4">Time Slot</th>
                  <th className="py-3.5 px-4">Visit Type</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Action / Consent</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {queue.map((appt) => (
                  <tr key={appt.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition duration-200">
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-2xl flex items-center justify-center font-bold text-sm border ${
                          appt.type === 'Referral' ? 'bg-amber-50 text-amber-600 border-amber-200' : 'bg-teal-50 text-teal-600 border-teal-200'
                        } dark:bg-slate-800`}>
                          <UserCircle className="w-6 h-6" />
                        </div>
                        <div>
                          <p className="font-bold text-slate-900 dark:text-white text-sm">{appt.patient_name}</p>
                          <p className="text-xs text-slate-400">{appt.age} yrs • {appt.gender}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4 font-mono text-xs text-slate-600 dark:text-slate-300">{appt.abha_id}</td>
                    <td className="py-4 px-4 text-xs font-semibold text-slate-700 dark:text-slate-200">{appt.time}</td>
                    <td className="py-4 px-4">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase border ${
                        appt.type === 'Referral'
                          ? 'bg-amber-50 text-amber-600 border-amber-200 dark:bg-amber-950/50 dark:text-amber-400'
                          : 'bg-teal-50 text-teal-600 border-teal-200 dark:bg-teal-950/50 dark:text-teal-400'
                      }`}>
                        {appt.type}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-600 border border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-400">
                        {appt.status}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-right">
                      {appt.hasAccess ? (
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className="px-3.5 py-1.5 rounded-xl bg-teal-500 text-white font-bold text-xs shadow-md shadow-teal-500/20 transition flex items-center justify-center gap-1.5 ml-auto"
                        >
                          <HeartPulse className="w-3.5 h-3.5" /> Start Consult
                        </motion.button>
                      ) : appt.accessRequested ? (
                        <span className="px-3.5 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 font-bold text-xs inline-flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5" /> Pending Consent
                        </span>
                      ) : (
                        <motion.button
                          onClick={() => doctorRequestAccess(appt.patientId)}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className="px-3.5 py-1.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 font-bold text-xs border border-amber-200 dark:border-amber-900/50 hover:bg-amber-100 transition flex items-center justify-center gap-1.5 ml-auto"
                        >
                          <Lock className="w-3.5 h-3.5" /> Request Access
                        </motion.button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

function StatCard({ variants, icon: Icon, title, value, color }) {
  const iconColors = {
    teal: 'bg-teal-50 text-teal-600 dark:bg-teal-950/50 dark:text-teal-400',
    emerald: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400',
    amber: 'bg-amber-50 text-amber-600 dark:bg-amber-950/50 dark:text-amber-400',
    rose: 'bg-rose-50 text-rose-600 dark:bg-rose-950/50 dark:text-rose-400'
  }

  return (
    <motion.div
      variants={variants}
      whileHover={{ y: -4, scale: 1.01 }}
      className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm border border-slate-200/80 dark:border-slate-800 transition"
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{title}</p>
          <p className="text-3xl font-extrabold text-slate-900 dark:text-white mt-1">{value}</p>
        </div>
        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${iconColors[color] || iconColors.teal}`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
      <div className="flex items-center gap-1.5 mt-4 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
        <TrendingUp className="w-3.5 h-3.5" />
        <span>+12% vs last week</span>
      </div>
    </motion.div>
  )
}