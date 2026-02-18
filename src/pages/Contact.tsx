import React, { useState } from 'react';
import { Phone, MapPin, CheckCircle2, Send, Mail } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import LanguageSwitcher from '../components/Layout/LanguageSwitcher';
import Footer from '../components/Landing/Footer';
import SEO from '../components/SEO/SEO';

const Contact = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [formData, setFormData] = useState({
    fullName: '',
    companyName: '',
    email: '',
    phone: '',
    interest: '',
    employeeCount: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/api-contacts`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        }
      );

      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Submission failed');

      setSubmitStatus('success');
      setFormData({
        fullName: '',
        companyName: '',
        email: '',
        phone: '',
        interest: '',
        employeeCount: '',
        message: ''
      });
    } catch (error) {
      console.error("Submission error:", error);
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
      setTimeout(() => setSubmitStatus('idle'), 5000);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  return (
    <div className="bg-[rgb(10,10,10)] min-h-screen relative overflow-x-hidden">
      <SEO
        title="Contact Us"
        description="Get in touch with ClerkTree. Speak with our team about automating your legal and claims operations."
        canonical="https://clerktree.com/contact"
      />
      {/* Red theme background accents */}
      <div className="fixed inset-0 bg-[rgb(10,10,10)] -z-10">
        <div
          className="absolute top-0 right-0 -translate-y-1/4 translate-x-1/4 w-96 md:w-[800px] h-96 md:h-[800px] opacity-40"
          style={{
            background: 'radial-gradient(circle, rgba(239,68,68,0.6) 0%, rgba(239,68,68,0.25) 40%, transparent 100%)',
            filter: 'blur(80px)',
          }}
        />
        <div
          className="absolute bottom-0 left-0 translate-y-1/4 -translate-x-1/4 w-72 md:w-[600px] h-72 md:h-[600px] opacity-30"
          style={{
            background: 'radial-gradient(circle, rgba(185,28,28,0.5) 0%, rgba(185,28,28,0.2) 40%, transparent 100%)',
            filter: 'blur(80px)',
          }}
        />
      </div>

      {/* Glassy Header with Logo */}
      <header className="fixed top-0 left-0 right-0 z-50 w-full py-3 px-4 sm:px-6 backdrop-blur-md bg-[rgb(10,10,10)]/80 border-b border-white/10">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <button
            type="button"
            onClick={() => navigate('/')}
            className="flex items-center gap-2 group"
            aria-label="Go to home"
          >
            <svg
              viewBox="0 0 464 468"
              className="w-9 h-9 md:w-11 md:h-11"
            >
              <path fill="white" d="M275.9 63.5c37.7 5.3 76.6 24.1 103.7 50.2 30 28.8 41.8 57.6 35.8 87.1-6.1 30.1-33.6 52.9-70.6 58.3-6 0.9-18.3 1-44.9 0.6l-36.6-0.7-0.5 17.8c-0.3 9.7-0.4 17.8-0.4 17.9 0.1 0.1 19.1 0.3 42.2 0.4 23.2 0 42.7 0.5 43.5 1 1.2 0.7 1.1 2.2-0.8 9.4-6 23-20.5 42.1-41.8 55-7.3 4.3-26.7 11.9-36 14.1-9 2-34 2-44.5 0-41.3-7.9-74.2-38-82.9-75.7-8.1-35.7 2.2-71.5 27.5-94.7 16.1-14.9 35.5-22.4 63.7-24.7l7.7-0.7v-34.1l-11.7 0.7c-22.2 1.3-37 5.3-56.4 15.2-28.7 14.6-49.7 39.3-59.9 70.2-9.6 29.3-9.3 62.6 0.8 91.4 3.3 9.2 12.2 25.6 18.3 33.8 11.3 14.9 30.6 30.8 48.7 39.9 19.9 10 49.2 15.9 73.2 14.7 26.5-1.3 52.5-9.6 74.2-23.9 26.9-17.6 47.2-47.9 53.3-79.7 1-5.2 2.3-10.1 2.8-10.8 0.8-0.9 6.9-1.2 27.1-1l26.1 0.3 0.3 3.8c1.2 14.6-10.9 52.1-23.9 74-17.8 30-43.2 54-75.9 71.5-20.9 11.2-38.3 16.5-67.2 20.7-27.6 3.9-47.9 3.1-75.8-3.1-36.9-8.3-67.8-25.6-97.1-54.6-23.6-23.2-44.8-61.9-51.7-93.8-5.1-23.7-5.5-28.1-4.9-48.8 1.7-63.2 23.4-111.8 67.7-152 28-25.4 60.4-41.3 99-48.8 18.5-3.6 46.1-4 67.9-0.9zm16.4 92.6c-6.3 2.4-12.8 8.5-15.4 14.5-2.6 6.1-2.6 18.3 0 23.9 5 11 20.2 17.7 32.3 14.1 11.9-3.4 19.8-14.3 19.8-27.1-0.1-19.9-18.2-32.5-36.7-25.4z" />
            </svg>
            <span className="text-xl md:text-2xl font-semibold text-white/90 group-hover:text-white transition-colors">
              ClerkTree
            </span>
          </button>
          {/* Mobile Pill */}
          <div className="md:hidden">
            <span className="px-3 py-1.5 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-medium whitespace-nowrap">
              {t('nav.contact')}
            </span>
          </div>
          <LanguageSwitcher isExpanded={true} forceDark={true} />
        </div>
      </header>

      <div className="relative z-10 py-12 px-6 pt-32 md:pt-36">
        <div className="max-w-5xl mx-auto">

          {/* Header */}
          <div className="text-center mb-16">
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6">
              <span className="bg-gradient-to-r from-white via-white/95 to-white/90 text-transparent bg-clip-text">
                {t('contact.title1')}
              </span>
              <br />
              <span className="bg-gradient-to-r from-red-400 via-rose-400 to-red-600 text-transparent bg-clip-text">
                {t('contact.title2')}
              </span>
            </h1>
            <p className="text-lg md:text-xl text-white/60 leading-relaxed max-w-3xl mx-auto">
              {t('contact.subtitle')}
            </p>
          </div>

          {/* Contact Info Cards */}
          <div className="grid md:grid-cols-3 gap-6 mb-16 max-w-5xl mx-auto">
            <div className="group rounded-3xl border border-white/10 bg-white/[0.02] backdrop-blur-xl p-6 hover:border-red-500/30 hover:bg-white/[0.04] transition-all duration-300 text-center">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-red-500/10 to-rose-500/10 border border-red-500/20 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                <Phone className="w-6 h-6 text-red-400" />
              </div>
              <h3 className="font-semibold mb-2 text-white/90 text-lg">{t('contact.phone')}</h3>
              <a href="tel:+4917683075116" className="text-white/60 hover:text-red-400 transition-colors text-sm block">
                +49 176 83075116
              </a>
            </div>
            <div className="group rounded-3xl border border-white/10 bg-white/[0.02] backdrop-blur-xl p-6 hover:border-red-500/30 hover:bg-white/[0.04] transition-all duration-300 text-center">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-red-500/10 to-rose-500/10 border border-red-500/20 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                <MapPin className="w-6 h-6 text-red-400" />
              </div>
              <h3 className="font-semibold mb-2 text-white/90 text-lg">{t('contact.location')}</h3>
              <p className="text-white/60 text-sm">
                Industriestraße 2<br />94315 Straubing, Germany
              </p>
            </div>
            <div className="group rounded-3xl border border-white/10 bg-white/[0.02] backdrop-blur-xl p-6 hover:border-red-500/30 hover:bg-white/[0.04] transition-all duration-300 text-center">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-red-500/10 to-rose-500/10 border border-red-500/20 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                <Mail className="w-6 h-6 text-red-400" />
              </div>
              <h3 className="font-semibold mb-2 text-white/90 text-lg">{t('contact.email')}</h3>
              <a href="mailto:team@clerktree.com" className="text-white/60 hover:text-red-400 transition-colors text-sm block">
                team@clerktree.com
              </a>
            </div>
          </div>

          {/* Contact Form */}
          <div className="max-w-3xl mx-auto rounded-3xl border border-white/10 bg-white/[0.02] backdrop-blur-xl p-8 md:p-12 shadow-2xl shadow-black/50 relative overflow-hidden">
            {/* Decorative gradient glow */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-1 bg-gradient-to-r from-transparent via-red-500/50 to-transparent" />

            <div className="text-center mb-10">
              <h2 className="text-3xl md:text-4xl font-bold mb-4 bg-gradient-to-r from-white via-white/90 to-white/70 text-transparent bg-clip-text">
                {t('contact.sendMsgTitle')}
              </h2>
              <p className="text-white/50 text-lg max-w-lg mx-auto">
                {t('contact.sendMsgDesc')}
              </p>
            </div>

            {submitStatus === 'success' ? (
              <div className="text-center py-16 animate-in fade-in zoom-in duration-500">
                <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-green-500/20">
                  <CheckCircle2 className="w-10 h-10 text-green-500" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-3">{t('contact.successTitle')}</h3>
                <p className="text-white/60">{t('contact.successDesc')}</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Full Name and Company Name */}
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label htmlFor="fullName" className="text-sm font-medium text-white/70 ml-1">
                      {t('contact.fullName')} <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="fullName"
                      name="fullName"
                      required
                      value={formData.fullName}
                      onChange={handleChange}
                      className="w-full px-5 py-3.5 rounded-xl bg-white/[0.03] border border-white/10 text-white placeholder-white/20 focus:outline-none focus:border-red-500/50 focus:bg-white/[0.05] focus:ring-4 focus:ring-red-500/10 transition-all duration-300"
                      placeholder="John Doe"
                    />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="companyName" className="text-sm font-medium text-white/70 ml-1">
                      {t('contact.companyName')} <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="companyName"
                      name="companyName"
                      required
                      value={formData.companyName}
                      onChange={handleChange}
                      className="w-full px-5 py-3.5 rounded-xl bg-white/[0.03] border border-white/10 text-white placeholder-white/20 focus:outline-none focus:border-red-500/50 focus:bg-white/[0.05] focus:ring-4 focus:ring-red-500/10 transition-all duration-300"
                      placeholder="Your Company"
                    />
                  </div>
                </div>

                {/* Email and Phone */}
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label htmlFor="email" className="text-sm font-medium text-white/70 ml-1">
                      {t('contact.email')} <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      required
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full px-5 py-3.5 rounded-xl bg-white/[0.03] border border-white/10 text-white placeholder-white/20 focus:outline-none focus:border-red-500/50 focus:bg-white/[0.05] focus:ring-4 focus:ring-red-500/10 transition-all duration-300"
                      placeholder="you@company.com"
                    />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="phone" className="text-sm font-medium text-white/70 ml-1">
                      {t('contact.phoneNumber')} <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      required
                      value={formData.phone}
                      onChange={handleChange}
                      className="w-full px-5 py-3.5 rounded-xl bg-white/[0.03] border border-white/10 text-white placeholder-white/20 focus:outline-none focus:border-red-500/50 focus:bg-white/[0.05] focus:ring-4 focus:ring-red-500/10 transition-all duration-300"
                      placeholder="+1 (555) 000-0000"
                    />
                  </div>
                </div>

                {/* Interest and Employee Count */}
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label htmlFor="interest" className="text-sm font-medium text-white/70 ml-1">
                      {t('contact.interest')} <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <select
                        id="interest"
                        name="interest"
                        required
                        value={formData.interest}
                        onChange={handleChange}
                        className="w-full px-5 py-3.5 rounded-xl bg-white/[0.03] border border-white/10 text-white focus:outline-none focus:border-red-500/50 focus:bg-white/[0.05] focus:ring-4 focus:ring-red-500/10 transition-all duration-300 appearance-none"
                      >
                        <option value="" className="bg-neutral-900">{t('contact.selectInterest')}</option>
                        <option value="enterprise" className="bg-neutral-900">{t('contact.intEnterprise')}</option>
                        <option value="bulk" className="bg-neutral-900">{t('contact.intBulk')}</option>
                        <option value="custom" className="bg-neutral-900">{t('contact.intCustom')}</option>
                        <option value="other" className="bg-neutral-900">{t('contact.intOther')}</option>
                      </select>
                      <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-white/30">
                        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M2.5 4.5L6 8L9.5 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="employeeCount" className="text-sm font-medium text-white/70 ml-1">
                      {t('contact.employees')} <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <select
                        id="employeeCount"
                        name="employeeCount"
                        required
                        value={formData.employeeCount}
                        onChange={handleChange}
                        className="w-full px-5 py-3.5 rounded-xl bg-white/[0.03] border border-white/10 text-white focus:outline-none focus:border-red-500/50 focus:bg-white/[0.05] focus:ring-4 focus:ring-red-500/10 transition-all duration-300 appearance-none"
                      >
                        <option value="" className="bg-neutral-900">{t('contact.selectRange')}</option>
                        <option value="1-10" className="bg-neutral-900">1-10</option>
                        <option value="11-50" className="bg-neutral-900">11-50</option>
                        <option value="51-200" className="bg-neutral-900">51-200</option>
                        <option value="201+" className="bg-neutral-900">201+</option>
                      </select>
                      <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-white/30">
                        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M2.5 4.5L6 8L9.5 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Message */}
                {/* Message */}
                <div className="space-y-2">
                  <label htmlFor="message" className="text-sm font-medium text-white/70 ml-1">
                    {t('contact.message')} <span className="text-red-500">*</span>
                  </label>
                  <div className="relative group">
                    <textarea
                      id="message"
                      name="message"
                      required
                      rows={5}
                      value={formData.message}
                      onChange={handleChange}
                      className="peer w-full px-5 py-4 rounded-xl bg-white/[0.03] border border-white/10 text-white placeholder-white/20 focus:outline-none focus:bg-white/[0.05] transition-all duration-300 resize-none text-base leading-relaxed"
                      placeholder={t('contact.messagePlaceholder')}
                    />
                    {/* Animated Border Gradient on Focus */}
                    <div className="absolute inset-0 rounded-xl border border-red-500/50 opacity-0 peer-focus:opacity-100 transition-opacity duration-300 pointer-events-none shadow-[0_0_20px_rgba(239,68,68,0.15)]" />
                  </div>
                </div>

                {submitStatus === 'error' && (
                  <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-center text-sm animate-in fade-in slide-in-from-top-2">
                    {t('contact.error')}
                  </div>
                )}

                {/* Submit Button */}
                <div className="pt-4">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="group relative w-full overflow-hidden rounded-xl bg-gradient-to-r from-red-600 to-red-500 p-[1px] focus:outline-none focus:ring-4 focus:ring-red-500/20 disabled:opacity-50 disabled:cursor-not-allowed shadow-xl shadow-red-600/10 transition-all duration-300 hover:shadow-red-500/30 hover:scale-[1.01] active:scale-[0.99]"
                  >
                    <div className="relative h-full w-full rounded-xl bg-gradient-to-r from-red-600 to-red-500 px-8 py-4 transition-all duration-300 group-hover:bg-opacity-0">
                      <div className="absolute inset-0 bg-gradient-to-r from-red-500 to-rose-500 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

                      <div className="relative flex items-center justify-center gap-3 text-white font-bold text-lg">
                        {isSubmitting ? (
                          <>
                            <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            <span>{t('contact.sending')}</span>
                          </>
                        ) : (
                          <>
                            <span className="tracking-wide">{t('contact.sendButton')}</span>
                            <Send className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-1" />
                          </>
                        )}
                      </div>
                    </div>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};


export default Contact;