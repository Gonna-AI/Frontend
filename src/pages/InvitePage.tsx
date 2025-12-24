import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, ChevronRight, AlertCircle } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

const InvitePage = () => {
  const [inviteCode, setInviteCode] = useState('');
  const [showError, setShowError] = useState(false);
  const navigate = useNavigate();
  const { t } = useLanguage();

  useEffect(() => {
    // Check if user has previously used a valid invite code
    const hasValidInvite = localStorage.getItem('hasValidInvite');
    if (hasValidInvite === 'true') {
      navigate('/auth');
    }
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await fetch('https://backend-sq0u.onrender.com/api/auth/validate-invite', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ code: inviteCode }),
      });

      const data = await response.json();

      if (response.ok && data.valid) {
        // Store the invite code in session storage for use during registration
        sessionStorage.setItem('inviteCode', inviteCode);
        // Store in localStorage that user has used a valid invite code
        localStorage.setItem('hasValidInvite', 'true');
        // Force navigation to auth page
        navigate('/auth');
      } else {
        setShowError(true);
        setInviteCode('');
        setTimeout(() => setShowError(false), 3000);
      }
    } catch (error) {
      console.error('Error validating invite code:', error);
      setShowError(true);
      setInviteCode('');
      setTimeout(() => setShowError(false), 3000);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 p-4 sm:p-6 md:p-8 relative overflow-hidden flex flex-col justify-center items-center">
      {/* Background Elements */}
      <div className="fixed inset-0">
        <div
          className="absolute inset-0 opacity-70"
          style={{
            backgroundImage: `
              radial-gradient(circle at 20% 35%, rgba(66, 153, 225, 0.15) 0%, transparent 50%),
              radial-gradient(circle at 75% 44%, rgba(49, 130, 206, 0.15) 0%, transparent 50%),
              radial-gradient(circle at 50% 80%, rgba(26, 32, 44, 0.4) 0%, transparent 50%)
            `,
          }}
        />
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: 'linear-gradient(to right, rgba(74, 85, 104, 0.2) 1px, transparent 1px), linear-gradient(to bottom, rgba(74, 85, 104, 0.2) 1px, transparent 1px)',
            backgroundSize: '40px 40px',
          }}
        />
      </div>

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="fixed top-0 left-0 right-0 flex justify-between items-center p-4 sm:p-6 md:p-8 z-10"
      >
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gray-800 rounded-xl backdrop-blur-sm">
            <svg viewBox="0 0 500 500" className="w-12 h-12 text-blue-400" fill="currentColor">
              <path d="M275.9 63.5c37.7 5.3 76.6 24.1 103.7 50.2 30 28.8 41.8 57.6 35.8 87.1-6.1 30.1-33.6 52.9-70.6 58.3-6 0.9-18.3 1-44.9 0.6l-36.6-0.7-0.5 17.8c-0.3 9.7-0.4 17.8-0.4 17.9 0.1 0.1 19.1 0.3 42.2 0.4 23.2 0 42.7 0.5 43.5 1 1.2 0.7 1.1 2.2-0.8 9.4-6 23-20.5 42.1-41.8 55-7.3 4.3-26.7 11.9-36 14.1-9 2-34 2-44.5 0-41.3-7.9-74.2-38-82.9-75.7-8.1-35.7 2.2-71.5 27.5-94.7 16.1-14.9 35.5-22.4 63.7-24.7l7.7-0.7v-34.1l-11.7 0.7c-22.2 1.3-37 5.3-56.4 15.2-28.7 14.6-49.7 39.3-59.9 70.2-9.6 29.3-9.3 62.6 0.8 91.4 3.3 9.2 12.2 25.6 18.3 33.8 11.3 14.9 30.6 30.8 48.7 39.9 19.9 10 49.2 15.9 73.2 14.7 26.5-1.3 52.5-9.6 74.2-23.9 26.9-17.6 47.2-47.9 53.3-79.7 1-5.2 2.3-10.1 2.8-10.8 0.8-0.9 6.9-1.2 27.1-1l26.1 0.3 0.3 3.8c1.2 14.6-10.9 52.1-23.9 74-17.8 30-43.2 54-75.9 71.5-20.9 11.2-38.3 16.5-67.2 20.7-27.6 3.9-47.9 3.1-75.8-3.1-36.9-8.3-67.8-25.6-97.1-54.6-23.6-23.2-44.8-61.9-51.7-93.8-5.1-23.7-5.5-28.1-4.9-48.8 1.7-63.2 23.4-111.8 67.7-152 28-25.4 60.4-41.3 99-48.8 18.5-3.6 46.1-4 67.9-0.9zm16.4 92.6c-6.3 2.4-12.8 8.5-15.4 14.5-2.6 6.1-2.6 18.3 0 23.9 5 11 20.2 17.7 32.3 14.1 11.9-3.4 19.8-14.3 19.8-27.1-0.1-19.9-18.2-32.5-36.7-25.4z" />
            </svg>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-xl font-semibold text-white">ClerkTree</span>
            <span className="text-sm font-medium text-blue-400">Enterprise</span>
          </div>
        </div>

        <nav className="hidden md:flex items-center gap-6 text-sm">
          <Link
            to="/contact"
            className="text-gray-300 hover:text-gray-100 transition-colors"
          >
            {t('invite.support')}
          </Link>
        </nav>
      </motion.div>

      {/* Support Popup */}


      {/* Main Form Section */}
      <div className="w-full max-w-md mx-auto">
        {/* Error Message Container - Fixed Height */}
        <div className="h-14 relative mb-4" style={{ zIndex: 20 }}>
          <AnimatePresence>
            {showError && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="absolute w-full"
              >
                <div
                  className="bg-gradient-to-r from-red-500/20 to-red-600/20 border border-red-500/30 
                    text-white px-6 py-3 rounded-lg backdrop-blur-md flex items-center gap-2 
                    shadow-[0_0_20px_rgba(239,68,68,0.2)] justify-center backdrop-blur-lg"
                  style={{
                    boxShadow: '0 0 20px 0 rgba(239,68,68,0.2), inset 0 0 0 1px rgba(239,68,68,0.1)'
                  }}
                >
                  <AlertCircle className="w-5 h-5 text-red-300" />
                  <span className="text-red-100 font-medium">{t('invite.error')}</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Form */}
        <motion.form
          onSubmit={handleSubmit}
          className="space-y-6 backdrop-blur-xl bg-gray-800/50 p-8 rounded-2xl border border-gray-700 shadow-2xl"
          style={{
            boxShadow: '0 0 40px 5px rgba(66, 153, 225, 0.1), 0 0 80px 10px rgba(49, 130, 206, 0.05)',
          }}
        >
          <div className="space-y-2 text-center">
            <h2 className="text-3xl font-bold text-white">
              {t('invite.title')}
            </h2>
            <p className="text-gray-400 text-sm">
              {t('invite.subtitle')}
            </p>
          </div>

          <div className="space-y-4">
            <div className="relative">
              <input
                type="text"
                value={inviteCode}
                onChange={(e) => setInviteCode(e.target.value)}
                placeholder={t('invite.placeholder')}
                className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg 
                  focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50 
                  transition-all duration-300 text-gray-100 placeholder:text-gray-500
                  backdrop-blur-sm pl-10"
                required
              />
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 w-5 h-5" />
            </div>
          </div>

          <motion.button
            whileHover={{ scale: 1.02, boxShadow: '0 0 20px 5px rgba(66, 153, 225, 0.2)' }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            className="w-full bg-gradient-to-r from-blue-600 to-blue-800 text-white py-3 px-4 rounded-lg 
              hover:from-blue-700 hover:to-blue-900 transition-all duration-300 font-medium
              backdrop-blur-sm shadow-lg flex items-center justify-center gap-2"
          >
            {t('invite.continue')}
            <ChevronRight className="w-5 h-5" />
          </motion.button>

          <div className="text-center">
            <a href="/contact" className="text-sm text-blue-400 hover:text-blue-300 transition-colors">
              {t('invite.requestAccess')}
            </a>
          </div>
        </motion.form>

        {/* Security Indicator */}
        <div className="mt-6 flex justify-center">
          <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-gray-800/70 border border-gray-700 backdrop-blur-sm">
            <div className="w-2 h-2 bg-green-400 rounded-full" />
            <span className="text-sm text-gray-300">{t('invite.secure')}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InvitePage;