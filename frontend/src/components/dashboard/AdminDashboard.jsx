import { useState, useEffect } from 'react'
import { useAuth } from '../../hooks/useAuth'
import { Users, Hospital, Calendar, Activity, UserPlus, Pill } from 'lucide-react'

export default function AdminDashboard() {
  const { user } = useAuth()
  const [stats, setStats] = useState({ totalPatients: 0, totalDoctors: 0, totalHospitals: 0, todayAppointments: 0, pendingReferrals: 0, stockAlerts: 0 })

  useEffect(() => {
    setStats({ totalPatients: 284, totalDoctors: 12, totalHospitals: 3, todayAppointments: 45, pendingReferrals: 8, stockAlerts: 3 })
  }, [])

  const statCards = [
    { title: 'Total Patients', value: stats.totalPatients, icon: Users, color: 'bg-blue-500' },
    { title: 'Total Doctors', value: stats.totalDoctors, icon: UserPlus, color: 'bg-green-500' },
    { title: 'Hospitals', value: stats.totalHospitals, icon: Hospital, color: 'bg-purple-500' },
    { title: "Today's Appointments", value: stats.todayAppointments, icon: Calendar, color: 'bg-indigo-500' },
    { title: 'Pending Referrals', value: stats.pendingReferrals, icon: Activity, color: 'bg-yellow-500' },
    { title: 'Stock Alerts', value: stats.stockAlerts, icon: Pill, color: 'bg-red-500' }
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8"><h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1><p className="text-gray-600">Welcome back, {user?.user_metadata?.name || 'Admin'}</p></div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          {statCards.map((stat, index) => (
            <div key={index} className="bg-white rounded-xl shadow-sm p-4 text-center">
              <div className={`inline-flex p-2 rounded-lg ${stat.color} text-white mb-2`}><stat.icon className="w-5 h-5" /></div>
              <p className="text-xl font-bold text-gray-900">{stat.value}</p>
              <p className="text-xs text-gray-500">{stat.title}</p>
            </div>
          ))}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition"><h3 className="font-semibold text-gray-900">📊 Reports</h3><p className="text-sm text-gray-600 mt-1">View facility performance</p><button className="mt-3 text-blue-600 text-sm font-medium">Generate Report →</button></div>
          <div className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition"><h3 className="font-semibold text-gray-900">📋 Manage Doctors</h3><p className="text-sm text-gray-600 mt-1">Add or remove doctors</p><button className="mt-3 text-blue-600 text-sm font-medium">Manage →</button></div>
          <div className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition"><h3 className="font-semibold text-gray-900">💊 Stock Alerts</h3><p className="text-sm text-gray-600 mt-1">{stats.stockAlerts} medicine items need attention</p><button className="mt-3 text-blue-600 text-sm font-medium">View Alerts →</button></div>
        </div>
      </div>
    </div>
  )
}