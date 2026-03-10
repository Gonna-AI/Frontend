import React, { useState } from 'react';
import { Phone, MapPin, CheckCircle2, Send, Mail } from 'lucide-react';

import { useLanguage } from '../contexts/LanguageContext';
import SharedHeader from '../components/Layout/SharedHeader';
import Footer from '../components/Landing/Footer';
import SEO from '../components/SEO';

const Contact = () => {

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
      {/* Orange/warm theme background accents matching main landing page */}
      <div className="fixed inset-0 bg-[rgb(10,10,10)] -z-10">
        {/* Core warm light source top-right */}
        <div
          className="absolute top-[-10%] right-[-10%] w-[80%] h-[100%] pointer-events-none"
          style={{
            background: 'radial-gradient(circle at 70% 30%, rgba(255,255,255,0.18) 0%, rgba(255,255,255,0.06) 30%, transparent 60%)',
            filter: 'blur(40px)',
          }}
        />
        {/* Diagonal ray wash */}
        <div
          className="absolute top-0 right-0 w-full h-full pointer-events-none"
          style={{
            background: 'linear-gradient(215deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.015) 40%, transparent 65%)',
          }}
        />
        {/* Subtle orange ambient glow */}
        <div
          className="absolute bottom-0 left-0 translate-y-1/4 -translate-x-1/4 w-72 md:w-[600px] h-72 md:h-[600px] opacity-20"
          style={{
            background: 'radial-gradient(circle, rgba(255,138,91,0.4) 0%, rgba(255,138,91,0.15) 40%, transparent 100%)',
            filter: 'blur(80px)',
          }}
        />
        {/* Grainy noise overlay */}
        <div
          className="absolute inset-0 opacity-[0.035] pointer-events-none"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
            backgroundSize: '128px 128px',
          }}
        />
      </div>

      {/* Glassy Header with Logo */}
      <SharedHeader />

      <div className="relative z-10 py-12 px-6 pt-32 md:pt-36">
        <div className="max-w-5xl mx-auto">

          {/* Header */}
          <div className="text-center mb-16">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#FF8A5B] sm:text-sm mb-6">
              {t('contact.title1')}
            </p>
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6">
              <span className="bg-gradient-to-r from-white via-white/95 to-white/90 text-transparent bg-clip-text">
                {t('contact.title2')}
              </span>
            </h1>
            <p className="text-lg md:text-xl text-white/60 leading-relaxed max-w-3xl mx-auto">
              {t('contact.subtitle')}
            </p>
          </div>

          {/* Contact Info Cards */}
          <div className="grid md:grid-cols-3 gap-6 mb-16 max-w-5xl mx-auto">
            <div className="group rounded-3xl border border-white/10 bg-white/[0.02] backdrop-blur-xl p-6 hover:border-[#FF8A5B]/30 hover:bg-white/[0.04] transition-all duration-300 text-center">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#FF8A5B]/10 to-orange-500/10 border border-[#FF8A5B]/20 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                <Phone className="w-6 h-6 text-[#FF8A5B]" />
              </div>
              <h3 className="font-semibold mb-2 text-white/90 text-lg">{t('contact.phone')}</h3>
              <a href="tel:+4917683075116" className="text-white/60 hover:text-[#FF8A5B] transition-colors text-sm block">
                +49 176 83075116
              </a>
            </div>
            <div className="group rounded-3xl border border-white/10 bg-white/[0.02] backdrop-blur-xl p-6 hover:border-[#FF8A5B]/30 hover:bg-white/[0.04] transition-all duration-300 text-center">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#FF8A5B]/10 to-orange-500/10 border border-[#FF8A5B]/20 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                <MapPin className="w-6 h-6 text-[#FF8A5B]" />
              </div>
              <h3 className="font-semibold mb-2 text-white/90 text-lg">{t('contact.location')}</h3>
              <p className="text-white/60 text-sm">
                Industriestraße 2<br />94315 Straubing, Germany
              </p>
            </div>
            <div className="group rounded-3xl border border-white/10 bg-white/[0.02] backdrop-blur-xl p-6 hover:border-[#FF8A5B]/30 hover:bg-white/[0.04] transition-all duration-300 text-center">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#FF8A5B]/10 to-orange-500/10 border border-[#FF8A5B]/20 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                <Mail className="w-6 h-6 text-[#FF8A5B]" />
              </div>
              <h3 className="font-semibold mb-2 text-white/90 text-lg">{t('contact.email')}</h3>
              <a href="mailto:team@clerktree.com" className="text-white/60 hover:text-[#FF8A5B] transition-colors text-sm block">
                team@clerktree.com
              </a>
            </div>
          </div>

          {/* Contact Form */}
          <div className="max-w-3xl mx-auto rounded-3xl border border-white/10 bg-white/[0.02] backdrop-blur-xl p-8 md:p-12 shadow-2xl shadow-black/50 relative overflow-hidden">
            {/* Decorative gradient glow */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-1 bg-gradient-to-r from-transparent via-[#FF8A5B]/50 to-transparent" />

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
                <div className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-emerald-500/20">
                  <CheckCircle2 className="w-10 h-10 text-emerald-500" />
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
                      {t('contact.fullName')} <span className="text-[#FF8A5B]">*</span>
                    </label>
                    <input
                      type="text"
                      id="fullName"
                      name="fullName"
                      required
                      value={formData.fullName}
                      onChange={handleChange}
                      className="w-full px-5 py-3.5 rounded-xl bg-white/[0.03] border border-white/10 text-white placeholder-white/20 focus:outline-none focus:border-[#FF8A5B]/50 focus:bg-white/[0.05] focus:ring-4 focus:ring-[#FF8A5B]/10 transition-all duration-300"
                      placeholder="John Doe"
                    />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="companyName" className="text-sm font-medium text-white/70 ml-1">
                      {t('contact.companyName')} <span className="text-[#FF8A5B]">*</span>
                    </label>
                    <input
                      type="text"
                      id="companyName"
                      name="companyName"
                      required
                      value={formData.companyName}
                      onChange={handleChange}
                      className="w-full px-5 py-3.5 rounded-xl bg-white/[0.03] border border-white/10 text-white placeholder-white/20 focus:outline-none focus:border-[#FF8A5B]/50 focus:bg-white/[0.05] focus:ring-4 focus:ring-[#FF8A5B]/10 transition-all duration-300"
                      placeholder="Your Company"
                    />
                  </div>
                </div>

                {/* Email and Phone */}
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label htmlFor="email" className="text-sm font-medium text-white/70 ml-1">
                      {t('contact.email')} <span className="text-[#FF8A5B]">*</span>
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      required
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full px-5 py-3.5 rounded-xl bg-white/[0.03] border border-white/10 text-white placeholder-white/20 focus:outline-none focus:border-[#FF8A5B]/50 focus:bg-white/[0.05] focus:ring-4 focus:ring-[#FF8A5B]/10 transition-all duration-300"
                      placeholder="you@company.com"
                    />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="phone" className="text-sm font-medium text-white/70 ml-1">
                      {t('contact.phoneNumber')} <span className="text-[#FF8A5B]">*</span>
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      required
                      value={formData.phone}
                      onChange={handleChange}
                      className="w-full px-5 py-3.5 rounded-xl bg-white/[0.03] border border-white/10 text-white placeholder-white/20 focus:outline-none focus:border-[#FF8A5B]/50 focus:bg-white/[0.05] focus:ring-4 focus:ring-[#FF8A5B]/10 transition-all duration-300"
                      placeholder="+1 (555) 000-0000"
                    />
                  </div>
                </div>

                {/* Interest and Employee Count */}
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label htmlFor="interest" className="text-sm font-medium text-white/70 ml-1">
                      {t('contact.interest')} <span className="text-[#FF8A5B]">*</span>
                    </label>
                    <div className="relative">
                      <select
                        id="interest"
                        name="interest"
                        required
                        value={formData.interest}
                        onChange={handleChange}
                        className="w-full px-5 py-3.5 rounded-xl bg-white/[0.03] border border-white/10 text-white focus:outline-none focus:border-[#FF8A5B]/50 focus:bg-white/[0.05] focus:ring-4 focus:ring-[#FF8A5B]/10 transition-all duration-300 appearance-none"
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
                      {t('contact.employees')} <span className="text-[#FF8A5B]">*</span>
                    </label>
                    <div className="relative">
                      <select
                        id="employeeCount"
                        name="employeeCount"
                        required
                        value={formData.employeeCount}
                        onChange={handleChange}
                        className="w-full px-5 py-3.5 rounded-xl bg-white/[0.03] border border-white/10 text-white focus:outline-none focus:border-[#FF8A5B]/50 focus:bg-white/[0.05] focus:ring-4 focus:ring-[#FF8A5B]/10 transition-all duration-300 appearance-none"
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
                <div className="space-y-2">
                  <label htmlFor="message" className="text-sm font-medium text-white/70 ml-1">
                    {t('contact.message')} <span className="text-[#FF8A5B]">*</span>
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
                    <div className="absolute inset-0 rounded-xl border border-[#FF8A5B]/50 opacity-0 peer-focus:opacity-100 transition-opacity duration-300 pointer-events-none shadow-[0_0_20px_rgba(255,138,91,0.15)]" />
                  </div>
                </div>

                {submitStatus === 'error' && (
                  <div className="p-4 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 text-center text-sm animate-in fade-in slide-in-from-top-2">
                    {t('contact.error')}
                  </div>
                )}

                {/* Submit Button */}
                <div className="pt-4">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="group relative w-full overflow-hidden rounded-xl bg-[#E5E5E5] p-[1px] focus:outline-none focus:ring-4 focus:ring-[#FF8A5B]/20 disabled:opacity-50 disabled:cursor-not-allowed shadow-xl transition-all duration-300 hover:shadow-[#FF8A5B]/20 hover:scale-[1.01] active:scale-[0.99]"
                  >
                    <div className="relative h-full w-full rounded-xl bg-[#E5E5E5] hover:bg-white px-8 py-4 transition-all duration-300">
                      <div className="relative flex items-center justify-center gap-3 text-black font-bold text-lg">
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
