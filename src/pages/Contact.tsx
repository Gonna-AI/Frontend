import React from 'react';
import { motion } from 'framer-motion';
import { Mail, Phone, MapPin } from 'lucide-react';

const Contact = () => {
  return (
    <div className="min-h-screen bg-black text-white/90 py-16 px-4 relative overflow-hidden">
      {/* Glassy Background Elements */}
      <div className="fixed inset-0">
        {/* Red Gradient Background */}
        <div 
          className="absolute top-0 right-0 -translate-y-1/4 translate-x-1/4 w-[800px] h-[800px] opacity-40"
          style={{
            background: 'radial-gradient(circle, rgba(239,68,68,0.4) 0%, rgba(239,68,68,0.1) 40%, transparent 100%)',
            filter: 'blur(80px)',
          }}
        />
        <div 
          className="absolute bottom-0 left-0 translate-y-1/4 -translate-x-1/4 w-[600px] h-[600px] opacity-30"
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
        className="max-w-4xl mx-auto relative z-10"
      >
        <h1 className="text-4xl md:text-5xl font-bold mb-8 bg-gradient-to-r from-red-400 via-red-500 to-red-600 text-transparent bg-clip-text">
          Enterprise Solutions & Sales
        </h1>
        
        <div className="grid md:grid-cols-3 gap-12">
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
                <a href="tel:+1234567890" className="hover:text-red-400 transition-colors">
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
            className="md:col-span-2 space-y-6 backdrop-blur-xl bg-white/5 p-8 rounded-2xl border border-red-500/20"
          >
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-white/70 mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  placeholder="Your name"
                  className="w-full px-4 py-2 bg-white/5 backdrop-blur-sm border border-red-500/20 rounded-lg focus:outline-none focus:border-red-500 transition-colors text-white placeholder:text-white/30"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white/70 mb-2">
                  Company Name
                </label>
                <input
                  type="text"
                  placeholder="Your organization"
                  className="w-full px-4 py-2 bg-white/5 backdrop-blur-sm border border-red-500/20 rounded-lg focus:outline-none focus:border-red-500 transition-colors text-white placeholder:text-white/30"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white/70 mb-2">
                  Business Email
                </label>
                <input
                  type="email"
                  placeholder="you@company.com"
                  className="w-full px-4 py-2 bg-white/5 backdrop-blur-sm border border-red-500/20 rounded-lg focus:outline-none focus:border-red-500 transition-colors text-white placeholder:text-white/30"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white/70 mb-2">
                  Phone Number
                </label>
                <input
                  type="tel"
                  placeholder="Your contact number"
                  className="w-full px-4 py-2 bg-white/5 backdrop-blur-sm border border-red-500/20 rounded-lg focus:outline-none focus:border-red-500 transition-colors text-white placeholder:text-white/30"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white/70 mb-2">
                  Interest
                </label>
                <select
                  className="w-full px-4 py-2 bg-white/5 backdrop-blur-sm border border-red-500/20 rounded-lg focus:outline-none focus:border-red-500 transition-colors text-white"
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
                  Number of Employees
                </label>
                <select
                  className="w-full px-4 py-2 bg-white/5 backdrop-blur-sm border border-red-500/20 rounded-lg focus:outline-none focus:border-red-500 transition-colors text-white"
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
                Message
              </label>
              <textarea
                rows={4}
                placeholder="Tell us about your needs and requirements..."
                className="w-full px-4 py-2 bg-white/5 backdrop-blur-sm border border-red-500/20 rounded-lg focus:outline-none focus:border-red-500 transition-colors text-white placeholder:text-white/30"
              ></textarea>
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              className="w-full bg-gradient-to-r from-red-500 to-red-600 text-white py-3 px-4 rounded-lg hover:from-red-600 hover:to-red-700 transition-all duration-300 backdrop-blur-sm"
            >
              Request Information
            </motion.button>
          </motion.form>
        </div>
      </motion.div>
    </div>
  );
};

export default Contact;