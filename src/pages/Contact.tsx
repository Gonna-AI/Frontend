import type { ChangeEvent, FormEvent } from 'react';
import { useEffect, useRef, useState } from 'react';
import { ArrowUpRight, CheckCircle2, Linkedin, Mail, MapPin, Phone, Send, Twitter } from 'lucide-react';

import { useLanguage } from '../contexts/LanguageContext';
import { Header, Footer } from '../components/Landing/AgeroChrome';
import { isSaveDataEnabled } from '../utils/idle';
import SEO from '../components/SEO';
import './LandingFramer.css';
import './Contact.css';

const MAP_URL = 'https://www.google.com/maps/search/?api=1&query=Industriestrasse%202%2C%2094315%20Straubing%2C%20Germany';
const MAP_EMBED_URL = 'https://maps.google.com/maps?q=Industriestrasse%202%2C%2094315%20Straubing%2C%20Germany&z=15&output=embed';
const CONTACT_VIDEO_SRC = 'https://xlzwfkgurrrspcdyqele.supabase.co/storage/v1/object/public/buck/contactuspagevideo.mp4';

type SubmitStatus = 'idle' | 'success' | 'error';

type ContactFormData = {
  fullName: string;
  companyName: string;
  email: string;
  phone: string;
  interest: string;
  employeeCount: string;
  message: string;
};

const emptyForm: ContactFormData = {
  fullName: '',
  companyName: '',
  email: '',
  phone: '',
  interest: '',
  employeeCount: '',
  message: '',
};

function ContactHeroVideo({ src }: { src: string }) {
  const ref = useRef<HTMLVideoElement>(null);
  const [shouldLoad, setShouldLoad] = useState(false);

  useEffect(() => {
    if (isSaveDataEnabled() || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return;
    }

    const video = ref.current;
    if (!video) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return;
        setShouldLoad(true);
        observer.disconnect();
      },
      { rootMargin: '400px 0px', threshold: 0.01 },
    );

    observer.observe(video);
    return () => observer.disconnect();
  }, []);

  return (
    <video
      autoPlay={shouldLoad}
      className="clerktree-contact-hero-video"
      loop
      muted
      playsInline
      preload="none"
      ref={ref}
      src={shouldLoad ? src : undefined}
      aria-hidden="true"
    />
  );
}

