import { Link } from 'react-router-dom'
import { Stethoscope } from 'lucide-react'
import { motion } from 'framer-motion'
import {
  Home,
  Users,
  Baby,
  HeartPulse,
  ClipboardList,
  Bell,
  AlertTriangle,
  MapPin,
  Calendar,
  CheckCircle,
  Clock,
  Wifi,
  Mic,
  ArrowRight,
  Sparkles,
  Send
} from 'lucide-react'
import { useMockState } from '../../services/mockState'
import { useState } from 'react'

export default function ASHADashboard() {
  const { state, ashaCreateReferral } = useMockState()
  const [referralSent, setReferralSent] = useState(false)
  
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

  const stats = [
    {
      icon: Home,
      title: 'Assigned Households',
      value: '128',
      detail: '8 visits due today',
      color: 'teal'
    },
    {
      icon: Users,
      title: 'Beneficiaries',
      value: state.patients.length + 345, // Demo illusion
      detail: '12 need follow-up',
      color: 'cyan'
    },
    {
      icon: Baby,
      title: 'Pregnant Women',
      value: '18',
      detail: '3 high-risk cases',
      color: 'emerald'
    },
    {
      icon: HeartPulse,
      title: 'High-Risk Patients',
      value: state.patients.filter(p => p.status.includes('High Risk')).length + 6,
      detail: '2 urgent follow-ups',
      color: 'rose'
    },
  ]

  const handleReferral = (patientId) => {
    ashaCreateReferral(patientId, 'High blood pressure and edema (High Risk Pregnancy)', 'High')
    setReferralSent(true)
    setTimeout(() => setReferralSent(false), 3000)
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-8 px-6 transition-colors">
      <div className="max-w-7xl mx-auto">
        {/* Page Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8"
        >
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-bold uppercase tracking-wider border border-emerald-500/20">
                ASHA Field Command
              </span>
              <span className="flex items-center gap-1 text-xs text-slate-400">
                <Sparkles className="w-3.5 h-3.5 text-teal-500" /> ML Risk Model Active (91% Acc)
              </span>
            </div>
            <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white mt-1 tracking-tight">
              Good morning, Sangeeta 👋
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Manage assigned households, high-risk pregnant beneficiaries, and field visits.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-4 py-2.5 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl text-emerald-600 dark:text-emerald-400 text-xs font-bold shadow-sm">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
              Online & Synced
            </div>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-gradient-to-r from-rose-600 to-red-600 text-white px-5 py-2.5 rounded-2xl flex items-center gap-2 text-xs font-bold shadow-lg shadow-rose-600/30 transition"
            >
              <AlertTriangle className="w-4 h-4 animate-bounce" />
              Emergency SOS
            </motion.button>
          </div>
        </motion.div>

        {/* Offline / Sync Banner */}
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="bg-gradient-to-r from-slate-900 via-teal-950 to-slate-900 border border-teal-500/30 rounded-3xl p-5 mb-8 text-white shadow-xl shadow-teal-950/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-teal-500/20 rounded-2xl border border-teal-500/30 flex items-center justify-center text-teal-300">
              <Wifi className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <p className="font-bold text-sm text-teal-200">
                Offline First Architecture Enabled
              </p>
              <p className="text-xs text-slate-300 mt-0.5">
                Records saved locally with SQLite outbox pattern. Auto-syncs when online.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
              Last Sync: Just now
            </span>
          </div>
        </motion.div>

        {/* Stats Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-8"
        >
          {stats.map((stat) => (
            <StatCard
              key={stat.title}
              variants={itemVariants}
              icon={stat.icon}
              title={stat.title}
              value={stat.value}
              detail={stat.detail}
              color={stat.color}
            />
          ))}
        </motion.div>

        {/* Main Grid */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Tasks */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden"
          >
            <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                  Today's Priority Tasks
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  High-risk pregnancy & chronic illness visits
                </p>
              </div>

              <button className="text-xs font-bold text-teal-600 dark:text-teal-400 flex items-center gap-1 hover:underline">
                View all tasks <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {state.patients.map((patient) => {
                const hasPendingReferral = state.referrals.some(r => r.patientId === patient.id && r.status === 'Pending')
                
                return (
                <div
                  key={patient.id}
                  className="px-6 py-5 hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition duration-300"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 font-bold flex items-center justify-center border border-teal-500/20 text-sm">
                        {patient.name
                          .split(' ')
                          .map((n) => n[0])
                          .join('')
                          .slice(0, 2)}
                      </div>

                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold text-slate-900 dark:text-white text-sm">
                            {patient.name}
                          </h3>
                          <PriorityBadge priority={patient.status.includes('High Risk') ? 'High' : 'Medium'} />
                        </div>

                        <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                          {patient.status} • {patient.vitals.bp} BP
                        </p>

                        <div className="flex items-center gap-3 text-[11px] text-slate-400 mt-2">
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5 text-teal-500" />
                            {patient.village}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5 text-teal-500" />
                            Today, ASAP
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2 w-full sm:w-auto mt-2 sm:mt-0">
                      {hasPendingReferral ? (
                        <div className="w-full sm:w-auto px-4 py-2 bg-slate-100 dark:bg-slate-800 rounded-xl text-xs font-bold text-slate-500 text-center flex items-center justify-center gap-2">
                          <CheckCircle className="w-4 h-4 text-emerald-500" /> Referral Sent
                        </div>
                      ) : (
                        <motion.button
                          onClick={() => handleReferral(patient.id)}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.95 }}
                          className="w-full sm:w-auto flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-900/50 rounded-xl text-xs font-bold hover:bg-rose-100 dark:hover:bg-rose-900/50 transition"
                        >
                          <Send className="w-3.5 h-3.5" /> Refer to Doctor
                        </motion.button>
                      )}
                      
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="hidden sm:flex px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 hover:border-teal-500 hover:text-teal-600 transition"
                      >
                        Open
                      </motion.button>
                    </div>
                  </div>
                </div>
              )})}
            </div>
          </motion.div>

          {/* Quick Actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm p-6"
          >
            <div className="mb-5">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                Quick Actions
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                3-Tap / 30-Second ASHA Workflows
              </p>
            </div>

            <div className="space-y-3">
              <QuickAction
                icon={Users}
                title="Households Registry"
                description="Digital list with visit logs"
              />
              <QuickAction
                icon={ClipboardList}
                title="Record New Visit"
                description="3-tap beneficiary log"
              />
              <QuickAction
                icon={Mic}
                title="Voice Data Entry"
                description="Speak updates in local language"
                badge="Bhashini"
              />
              <QuickAction
                icon={Calendar}
                title="Health Camps"
                description="Community awareness drives"
              />
              <QuickAction
                icon={Bell}
                title="Notifications"
                description="Targeted maternal alerts"
              />
            </div>
          </motion.div>
        </div>

        {/* Beneficiary Overview */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="mt-8 grid md:grid-cols-3 gap-6"
        >
          <OverviewCard
            variants={itemVariants}
            icon={Baby}
            title="Pregnancy Tracking"
            value="18 Active"
            description="3 high-risk maternal cases monitored"
          />
          <OverviewCard
            variants={itemVariants}
            icon={HeartPulse}
            title="Chronic Disease Follow-up"
            value="42 Patients"
            description="Hypertension, TB & Diabetes screening"
          />
          <OverviewCard
            variants={itemVariants}
            icon={CheckCircle}
            title="Immunization Tracker"
            value="11 Children"
            description="Booster vaccinations due this week"
          />
        </motion.div>
      </div>
    </div>
  )
}

