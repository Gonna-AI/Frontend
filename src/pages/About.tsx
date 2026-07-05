import type { CSSProperties } from 'react';
import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowUpRight, BrainCircuit, CheckCircle2, Clock3, MapPin, Sparkles } from 'lucide-react';

import { useLanguage } from '../contexts/LanguageContext';
import { Header, Footer } from '../components/Landing/AgeroChrome';
import { isSaveDataEnabled } from '../utils/idle';
import SEO from '../components/SEO';
import './LandingFramer.css';
import './About.css';

const HERO_VIDEO_SRC = 'https://xlzwfkgurrrspcdyqele.supabase.co/storage/v1/object/public/buck/aboutusvideo.mp4';

function HeroBackgroundVideo({ src }: { src: string }) {
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
      className="agero-hero-stage-media"
      autoPlay={shouldLoad}
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
  const { t } = useLanguage();
  const teamMembers = getTeamMembers(t);
  const workCards = getWorkCards(t);
  const principles = getPrinciples(t);

  return (
    <div className="agero-works" id="agero-works">
      <SEO
        title={t('about.seoTitle')}
        description={t('about.seoDesc')}
        canonical="https://clerktree.com/about"
      />

      <div className="agero-top-area agero-top-area-with-hero">
        <Header />

        <section className="agero-hero-stage" aria-labelledby="about-hero-title">
          <HeroBackgroundVideo src={HERO_VIDEO_SRC} />
          <div className="agero-hero-stage-scrim" aria-hidden="true" />
          <div className="agero-hero-stage-content">
            <p className="agero-about-eyebrow">
              <span className="agero-about-eyebrow-icon">
                <Sparkles size={16} />
              </span>
              {t('about.heroEyebrow')}
            </p>

            <h1 id="about-hero-title">
              {t('about.heroLead')} <em>{t('about.heroEmphasis')}</em>
            </h1>

            <p>{t('about.heroDesc')}</p>
          </div>
        </section>
      </div>

      <main className="agero-about-page">
        <section className="agero-about-section">
          <div className="agero-about-grid-head">
            <h2>{t('about.introTitle')}</h2>
            <div className="agero-about-copy">
              <p>{t('about.whyDesc1')}</p>
              <p>{t('about.whyDesc2')}</p>
            </div>
          </div>
        </section>

        <section className="agero-about-principles" aria-label="Operating principles">
          {principles.map(({ icon: Icon, title, copy }) => (
            <article key={title} className="agero-about-card">
              <span className="agero-about-card-icon">
                <Icon size={22} strokeWidth={1.7} />
              </span>
              <h3>{title}</h3>
              <p>{copy}</p>
            </article>
          ))}
        </section>

        <section className="agero-about-section">
          <div className="agero-about-mission">
            <p>{t('about.missionTitle')}</p>
            <p>{t('about.missionDesc')}</p>
          </div>
        </section>

        <section className="agero-about-section">
          <div className="agero-about-services">
            {workCards.map((card) => (
              <article key={card.title} className="agero-about-service-card">
                <div className="agero-about-service-body">
                  <h3>{card.title}</h3>
                  <p>{card.copy}</p>
                  <div className="agero-about-tags">
                    {card.tags.map((tag) => (
                      <span key={tag} className="agero-about-tag">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
                <div className={`agero-about-service-media bg-gradient-to-br ${card.imageClass}`} />
              </article>
            ))}
          </div>
        </section>

        <section className="agero-about-section">
          <div className="agero-about-team-head">
            <h2>{t('about.teamHeading')}</h2>
            <p>{t('about.teamIntro')}</p>
          </div>

          <div className="agero-about-team-grid">
            {teamMembers.map((member) => (
              <article key={member.name} className="agero-about-team-card">
                <div className="agero-about-team-photo">
                  <img
                    src={member.image}
                    alt={member.name}
                    crossOrigin="anonymous"
                    style={{
                      objectPosition: member.objectPosition || 'center',
                      '--base-scale': member.scale || '1',
                      '--hover-scale': member.hoverScale || '1.06',
                    } as CSSProperties}
                  />
                  {member.linkedin && (
                    <a
                      href={member.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="agero-about-team-linkedin"
                      aria-label={`${member.name}'s LinkedIn`}
                    >
                      <ArrowUpRight size={16} />
                    </a>
                  )}
                </div>
                <div className="agero-about-team-copy">
                  <h3>{member.name}</h3>
                  <p>{member.description}</p>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="agero-about-section">
          <div className="agero-about-bottom">
            <div className="agero-about-join">
              <CheckCircle2 size={30} strokeWidth={1.6} />
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
              <MapPin size={30} strokeWidth={1.6} />
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

function getWorkCards(t: Translate) {
  return [
    {
      title: t('about.service.workflowTitle'),
      copy: t('about.service.workflowCopy'),
      tags: [
        t('about.service.workflowTag1'),
        t('about.service.workflowTag2'),
        t('about.service.workflowTag3'),
        t('about.service.workflowTag4'),
        t('about.service.more'),
      ],
      imageClass: 'from-[#f8d989] via-[#cfd8c8] to-[#6d8fa0]',
    },
    {
      title: t('about.service.aiTitle'),
      copy: t('about.service.aiCopy'),
      tags: [
        t('about.service.aiTag1'),
        t('about.service.aiTag2'),
        t('about.service.aiTag3'),
        t('about.service.aiTag4'),
        t('about.service.more'),
      ],
      imageClass: 'from-[#dceef7] via-[#b8d2a0] to-[#f8f4dd]',
    },
    {
      title: t('about.service.opsTitle'),
      copy: t('about.service.opsCopy'),
      tags: [
        t('about.service.opsTag1'),
        t('about.service.opsTag2'),
        t('about.service.opsTag3'),
        t('about.service.opsTag4'),
        t('about.service.more'),
      ],
      imageClass: 'from-[#c8d5eb] via-[#f0b6a0] to-[#221815]',
    },
  ];
}

function getPrinciples(t: Translate) {
  return [
    {
      icon: Sparkles,
      title: t('about.principle.clarityTitle'),
      copy: t('about.principle.clarityCopy'),
    },
    {
      icon: Clock3,
      title: t('about.principle.speedTitle'),
      copy: t('about.principle.speedCopy'),
    },
    {
      icon: BrainCircuit,
      title: t('about.principle.aiTitle'),
      copy: t('about.principle.aiCopy'),
    },
  ];
}

function getTeamMembers(t: Translate): TeamMember[] {
  return [
    {
      name: 'Animesh Mishra',
      image: 'https://xlzwfkgurrrspcdyqele.supabase.co/storage/v1/object/public/buck/animeshmishra.PNG',
      description: t('about.team.animesh'),
      objectPosition: 'center top',
      linkedin: 'https://www.linkedin.com/in/animeshmishra0',
    },
    {
      name: 'Kenshin Kiriyama',
      image: 'https://xlzwfkgurrrspcdyqele.supabase.co/storage/v1/object/public/buck/KenshinKiriyama.jpeg',
      description: t('about.team.kenshin'),
      linkedin: 'https://www.linkedin.com/in/kenshin-kiriyama-2b2031357/',
    },
    {
      name: 'Shobhit Mishra',
      image: 'https://xlzwfkgurrrspcdyqele.supabase.co/storage/v1/object/public/buck/shobhitmishra.jpeg',
      description: t('about.team.shobhit'),
      objectPosition: 'center top',
      linkedin: 'https://www.linkedin.com/in/shobhit-mishra-8716961bb/',
    },
    {
      name: 'Krishang Sharma',
      image: 'https://xlzwfkgurrrspcdyqele.supabase.co/storage/v1/object/public/buck/krishangfinal.JPG',
      description: t('about.team.krishang'),
      objectPosition: '55% 5%',
      scale: '1.7',
      hoverScale: '1.82',
      linkedin: 'https://www.linkedin.com/in/krishangsharma118/',
    },
    {
      name: 'Sinem Koc',
      image: 'https://xlzwfkgurrrspcdyqele.supabase.co/storage/v1/object/public/buck/KOC.jpeg',
      description: t('about.team.sinem'),
      objectPosition: 'center top',
      linkedin: 'https://www.linkedin.com/in/sinem-koc-450174337?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=android_app',
    },
    {
      name: 'Katharina Krüger',
      image: 'https://xlzwfkgurrrspcdyqele.supabase.co/storage/v1/object/public/buck/Katharina.jpeg',
      description: t('about.team.katharina'),
      objectPosition: 'center top',
      linkedin: 'https://www.linkedin.com/in/katharina-krüger-42220a392/',
    },
    {
      name: 'Aryaman Srivastava',
      image: 'https://xlzwfkgurrrspcdyqele.supabase.co/storage/v1/object/public/buck/aryamansriva.jpeg',
      description: t('about.team.aryaman'),
      objectPosition: 'center top',
    },
    {
      name: 'Urja Shrestha',
      image: 'https://xlzwfkgurrrspcdyqele.supabase.co/storage/v1/object/public/buck/Urja%20Shrestha.jpeg',
      description: t('about.team.urja'),
      linkedin: 'https://www.linkedin.com/in/urja-shrestha-a4ba5324a/',
    },
  ];
}
