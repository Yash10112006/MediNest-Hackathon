// frontend/src/components/common/Navbar.jsx

import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  HeartPulse,
  LayoutDashboard,
  Users,
  Stethoscope,
  CalendarDays,
  MapPin,
  Gift,
  BarChart3,
  GitBranch,
  ClipboardList,
  UserRound,
  Package,
  Megaphone,
  Bell,
  Search,
  Menu,
  X,
  LogOut,
  ChevronDown,
  Sparkles,
  Home,
  Globe
} from 'lucide-react'

import { useAuth } from '../../hooks/useAuth'
import { useLanguage } from '../../i18n/LanguageContext'
import LanguageSelector from './LanguageSelector'

function getRole(user) {
  return (
    user?.role ||
    user?.user_metadata?.role ||
    user?.user_metadata?.user_role ||
    'patient'
  )
    .toString()
    .toLowerCase()
}

export default function Navbar() {
  const { user, logout } = useAuth()
  const { t } = useLanguage()
  const navigate = useNavigate()
  const location = useLocation()

  const [mobileOpen, setMobileOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)

  if (!user) return null

  const rawRole = getRole(user)

  /*
   * Normalize all possible role names into
   * the four MediNest portal roles.
   */
  let role = 'patient'

  if (rawRole.includes('asha')) {
    role = 'asha'
  } else if (rawRole.includes('hospital') || rawRole.includes('admin')) {
    role = 'hospital'
  } else if (rawRole.includes('doctor')) {
    role = 'doctor'
  } else if (rawRole === 'patient' || rawRole === 'user') {
    role = 'patient'
  }

  const roleLabel =
    role === 'doctor'
      ? t('doctor', 'Doctor')
      : role === 'asha'
        ? t('asha', 'ASHA Worker')
        : role === 'hospital'
          ? t('admin', 'Hospital Admin')
          : t('patient', 'Patient')

  /*
   * Role-specific navigation with i18n.
   */
  const navigation = {
    patient: [
      {
        path: '/patient/dashboard',
        label: t('dashboard', 'Dashboard'),
        icon: LayoutDashboard
      },
      {
        path: '/patient/appointments',
        label: t('appointments', 'Appointments'),
        icon: CalendarDays
      },
      {
        path: '/patient/health',
        label: t('myHealth', 'My Health'),
        icon: ClipboardList
      },
      {
        path: '/patient/triage',
        label: t('aiHealth', 'AI Health'),
        icon: Stethoscope
      },
      {
        path: '/patient/healthcare',
        label: t('healthcare', 'Healthcare'),
        icon: MapPin
      },
      {
        path: '/patient/schemes',
        label: t('schemes', 'Schemes'),
        icon: Gift
      }
    ],

    doctor: [
      {
        path: '/doctor/dashboard',
        label: t('dashboard', 'Dashboard'),
        icon: LayoutDashboard
      },
      {
        path: '/doctor/patients',
        label: 'Patients',
        icon: Users
      },
      {
        path: '/doctor/consultation',
        label: 'Consultation',
        icon: Stethoscope
      },
      {
        path: '/doctor/appointments',
        label: t('appointments', 'Appointments'),
        icon: CalendarDays
      },
      {
        path: '/doctor/referrals',
        label: t('referrals', 'Referrals'),
        icon: GitBranch
      },
      {
        path: '/doctor/analytics',
        label: 'Analytics',
        icon: BarChart3
      }
    ],

    asha: [
      {
        path: '/asha/dashboard',
        label: t('dashboard', 'Dashboard'),
        icon: LayoutDashboard
      },
      {
        path: '/asha/beneficiaries',
        label: 'Beneficiaries',
        icon: Users
      },
      {
        path: '/asha/visits',
        label: 'Visits',
        icon: CalendarDays
      },
      {
        path: '/asha/triage',
        label: 'Field Triage',
        icon: Stethoscope
      },
      {
        path: '/asha/alerts',
        label: 'Alerts',
        icon: Megaphone
      }
    ],

    hospital: [
      {
        path: '/hospital/dashboard',
        label: t('dashboard', 'Dashboard'),
        icon: LayoutDashboard
      },
      {
        path: '/hospital/beds',
        label: 'Beds',
        icon: LayoutDashboard
      },
      {
        path: '/hospital/referrals',
        label: t('referrals', 'Referrals'),
        icon: GitBranch
      },
      {
        path: '/hospital/queue',
        label: 'Queue',
        icon: ClipboardList
      },
      {
        path: '/hospital/inventory',
        label: 'Inventory',
        icon: Package
      },
      {
        path: '/hospital/analytics',
        label: 'Analytics',
        icon: BarChart3
      }
    ]
  }

  const navItems = navigation[role]

  async function handleLogout() {
    await logout()
    navigate('/login')
  }

  const userName =
    user?.name ||
    user?.full_name ||
    user?.fullName ||
    user?.user_metadata?.name ||
    user?.user_metadata?.full_name ||
    'User'

  const dashboardPath =
    role === 'doctor'
      ? '/doctor/dashboard'
      : role === 'asha'
        ? '/asha/dashboard'
        : role === 'hospital'
          ? '/hospital/dashboard'
          : '/patient/dashboard'

  return (
    <header className="sticky top-0 z-50 bg-white/90 dark:bg-slate-950/90 backdrop-blur-2xl border-b border-slate-200/80 dark:border-slate-800/80">
      <div className="max-w-[1500px] mx-auto px-4 sm:px-6">
        <div className="h-[72px] flex items-center gap-6">

          {/* ================= LOGO ================= */}
          <Link
            to={dashboardPath}
            className="flex items-center gap-3 min-w-fit group"
          >
            <motion.div
              whileHover={{ scale: 1.06 }}
              whileTap={{ scale: 0.95 }}
              className="relative w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-1 flex items-center justify-center shadow-md shadow-teal-500/10"
            >
              <img
                src="/logo.png"
                alt="MediNest Logo"
                className="w-full h-full object-contain"
              />
              <div className="absolute inset-0 rounded-2xl bg-teal-400 blur-xl opacity-10 group-hover:opacity-30 transition-opacity" />
            </motion.div>

            <div className="hidden sm:block">
              <div className="text-xl font-extrabold bg-gradient-to-r from-teal-700 via-cyan-600 to-emerald-500 bg-clip-text text-transparent flex items-center gap-1.5">
                {t('brandName', 'MediNest')}
                <Sparkles className="w-3.5 h-3.5 text-teal-500" />
              </div>

              <div className="text-[9px] uppercase tracking-[0.18em] font-semibold text-slate-400">
                {t('brandTagline', 'Healthcare AI Network')}
              </div>
            </div>
          </Link>

          {/* ================= DESKTOP NAV ================= */}
          <nav className="hidden lg:flex items-center gap-1 flex-1">
            {navItems.map((item) => {
              const Icon = item.icon
              const active =
                location.pathname === item.path ||
                location.pathname.startsWith(`${item.path}/`)

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`
                    relative flex items-center gap-2
                    px-3.5 py-2.5
                    rounded-xl
                    text-sm font-semibold
                    transition-all duration-200
                    ${active
                      ? 'bg-teal-50 dark:bg-teal-950/40 text-teal-700 dark:text-teal-300'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-900'
                    }
                  `}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>

                  {active && (
                    <motion.div
                      layoutId="activePortalTab"
                      className="absolute -bottom-[1px] left-4 right-4 h-0.5 rounded-full bg-teal-500"
                      transition={{
                        type: 'spring',
                        stiffness: 400,
                        damping: 30
                      }}
                    />
                  )}
                </Link>
              )
            })}
          </nav>

          {/* ================= SEARCH ================= */}
          <div className="hidden xl:flex w-[220px] 2xl:w-[260px]">
            <div className="w-full h-10 rounded-xl bg-slate-100/80 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center px-3 gap-2 focus-within:ring-2 focus-within:ring-teal-500/30 focus-within:border-teal-400 transition">
              <Search className="w-4 h-4 text-slate-400 flex-shrink-0" />
              <input
                className="bg-transparent outline-none w-full text-xs text-slate-800 dark:text-slate-200 placeholder:text-slate-400"
                placeholder={
                  role === 'patient'
                    ? t('searchHealth', 'Search health...')
                    : role === 'doctor'
                      ? 'Search patients...'
                      : 'Search...'
                }
              />
            </div>
          </div>

          {/* ================= RIGHT SIDE ================= */}
          <div className="flex items-center gap-2.5 ml-auto">

            {/* Language Switcher Dropdown */}
            <LanguageSelector variant="navbar" />

            {/* Notification */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              aria-label="Notifications"
              className="relative w-10 h-10 hidden sm:flex items-center justify-center rounded-xl text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900 transition"
            >
              <Bell className="w-4.5 h-4.5" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-teal-500 rounded-full" />
            </motion.button>

            {/* Role badge */}
            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-teal-50 dark:bg-teal-950/40 border border-teal-200/70 dark:border-teal-900 text-teal-700 dark:text-teal-300 text-xs font-bold">
              <span className="w-2 h-2 rounded-full bg-teal-500 animate-pulse" />
              {roleLabel}
            </div>

            {/* ================= PROFILE ================= */}
            <div className="relative">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => setProfileOpen(!profileOpen)}
                className="flex items-center gap-2 p-1 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-900 transition"
              >
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-teal-600 to-emerald-500 text-white flex items-center justify-center font-bold text-sm shadow-md shadow-teal-500/20">
                  {userName.charAt(0).toUpperCase()}
                </div>

                <div className="hidden lg:block text-left">
                  <p className="text-xs font-bold text-slate-800 dark:text-white max-w-[100px] truncate">
                    {userName}
                  </p>
                  <p className="text-[10px] text-slate-400">
                    {roleLabel}
                  </p>
                </div>

                <ChevronDown
                  className={`
                    hidden lg:block w-4 h-4 text-slate-400
                    transition-transform
                    ${profileOpen ? 'rotate-180' : ''}
                  `}
                />
              </motion.button>

              {/* PROFILE DROPDOWN */}
              <AnimatePresence>
                {profileOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.97 }}
                    className="absolute right-0 top-12 w-64 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden z-50"
                  >
                    <div className="p-4 bg-gradient-to-br from-teal-500/5 to-cyan-500/10 border-b border-slate-100 dark:border-slate-800">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-600 to-emerald-500 text-white flex items-center justify-center font-bold">
                          {userName.charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <p className="font-bold text-sm text-slate-900 dark:text-white truncate">
                            {userName}
                          </p>
                          <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                            {user?.email}
                          </p>
                        </div>
                      </div>

                      <div className="mt-3 inline-flex items-center gap-2 px-2.5 py-1 rounded-lg bg-teal-500/10 text-teal-700 dark:text-teal-300 text-[10px] font-bold">
                        <span className="w-1.5 h-1.5 rounded-full bg-teal-500" />
                        {roleLabel}
                      </div>
                    </div>

                    <div className="p-1.5">
                      <Link
                        to="/profile"
                        onClick={() => setProfileOpen(false)}
                        className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-sm font-medium text-slate-700 dark:text-slate-200 transition"
                      >
                        <UserRound className="w-4 h-4 text-teal-600" />
                        {t('myProfile', 'My Profile')}
                      </Link>

                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-rose-50 dark:hover:bg-rose-950/30 text-sm font-medium text-rose-600 dark:text-rose-400 transition"
                      >
                        <LogOut className="w-4 h-4" />
                        {t('logout', 'Logout')}
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* MOBILE MENU */}
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Toggle mobile menu"
              className="lg:hidden w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-200 flex items-center justify-center"
            >
              {mobileOpen
                ? <X className="w-5 h-5" />
                : <Menu className="w-5 h-5" />
              }
            </motion.button>

          </div>
        </div>
      </div>

      {/* ================= MOBILE NAV ================= */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 overflow-hidden"
          >
            <div className="p-4 space-y-1.5">
              {navItems.map((item) => {
                const Icon = item.icon
                const active =
                  location.pathname === item.path ||
                  location.pathname.startsWith(`${item.path}/`)

                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setMobileOpen(false)}
                    className={`
                      flex items-center gap-3
                      px-4 py-3
                      rounded-xl
                      text-sm font-semibold
                      transition
                      ${active
                        ? 'bg-teal-50 dark:bg-teal-950/40 text-teal-700 dark:text-teal-300'
                        : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-900'
                      }
                    `}
                  >
                    <Icon className="w-4 h-4 text-teal-600" />
                    {item.label}
                  </Link>
                )
              })}

              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <Link
                  to="/profile"
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium text-slate-700 dark:text-slate-200"
                >
                  <UserRound className="w-4 h-4 text-teal-600" />
                  {t('myProfile', 'My Profile')}
                </Link>
                <LanguageSelector variant="navbar" />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}