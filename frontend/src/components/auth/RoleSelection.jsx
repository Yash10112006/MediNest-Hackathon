import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  HeartPulse,
  UserRound,
  Stethoscope,
  Building2,
  Sprout,
  ArrowRight,
  Sparkles,
  ShieldCheck
} from 'lucide-react'

const roles = [
  {
    id: 'patient',
    title: 'Patient',
    badge: 'Self-Care & Triage',
    description: 'Manage your health records, voice triage, and government health schemes.',
    icon: UserRound,
    glow: 'group-hover:shadow-teal-500/20 group-hover:border-teal-400',
    iconBg: 'bg-teal-50 text-teal-600 group-hover:bg-teal-600 group-hover:text-white',
  },
  {
    id: 'doctor',
    title: 'Doctor',
    badge: 'Clinical Portal',
    description: 'Consult patients, verify AI triage, manage prescriptions and referrals.',
    icon: Stethoscope,
    glow: 'group-hover:shadow-cyan-500/20 group-hover:border-cyan-400',
    iconBg: 'bg-cyan-50 text-cyan-600 group-hover:bg-cyan-600 group-hover:text-white',
  },
  {
    id: 'hospital_admin',
    title: 'Hospital Admin',
    badge: 'Facility Command',
    description: 'Manage doctors, live queues, inventory alerts and hospital operations.',
    icon: Building2,
    glow: 'group-hover:shadow-indigo-500/20 group-hover:border-indigo-400',
    iconBg: 'bg-indigo-50 text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white',
  },
  {
    id: 'asha',
    title: 'ASHA Worker',
    badge: 'Field Operations',
    description: 'Track households, beneficiaries, offline visits, and high-risk follow-ups.',
    icon: Sprout,
    glow: 'group-hover:shadow-emerald-500/20 group-hover:border-emerald-400',
    iconBg: 'bg-emerald-50 text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white',
  }
]

export default function RoleSelection() {
  const navigate = useNavigate()

  const selectRole = (role) => {
    sessionStorage.setItem('selectedRole', role.id)
    navigate('/login')
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 25 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { type: 'spring', stiffness: 260, damping: 20 }
    }
  }

  return (
    <div className="relative min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center px-6 py-12 overflow-hidden">
      {/* Futuristic Background Ambient Glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-teal-500/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-10 left-10 w-[350px] h-[350px] bg-cyan-500/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute top-10 right-10 w-[350px] h-[350px] bg-indigo-500/10 rounded-full blur-[100px] pointer-events-none" />

      <div className="relative z-10 w-full max-w-5xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="text-center mb-12"
        >
          <div className="inline-flex justify-center mb-4">
            <motion.div
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.95 }}
              className="relative w-24 h-24 rounded-3xl bg-white p-2.5 flex items-center justify-center shadow-xl shadow-teal-500/30"
            >
              <img
                src="/logo.png"
                alt="MediNest Logo"
                className="w-full h-full object-contain"
              />
              <div className="absolute inset-0 rounded-3xl bg-teal-400 blur-xl opacity-30" />
            </motion.div>
          </div>

          <h1 className="text-5xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-200 to-teal-300 bg-clip-text text-transparent">
            MediNest
          </h1>

          <div className="inline-flex items-center gap-2 mt-2 px-3 py-1 rounded-full bg-teal-500/10 border border-teal-500/30 text-teal-300 text-xs font-semibold tracking-wider uppercase">
            <Sparkles className="w-3.5 h-3.5 text-teal-400 animate-spin" style={{ animationDuration: '6s' }} />
            AI-Powered Rural Health Network
          </div>

          <h2 className="text-2xl font-bold text-slate-200 mt-8">
            Select Your Access Portal
          </h2>
          <p className="text-sm text-slate-400 mt-1 max-w-lg mx-auto">
            Choose your role to launch your customized healthcare dashboard
          </p>
        </motion.div>

        {/* Role Cards Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-2 gap-6"
        >
          {roles.map((role) => {
            const Icon = role.icon

            return (
              <motion.button
                key={role.id}
                variants={itemVariants}
                whileHover={{ scale: 1.025, y: -4 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => selectRole(role)}
                className={`group relative bg-slate-900/70 backdrop-blur-xl border border-slate-800 rounded-3xl p-7 text-left shadow-2xl transition-all duration-300 ${role.glow}`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-5">
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-300 shadow-md ${role.iconBg}`}>
                      <Icon className="w-7 h-7 transition-transform duration-300 group-hover:scale-110" />
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-xl font-bold text-white group-hover:text-teal-300 transition-colors">
                          {role.title}
                        </h3>
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-slate-800 text-slate-300 border border-slate-700">
                          {role.badge}
                        </span>
                      </div>

                      <p className="text-xs text-slate-400 mt-2 leading-relaxed max-w-sm">
                        {role.description}
                      </p>
                    </div>
                  </div>

                  <div className="w-8 h-8 rounded-full bg-slate-800/80 flex items-center justify-center text-slate-400 group-hover:text-teal-400 group-hover:bg-teal-500/20 group-hover:translate-x-1 transition-all duration-300">
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </div>
              </motion.button>
            )
          })}
        </motion.div>

        {/* Footer info */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-12 text-center flex items-center justify-center gap-4 text-xs text-slate-500"
        >
          <span className="flex items-center gap-1"><ShieldCheck className="w-3.5 h-3.5 text-teal-500" /> ABDM Aligned</span>
          <span>•</span>
          <span>Voice-First NLP</span>
          <span>•</span>
          <span>Offline SQLite Sync</span>
          <span>•</span>
          <span>SIH Production Ready</span>
        </motion.div>
      </div>
    </div>
  )
}