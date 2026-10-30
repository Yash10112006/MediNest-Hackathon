// frontend/src/components/dashboard/Dashboard.jsx
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useAuth } from '../../hooks/useAuth'
import { 
  Users, 
  Calendar, 
  Activity, 
  Clock, 
  TrendingUp, 
  TrendingDown,
  ArrowRight,
  HeartPulse,
  Stethoscope,
  UserPlus,
  CheckCircle,
  AlertTriangle,
  Gift  // ← Add this line
} from 'lucide-react'
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

export default function Dashboard() {
  const { user } = useAuth()
  const [stats, setStats] = useState({
    patients: 0,
    appointments: 0,
    referrals: 0,
    followUps: 0
  })
  const [recentActivity, setRecentActivity] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Load dashboard data
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    setLoading(true)
    try {
      // Try to fetch from backend
      const response = await fetch(`${API_URL}/api/analytics/kpis`)
      if (response.ok) {
        const data = await response.json()
        setStats({
          patients: data.total_consultations || 0,
          appointments: Math.round(data.total_consultations * 0.3) || 0,
          referrals: Math.round(data.total_consultations * 0.15) || 0,
          followUps: Math.round(data.total_consultations * 0.25) || 0
        })
      }
    } catch (error) {
      // Fallback to mock data
      setStats({
        patients: 1420,
        appointments: 314,
        referrals: 108,
        followUps: 45
      })
    }

    // Mock recent activity
    setRecentActivity([
      { type: 'patient', title: 'New patient registered', time: '2 min ago' },
      { type: 'appointment', title: 'Dr. Sharma scheduled appointment', time: '15 min ago' },
      { type: 'triage', title: 'AI Triage detected emergency', time: '1 hour ago' },
      { type: 'referral', title: 'Patient referred to CHC Barwaha', time: '2 hours ago' },
    ])
    setLoading(false)
  }

  const statCards = [
    { title: 'Total Patients', value: stats.patients, icon: Users, color: 'blue', trend: '+12%' },
    { title: 'Appointments', value: stats.appointments, icon: Calendar, color: 'green', trend: '+8%' },
    { title: 'Referrals', value: stats.referrals, icon: Activity, color: 'orange', trend: '+5%' },
    { title: 'Follow-ups', value: stats.followUps, icon: Clock, color: 'purple', trend: '+3%' },
  ]

  const getColorClasses = (color) => {
    const colors = {
      blue: 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400',
      green: 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400',
      orange: 'bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400',
      purple: 'bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400',
    }
    return colors[color] || colors.blue
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Welcome Section */}
      <div className="mb-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-8 text-white"
        >
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-3xl font-bold">
                Welcome back, {user?.name?.split(' ')[0] || 'Doctor'} 👋
              </h1>
              <p className="mt-1 text-blue-100">Here's what's happening with your patients today</p>
            </div>
            <div className="mt-4 md:mt-0 flex items-center gap-3">
              <span className="px-3 py-1.5 bg-white/20 rounded-lg text-sm backdrop-blur-sm">
                🟢 All Systems Operational
              </span>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statCards.map((stat, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-6 hover:shadow-lg transition"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">{stat.title}</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{stat.value}</p>
              </div>
              <div className={`p-3 rounded-xl ${getColorClasses(stat.color)}`}>
                <stat.icon className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-3 flex items-center text-xs text-green-600 dark:text-green-400">
              <TrendingUp className="w-3 h-3 mr-1" />
              {stat.trend} from last month
            </div>
          </motion.div>
        ))}
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Activity</h2>
            <button className="text-blue-600 dark:text-blue-400 text-sm hover:underline">View All</button>
          </div>
          <div className="space-y-3">
            {recentActivity.map((activity, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 * (index + 1) }}
                className="flex items-center gap-4 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700/50 transition"
              >
                <div className="w-10 h-10 rounded-full bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-blue-600 dark:text-blue-400">
                  {activity.type === 'patient' && <UserPlus className="w-5 h-5" />}
                  {activity.type === 'appointment' && <Calendar className="w-5 h-5" />}
                  {activity.type === 'triage' && <HeartPulse className="w-5 h-5" />}
                  {activity.type === 'referral' && <Stethoscope className="w-5 h-5" />}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{activity.title}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{activity.time}</p>
                </div>
                <ArrowRight className="w-4 h-4 text-gray-400" />
              </motion.div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Quick Actions</h2>
          <div className="space-y-3">
            <button className="w-full flex items-center gap-3 p-3 rounded-xl bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/30 transition text-left">
              <Stethoscope className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              <span className="text-sm font-medium text-gray-900 dark:text-white">AI Symptom Checker</span>
              <ArrowRight className="w-4 h-4 text-blue-600 dark:text-blue-400 ml-auto" />
            </button>
            <button className="w-full flex items-center gap-3 p-3 rounded-xl bg-green-50 dark:bg-green-900/20 hover:bg-green-100 dark:hover:bg-green-900/30 transition text-left">
              <UserPlus className="w-5 h-5 text-green-600 dark:text-green-400" />
              <span className="text-sm font-medium text-gray-900 dark:text-white">Register New Patient</span>
              <ArrowRight className="w-4 h-4 text-green-600 dark:text-green-400 ml-auto" />
            </button>
            <button className="w-full flex items-center gap-3 p-3 rounded-xl bg-orange-50 dark:bg-orange-900/20 hover:bg-orange-100 dark:hover:bg-orange-900/30 transition text-left">
              <Activity className="w-5 h-5 text-orange-600 dark:text-orange-400" />
              <span className="text-sm font-medium text-gray-900 dark:text-white">View Referrals</span>
              <ArrowRight className="w-4 h-4 text-orange-600 dark:text-orange-400 ml-auto" />
            </button>
            <button className="w-full flex items-center gap-3 p-3 rounded-xl bg-purple-50 dark:bg-purple-900/20 hover:bg-purple-100 dark:hover:bg-purple-900/30 transition text-left">
              <Gift className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              <span className="text-sm font-medium text-gray-900 dark:text-white">Check Government Schemes</span>
              <ArrowRight className="w-4 h-4 text-purple-600 dark:text-purple-400 ml-auto" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}