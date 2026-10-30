// frontend/src/components/schemes/Schemes.jsx
// MediNest Government Health Schemes — National Health Benefits & Eligibility Portal

import { useState, useMemo, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Gift,
  ExternalLink,
  Search,
  Filter,
  CheckCircle2,
  AlertCircle,
  XCircle,
  HelpCircle,
  Building2,
  ShieldCheck,
  FileText,
  UserCheck,
  Phone,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  HeartPulse,
  Baby,
  Activity,
  HeartHandshake,
  Stethoscope,
  ChevronRight,
  X,
  Info,
  Check,
  Clock,
  IdCard,
  MapPin,
  Users,
  Award
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { useLanguage } from '../../i18n/LanguageContext'

/* =========================================================
   COMPREHENSIVE OFFICIAL GOVERNMENT HEALTH SCHEMES DATA
   ========================================================= */

const SCHEMES_DATA = [
  {
    id: 'pm-jay',
    name: 'Ayushman Bharat – PM-JAY',
    fullName: 'Pradhan Mantri Jan Arogya Yojana',
    department: 'Ministry of Health & Family Welfare • National Health Authority',
    category: 'General Healthcare',
    targetGroup: 'Low-income Families',
    recommended: true,
    recommendationReason: 'Universal primary & secondary hospitalization assurance',
    icon: ShieldCheck,
    color: 'teal',
    description:
      'Health coverage for eligible families for secondary and tertiary hospitalization.',
    benefits: [
      'Up to ₹5 lakh coverage per family per year',
      'Cashless treatment at empaneled hospitals',
      'Pre & post hospitalization expenses covered',
      'Covers 1,949+ medical procedures & surgeries'
    ],
    eligibilitySummary: 'Eligible low-income and vulnerable families as per SECC database.',
    eligibilityRules: {
      maxIncomeCategory: 'low_income',
      targetGenders: ['all']
    },
    documents: [
      'Aadhaar Card of family members',
      'Ration Card / BPL Certificate',
      'Mobile Number linked with Aadhaar'
    ],
    applicationProcess: [
      'Visit nearest CSC Center or Empaneled Hospital Ayushman Mitra desk',
      'Present Aadhaar and Ration Card for biometric e-KYC verification',
      'Receive instant PVC Ayushman Card with unique PM-JAY ID'
    ],
    helpline: '14555 (Toll-Free 24x7)',
    officialUrl: 'https://pmjay.gov.in',
    stateCoverage: 'National (All States & UTs)'
  },
  {
    id: 'pmmvy',
    name: 'Pradhan Mantri Matru Vandana Yojana (PMMVY)',
    fullName: 'Direct Benefit Transfer for Maternal Nutrition',
    department: 'Ministry of Women & Child Development',
    category: 'Maternal Health',
    targetGroup: 'Pregnant Women',
    recommended: true,
    recommendationReason: 'Direct maternity cash benefit & safe institutional birth support',
    icon: Baby,
    color: 'emerald',
    description:
      'Direct Benefit Transfer (DBT) cash incentive of up to ₹6,000 for pregnant women and lactating mothers for improved maternal health.',
    benefits: [
      '₹5,000 cash incentive in direct installments',
      'Additional ₹6,000 benefit on birth of a girl child',
      'Nutritional support & free ANC checkups',
      'Safe institutional delivery incentives'
    ],
    eligibilitySummary: 'Pregnant women aged 19+ in socially/economically disadvantaged categories.',
    eligibilityRules: {
      requirePregnancy: true,
      minAge: 19,
      targetGenders: ['female']
    },
    documents: [
      'Mother and Child Protection (MCP) Card',
      'Aadhaar of Mother and Husband',
      'Bank Account passbook linked with Aadhaar'
    ],
    applicationProcess: [
      'Register at your local Anganwadi Center or Primary Health Centre (PHC)',
      'Complete mandatory antenatal checkups (ANC)',
      'Funds are credited directly via PFMS into your bank account'
    ],
    helpline: '181 / 1098 (Women & Child Helpline)',
    officialUrl: 'https://pmmvy.wcd.gov.in',
    stateCoverage: 'All States & Union Territories'
  },
  {
    id: 'jsy',
    name: 'Janani Suraksha Yojana (JSY)',
    fullName: 'Safe Motherhood Institutional Delivery Scheme',
    department: 'National Health Mission • MoHFW',
    category: 'Maternal Health',
    targetGroup: 'Pregnant Women',
    recommended: false,
    icon: HeartHandshake,
    color: 'emerald',
    description:
      'Safe motherhood initiative promoting institutional delivery among poor pregnant women with cash assistance up to ₹1,400.',
    benefits: [
      '₹1,400 cash assistance for rural mothers delivering in health institutions',
      '₹1,000 cash assistance for urban institutional delivery',
      'Free 108/102 transport to health facility',
      'Free C-section and obstetric emergency care'
    ],
    eligibilitySummary: 'BPL, SC & ST pregnant women delivering in government or accredited private facilities.',
    eligibilityRules: {
      requirePregnancy: true,
      targetGenders: ['female']
    },
    documents: [
      'MCP (Maternity) Card',
      'BPL Card / Income or Caste Certificate',
      'Aadhaar Card & Bank Account'
    ],
    applicationProcess: [
      'Contact your local ASHA or ANM during pregnancy checkups',
      'Deliver at nearest Primary Health Centre or Community Health Centre',
      'Payment is processed at discharge by the hospital medical officer'
    ],
    helpline: '104 (Health Information Helpline)',
    officialUrl: 'https://nhm.gov.in',
    stateCoverage: 'All High Performing & Low Performing States'
  },
  {
    id: 'nikshay',
    name: 'Nikshay Poshan Yojana (TB Care)',
    fullName: 'Direct Financial Nutritional Support for TB Patients',
    department: 'Central TB Division • MoHFW',
    category: 'TB Care',
    targetGroup: 'TB Patients',
    recommended: false,
    icon: HeartPulse,
    color: 'indigo',
    description:
      'Financial nutritional assistance of ₹500/month provided to all notified tuberculosis patients throughout their active treatment.',
    benefits: [
      '₹500 per month financial benefit for nutrition',
      '100% free high-grade anti-TB medications (DOTS)',
      'Free diagnostic CBNAAT / TrueNat sputum testing',
      'Continued support throughout treatment duration'
    ],
    eligibilitySummary: 'All notified TB patients registered on the Ni-kshay national portal.',
    eligibilityRules: {
      conditionMatch: ['tuberculosis']
    },
    documents: [
      'Ni-kshay Patient Enrollment ID',
      'Aadhaar Card',
      'Bank Account details (DBT mandate)'
    ],
    applicationProcess: [
      'Get diagnosed and registered at any government health center or private DOTS provider',
      'Provide your Aadhaar and bank account to the TB Health Visitor / ASHA worker',
      'Monthly funds are transferred automatically until treatment completion'
    ],
    helpline: '1800-11-6666 (Nikshay Helpline)',
    officialUrl: 'https://nikshay.in',
    stateCoverage: 'All States & Union Territories'
  },
  {
    id: 'rbsk',
    name: 'Rashtriya Bal Swasthya Karyakram (RBSK)',
    fullName: 'Child Health Screening & Early Surgical Intervention',
    department: 'Ministry of Health & Family Welfare',
    category: 'Child Health',
    targetGroup: 'Children',
    recommended: false,
    icon: Stethoscope,
    color: 'cyan',
    description:
      'Systematic screening and 100% free surgeries for children (birth to 18 yrs) covering 4Ds: Defects, Diseases, Deficiencies, and Disabilities.',
    benefits: [
      '100% free surgery for congenital heart defects & cleft palate',
      'Free corrective treatments for clubfoot & sensory delays',
      'Dedicated District Early Intervention Centres (DEIC)',
      'Free nutritional rehabilitation therapy'
    ],
    eligibilitySummary: 'All children from birth to 18 years in Anganwadis and Government/Aided schools.',
    eligibilityRules: {
      maxAge: 18
    },
    documents: [
      'Birth Certificate / Anganwadi registration record',
      'Parents Aadhaar Card'
    ],
    applicationProcess: [
      'Screening conducted by Mobile Health Teams at Anganwadis and schools',
      'Identified children are referred to District Early Intervention Centres (DEIC)',
      'Free tertiary surgeries arranged at premier government medical institutes'
    ],
    helpline: '104 (Health Helpline)',
    officialUrl: 'https://rbsk.gov.in',
    stateCoverage: 'All States & Union Territories'
  },
  {
    id: 'nphce',
    name: 'National Programme for Health Care of the Elderly (NPHCE)',
    fullName: 'Geriatric Health Care & Assistive Aid Scheme',
    department: 'Ministry of Health & Family Welfare',
    category: 'Financial Assistance',
    targetGroup: 'Senior Citizens',
    recommended: false,
    icon: Users,
    color: 'teal',
    description:
      'Dedicated geriatric healthcare services, free health checkups, and subsidized assistive aids for senior citizens aged 60+.',
    benefits: [
      'Dedicated Geriatric OPD & indoor wards at District Hospitals',
      'Free diagnostic investigations & chronic medication supply',
      'Free/subsidized assistive aids (hearing aids, walkers, glasses)',
      'Physiotherapy & rehabilitation clinics'
    ],
    eligibilitySummary: 'All senior citizens aged 60 years and above.',
    eligibilityRules: {
      minAge: 60
    },
    documents: [
      'Age Proof (Aadhaar / Voter ID / Senior Citizen Card)',
      'Medical prescription for assistive devices'
    ],
    applicationProcess: [
      'Visit the dedicated Senior Citizen Geriatric Clinic at your District Hospital / CHC',
      'Get registered for comprehensive geriatric assessment',
      'Collect free prescribed medicines and assistive aid vouchers'
    ],
    helpline: '14567 (Senior Citizen National Helpline)',
    officialUrl: 'https://main.mohfw.gov.in',
    stateCoverage: 'All Districts Nationwide'
  },
  {
    id: 'abdm',
    name: 'Ayushman Bharat Digital Mission (ABDM)',
    fullName: 'National Digital Health Ecosystem & ABHA Account',
    department: 'National Health Authority',
    category: 'General Healthcare',
    targetGroup: 'All',
    recommended: true,
    recommendationReason: 'Universal digital health identity & lifelong medical records',
    icon: IdCard,
    color: 'teal',
    description:
      'Creates a seamless digital healthcare ecosystem providing every citizen a unique 14-digit ABHA ID for digital medical records.',
    benefits: [
      'Unique 14-digit digital ABHA Health Number & Card',
      'Paperless, lifetime access to lab reports & prescriptions',
      'Consent-based medical record sharing with verified doctors',
      'Zero-wait OPD fast-track queue scan & share tokens'
    ],
    eligibilitySummary: 'Available for all Indian citizens of any age with Aadhaar or Mobile number.',
    eligibilityRules: {
      allCitizens: true
    },
    documents: [
      'Aadhaar Number (with linked mobile for OTP)',
      'Or Mobile Number with Driving License'
    ],
    applicationProcess: [
      'Create your ABHA ID online in under 60 seconds on MediNest or abha.abdm.gov.in',
      'Verify with Aadhaar OTP',
      'Download and link your ABHA card to your MediNest health profile'
    ],
    helpline: '1800-11-4477 (ABDM Support)',
    officialUrl: 'https://abdm.gov.in',
    stateCoverage: 'Nationwide'
  },
  {
    id: 'pmndp',
    name: 'Pradhan Mantri National Dialysis Programme (PMNDP)',
    fullName: 'Free Hemodialysis for Renal Failure Patients',
    department: 'National Health Mission • MoHFW',
    category: 'Financial Assistance',
    targetGroup: 'Low-income Families',
    recommended: false,
    icon: Activity,
    color: 'rose',
    description:
      'Provides 100% free life-sustaining hemodialysis sessions to BPL patients suffering from renal failure at District Hospitals.',
    benefits: [
      '100% free hemodialysis sessions for BPL patients',
      'Subsidized rates for non-BPL patients under PPP model',
      'Covers dialysis consumables, dialyzer reuse, and nursing care',
      'Operational at 500+ District Hospitals across the country'
    ],
    eligibilitySummary: 'Patients diagnosed with End-Stage Renal Disease (ESRD) requiring regular dialysis.',
    eligibilityRules: {
      conditionMatch: ['kidney', 'dialysis']
    },
    documents: [
      'Nephrologist Clinical Diagnosis / Dialysis Prescription',
      'BPL Card / Ayushman Bharat Card',
      'Aadhaar Card'
    ],
    applicationProcess: [
      'Visit District Hospital Dialysis Centre with nephrologist referral',
      'Verify BPL status with Ayushman Card / Ration Card',
      'Get scheduled for regular weekly free dialysis sessions'
    ],
    helpline: '104 (National Health Helpline)',
    officialUrl: 'https://nhm.gov.in',
    stateCoverage: 'All District Hospitals'
  },
  {
    id: 'imi',
    name: 'Intensified Mission Indradhanush (IMI)',
    fullName: 'Universal Full Immunization Program',
    department: 'Ministry of Health & Family Welfare',
    category: 'Child Health',
    targetGroup: 'Children',
    recommended: false,
    icon: Stethoscope,
    color: 'emerald',
    description:
      'Immunization drive ensuring full coverage against 12 vaccine-preventable diseases for pregnant women and children up to 5 years.',
    benefits: [
      'Free vaccines against Polio, Measles-Rubella, Hepatitis B, Tetanus & Diphtheria',
      'Catch-up vaccination drives in rural & tribal areas',
      'Digital immunization tracking via U-WIN platform',
      'Protection against childhood pneumonia & rotavirus'
    ],
    eligibilitySummary: 'All children up to 5 years and pregnant women with missed or pending vaccine doses.',
    eligibilityRules: {
      maxAge: 5,
      requirePregnancy: true
    },
    documents: [
      'MCP (Mother-Child Protection) Card',
      'Aadhaar / Mobile Number for U-WIN entry'
    ],
    applicationProcess: [
      'Visit your local Village Health & Nutrition Day (VHND) or PHC',
      'ASHA worker checks pending vaccines from your MCP card',
      'Receive free vaccination and digital U-WIN certificate'
    ],
    helpline: '1075 (National Vaccine Helpline)',
    officialUrl: 'https://nhm.gov.in',
    stateCoverage: 'Pan-India Catchment Districts'
  }
]

const CATEGORIES = [
  'All',
  'Maternal Health',
  'Child Health',
  'TB Care',
  'General Healthcare',
  'Financial Assistance'
]

const ELIGIBILITY_TARGETS = [
  'All',
  'Pregnant Women',
  'Children',
  'Senior Citizens',
  'Low-income Families',
  'TB Patients'
]

const STATES = [
  'All States',
  'Madhya Pradesh',
  'Uttar Pradesh',
  'Maharashtra',
  'Rajasthan',
  'Bihar',
  'West Bengal',
  'Gujarat'
]

export default function Schemes() {
  const { user } = useAuth()
  const { t } = useLanguage()

  /* ── Filter State ─────────────────────────────────────────── */
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [selectedTarget, setSelectedTarget] = useState('All')
  const [selectedState, setSelectedState] = useState('All States')

  /* ── Modal State ──────────────────────────────────────────── */
  const [selectedSchemeForDetail, setSelectedSchemeForDetail] = useState(null)
  const [showEligibilityModal, setShowEligibilityModal] = useState(false)
  const [eligibilityPreselect, setEligibilityPreselect] = useState(null)

  /* ── Eligibility Form State ───────────────────────────────── */
  const [eligibilityForm, setEligibilityForm] = useState({
    age: '',
    gender: 'Male',
    state: 'Madhya Pradesh',
    incomeCategory: 'low_income', // 'low_income' | 'middle' | 'high'
    occupation: 'Agricultural / Informal Worker',
    isPregnant: false,
    condition: 'none' // 'none' | 'tuberculosis' | 'kidney' | 'senior' | 'cardiac'
  })

  const [eligibilityResult, setEligibilityResult] = useState(null)
  const [evaluating, setEvaluating] = useState(false)

  // Initialize eligibility form defaults from user profile if available
  useEffect(() => {
    if (user) {
      if (user.gender) {
        setEligibilityForm(prev => ({ ...prev, gender: user.gender }))
      }
      if (user.age) {
        setEligibilityForm(prev => ({ ...prev, age: String(user.age) }))
      }
    }
  }, [user])

  /* ── Filter Logic ─────────────────────────────────────────── */
  const filteredSchemes = useMemo(() => {
    return SCHEMES_DATA.filter(scheme => {
      const matchSearch =
        searchTerm === '' ||
        scheme.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        scheme.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
        scheme.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        scheme.benefits.some(b => b.toLowerCase().includes(searchTerm.toLowerCase()))

      const matchCategory =
        selectedCategory === 'All' || scheme.category === selectedCategory

      const matchTarget =
        selectedTarget === 'All' || scheme.targetGroup === selectedTarget

      return matchSearch && matchCategory && matchTarget
    })
  }, [searchTerm, selectedCategory, selectedTarget])

  const recommendedSchemes = useMemo(() => {
    return SCHEMES_DATA.filter(s => s.recommended)
  }, [])

  /* ── Eligibility Evaluator Algorithm ──────────────────────── */
  const handleEvaluateEligibility = (e) => {
    if (e) e.preventDefault()
    setEvaluating(true)

    setTimeout(() => {
      const matched = []
      const checkRequired = []

      const ageNum = Number(eligibilityForm.age) || 28
      const isFemale = eligibilityForm.gender.toLowerCase() === 'female'
      const isPreg = isFemale && eligibilityForm.isPregnant
      const isLowIncome = eligibilityForm.incomeCategory === 'low_income'
      const cond = eligibilityForm.condition

      SCHEMES_DATA.forEach(scheme => {
        // PM-JAY
        if (scheme.id === 'pm-jay') {
          if (isLowIncome) {
            matched.push({ scheme, reason: 'Eligible for up to ₹5 lakh coverage under low-income / BPL guidelines.' })
          } else {
            checkRequired.push({ scheme, reason: 'Requires verification against state ration card or SECC list.' })
          }
        }
        // PMMVY & JSY
        else if (scheme.id === 'pmmvy' || scheme.id === 'jsy') {
          if (isPreg) {
            matched.push({ scheme, reason: 'Pregnant mother qualifying for direct cash support & safe delivery benefits.' })
          } else if (isFemale && ageNum >= 19 && ageNum <= 45) {
            checkRequired.push({ scheme, reason: 'Applicable during active pregnancy with MCP card registration.' })
          }
        }
        // Nikshay TB
        else if (scheme.id === 'nikshay') {
          if (cond === 'tuberculosis') {
            matched.push({ scheme, reason: 'Diagnosed TB patient qualifying for ₹500/month nutritional financial assistance.' })
          }
        }
        // ABDM
        else if (scheme.id === 'abdm') {
          matched.push({ scheme, reason: 'Available for all citizens. Instant 14-digit ABHA creation.' })
        }
        // RBSK & IMI
        else if (scheme.id === 'rbsk' || scheme.id === 'imi') {
          if (ageNum <= 18) {
            matched.push({ scheme, reason: 'Child qualifying for free health screening & free surgical interventions.' })
          }
        }
        // NPHCE Senior Care
        else if (scheme.id === 'nphce') {
          if (ageNum >= 60 || cond === 'senior') {
            matched.push({ scheme, reason: 'Senior citizen (60+) eligible for dedicated geriatric clinics & assistive aids.' })
          }
        }
        // Dialysis
        else if (scheme.id === 'pmndp') {
          if (cond === 'kidney') {
            matched.push({ scheme, reason: '100% free hemodialysis sessions at government district hospitals.' })
          }
        }
      })

      let overallStatus = 'matched'
      if (matched.length === 0 && checkRequired.length > 0) {
        overallStatus = 'check_required'
      } else if (matched.length === 0 && checkRequired.length === 0) {
        overallStatus = 'not_matched'
      }

      setEligibilityResult({
        status: overallStatus,
        matched,
        checkRequired,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      })

      setEvaluating(false)
    }, 400)
  }

  const openEligibilityForScheme = (scheme) => {
    setEligibilityPreselect(scheme)
    if (scheme?.id === 'pmmvy' || scheme?.id === 'jsy') {
      setEligibilityForm(prev => ({ ...prev, gender: 'Female', isPregnant: true }))
    } else if (scheme?.id === 'nikshay') {
      setEligibilityForm(prev => ({ ...prev, condition: 'tuberculosis' }))
    } else if (scheme?.id === 'pmndp') {
      setEligibilityForm(prev => ({ ...prev, condition: 'kidney' }))
    } else if (scheme?.id === 'nphce') {
      setEligibilityForm(prev => ({ ...prev, age: '65', condition: 'senior' }))
    }
    setEligibilityResult(null)
    setShowEligibilityModal(true)
  }

  const resetFilters = () => {
    setSearchTerm('')
    setSelectedCategory('All')
    setSelectedTarget('All')
    setSelectedState('All States')
  }

  const hasActiveFilters =
    searchTerm !== '' ||
    selectedCategory !== 'All' ||
    selectedTarget !== 'All' ||
    selectedState !== 'All States'

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-8 px-4 sm:px-6 lg:px-8 transition-colors">
      <div className="max-w-7xl mx-auto space-y-8">

        {/* =========================================================
            1. PAGE HEADER
        ========================================================= */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 pb-2">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded-full bg-teal-500/10 text-teal-700 dark:text-teal-300 text-xs font-bold uppercase tracking-wider border border-teal-500/20 flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-teal-600" />
                National Health Portal
              </span>
              <span className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
                <ShieldCheck className="w-3.5 h-3.5 text-teal-500" /> {t('abdmLinked', 'Ayushman Bharat Verified')}
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              {t('governmentHealthSchemes', 'Government Health Schemes')}
            </h1>
            <p className="text-sm sm:text-base text-slate-500 dark:text-slate-400 mt-1 max-w-2xl">
              {t('schemesSubtitle', 'Find healthcare benefits and government schemes you may be eligible for.')}
            </p>
          </div>

          {/* Header Action: Check Eligibility */}
          <div className="flex items-center gap-3 self-start md:self-center">
            <Link
              to="/patient/dashboard"
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-2xl text-sm font-semibold text-slate-600 dark:text-slate-300 hover:text-teal-600 dark:hover:text-teal-400 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm transition"
            >
              <ArrowLeft className="w-4 h-4" /> {t('dashboard', 'Dashboard')}
            </Link>

            <button
              onClick={() => {
                setEligibilityPreselect(null)
                setEligibilityResult(null)
                setShowEligibilityModal(true)
              }}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-sm shadow-md shadow-teal-500/20 transition transform active:scale-95"
            >
              <UserCheck className="w-4 h-4" />
              {t('checkEligibility', 'Check Eligibility')}
            </button>
          </div>
        </div>

        {/* =========================================================
            2. QUICK FILTER / DISCOVERY BAR
        ========================================================= */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">

            {/* Search schemes */}
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder={t('searchSchemes', 'Search schemes...')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-8 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-2xl text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-teal-500/40 focus:border-teal-500 outline-none transition"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Category Dropdown */}
            <div>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-2xl text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-teal-500/40 focus:border-teal-500 outline-none transition"
              >
                {CATEGORIES.map(cat => (
                  <option key={cat} value={cat}>
                    {cat === 'All' ? t('allCategories', 'All Categories') : cat}
                  </option>
                ))}
              </select>
            </div>

            {/* Eligibility Dropdown */}
            <div>
              <select
                value={selectedTarget}
                onChange={(e) => setSelectedTarget(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-2xl text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-teal-500/40 focus:border-teal-500 outline-none transition"
              >
                {ELIGIBILITY_TARGETS.map(tg => (
                  <option key={tg} value={tg}>
                    {tg === 'All' ? t('allBeneficiaries', 'All Beneficiaries') : tg}
                  </option>
                ))}
              </select>
            </div>

            {/* State Dropdown */}
            <div>
              <select
                value={selectedState}
                onChange={(e) => setSelectedState(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-2xl text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-teal-500/40 focus:border-teal-500 outline-none transition"
              >
                {STATES.map(st => (
                  <option key={st} value={st}>
                    {st === 'All States' ? t('allStates', 'All States') : st}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Active Filter helper */}
          {hasActiveFilters && (
            <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
              <span>Showing {filteredSchemes.length} matching scheme{filteredSchemes.length === 1 ? '' : 's'}</span>
              <button
                onClick={resetFilters}
                className="text-teal-600 dark:text-teal-400 font-semibold hover:underline"
              >
                {t('clearAllFilters', 'Clear all filters')}
              </button>
            </div>
          )}
        </div>

        {/* =========================================================
            3. FEATURED / RECOMMENDED SECTION
        ========================================================= */}
        {!hasActiveFilters && (
          <div className="space-y-4">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                  {t('recommendedForYou', 'Recommended for You')}
                </h2>
                <span className="px-2 py-0.5 rounded-md bg-teal-50 dark:bg-teal-950/60 border border-teal-200 dark:border-teal-800 text-[10px] font-bold text-teal-700 dark:text-teal-300">
                  {t('potentialMatch', 'Potential match')}
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {t('basedOnProfile', 'Based on your profile and health needs')}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {recommendedSchemes.map((scheme) => (
                <div
                  key={`rec-${scheme.id}`}
                  className="relative overflow-hidden bg-gradient-to-br from-teal-500/5 via-emerald-500/5 to-transparent bg-white dark:bg-slate-900 rounded-3xl p-6 border-2 border-teal-500/30 dark:border-teal-500/30 shadow-sm hover:shadow-md transition group"
                >
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-2xl bg-teal-600 text-white flex items-center justify-center shadow-md shadow-teal-500/20 flex-shrink-0">
                        <scheme.icon className="w-5 h-5" />
                      </div>
                      <div>
                        <span className="inline-block px-2 py-0.5 rounded-full bg-teal-100 dark:bg-teal-950 text-teal-800 dark:text-teal-300 text-[10px] font-extrabold uppercase tracking-wider mb-1">
                          {t('recommended', 'Recommended')}
                        </span>
                        <h3 className="font-extrabold text-base text-slate-900 dark:text-white group-hover:text-teal-600 dark:group-hover:text-teal-400 transition">
                          {scheme.name}
                        </h3>
                        <p className="text-xs text-slate-400">{scheme.department}</p>
                      </div>
                    </div>
                  </div>

                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed mb-4">
                    {scheme.description}
                  </p>

                  <div className="space-y-1.5 mb-5">
                    {scheme.benefits.slice(0, 2).map((benefit, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-xs font-semibold text-teal-800 dark:text-teal-300">
                        <Check className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400 flex-shrink-0" />
                        <span>{benefit}</span>
                      </div>
                    ))}
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800">
                    <button
                      onClick={() => setSelectedSchemeForDetail(scheme)}
                      className="text-xs font-bold text-slate-700 dark:text-slate-300 hover:text-teal-600 dark:hover:text-teal-400 transition"
                    >
                      {t('viewDetails', 'View Details')} →
                    </button>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => openEligibilityForScheme(scheme)}
                        className="px-3 py-1.5 rounded-xl border border-teal-200 dark:border-teal-800 text-xs font-bold text-teal-700 dark:text-teal-300 hover:bg-teal-50 dark:hover:bg-teal-950/40 transition"
                      >
                        {t('checkEligibility', 'Check Eligibility')}
                      </button>
                      <a
                        href={scheme.officialUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 px-3.5 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold shadow-sm transition"
                      >
                        {t('applyNow', 'Apply Now ↗')}
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* =========================================================
            4. SCHEME CARDS GRID
        ========================================================= */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              {t('governmentHealthSchemes', 'All Government Health Schemes')}
            </h2>
            <span className="text-xs font-semibold text-slate-400">
              {filteredSchemes.length} Schemes Available
            </span>
          </div>

          {filteredSchemes.length === 0 ? (
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-12 text-center border border-slate-200/80 dark:border-slate-800">
              <HelpCircle className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
              <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200">No schemes found</h3>
              <p className="text-sm text-slate-500 mt-1">{t('noSchemesFound', 'Try adjusting your keyword or filter criteria.')}</p>
              <button
                onClick={resetFilters}
                className="mt-4 px-4 py-2 rounded-xl bg-teal-600 text-white text-xs font-bold hover:bg-teal-500 transition"
              >
                {t('clearAllFilters', 'Reset Filters')}
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredSchemes.map((scheme) => (
                <div
                  key={scheme.id}
                  className="flex flex-col justify-between bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-md transition hover:-translate-y-0.5 group"
                >
                  <div>
                    {/* Top: Icon + Department */}
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="w-10 h-10 rounded-2xl bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400 border border-teal-200/60 dark:border-teal-800 flex items-center justify-center flex-shrink-0">
                        <scheme.icon className="w-5 h-5" />
                      </div>
                      <span className="px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-[10px] font-bold truncate max-w-[170px]">
                        {scheme.category}
                      </span>
                    </div>

                    {/* Scheme Name */}
                    <h3 className="font-extrabold text-base text-slate-900 dark:text-white leading-snug group-hover:text-teal-600 dark:group-hover:text-teal-400 transition">
                      {scheme.name}
                    </h3>
                    <p className="text-[11px] text-slate-400 mt-0.5 font-medium">{scheme.department}</p>

                    {/* Description */}
                    <p className="text-xs text-slate-600 dark:text-slate-300 mt-3 line-clamp-2 leading-relaxed">
                      {scheme.description}
                    </p>

                    {/* Key Benefits as Green/Teal Pills */}
                    <div className="mt-4 flex flex-wrap gap-1.5">
                      {scheme.benefits.slice(0, 3).map((benefit, idx) => (
                        <span
                          key={idx}
                          className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-900"
                        >
                          <Check className="w-2.5 h-2.5 text-emerald-600" />
                          <span className="truncate max-w-[200px]">{benefit}</span>
                        </span>
                      ))}
                    </div>

                    {/* Eligibility Summary */}
                    <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800">
                      <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                        {t('eligibility', 'Eligibility')}
                      </p>
                      <p className="text-xs text-slate-700 dark:text-slate-300 line-clamp-2">
                        {scheme.eligibilitySummary}
                      </p>
                    </div>
                  </div>

                  {/* Actions Footer */}
                  <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                    <button
                      onClick={() => setSelectedSchemeForDetail(scheme)}
                      className="text-xs font-bold text-slate-700 dark:text-slate-300 hover:text-teal-600 dark:hover:text-teal-400 transition"
                    >
                      {t('viewDetails', 'View Details')}
                    </button>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => openEligibilityForScheme(scheme)}
                        className="px-3 py-1.5 rounded-xl border border-teal-200 dark:border-teal-800/80 text-xs font-bold text-teal-700 dark:text-teal-300 hover:bg-teal-50 dark:hover:bg-teal-950/40 transition"
                      >
                        {t('checkEligibility', 'Check Eligibility')}
                      </button>

                      <a
                        href={scheme.officialUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 px-3.5 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold shadow-sm transition"
                      >
                        {t('applyNow', 'Apply Now ↗')}
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* =========================================================
            5. IMPORTANT GOVERNMENT INFORMATION SECTION
        ========================================================= */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-7 border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-2xl bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 border border-amber-200/60 dark:border-amber-900 flex items-center justify-center flex-shrink-0 mt-0.5">
              <Info className="w-5 h-5" />
            </div>
            <div className="space-y-1.5 flex-1">
              <h3 className="font-extrabold text-sm text-slate-900 dark:text-white uppercase tracking-wider">
                {t('importantNotice', 'Important')}
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                {t('schemesAdvisory', 'Scheme availability, eligibility, benefits and application requirements may change. Please verify the latest information through the official government portal before applying.')}
              </p>
              <div className="pt-2 flex flex-wrap items-center gap-4 text-xs font-semibold text-slate-500">
                <span className="flex items-center gap-1 text-teal-700 dark:text-teal-400 font-bold">
                  <Phone className="w-3.5 h-3.5" /> PM-JAY: 14555
                </span>
                <span>•</span>
                <span className="flex items-center gap-1 text-teal-700 dark:text-teal-400 font-bold">
                  <Phone className="w-3.5 h-3.5" /> Health Helpline: 104
                </span>
                <span>•</span>
                <span className="flex items-center gap-1 text-teal-700 dark:text-teal-400 font-bold">
                  <Phone className="w-3.5 h-3.5" /> Emergency Medical: 108
                </span>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* =========================================================
          6. ELIGIBILITY EVALUATOR MODAL
      ========================================================= */}
      <AnimatePresence>
        {showEligibilityModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 15 }}
              className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-2xl relative my-8"
            >
              {/* Close button */}
              <button
                onClick={() => setShowEligibilityModal(false)}
                className="absolute top-6 right-6 p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-2xl bg-teal-50 dark:bg-teal-950 text-teal-600 dark:text-teal-400 border border-teal-200 dark:border-teal-800 flex items-center justify-center font-bold">
                  <UserCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-xl font-extrabold text-slate-900 dark:text-white">
                    {t('checkEligibility', 'Check Eligibility')}
                  </h3>
                  <p className="text-xs text-slate-400">
                    {eligibilityPreselect ? `Evaluating potential match for ${eligibilityPreselect.name}` : 'Preliminary eligibility assessment across national health programs'}
                  </p>
                </div>
              </div>

              {!eligibilityResult ? (
                <form onSubmit={handleEvaluateEligibility} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Age */}
                    <div>
                      <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                        {t('age', 'Age (Years)')}
                      </label>
                      <input
                        type="number"
                        min="0"
                        max="120"
                        required
                        placeholder="e.g. 28"
                        value={eligibilityForm.age}
                        onChange={(e) => setEligibilityForm({ ...eligibilityForm, age: e.target.value })}
                        className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-teal-500/40 outline-none"
                      />
                    </div>

                    {/* Gender */}
                    <div>
                      <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                        {t('gender', 'Gender')}
                      </label>
                      <select
                        value={eligibilityForm.gender}
                        onChange={(e) => setEligibilityForm({ ...eligibilityForm, gender: e.target.value })}
                        className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-teal-500/40 outline-none"
                      >
                        <option value="Male">{t('male', 'Male')}</option>
                        <option value="Female">{t('female', 'Female')}</option>
                        <option value="Other">{t('other', 'Other')}</option>
                      </select>
                    </div>

                    {/* State */}
                    <div>
                      <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                        {t('allStates', 'State')}
                      </label>
                      <select
                        value={eligibilityForm.state}
                        onChange={(e) => setEligibilityForm({ ...eligibilityForm, state: e.target.value })}
                        className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-teal-500/40 outline-none"
                      >
                        {STATES.filter(s => s !== 'All States').map(st => (
                          <option key={st} value={st}>{st}</option>
                        ))}
                      </select>
                    </div>

                    {/* Annual Family Income */}
                    <div>
                      <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                        {t('annualIncome', 'Annual Family Income')}
                      </label>
                      <select
                        value={eligibilityForm.incomeCategory}
                        onChange={(e) => setEligibilityForm({ ...eligibilityForm, incomeCategory: e.target.value })}
                        className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-teal-500/40 outline-none"
                      >
                        <option value="low_income">&lt; ₹2.5 Lakh (BPL / Ration Card / EWS)</option>
                        <option value="middle">₹2.5 Lakh – ₹5 Lakh</option>
                        <option value="high">&gt; ₹5 Lakh</option>
                      </select>
                    </div>
                  </div>

                  {/* Occupation */}
                  <div>
                    <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                      {t('occupation', 'Occupation')}
                    </label>
                    <select
                      value={eligibilityForm.occupation}
                      onChange={(e) => setEligibilityForm({ ...eligibilityForm, occupation: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-teal-500/40 outline-none"
                    >
                      <option value="Agricultural / Informal Worker">Agricultural / Daily Wage Worker</option>
                      <option value="Artisan / Craftsperson">Artisan / Small Trade</option>
                      <option value="Self-Employed">Self-Employed / Small Business</option>
                      <option value="Salaried / Professional">Salaried Employee</option>
                      <option value="Homemaker / Student">Homemaker / Student / Other</option>
                    </select>
                  </div>

                  {/* Pregnancy Status (if Female) */}
                  {eligibilityForm.gender.toLowerCase() === 'female' && (
                    <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/80 flex items-center justify-between">
                      <div>
                        <p className="text-xs font-bold text-emerald-900 dark:text-emerald-200">
                          {t('pregnancyStatus', 'Pregnancy Status')}
                        </p>
                        <p className="text-[11px] text-emerald-700 dark:text-emerald-400">
                          Currently pregnant or nursing mother (Unlocks PMMVY & JSY support)
                        </p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={eligibilityForm.isPregnant}
                          onChange={(e) => setEligibilityForm({ ...eligibilityForm, isPregnant: e.target.checked })}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600" />
                      </label>
                    </div>
                  )}

                  {/* Existing Relevant Conditions */}
                  <div>
                    <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                      {t('existingConditions', 'Existing Relevant Conditions')}
                    </label>
                    <select
                      value={eligibilityForm.condition}
                      onChange={(e) => setEligibilityForm({ ...eligibilityForm, condition: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-teal-500/40 outline-none"
                    >
                      <option value="none">None / General Health</option>
                      <option value="tuberculosis">Tuberculosis (TB) — Unlocks Nikshay Nutritional Support</option>
                      <option value="kidney">Renal / Kidney Condition (Dialysis Required)</option>
                      <option value="senior">Senior Citizen Care (60+ Geriatric)</option>
                      <option value="cardiac">Cardiac / Major Critical Illness</option>
                    </select>
                  </div>

                  {/* Actions */}
                  <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100 dark:border-slate-800">
                    <button
                      type="button"
                      onClick={() => setShowEligibilityModal(false)}
                      className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 transition"
                    >
                      {t('cancel', 'Cancel')}
                    </button>
                    <button
                      type="submit"
                      disabled={evaluating}
                      className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs shadow-md shadow-teal-500/20 transition transform active:scale-95 disabled:opacity-50"
                    >
                      {evaluating ? (
                        <>
                          <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          {t('evaluatingRules', 'Evaluating Rules...')}
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="w-4 h-4" />
                          {t('checkEligibility', 'Check Eligibility')}
                        </>
                      )}
                    </button>
                  </div>
                </form>
              ) : (
                /* Eligibility Result View */
                <div className="space-y-5">
                  <h4 className="text-base font-extrabold text-slate-900 dark:text-white">
                    {t('eligibilityResult', 'Eligibility Result')}
                  </h4>

                  {/* Status Banner */}
                  {eligibilityResult.status === 'matched' ? (
                    <div className="bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800/80 rounded-2xl p-4 flex items-start gap-3.5 text-emerald-900 dark:text-emerald-100">
                      <CheckCircle2 className="w-6 h-6 text-emerald-600 dark:text-emerald-400 flex-shrink-0 mt-0.5" />
                      <div>
                        <h4 className="font-extrabold text-sm text-emerald-800 dark:text-emerald-200">
                          {t('likelyEligible', '✓ Likely Eligible')}
                        </h4>
                        <p className="text-xs text-emerald-700 dark:text-emerald-300 mt-0.5">
                          {t('likelyEligibleDesc', 'Based on the information provided, you may qualify.')}
                        </p>
                      </div>
                    </div>
                  ) : eligibilityResult.status === 'check_required' ? (
                    <div className="bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800/80 rounded-2xl p-4 flex items-start gap-3.5 text-amber-900 dark:text-amber-100">
                      <AlertCircle className="w-6 h-6 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
                      <div>
                        <h4 className="font-extrabold text-sm text-amber-800 dark:text-amber-200">
                          {t('checkRequired', '○ Check Required')}
                        </h4>
                        <p className="text-xs text-amber-700 dark:text-amber-300 mt-0.5">
                          {t('checkRequiredDesc', 'Additional verification is required.')}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 flex items-start gap-3.5 text-slate-800 dark:text-slate-200">
                      <XCircle className="w-6 h-6 text-slate-400 flex-shrink-0 mt-0.5" />
                      <div>
                        <h4 className="font-extrabold text-sm">
                          {t('notMatched', '✕ Not Currently Matched')}
                        </h4>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                          {t('notMatchedDesc', 'No matching scheme was found based on the information provided.')}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Matched Schemes List */}
                  {eligibilityResult.matched.length > 0 && (
                    <div className="space-y-3">
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                        Matched Schemes
                      </p>
                      <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
                        {eligibilityResult.matched.map(({ scheme, reason }) => (
                          <div
                            key={scheme.id}
                            className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700 flex items-center justify-between gap-3"
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-xl bg-teal-100 dark:bg-teal-950 text-teal-700 dark:text-teal-300 flex items-center justify-center font-bold flex-shrink-0">
                                <scheme.icon className="w-4 h-4" />
                              </div>
                              <div>
                                <h5 className="font-extrabold text-xs text-slate-900 dark:text-white">
                                  {scheme.name}
                                </h5>
                                <p className="text-[11px] text-slate-500 dark:text-slate-400">{reason}</p>
                              </div>
                            </div>
                            <a
                              href={scheme.officialUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-3 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-[11px] font-bold flex-shrink-0 inline-flex items-center gap-1 shadow-sm"
                            >
                              {t('applyNow', 'Apply Now ↗')}
                            </a>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Official Disclaimer */}
                  <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-700/60 text-[11px] text-slate-500 dark:text-slate-400 flex items-start gap-2">
                    <Info className="w-4 h-4 text-slate-400 flex-shrink-0 mt-0.5" />
                    <span>
                      {t('eligibilityDisclaimer', 'Final eligibility is determined by the respective government authority.')}
                    </span>
                  </div>

                  {/* Back to Checker button */}
                  <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800">
                    <button
                      type="button"
                      onClick={() => setEligibilityResult(null)}
                      className="text-xs font-bold text-teal-600 dark:text-teal-400 hover:underline"
                    >
                      ← Re-enter Details
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowEligibilityModal(false)}
                      className="px-5 py-2 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-bold hover:opacity-90 transition"
                    >
                      {t('done', 'Done')}
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* =========================================================
          7. SCHEME DETAILS MODAL
      ========================================================= */}
      <AnimatePresence>
        {selectedSchemeForDetail && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 15 }}
              className="w-full max-w-3xl bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-2xl relative my-8 max-h-[90vh] overflow-y-auto"
            >
              {/* Close button */}
              <button
                onClick={() => setSelectedSchemeForDetail(null)}
                className="absolute top-6 right-6 p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Modal Header */}
              <div className="flex items-start gap-4 mb-6">
                <div className="w-12 h-12 rounded-2xl bg-teal-600 text-white flex items-center justify-center shadow-lg shadow-teal-500/20 flex-shrink-0">
                  <selectedSchemeForDetail.icon className="w-6 h-6" />
                </div>
                <div>
                  <span className="px-2.5 py-0.5 rounded-full bg-teal-50 dark:bg-teal-950 text-teal-700 dark:text-teal-300 text-[10px] font-bold border border-teal-200 dark:border-teal-800 uppercase tracking-wider">
                    {selectedSchemeForDetail.category}
                  </span>
                  <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white mt-1">
                    {selectedSchemeForDetail.name}
                  </h3>
                  <p className="text-xs text-slate-400 font-medium">
                    {selectedSchemeForDetail.department}
                  </p>
                </div>
              </div>

              {/* Body Sections */}
              <div className="space-y-6">
                {/* What it provides */}
                <div>
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                    {t('whatItProvides', 'What it provides')}
                  </h4>
                  <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-100 dark:border-slate-800">
                    {selectedSchemeForDetail.description}
                  </p>
                </div>

                {/* Who can benefit & Required Documents */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Who can benefit */}
                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700">
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-2 flex items-center gap-1.5">
                      <UserCheck className="w-4 h-4 text-teal-600" /> {t('whoCanBenefit', 'Who can benefit')}
                    </h4>
                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                      {selectedSchemeForDetail.eligibilitySummary}
                    </p>
                  </div>

                  {/* Required Documents */}
                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700">
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-2 flex items-center gap-1.5">
                      <FileText className="w-4 h-4 text-teal-600" /> {t('requiredDocuments', 'Required Documents')}
                    </h4>
                    <ul className="space-y-1 text-xs text-slate-600 dark:text-slate-300">
                      {selectedSchemeForDetail.documents.map((doc, idx) => (
                        <li key={idx} className="flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-teal-500" />
                          <span>{doc}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Key Benefits */}
                <div>
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                    {t('keyBenefits', 'Key Benefits')}
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {selectedSchemeForDetail.benefits.map((b, idx) => (
                      <div
                        key={idx}
                        className="p-3 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200/60 dark:border-emerald-900 flex items-start gap-2.5 text-xs font-semibold text-emerald-900 dark:text-emerald-200"
                      >
                        <Check className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                        <span>{b}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* How to Apply */}
                <div>
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                    {t('howToApply', 'How to Apply')}
                  </h4>
                  <div className="space-y-2">
                    {selectedSchemeForDetail.applicationProcess.map((step, idx) => (
                      <div
                        key={idx}
                        className="flex items-start gap-3 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300"
                      >
                        <span className="w-5 h-5 rounded-full bg-teal-600 text-white flex items-center justify-center text-[10px] font-bold flex-shrink-0 mt-0.5">
                          {idx + 1}
                        </span>
                        <span>{step}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Official Helpline */}
                <div className="flex items-center justify-between p-3.5 rounded-2xl bg-teal-50/60 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-800 text-xs text-teal-800 dark:text-teal-200">
                  <span className="flex items-center gap-2 font-bold">
                    <Phone className="w-4 h-4 text-teal-600" />
                    {t('officialHelpline', 'Official Helpline')}: {selectedSchemeForDetail.helpline}
                  </span>
                  <span className="text-[11px] text-teal-600 dark:text-teal-400 font-semibold">{t('tollFree', 'Toll-Free')}</span>
                </div>
              </div>

              {/* Modal Footer Actions */}
              <div className="mt-8 pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => {
                    const scheme = selectedSchemeForDetail
                    setSelectedSchemeForDetail(null)
                    openEligibilityForScheme(scheme)
                  }}
                  className="w-full sm:w-auto px-5 py-2.5 rounded-xl border border-teal-200 dark:border-teal-800 text-xs font-bold text-teal-700 dark:text-teal-300 hover:bg-teal-50 dark:hover:bg-teal-950/40 transition text-center"
                >
                  {t('checkEligibility', 'Check Eligibility')}
                </button>

                <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
                  <button
                    type="button"
                    onClick={() => setSelectedSchemeForDetail(null)}
                    className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 transition"
                  >
                    {t('close', 'Close')}
                  </button>
                  <a
                    href={selectedSchemeForDetail.officialUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold shadow-md shadow-teal-500/20 transition transform active:scale-95"
                  >
                    {t('applyNow', 'Apply Now ↗')}
                  </a>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  )
}