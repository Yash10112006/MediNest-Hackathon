// frontend/src/components/auth/Login.jsx

import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  HeartPulse,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ShieldCheck,
  ArrowLeft,
  Activity,
  FileHeart,
  Stethoscope,
  AlertCircle
} from 'lucide-react'

const API_URL =
  import.meta.env.VITE_API_URL || 'http://localhost:8000'

export default function Login() {
  const navigate = useNavigate()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  // =========================================================
  // ROLE NORMALIZATION
  // =========================================================

  const normalizeRole = (userRole) => {
    const role = (userRole || '')
      .toString()
      .toLowerCase()
      .trim()

    if (role === 'patient' || role === 'user') {
      return 'patient'
    }

    if (role.includes('doctor')) {
      return 'doctor'
    }

    if (role.includes('asha')) {
      return 'asha'
    }

    if (
      role === 'hospital_admin' ||
      role === 'hospital admin' ||
      role === 'hospital' ||
      role === 'admin'
    ) {
      return 'hospital_admin'
    }

    return null
  }

  // =========================================================
  // DASHBOARD ROUTE BY ROLE
  // =========================================================

  const getDashboardRoute = (role) => {
    switch (role) {
      case 'patient':
        return '/patient'

      case 'doctor':
        return '/dashboard'

      case 'asha':
        return '/asha'

      case 'hospital_admin':
        return '/hospital'

      default:
        return '/'
    }
  }

  // =========================================================
  // LOGIN
  // =========================================================

  const handleSubmit = async (e) => {
    e.preventDefault()

    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email.trim(),
          password: password
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(
          data.detail ||
          data.message ||
          'Login failed'
        )
      }

      // =========================================================
      // GET ROLE SELECTED ON ROLE SELECTION PAGE
      // =========================================================

      const selectedRole =
        sessionStorage.getItem('selectedRole') || 'patient'

      // =========================================================
      // GET ACTUAL ROLE FROM BACKEND
      // =========================================================

      const actualRole = (
        data.role ||
        data.user?.role ||
        data.user_metadata?.role ||
        data.user?.user_metadata?.role ||
        'patient'
      )
        .toString()
        .toLowerCase()
        .trim()

      // =========================================================
      // NORMALIZE ROLES
      // =========================================================

      const normalizeRole = (role) => {
        const value = role.toLowerCase().trim()

        if (
          value === 'patient' ||
          value === 'user'
        ) {
          return 'patient'
        }

        if (value.includes('doctor')) {
          return 'doctor'
        }

        if (value.includes('asha')) {
          return 'asha'
        }

        if (
          value === 'hospital_admin' ||
          value === 'hospital admin' ||
          value === 'hospital' ||
          value === 'admin' ||
          value.includes('hospital')
        ) {
          return 'hospital_admin'
        }

        return 'patient'
      }

      const normalizedSelectedRole =
        normalizeRole(selectedRole)

      const normalizedActualRole =
        normalizeRole(actualRole)

      // =========================================================
      // IMPORTANT:
      // PREVENT USER FROM ENTERING WRONG PORTAL
      // =========================================================

      if (
        normalizedSelectedRole !==
        normalizedActualRole
      ) {
        throw new Error(
          `This account is registered as ${normalizedActualRole.replace('_', ' ')}. Please select the ${normalizedActualRole.replace('_', ' ')} portal.`
        )
      }

      // =========================================================
      // SAVE AUTHENTICATION DATA
      // =========================================================

      localStorage.setItem(
        'access_token',
        data.access_token
      )

      localStorage.setItem(
        'user',
        JSON.stringify(data)
      )

      // =========================================================
      // CLEAR SELECTED PORTAL
      // =========================================================

      sessionStorage.removeItem('selectedRole')

      // =========================================================
      // REDIRECT BASED ON ACTUAL ROLE
      // =========================================================

      if (normalizedActualRole === 'doctor') {
        navigate('/doctor/dashboard', {
          replace: true
        })
        return
      }

      if (normalizedActualRole === 'asha') {
        navigate('/asha/dashboard', {
          replace: true
        })
        return
      }

      if (
        normalizedActualRole ===
        'hospital_admin'
      ) {
        navigate('/hospital/dashboard', {
          replace: true
        })
        return
      }

      navigate('/patient/dashboard', {
        replace: true
      })

    } catch (err) {
      setError(
        err.message ||
        'Something went wrong. Make sure the backend is running.'
      )
    }

    setLoading(false)
  }

  // =========================================================
  // ANIMATION VARIANTS
  // =========================================================

  const leftVariants = {
    hidden: {
      opacity: 0,
      x: -30
    },

    visible: {
      opacity: 1,
      x: 0,
      transition: {
        duration: 0.6,
        ease: [0.16, 1, 0.3, 1]
      }
    }
  }

  const rightVariants = {
    hidden: {
      opacity: 0,
      x: 30
    },

    visible: {
      opacity: 1,
      x: 0,
      transition: {
        duration: 0.6,
        ease: [0.16, 1, 0.3, 1]
      }
    }
  }

  const featureVariants = {
    hidden: {
      opacity: 0,
      y: 10
    },

    visible: (index) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: 0.35 + index * 0.1,
        duration: 0.4
      }
    })
  }

  return (
    <main className="min-h-screen bg-slate-50 flex">

      {/* =====================================================
          LEFT SIDE — MEDINEST BRANDING
      ====================================================== */}

      <motion.section
        variants={leftVariants}
        initial="hidden"
        animate="visible"
        className="
          hidden lg:flex
          lg:w-[48%]
          xl:w-[50%]
          relative
          overflow-hidden
          bg-slate-950
          text-white
          flex-col
          justify-between
          p-12
        "
      >

        <div className="absolute inset-0 bg-gradient-to-br from-teal-950 via-slate-950 to-emerald-950" />

        <div
          className="absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage: `
              linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)
            `,
            backgroundSize: '48px 48px'
          }}
        />

        <div
          className="
            absolute
            -top-32
            -left-32
            w-[450px]
            h-[450px]
            bg-teal-500/20
            rounded-full
            blur-[120px]
          "
        />

        <div
          className="
            absolute
            bottom-[-150px]
            right-[-100px]
            w-[450px]
            h-[450px]
            bg-emerald-500/15
            rounded-full
            blur-[120px]
          "
        />

        <div className="relative z-10 h-full flex flex-col">

          {/* Logo */}

          <motion.div
            initial={{ opacity: 0, y: -15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              delay: 0.15,
              duration: 0.5
            }}
            className="flex items-center gap-4"
          >

            <motion.div
              whileHover={{
                scale: 1.05,
                rotate: 3
              }}
              className="
                w-16
                h-16
                rounded-2xl
                bg-white
                p-2
                flex
                items-center
                justify-center
                shadow-xl
                shadow-teal-500/20
              "
            >
              <img
                src="/logo.png"
                alt="MediNest Logo"
                className="w-full h-full object-contain"
              />
            </motion.div>

            <div>
              <h1 className="text-3xl font-extrabold tracking-tight">
                MediNest
              </h1>

              <p className="text-sm text-teal-300 mt-0.5">
                Healthcare Bridge for Rural India
              </p>
            </div>

          </motion.div>


          {/* Main message */}

          <div className="my-auto max-w-xl">

            <motion.div
              initial={{
                opacity: 0,
                y: 20
              }}
              animate={{
                opacity: 1,
                y: 0
              }}
              transition={{
                delay: 0.25,
                duration: 0.6
              }}
            >

              <span
                className="
                  inline-flex
                  items-center
                  gap-2
                  px-3
                  py-1.5
                  rounded-full
                  bg-teal-500/10
                  border
                  border-teal-400/20
                  text-teal-300
                  text-xs
                  font-semibold
                  mb-6
                "
              >
                <Activity className="w-3.5 h-3.5" />
                Connected Healthcare Network
              </span>

              <h2
                className="
                  text-5xl
                  xl:text-6xl
                  font-extrabold
                  leading-[1.05]
                  tracking-tight
                "
              >
                Healthcare that

                <span className="block text-teal-400">
                  reaches everyone.
                </span>
              </h2>

              <p
                className="
                  mt-6
                  text-base
                  xl:text-lg
                  leading-8
                  text-slate-300
                  max-w-lg
                "
              >
                MediNest connects patients, ASHA workers,
                doctors and hospitals through a unified
                digital healthcare network designed for
                rural India.
              </p>

            </motion.div>


            {/* Features */}

            <div className="mt-10 space-y-4">

              {[
                {
                  icon: Activity,
                  text: 'AI-assisted health triage'
                },
                {
                  icon: FileHeart,
                  text: 'Connected patient health records'
                },
                {
                  icon: Stethoscope,
                  text: 'Smart healthcare referrals'
                }
              ].map((feature, index) => {

                const Icon = feature.icon

                return (
                  <motion.div
                    key={feature.text}
                    custom={index}
                    variants={featureVariants}
                    initial="hidden"
                    animate="visible"
                    className="flex items-center gap-4"
                  >

                    <div
                      className="
                        w-9
                        h-9
                        rounded-full
                        bg-teal-500/10
                        border
                        border-teal-400/20
                        flex
                        items-center
                        justify-center
                        shrink-0
                      "
                    >
                      <Icon
                        className="w-4 h-4 text-teal-400"
                      />
                    </div>

                    <span className="text-sm text-slate-200">
                      {feature.text}
                    </span>

                  </motion.div>
                )
              })}

            </div>

          </div>


          {/* Bottom information */}

          <div
            className="
              pt-6
              border-t
              border-white/10
              flex
              flex-wrap
              gap-x-5
              gap-y-2
              text-xs
              text-slate-500
            "
          >

            <span className="flex items-center gap-1.5">
              <ShieldCheck
                className="w-3.5 h-3.5 text-teal-400"
              />
              Secure healthcare platform
            </span>

            <span>•</span>

            <span>Rural-first</span>

            <span>•</span>

            <span>Accessible</span>

          </div>

        </div>

      </motion.section>


      {/* =====================================================
          RIGHT SIDE — LOGIN FORM
      ====================================================== */}

      <motion.section
        variants={rightVariants}
        initial="hidden"
        animate="visible"
        className="
          flex-1
          min-h-screen
          flex
          items-center
          justify-center
          px-5
          sm:px-8
          py-10
          bg-slate-50
        "
      >

        <div className="w-full max-w-md">

          {/* Mobile logo */}

          <div className="lg:hidden text-center mb-8">

            <div
              className="
                inline-flex
                w-14
                h-14
                rounded-2xl
                bg-white
                p-1.5
                border border-slate-200/80
                items-center
                justify-center
                shadow-lg
                shadow-teal-500/10
              "
            >
              <img
                src="/logo.png"
                alt="MediNest Logo"
                className="w-full h-full object-contain"
              />
            </div>

            <h1
              className="
                text-2xl
                font-extrabold
                text-slate-900
                mt-3
              "
            >
              MediNest
            </h1>

            <p className="text-sm text-slate-500 mt-1">
              Healthcare Bridge for Rural India
            </p>

          </div>


          {/* Change portal */}

          <button
            type="button"
            onClick={() => {
              sessionStorage.removeItem('selectedRole')
              navigate('/')
            }}
            className="
              group
              flex
              items-center
              gap-2
              text-sm
              font-medium
              text-slate-500
              hover:text-teal-700
              transition-colors
              mb-8
              focus:outline-none
              focus-visible:ring-2
              focus-visible:ring-teal-500
              focus-visible:ring-offset-2
              rounded-md
              px-1
              py-1
            "
          >
            <ArrowLeft
              className="
                w-4
                h-4
                transition-transform
                group-hover:-translate-x-1
              "
            />

            Change portal
          </button>


          {/* Heading */}

          <div className="mb-7">

            <div
              className="
                inline-flex
                items-center
                gap-2
                px-3
                py-1.5
                rounded-full
                bg-teal-50
                border
                border-teal-100
                text-teal-700
                text-xs
                font-semibold
                mb-4
              "
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              Secure Login
            </div>

            <h2
              className="
                text-3xl
                sm:text-4xl
                font-extrabold
                tracking-tight
                text-slate-900
              "
            >
              Welcome back
            </h2>

            <p
              className="
                mt-2
                text-sm
                sm:text-base
                text-slate-500
                leading-relaxed
              "
            >
              Access your health records, appointments and
              AI health assistance.
            </p>

          </div>


          {/* Login Card */}

          <motion.div
            initial={{
              opacity: 0,
              y: 15
            }}
            animate={{
              opacity: 1,
              y: 0
            }}
            transition={{
              delay: 0.2,
              duration: 0.5
            }}
            className="
              bg-white
              border
              border-slate-200
              rounded-2xl
              p-6
              sm:p-8
              shadow-xl
              shadow-slate-200/60
            "
          >

            <form
              onSubmit={handleSubmit}
              noValidate
            >

              {/* Error */}

              {error && (
                <motion.div
                  initial={{
                    opacity: 0,
                    height: 0
                  }}
                  animate={{
                    opacity: 1,
                    height: 'auto'
                  }}
                  role="alert"
                  aria-live="polite"
                  className="
                    mb-5
                    flex
                    gap-3
                    items-start
                    bg-red-50
                    border
                    border-red-200
                    text-red-700
                    px-4
                    py-3
                    rounded-xl
                    text-sm
                  "
                >
                  <AlertCircle
                    className="
                      w-5
                      h-5
                      shrink-0
                      mt-0.5
                    "
                  />

                  <span>{error}</span>
                </motion.div>
              )}


              {/* Email */}

              <div className="mb-5">

                <label
                  htmlFor="email"
                  className="
                    block
                    text-sm
                    font-semibold
                    text-slate-800
                    mb-2
                  "
                >
                  Email address
                </label>

                <div className="relative">

                  <Mail
                    aria-hidden="true"
                    className="
                      absolute
                      left-4
                      top-1/2
                      -translate-y-1/2
                      w-5
                      h-5
                      text-slate-400
                      pointer-events-none
                    "
                  />

                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value)

                      if (error) {
                        setError(null)
                      }
                    }}
                    aria-invalid={!!error}
                    placeholder="you@example.com"
                    className="
                      w-full
                      h-13
                      pl-12
                      pr-4
                      rounded-xl
                      border
                      border-slate-200
                      bg-slate-50
                      text-slate-900
                      placeholder:text-slate-400
                      outline-none
                      transition-all
                      duration-200
                      focus:bg-white
                      focus:border-teal-500
                      focus:ring-4
                      focus:ring-teal-500/10
                      hover:border-slate-300
                    "
                  />

                </div>

              </div>


              {/* Password */}

              <div className="mb-6">

                <div
                  className="
                    flex
                    items-center
                    justify-between
                    mb-2
                  "
                >

                  <label
                    htmlFor="password"
                    className="
                      text-sm
                      font-semibold
                      text-slate-800
                    "
                  >
                    Password
                  </label>

                  <button
                    type="button"
                    className="
                      text-xs
                      font-semibold
                      text-teal-600
                      hover:text-teal-700
                      transition-colors
                      focus:outline-none
                      focus-visible:ring-2
                      focus-visible:ring-teal-500
                      focus-visible:ring-offset-2
                      rounded
                    "
                    onClick={() => { }}
                  >
                    Forgot password?
                  </button>

                </div>

                <div className="relative">

                  <Lock
                    aria-hidden="true"
                    className="
                      absolute
                      left-4
                      top-1/2
                      -translate-y-1/2
                      w-5
                      h-5
                      text-slate-400
                      pointer-events-none
                    "
                  />

                  <input
                    id="password"
                    name="password"
                    type={
                      showPassword
                        ? 'text'
                        : 'password'
                    }
                    autoComplete="current-password"
                    required
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value)

                      if (error) {
                        setError(null)
                      }
                    }}
                    placeholder="Enter your password"
                    className="
                      w-full
                      h-13
                      pl-12
                      pr-12
                      rounded-xl
                      border
                      border-slate-200
                      bg-slate-50
                      text-slate-900
                      placeholder:text-slate-400
                      outline-none
                      transition-all
                      duration-200
                      focus:bg-white
                      focus:border-teal-500
                      focus:ring-4
                      focus:ring-teal-500/10
                      hover:border-slate-300
                    "
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowPassword(!showPassword)
                    }
                    aria-label={
                      showPassword
                        ? 'Hide password'
                        : 'Show password'
                    }
                    className="
                      absolute
                      right-3
                      top-1/2
                      -translate-y-1/2
                      w-9
                      h-9
                      rounded-lg
                      flex
                      items-center
                      justify-center
                      text-slate-400
                      hover:text-teal-600
                      hover:bg-teal-50
                      transition-colors
                      focus:outline-none
                      focus-visible:ring-2
                      focus-visible:ring-teal-500
                    "
                  >

                    {showPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}

                  </button>

                </div>

              </div>


              {/* Submit */}

              <motion.button
                type="submit"
                disabled={loading}
                whileHover={{
                  scale: loading ? 1 : 1.01
                }}
                whileTap={{
                  scale: loading ? 1 : 0.98
                }}
                className="
                  w-full
                  h-13
                  rounded-xl
                  flex
                  items-center
                  justify-center
                  gap-2
                  bg-gradient-to-r
                  from-teal-600
                  to-emerald-600
                  hover:from-teal-700
                  hover:to-emerald-700
                  text-white
                  font-bold
                  text-sm
                  shadow-lg
                  shadow-teal-600/20
                  transition-all
                  duration-200
                  disabled:opacity-60
                  disabled:cursor-not-allowed
                  focus:outline-none
                  focus-visible:ring-4
                  focus-visible:ring-teal-500/30
                  focus-visible:ring-offset-2
                "
              >

                {loading ? (
                  <>
                    <span
                      className="
                        w-4
                        h-4
                        border-2
                        border-white/40
                        border-t-white
                        rounded-full
                        animate-spin
                      "
                    />

                    Signing in...
                  </>
                ) : (
                  'Sign in to MediNest'
                )}

              </motion.button>


              {/* Register */}

              <div
                className="
                  mt-6
                  pt-6
                  border-t
                  border-slate-100
                  text-center
                  text-sm
                  text-slate-500
                "
              >

                Don't have an account?

                <button
                  type="button"
                  onClick={() => navigate('/register')}
                  className="
                    ml-1
                    font-bold
                    text-teal-600
                    hover:text-teal-700
                    transition-colors
                    focus:outline-none
                    focus-visible:ring-2
                    focus-visible:ring-teal-500
                    focus-visible:ring-offset-2
                    rounded
                  "
                >
                  Create an account
                </button>

              </div>

            </form>

          </motion.div>


          {/* Security */}

          <div
            className="
              mt-6
              flex
              items-center
              justify-center
              gap-2
              text-xs
              text-slate-400
            "
          >
            <ShieldCheck
              className="w-4 h-4 text-teal-500"
            />

            <span>
              Your healthcare information is protected
            </span>

          </div>


          {/* Backend connection */}

          {import.meta.env.DEV && (
            <p
              className="
                mt-3
                text-center
                text-[10px]
                text-slate-300
              "
            >
              API: {API_URL}
            </p>
          )}

        </div>

      </motion.section>

    </main>
  )
}