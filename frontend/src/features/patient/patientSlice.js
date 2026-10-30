import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  profile: {
    id: 'PAT-001',
    fullName: 'Yash Choudhary',
    email: 'yash@example.com',
    phone: '+91 98765 43210',
    dateOfBirth: '2004-08-15',
    gender: 'Male',
    bloodGroup: 'B+',
    address: 'Rural Health District, Maharashtra',
    emergencyContact: '+91 98765 40000',
    allergies: ['None known'],
    chronicConditions: ['None']
  },

  medicalHistory: [
    {
      id: 1,
      date: '2026-08-12',
      title: 'General Health Checkup',
      doctor: 'Dr. Ananya Sharma',
      facility: 'District Civil Hospital',
      diagnosis: 'Routine examination',
      notes: 'Vitals stable. No immediate concerns.'
    },
    {
      id: 2,
      date: '2026-07-28',
      title: 'AI Health Assessment',
      doctor: 'MediNest AI',
      facility: 'MediNest',
      diagnosis: 'Low-risk symptoms',
      notes: 'Recommended hydration and routine monitoring.'
    },
    {
      id: 3,
      date: '2026-06-10',
      title: 'Blood Test',
      doctor: 'Dr. Rahul Verma',
      facility: 'Primary Care Clinic',
      diagnosis: 'Routine blood screening',
      notes: 'Results within normal range.'
    }
  ],

  appointments: [
    {
      id: 1,
      doctor: 'Dr. Ananya Sharma',
      specialty: 'General Physician',
      date: '2026-09-05',
      time: '10:30',
      reason: 'Routine consultation',
      status: 'Upcoming'
    }
  ]
}

const patientSlice = createSlice({
  name: 'patient',

  initialState,

  reducers: {
    updateProfile: (state, action) => {
      state.profile = {
        ...state.profile,
        ...action.payload
      }
    },

    addAppointment: (state, action) => {
      state.appointments.push({
        id: Date.now(),
        ...action.payload,
        status: 'Upcoming'
      })
    },

    cancelAppointment: (state, action) => {
      const appointment = state.appointments.find(
        item => item.id === action.payload
      )

      if (appointment) {
        appointment.status = 'Cancelled'
      }
    }
  }
})

export const {
  updateProfile,
  addAppointment,
  cancelAppointment
} = patientSlice.actions

export default patientSlice.reducer