function StatCard({ variants, icon: Icon, title, value, detail, color }) {
  const iconColors = {
    teal: 'bg-teal-50 text-teal-600 dark:bg-teal-950/50 dark:text-teal-400',
    cyan: 'bg-cyan-50 text-cyan-600 dark:bg-cyan-950/50 dark:text-cyan-400',
    emerald: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400',
    rose: 'bg-rose-50 text-rose-600 dark:bg-rose-950/50 dark:text-rose-400'
  }

  return (
    <motion.div
      variants={variants}
      whileHover={{ y: -4, scale: 1.01 }}
      className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm transition"
    >
      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-4 ${iconColors[color] || iconColors.teal}`}>
        <Icon className="w-6 h-6" />
      </div>
      <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{title}</p>
      <p className="text-3xl font-extrabold text-slate-900 dark:text-white mt-1">{value}</p>
      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{detail}</p>
    </motion.div>
  )
}

function PriorityBadge({ priority }) {
  const styles = {
    High: 'bg-rose-50 text-rose-600 border-rose-200 dark:bg-rose-950/50 dark:text-rose-400',
    Medium: 'bg-amber-50 text-amber-600 border-amber-200 dark:bg-amber-950/50 dark:text-amber-400',
    Low: 'bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-400',
  }

  return (
    <span className={`px-2 py-0.5 text-[10px] font-extrabold rounded-full border uppercase tracking-wider ${styles[priority]}`}>
      {priority}
    </span>
  )
}


<Link
  to="/asha/triage"
  className="group rounded-2xl border border-teal-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:border-teal-400 hover:shadow-lg dark:border-slate-800 dark:bg-slate-900"
>
  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-teal-50 text-teal-600 transition group-hover:bg-teal-600 group-hover:text-white dark:bg-teal-950/50 dark:text-teal-400">
    <Stethoscope className="h-6 w-6" />
  </div>

  <h3 className="font-extrabold text-slate-900 dark:text-white">
    AI Patient Triage
  </h3>

  <p className="mt-2 text-sm leading-5 text-slate-500 dark:text-slate-400">
    Start an AI-assisted symptom assessment for a patient.
  </p>

  <div className="mt-4 text-xs font-bold text-teal-600 dark:text-teal-400">
    Start Triage →
  </div>
</Link>

function QuickAction({ icon: Icon, title, description, badge }) {
  return (
    <motion.button
      whileHover={{ scale: 1.02, x: 2 }}
      whileTap={{ scale: 0.98 }}
      className="w-full flex items-center gap-4 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 hover:bg-teal-50/50 dark:hover:bg-slate-800/80 hover:border-teal-400/40 transition text-left group"
    >
      <div className="w-10 h-10 rounded-xl bg-teal-50 dark:bg-teal-950/50 text-teal-600 dark:text-teal-400 flex items-center justify-center group-hover:bg-teal-600 group-hover:text-white transition duration-300">
        <Icon className="w-5 h-5" />
      </div>

      <div className="flex-1">
        <div className="flex items-center gap-2">
          <p className="font-bold text-slate-900 dark:text-white text-xs group-hover:text-teal-600 dark:group-hover:text-teal-400 transition">
            {title}
          </p>
          {badge && (
            <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-teal-500/10 text-teal-600 border border-teal-500/20">
              {badge}
            </span>
          )}
        </div>
        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
          {description}
        </p>
      </div>

      <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-teal-600 group-hover:translate-x-1 transition" />
    </motion.button>
  )
}

function OverviewCard({ variants, icon: Icon, title, value, description }) {
  return (
    <motion.div
      variants={variants}
      whileHover={{ y: -4 }}
      className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-sm"
    >
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-2xl bg-teal-50 dark:bg-teal-950/50 text-teal-600 dark:text-teal-400 flex items-center justify-center">
          <Icon className="w-6 h-6" />
        </div>
        <div>
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{title}</p>
          <p className="text-2xl font-extrabold text-slate-900 dark:text-white mt-0.5">{value}</p>
        </div>
      </div>
      <p className="text-xs text-slate-500 dark:text-slate-400 mt-4 leading-relaxed">{description}</p>
    </motion.div>
  )
}