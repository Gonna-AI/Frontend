import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Phone, MapPin } from 'lucide-react';
import api from '../config/api';
import { useNavigate } from 'react-router-dom';

const Contact = () => {
  const navigate = useNavigate();
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
      const response = await api.post('/api/contact/submit', formData);

      if (response.status !== 200) throw new Error('Submission failed');
      
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
    <div className="min-h-screen bg-black text-white/90 py-16 px-4 relative overflow-hidden">
      {/* Glassy Background Elements */}
      <div className="fixed inset-0">
        {/* Red Gradient Background */}
        <div 
          className="absolute top-0 right-0 -translate-y-1/4 translate-x-1/4 w-96 md:w-[800px] h-96 md:h-[800px] opacity-40"
          style={{
            background: 'radial-gradient(circle, rgba(239,68,68,0.4) 0%, rgba(239,68,68,0.1) 40%, transparent 100%)',
            filter: 'blur(80px)',
          }}
        />
        <div 
          className="absolute bottom-0 left-0 translate-y-1/4 -translate-x-1/4 w-72 md:w-[600px] h-72 md:h-[600px] opacity-30"
          style={{
            background: 'radial-gradient(circle, rgba(185,28,28,0.4) 0%, rgba(185,28,28,0.1) 40%, transparent 100%)',
            filter: 'blur(80px)',
          }}
        />

        {/* Animated Grid Pattern */}
        <div 
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `
              linear-gradient(to right, rgba(239,68,68,0.2) 1px, transparent 1px),
              linear-gradient(to bottom, rgba(239,68,68,0.2) 1px, transparent 1px)
            `,
            backgroundSize: '40px 40px',
            maskImage: 'radial-gradient(circle at center, black, transparent 80%)',
          }}
        />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-5xl mx-auto relative z-10 text-center"
      >
        {/* Logo and Company Name (clickable to Home) */}
        <button
          type="button"
          onClick={() => navigate('/')}
          className="flex items-center gap-2 mb-6 mx-auto group"
          aria-label="Go to home"
        >
          <svg 
            viewBox="0 0 464 468"
            className="w-14 h-14"
          >
            <defs>
              <linearGradient id="ct-contact" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#ef4444" />
                <stop offset="100%" stopColor="#b91c1c" />
              </linearGradient>
            </defs>
            <path fill="url(#ct-contact)" d={`M275.9 63.5c37.7 5.3 76.6 24.1 103.7 50.2 30 28.8 41.8 57.6 35.8 87.1-6.1 30.1-33.6 52.9-70.6 58.3-6 0.9-18.3 1-44.9 0.6l-36.6-0.7-0.5 17.8c-0.3 9.7-0.4 17.8-0.4 17.9 0.1 0.1 19.1 0.3 42.2 0.4 23.2 0 42.7 0.5 43.5 1 1.2 0.7 1.1 2.2-0.8 9.4-6 23-20.5 42.1-41.8 55-7.3 4.3-26.7 11.9-36 14.1-9 2-34 2-44.5 0-41.3-7.9-74.2-38-82.9-75.7-8.1-35.7 2.2-71.5 27.5-94.7 16.1-14.9 35.5-22.4 63.7-24.7l7.7-0.7v-34.1l-11.7 0.7c-22.2 1.3-37 5.3-56.4 15.2-28.7 14.6-49.7 39.3-59.9 70.2-9.6 29.3-9.3 62.6 0.8 91.4 3.3 9.2 12.2 25.6 18.3 33.8 11.3 14.9 30.6 30.8 48.7 39.9 19.9 10 49.2 15.9 73.2 14.7 26.5-1.3 52.5-9.6 74.2-23.9 26.9-17.6 47.2-47.9 53.3-79.7 1-5.2 2.3-10.1 2.8-10.8 0.8-0.9 6.9-1.2 27.1-1l26.1 0.3 0.3 3.8c1.2 14.6-10.9 52.1-23.9 74-17.8 30-43.2 54-75.9 71.5-20.9 11.2-38.3 16.5-67.2 20.7-27.6 3.9-47.9 3.1-75.8-3.1-36.9-8.3-67.8-25.6-97.1-54.6-23.6-23.2-44.8-61.9-51.7-93.8-5.1-23.7-5.5-28.1-4.9-48.8 1.7-63.2 23.4-111.8 67.7-152 28-25.4 60.4-41.3 99-48.8 18.5-3.6 46.1-4 67.9-0.9zm16.4 92.6c-6.3 2.4-12.8 8.5-15.4 14.5-2.6 6.1-2.6 18.3 0 23.9 5 11 20.2 17.7 32.3 14.1 11.9-3.4 19.8-14.3 19.8-27.1-0.1-19.9-18.2-32.5-36.7-25.4z`} />
          </svg>
          <span className="text-3xl md:text-4xl font-semibold text-white/90 group-hover:text-white">
            ClerkTree
          </span>
        </button>

        {/* Centered header like other pages */}
        <h1 className="text-5xl md:text-6xl font-bold mb-10 bg-gradient-to-r from-red-400 via-red-500 to-red-600 text-transparent bg-clip-text">
          Enterprise Solutions & Sales
        </h1>
        
        <div className="grid md:grid-cols-3 gap-8 md:gap-12 text-left">
          {/* Contact Information */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="md:col-span-1 space-y-8"
          >
            <p className="text-lg text-white/70">
              Ready to scale your business with our enterprise solutions? Contact our sales team to discuss custom pricing, bulk licenses, and dedicated support options for your organization.
            </p>
            
            <div className="space-y-4">
              <motion.div 
                whileHover={{ x: 5 }}
                className="flex items-center gap-3"
              >
                <Mail className="w-5 h-5 text-red-400" />
                <a href="mailto:contact@clerktree.com" className="hover:text-red-400 transition-colors">
                  contact@clerktree.com
                </a>
              </motion.div>
              
              <motion.div 
                whileHover={{ x: 5 }}
                className="flex items-center gap-3"
              >
                <Phone className="w-5 h-5 text-red-400" />
                <a href="tel:+919650848339" className="hover:text-red-400 transition-colors">
                  +91 (965) 084-8339, +49 160 96893540
                </a>
              </motion.div>
              
              <motion.div 
                whileHover={{ x: 5 }}
                className="flex items-center gap-3"
              >
                <MapPin className="w-5 h-5 text-red-400" />
                <span>Mallersdorfer Str. 10<br />94315 Straubing, Germany</span>
              </motion.div>
            </div>
          </motion.div>

          {/* Contact Form */}
          <motion.form 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="md:col-span-2 space-y-6 backdrop-blur-xl bg-black/40 md:bg-white/5 p-6 md:p-8 rounded-2xl border border-red-500/20"
            onSubmit={handleSubmit}
          >
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-white/70 mb-2">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  type="text"
                  placeholder="Your name"
                  className="w-full px-4 py-2 bg-black/40 md:bg-transparent backdrop-blur-sm border border-red-500/20 rounded-lg focus:outline-none focus:border-red-500 transition-colors text-white placeholder:text-white/30"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white/70 mb-2">
                  Company Name <span className="text-red-500">*</span>
                </label>
                <input
                  name="companyName"
                  value={formData.companyName}
                  onChange={handleChange}
                  type="text"
                  placeholder="Your organization"
                  className="w-full px-4 py-2 bg-black/40 md:bg-transparent backdrop-blur-sm border border-red-500/20 rounded-lg focus:outline-none focus:border-red-500 transition-colors text-white placeholder:text-white/30"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white/70 mb-2">
                  Business Email <span className="text-red-500">*</span>
                </label>
                <input
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  type="email"
                  placeholder="you@company.com"
                  className="w-full px-4 py-2 bg-black/40 md:bg-transparent backdrop-blur-sm border border-red-500/20 rounded-lg focus:outline-none focus:border-red-500 transition-colors text-white placeholder:text-white/30"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white/70 mb-2">
                  Phone Number <span className="text-red-500">*</span>
                </label>
                <input
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  type="tel"
                  placeholder="Your contact number"
                  className="w-full px-4 py-2 bg-black/40 md:bg-transparent backdrop-blur-sm border border-red-500/20 rounded-lg focus:outline-none focus:border-red-500 transition-colors text-white placeholder:text-white/30"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white/70 mb-2">
                  Interest <span className="text-red-500">*</span>
                </label>
                <select
                  name="interest"
                  value={formData.interest}
                  onChange={handleChange}
                  className="w-full px-4 py-2 bg-black/40 md:bg-transparent backdrop-blur-sm border border-red-500/20 rounded-lg focus:outline-none focus:border-red-500 transition-colors text-white"
                  required
                >
                  <option value="" className="bg-black">Select your interest</option>
                  <option value="enterprise" className="bg-black">Enterprise License</option>
                  <option value="bulk" className="bg-black">Bulk Purchase</option>
                  <option value="custom" className="bg-black">Custom Solution</option>
                  <option value="other" className="bg-black">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-white/70 mb-2">
                  Number of Employees <span className="text-red-500">*</span>
                </label>
                <select
                  name="employeeCount"
                  value={formData.employeeCount}
                  onChange={handleChange}
                  className="w-full px-4 py-2 bg-black/40 md:bg-transparent backdrop-blur-sm border border-red-500/20 rounded-lg focus:outline-none focus:border-red-500 transition-colors text-white"
                  required
                >
                  <option value="" className="bg-black">Select range</option>
                  <option value="1-10" className="bg-black">1-10</option>
                  <option value="11-50" className="bg-black">11-50</option>
                  <option value="51-200" className="bg-black">51-200</option>
                  <option value="201+" className="bg-black">201+</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-white/70 mb-2">
                Message <span className="text-red-500">*</span>
              </label>
              <textarea
                name="message"
                value={formData.message}
                onChange={handleChange}
                rows={4}
                placeholder="Tell us about your needs and requirements..."
                className="w-full px-4 py-2 bg-black/40 md:bg-transparent backdrop-blur-sm border border-red-500/20 rounded-lg focus:outline-none focus:border-red-500 transition-colors text-white placeholder:text-white/30"
                required
              ></textarea>
            </div>

            {submitStatus === 'success' && (
              <div className="text-green-500 mt-4">
                Thank you for your message. We'll be in touch soon!
              </div>
            )}
            {submitStatus === 'error' && (
              <div className="text-red-500 mt-4">
                Something went wrong. Please try again later.
              </div>
            )}

            <motion.button
              disabled={isSubmitting}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              className="w-full bg-gradient-to-r from-red-500 to-red-600 text-white py-3 px-4 rounded-lg hover:from-red-600 hover:to-red-700 transition-all duration-300 backdrop-blur-sm"
            >
              {isSubmitting ? 'Sending...' : 'Request Information'}
            </motion.button>
          </motion.form>
        </div>
      </motion.div>
    </div>
  );
};

export default Contact;