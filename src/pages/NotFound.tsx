import { Link } from 'react-router-dom';
import { ArrowLeft, ArrowUpRight } from 'lucide-react';

import { Header, Footer } from '../components/Landing/SiteChrome';
import SEO from '../components/SEO';
import Grainient from '../components/Brand/Grainient';
import { useLanguage } from '../contexts/LanguageContext';
import './LandingFramer.css';

const copy = {
  en: {
    eyebrow: 'Error 404',
    title: 'This page drifted off the line.',
    body: 'The link may be outdated, or the page has moved. Everything else is running as it should.',
    home: 'Back to home',
    contact: 'Contact us',
  },
  de: {
    eyebrow: 'Fehler 404',
    title: 'Diese Seite ist vom Band gelaufen.',
    body: 'Der Link ist vielleicht veraltet oder die Seite wurde verschoben. Alles andere läuft wie gewohnt.',
    home: 'Zur Startseite',
    contact: 'Kontakt',
  },
} as const;

const NotFound = () => {
  const { language } = useLanguage();
  const text = copy[language === 'de' ? 'de' : 'en'];

  return (
    <div className="ct-works" id="ct-works">
      <SEO title={text.eyebrow} description={text.body} noindex />

      <div className="ct-top-area ct-top-area-with-hero">
        <Header />

        <section className="ct-hero-stage ct-notfound-stage" aria-labelledby="notfound-title">
          <Grainient preset="silver" />
          <span className="ct-notfound-code" aria-hidden="true">404</span>
          <div className="ct-hero-stage-content">
            <p className="ct-notfound-eyebrow">{text.eyebrow}</p>
            <h1 id="notfound-title">{text.title}</h1>
            <p>{text.body}</p>
            <div className="ct-notfound-actions">
              <Link className="ct-notfound-primary" to="/">
                <ArrowLeft size={16} aria-hidden="true" />
                {text.home}
              </Link>
              <Link className="ct-notfound-secondary" to="/contact">
                {text.contact}
                <ArrowUpRight size={16} aria-hidden="true" />
              </Link>
            </div>
          </div>
        </section>
      </div>

      <Footer />
    </div>
  );
};

export default NotFound;
