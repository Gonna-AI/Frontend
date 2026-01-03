import { useNavigate } from 'react-router-dom';
import { useMemo } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { Shield, Lock, Phone } from 'lucide-react';
import { useDeviceDetection } from '../../hooks/useDeviceDetection';
import { useLanguage } from '../../contexts/LanguageContext';

export default function Footer() {
  const navigate = useNavigate();
  const currentYear = new Date().getFullYear();
  const prefersReducedMotion = useReducedMotion();
  const { isMobile } = useDeviceDetection();
  const { t } = useLanguage();

  const shouldReduceMotion = prefersReducedMotion || isMobile;

  const footerLinks = useMemo(() => ({
    product: [
      { name: t('nav.solutions'), path: '/solutions' },
      { name: t('footer.docs'), path: '/docs' },
    ],
    company: [
      { name: t('footer.aboutUs'), path: '/about' },
      { name: t('footer.careers'), path: '/careers' },
      { name: t('nav.contact'), path: '/contact' },
    ],
    legal: [
      { name: t('footer.privacy'), path: '/privacy-policy', icon: Lock },
      { name: t('footer.terms'), path: '/terms-of-service', icon: Shield },
      { name: t('footer.cookiePolicy'), path: '/cookie-policy', icon: Shield },
    ],
  }), [t]);

  const handleNavigation = (path: string) => {
    if (path.startsWith('/#')) {
      const elementId = path.substring(2);
      navigate('/');
      setTimeout(() => {
        const element = document.getElementById(elementId);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
    } else {
      navigate(path);
    }
  };

  return (
    <footer className="w-full border-t border-neutral-800/50 relative overflow-hidden bg-[rgb(10,10,10)]">
      {/* Background Logo */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 md:left-0 md:translate-x-[-10%] w-[30rem] md:w-[50rem] h-[30rem] md:h-[50rem] opacity-[0.03] pointer-events-none select-none z-0">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 464 468"
          className="w-full h-full"
          aria-hidden="true"
        >
          <path
            fill="white"
            d="M275.9 63.5c37.7 5.3 76.6 24.1 103.7 50.2 30 28.8 41.8 57.6 35.8 87.1-6.1 30.1-33.6 52.9-70.6 58.3-6 0.9-18.3 1-44.9 0.6l-36.6-0.7-0.5 17.8c-0.3 9.7-0.4 17.8-0.4 17.9 0.1 0.1 19.1 0.3 42.2 0.4 23.2 0 42.7 0.5 43.5 1 1.2 0.7 1.1 2.2-0.8 9.4-6 23-20.5 42.1-41.8 55-7.3 4.3-26.7 11.9-36 14.1-9 2-34 2-44.5 0-41.3-7.9-74.2-38-82.9-75.7-8.1-35.7 2.2-71.5 27.5-94.7 16.1-14.9 35.5-22.4 63.7-24.7l7.7-0.7v-34.1l-11.7 0.7c-22.2 1.3-37 5.3-56.4 15.2-28.7 14.6-49.7 39.3-59.9 70.2-9.6 29.3-9.3 62.6 0.8 91.4 3.3 9.2 12.2 25.6 18.3 33.8 11.3 14.9 30.6 30.8 48.7 39.9 19.9 10 49.2 15.9 73.2 14.7 26.5-1.3 52.5-9.6 74.2-23.9 26.9-17.6 47.2-47.9 53.3-79.7 1-5.2 2.3-10.1 2.8-10.8 0.8-0.9 6.9-1.2 27.1-1l26.1 0.3 0.3 3.8c1.2 14.6-10.9 52.1-23.9 74-17.8 30-43.2 54-75.9 71.5-20.9 11.2-38.3 16.5-67.2 20.7-27.6 3.9-47.9 3.1-75.8-3.1-36.9-8.3-67.8-25.6-97.1-54.6-23.6-23.2-44.8-61.9-51.7-93.8-5.1-23.7-5.5-28.1-4.9-48.8 1.7-63.2 23.4-111.8 67.7-152 28-25.4 60.4-41.3 99-48.8 18.5-3.6 46.1-4 67.9-0.9zm16.4 92.6c-6.3 2.4-12.8 8.5-15.4 14.5-2.6 6.1-2.6 18.3 0 23.9 5 11 20.2 17.7 32.3 14.1 11.9-3.4 19.8-14.3 19.8-27.1-0.1-19.9-18.2-32.5-36.7-25.4z"
          />
        </svg>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 py-32">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-16">
          {/* Product Links */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={shouldReduceMotion ? { duration: 0 } : { duration: 0.4, delay: 0.05 }}
          >
            <h4 className="text-white text-sm font-semibold mb-6 tracking-wide uppercase">{t('footer.product')}</h4>
            <ul className="space-y-4">
              {footerLinks.product.map((link) => (
                <li key={link.path}>
                  <button
                    onClick={() => handleNavigation(link.path)}
                    className="text-neutral-400 hover:text-white transition-colors text-sm font-medium"
                  >
                    {link.name}
                  </button>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Company Links */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={shouldReduceMotion ? { duration: 0 } : { duration: 0.4, delay: 0.1 }}
          >
            <h4 className="text-white text-sm font-semibold mb-6 tracking-wide uppercase">{t('footer.company')}</h4>
            <ul className="space-y-4">
              {footerLinks.company.map((link) => (
                <li key={link.path}>
                  <button
                    onClick={() => navigate(link.path)}
                    className="text-neutral-400 hover:text-white transition-colors text-sm font-medium"
                  >
                    {link.name}
                  </button>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Contact & Social */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={shouldReduceMotion ? { duration: 0 } : { duration: 0.4, delay: 0.15 }}
          >
            <h4 className="text-white text-sm font-semibold mb-6 tracking-wide uppercase">{t('footer.contact')}</h4>
            <div className="space-y-4">
              <a
                href="mailto:team@clerktree.com"
                className="flex items-center gap-2 text-neutral-400 hover:text-white transition-colors text-sm font-medium group"
                aria-label="Email"
              >
                <svg className="w-4 h-4 group-hover:scale-110 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <span>team@clerktree.com</span>
              </a>
              <a
                href="tel:+4917683075116"
                className="flex items-center gap-2 text-neutral-400 hover:text-white transition-colors text-sm font-medium group"
                aria-label="Phone"
              >
                <Phone className="w-4 h-4 group-hover:scale-110 transition-transform" />
                <span>{t('footer.phone')}</span>
              </a>
              <a
                href="https://www.linkedin.com/company/clerktree"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-neutral-400 hover:text-white transition-colors text-sm font-medium group"
                aria-label="LinkedIn"
              >
                <svg className="w-4 h-4 group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                </svg>
                <span>{t('footer.linkedin')}</span>
              </a>
              <a
                href="https://x.com/teamclerktree"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-neutral-400 hover:text-white transition-colors text-sm font-medium group"
                aria-label="X (Twitter)"
              >
                <svg className="w-4 h-4 group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z" />
                </svg>
                <span>X</span>
              </a>
            </div>
          </motion.div>

          {/* Legal Column (moved from bottom for balance, or keep layout grid balanced)
               Actually, I'll add a 'Legal' column to match the 4-column layout of the reference.
           */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={shouldReduceMotion ? { duration: 0 } : { duration: 0.4, delay: 0.2 }}
          >
            <h4 className="text-white text-sm font-semibold mb-6 tracking-wide uppercase">{t('footer.legal')}</h4>
            <ul className="space-y-4">
              {footerLinks.legal.map((link) => (
                <li key={link.path}>
                  <button
                    onClick={() => navigate(link.path)}
                    className="text-neutral-400 hover:text-white transition-colors text-sm font-medium"
                  >
                    {link.name}
                  </button>
                </li>
              ))}
            </ul>
          </motion.div>

        </div>

        {/* Bottom Bar */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={shouldReduceMotion ? { duration: 0 } : { duration: 0.4, delay: 0.2 }}
          className="pt-8 flex flex-col md:flex-row justify-between items-center gap-4"
        >
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-yellow-400/10 flex items-center justify-center">
              <img src="/favicon.svg" alt="Logo" className="w-5 h-5 opacity-80" />
            </div>
            <p className="text-neutral-500 text-xs">
              © {currentYear} ClerkTree Inc.
            </p>
          </div>

          <div className="flex items-center gap-6">
            <span className="text-neutral-600 text-xs">Latest version: <span className="bg-neutral-800 px-1.5 py-0.5 rounded text-neutral-400">2.0.0</span></span>
          </div>
        </motion.div>
      </div>
    </footer>
  );
}

