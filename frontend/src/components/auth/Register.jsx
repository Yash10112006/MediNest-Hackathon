// frontend/src/components/auth/Register.jsx

import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  HeartPulse,
  Mail,
  Lock,
  User,
  Users,
  ShieldCheck,
  Activity,
  FileHeart,
  Stethoscope,
  ArrowLeft,
  Eye,
  EyeOff
} from 'lucide-react'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

export default function Register() {
  const navigate = useNavigate()

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'patient'
  })

  const roles = [
    { value: 'patient', label: 'Patient' },
    { value: 'doctor', label: 'Doctor' },
    { value: 'asha', label: 'ASHA Worker' },
    { value: 'hospital_admin', label: 'Hospital Admin' }
  ]

  const handleChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match')
      setLoading(false)
      return
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters')
      setLoading(false)
      return
    }

    try {
      const response = await fetch(`${API_URL}/api/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          name: formData.name,
          role: formData.role
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(
          data.detail ||
          data.message ||
          'Registration failed'
        )
      }

      // Save token and user info
      localStorage.setItem('access_token', data.access_token)
      localStorage.setItem('user', JSON.stringify(data))

      // Redirect to login
      navigate('/login')

    } catch (err) {
      setError(
        err.message ||
        'Something went wrong. Make sure the backend is running.'
      )
    }

    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-slate-50 flex">

      {/* =====================================================
          LEFT BRANDING PANEL
      ===================================================== */}

      <motion.div
        initial={{ opacity: 0, x: -40 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.7 }}
        className="hidden lg:flex lg:w-1/2 relative overflow-hidden
                   bg-gradient-to-br from-[#063f3d] via-[#021b2b] to-[#020617]
                   text-white"
      >

        {/* Background Grid */}
        <div
          className="absolute inset-0 opacity-[0.08]"
          style={{
            backgroundImage: `
              linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)
            `,
            backgroundSize: '42px 42px'
          }}
        />

        {/* Ambient Glow */}
        <div className="absolute -top-20 -left-20 w-96 h-96
                        bg-teal-500/20 rounded-full blur-3xl" />

        <div className="absolute bottom-0 right-0 w-[450px] h-[450px]
                        bg-emerald-500/10 rounded-full blur-3xl" />

        <div className="relative z-10 w-full px-12 xl:px-16 py-14 flex flex-col">

          {/* Logo */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex items-center gap-4"
          >
            <div className="w-[70px] h-[70px] rounded-2xl
                            bg-white p-2
                            flex items-center justify-center
                            shadow-xl shadow-teal-500/25"
            >
              <img
                src="/logo.png"
                alt="MediNest Logo"
                className="w-full h-full object-contain"
              />
            </div>

            <div>
              <h1 className="text-3xl font-extrabold tracking-tight">
                MediNest
              </h1>

              <p className="text-teal-300 text-sm font-medium">
                Healthcare Bridge for Rural India
              </p>
            </div>
          </motion.div>


          {/* Main Content */}
          <div className="mt-28 max-w-xl">

            <div className="inline-flex items-center gap-2
                            px-4 py-2 rounded-full
                            border border-teal-400/30
                            bg-teal-400/10
                            text-teal-300 text-sm font-medium"
            >
              <Activity className="w-4 h-4" />
              Connected Healthcare Network
            </div>

            <h2 className="mt-8 text-5xl xl:text-6xl
                           font-extrabold leading-[1.05] tracking-tight"
            >
              Healthcare that
              <span className="block text-teal-400">
                reaches everyone.
              </span>
            </h2>

            <p className="mt-7 text-lg leading-8 text-slate-300 max-w-lg">
              Create your MediNest account and become part of a
              unified healthcare network connecting patients,
              ASHA workers, doctors and hospitals across rural India.
            </p>


            {/* Features */}
            <div className="mt-10 space-y-5">

              <Feature
                icon={Activity}
                text="AI-assisted health triage"
              />

              <Feature
                icon={FileHeart}
                text="Connected patient health records"
              />

              <Feature
                icon={Stethoscope}
                text="Smart healthcare referrals"
              />

            </div>

          </div>


          {/* Bottom */}
          <div className="mt-auto pt-10 border-t border-white/10
                          flex items-center gap-5 text-sm text-slate-400">

            <span className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-teal-400" />
              Secure healthcare platform
            </span>

            <span>•</span>

            <span>Rural-first</span>

            <span>•</span>

            <span>Accessible</span>

          </div>

        </div>
      </motion.div>


      {/* =====================================================
          RIGHT REGISTRATION PANEL
      ===================================================== */}

      <div className="w-full lg:w-1/2 flex items-center justify-center
                      px-5 sm:px-8 py-10 overflow-y-auto">

        <motion.div
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7 }}
          className="w-full max-w-xl"
        >

          {/* Change Portal */}
          <button
            type="button"
            onClick={() => navigate('/')}
            className="flex items-center gap-2
                       text-slate-500 hover:text-teal-600
                       text-sm font-medium transition-colors
                       mb-7"
          >
            <ArrowLeft className="w-4 h-4" />
            Change portal
          </button>


          {/* Heading */}
          <div className="mb-7">

            <div className="inline-flex items-center gap-2
                            px-3 py-1.5 rounded-full
                            border border-teal-200
                            bg-teal-50
                            text-teal-700
                            text-xs font-semibold"
            >
              <img src="/logo.png" alt="Logo" className="w-4 h-4 object-contain" />
              Join MediNest
            </div>

            <h2 className="mt-5 text-4xl font-extrabold
                           tracking-tight text-slate-950"
            >
              Create your account
            </h2>

            <p className="mt-2 text-slate-500">
              Join the MediNest healthcare network
            </p>

          </div>


          {/* Registration Card */}
          <div className="bg-white border border-slate-200
                          rounded-3xl shadow-xl shadow-slate-200/60
                          p-7 sm:p-8">

            <form onSubmit={handleSubmit} className="space-y-5">

              {/* Error */}
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-red-50 border border-red-200
                             text-red-700 px-4 py-3 rounded-xl
                             text-sm"
                  role="alert"
                >
                  <span className="font-semibold">
                    Registration error:
                  </span>{' '}
                  {error}
                </motion.div>
              )}


              {/* Full Name */}
              <InputField
                id="name"
                label="Full name"
                icon={User}
                type="text"
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                placeholder="Dr. Sharma"
                required
              />


              {/* Email */}
              <InputField
                id="email"
                label="Email address"
                icon={Mail}
                type="email"
                value={formData.email}
                onChange={(e) => handleChange('email', e.target.value)}
                placeholder="you@example.com"
                required
              />


              {/* Password */}
              <PasswordField
                id="password"
                label="Password"
                value={formData.password}
                onChange={(e) =>
                  handleChange('password', e.target.value)
                }
                placeholder="Enter your password"
                showPassword={showPassword}
                setShowPassword={setShowPassword}
                required
              />

              <p className="text-xs text-slate-400 -mt-3 ml-1">
                Minimum 6 characters
              </p>


              {/* Confirm Password */}
              <PasswordField
                id="confirmPassword"
                label="Confirm password"
                value={formData.confirmPassword}
                onChange={(e) =>
                  handleChange(
                    'confirmPassword',
                    e.target.value
                  )
                }
                placeholder="Re-enter your password"
                showPassword={showConfirmPassword}
                setShowPassword={setShowConfirmPassword}
                required
              />


              {/* Role */}
              <div>
                <label
                  htmlFor="role"
                  className="block text-sm font-semibold
                             text-slate-800 mb-2"
                >
                  Select your role
                </label>

                <div className="relative">

                  <Users
                    className="absolute left-4 top-1/2
                               -translate-y-1/2
                               w-5 h-5 text-slate-400
                               pointer-events-none"
                  />

                  <select
                    id="role"
                    value={formData.role}
                    onChange={(e) =>
                      handleChange('role', e.target.value)
                    }
                    className="w-full h-12 pl-11 pr-4
                               rounded-xl
                               border border-slate-200
                               bg-slate-50
                               text-slate-800
                               focus:outline-none
                               focus:ring-2
                               focus:ring-teal-500/30
                               focus:border-teal-500
                               transition-all
                               appearance-none"
                  >
                    {roles.map((role) => (
                      <option
                        key={role.value}
                        value={role.value}
                      >
                        {role.label}
                      </option>
                    ))}
                  </select>

                </div>
              </div>


              {/* Submit */}
              <motion.button
                type="submit"
                disabled={loading}
                whileHover={{ scale: loading ? 1 : 1.01 }}
                whileTap={{ scale: loading ? 1 : 0.98 }}
                className="w-full h-12 mt-2
                           flex items-center justify-center
                           rounded-xl
                           bg-gradient-to-r
                           from-teal-600 to-emerald-500
                           hover:from-teal-700
                           hover:to-emerald-600
                           text-white font-bold
                           shadow-lg shadow-teal-500/20
                           transition-all
                           disabled:opacity-60
                           disabled:cursor-not-allowed"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2
                                     border-white/40
                                     border-t-white
                                     rounded-full animate-spin" />
                    Creating account...
                  </span>
                ) : (
                  'Create MediNest Account'
                )}
              </motion.button>


              {/* Login */}
              <div className="pt-5 border-t border-slate-100
                              text-center text-sm">

                <span className="text-slate-500">
                  Already have an account?
                </span>

                <button
                  type="button"
                  onClick={() => navigate('/login')}
                  className="ml-1 font-bold text-teal-600
                             hover:text-teal-700
                             transition-colors"
                >
                  Sign in
                </button>

              </div>

            </form>

          </div>


          {/* Security */}
          <div className="mt-6 flex items-center justify-center
                          gap-2 text-xs text-slate-400">

            <ShieldCheck className="w-4 h-4 text-teal-500" />

            <span>
              Your healthcare information is protected
            </span>

          </div>

        </motion.div>

      </div>

    </div>
  )
}


/* ============================================================
   FEATURE COMPONENT
============================================================ */

function Feature({ icon: Icon, text }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -15 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5 }}
      className="flex items-center gap-4"
    >
      <div className="w-11 h-11 rounded-full
                      border border-teal-400/20
                      bg-teal-400/10
                      flex items-center justify-center"
      >
        <Icon className="w-5 h-5 text-teal-400" />
      </div>

      <span className="text-slate-200">
        {text}
      </span>
    </motion.div>
  )
}


/* ============================================================
   INPUT COMPONENT
============================================================ */

function InputField({
  id,
  label,
  icon: Icon,
  type,
  value,
  onChange,
  placeholder,
  required
}) {
  return (
    <div>

      <label
        htmlFor={id}
        className="block text-sm font-semibold
                   text-slate-800 mb-2"
      >
        {label}
      </label>

      <div className="relative">

        <Icon
          className="absolute left-4 top-1/2
                     -translate-y-1/2
                     w-5 h-5 text-slate-400
                     pointer-events-none"
        />

        <input
          id={id}
          type={type}
          required={required}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className="w-full h-12
                     pl-11 pr-4
                     rounded-xl
                     border border-slate-200
                     bg-slate-50
                     text-slate-800
                     placeholder:text-slate-400
                     focus:outline-none
                     focus:ring-2
                     focus:ring-teal-500/30
                     focus:border-teal-500
                     transition-all"
        />

      </div>

    </div>
  )
}


/* ============================================================
   PASSWORD COMPONENT
============================================================ */

function PasswordField({
  id,
  label,
  value,
  onChange,
  placeholder,
  showPassword,
  setShowPassword,
  required
}) {
  return (
    <div>

      <label
        htmlFor={id}
        className="block text-sm font-semibold
                   text-slate-800 mb-2"
      >
        {label}
      </label>

      <div className="relative">

        <Lock
          className="absolute left-4 top-1/2
                     -translate-y-1/2
                     w-5 h-5 text-slate-400
                     pointer-events-none"
        />

        <input
          id={id}
          type={showPassword ? 'text' : 'password'}
          required={required}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className="w-full h-12
                     pl-11 pr-12
                     rounded-xl
                     border border-slate-200
                     bg-slate-50
                     text-slate-800
                     placeholder:text-slate-400
                     focus:outline-none
                     focus:ring-2
                     focus:ring-teal-500/30
                     focus:border-teal-500
                     transition-all"
        />

        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-3 top-1/2
                     -translate-y-1/2
                     p-2 text-slate-400
                     hover:text-teal-600
                     transition-colors"
          aria-label={
            showPassword
              ? 'Hide password'
              : 'Show password'
          }
        >
          {showPassword ? (
            <EyeOff className="w-5 h-5" />
          ) : (
            <Eye className="w-5 h-5" />
          )}
        </button>

      </div>

    </div>
  )
}