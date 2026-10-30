import { useState, useEffect } from 'react'
import { Search, UserCircle, Calendar, Pill } from 'lucide-react'

export default function PatientRecords() {
  const [patients, setPatients] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    // Mock data — replace with API call
    setPatients([
      { id: 1, name: 'Sunita Devi', abha_id: 'ABHA-1234567890', age: 28, gender: 'Female', blood_group: 'O+', last_visit: '2026-08-25', conditions: ['Gestational Diabetes'], medications: ['Insulin 10 units'] },
      { id: 2, name: 'Ramesh Kumar', abha_id: 'ABHA-0987654321', age: 55, gender: 'Male', blood_group: 'B+', last_visit: '2026-08-20', conditions: ['Hypertension', 'Type 2 Diabetes'], medications: ['Amlodipine 5mg', 'Metformin 500mg'] }
    ])
    setLoading(false)
  }, [])

  const filteredPatients = patients.filter(p =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.abha_id.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <div><h1 className="text-3xl font-bold text-gray-900">Patient Records</h1><p className="text-gray-600">Manage and view patient medical records</p></div>
          <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition">+ Add Patient</button>
        </div>
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input type="text" placeholder="Search patients by name or ABHA ID..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
        </div>
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          {loading ? <div className="text-center py-12 text-gray-500">Loading patients...</div>
            : filteredPatients.length === 0 ? <div className="text-center py-12 text-gray-500">No patients found</div>
            : (
              <div className="divide-y divide-gray-200">
                {filteredPatients.map((patient) => (
                  <div key={patient.id} className="p-4 hover:bg-gray-50 transition cursor-pointer">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4">
                        <UserCircle className="w-12 h-12 text-gray-400" />
                        <div>
                          <h3 className="font-semibold text-gray-900">{patient.name}</h3>
                          <div className="flex flex-wrap gap-2 mt-1 text-sm text-gray-600">
                            <span>{patient.abha_id}</span><span>•</span><span>{patient.age} yrs</span><span>•</span>
                            <span>{patient.gender}</span><span>•</span><span>Blood Group: {patient.blood_group}</span>
                          </div>
                          <div className="flex flex-wrap gap-2 mt-2">
                            {patient.conditions?.map((cond, idx) => <span key={idx} className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">{cond}</span>)}
                          </div>
                          <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                            <span className="flex items-center gap-1"><Calendar className="w-4 h-4" /> Last visit: {patient.last_visit}</span>
                            <span className="flex items-center gap-1"><Pill className="w-4 h-4" /> {patient.medications?.length || 0} medications</span>
                          </div>
                        </div>
                      </div>
                      <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">View Records →</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
        </div>
      </div>
    </div>
  )
}