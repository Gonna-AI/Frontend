import type { CSSProperties } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowUpRight, BrainCircuit, CheckCircle2, Clock3, Flower2, MapPin, Sparkles } from 'lucide-react';

import { useLanguage } from '../contexts/LanguageContext';
import SharedHeader from '../components/Layout/SharedHeader';
import Footer from '../components/Landing/Footer';
import SEO from '../components/SEO';

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
    <div className="min-h-screen overflow-x-hidden bg-[#fff3d5] text-[#211f1c]">
      <SEO
        title={t('about.seoTitle')}
        description={t('about.seoDesc')}
        canonical="https://clerktree.com/about"
      />

      <div className="relative z-30">
        <SharedHeader />
      </div>

      <main className="relative z-10 px-3 pb-16 pt-28 sm:px-5 lg:px-7">
        <section
          className="relative min-h-[680px] overflow-hidden rounded-[2.5rem] border border-[#211f1c]/10 bg-[#7e9caf] p-7 text-white shadow-[0_28px_70px_rgba(55,44,28,0.18)] sm:rounded-[3.8rem] sm:p-12 lg:min-h-[760px] lg:p-20"
          aria-labelledby="about-hero-title"
        >
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_74%_36%,rgba(255,217,111,0.78)_0,rgba(255,217,111,0.48)_12%,transparent_31%),radial-gradient(circle_at_18%_12%,rgba(255,255,255,0.72)_0,rgba(255,255,255,0.34)_13%,transparent_34%),linear-gradient(135deg,rgba(16,56,74,0.14),rgba(255,255,255,0.05))]" />
          <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(27,30,29,0.24),rgba(27,30,29,0.04)_56%,rgba(27,30,29,0.08))]" />
          <div className="absolute bottom-[-10%] right-[12%] h-[70%] w-[22%] min-w-40 rounded-t-full bg-[linear-gradient(180deg,rgba(255,219,111,0.9),rgba(80,58,38,0.58))] blur-[1px]" />
          <div className="absolute bottom-[-20%] right-[23%] h-[64%] w-5 rotate-[-8deg] rounded-full bg-[#4f5f42]/70" />
          <div className="absolute right-10 top-10 rounded-full border border-white/40 px-4 py-2 text-xs uppercase tracking-[0.28em] text-white/80">
            {t('about.heroPlaceholder')}
          </div>

          <div className="relative flex min-h-[600px] flex-col justify-between lg:min-h-[620px]">
            <div>
              <p className="mb-10 inline-flex items-center gap-3 text-sm font-semibold uppercase tracking-[0.16em] text-white/80 sm:text-base">
                <span className="inline-flex size-8 items-center justify-center rounded-full bg-[#ffda66]/90 text-[#3a2414]">
                  <Flower2 size={18} />
                </span>
                {t('about.heroEyebrow')}
              </p>

              <h1
                id="about-hero-title"
                className="max-w-6xl text-[clamp(3.2rem,9vw,8.8rem)] font-medium leading-[0.98] tracking-[-0.02em]"
              >
                {t('about.heroLead')}{' '}
                <span className="font-serif italic text-[#ffda66]">{t('about.heroEmphasis')}</span>
              </h1>
            </div>

            <div className="grid gap-8 lg:grid-cols-[minmax(0,0.9fr)_24rem] lg:items-end lg:justify-between">
              <p className="max-w-xl text-xl leading-relaxed text-white/86 sm:text-2xl">
                {t('about.heroDesc')}
              </p>

              <aside className="rounded-[2rem] bg-white p-3 text-[#211f1c] shadow-[0_24px_50px_rgba(23,21,18,0.24)]">
                <div className="px-4 pb-3 pt-1 text-center text-lg font-semibold">
                  {t('about.processCardTitle')}
                </div>
                <div className="min-h-44 rounded-[1.4rem] bg-[linear-gradient(135deg,#fff0ba,#8fb5c7_48%,#2b2c28)] p-4">
                  <div className="flex h-full min-h-40 items-end rounded-[1rem] border border-white/40 bg-white/18 p-4 backdrop-blur-sm">
                    <p className="max-w-[13rem] text-sm font-medium text-white">
                      {t('about.processCardDesc')}
                    </p>
                  </div>
                </div>
              </aside>
            </div>
          </div>
        </section>

        <section className="mx-auto grid max-w-7xl gap-6 py-16 lg:grid-cols-[0.9fr_1.1fr] lg:py-24">
          <div>
            <span className="mb-4 inline-flex rounded-full bg-white px-3 py-1 text-xs font-medium text-[#4e3827] shadow-sm">
              {t('about.introEyebrow')}
            </span>
            <h2 className="max-w-3xl text-[clamp(2.4rem,6vw,5.8rem)] font-medium leading-[0.98] tracking-[-0.03em]">
              {t('about.introTitle')}
            </h2>
          </div>
          <div className="space-y-5 self-end text-lg leading-relaxed text-[#4f453a] sm:text-xl">
            <p>{t('about.whyDesc1')}</p>
            <p>{t('about.whyDesc2')}</p>
          </div>
        </section>

        <section className="mx-auto grid max-w-7xl gap-5 lg:grid-cols-3" aria-label="Operating principles">
          {principles.map(({ icon: Icon, title, copy }) => (
            <article key={title} className="rounded-[2rem] border border-[#211f1c]/8 bg-white/78 p-6 shadow-sm">
              <Icon className="mb-8 text-[#5a321c]" size={26} strokeWidth={1.7} />
              <h3 className="mb-3 text-2xl font-medium">{title}</h3>
              <p className="text-base leading-relaxed text-[#5f554b]">{copy}</p>
            </article>
          ))}
        </section>

        <section className="mx-auto max-w-4xl py-16 lg:py-24">
          <div className="rounded-[2rem] bg-[#211f1c] p-7 text-white shadow-[0_20px_60px_rgba(34,25,18,0.2)] sm:p-10">
            <p className="mb-5 text-xs font-semibold uppercase tracking-[0.24em] text-[#ffda66]">
              {t('about.missionTitle')}
            </p>
            <p className="text-2xl leading-snug text-white/90 sm:text-4xl">
              {t('about.missionDesc')}
            </p>
          </div>
        </section>

        <section className="mx-auto max-w-4xl pb-16">
          <div className="mb-8">
            <span className="mb-4 inline-flex rounded-full bg-white px-3 py-1 text-xs font-medium text-[#4e3827] shadow-sm">
              {t('about.servicesEyebrow')}
            </span>
            <h2 className="text-[clamp(2rem,5vw,3.8rem)] font-medium leading-none tracking-[-0.03em]">
              {t('about.servicesTitle')}
            </h2>
          </div>

          <div className="space-y-5">
            {workCards.map((card) => (
              <article key={card.title} className="rounded-[1.5rem] border border-[#211f1c]/10 bg-white p-3 shadow-sm">
                <div className="p-4 sm:p-5">
                  <h3 className="text-2xl font-medium">{card.title}</h3>
                  <p className="mt-3 max-w-xl text-[#5f554b]">{card.copy}</p>
                  <div className="mt-5 flex flex-wrap gap-2">
                    {card.tags.map((tag) => (
                      <span key={tag} className="rounded-full border border-[#211f1c]/10 bg-[#fff7e4] px-3 py-1 text-xs text-[#51463b]">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
                <div className={`min-h-[260px] rounded-[1.25rem] bg-gradient-to-br ${card.imageClass}`} />
              </article>
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-7xl pb-20">
          <div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <span className="mb-4 inline-flex rounded-full bg-white px-3 py-1 text-xs font-medium text-[#4e3827] shadow-sm">
                {t('about.teamEyebrow')}
              </span>
              <h2 className="text-[clamp(2.3rem,6vw,5rem)] font-medium leading-none tracking-[-0.03em]">
                {t('about.teamHeading')}
              </h2>
            </div>
            <p className="max-w-md text-[#5f554b]">
              {t('about.teamIntro')}
            </p>
          </div>

          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            {teamMembers.map((member) => (
              <article key={member.name} className="group overflow-hidden rounded-[1.7rem] border border-[#211f1c]/10 bg-white p-3 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-[0_18px_38px_rgba(57,42,25,0.12)]">
                <div className="relative aspect-[4/4.8] overflow-hidden rounded-[1.35rem] bg-[#efe2c4]">
                  <img
                    src={member.image}
                    alt={member.name}
                    crossOrigin="anonymous"
                    className="h-full w-full scale-[var(--base-scale)] object-cover transition duration-700 group-hover:scale-[var(--hover-scale)]"
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
                      className="absolute right-3 top-3 inline-flex size-9 items-center justify-center rounded-full bg-white/90 text-[#211f1c] shadow-sm transition hover:bg-[#ffda66]"
                      aria-label={`${member.name}'s LinkedIn`}
                    >
                      <ArrowUpRight size={18} />
                    </a>
                  )}
                </div>
                <div className="p-3">
                  <h3 className="text-xl font-medium">{member.name}</h3>
                  <p className="mt-3 line-clamp-5 text-sm leading-relaxed text-[#5f554b]">
                    {member.description}
                  </p>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="mx-auto grid max-w-7xl gap-5 pb-20 lg:grid-cols-[1fr_0.72fr]">
          <div className="rounded-[2rem] bg-[#ffda66] p-8 sm:p-10">
            <CheckCircle2 className="mb-12 text-[#4e3827]" size={34} strokeWidth={1.6} />
            <h2 className="max-w-3xl text-[clamp(2.2rem,5vw,4.8rem)] font-medium leading-none tracking-[-0.03em]">
              {t('about.joinTitle')}
            </h2>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-[#4e3827]">
              {t('about.joinDesc')}
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <button
                onClick={() => navigate('/contact')}
                className="inline-flex items-center justify-center rounded-full bg-[#211f1c] px-7 py-4 text-sm font-semibold text-white transition hover:bg-black"
              >
                {t('about.getInTouch')}
              </button>
              <button
                onClick={() => navigate('/careers')}
                className="inline-flex items-center justify-center rounded-full border border-[#211f1c]/15 bg-white/55 px-7 py-4 text-sm font-semibold text-[#211f1c] transition hover:bg-white"
              >
                {t('about.joinTeam')}
              </button>
            </div>
          </div>

          <div className="rounded-[2rem] border border-[#211f1c]/10 bg-white/80 p-8 sm:p-10">
            <MapPin className="mb-12 text-[#5a321c]" size={34} strokeWidth={1.6} />
            <p className="mb-4 text-xs font-semibold uppercase tracking-[0.24em] text-[#8f6a29]">
              {t('about.officeTitle')}
            </p>
            <h3 className="text-3xl font-medium">Straubing, Germany</h3>
            <p className="mt-4 text-lg leading-relaxed text-[#5f554b]">
              {t('about.officeDesc')}
            </p>
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
