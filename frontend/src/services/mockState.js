// frontend/src/services/mockState.js

import { useState, useEffect } from 'react'

// Initial seed data for the High-Impact Demo Workflow
const INITIAL_DATA = {
  patients: [
    {
      id: 'PT-1001',
      userId: 'demo-sunita-id',
      email: 'sunita@example.com',
      abha_id: '12-3456-7890-1234',
      name: 'Sunita Devi',
      age: 28,
      gender: 'Female',
      village: 'Rampur Khas',
      phone: '+91 9876543210',
      bloodGroup: 'O+',
      status: 'High Risk Pregnancy',
      vitals: {
        bp: '140/90',
        sugar: '110',
        weight: '62 kg',
        temp: '98.6'
      },
      authorizedDoctors: []
    }
  ],
  referrals: [
    {
      id: 'REF-2001',
      patientId: 'PT-1001',
      source: 'ASHA Worker (Sangeeta)',
      target: 'Dr. Arvind Sharma',
      targetFacility: 'CHC Khargone',
      reason: 'High risk pregnancy — elevated BP, gestational diabetes detected',
      urgency: 'High',
      status: 'Accepted',
      notes: 'Patient requires immediate consultation. BP consistently above 140/90.',
      createdAt: '2026-08-26T09:00:00Z',
      updatedAt: '2026-08-26T11:30:00Z'
    }
  ],
  appointments: [
    {
      id: 'APT-3001',
      patientId: 'PT-1001',
      doctor: 'Dr. Arvind Sharma',
      specialty: 'Obstetrics & Gynaecology',
      facility: 'CHC Khargone',
      date: '2026-08-29',
      time: '10:30 AM',
      type: 'In-Person',
      status: 'Confirmed',
      token: 'G-14',
      notes: 'Follow-up for high-risk pregnancy. Bring all previous reports.',
      referralId: 'REF-2001'
    },
    {
      id: 'APT-3002',
      patientId: 'PT-1001',
      doctor: 'Dr. Meena Patel',
      specialty: 'General Medicine',
      facility: 'PHC Rampur',
      date: '2026-08-20',
      time: '09:00 AM',
      type: 'In-Person',
      status: 'Completed',
      token: 'G-05',
      notes: 'Initial BP check and diabetes screening.',
      referralId: null
    }
  ],
  prescriptions: [
    {
      id: 'RX-4001',
      patientId: 'PT-1001',
      doctor: 'Dr. Meena Patel',
      date: '2026-08-20',
      medicines: [
        { name: 'Methyldopa 250mg', frequency: 'Twice daily', duration: '30 days', instructions: 'After meals' },
        { name: 'Folic Acid 5mg', frequency: 'Once daily', duration: '60 days', instructions: 'Morning with water' },
        { name: 'Ferrous Sulfate 200mg', frequency: 'Once daily', duration: '60 days', instructions: 'After dinner' }
      ],
      instructions: 'Monitor BP daily. Rest adequately. Avoid salty food. Return immediately if BP > 160/100.',
      status: 'Active',
      nextReviewDate: '2026-08-29'
    }
  ],
  healthRecords: [
    {
      id: 'HR-5001',
      patientId: 'PT-1001',
      type: 'Lab Report',
      title: 'Blood Sugar & CBC Panel',
      date: '2026-08-20',
      doctor: 'Dr. Meena Patel',
      facility: 'PHC Rampur',
      summary: 'FBS: 110 mg/dL (Borderline), CBC: Mild anaemia detected (Hb: 10.2 g/dL)',
      attachmentType: 'PDF'
    },
    {
      id: 'HR-5002',
      patientId: 'PT-1001',
      type: 'Ultrasound',
      title: 'Obstetric Ultrasound — 28 weeks',
      date: '2026-08-15',
      doctor: 'Dr. Arvind Sharma',
      facility: 'CHC Khargone',
      summary: 'Single live intrauterine fetus. EDD: 2026-11-10. Normal AFI.',
      attachmentType: 'Image'
    },
    {
      id: 'HR-5003',
      patientId: 'PT-1001',
      type: 'Vital Signs',
      title: 'ASHA Home Visit — Vitals',
      date: '2026-08-24',
      doctor: 'ASHA Worker Sangeeta',
      facility: 'Home Visit',
      summary: 'BP: 140/90 mmHg, Weight: 62 kg, Fetal heart rate: 148 bpm (Normal)',
      attachmentType: 'Note'
    }
  ],
  consultations: [],
  queueTokens: []
}

