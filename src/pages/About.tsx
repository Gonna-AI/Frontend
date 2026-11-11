import { lazy, Suspense, useEffect, useRef, useState, type CSSProperties } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowUpRight, UsersRound, X } from 'lucide-react';

import { useLanguage } from '../contexts/LanguageContext';
import { PageHero, Footer } from '../components/Landing/AgeroChrome';
import SEO from '../components/SEO';
import './LandingFramer.css';
import './About.css';
import './AboutTeam.css';
import { MEDIA_BASE_URL } from '../config/media';

// The ClerkTree mark in liquid metal (same shader as the sign-in page), loaded only near the viewport.
const LiquidMetalMark = lazy(() => import('../components/Brand/LiquidMetalMark'));

function LiquidMark() {
  const ref = useRef<HTMLDivElement>(null);
  const [near, setNear] = useState(false);
  const still = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  useEffect(() => {
    const el = ref.current;
    if (!el) return undefined;
    const io = new IntersectionObserver(([entry]) => setNear(entry.isIntersecting), { rootMargin: '200px 0px' });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return (
    <div className="agero-about-mark" ref={ref} aria-hidden="true">
      {near && (
        <Suspense fallback={null}>
          <LiquidMetalMark className="agero-about-mark-canvas" still={still} />
        </Suspense>
      )}
    </div>
  );
}

type TeamMember = {
  name: string;
  image: string;
  description: string;
  objectPosition?: string;
  scale?: string;
  hoverScale?: string;
  linkedin?: string;
};

type Translate = (key: string) => string;

export default function About() {
  const navigate = useNavigate();
  const { t, language } = useLanguage();
  const teamMembers = getTeamMembers(t);
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const triggerRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (selectedMember && dialog && !dialog.open) dialog.showModal();
  }, [selectedMember]);

  const principles = getPrinciples(t);

  return (
    <div className="agero-works" id="agero-works">
      <SEO
        title={t('about.seoTitle')}
        description={t('about.seoDesc')}
        canonical="https://clerktree.com/about"
      />

      <PageHero
        title={<>{t('about.heroLead')} <em>{t('about.heroEmphasis')}</em></>}
        description={t('about.heroDesc')}
        titleId="about-hero-title"
      />

      <main className="agero-about-page">
        <div className="agero-about-story">
        <section className="agero-about-section agero-about-intro">
          <div className="agero-about-intro-grid">
            <LiquidMark />
            <div className="agero-about-grid-head">
              <h2>{t('about.introTitle')}</h2>
              <div className="agero-about-copy">
                <p>{t('about.whyDesc1')}</p>
                <p>{t('about.whyDesc2')}</p>
              </div>
            </div>
          </div>
        </section>

        <section className="agero-about-values" aria-labelledby="about-values-title">
          <h2 id="about-values-title">{language === 'de' ? 'Was uns wichtig ist.' : 'What matters to us.'}</h2>
          <p>{language === 'de' ? 'Klar im Denken. Sorgfältig im Machen.' : 'Clear thinking. Thoughtful work.'}</p>
          <div className="agero-about-principles">
          {principles.map(({ title, copy }) => (
            <article key={title} className="agero-about-card">
              <h3><span aria-hidden="true">✳</span> {title}</h3>
              <p>{copy}</p>
            </article>
          ))}
          </div>
        </section>

        <section className="agero-about-section">
          <div className="agero-about-mission">
            <p>{t('about.missionTitle')}</p>
            <p>{t('about.missionDesc')}</p>
          </div>
        </section>
        </div>

        <section className={`about-team${selectedMember ? ' is-paused' : ''}`} aria-labelledby="about-team-title">
          <div className="about-team-heading">
            <span className="about-team-icon" aria-hidden="true"><UsersRound size={27} strokeWidth={1.7} /></span>
            <h2 id="about-team-title">{t('about.teamHeading')}</h2>
            <p>{t('about.teamIntro')}</p>
          </div>
          <div className="about-team-rows">
            {[teamMembers.slice(0, 4), teamMembers.slice(4)].map((row, rowIndex) => (
              <div className="about-team-viewport" key={rowIndex}>
                <div className={`about-team-track${rowIndex ? ' is-reverse' : ''}`}>
                  {[0, 1].map((copy) => (
                    <div className="about-team-group" key={copy} aria-hidden={copy === 1 || undefined}>
                      {row.map((member) => (
                        <button className="about-team-person" key={member.name} type="button" tabIndex={copy === 1 ? -1 : undefined} onClick={(event) => { triggerRef.current = event.currentTarget; setSelectedMember(member); }}>
                          <span className="about-team-portrait"><img src={member.image} alt="" loading="lazy" decoding="async" style={{ objectPosition: member.objectPosition || 'center', '--team-scale': member.scale || '1' } as CSSProperties} /></span>
                          <span className="about-team-person-copy"><strong>{member.name}</strong><span>{memberRole(member, language)}</span></span>
                        </button>
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        <dialog className="about-team-dialog" ref={dialogRef} aria-labelledby="about-team-dialog-name" aria-describedby="about-team-dialog-bio" onClose={() => { setSelectedMember(null); triggerRef.current?.focus(); }} onClick={(event) => { if (event.target === event.currentTarget) event.currentTarget.close(); }}>
          {selectedMember && <div className="about-team-dialog-inner">
            <button type="button" className="about-team-dialog-close" aria-label={language === 'de' ? 'Schließen' : 'Close'} onClick={() => dialogRef.current?.close()}><X size={20} /></button>
            <div className="about-team-dialog-photo"><img src={selectedMember.image} alt="" style={{ objectPosition: selectedMember.objectPosition || 'center', '--team-scale': selectedMember.scale || '1' } as CSSProperties} /></div>
            <div className="about-team-dialog-copy">
              <span>{memberRole(selectedMember, language)}</span>
              <h2 id="about-team-dialog-name">{selectedMember.name}</h2>
              <p id="about-team-dialog-bio">{selectedMember.description}</p>
              {selectedMember.linkedin && <a href={selectedMember.linkedin} target="_blank" rel="noopener noreferrer">LinkedIn <ArrowUpRight size={15} aria-hidden="true" /></a>}
            </div>
          </div>}
        </dialog>

        <section className="agero-about-section">
          <div className="agero-about-bottom">
            <div className="agero-about-join">
              <h2>{t('about.joinTitle')}</h2>
              <p>{t('about.joinDesc')}</p>
              <div className="agero-about-join-actions">
                <button className="agero-about-join-primary" onClick={() => navigate('/contact')} type="button">
                  {t('about.getInTouch')}
                </button>
                <button className="agero-about-join-secondary" onClick={() => navigate('/careers')} type="button">
                  {t('about.joinTeam')}
                </button>
              </div>
            </div>

            <div className="agero-about-office">
              <p>{t('about.officeTitle')}</p>
              <h3>Straubing, Germany</h3>
              <p>{t('about.officeDesc')}</p>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}



function memberRole(member: TeamMember, language: string) {
  return member.description.match(/\(([^)]+)\)/)?.[1] || (language === 'de' ? 'Entwickler' : 'Engineer');
}

function getPrinciples(t: Translate) {
  return [
    {
      title: t('about.principle.clarityTitle'),
      copy: t('about.principle.clarityCopy'),
    },
    {
      title: t('about.principle.speedTitle'),
      copy: t('about.principle.speedCopy'),
    },
    {
      title: t('about.principle.aiTitle'),
      copy: t('about.principle.aiCopy'),
    },
  ];
}

function getTeamMembers(t: Translate): TeamMember[] {
  return [
    {
      name: 'Animesh Mishra',
      image: `${MEDIA_BASE_URL}/animeshmishra.PNG`,
      description: t('about.team.animesh'),
      objectPosition: 'center top',
      linkedin: 'https://www.linkedin.com/in/animeshmishra0',
    },
    {
      name: 'Kenshin Kiriyama',
      image: `${MEDIA_BASE_URL}/KenshinKiriyama.jpeg`,
      description: t('about.team.kenshin'),
      linkedin: 'https://www.linkedin.com/in/kenshin-kiriyama-2b2031357/',
    },
    {
      name: 'Shobhit Mishra',
      image: `${MEDIA_BASE_URL}/shobhitmishra.jpeg`,
      description: t('about.team.shobhit'),
      objectPosition: 'center top',
      linkedin: 'https://www.linkedin.com/in/shobhit-mishra-8716961bb/',
    },
    {
      name: 'Krishang Sharma',
      image: `${MEDIA_BASE_URL}/krishangfinal.JPG`,
      description: t('about.team.krishang'),
      objectPosition: '55% 5%',
      scale: '1.7',
      hoverScale: '1.82',
      linkedin: 'https://www.linkedin.com/in/krishangsharma118/',
    },
    {
      name: 'Sinem Koc',
      image: `${MEDIA_BASE_URL}/KOC.jpeg`,
      description: t('about.team.sinem'),
      objectPosition: 'center top',
      linkedin: 'https://www.linkedin.com/in/sinem-koc-450174337?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=android_app',
    },
    {
      name: 'Katharina Krüger',
      image: `${MEDIA_BASE_URL}/Katharina.jpeg`,
      description: t('about.team.katharina'),
      objectPosition: 'center top',
      linkedin: 'https://www.linkedin.com/in/katharina-krüger-42220a392/',
    },
    {
      name: 'Aryaman Srivastava',
      image: `${MEDIA_BASE_URL}/aryamansriva.jpeg`,
      description: t('about.team.aryaman'),
      objectPosition: 'center top',
    },
    {
      name: 'Urja Shrestha',
      image: `${MEDIA_BASE_URL}/Urja%20Shrestha.jpeg`,
      description: t('about.team.urja'),
      linkedin: 'https://www.linkedin.com/in/urja-shrestha-a4ba5324a/',
    },
  ];
}