export default function Contact() {
  const { t } = useLanguage();
  const [formData, setFormData] = useState<ContactFormData>(emptyForm);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<SubmitStatus>('idle');

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/api-contacts`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        },
      );

      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Submission failed');

      setSubmitStatus('success');
      setFormData(emptyForm);
    } catch (error) {
      console.error('Submission error:', error);
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
      window.setTimeout(() => setSubmitStatus('idle'), 5000);
    }
  };

  const handleChange = (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <div className="agero-works" id="agero-contact-page">
      <SEO
        title="Contact Us"
        description="Get in touch with ClerkTree. Speak with our team about automating legal, claims, and back-office operations."
        canonical="https://clerktree.com/contact"
      />

      <Header />

      <main className="clerktree-contact-page">
        <section className="clerktree-contact-hero-wrap" aria-labelledby="contact-title">
          <div className="clerktree-contact-hero">
            <p className="clerktree-contact-kicker">ClerkTree • {t('contact.sendMsgTitle')}</p>
            <h1 id="contact-title">{t('contact.sendMsgTitle')}</h1>
            <p>{t('contact.subtitle')}</p>
          </div>

          <div className="clerktree-contact-hero-media">
            <ContactHeroVideo src={CONTACT_VIDEO_SRC} />
          </div>
        </section>

        <section className="clerktree-contact-form-section" aria-label="Contact form">
          <div className="clerktree-contact-form-shell">
            {submitStatus === 'success' ? (
              <div className="clerktree-contact-success">
                <span>
                  <CheckCircle2 size={34} strokeWidth={1.7} />
                </span>
                <h2>{t('contact.successTitle')}</h2>
                <p>{t('contact.successDesc')}</p>
              </div>
            ) : (
              <form className="clerktree-contact-form" onSubmit={handleSubmit}>
                <div className="clerktree-contact-field-grid">
                  <label>
                    <span>{t('contact.fullName')} *</span>
                    <input
                      autoComplete="name"
                      name="fullName"
                      onChange={handleChange}
                      placeholder={t('contact.fullName')}
                      required
                      type="text"
                      value={formData.fullName}
                    />
                  </label>

                  <label>
                    <span>{t('contact.email')} *</span>
                    <input
                      autoComplete="email"
                      name="email"
                      onChange={handleChange}
                      placeholder="you@company.com"
                      required
                      type="email"
                      value={formData.email}
                    />
                  </label>

                  <label>
                    <span>{t('contact.companyName')} *</span>
                    <input
                      autoComplete="organization"
                      name="companyName"
                      onChange={handleChange}
                      placeholder={t('contact.companyName')}
                      required
                      type="text"
                      value={formData.companyName}
                    />
                  </label>

                  <label>
                    <span>{t('contact.phoneNumber')} *</span>
                    <input
                      autoComplete="tel"
                      name="phone"
                      onChange={handleChange}
                      placeholder="+49 176 83075116"
                      required
                      type="tel"
                      value={formData.phone}
                    />
                  </label>

                  <label>
                    <span>{t('contact.interest')} *</span>
                    <select name="interest" onChange={handleChange} required value={formData.interest}>
                      <option value="">{t('contact.selectInterest')}</option>
                      <option value="enterprise">{t('contact.intEnterprise')}</option>
                      <option value="bulk">{t('contact.intBulk')}</option>
                      <option value="custom">{t('contact.intCustom')}</option>
                      <option value="other">{t('contact.intOther')}</option>
                    </select>
                  </label>

                  <label>
                    <span>{t('contact.employees')} *</span>
                    <select name="employeeCount" onChange={handleChange} required value={formData.employeeCount}>
                      <option value="">{t('contact.selectRange')}</option>
                      <option value="1-10">1-10</option>
                      <option value="11-50">11-50</option>
                      <option value="51-200">51-200</option>
                      <option value="201+">201+</option>
                    </select>
                  </label>
                </div>

                <label className="clerktree-contact-message">
                  <span>{t('contact.message')} *</span>
                  <textarea
                    name="message"
                    onChange={handleChange}
                    placeholder={t('contact.messagePlaceholder')}
                    required
                    rows={7}
                    value={formData.message}
                  />
                </label>

                {submitStatus === 'error' && (
                  <p className="clerktree-contact-error">{t('contact.error')}</p>
                )}

                <button className="clerktree-contact-submit" disabled={isSubmitting} type="submit">
                  <span>{isSubmitting ? t('contact.sending') : t('contact.sendButton')}</span>
                  {!isSubmitting && <Send size={18} strokeWidth={1.8} />}
                </button>

                <p className="clerktree-contact-legal">
                  {t('contact.legalPrefix')}{' '}
                  <a href="/terms-of-service">{t('footer.terms')}</a>,{' '}
                  <a href="/privacy-policy">{t('footer.privacy')}</a>.
                </p>
              </form>
            )}
          </div>
        </section>

        <section className="clerktree-contact-location" aria-labelledby="contact-location-title">
          <p className="clerktree-contact-kicker">{t('contact.locationKicker')}</p>
          <h2 id="contact-location-title">{t('contact.locationTitle')}</h2>

          <div className="clerktree-contact-location-grid">
            <div className="clerktree-contact-map">
              <iframe
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                src={MAP_EMBED_URL}
                title="ClerkTree office map"
              />
              <a href={MAP_URL} rel="noopener noreferrer" target="_blank">
                {t('contact.openMap')}
                <ArrowUpRight size={18} />
              </a>
            </div>

            <aside className="clerktree-contact-info-card">
              <ContactInfoItem icon={MapPin} label={t('contact.location')} value="Industriestrasse 2, 94315 Straubing" href={MAP_URL} />
              <ContactInfoItem icon={Mail} label={t('contact.email')} value="team@clerktree.com" href="mailto:team@clerktree.com" />
              <ContactInfoItem icon={Phone} label={t('contact.phone')} value="+49 176 83075116" href="tel:+4917683075116" />

              <div className="clerktree-contact-socials" aria-label="Social links">
                <a href="https://www.linkedin.com/company/clerktree" rel="noopener noreferrer" target="_blank" aria-label="LinkedIn">
                  <Linkedin size={20} />
                </a>
                <a href="https://x.com/teamclerktree" rel="noopener noreferrer" target="_blank" aria-label="X">
                  <Twitter size={20} />
                </a>
                <a href="mailto:team@clerktree.com" aria-label="Email">
                  <Mail size={20} />
                </a>
              </div>
            </aside>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

function ContactInfoItem({
  icon: Icon,
  label,
  value,
  href,
}: {
  icon: typeof MapPin;
  label: string;
  value: string;
  href: string;
}) {
  return (
    <a className="clerktree-contact-info-item" href={href} rel={href.startsWith('http') ? 'noopener noreferrer' : undefined} target={href.startsWith('http') ? '_blank' : undefined}>
      <span>
        <Icon size={22} strokeWidth={1.8} />
      </span>
      <span>
        <small>{label}</small>
        <strong>{value}</strong>
      </span>
    </a>
  );
}
