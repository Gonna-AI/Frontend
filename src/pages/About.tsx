import type { CSSProperties } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowUpRight, BrainCircuit, CheckCircle2, Clock3, MapPin, Sparkles } from 'lucide-react';

import { useLanguage } from '../contexts/LanguageContext';
import { Header, Footer } from '../components/Landing/AgeroChrome';
import { shouldAutoplayMedia } from '../utils/idle';
import SEO from '../components/SEO';
import './LandingFramer.css';
import './About.css';

const HERO_VIDEO_SRC = 'https://pub-0f804855178c4f4e8184c4fef3bd5b2a.r2.dev/aboutusvideo.mp4';

function HeroBackgroundVideo({ src }: { src: string }) {
  const shouldPlay = shouldAutoplayMedia();

  return (
    <video
      className="agero-hero-stage-media"
      autoPlay={shouldPlay}
      loop
      muted
      playsInline
      preload={shouldPlay ? 'auto' : 'metadata'}
      src={src}
      crossOrigin="anonymous"
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

  const principles = getPrinciples(t);

  return (
    <div className="agero-works" id="agero-works">
      <SEO
        title={t('about.seoTitle')}
        description={t('about.seoDesc')}
        canonical="https://clerktree.com/about"
        preloadVideos={[{ href: HERO_VIDEO_SRC }]}
        videos={[
          {
            name: t('about.heroLead') + ' ' + t('about.heroEmphasis'),
            description: t('about.heroDesc'),
            contentUrl: HERO_VIDEO_SRC,
            thumbnailUrl: 'https://pub-0f804855178c4f4e8184c4fef3bd5b2a.r2.dev/thdbuilding.jpg',
            uploadDate: '2026-07-04',
          },
        ]}
      />

      <div className="agero-top-area agero-top-area-with-hero">
        <Header />

        <section className="agero-hero-stage" aria-labelledby="about-hero-title">
          <HeroBackgroundVideo src={HERO_VIDEO_SRC} />
          <div className="agero-hero-stage-scrim" aria-hidden="true" />
          <div className="agero-hero-stage-content">
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
      image: 'https://pub-0f804855178c4f4e8184c4fef3bd5b2a.r2.dev/animeshmishra.PNG',
      description: t('about.team.animesh'),
      objectPosition: 'center top',
      linkedin: 'https://www.linkedin.com/in/animeshmishra0',
    },
    {
      name: 'Kenshin Kiriyama',
      image: 'https://pub-0f804855178c4f4e8184c4fef3bd5b2a.r2.dev/KenshinKiriyama.jpeg',
      description: t('about.team.kenshin'),
      linkedin: 'https://www.linkedin.com/in/kenshin-kiriyama-2b2031357/',
    },
    {
      name: 'Shobhit Mishra',
      image: 'https://pub-0f804855178c4f4e8184c4fef3bd5b2a.r2.dev/shobhitmishra.jpeg',
      description: t('about.team.shobhit'),
      objectPosition: 'center top',
      linkedin: 'https://www.linkedin.com/in/shobhit-mishra-8716961bb/',
    },
    {
      name: 'Krishang Sharma',
      image: 'https://pub-0f804855178c4f4e8184c4fef3bd5b2a.r2.dev/krishangfinal.JPG',
      description: t('about.team.krishang'),
      objectPosition: '55% 5%',
      scale: '1.7',
      hoverScale: '1.82',
      linkedin: 'https://www.linkedin.com/in/krishangsharma118/',
    },
    {
      name: 'Sinem Koc',
      image: 'https://pub-0f804855178c4f4e8184c4fef3bd5b2a.r2.dev/KOC.jpeg',
      description: t('about.team.sinem'),
      objectPosition: 'center top',
      linkedin: 'https://www.linkedin.com/in/sinem-koc-450174337?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=android_app',
    },
    {
      name: 'Katharina Krüger',
      image: 'https://pub-0f804855178c4f4e8184c4fef3bd5b2a.r2.dev/Katharina.jpeg',
      description: t('about.team.katharina'),
      objectPosition: 'center top',
      linkedin: 'https://www.linkedin.com/in/katharina-krüger-42220a392/',
    },
    {
      name: 'Aryaman Srivastava',
      image: 'https://pub-0f804855178c4f4e8184c4fef3bd5b2a.r2.dev/aryamansriva.jpeg',
      description: t('about.team.aryaman'),
      objectPosition: 'center top',
    },
    {
      name: 'Urja Shrestha',
      image: 'https://pub-0f804855178c4f4e8184c4fef3bd5b2a.r2.dev/Urja%20Shrestha.jpeg',
      description: t('about.team.urja'),
      linkedin: 'https://www.linkedin.com/in/urja-shrestha-a4ba5324a/',
    },
  ];
}
