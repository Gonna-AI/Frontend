import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Shield, Lock, ShieldCheck, Mail, Phone, MapPin } from 'lucide-react';

export default function Footer() {
  const navigate = useNavigate();
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    product: [
      { name: 'Features', path: '/#features' },
      { name: 'Solutions', path: '/solutions' },
      { name: 'Smart Contracts', path: '/smart-contracts' },
      { name: 'Documents', path: '/documents' },
    ],
    company: [
      { name: 'About Us', path: '/about' },
      { name: 'Careers', path: '/careers' },
      { name: 'Contact', path: '/contact' },
      { name: 'FAQ', path: '/faq' },
    ],
    legal: [
      { name: 'Privacy Policy', path: '/privacy-policy', icon: Lock },
      { name: 'Terms of Service', path: '/terms-of-service', icon: Shield },
      { name: 'Security & Data Handling', path: '/security', icon: ShieldCheck },
    ],
    contact: [
      { icon: Mail, text: 'contact@clerktree.com', href: 'mailto:contact@clerktree.com' },
      { icon: Phone, text: '+49 160 96893540', href: 'tel:+4916096893540' },
      { icon: MapPin, text: 'Straubing, Germany', href: null },
    ],
  };

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
    <footer className="w-full border-t border-neutral-800/50 relative overflow-hidden">

      <div className="relative z-10 max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          {/* Company Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h3 className="text-xl font-bold mb-4">
              <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                ClerkTree
              </span>
            </h3>
            <p className="text-neutral-400 text-sm leading-relaxed mb-4">
              AI-powered workflow automation for claims and back-office operations. Transform your operations with intelligent automation.
            </p>
            <div className="flex items-center gap-4">
              <a 
                href="https://www.linkedin.com/company/clerktree" 
                target="_blank"
                rel="noopener noreferrer"
                className="text-neutral-400 hover:text-purple-400 transition-colors"
                aria-label="LinkedIn"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                </svg>
              </a>
            </div>
          </motion.div>

          {/* Product Links */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <h4 className="text-neutral-200 font-semibold mb-4">Product</h4>
            <ul className="space-y-3">
              {footerLinks.product.map((link) => (
                <li key={link.path}>
                  <button
                    onClick={() => handleNavigation(link.path)}
                    className="text-neutral-400 hover:text-purple-400 transition-colors text-sm"
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
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <h4 className="text-neutral-200 font-semibold mb-4">Company</h4>
            <ul className="space-y-3">
              {footerLinks.company.map((link) => (
                <li key={link.path}>
                  <button
                    onClick={() => navigate(link.path)}
                    className="text-neutral-400 hover:text-purple-400 transition-colors text-sm"
                  >
                    {link.name}
                  </button>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Legal & Contact */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <h4 className="text-neutral-200 font-semibold mb-4">Legal & Contact</h4>
            <ul className="space-y-3 mb-6">
              {footerLinks.legal.map((link) => {
                const Icon = link.icon;
                return (
                  <li key={link.path}>
                    <button
                      onClick={() => navigate(link.path)}
                      className="flex items-center gap-2 text-neutral-400 hover:text-purple-400 transition-colors text-sm group"
                    >
                      <Icon className="w-4 h-4 group-hover:scale-110 transition-transform" />
                      <span>{link.name}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
            <div className="space-y-3">
              {footerLinks.contact.map((contact, index) => {
                const Icon = contact.icon;
                return (
                  <div key={index}>
                    {contact.href ? (
                      <a
                        href={contact.href}
                        className="flex items-center gap-2 text-neutral-400 hover:text-purple-400 transition-colors text-sm"
                      >
                        <Icon className="w-4 h-4" />
                        <span>{contact.text}</span>
                      </a>
                    ) : (
                      <div className="flex items-center gap-2 text-neutral-400 text-sm">
                        <Icon className="w-4 h-4" />
                        <span>{contact.text}</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </motion.div>
        </div>

        {/* Bottom Bar */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="pt-8 border-t border-neutral-800"
        >
          <div className="flex flex-col md:flex-row justify-center items-center">
            <p className="text-neutral-500 text-sm">
              © {currentYear} ClerkTree. All rights reserved.
            </p>
          </div>
        </motion.div>
      </div>
    </footer>
  );
}

