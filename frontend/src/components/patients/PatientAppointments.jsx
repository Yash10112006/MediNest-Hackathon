// frontend/src/components/patients/PatientAppointments.jsx

import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Calendar,
  Clock,
  MapPin,
  Stethoscope,
  CheckCircle,
  AlertCircle,
  Hash,
  ArrowRight,
  Phone,
  Plus,
  X
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { useMockState, getPatientForUser } from '../../services/mockState'
import { useAuth } from '../../hooks/useAuth'
import { useLanguage } from '../../i18n/LanguageContext'

const statusConfig = {
  Confirmed: {
    color: 'bg-teal-50 dark:bg-teal-950/40 text-teal-700 dark:text-teal-300 border-teal-200 dark:border-teal-800',
    dot: 'bg-teal-500',
    icon: CheckCircle
  },
  Completed: {
    color: 'bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700',
    dot: 'bg-slate-400',
    icon: CheckCircle
  },
  Pending: {
    color: 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800',
    dot: 'bg-amber-500',
    icon: AlertCircle
  },
  Cancelled: {
    color: 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800',
    dot: 'bg-rose-500',
    icon: AlertCircle
  }
}

export default function PatientAppointments() {
  const { state, bookAppointment } = useMockState()
  const { user } = useAuth()
  const { t } = useLanguage()

  const patient = useMemo(() => {
    if (!user) return null
    return getPatientForUser(user)
  }, [user, state.patients])

  const patientId = patient?.id || user?.id

  const appointments = useMemo(() => {
    if (!patientId) return []
    return (state.appointments || []).filter(
      a =>
        a.patientId === patientId ||
        a.patientId === user?.id ||
        (user?.email && a.patientEmail === user.email)
    )
  }, [state.appointments, patientId, user])

  const upcoming = appointments.filter(a => a.status === 'Confirmed' || a.status === 'Pending')
  const past = appointments.filter(a => a.status === 'Completed' || a.status === 'Cancelled')

  const [bookingOpen, setBookingOpen] = useState(false)
  const [form, setForm] = useState({
    doctor: 'Dr. Arvind Sharma',
    specialty: 'General Medicine',
    facility: 'CHC Khargone',
    date: new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0],
    time: '10:30 AM',
    notes: ''
  })

  const handleBook = e => {
    e.preventDefault()
    if (!form.date || !form.time) return

    bookAppointment({
      patientId,
      patientName: patient?.name || user?.name || 'Patient',
      patientEmail: user?.email,
      doctor: form.doctor,
      specialty: form.specialty,
      facility: form.facility,
      date: form.date,
      time: form.time,
      notes: form.notes,
      status: 'Confirmed'
    })

    setBookingOpen(false)
    setForm({
      doctor: 'Dr. Arvind Sharma',
      specialty: 'General Medicine',
      facility: 'CHC Khargone',
      date: new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0],
      time: '10:30 AM',
      notes: ''
    })
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.08, delayChildren: 0.1 } }
  }
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 260, damping: 20 } }
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-8 px-6 transition-colors">
      <div className="max-w-4xl mx-auto">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8"
        >
          <div>
            <span className="px-2.5 py-0.5 rounded-full bg-teal-500/10 text-teal-600 dark:text-teal-400 text-xs font-bold uppercase tracking-wider border border-teal-500/20">
              {t('myAppointments', 'My Appointments')}
            </span>
            <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white mt-1 tracking-tight">
              {t('appointments', 'Appointments')}
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              {t('appointmentsSubtitle', 'Your personal consultation history and upcoming appointments')}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setBookingOpen(true)}
              className="px-4 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-sm font-bold shadow-md shadow-teal-500/20 flex items-center gap-1.5 transition"
            >
              <Plus className="w-4 h-4" /> {t('bookNewAppointment', 'Book Appointment')}
            </button>
            <Link
              to="/patient/dashboard"
              className="text-sm text-slate-500 dark:text-slate-400 hover:text-teal-600 transition"
            >
              ← {t('backToDashboard', 'Back to Dashboard')}
            </Link>
          </div>
        </motion.div>

        {/* Emergency strip */}
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="relative overflow-hidden bg-gradient-to-r from-rose-700 to-red-700 rounded-2xl p-4 text-white mb-8 flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <Phone className="w-5 h-5 animate-pulse" />
            <div>
              <p className="font-bold text-sm">Medical Emergency?</p>
              <p className="text-xs text-rose-200">Call 108 (Ambulance) or 112 (Emergency)</p>
            </div>
          </div>
          <a href="tel:108" className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-xl text-sm font-bold transition">
            Call 108
          </a>
        </motion.div>

        {/* Booking Modal */}
        <AnimatePresence>
          {bookingOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4"
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl border border-slate-200 dark:border-slate-800"
              >
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                    {t('bookNewAppointment', 'Book Appointment')}
                  </h3>
                  <button
                    onClick={() => setBookingOpen(false)}
                    className="p-1 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <form onSubmit={handleBook} className="space-y-4 text-sm">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                      {t('selectDoctor', 'Select Doctor')}
                    </label>
                    <select
                      value={form.doctor}
                      onChange={e => {
                        const doc = e.target.value
                        let spec = 'General Medicine'
                        let fac = 'CHC Khargone'
                        if (doc.includes('Rao')) { spec = 'Cardiology'; fac = 'District Hospital Indore' }
                        if (doc.includes('Patel')) { spec = 'Pediatrics'; fac = 'PHC Kasrawad' }
                        if (doc.includes('Verma')) { spec = 'Gynecology'; fac = 'CHC Sanawad' }
                        setForm({ ...form, doctor: doc, specialty: spec, facility: fac })
                      }}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-white"
                    >
                      <option value="Dr. Arvind Sharma">Dr. Arvind Sharma (General Medicine • CHC Khargone)</option>
                      <option value="Dr. Ramesh Rao">Dr. Ramesh Rao (Cardiology • District Hospital Indore)</option>
                      <option value="Dr. Sneha Patel">Dr. Sneha Patel (Pediatrics • PHC Kasrawad)</option>
                      <option value="Dr. Ananya Verma">Dr. Ananya Verma (Gynecology • CHC Sanawad)</option>
                    </select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                        {t('selectDate', 'Date')}
                      </label>
                      <input
                        type="date"
                        required
                        value={form.date}
                        onChange={e => setForm({ ...form, date: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                        {t('selectTime', 'Time Slot')}
                      </label>
                      <select
                        value={form.time}
                        onChange={e => setForm({ ...form, time: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-white"
                      >
                        <option value="09:30 AM">09:30 AM</option>
                        <option value="10:30 AM">10:30 AM</option>
                        <option value="11:30 AM">11:30 AM</option>
                        <option value="02:30 PM">02:30 PM</option>
                        <option value="03:30 PM">03:30 PM</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                      {t('reasonForVisit', 'Reason for Visit / Symptoms')}
                    </label>
                    <textarea
                      rows={2}
                      value={form.notes}
                      onChange={e => setForm({ ...form, notes: e.target.value })}
                      placeholder="e.g. Regular follow up, seasonal cough, hypertension review"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-white"
                    />
                  </div>
                  <div className="flex justify-end gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setBookingOpen(false)}
                      className="px-4 py-2 rounded-xl text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
                    >
                      {t('cancel', 'Cancel')}
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold shadow-md"
                    >
                      {t('confirmAppointment', 'Confirm Booking')}
                    </button>
                  </div>
                </form>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Upcoming */}
        <section className="mb-10">
          <h2 className="text-lg font-bold text-slate-800 dark:text-slate-200 mb-4 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-teal-500 animate-pulse" />
            {t('upcoming', 'Upcoming')} ({upcoming.length})
          </h2>
          {upcoming.length === 0 ? (
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-10 text-center border border-slate-200 dark:border-slate-800">
              <Calendar className="w-12 h-12 text-slate-300 dark:text-slate-700 mx-auto mb-3" />
              <p className="text-slate-500 dark:text-slate-400 font-medium">{t('noUpcomingAppointments', 'No upcoming appointments')}</p>
              <p className="text-xs text-slate-400 mt-1">Click "Book Appointment" above to schedule a consultation</p>
            </div>
          ) : (
            <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-4">
              {upcoming.map(appt => (
                <AppointmentCard key={appt.id} appt={appt} variants={itemVariants} />
              ))}
            </motion.div>
          )}
        </section>

        {/* Past */}
        {past.length > 0 && (
          <section>
            <h2 className="text-lg font-bold text-slate-800 dark:text-slate-200 mb-4 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-slate-400" />
              {t('completed', 'Past Appointments')} ({past.length})
            </h2>
            <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-4">
              {past.map(appt => (
                <AppointmentCard key={appt.id} appt={appt} variants={itemVariants} dimmed />
              ))}
            </motion.div>
          </section>
        )}
      </div>
    </div>
  )
}

function AppointmentCard({ appt, variants, dimmed }) {
  const cfg = statusConfig[appt.status] || statusConfig.Confirmed

  return (
    <motion.div
      variants={variants}
      whileHover={{ y: -3 }}
      className={`bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm transition-all duration-300 ${dimmed ? 'opacity-60' : ''}`}
    >
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div className="flex items-start gap-4">
          {/* Date Block */}
          <div className="flex-shrink-0 w-16 h-16 rounded-2xl bg-teal-50 dark:bg-teal-950/40 flex flex-col items-center justify-center border border-teal-100 dark:border-teal-900">
            <p className="text-xs font-semibold text-teal-600 dark:text-teal-400 uppercase tracking-wider">
              {new Date(appt.date).toLocaleDateString('en-IN', { month: 'short' })}
            </p>
            <p className="text-2xl font-extrabold text-teal-700 dark:text-teal-300 leading-none">
              {new Date(appt.date).getDate()}
            </p>
          </div>

          <div>
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <h3 className="font-bold text-slate-900 dark:text-white text-base">{appt.doctor}</h3>
              <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${cfg.color}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
                {appt.status}
              </span>
            </div>
            <p className="text-xs text-teal-600 dark:text-teal-400 font-medium">{appt.specialty}</p>
            <div className="flex flex-wrap gap-3 mt-2.5 text-xs text-slate-500 dark:text-slate-400">
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" /> {appt.time}
              </span>
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5" /> {appt.facility}
              </span>
              <span className="flex items-center gap-1">
                <Stethoscope className="w-3.5 h-3.5" /> {appt.type || 'In-Person'}
              </span>
              {appt.token && (
                <span className="flex items-center gap-1 text-amber-600 dark:text-amber-400 font-bold">
                  <Hash className="w-3.5 h-3.5" /> Token: {appt.token}
                </span>
              )}
            </div>
            {appt.notes && (
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 bg-slate-50 dark:bg-slate-800 rounded-lg px-3 py-1.5 border border-slate-100 dark:border-slate-700">
                📋 {appt.notes}
              </p>
            )}
          </div>
        </div>
        {appt.status === 'Confirmed' && (
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Link
              to="/patient/records"
              className="flex-shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold shadow-md shadow-teal-500/20 transition"
            >
              View Records <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </motion.div>
        )}
      </div>
    </motion.div>
  )
}
