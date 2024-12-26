import React, { useState } from 'react';
import { cn } from '../../utils/cn';
import { motion } from 'framer-motion';

interface QuoteFormProps {
  onClose: () => void;
  onSubmit: (formData: FormData) => void;
  isDark?: boolean;
}

interface FormData {
  name: string;
  email: string;
  phone: string;
  location: string;
  isCompany: boolean;
  companyName: string;
}

export function QuoteForm({ onClose, onSubmit, isDark = true }: QuoteFormProps) {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    phone: '',
    location: '',
    isCompany: false,
    companyName: '',
  });
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
    setIsSubmitted(true);
    setTimeout(() => {
      onClose();
    }, 3000);
  };

  return (
    <>
      <div
        className="fixed inset-0 z-50 bg-black/20 backdrop-blur-sm"
        onClick={onClose}
      />
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
      >
        <div className={cn(
          "relative max-w-md w-full rounded-2xl overflow-hidden",
          isDark 
            ? "bg-[#0A0A0A] border border-white/10" 
            : "bg-[#FAFAFA] border border-black/10"
        )}>
          {/* Background Gradients */}
          <div className="absolute top-0 right-0 w-[35rem] h-[35rem] bg-gradient-to-bl from-blue-500/10 via-purple-500/5 to-transparent blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-[35rem] h-[35rem] bg-gradient-to-tr from-purple-500/10 to-transparent blur-3xl pointer-events-none" />

          <div className="relative p-6 space-y-6">
            {!isSubmitted ? (
              <>
                <h2 className={cn(
                  "text-2xl font-bold mb-6 flex justify-between items-center",
                  isDark ? "text-white" : "text-black"
                )}>
                  Get a Custom Quote
                  <button
                    onClick={onClose}
                    className={cn(
                      "p-2 rounded-xl transition-colors",
                      isDark 
                        ? "bg-black/20 hover:bg-black/30 text-white" 
                        : "bg-black/5 hover:bg-black/10 text-black"
                    )}
                  >
                    ✕
                  </button>
                </h2>
                
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label htmlFor="name" className={cn(
                      "block text-sm font-medium mb-1",
                      isDark ? "text-white/60" : "text-black/60"
                    )}>Name</label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      className={cn(
                        "w-full px-4 py-2 rounded-xl transition-colors",
                        isDark
                          ? "bg-black/20 border border-white/10 text-white placeholder-white/40"
                          : "bg-white/10 border border-black/10 text-black placeholder-black/40",
                        "focus:outline-none focus:ring-2",
                        isDark
                          ? "focus:ring-white/20"
                          : "focus:ring-black/20"
                      )}
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="email" className={cn(
                      "block text-sm font-medium mb-1",
                      isDark ? "text-white/60" : "text-black/60"
                    )}>Email</label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className={cn(
                        "w-full px-4 py-2 rounded-xl transition-colors",
                        isDark
                          ? "bg-black/20 border border-white/10 text-white placeholder-white/40"
                          : "bg-white/10 border border-black/10 text-black placeholder-black/40",
                        "focus:outline-none focus:ring-2",
                        isDark
                          ? "focus:ring-white/20"
                          : "focus:ring-black/20"
                      )}
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="phone" className={cn(
                      "block text-sm font-medium mb-1",
                      isDark ? "text-white/60" : "text-black/60"
                    )}>Phone Number</label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className={cn(
                        "w-full px-4 py-2 rounded-xl transition-colors",
                        isDark
                          ? "bg-black/20 border border-white/10 text-white placeholder-white/40"
                          : "bg-white/10 border border-black/10 text-black placeholder-black/40",
                        "focus:outline-none focus:ring-2",
                        isDark
                          ? "focus:ring-white/20"
                          : "focus:ring-black/20"
                      )}
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="location" className={cn(
                      "block text-sm font-medium mb-1",
                      isDark ? "text-white/60" : "text-black/60"
                    )}>Location</label>
                    <input
                      type="text"
                      id="location"
                      name="location"
                      value={formData.location}
                      onChange={handleChange}
                      className={cn(
                        "w-full px-4 py-2 rounded-xl transition-colors",
                        isDark
                          ? "bg-black/20 border border-white/10 text-white placeholder-white/40"
                          : "bg-white/10 border border-black/10 text-black placeholder-black/40",
                        "focus:outline-none focus:ring-2",
                        isDark
                          ? "focus:ring-white/20"
                          : "focus:ring-black/20"
                      )}
                      required
                    />
                  </div>

                  <div>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        name="isCompany"
                        checked={formData.isCompany}
                        onChange={handleChange}
                        className={cn(
                          "mr-2 rounded",
                          isDark
                            ? "bg-black/20 border-white/10"
                            : "bg-white/10 border-black/10"
                        )}
                      />
                      <span className={cn(
                        "text-sm",
                        isDark ? "text-white/60" : "text-black/60"
                      )}>This is for a company</span>
                    </label>
                  </div>

                  {formData.isCompany && (
                    <div>
                      <label htmlFor="companyName" className={cn(
                        "block text-sm font-medium mb-1",
                        isDark ? "text-white/60" : "text-black/60"
                      )}>Company Name</label>
                      <input
                        type="text"
                        id="companyName"
                        name="companyName"
                        value={formData.companyName}
                        onChange={handleChange}
                        className={cn(
                          "w-full px-4 py-2 rounded-xl transition-colors",
                          isDark
                            ? "bg-black/20 border border-white/10 text-white"
                            : "bg-black/5 border border-black/10 text-black",
                          "focus:outline-none focus:ring-2",
                          isDark
                            ? "focus:ring-white/20"
                            : "focus:ring-black/20"
                        )}
                        required={formData.isCompany}
                      />
                    </div>
                  )}

                  <div className="flex justify-end gap-4 pt-4">

                    <button
                      type="submit"
                      className={cn(
                        "px-6 py-2 rounded-xl transition-colors",
                        isDark 
                          ? "bg-black/20 hover:bg-black/30 text-white" 
                          : "bg-black/5 hover:bg-black/10 text-black"
                      )}
                    >
                      Done
                    </button>
                  </div>
                </form>
              </>
            ) : (
              <div className="text-center py-8">
                <h2 className={cn(
                  "text-2xl font-bold mb-4",
                  isDark ? "text-white" : "text-black"
                )}>Thank You!</h2>
                <p className={cn(
                  "mb-4",
                  isDark ? "text-white/60" : "text-black/60"
                )}>We've received your information and will contact you soon.</p>
                <div className={cn(
                  "animate-pulse",
                  isDark ? "text-purple-400" : "text-purple-600"
                )}>
                  If it is not there, check your spam folder.
                </div>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </>
  );
}