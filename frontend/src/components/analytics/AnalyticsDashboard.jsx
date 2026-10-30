// frontend/src/components/analytics/AnalyticsDashboard.jsx
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown, 
  Users, 
  Calendar, 
  Activity,
  AlertTriangle,
  CheckCircle,
  Clock,
  Download,
  RefreshCw
} from 'lucide-react'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

export default function AnalyticsDashboard() {
  const [loading, setLoading] = useState(true)
  const [analytics, setAnalytics] = useState({
    kpis: {},
    alerts: [],
    consultations: [],
    regions: [],
    triagePerformance: {}
  })

  useEffect(() => {
    loadAnalytics()
  }, [])

  const loadAnalytics = async () => {
    setLoading(true)
    try {
      // Fetch KPIs
      const kpiRes = await fetch(`${API_URL}/api/analytics/kpis`)
      if (kpiRes.ok) {
        const kpiData = await kpiRes.json()
        setAnalytics(prev => ({ ...prev, kpis: kpiData }))
      }

      // Fetch Alerts
      const alertRes = await fetch(`${API_URL}/api/analytics/alerts`)
      if (alertRes.ok) {
        const alertData = await alertRes.json()
        setAnalytics(prev => ({ ...prev, alerts: alertData }))
      }

      // Fetch Consultations
      const consRes = await fetch(`${API_URL}/api/analytics/consultations`)
      if (consRes.ok) {
        const consData = await consRes.json()
        setAnalytics(prev => ({ ...prev, consultations: consData }))
      }

      // Fetch Regions
      const regionRes = await fetch(`${API_URL}/api/analytics/regions`)
      if (regionRes.ok) {
        const regionData = await regionRes.json()
        setAnalytics(prev => ({ ...prev, regions: regionData }))
      }

      // Fetch Triage Performance
      const triageRes = await fetch(`${API_URL}/api/analytics/triage-performance`)
      if (triageRes.ok) {
        const triageData = await triageRes.json()
        setAnalytics(prev => ({ ...prev, triagePerformance: triageData }))
      }
    } catch (error) {
      // Fallback to mock data
      setAnalytics({
        kpis: {
          total_consultations: 1420,
          ai_triage_accuracy: 0.96,
          avg_response_time: 18.4,
          active_asha_workers: 108,
          bed_occupancy_rate: 0.75,
          referral_completion_rate: 0.88
        },
        alerts: [
          {
            id: '1',
            severity: 'warning',
            title: 'Acute Febrile Illness Alert',
            category: 'Epidemiological Surveillance',
            description: '18% uptick in Rampur Khas. Suspected Dengue Stage 1.',
            location: 'Rampur Khas',
            timestamp: 'Today, 10:30 AM',
            trend: '+18% vs last week',
            status: 'Active'
          }
        ],
        consultations: [
          { month: 'Jan', consultations: 1200, triage: 900, referrals: 150 },
          { month: 'Feb', consultations: 1150, triage: 850, referrals: 130 },
          { month: 'Mar', consultations: 1300, triage: 1000, referrals: 180 },
          { month: 'Apr', consultations: 1400, triage: 1100, referrals: 200 },
          { month: 'May', consultations: 1350, triage: 1050, referrals: 170 },
          { month: 'Jun', consultations: 1420, triage: 1150, referrals: 210 }
        ],
        regions: [
          { name: 'Rampur Khas', type: 'Sub-center', consultations: 320, status: 'warning' },
          { name: 'Khargone PHC', type: 'Primary Health Center', consultations: 450, status: 'healthy' },
          { name: 'Barwaha CHC', type: 'Community Health Center', consultations: 380, status: 'healthy' },
          { name: 'Khandwa District', type: 'District Hospital', consultations: 270, status: 'healthy' }
        ],
        triagePerformance: {
          accuracy: '96%',
          false_alarms: '2%',
          concordance: '92%',
          detection_time: '<5s'
        }
      })
    }
    setLoading(false)
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="text-center py-12">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading analytics...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Analytics Dashboard</h1>
          <p className="text-gray-600 dark:text-gray-400">Healthcare operations & epidemiological surveillance</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
            <Download className="w-4 h-4" /> Export Report
          </button>
          <button onClick={loadAnalytics} className="p-2 bg-white dark:bg-gray-800 rounded-lg shadow-sm hover:shadow-md transition">
            <RefreshCw className="w-4 h-4 text-gray-600 dark:text-gray-400" />
          </button>
        </div>
      </div>

      {/* Alerts */}
      {analytics.alerts && analytics.alerts.length > 0 && (
        <div className="mb-6">
          {analytics.alerts.map((alert, idx) => (
            <div key={idx} className="bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-500 p-4 rounded-lg">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-yellow-800 dark:text-yellow-300">{alert.title}</h4>
                  <p className="text-sm text-yellow-700 dark:text-yellow-400">{alert.description}</p>
                  <p className="text-xs text-yellow-600 dark:text-yellow-500 mt-1">{alert.location} • {alert.timestamp}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4">
          <p className="text-xs text-gray-500 dark:text-gray-400">Total Consultations</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{analytics.kpis.total_consultations}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4">
          <p className="text-xs text-gray-500 dark:text-gray-400">AI Accuracy</p>
          <p className="text-2xl font-bold text-green-600 dark:text-green-400">{Math.round(analytics.kpis.ai_triage_accuracy * 100)}%</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4">
          <p className="text-xs text-gray-500 dark:text-gray-400">Avg Response</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{analytics.kpis.avg_response_time} min</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4">
          <p className="text-xs text-gray-500 dark:text-gray-400">Active ASHA</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{analytics.kpis.active_asha_workers}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4">
          <p className="text-xs text-gray-500 dark:text-gray-400">Bed Occupancy</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{Math.round(analytics.kpis.bed_occupancy_rate * 100)}%</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4">
          <p className="text-xs text-gray-500 dark:text-gray-400">Referral Completion</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{Math.round(analytics.kpis.referral_completion_rate * 100)}%</p>
        </div>
      </div>

      {/* Triage Performance */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 mb-6">
        <h3 className="font-semibold text-gray-900 dark:text-white mb-4">AI Triage Performance</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
            <p className="text-2xl font-bold text-green-600 dark:text-green-400">{analytics.triagePerformance.accuracy}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">Accuracy</p>
          </div>
          <div className="text-center p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
            <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{analytics.triagePerformance.false_alarms}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">False Alarms</p>
          </div>
          <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{analytics.triagePerformance.concordance}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">Concordance</p>
          </div>
          <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
            <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">{analytics.triagePerformance.detection_time}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">Detection Time</p>
          </div>
        </div>
      </div>

      {/* Consultation Chart - Simple Version */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
        <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Monthly Consultation Volume (2026)</h3>
        <div className="space-y-3">
          {analytics.consultations && analytics.consultations.map((item, idx) => (
            <div key={idx} className="flex items-center gap-4">
              <span className="text-sm text-gray-600 dark:text-gray-400 w-12">{item.month}</span>
              <div className="flex-1 h-8 bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden">
                <div 
                  className="h-full bg-blue-600 dark:bg-blue-400 rounded-lg transition-all"
                  style={{ width: `${(item.consultations / 1500) * 100}%` }}
                ></div>
              </div>
              <span className="text-sm font-medium text-gray-900 dark:text-white">{item.consultations}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}