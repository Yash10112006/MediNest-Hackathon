// frontend/src/pages/patient/PatientProfile.jsx
// MediNest Patient Profile — Clean, Accessible, ABDM/Healthcare Standard

import { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Droplets,
  HeartPulse,
  Activity,
  FileText,
  Pill,
  ShieldCheck,
  Edit3,
  Save,
  X,
  AlertCircle,
  CheckCircle2,
  AlertTriangle,
  HeartHandshake,
  ArrowLeft,
  IdCard,
  Building2,
  Sparkles
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { useMockState, getPatientForUser } from '../../services/mockState'
import { useLanguage } from '../../i18n/LanguageContext'
import api from '../../services/api'

export default function PatientProfile() {
  const { user } = useAuth()
  const { state, updatePatientProfile } = useMockState()
  const { t } = useLanguage()

  /*
   * Resolve the authenticated patient profile.
   * NEVER fallback to demo patient 0 (Sunita Devi) or PT-1001.
   */
  const patientData = useMemo(() => {
    if (!user) return null
    return getPatientForUser(user)
  }, [user, state.patients])

  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)
  const [validationError, setValidationError] = useState('')

  // Profile Form State
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    age: '',
    gender: '',
    bloodGroup: '',
    address: '',
    emergencyContact: '',
    abhaId: '',
    allergies: '',
    existingConditions: '',
    currentMedications: ''
  })

  // Initialize and sync form data with authenticated user profile
  useEffect(() => {
    if (user || patientData) {
      // Check for locally saved custom profile
      let customProfile = {}
      if (user?.id) {
        try {
          const saved = localStorage.getItem(`medinest_profile_${user.id}`)
          if (saved) customProfile = JSON.parse(saved)
        } catch (e) {
          console.error(e)
        }
      }

      const rawAllergies = customProfile.allergies ?? patientData?.allergies ?? user?.allergies
      const allergiesStr = Array.isArray(rawAllergies) ? rawAllergies.join(', ') : (rawAllergies || '')

      const rawConditions = customProfile.existingConditions ?? customProfile.existing_conditions ?? patientData?.existing_conditions ?? user?.existing_conditions
      const conditionsStr = Array.isArray(rawConditions) ? rawConditions.join(', ') : (rawConditions || '')

      const rawMeds = customProfile.currentMedications ?? customProfile.current_medications ?? patientData?.current_medications ?? user?.current_medications
      const medsStr = Array.isArray(rawMeds) ? rawMeds.join(', ') : (rawMeds || '')

      const nameVal =
        customProfile.name ||
        patientData?.name ||
        user?.name ||
        user?.full_name ||
        user?.fullName ||
        user?.user_metadata?.name ||
        user?.user_metadata?.full_name ||
        ''

      const phoneVal =
        customProfile.phone ||
        (patientData?.phone && patientData.phone !== 'Not specified' ? patientData.phone : '') ||
        user?.phone ||
        ''

      const addressVal =
        customProfile.village ||
        customProfile.address ||
        (patientData?.village && patientData.village !== 'Not specified' ? patientData.village : '') ||
        patientData?.address ||
        user?.village ||
        user?.address ||
        ''

      const bloodGroupVal =
        customProfile.bloodGroup ||
        customProfile.blood_group ||
        (patientData?.bloodGroup && patientData.bloodGroup !== '—' ? patientData.bloodGroup : '') ||
        user?.blood_group ||
        ''

      const abhaVal =
        customProfile.abha_id ||
        customProfile.abhaId ||
        (patientData?.abha_id && !patientData.abha_id.includes('XXXX') ? patientData.abha_id : '') ||
        user?.abha_id ||
        (user?.id ? `ABHA-${user.id.slice(0, 8).toUpperCase()}` : '')

      setFormData({
        name: nameVal,
        email: user?.email || patientData?.email || '',
        phone: phoneVal,
        age: customProfile.age ?? patientData?.age ?? user?.age ?? '',
        gender: customProfile.gender ?? patientData?.gender ?? user?.gender ?? '',
        bloodGroup: bloodGroupVal,
        address: addressVal,
        emergencyContact: customProfile.emergencyContact ?? patientData?.emergencyContact ?? user?.emergency_contact ?? '',
        abhaId: abhaVal,
        allergies: allergiesStr,
        existingConditions: conditionsStr,
        currentMedications: medsStr
      })
    }
  }, [user, patientData])

  // Handle Form Change
  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    if (validationError) setValidationError('')
  }

  // Handle Profile Save
  const handleSave = async (e) => {
    e.preventDefault()
    setValidationError('')

    // Basic Validation
    if (!formData.name.trim()) {
      setValidationError(`${t('fullName', 'Full Name')} ${t('requiredField', 'is required.')}`)
      return
    }

    setSaving(true)

    try {
      const updatedProfile = {
        name: formData.name.trim(),
        email: formData.email,
        phone: formData.phone.trim() || 'Not specified',
        age: formData.age ? parseInt(formData.age, 10) : null,
        gender: formData.gender || 'Not specified',
        blood_group: formData.bloodGroup || '—',
        bloodGroup: formData.bloodGroup || '—',
        village: formData.address.trim() || 'Not specified',
        address: formData.address.trim() || 'Not specified',
        emergency_contact: formData.emergencyContact.trim() || 'Not specified',
        emergencyContact: formData.emergencyContact.trim() || 'Not specified',
        abha_id: formData.abhaId.trim() || 'Not linked',
        allergies: formData.allergies ? formData.allergies.split(',').map(s => s.trim()).filter(Boolean) : [],
        existing_conditions: formData.existingConditions ? formData.existingConditions.split(',').map(s => s.trim()).filter(Boolean) : [],
        current_medications: formData.currentMedications ? formData.currentMedications.split(',').map(s => s.trim()).filter(Boolean) : []
      }

      // 1. Update Mock State
      updatePatientProfile(updatedProfile)

      // 2. Persist in localStorage for user session
      if (user?.id) {
        localStorage.setItem(`medinest_profile_${user.id}`, JSON.stringify(updatedProfile))

        // Update local user object
        try {
          const rawUser = localStorage.getItem('user')
          if (rawUser) {
            const parsedUser = JSON.parse(rawUser)
            const newUser = {
              ...parsedUser,
              name: updatedProfile.name,
              phone: updatedProfile.phone,
              village: updatedProfile.village,
              blood_group: updatedProfile.blood_group,
              age: updatedProfile.age,
              gender: updatedProfile.gender
            }
            localStorage.setItem('user', JSON.stringify(newUser))
          }
        } catch (err) {
          console.error(err)
        }
      }

      // 3. Sync to backend API if available
      if (user?.id) {
        try {
          await api.put(`/api/patients/${user.id}`, {
            name: updatedProfile.name,
            phone: updatedProfile.phone,
            village: updatedProfile.village,
            blood_group: updatedProfile.blood_group,
            age: updatedProfile.age,
            gender: updatedProfile.gender,
            allergies: updatedProfile.allergies,
            existing_conditions: updatedProfile.existing_conditions,
            current_medications: updatedProfile.current_medications
          })
        } catch (apiErr) {
          console.log('[Info] Profile synced to local session:', apiErr.message)
        }
      }

      setSaving(false)
      setEditing(false)
      setSaveSuccess(true)
      setTimeout(() => setSaveSuccess(false), 4000)
    } catch (err) {
      console.error('Error saving profile:', err)
      setSaving(false)
      setValidationError('Failed to update profile. Please try again.')
    }
  }

  // Display Helper: returns value or clean "Not provided" text
  const displayVal = (val) => {
    if (val === null || val === undefined || val === '' || val === '—' || val === 'Not specified') {
      return <span className="text-slate-400 font-normal italic">{t('notProvided', 'Not provided')}</span>
    }
    return val
  }

  const displayName = formData.name || user?.name || user?.full_name || 'Patient'
  const displayInitial = (displayName.charAt(0) || 'P').toUpperCase()

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-8 px-4 sm:px-6 lg:px-8 transition-colors">
      <div className="max-w-4xl mx-auto">

        {/* =========================================================
            HEADER & BREADCRUMB
        ========================================================= */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="px-2.5 py-0.5 rounded-full bg-teal-500/10 text-teal-600 dark:text-teal-400 text-xs font-bold uppercase tracking-wider border border-teal-500/20">
                {t('patientPortal', 'Patient Profile')}
              </span>
              <span className="flex items-center gap-1 text-xs text-slate-400">
                <ShieldCheck className="w-3.5 h-3.5 text-teal-500" /> {t('abdmLinked', 'ABDM Linked')}
              </span>
            </div>
            <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              {t('profileTitle', 'My Profile')}
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
              {t('profileSubtitle', 'Manage your personal information, emergency contacts, and healthcare records.')}
            </p>
          </div>

          <Link
            to="/patient/dashboard"
            className="self-start sm:self-center inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold text-slate-600 dark:text-slate-300 hover:text-teal-600 dark:hover:text-teal-400 hover:bg-white dark:hover:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm transition"
          >
            <ArrowLeft className="w-4 h-4" /> {t('backToDashboard', 'Back to Dashboard')}
          </Link>
        </div>

        {/* Success Alert */}
        <AnimatePresence>
          {saveSuccess && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mb-6 bg-teal-50 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-800/80 rounded-2xl p-4 flex items-center gap-3 text-teal-800 dark:text-teal-200 shadow-sm"
            >
              <CheckCircle2 className="w-5 h-5 text-teal-600 dark:text-teal-400 flex-shrink-0" />
              <p className="text-sm font-semibold">{t('profileUpdatedSuccess', 'Profile updated successfully.')}</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Validation Error Alert */}
        <AnimatePresence>
          {validationError && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mb-6 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 rounded-2xl p-4 flex items-center gap-3 text-rose-800 dark:text-rose-200 shadow-sm"
            >
              <AlertCircle className="w-5 h-5 text-rose-600 dark:text-rose-400 flex-shrink-0" />
              <p className="text-sm font-semibold">{validationError}</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* =========================================================
            PROFILE HERO CARD
        ========================================================= */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-slate-800 shadow-sm mb-6 transition">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div className="flex items-center gap-5">
              {/* Avatar Circle */}
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl bg-gradient-to-br from-teal-500 to-emerald-600 flex items-center justify-center text-white text-3xl sm:text-4xl font-black shadow-lg shadow-teal-500/20 flex-shrink-0">
                {displayInitial}
              </div>

              {/* User Info Header */}
              <div>
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                    {displayName}
                  </h2>
                  <span className="px-2.5 py-0.5 rounded-full bg-teal-50 dark:bg-teal-950/50 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800 text-xs font-bold">
                    {t('patient', 'Patient')}
                  </span>
                </div>
                <p className="text-sm text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                  <Mail className="w-4 h-4 text-slate-400" />
                  {formData.email || user?.email || 'Authenticated Account'}
                </p>
                {formData.abhaId && (
                  <p className="text-xs text-teal-600 dark:text-teal-400 font-semibold mt-2 flex items-center gap-1">
                    <IdCard className="w-3.5 h-3.5" /> {t('abhaId', 'ABHA ID')}: {formData.abhaId}
                  </p>
                )}
              </div>
            </div>

            {/* Edit / Cancel Toggle Button */}
            {!editing ? (
              <button
                type="button"
                onClick={() => setEditing(true)}
                className="self-start sm:self-center inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-sm shadow-md shadow-teal-500/20 transition transform active:scale-95"
              >
                <Edit3 className="w-4 h-4" />
                {t('editProfile', 'Edit Profile')}
              </button>
            ) : (
              <button
                type="button"
                onClick={() => {
                  setEditing(false)
                  setValidationError('')
                }}
                className="self-start sm:self-center inline-flex items-center gap-1.5 px-4 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-sm hover:bg-slate-100 dark:hover:bg-slate-750 transition"
              >
                <X className="w-4 h-4" />
                {t('cancel', 'Cancel')}
              </button>
            )}
          </div>
        </div>

        {/* =========================================================
            PROFILE DETAILS & EDIT FORM
        ========================================================= */}
        <form onSubmit={handleSave} className="space-y-6">

          {/* 1. PERSONAL INFORMATION */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-slate-800 shadow-sm">
            <div className="flex items-center gap-3 pb-4 mb-6 border-b border-slate-100 dark:border-slate-800">
              <div className="w-10 h-10 rounded-xl bg-teal-50 dark:bg-teal-950/50 text-teal-600 dark:text-teal-400 flex items-center justify-center font-bold">
                <User className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-extrabold text-lg text-slate-900 dark:text-white">{t('personalInfo', 'Personal Information')}</h3>
                <p className="text-xs text-slate-400">{t('personalInfoSub', 'Basic identity and contact details')}</p>
              </div>
            </div>

            {editing ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-2">
                    {t('fullName', 'Full Name')} <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="e.g. Yash Choudhary"
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-teal-500/40 focus:border-teal-500 outline-none transition"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-2">
                    {t('emailAddress', 'Email Address')} <span className="text-slate-400 font-normal lowercase">({t('readOnly', 'read-only')})</span>
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      disabled
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-500 dark:text-slate-400 cursor-not-allowed outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-2">
                    {t('phoneNumber', 'Phone Number')}
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="e.g. +91 98765 43210"
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-teal-500/40 focus:border-teal-500 outline-none transition"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-2">
                    {t('age', 'Age (Years)')}
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="number"
                      name="age"
                      value={formData.age}
                      onChange={handleChange}
                      placeholder="e.g. 24"
                      min="0"
                      max="130"
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-teal-500/40 focus:border-teal-500 outline-none transition"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-2">
                    {t('gender', 'Gender')}
                  </label>
                  <select
                    name="gender"
                    value={formData.gender}
                    onChange={handleChange}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-teal-500/40 focus:border-teal-500 outline-none transition"
                  >
                    <option value="">{t('selectGender', 'Select gender...')}</option>
                    <option value="Male">{t('male', 'Male')}</option>
                    <option value="Female">{t('female', 'Female')}</option>
                    <option value="Other">{t('other', 'Other')}</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-2">
                    {t('bloodGroup', 'Blood Group')}
                  </label>
                  <select
                    name="bloodGroup"
                    value={formData.bloodGroup}
                    onChange={handleChange}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-teal-500/40 focus:border-teal-500 outline-none transition"
                  >
                    <option value="">{t('selectBloodGroup', 'Select blood group...')}</option>
                    <option value="A+">A+</option>
                    <option value="A-">A-</option>
                    <option value="B+">B+</option>
                    <option value="B-">B-</option>
                    <option value="AB+">AB+</option>
                    <option value="AB-">AB-</option>
                    <option value="O+">O+</option>
                    <option value="O-">O-</option>
                  </select>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                <DisplayField label={t('fullName', 'Full Name')} value={displayVal(formData.name)} icon={User} />
                <DisplayField label={t('emailAddress', 'Email Address')} value={displayVal(formData.email)} icon={Mail} />
                <DisplayField label={t('phoneNumber', 'Phone Number')} value={displayVal(formData.phone)} icon={Phone} />
                <DisplayField label={t('age', 'Age')} value={formData.age ? `${formData.age} ${t('yearsOld', 'yrs')}` : displayVal(null)} icon={Calendar} />
                <DisplayField label={t('gender', 'Gender')} value={displayVal(formData.gender)} icon={User} />
                <DisplayField label={t('bloodGroup', 'Blood Group')} value={displayVal(formData.bloodGroup)} icon={Droplets} />
              </div>
            )}
          </div>

          {/* 2. ADDRESS & EMERGENCY CONTACT */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-slate-800 shadow-sm">
            <div className="flex items-center gap-3 pb-4 mb-6 border-b border-slate-100 dark:border-slate-800">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold">
                <MapPin className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-extrabold text-lg text-slate-900 dark:text-white">{t('addressVillage', 'Address & Emergency Contact')}</h3>
                <p className="text-xs text-slate-400">{t('emergencyContactSub', 'Residential location and emergency escalation contacts')}</p>
              </div>
            </div>

            {editing ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-2">
                    {t('addressVillage', 'Address / Village')}
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      name="address"
                      value={formData.address}
                      onChange={handleChange}
                      placeholder="e.g. Village / Sector, City, District"
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-teal-500/40 focus:border-teal-500 outline-none transition"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-2">
                    {t('emergencyContact', 'Emergency Contact')}
                  </label>
                  <div className="relative">
                    <HeartHandshake className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      name="emergencyContact"
                      value={formData.emergencyContact}
                      onChange={handleChange}
                      placeholder="e.g. Father: +91 98765 00000"
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-teal-500/40 focus:border-teal-500 outline-none transition"
                    />
                  </div>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <DisplayField label={t('addressVillage', 'Address / Village')} value={displayVal(formData.address)} icon={MapPin} />
                <DisplayField label={t('emergencyContact', 'Emergency Contact')} value={displayVal(formData.emergencyContact)} icon={HeartHandshake} />
              </div>
            )}
          </div>

          {/* 3. HEALTH INFORMATION */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-slate-800 shadow-sm">
            <div className="flex items-center gap-3 pb-4 mb-6 border-b border-slate-100 dark:border-slate-800">
              <div className="w-10 h-10 rounded-xl bg-cyan-50 dark:bg-cyan-950/50 text-cyan-600 dark:text-cyan-400 flex items-center justify-center font-bold">
                <Activity className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-extrabold text-lg text-slate-900 dark:text-white">{t('healthInfo', 'Health Information')}</h3>
                <p className="text-xs text-slate-400">{t('healthInfoSub', 'ABDM registry credentials, allergies, and clinical history')}</p>
              </div>
            </div>

            {editing ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-2">
                    {t('abhaId', 'ABHA ID')}
                  </label>
                  <div className="relative">
                    <IdCard className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      name="abhaId"
                      value={formData.abhaId}
                      onChange={handleChange}
                      placeholder="e.g. 14-digit ABHA ID or username@abdm"
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-teal-500/40 focus:border-teal-500 outline-none transition"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-2">
                    {t('knownAllergies', 'Known Allergies')}
                  </label>
                  <div className="relative">
                    <AlertTriangle className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      name="allergies"
                      value={formData.allergies}
                      onChange={handleChange}
                      placeholder="e.g. Dust, Penicillin, Peanuts (comma-separated)"
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-teal-500/40 focus:border-teal-500 outline-none transition"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-2">
                    {t('existingConditions', 'Existing Conditions')}
                  </label>
                  <div className="relative">
                    <HeartPulse className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      name="existingConditions"
                      value={formData.existingConditions}
                      onChange={handleChange}
                      placeholder="e.g. Asthma, Hypertension (comma-separated)"
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-teal-500/40 focus:border-teal-500 outline-none transition"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-2">
                    {t('currentMedications', 'Current Medications')}
                  </label>
                  <div className="relative">
                    <Pill className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      name="currentMedications"
                      value={formData.currentMedications}
                      onChange={handleChange}
                      placeholder="e.g. Cetirizine 10mg, Vitamin C (comma-separated)"
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-teal-500/40 focus:border-teal-500 outline-none transition"
                    />
                  </div>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <DisplayField label={t('abhaId', 'ABHA ID')} value={displayVal(formData.abhaId)} icon={IdCard} />
                <DisplayField label={t('knownAllergies', 'Known Allergies')} value={displayVal(formData.allergies)} icon={AlertTriangle} />
                <DisplayField label={t('existingConditions', 'Existing Conditions')} value={displayVal(formData.existingConditions)} icon={HeartPulse} />
                <DisplayField label={t('currentMedications', 'Current Medications')} value={displayVal(formData.currentMedications)} icon={Pill} />
              </div>
            )}
          </div>

          {/* SAVE BUTTON SECTION (When Editing) */}
          {editing && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center justify-end gap-3 pt-2"
            >
              <button
                type="button"
                onClick={() => {
                  setEditing(false)
                  setValidationError('')
                }}
                disabled={saving}
                className="px-5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-sm font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              >
                {t('cancel', 'Cancel')}
              </button>
              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-sm shadow-md shadow-teal-500/20 transition transform active:scale-95 disabled:opacity-50"
              >
                {saving ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    {t('saving', 'Saving...')}
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    {t('saveChanges', 'Save Changes')}
                  </>
                )}
              </button>
            </motion.div>
          )}

        </form>
      </div>
    </div>
  )
}

function DisplayField({ label, value, icon: Icon }) {
  return (
    <div className="flex items-start gap-3.5">
      {Icon && (
        <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 flex items-center justify-center flex-shrink-0 mt-0.5">
          <Icon className="w-4 h-4" />
        </div>
      )}
      <div>
        <p className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
          {label}
        </p>
        <p className="text-sm font-bold text-slate-800 dark:text-slate-200 mt-0.5">
          {value}
        </p>
      </div>
    </div>
  )
}