// Local storage persistence wrapper
function loadState() {
  try {
    const saved = localStorage.getItem('medinest_mock_state')
    if (saved) {
      const parsed = JSON.parse(saved)
      return {
        ...INITIAL_DATA,
        ...parsed,
        patients: parsed.patients || INITIAL_DATA.patients,
        appointments: parsed.appointments || INITIAL_DATA.appointments,
        prescriptions: parsed.prescriptions || INITIAL_DATA.prescriptions,
        referrals: parsed.referrals || INITIAL_DATA.referrals,
        healthRecords: parsed.healthRecords || INITIAL_DATA.healthRecords
      }
    }
  } catch (e) {
    console.error('Error loading mock state from localStorage', e)
  }
  return INITIAL_DATA
}

function saveState(state) {
  try {
    localStorage.setItem('medinest_mock_state', JSON.stringify(state))
  } catch (e) {
    console.error('Error saving mock state to localStorage', e)
  }
}

// Global state instance to ensure consistency across components
let globalState = loadState()
let listeners = []

function notifyListeners() {
  saveState(globalState)
  listeners.forEach(listener => listener({ ...globalState }))
}

/**
 * Resolve or initialize patient profile for an authenticated user.
 */
export function getPatientForUser(user) {
  if (!user) return null

  // 1. Look for existing record in state.patients
  let patient = (globalState.patients || []).find(
    p =>
      (user.id && (p.userId === user.id || p.user_id === user.id || p.id === user.id)) ||
      (user.email && p.email?.toLowerCase() === user.email.toLowerCase()) ||
      (user.patientId && p.id === user.patientId)
  )

  // 2. Check local custom saved profile
  let customProfile = {}
  if (user.id) {
    try {
      const saved = localStorage.getItem(`medinest_profile_${user.id}`)
      if (saved) customProfile = JSON.parse(saved)
    } catch (e) {
      console.error(e)
    }
  }

  // 3. If patient doesn't exist in state.patients, create and append it
  if (!patient) {
    const userName =
      customProfile.name ||
      user.name ||
      user.full_name ||
      user.fullName ||
      user.user_metadata?.name ||
      user.user_metadata?.full_name ||
      'Patient'

    patient = {
      id: user.id || `PT-${user.email ? user.email.split('@')[0] : 'USER'}`,
      userId: user.id,
      user_id: user.id,
      name: userName,
      email: user.email || '',
      age: customProfile.age || user.age || null,
      gender: customProfile.gender || user.gender || null,
      village: customProfile.village || customProfile.address || user.village || user.address || 'Not specified',
      phone: customProfile.phone || user.phone || 'Not specified',
      bloodGroup: customProfile.bloodGroup || customProfile.blood_group || user.blood_group || '—',
      abha_id: customProfile.abha_id || customProfile.abhaId || user.abha_id || (user.id ? `ABHA-${user.id.slice(0, 8).toUpperCase()}` : 'Not linked'),
      status: customProfile.status || 'General Care',
      vitals: customProfile.vitals || {
        bp: '120/80',
        sugar: '95',
        weight: '—',
        temp: '98.6'
      },
      authorizedDoctors: []
    }

    globalState.patients.push(patient)
    notifyListeners()
  } else if (Object.keys(customProfile).length > 0) {
    // Merge latest saved profile overrides
    Object.assign(patient, customProfile)
  }

  return patient
}

