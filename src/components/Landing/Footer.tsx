import { useNavigate } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
import { useLanguage } from '../../contexts/LanguageContext';

export default function Footer() {
  const navigate = useNavigate();
  const currentYear = new Date().getFullYear();
  const prefersReducedMotion = useReducedMotion();
  const { t } = useLanguage();

  const anim = (delay = 0) =>
    prefersReducedMotion
      ? { duration: 0 }
      : { duration: 0.6, ease: [0.16, 1, 0.3, 1] as const, delay };

  return (
    <footer className="w-full bg-[rgb(10,10,10)] overflow-hidden border-t border-white/[0.06]">
      <div className="px-6 md:px-16 pt-20 md:pt-28 pb-0">
        <div className="max-w-[1400px] mx-auto">

          {/* Top row */}
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-10 md:gap-8 mb-14 md:mb-24">

            {/* Left — large editorial tagline + CTA */}
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={anim(0)}
              className="max-w-lg"
            >
              <p
                className="site-display-font text-white leading-[1.1] mb-10"
                style={{ fontSize: 'clamp(2rem, 4vw, 3.5rem)', fontWeight: 400 }}
              >
                AI harness for<br />
                growing businesses.
              </p>
              <button
                onClick={() => navigate('/contact')}
                style={{ fontWeight: 600, fontSize: '0.95rem' }}
                className="inline-flex items-center gap-2.5 bg-white text-black px-7 py-3.5 rounded-full hover:bg-neutral-100 active:scale-[0.97] transition-all"
              >
                <span style={{ fontSize: '1.1rem', lineHeight: 1 }}>+</span> Get in touch
              </button>
            </motion.div>

            {/* Right — nav columns */}
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={anim(0.1)}
              className="flex gap-12 md:gap-28"
            >
              <div>
                <p className="text-neutral-500 text-[0.6rem] tracking-[0.22em] uppercase font-semibold mb-6">
                  Explore
                </p>
                <ul className="space-y-3.5">
                  {[
                    { label: t('nav.solutions'), path: '/solutions' },
                    { label: t('footer.docs'),    path: '/docs' },
                    { label: t('footer.aboutUs'), path: '/about' },
                  ].map(({ label, path }) => (
                    <li key={path}>
                      <button
                        onClick={() => navigate(path)}
                        className="text-white/90 text-[0.95rem] hover:text-white transition-colors font-normal"
                      >
                        {label}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <p className="text-neutral-500 text-[0.6rem] tracking-[0.22em] uppercase font-semibold mb-6">
                  Socials
                </p>
                <ul className="space-y-3.5">
                  <li>
                    <a
                      href="https://www.linkedin.com/company/clerktree"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-white/90 text-[0.95rem] hover:text-white transition-colors"
                    >
                      LinkedIn
                    </a>
                  </li>
                  <li>
                    <a
                      href="https://x.com/teamclerktree"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-white/90 text-[0.95rem] hover:text-white transition-colors"
                    >
                      The X
                    </a>
                  </li>
                  <li>
                    <a
                      href="mailto:team@clerktree.com"
                      className="text-white/90 text-[0.95rem] hover:text-white transition-colors"
                    >
                      Email
                    </a>
                  </li>
                </ul>
              </div>
            </motion.div>
          </div>

          {/* Bottom bar */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={anim(0.15)}
            className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 pb-6"
          >
            <div className="flex items-center gap-3">
              <p className="text-neutral-500 text-[0.65rem] tracking-[0.15em] uppercase leading-relaxed">
                {currentYear} ClerkTree Inc.,<br />
                All rights reserved
              </p>
              <img
                src="/gdpr-compliant.webp"
                alt="GDPR Compliant"
                className="h-7 w-7 opacity-60"
                loading="lazy"
              />
            </div>

            <div className="flex items-center gap-6">
              {[
                { label: 'Terms',          path: '/terms-of-service' },
                { label: 'Privacy Policy', path: '/privacy-policy' },
                { label: 'Cookie Policy',  path: '/cookie-policy' },
              ].map(({ label, path }) => (
                <button
                  key={path}
                  onClick={() => navigate(path)}
                  className="text-neutral-500 text-[0.65rem] tracking-[0.15em] uppercase hover:text-white transition-colors"
                >
                  {label}
                </button>
              ))}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Giant wordmark — oversized so it naturally bleeds to both edges */}
      <div
        style={{ overflow: 'hidden', lineHeight: 0, marginTop: '20px' }}
        aria-hidden="true"
      >
        <span
          className="site-display-font"
          style={{
            display: 'block',
            textAlign: 'center',
            whiteSpace: 'nowrap',
            fontWeight: 400,
            letterSpacing: '0',
            /* ~112vw natural width — clips at both edges for true edge-to-edge */
            fontSize: '20.5vw',
            lineHeight: 0.82,
            paddingBottom: '0.04em',
            backgroundImage:
              'linear-gradient(to bottom, #FF8A5B 0%, #D04820 38%, #7A2000 70%, rgba(10,10,10,0) 100%)',
            WebkitBackgroundClip: 'text',
            backgroundClip: 'text',
            color: 'transparent',
          }}
        >
          CLERKTREE
        </span>
      </div>
    </footer>
  );
}
