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
      <div className="fixed inset-0 bg-[rgb(10,10,10)] z-0 pointer-events-none">
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
          className="absolute inset-0 opacity-[0.06]"
          style={{ backgroundImage: 'url(/noise.webp)', backgroundSize: '35%' }}
        />
        <div className="absolute inset-x-0 top-0 h-36 bg-gradient-to-b from-black/80 via-black/50 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/20 to-black" />
      </div>

      {/* Glassy Header with Logo */}
      <div className="relative z-20">
        <SharedHeader />
      </div>

      <div className="relative z-10 px-4 pb-20 pt-36 sm:px-6 md:pt-40 lg:px-8 lg:pt-44">
        <div className="mx-auto max-w-6xl">

          {/* Hero */}
          <div className="rounded-[1.75rem] border border-white/10 bg-[linear-gradient(145deg,#141414_0%,#0C0C0C_100%)] p-8 md:p-12 shadow-[0_30px_80px_rgba(0,0,0,0.45)]">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#FF8A5B] sm:text-sm">
              {t('contact.title1')}
            </p>
            <h1 className="mt-5 text-balance text-4xl md:text-[44px] font-semibold tracking-[-0.05em] text-white">
              {t('contact.title2')}
            </h1>
            <p className="mt-4 text-[16px] md:text-[18px] leading-relaxed text-white/60 max-w-3xl">
              {t('contact.subtitle')}
            </p>
            <div className="mt-6 flex flex-wrap items-center gap-3 text-xs text-white/50">
              <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5">Response within 24 hours</span>
              <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5">Enterprise onboarding</span>
              <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5">Solutions engineering support</span>
            </div>
          </div>

          <div className="mt-10 grid gap-8 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)]">
            {/* Contact Info */}
            <div className="space-y-6">
              <div className="rounded-2xl border border-white/10 bg-white/[0.04] backdrop-blur-sm p-6">
                <h3 className="text-xs font-semibold uppercase tracking-[0.25em] text-white/50">Contact Details</h3>
                <div className="mt-5 space-y-4">
                  <div className="flex items-start gap-4">
                    <div className="w-11 h-11 rounded-xl bg-[#FF8A5B]/10 border border-[#FF8A5B]/20 flex items-center justify-center">
                      <Phone className="w-5 h-5 text-[#FF8A5B]" />
                    </div>
                    <div>
                      <p className="text-sm text-white/50">{t('contact.phone')}</p>
                      <a href="tel:+4917683075116" className="text-white/80 hover:text-[#FF8A5B] transition-colors">
                        +49 176 83075116
                      </a>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="w-11 h-11 rounded-xl bg-[#FF8A5B]/10 border border-[#FF8A5B]/20 flex items-center justify-center">
                      <Mail className="w-5 h-5 text-[#FF8A5B]" />
                    </div>
                    <div>
                      <p className="text-sm text-white/50">{t('contact.email')}</p>
                      <a href="mailto:team@clerktree.com" className="text-white/80 hover:text-[#FF8A5B] transition-colors">
                        team@clerktree.com
                      </a>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="w-11 h-11 rounded-xl bg-[#FF8A5B]/10 border border-[#FF8A5B]/20 flex items-center justify-center">
                      <MapPin className="w-5 h-5 text-[#FF8A5B]" />
                    </div>
                    <div>
                      <p className="text-sm text-white/50">{t('contact.location')}</p>
                      <p className="text-white/80">
                        Industriestraße 2<br />94315 Straubing, Germany
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/[0.04] backdrop-blur-sm p-6">
                <h3 className="text-xs font-semibold uppercase tracking-[0.25em] text-white/50">What Helps Us Respond Faster</h3>
                <div className="mt-4 space-y-3 text-sm text-white/60">
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="w-4 h-4 text-[#FF8A5B] mt-0.5" />
                    <span>Share your use case, volume, and preferred timelines.</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="w-4 h-4 text-[#FF8A5B] mt-0.5" />
                    <span>Include systems you need to integrate with or replace.</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="w-4 h-4 text-[#FF8A5B] mt-0.5" />
                    <span>Tell us about your data sensitivities and compliance needs.</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <div className="rounded-[1.75rem] border border-white/10 bg-[linear-gradient(145deg,#141414_0%,#0C0C0C_100%)] p-8 md:p-12 shadow-[0_30px_80px_rgba(0,0,0,0.45)] relative overflow-hidden">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-1 bg-gradient-to-r from-transparent via-[#FF8A5B]/50 to-transparent" />

              <div className="text-left mb-10">
                <h2 className="text-3xl md:text-4xl font-bold mb-3 bg-gradient-to-r from-white via-white/90 to-white/70 text-transparent bg-clip-text">
                  {t('contact.sendMsgTitle')}
                </h2>
                <p className="text-white/50 text-lg max-w-lg">
                  {t('contact.sendMsgDesc')}
                </p>
              </div>

              {submitStatus === 'success' ? (
                <div className="text-center py-16 animate-in fade-in zoom-in duration-500">
                  <div className="w-20 h-20 bg-[#FF8A5B]/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-[#FF8A5B]/20">
                    <CheckCircle2 className="w-10 h-10 text-[#FF8A5B]" />
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
                    className="group relative w-full overflow-hidden rounded-xl bg-gradient-to-r from-[#FF8A5B] via-[#FF9E6C] to-[#FFB286] p-[1px] focus:outline-none focus:ring-4 focus:ring-[#FF8A5B]/20 disabled:opacity-50 disabled:cursor-not-allowed shadow-xl transition-all duration-300 hover:shadow-[#FF8A5B]/25 hover:scale-[1.01] active:scale-[0.99]"
                  >
                    <div className="relative h-full w-full rounded-xl bg-[#0F0F0F] hover:bg-[#141414] px-8 py-4 transition-all duration-300">
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
      </div>
      <Footer />
    </div>
  );
};


export default Contact;