export const useMockState = () => {
  const [state, setState] = useState(globalState)

  useEffect(() => {
    listeners.push(setState)
    return () => {
      listeners = listeners.filter(l => l !== setState)
    }
  }, [])

  // ----------------------------------------------------
  // PATIENT PROFILE & STATE ACTIONS
  // ----------------------------------------------------

  const updatePatientProfile = (patientId, updates) => {
    const ptIdx = globalState.patients.findIndex(p => p.id === patientId || p.userId === patientId)
    if (ptIdx > -1) {
      globalState.patients[ptIdx] = {
        ...globalState.patients[ptIdx],
        ...updates
      }
      if (globalState.patients[ptIdx].userId) {
        try {
          localStorage.setItem(
            `medinest_profile_${globalState.patients[ptIdx].userId}`,
            JSON.stringify(globalState.patients[ptIdx])
          )
        } catch (e) {
          console.error(e)
        }
      }
      notifyListeners()
      return globalState.patients[ptIdx]
    }
    return null
  }

  const ashaCreateReferral = (patientId, reason, urgency = 'High') => {
    const newReferral = {
      id: `REF-${Math.floor(Math.random() * 10000)}`,
      patientId,
      source: 'ASHA Worker (Sangeeta)',
      target: 'Dr. Sharma (CHC Khargone)',
      reason,
      urgency,
      status: 'Pending',
      createdAt: new Date().toISOString()
    }
    globalState.referrals.push(newReferral)
    notifyListeners()
    return newReferral
  }

  const doctorRequestAccess = (patientId) => {
    const ptIdx = globalState.patients.findIndex(p => p.id === patientId)
    if (ptIdx > -1 && !globalState.patients[ptIdx].authorizedDoctors.includes('Dr. Sharma')) {
      globalState.patients[ptIdx].accessRequestedBy = 'Dr. Sharma'
      notifyListeners()
    }
  }

  const patientGrantAccess = (patientId, doctorName) => {
    const ptIdx = globalState.patients.findIndex(p => p.id === patientId)
    if (ptIdx > -1) {
      if (!globalState.patients[ptIdx].authorizedDoctors) {
        globalState.patients[ptIdx].authorizedDoctors = []
      }
      globalState.patients[ptIdx].authorizedDoctors.push(doctorName)
      globalState.patients[ptIdx].accessRequestedBy = null
      notifyListeners()
    }
  }

  const doctorCreateConsultation = (patientId, diagnosis, notes) => {
    const consultation = {
      id: `CON-${Math.floor(Math.random() * 10000)}`,
      patientId,
      doctor: 'Dr. Sharma',
      diagnosis,
      notes,
      date: new Date().toISOString()
    }
    globalState.consultations.push(consultation)

    // Update referral status if exists
    const refIdx = globalState.referrals.findIndex(r => r.patientId === patientId && r.status === 'Pending')
    if (refIdx > -1) {
      globalState.referrals[refIdx].status = 'Completed'
    }

    notifyListeners()
    return consultation
  }

  const doctorCreatePrescription = (patientId, medicines, instructions) => {
    const prescription = {
      id: `RX-${Math.floor(Math.random() * 10000)}`,
      patientId,
      doctor: 'Dr. Sharma',
      date: new Date().toISOString(),
      medicines,
      instructions
    }
    globalState.prescriptions.push(prescription)
    notifyListeners()
    return prescription
  }

  const hospitalGenerateToken = (department, patientName) => {
    const token = {
      id: `TKN-${Math.floor(Math.random() * 1000)}`,
      tokenNumber: `G-${Math.floor(Math.random() * 100)}`,
      department,
      patientName,
      status: 'Waiting',
      time: new Date().toLocaleTimeString()
    }
    globalState.queueTokens.push(token)
    notifyListeners()
    return token
  }

  const bookAppointment = (appointmentData) => {
    const newAppointment = {
      id: `APT-${Math.floor(Math.random() * 10000)}`,
      type: 'In-Person',
      status: 'Confirmed',
      token: `G-${Math.floor(Math.random() * 50) + 1}`,
      ...appointmentData
    }
    globalState.appointments.push(newAppointment)
    notifyListeners()
    return newAppointment
  }

  const resetDemoState = () => {
    globalState = { ...INITIAL_DATA }
    notifyListeners()
  }

  return {
    state,
    getPatientForUser,
    updatePatientProfile,
    bookAppointment,
    ashaCreateReferral,
    doctorRequestAccess,
    patientGrantAccess,
    doctorCreateConsultation,
    doctorCreatePrescription,
    hospitalGenerateToken,
    resetDemoState
  }
}
