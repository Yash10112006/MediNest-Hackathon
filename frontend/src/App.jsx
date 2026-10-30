// frontend/src/App.jsx

import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useLocation
} from 'react-router-dom'

import Healthcare from './components/healthcare/Healthcare'
import { AnimatePresence } from 'framer-motion'
import { useAuth } from './hooks/useAuth'
import PatientProfile from './pages/patient/PatientProfile'

// ================= AUTH =================

import Login from './components/auth/Login'
import Register from './components/auth/Register'
import RoleSelection from './components/auth/RoleSelection'
import RoleRoute from './components/common/RoleRoute'

// ================= DASHBOARDS =================

import PatientDashboard from './components/dashboard/PatientDashboard'
import DoctorDashboard from './components/dashboard/DoctorDashboard'
import ASHADashboard from './components/dashboard/ASHADashboard'
import HospitalAdminDashboard from './components/dashboard/HospitalAdminDashboard'

// ================= PATIENT =================

import PatientAppointments from './components/patients/PatientAppointments'
import PatientReferrals from './components/patients/PatientReferrals'
import PatientPrescriptions from './components/patients/PatientPrescriptions'
import MyHealthRecords from './components/patients/MyHealthRecords'

// ================= SHARED =================

import AITriage from './components/triage/AITriage'
import PatientRecords from './components/patients/PatientRecords'
import Analytics from './components/analytics/AnalyticsDashboard'
import Schemes from './components/schemes/Schemes'
import Profile from './components/profile/Profile'

// ================= COMMON =================

import Navbar from './components/common/Navbar'
import Footer from './components/common/Footer'


/*
|--------------------------------------------------------------------------
| Dashboard Redirector
|--------------------------------------------------------------------------
|
| /dashboard automatically sends the user to the
| correct portal based on their authenticated role.
|
*/

function DashboardRedirector() {

  const { user, role, loading } = useAuth()

  if (loading) {
    return null
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  const rawRole = (
    role ||
    user?.role ||
    user?.user_metadata?.role ||
    user?.user_metadata?.user_role ||
    'patient'
  )
    .toString()
    .toLowerCase()

  if (rawRole.includes('asha')) {
    return <Navigate to="/asha/dashboard" replace />
  }

  if (
    rawRole.includes('hospital') ||
    rawRole.includes('admin')
  ) {
    return <Navigate to="/hospital/dashboard" replace />
  }

  if (rawRole.includes('doctor')) {
    return <Navigate to="/doctor/dashboard" replace />
  }

  return <Navigate to="/patient/dashboard" replace />
}


/*
|--------------------------------------------------------------------------
| App
|--------------------------------------------------------------------------
*/

function App() {

  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  )
}


/*
|--------------------------------------------------------------------------
| App Content
|--------------------------------------------------------------------------
*/

function AppContent() {

  const location = useLocation()

  const isPublicPage = [
    '/',
    '/login',
    '/register'
  ].includes(location.pathname)

  return (

    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors">

      {/* ================= NAVBAR ================= */}

      {!isPublicPage && <Navbar />}


      {/* ================= MAIN CONTENT ================= */}

      <main>

        <AnimatePresence
          mode="wait"
        >

          <Routes
            location={location}
            key={location.pathname}
          >

            {/* ================================================= */}
            {/* PUBLIC ROUTES */}
            {/* ================================================= */}

            <Route
              path="/"
              element={<RoleSelection />}
            />

            <Route
              path="/login"
              element={<Login />}
            />

            <Route
              path="/patient/healthcare"
              element={<Healthcare />}
            />

            <Route
              path="/register"
              element={<Register />}
            />


            {/* ================================================= */}
            {/* GENERIC DASHBOARD */}
            {/* ================================================= */}

            <Route
              path="/dashboard"
              element={<DashboardRedirector />}
            />

            <Route
              element={
                <RoleRoute
                  allowedRoles={['patient', 'doctor', 'asha', 'hospital_admin']}
                />
              }
            >
              <Route
                path="/profile"
                element={<PatientProfile />}
              />
              <Route
                path="/patient/profile"
                element={<PatientProfile />}
              />
            </Route>


            {/* ================================================= */}
            {/* PATIENT PORTAL */}
            {/* ================================================= */}

            <Route
              element={
                <RoleRoute
                  allowedRoles={['patient']}
                />
              }
            >

              <Route
                path="/patient/dashboard"
                element={<PatientDashboard />}
              />

              <Route
                path="/patient/appointments"
                element={<PatientAppointments />}
              />

              <Route
                path="/patient/referrals"
                element={<PatientReferrals />}
              />

              <Route
                path="/patient/records"
                element={<MyHealthRecords />}
              />

              <Route
                path="/patient/health"
                element={<MyHealthRecords />}
              />

              <Route
                path="/patient/prescriptions"
                element={<PatientPrescriptions />}
              />



              <Route
                path="/patient/triage"
                element={<AITriage />}
              />

              <Route
                path="/patient/schemes"
                element={<Schemes />}
              />

            </Route>


            {/* ================================================= */}
            {/* ASHA PORTAL */}
            {/* ================================================= */}

            <Route
              element={
                <RoleRoute
                  allowedRoles={['asha']}
                />
              }
            >

              <Route
                path="/asha/dashboard"
                element={<ASHADashboard />}
              />

              <Route
                path="/asha/triage"
                element={<AITriage />}
              />

              <Route
                path="/asha/beneficiaries"
                element={<ASHADashboard />}
              />

              <Route
                path="/asha/voice"
                element={<ASHADashboard />}
              />

            </Route>


            {/* ================================================= */}
            {/* DOCTOR PORTAL */}
            {/* ================================================= */}

            <Route
              element={
                <RoleRoute
                  allowedRoles={['doctor']}
                />
              }
            >

              <Route
                path="/doctor/dashboard"
                element={<DoctorDashboard />}
              />

              <Route
                path="/doctor/consultation"
                element={<DoctorDashboard />}
              />

              <Route
                path="/doctor/patients"
                element={<PatientRecords />}
              />

            </Route>


            {/* ================================================= */}
            {/* HOSPITAL ADMIN */}
            {/* ================================================= */}

            <Route
              element={
                <RoleRoute
                  allowedRoles={['hospital_admin']}
                />
              }
            >

              <Route
                path="/hospital/dashboard"
                element={<HospitalAdminDashboard />}
              />

              <Route
                path="/hospital/analytics"
                element={<Analytics />}
              />

              <Route
                path="/hospital/queue"
                element={<HospitalAdminDashboard />}
              />

              <Route
                path="/hospital/inventory"
                element={<HospitalAdminDashboard />}
              />

            </Route>


            {/* ================================================= */}
            {/* FALLBACK */}
            {/* ================================================= */}

            <Route
              path="*"
              element={<Navigate to="/dashboard" replace />}
            />

          </Routes>

        </AnimatePresence>

      </main>


      {/* ================= FOOTER ================= */}

      {!isPublicPage && <Footer />}

    </div>
  )
}

export default App