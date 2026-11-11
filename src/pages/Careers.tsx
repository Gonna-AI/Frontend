import { ArrowUpRight } from 'lucide-react';
import { siWellfound } from 'simple-icons';
import { useLanguage } from '../contexts/LanguageContext';
import { PageHero, Footer } from '../components/Landing/SiteChrome';
import SEO from '../components/SEO';
import './LandingFramer.css';
import './Careers.css';

const WELLFOUND_JOBS = 'https://wellfound.com/company/clerktree-1/jobs';

const COPY = {
  en: { seo: 'Open roles at ClerkTree, hiring through Wellfound.', line: 'We hire through Wellfound.', cta: 'Open roles on Wellfound' },
  de: { seo: 'Offene Stellen bei ClerkTree, Bewerbung über Wellfound.', line: 'Wir stellen über Wellfound ein.', cta: 'Offene Stellen auf Wellfound' },
};

export default function Careers() {
  const { t, language } = useLanguage();
  const c = language === 'de' ? COPY.de : COPY.en;

  return (
    <div className="ct-works" id="ct-works">
      <SEO title="Careers at ClerkTree" description={c.seo} canonical="https://clerktree.com/careers" />
      <PageHero
        title={<>{t('careers.title1')} <span className="ct-orange">{t('careers.title2')}</span></>}
        description={c.line}
        titleId="careers-title"
      >
        <a className="ct-wellfound" href={WELLFOUND_JOBS} rel="noopener noreferrer" target="_blank">
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d={siWellfound.path} /></svg>
          {c.cta}
          <span aria-hidden="true"><ArrowUpRight size={16} /></span>
        </a>
      </PageHero>
      <Footer />
    </div>
  );
}
