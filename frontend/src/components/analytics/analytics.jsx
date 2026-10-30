// src/components/analytics/EpidemiologicalAlert.jsx
import { AlertTriangle, MapPin, Calendar, Users, TrendingUp } from 'lucide-react'

export default function EpidemiologicalAlert({ alert }) {
  const getSeverityColor = (severity) => {
    const colors = {
      warning: 'bg-yellow-50 border-yellow-500 text-yellow-800',
      critical: 'bg-red-50 border-red-500 text-red-800',
      info: 'bg-blue-50 border-blue-500 text-blue-800'
    }
    return colors[severity] || colors.info
  }

  if (!alert) return null

  return (
    <div className={`border-l-4 p-4 rounded-lg ${getSeverityColor(alert.severity)}`}>
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-3">
          <AlertTriangle className={`w-5 h-5 mt-0.5 ${alert.severity === 'critical' ? 'text-red-600' : 'text-yellow-600'}`} />
          <div>
            <div className="flex items-center gap-2">
              <span className="font-semibold">{alert.title}</span>
              <span className="text-xs bg-gray-200 px-2 py-0.5 rounded-full">{alert.category}</span>
            </div>
            <p className="text-sm mt-1">{alert.description}</p>
            <div className="flex items-center gap-4 mt-2 text-xs">
              <span className="flex items-center gap-1">
                <MapPin className="w-3 h-3" /> {alert.location}
              </span>
              <span className="flex items-center gap-1">
                <Calendar className="w-3 h-3" /> {alert.timestamp}
              </span>
              <span className="flex items-center gap-1">
                <TrendingUp className="w-3 h-3" /> {alert.trend}
              </span>
            </div>
          </div>
        </div>
        <span className={`text-xs px-2 py-1 rounded-full ${alert.severity === 'critical' ? 'bg-red-600 text-white' : 'bg-yellow-600 text-white'}`}>
          {alert.status}
        </span>
      </div>
    </div>
  )
}