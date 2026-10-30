// frontend/src/components/common/Footer.jsx
import { HeartPulse } from 'lucide-react'
import { FaGithub, FaTwitter, FaLinkedin, FaEnvelope } from 'react-icons/fa'

export default function Footer() {
  return (
    <footer className="border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <img src="/logo.png" alt="MediNest Logo" className="w-6 h-6 object-contain" />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              MediNest — Healthcare Bridge for Rural India
            </span>
          </div>
          <div className="flex items-center gap-6 text-sm text-gray-500 dark:text-gray-400">
            <a href="#" className="hover:text-blue-600 dark:hover:text-blue-400 transition">Privacy Policy</a>
            <a href="#" className="hover:text-blue-600 dark:hover:text-blue-400 transition">Terms of Service</a>
            <span>© 2026 MediNest</span>
          </div>
          <div className="flex items-center gap-4">
            <a href="#" className="text-gray-500 hover:text-blue-600 dark:hover:text-blue-400 transition">
              <FaGithub className="w-5 h-5" />
            </a>
            <a href="#" className="text-gray-500 hover:text-blue-600 dark:hover:text-blue-400 transition">
              <FaTwitter className="w-5 h-5" />
            </a>
            <a href="#" className="text-gray-500 hover:text-blue-600 dark:hover:text-blue-400 transition">
              <FaLinkedin className="w-5 h-5" />
            </a>
            <a href="#" className="text-gray-500 hover:text-blue-600 dark:hover:text-blue-400 transition">
              <FaEnvelope className="w-5 h-5" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}