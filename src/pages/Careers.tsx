import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ExternalLink, Upload, CheckCircle2 } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import LanguageSwitcher from '../components/Layout/LanguageSwitcher';
import Footer from '../components/Landing/Footer';

const MAX_RESUME_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB
const ALLOWED_RESUME_EXTENSIONS = /\.(pdf|doc|docx)$/i;

export default function Careers() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    linkedinProfile: '',
    currentPosition: '',
    yearsOfExperience: '',
    positionApplyingFor: '',
    coverLetter: '',
    portfolioWebsite: '',
    resume: null as File | null,
  });
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const isAllowedExtension = ALLOWED_RESUME_EXTENSIONS.test(file.name);

      if (!isAllowedExtension) {
        setFormError('Please upload a PDF, DOC, or DOCX file.');
        e.target.value = '';
        return;
      }

      if (file.size > MAX_RESUME_SIZE_BYTES) {
        setFormError('Resume must be 5 MB or smaller.');
        e.target.value = '';
        return;
      }

      setFormError('');
      setFormData(prev => ({ ...prev, resume: file }));
    }
  };



  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL?.trim();
    if (!supabaseUrl) {
      setFormError('Application service is not configured. Please try again later.');
      return;
    }

    if (!formData.resume) {
      setFormError('Please upload your resume before submitting.');
      return;
    }

    if (formData.resume.size > MAX_RESUME_SIZE_BYTES) {
      setFormError('Resume must be 5 MB or smaller.');
      return;
    }

    setIsSubmitting(true);
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000);

    try {
      const body = new FormData();
      body.append('fullName', formData.fullName);
      body.append('email', formData.email);
      body.append('phone', formData.phone);
      body.append('linkedinProfile', formData.linkedinProfile);
      body.append('currentPosition', formData.currentPosition);
      body.append('yearsOfExperience', formData.yearsOfExperience);
      body.append('positionApplyingFor', formData.positionApplyingFor);
      body.append('coverLetter', formData.coverLetter);
      body.append('portfolioWebsite', formData.portfolioWebsite);
      if (formData.resume) body.append('resume', formData.resume);

      const response = await fetch(
        `${supabaseUrl}/functions/v1/api-careers`,
        { method: 'POST', body, signal: controller.signal }
      );

      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Submission failed');

      setSubmitted(true);

      setTimeout(() => {
        setSubmitted(false);
        setFormData({
          fullName: '',
          email: '',
          phone: '',
          linkedinProfile: '',
          currentPosition: '',
          yearsOfExperience: '',
          positionApplyingFor: '',
          coverLetter: '',
          portfolioWebsite: '',
          resume: null,
        });
      }, 3000);

    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        setFormError('Request timed out. Please try again.');
      } else {
        setFormError('Failed to submit application. Please check your connection and try again.');
      }
      console.error('Error submitting application:', error);
    } finally {
      clearTimeout(timeoutId);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-[rgb(10,10,10)] min-h-screen relative overflow-x-hidden">
      {/* Emerald theme background accents */}
      <div className="fixed inset-0 bg-[rgb(10,10,10)] -z-10">
        <div
          className="absolute top-0 right-0 -translate-y-1/4 translate-x-1/4 w-96 md:w-[800px] h-96 md:h-[800px] opacity-40"
          style={{
            background: 'radial-gradient(circle, rgba(16,185,129,0.6) 0%, rgba(16,185,129,0.25) 40%, transparent 100%)',
            filter: 'blur(80px)',
          }}
        />
        <div
          className="absolute bottom-0 left-0 translate-y-1/4 -translate-x-1/4 w-72 md:w-[600px] h-72 md:h-[600px] opacity-30"
          style={{
            background: 'radial-gradient(circle, rgba(5,150,105,0.5) 0%, rgba(5,150,105,0.2) 40%, transparent 100%)',
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
            <svg viewBox="0 0 464 468" className="w-9 h-9 md:w-11 md:h-11">
              <path fill="white" d="M275.9 63.5c37.7 5.3 76.6 24.1 103.7 50.2 30 28.8 41.8 57.6 35.8 87.1-6.1 30.1-33.6 52.9-70.6 58.3-6 0.9-18.3 1-44.9 0.6l-36.6-0.7-0.5 17.8c-0.3 9.7-0.4 17.8-0.4 17.9 0.1 0.1 19.1 0.3 42.2 0.4 23.2 0 42.7 0.5 43.5 1 1.2 0.7 1.1 2.2-0.8 9.4-6 23-20.5 42.1-41.8 55-7.3 4.3-26.7 11.9-36 14.1-9 2-34 2-44.5 0-41.3-7.9-74.2-38-82.9-75.7-8.1-35.7 2.2-71.5 27.5-94.7 16.1-14.9 35.5-22.4 63.7-24.7l7.7-0.7v-34.1l-11.7 0.7c-22.2 1.3-37 5.3-56.4 15.2-28.7 14.6-49.7 39.3-59.9 70.2-9.6 29.3-9.3 62.6 0.8 91.4 3.3 9.2 12.2 25.6 18.3 33.8 11.3 14.9 30.6 30.8 48.7 39.9 19.9 10 49.2 15.9 73.2 14.7 26.5-1.3 52.5-9.6 74.2-23.9 26.9-17.6 47.2-47.9 53.3-79.7 1-5.2 2.3-10.1 2.8-10.8 0.8-0.9 6.9-1.2 27.1-1l26.1 0.3 0.3 3.8c1.2 14.6-10.9 52.1-23.9 74-17.8 30-43.2 54-75.9 71.5-20.9 11.2-38.3 16.5-67.2 20.7-27.6 3.9-47.9 3.1-75.8-3.1-36.9-8.3-67.8-25.6-97.1-54.6-23.6-23.2-44.8-61.9-51.7-93.8-5.1-23.7-5.5-28.1-4.9-48.8 1.7-63.2 23.4-111.8 67.7-152 28-25.4 60.4-41.3 99-48.8 18.5-3.6 46.1-4 67.9-0.9zm16.4 92.6c-6.3 2.4-12.8 8.5-15.4 14.5-2.6 6.1-2.6 18.3 0 23.9 5 11 20.2 17.7 32.3 14.1 11.9-3.4 19.8-14.3 19.8-27.1-0.1-19.9-18.2-32.5-36.7-25.4z" />
            </svg>
            <span className="text-xl md:text-2xl font-semibold text-white/90 group-hover:text-white transition-colors">
              ClerkTree
            </span>
          </button>
          <div className="flex items-center gap-3">
            {/* Mobile Pill */}
            <div className="md:hidden">
              <span className="px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium whitespace-nowrap">
                {t('footer.careers')}
              </span>
            </div>
            <LanguageSwitcher isExpanded={true} forceDark={true} />
          </div>
        </div>
      </header>

      <div className="relative z-10 py-12 px-6 pt-32 md:pt-36">
        <div className="max-w-5xl mx-auto">

          {/* Header */}
          <div className="text-center mb-16">
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6">
              <span className="bg-gradient-to-r from-white via-white/95 to-white/90 text-transparent bg-clip-text">
                {t('careers.title1')}
              </span>
              <br />
              <span className="bg-gradient-to-r from-emerald-400 via-teal-400 to-emerald-600 text-transparent bg-clip-text">
                {t('careers.title2')}
              </span>
            </h1>
            <p className="text-lg md:text-xl text-white/60 leading-relaxed max-w-3xl mx-auto">
              {t('careers.subtitle')}
            </p>
          </div>

          {/* LinkedIn Link */}
          <div className="mb-12 text-center">
            <a
              href="https://www.linkedin.com/company/clerktree/jobs"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-3 px-8 py-4 rounded-xl bg-gradient-to-br from-emerald-500/10 to-teal-500/10 border border-emerald-500/20 backdrop-blur-sm text-emerald-400 hover:from-emerald-500/20 hover:to-teal-500/20 hover:border-emerald-500/40 hover:text-emerald-300 transition-all duration-300 font-medium text-lg group"
            >
              <span>{t('careers.linkedin')}</span>
              <ExternalLink className="w-5 h-5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </a>
          </div>

          {/* OR Divider */}
          <div className="flex items-center justify-center gap-6 mb-12">
            <div className="h-px bg-gradient-to-r from-transparent via-white/20 to-transparent flex-1 max-w-xs"></div>
            <span className="text-white/40 text-base font-medium tracking-wider">{t('careers.or')}</span>
            <div className="h-px bg-gradient-to-r from-transparent via-white/20 to-transparent flex-1 max-w-xs"></div>
          </div>

          {/* CV Submission Form */}
          <div className="rounded-2xl border border-emerald-500/20 bg-gradient-to-br from-white/[0.02] via-white/[0.01] to-transparent backdrop-blur-sm p-8 md:p-12">
            <h2 className="text-2xl md:text-3xl font-bold mb-2 bg-gradient-to-r from-emerald-400 to-emerald-600 text-transparent bg-clip-text">
              {t('careers.formTitle')}
            </h2>
            <p className="text-white/60 mb-8">
              {t('careers.formDesc')}
            </p>

            {submitted ? (
              <div className="text-center py-12">
                <CheckCircle2 className="w-16 h-16 text-emerald-500 mx-auto mb-4" />
                <h3 className="text-2xl font-semibold text-white mb-2">{t('careers.successTitle')}</h3>
                <p className="text-white/70">{t('careers.successDesc')}</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                {formError ? (
                  <div className="rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                    {formError}
                  </div>
                ) : null}
                {/* Full Name */}
                <div>
                  <label htmlFor="fullName" className="block text-sm font-medium text-white/80 mb-2">
                    {t('careers.fullName')} <span className="text-emerald-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="fullName"
                    name="fullName"
                    required
                    value={formData.fullName}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white placeholder-white/40 focus:outline-none focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/20 transition-all"
                    placeholder="John Doe"
                  />
                </div>

                {/* Email and Phone */}
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-white/80 mb-2">
                      {t('careers.email')} <span className="text-emerald-500">*</span>
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      required
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white placeholder-white/40 focus:outline-none focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/20 transition-all"
                      placeholder="john@example.com"
                    />
                  </div>
                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-white/80 mb-2">
                      {t('careers.phone')} <span className="text-emerald-500">*</span>
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      required
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white placeholder-white/40 focus:outline-none focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/20 transition-all"
                      placeholder="+1 (555) 000-0000"
                    />
                  </div>
                </div>

                {/* Current Position and Years of Experience */}
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="currentPosition" className="block text-sm font-medium text-white/80 mb-2">
                      {t('careers.currentPos')} <span className="text-emerald-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="currentPosition"
                      name="currentPosition"
                      required
                      value={formData.currentPosition}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white placeholder-white/40 focus:outline-none focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/20 transition-all"
                      placeholder="Senior Software Engineer"
                    />
                  </div>
                  <div>
                    <label htmlFor="yearsOfExperience" className="block text-sm font-medium text-white/80 mb-2">
                      {t('careers.experience')} <span className="text-emerald-500">*</span>
                    </label>
                    <select
                      id="yearsOfExperience"
                      name="yearsOfExperience"
                      required
                      value={formData.yearsOfExperience}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white focus:outline-none focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/20 transition-all"
                    >
                      <option value="" className="bg-gray-900">{t('careers.select')}</option>
                      <option value="0-1" className="bg-gray-900">0-1 {t('careers.years') || 'years'}</option>
                      <option value="1-3" className="bg-gray-900">1-3 {t('careers.years') || 'years'}</option>
                      <option value="3-5" className="bg-gray-900">3-5 {t('careers.years') || 'years'}</option>
                      <option value="5-10" className="bg-gray-900">5-10 {t('careers.years') || 'years'}</option>
                      <option value="10+" className="bg-gray-900">10+ {t('careers.years') || 'years'}</option>
                    </select>
                  </div>
                </div>

                {/* Position Applying For */}
                <div>
                  <label htmlFor="positionApplyingFor" className="block text-sm font-medium text-white/80 mb-2">
                    {t('careers.position')} <span className="text-emerald-500">*</span>
                  </label>
                  <select
                    id="positionApplyingFor"
                    name="positionApplyingFor"
                    required
                    value={formData.positionApplyingFor}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white focus:outline-none focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/20 transition-all"
                  >
                    <option value="" className="bg-gray-900">{t('careers.selectPos')}</option>
                    <option value="senior-frontend" className="bg-gray-900">{t('careers.pos1')}</option>
                    <option value="fullstack" className="bg-gray-900">{t('careers.pos2')}</option>
                    <option value="product-designer" className="bg-gray-900">{t('careers.pos3')}</option>
                    <option value="other" className="bg-gray-900">{t('careers.other')}</option>
                  </select>
                </div>

                {/* LinkedIn Profile */}
                <div>
                  <label htmlFor="linkedinProfile" className="block text-sm font-medium text-white/80 mb-2">
                    {t('careers.linkedinUrl')}
                  </label>
                  <input
                    type="url"
                    id="linkedinProfile"
                    name="linkedinProfile"
                    value={formData.linkedinProfile}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white placeholder-white/40 focus:outline-none focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/20 transition-all"
                    placeholder="https://linkedin.com/in/yourprofile"
                  />
                </div>

                {/* Portfolio/Website */}
                <div>
                  <label htmlFor="portfolioWebsite" className="block text-sm font-medium text-white/80 mb-2">
                    {t('careers.portfolio')}
                  </label>
                  <input
                    type="url"
                    id="portfolioWebsite"
                    name="portfolioWebsite"
                    value={formData.portfolioWebsite}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white placeholder-white/40 focus:outline-none focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/20 transition-all"
                    placeholder="https://yourportfolio.com"
                  />
                </div>

                {/* Cover Letter */}
                <div>
                  <label htmlFor="coverLetter" className="block text-sm font-medium text-white/80 mb-2">
                    {t('careers.coverLetter')} <span className="text-emerald-500">*</span>
                  </label>
                  <textarea
                    id="coverLetter"
                    name="coverLetter"
                    required
                    rows={6}
                    value={formData.coverLetter}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white placeholder-white/40 focus:outline-none focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/20 transition-all resize-none"
                    placeholder="Tell us about yourself and why you're interested in joining ClerkTree..."
                  />
                </div>

                {/* Resume Upload */}
                <div>
                  <label htmlFor="resume" className="block text-sm font-medium text-white/80 mb-2">
                    {t('careers.resume')} <span className="text-emerald-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="file"
                      id="resume"
                      name="resume"
                      required
                      onChange={handleFileChange}
                      accept=".pdf,.doc,.docx"
                      className="hidden"
                    />
                    <label
                      htmlFor="resume"
                      className="flex items-center justify-center gap-3 w-full px-4 py-4 rounded-lg bg-white/5 border border-white/10 text-white/70 hover:bg-white/10 hover:border-emerald-500/50 cursor-pointer transition-all"
                    >
                      <Upload className="w-5 h-5" />
                      <span>
                        {formData.resume ? formData.resume.name : t('careers.upload')}
                      </span>
                    </label>
                  </div>
                </div>

                {/* Submit Button */}
                <div className="pt-4">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full px-8 py-4 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-semibold hover:from-emerald-600 hover:to-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg shadow-emerald-500/25"
                  >
                    {isSubmitting ? t('careers.submitting') : t('careers.submit')}
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
}
