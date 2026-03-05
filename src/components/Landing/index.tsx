import Hero from './Hero';
import SEO from '../SEO';
import { lazy, Suspense } from 'react';
import Footer from './Footer';
import AnnouncementBanner from './AnnouncementBanner';

import { useState, useCallback } from 'react';
import SharedHeader from '../Layout/SharedHeader';


// Lazy-load below-the-fold sections to reduce initial JS bundle
const AboutSection = lazy(() => import('./AboutSection'));
const Metrics = lazy(() => import('./Metrics'));
const Features = lazy(() => import('./Features'));
const Conversation = lazy(() => import('./Conversation'));
const FAQ = lazy(() => import('./FAQ'));

export default function Landing() {

  const [bannerVisible, setBannerVisible] = useState(true);

  const handleBannerVisibility = useCallback((visible: boolean) => {
    setBannerVisible(visible);
  }, []);


  return (
    <div className="min-h-screen overflow-hidden relative bg-[rgb(10,10,10)]">
      <SEO
        title="Autonomous AI Voice & Reception Agents"
        description="Stop losing revenue to missed calls. ClerkTree provides autonomous, human-sounding AI Voice Agents that handle Gäubodenvolksfest crowds, reservations, and customer support. State-subsidized up to 50% for Bavarian SMEs."
        canonical="https://clerktree.com"
      />
      {/* Announcement Banner */}
      <AnnouncementBanner onVisibilityChange={handleBannerVisibility} />

      <SharedHeader bannerVisible={bannerVisible} />

      <div className="relative z-10">
        <Hero />

        <Suspense fallback={null}>
          <div id="about-section">
            <AboutSection />
          </div>
          <Metrics />
          <Features />
          <Conversation />
          <FAQ />
        </Suspense>
        <Footer />
      </div>
    </div>
  );
}