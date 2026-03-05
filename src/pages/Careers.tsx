import React, { useState } from 'react';

import { ExternalLink, Upload, CheckCircle2 } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import SharedHeader from '../components/Layout/SharedHeader';
import Footer from '../components/Landing/Footer';

const MAX_RESUME_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB
const ALLOWED_RESUME_EXTENSIONS = /\.(pdf|doc|docx)$/i;

export default function Careers() {

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

      <SharedHeader />

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
