// frontend/src/components/dashboard/PatientDashboard.jsx

import { useMemo } from 'react'
import { motion } from 'framer-motion'
import {
  HeartPulse,
  Calendar,
  FileText,
  Pill,
  Syringe,
  MapPin,
  AlertTriangle,
  ArrowRight,
  Sparkles,
  ShieldCheck,
  GitBranch,
  Activity,
  User,
  Clock,
  Hash,
  Stethoscope,
  ChevronRight,
  Phone
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { useMockState, getPatientForUser } from '../../services/mockState'
import { useAuth } from '../../hooks/useAuth'
import { useLanguage } from '../../i18n/LanguageContext'

export default function PatientDashboard() {
  const { state, patientGrantAccess } = useMockState()
  const { user } = useAuth()
  const { t } = useLanguage()

  /*
   * Resolve the authenticated patient profile.
   * NEVER fallback to demo patient 0 (Sunita Devi) when a different user is logged in.
   */
  const patientData = useMemo(() => {
    if (!user) return null
    return getPatientForUser(user)
  }, [user, state.patients])

  const patientId = patientData?.id || user?.id

  const appointments = useMemo(() => {
    if (!patientId) return []
    return (state.appointments || []).filter(
      appointment =>
        appointment.patientId === patientId ||
        appointment.patientId === user?.id ||
        (user?.email && appointment.patientEmail === user.email)
    )
  }, [state.appointments, patientId, user])

  const upcomingAppt = appointments.find(
    appointment => appointment.status === 'Confirmed' || appointment.status === 'Pending'
  )

  const prescriptions = useMemo(() => {
    if (!patientId) return []
    return (state.prescriptions || []).filter(
      prescription =>
        (prescription.patientId === patientId || prescription.patientId === user?.id) &&
        prescription.status === 'Active'
    )
  }, [state.prescriptions, patientId, user])

  const referrals = useMemo(() => {
    if (!patientId) return []
    return (state.referrals || []).filter(
      referral => referral.patientId === patientId || referral.patientId === user?.id
    )
  }, [state.referrals, patientId, user])

  const latestReferral = referrals[0] || null

  const healthRecords = useMemo(() => {
    if (!patientId) return []
    return (state.healthRecords || []).filter(
      record => record.patientId === patientId || record.patientId === user?.id
    )
  }, [state.healthRecords, patientId, user])

  const displayName =
    patientData?.name ||
    user?.name ||
    user?.full_name ||
    user?.fullName ||
    user?.user_metadata?.name ||
    user?.user_metadata?.full_name ||
    'Patient'

  const firstName = displayName.split(' ')[0] || 'Patient'

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

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-8 px-6 transition-colors">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8"
        >
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-teal-500/10 text-teal-600 dark:text-teal-400 text-xs font-bold uppercase tracking-wider border border-teal-500/20">
                Patient Health Hub
              </span>
              <span className="flex items-center gap-1 text-xs text-slate-400">
                <ShieldCheck className="w-3.5 h-3.5 text-teal-500" /> {t('abdmLinked', 'ABDM Linked & Verified')}
              </span>
            </div>
            <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white mt-1 tracking-tight">
              {t('welcome', 'Welcome')}, {firstName} 👋
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              {t('personalizedDashboard', 'Your personalized health dashboard — records, appointments, and AI triage in one place.')}
            </p>
          </div>

          <motion.a
            href="tel:112"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="self-start sm:self-center bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white px-5 py-3 rounded-2xl flex items-center gap-2.5 shadow-lg shadow-rose-600/30 text-sm font-bold tracking-wide transition"
          >
            <Phone className="w-5 h-5 animate-pulse" />
            {t('sosEmergency', 'SOS Emergency (112)')}
          </motion.a>
        </motion.div>

        {/* Health Summary Banner */}
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="relative overflow-hidden bg-gradient-to-r from-teal-700 via-cyan-700 to-teal-800 rounded-3xl p-8 text-white shadow-xl shadow-teal-900/15 mb-8"
        >
          <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-teal-400/20 rounded-full blur-3xl pointer-events-none" />
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-center gap-5">
              <div className="w-16 h-16 bg-white rounded-2xl p-2 flex items-center justify-center shadow-md flex-shrink-0">
                <img src="/logo.png" alt="MediNest Logo" className="w-full h-full object-contain" />
              </div>
              <div>
                <p className="text-teal-200 text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" /> {t('aiHealthStatus', 'AI Health Status')}
                </p>
                <h2 className="text-2xl font-bold mt-0.5">
                  {patientData?.status || t('healthRecordsUpToDate', 'Health records up to date')}
                </h2>
                <p className="text-sm text-teal-100/90 mt-1">
                  {t('abhaId', 'ABHA ID')}: {patientData?.abha_id || t('notProvided', 'Not linked')} • {t('consentVerified', 'Consent verified')}
                </p>
              </div>
            </div>
            <Link
              to="/patient/triage"
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-white text-teal-900 font-bold text-sm shadow-md hover:bg-teal-50 transition transform hover:-translate-y-0.5"
            >
              {t('startAITriage', 'Start AI Triage')}
              <ArrowRight className="w-4 h-4 text-teal-700" />
            </Link>
          </div>
        </motion.div>

        {/* Stats Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-8"
        >
          <Stat
            variants={itemVariants}
            icon={Calendar}
            title={t('nextAppointment', 'Next Appointment')}
            value={upcomingAppt ? new Date(upcomingAppt.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) : 'None'}
            detail={upcomingAppt ? `${upcomingAppt.time} • ${upcomingAppt.doctor}` : t('noUpcomingAppointments', 'No upcoming visits')}
            color="teal"
            to="/patient/appointments"
          />
          <Stat
            variants={itemVariants}
            icon={Pill}
            title={t('activeMedicines', 'Active Medicines')}
            value={prescriptions.length > 0 ? `${prescriptions.reduce((acc, rx) => acc + (rx.medicines?.length || 0), 0)} Medicines` : '0 Medicines'}
            detail={prescriptions.length > 0 && prescriptions[0].medicines?.length > 0 ? prescriptions[0].medicines.map(m => m.name.split(' ')[0]).slice(0, 2).join(', ') : t('noActivePrescriptions', 'No prescriptions')}
            color="cyan"
            to="/patient/prescriptions"
          />
          <Stat
            variants={itemVariants}
            icon={FileText}
            title={t('healthRecords', 'Health Records')}
            value={`${healthRecords.length} Files`}
            detail={healthRecords.length > 0 ? 'Lab reports, scans, vitals' : t('noRecordsFound', 'No records yet')}
            color="indigo"
            to="/patient/records"
          />
          <Stat
            variants={itemVariants}
            icon={GitBranch}
            title={t('referrals', 'Referrals')}
            value={`${referrals.length} Active`}
            detail={latestReferral ? latestReferral.target : t('noReferralsYet', 'No referrals yet')}
            color="emerald"
            to="/patient/referrals"
          />
        </motion.div>

        {/* Doctor Access Consent Banner */}
        {patientData?.accessRequestedBy && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 rounded-3xl p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-amber-100 dark:bg-amber-900/50 rounded-2xl flex items-center justify-center text-amber-600 dark:text-amber-400">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white text-lg">
                  Consent Request: {patientData.accessRequestedBy}
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                  {patientData.accessRequestedBy} is requesting access to your medical history for your upcoming consultation.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button className="px-5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-sm font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition">
                Deny
              </button>
              <button
                onClick={() => patientGrantAccess(patientId, patientData.accessRequestedBy)}
                className="px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-sm font-bold shadow-md shadow-teal-500/20 transition"
              >
                Approve Access
              </button>
            </div>
          </motion.div>
        )}

        {/* 3-column detail grid */}
        <div className="grid lg:grid-cols-3 gap-6 mb-8">

          {/* Patient Profile */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-teal-500 to-emerald-600 flex items-center justify-center text-white font-extrabold text-xl shadow-md">
                  {displayName?.charAt(0) || 'P'}
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 dark:text-white">{displayName}</h3>
                  <p className="text-xs text-slate-400">{patientData?.village || t('notSpecified', 'Location not set')}</p>
                </div>
              </div>
              <Link to="/patient/profile" className="text-xs font-semibold text-teal-600 dark:text-teal-400 hover:underline">
                {t('editProfile', 'Edit Profile')}
              </Link>
            </div>

            <div className="space-y-2 text-xs">
              {[
                { label: t('abhaId', 'ABHA ID'), value: patientData?.abha_id || t('notProvided', 'Not linked') },
                {
                  label: `${t('age', 'Age')} / ${t('gender', 'Gender')}`,
                  value: patientData?.age
                    ? `${patientData.age} ${t('yearsOld', 'yrs')} • ${patientData.gender || t('notSpecified', 'Not specified')}`
                    : (patientData?.gender || t('notSpecified', 'Not specified'))
                },
                { label: t('bloodGroup', 'Blood Group'), value: patientData?.bloodGroup || '—' },
                { label: t('phoneNumber', 'Phone'), value: patientData?.phone || t('notSpecified', 'Not specified') }
              ].map(({ label, value }) => (
                <div key={label} className="flex justify-between items-center py-1.5 border-b border-slate-100 dark:border-slate-800 last:border-0">
                  <span className="text-slate-400 font-medium">{label}</span>
                  <span className="font-bold text-slate-700 dark:text-slate-300">{value}</span>
                </div>
              ))}
            </div>

            <div className="mt-4">
              <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider mb-2">Latest Vitals</p>
              <div className="grid grid-cols-2 gap-2">
                {Object.entries(patientData?.vitals || { bp: '120/80', sugar: '95', weight: '—', temp: '98.6' }).map(([key, val]) => (
                  <div key={key} className="bg-slate-50 dark:bg-slate-800 rounded-xl p-2.5 border border-slate-100 dark:border-slate-700">
                    <p className="text-[10px] text-slate-400 uppercase tracking-wide">{key.replace('_', ' ')}</p>
                    <p className="font-extrabold text-slate-800 dark:text-slate-200 text-sm mt-0.5">{val}</p>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Upcoming Appointment */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-slate-800 dark:text-white flex items-center gap-2">
                <Calendar className="w-4 h-4 text-teal-500" /> {t('nextAppointment', 'Next Appointment')}
              </h3>
              <Link to="/patient/appointments" className="text-xs text-teal-600 hover:underline flex items-center gap-1">
                {t('viewAll', 'All')} <ChevronRight className="w-3 h-3" />
              </Link>
            </div>
            {upcomingAppt ? (
              <div>
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-16 h-16 rounded-2xl bg-teal-50 dark:bg-teal-950/40 flex flex-col items-center justify-center border border-teal-100 dark:border-teal-900 flex-shrink-0">
                    <p className="text-xs font-semibold text-teal-600 uppercase tracking-wider">
                      {new Date(upcomingAppt.date).toLocaleDateString('en-IN', { month: 'short' })}
                    </p>
                    <p className="text-2xl font-extrabold text-teal-700 dark:text-teal-300 leading-none">
                      {new Date(upcomingAppt.date).getDate()}
                    </p>
                  </div>
                  <div>
                    <p className="font-bold text-slate-900 dark:text-white">{upcomingAppt.doctor}</p>
                    <p className="text-xs text-teal-600 dark:text-teal-400">{upcomingAppt.specialty}</p>
                    <div className="flex flex-wrap gap-2 mt-1.5 text-xs text-slate-500 dark:text-slate-400">
                      <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {upcomingAppt.time}</span>
                      <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {upcomingAppt.facility}</span>
                    </div>
                  </div>
                </div>
                {upcomingAppt.token && (
                  <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 rounded-xl p-3 flex items-center gap-2 text-sm font-bold text-amber-700 dark:text-amber-400">
                    <Hash className="w-4 h-4" /> Queue Token: {upcomingAppt.token}
                  </div>
                )}
                {upcomingAppt.notes && (
                  <p className="text-xs text-slate-500 mt-3 bg-slate-50 dark:bg-slate-800 rounded-lg px-3 py-2">
                    📋 {upcomingAppt.notes}
                  </p>
                )}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-10 text-center">
                <Calendar className="w-10 h-10 text-slate-300 dark:text-slate-700 mb-2" />
                <p className="text-sm text-slate-400">{t('noUpcomingAppointments', 'No upcoming appointments scheduled')}</p>
                <Link to="/patient/appointments" className="mt-3 text-xs text-teal-600 dark:text-teal-400 font-semibold hover:underline">
                  {t('bookConsultation', 'Schedule an Appointment')} →
                </Link>
              </div>
            )}
          </motion.div>

          {/* Referral Status */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-slate-800 dark:text-white flex items-center gap-2">
                <GitBranch className="w-4 h-4 text-indigo-500" /> {t('referralStatus', 'Referral Status')}
              </h3>
              <Link to="/patient/referrals" className="text-xs text-teal-600 hover:underline flex items-center gap-1">
                {t('viewAll', 'All')} <ChevronRight className="w-3 h-3" />
              </Link>
            </div>
            {latestReferral ? (
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${latestReferral.status === 'Accepted'
                    ? 'bg-teal-50 dark:bg-teal-950/40 text-teal-700 dark:text-teal-300 border-teal-200 dark:border-teal-800'
                    : 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800'
                    }`}>
                    {latestReferral.status}
                  </span>
                  <span className="text-xs text-slate-400">{latestReferral.id}</span>
                </div>
                <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 mb-1">{latestReferral.target}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">{latestReferral.targetFacility}</p>
                <div className="mt-3 bg-slate-50 dark:bg-slate-800 rounded-xl p-3 border border-slate-100 dark:border-slate-700">
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{latestReferral.reason}</p>
                </div>
                <p className="text-xs text-slate-400 mt-2 flex items-center gap-1">
                  <User className="w-3 h-3" /> By: {latestReferral.source}
                </p>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-10 text-center">
                <GitBranch className="w-10 h-10 text-slate-300 dark:text-slate-700 mb-2" />
                <p className="text-sm text-slate-400">{t('noReferralsYet', 'No referrals yet')}</p>
              </div>
            )}
          </motion.div>
        </div>

        {/* Active Prescriptions */}
        {prescriptions.length > 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
            className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm mb-8"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-slate-800 dark:text-white flex items-center gap-2">
                <Pill className="w-4 h-4 text-cyan-500" /> {t('activeMedicines', 'Active Prescriptions')}
              </h3>
              <Link to="/patient/prescriptions" className="text-xs text-teal-600 hover:underline flex items-center gap-1">
                {t('viewAll', 'View All')} <ChevronRight className="w-3 h-3" />
              </Link>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              {prescriptions.map(rx => (
                <div key={rx.id} className="bg-slate-50 dark:bg-slate-800 rounded-2xl p-4 border border-slate-100 dark:border-slate-700">
                  <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider mb-2">
                    By {rx.doctor} — {new Date(rx.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                  </p>
                  <div className="space-y-1.5">
                    {(rx.medicines || []).map((med, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-sm">
                        <div className="w-5 h-5 rounded-full bg-cyan-100 dark:bg-cyan-900/40 flex items-center justify-center text-[10px] font-bold text-cyan-600 flex-shrink-0">
                          {idx + 1}
                        </div>
                        <span className="font-semibold text-slate-700 dark:text-slate-300">{med.name}</span>
                        <span className="text-slate-400 text-xs">— {med.frequency}</span>
                      </div>
                    ))}
                  </div>
                  {rx.nextReviewDate && (
                    <p className="text-xs text-amber-600 dark:text-amber-400 mt-2 font-semibold">
                      ⏰ Review: {new Date(rx.nextReviewDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </motion.div>
        ) : null}

        {/* Quick Action Cards */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid md:grid-cols-3 gap-6"
        >
          <ActionCard
            variants={itemVariants}
            to="/patient/triage"
            icon={Stethoscope}
            title={t('launchAITriage', 'AI Symptom Checker')}
            description="Describe your symptoms for instant AI triage risk assessment and guidance."
            badge="AI Powered"
            accent="teal"
          />
          <ActionCard
            variants={itemVariants}
            to="/patient/schemes"
            icon={MapPin}
            title={t('exploreSchemes', 'Government Schemes')}
            description="Auto-check PM-JAY, PMMVY and other health scheme eligibility."
            badge="Auto-Match"
            accent="indigo"
          />
          <ActionCard
            variants={itemVariants}
            to="/patient/records"
            icon={Activity}
            title={t('healthRecords', 'Health Timeline')}
            description="Access longitudinal health records, lab reports, and vitals securely."
            badge="ABDM Linked"
            accent="cyan"
          />
        </motion.div>
      </div>
    </div>
  )
}

function Stat({ variants, icon: Icon, title, value, detail, color, to }) {
  const iconColors = {
    teal: 'bg-teal-50 text-teal-600 dark:bg-teal-950/50 dark:text-teal-400',
    cyan: 'bg-cyan-50 text-cyan-600 dark:bg-cyan-950/50 dark:text-cyan-400',
    indigo: 'bg-indigo-50 text-indigo-600 dark:bg-indigo-950/50 dark:text-indigo-400',
    emerald: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400'
  }

  const card = (
    <motion.div
      variants={variants}
      whileHover={{ y: -4, scale: 1.01 }}
      className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm border border-slate-200/80 dark:border-slate-800 transition h-full"
    >
      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-4 ${iconColors[color] || iconColors.teal}`}>
        <Icon className="w-6 h-6" />
      </div>
      <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{title}</p>
      <p className="text-2xl font-extrabold text-slate-900 dark:text-white mt-0.5">{value}</p>
      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{detail}</p>
    </motion.div>
  )

  return to ? <Link to={to} className="block">{card}</Link> : card
}

function ActionCard({ variants, to, icon: Icon, title, description, badge, accent }) {
  const accentMap = {
    teal: 'group-hover:bg-teal-600 group-hover:text-white bg-teal-50 dark:bg-teal-950/50 text-teal-600 dark:text-teal-400',
    indigo: 'group-hover:bg-indigo-600 group-hover:text-white bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400',
    cyan: 'group-hover:bg-cyan-600 group-hover:text-white bg-cyan-50 dark:bg-cyan-950/50 text-cyan-600 dark:text-cyan-400'
  }

  return (
    <motion.div variants={variants} whileHover={{ y: -6 }}>
      <Link
        to={to}
        className="group relative block bg-white dark:bg-slate-900 rounded-3xl p-7 text-left border border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-xl hover:border-teal-400/50 transition-all duration-300 overflow-hidden"
      >
        <div className="flex items-center justify-between mb-4">
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition duration-300 ${accentMap[accent] || accentMap.teal}`}>
            <Icon className="w-6 h-6" />
          </div>
          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
            {badge}
          </span>
        </div>
        <h3 className="font-bold text-lg text-slate-900 dark:text-white group-hover:text-teal-600 dark:group-hover:text-teal-400 transition">
          {title}
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
          {description}
        </p>
        <div className="flex items-center justify-end mt-6 text-teal-600 dark:text-teal-400 font-semibold text-xs gap-1 group-hover:translate-x-1 transition">
          Launch <ArrowRight className="w-4 h-4" />
        </div>
      </Link>
    </motion.div>
  )
}