import { motion } from 'framer-motion'
import {
  Users,
  Calendar,
  UserCog,
  Activity,
  Package,
  AlertTriangle,
  Clock,
  TrendingUp,
  Building2,
  Sparkles,
  Ticket
} from 'lucide-react'
import { useMockState } from '../../services/mockState'

export default function HospitalAdminDashboard() {
  const { state, hospitalGenerateToken } = useMockState()

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
      title: 'Patients Today',
      value: '184',
      icon: Users,
      color: 'blue'
    },
    {
      title: 'Appointments',
      value: '62',
      icon: Calendar,
      color: 'emerald'
    },
    {
      title: 'Doctors On Duty',
      value: '18',
      icon: UserCog,
      color: 'purple'
    },
    {
      title: 'Pending Referrals',
      value: state.referrals.filter(r => r.status === 'Pending').length,
      icon: Activity,
      color: 'amber'
    }
  ]

  const handleGenerateToken = () => {
    // Generate a token for the first pending referral or walk-in to simulate workflow
    const pending = state.referrals.find(r => r.status === 'Pending')
    const patient = pending ? state.patients.find(p => p.id === pending.patientId) : null
    hospitalGenerateToken('General OPD', patient?.name || 'Walk-in Patient')
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-8 px-6 transition-colors">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8"
        >
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-purple-500/10 text-purple-600 dark:text-purple-400 text-xs font-bold uppercase tracking-wider border border-purple-500/20">
                Hospital Command Operations
              </span>
              <span className="flex items-center gap-1 text-xs text-slate-400">
                <Building2 className="w-3.5 h-3.5 text-purple-500" /> CHC Khargone Central
              </span>
            </div>
            <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white mt-1 tracking-tight">
              Hospital Operations Command 🏥
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Live queue telemetry, doctor schedules, medicine stock alerts, and referral tracking.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span className="px-3 py-1.5 rounded-2xl bg-teal-500/10 text-teal-600 dark:text-teal-400 border border-teal-500/20 text-xs font-bold flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 animate-spin" style={{ animationDuration: '6s' }} />
              Queue Token Engine Active
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
          {stats.map((stat, index) => (
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

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Live Queue */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm"
          >
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                  Live Queue Token Status
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Real-time OPD token updates
                </p>
              </div>
              <motion.button
                onClick={handleGenerateToken}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-3 py-1.5 bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300 font-bold text-xs rounded-xl flex items-center gap-1.5 border border-purple-200 dark:border-purple-800/50 hover:bg-purple-200 transition"
              >
                <Ticket className="w-3.5 h-3.5" /> Call Next
              </motion.button>
            </div>

            <div className="space-y-3">
              {state.queueTokens.length > 0 ? (
                state.queueTokens.map(token => (
                  <QueueItem key={token.id} department={token.department} token={token.tokenNumber} waiting={token.patientName} time={token.time} />
                ))
              ) : (
                <div className="text-center py-6 text-sm text-slate-400">Queue is empty</div>
              )}
              <QueueItem department="General OPD" token="A-27" waiting="Ramesh K." time="Waiting" />
            </div>
          </motion.div>

          {/* Doctor Availability */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm"
          >
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                  Doctor Roster & Duty Status
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Active consultations
                </p>
              </div>
              <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                <UserCog className="w-5 h-5" />
              </div>
            </div>

            <div className="space-y-4">
              <Doctor name="Dr. Rajesh Sharma" department="General Medicine" status="Available" />
              <Doctor name="Dr. Priya Mehta" department="Gynecology & Obstetrics" status="In Consultation" />
              <Doctor name="Dr. Anil Khan" department="Pediatrics" status="Available" />
            </div>
          </motion.div>

          {/* Inventory Alerts */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm"
          >
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                  Stock-Aware Inventory Alerts
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Medicine stockout pre-warning
                </p>
              </div>
              <div className="w-9 h-9 rounded-xl bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                <Package className="w-5 h-5" />
              </div>
            </div>

            <div className="space-y-3">
              <InventoryItem medicine="Paracetamol 500mg" status="Low Stock (140 tabs remaining)" />
              <InventoryItem medicine="Amoxicillin 250mg" status="Low Stock (85 tabs remaining)" />
            </div>
          </motion.div>

          {/* Referral Overview */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm"
          >
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                  Inter-Facility Referrals
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  District hospital transfer tracking
                </p>
              </div>
              <div className="w-9 h-9 rounded-xl bg-cyan-50 dark:bg-cyan-950/50 text-cyan-600 dark:text-cyan-400 flex items-center justify-center">
                <Activity className="w-5 h-5" />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <ReferralStat label="Pending" value="7" color="amber" />
              <ReferralStat label="Accepted" value="3" color="emerald" />
              <ReferralStat label="Completed" value="12" color="blue" />
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}

function StatCard({ variants, icon: Icon, title, value, color }) {
  const iconColors = {
    blue: 'bg-blue-50 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400',
    emerald: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400',
    purple: 'bg-purple-50 text-purple-600 dark:bg-purple-950/50 dark:text-purple-400',
    amber: 'bg-amber-50 text-amber-600 dark:bg-amber-950/50 dark:text-amber-400'
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
        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${iconColors[color]}`}>
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

function QueueItem({ department, token, waiting }) {
  return (
    <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50/80 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
      <div>
        <p className="font-bold text-slate-900 dark:text-white text-sm">{department}</p>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{waiting} waiting</p>
      </div>
      <span className="font-extrabold text-lg text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/60 px-3 py-1 rounded-xl border border-purple-200 dark:border-purple-800/50">
        {token}
      </span>
    </div>
  )
}

function Doctor({ name, department, status }) {
  const available = status === 'Available'

  return (
    <div className="flex items-center justify-between p-3.5 rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
      <div>
        <p className="font-bold text-slate-900 dark:text-white text-sm">{name}</p>
        <p className="text-xs text-slate-500 dark:text-slate-400">{department}</p>
      </div>
      <span
        className={`px-3 py-1 rounded-full text-[11px] font-bold border ${
          available
            ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-800/50'
            : 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/50 dark:text-amber-300 dark:border-amber-800/50'
        }`}
      >
        {status}
      </span>
    </div>
  )
}

function InventoryItem({ medicine, status }) {
  return (
    <div className="flex items-center justify-between p-3.5 bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200/60 dark:border-amber-800/50 rounded-2xl">
      <div className="flex items-center gap-3">
        <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400" />
        <span className="font-bold text-slate-800 dark:text-slate-200 text-xs">{medicine}</span>
      </div>
      <span className="text-[11px] font-extrabold text-amber-700 dark:text-amber-400">{status}</span>
    </div>
  )
}

function ReferralStat({ label, value, color }) {
  const badgeColors = {
    amber: 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/50',
    emerald: 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50',
    blue: 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/50'
  }

  return (
    <div className="text-center p-4 bg-slate-50/80 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 rounded-2xl">
      <p className={`text-2xl font-extrabold rounded-xl py-1 ${badgeColors[color]}`}>{value}</p>
      <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-2">{label}</p>
    </div>
  )
}
