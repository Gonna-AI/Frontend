import { useNavigate } from 'react-router-dom';

import { useLanguage } from '../contexts/LanguageContext';
import SharedHeader from '../components/Layout/SharedHeader';
import Footer from '../components/Landing/Footer';
import SEO from '../components/SEO';

export default function About() {
  const navigate = useNavigate();
  const { t } = useLanguage();



  return (
    <div className="bg-[rgb(10,10,10)] min-h-screen relative overflow-x-hidden">
      <SEO
        title="About Us"
        description="Learn about ClerkTree's mission to transform legal and claims operations with intelligent automation. Meet our team and see our vision."
        canonical="https://clerktree.com/about"
      />
      {/* Orange/warm theme background accents matching main landing page */}
      <div className="fixed inset-0 bg-[rgb(10,10,10)] z-0 pointer-events-none">
        {/* Core warm light source top-right */}
        <div
          className="absolute top-[-10%] right-[-10%] w-[80%] h-[100%] pointer-events-none"
          style={{
            background: 'radial-gradient(circle at 70% 30%, rgba(255,255,255,0.18) 0%, rgba(255,255,255,0.06) 30%, transparent 60%)',
            filter: 'blur(40px)',
          }}
        />
        {/* Diagonal ray wash */}
        <div
          className="absolute top-0 right-0 w-full h-full pointer-events-none"
          style={{
            background: 'linear-gradient(215deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.015) 40%, transparent 65%)',
          }}
        />
        {/* Subtle orange ambient glow */}
        <div
          className="absolute bottom-0 left-0 translate-y-1/4 -translate-x-1/4 w-72 md:w-[600px] h-72 md:h-[600px] opacity-20"
          style={{
            background: 'radial-gradient(circle, rgba(255,138,91,0.4) 0%, rgba(255,138,91,0.15) 40%, transparent 100%)',
            filter: 'blur(80px)',
          }}
        />
        {/* Grainy noise overlay */}
        <div
          className="absolute inset-0 opacity-[0.06]"
          style={{ backgroundImage: 'url(/noise.webp)', backgroundSize: '35%' }}
        />
        <div className="absolute inset-x-0 top-0 h-36 bg-gradient-to-b from-black/80 via-black/50 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/20 to-black" />
      </div>

      <div className="relative z-20">
        <SharedHeader />
      </div>

      <div className="relative z-10 py-12 px-6 pt-36 md:pt-44">
        <div className="max-w-6xl mx-auto">

          {/* Header */}
          <div className="text-center mb-20">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#FF8A5B] sm:text-sm mb-6">
              {t('about.future')}
            </p>
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight">
              <span className="bg-gradient-to-r from-white via-white/95 to-white/90 text-transparent bg-clip-text">
                {t('about.opsIntel')}
              </span>
            </h1>
          </div>

          {/* Why We Built ClerkTree */}
          <div className="mb-20 flex justify-center">
            <div className="w-full max-w-5xl">
              <h2 className="text-4xl md:text-5xl font-bold text-white tracking-tight mb-12 text-center">{t('about.whyTitle')}</h2>
              <div>
                <p className="text-lg md:text-xl text-white/80 leading-relaxed">
                  {t('about.whyDesc1')}
                </p>
                <p className="text-lg md:text-xl text-white/80 leading-relaxed mt-6">
                  {t('about.whyDesc2')}
                </p>
              </div>
            </div>
          </div>

          {/* Mission */}
          <div className="mb-20 flex justify-center">
            <div className="w-full max-w-5xl">
              <h3 className="text-4xl md:text-5xl font-bold text-white tracking-tight mb-12 text-center">{t('about.missionTitle')}</h3>
              <p className="text-lg md:text-xl text-white/80 leading-relaxed">
                {t('about.missionDesc')}
              </p>
            </div>
          </div>

          {/* Team Section */}
          <div className="mb-32 relative">
            {/* Background elements for modern feel */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-full bg-[#FF8A5B]/5 blur-[120px] -z-10 rounded-full" />

            <div className="text-center mb-16 relative z-10">
              <h2 className="text-4xl md:text-5xl font-bold text-white tracking-tight mb-4">
                Our Team
              </h2>
            </div>

            <div className="flex flex-wrap justify-center gap-10 items-stretch relative z-10">
              {[
                {
                  name: 'Animesh Mishra',
                  image: 'https://xlzwfkgurrrspcdyqele.supabase.co/storage/v1/object/public/buck/animeshmishra.PNG',
                  description: t('about.team.animesh'),
                  objectPosition: 'center top',
                  linkedin: 'https://www.linkedin.com/in/animeshmishra0'
                },
                {
                  name: 'Kenshin Kiriyama',
                  image: 'https://xlzwfkgurrrspcdyqele.supabase.co/storage/v1/object/public/buck/KenshinKiriyama.jpeg',
                  description: t('about.team.kenshin'),
                  linkedin: 'https://www.linkedin.com/in/kenshin-kiriyama-2b2031357/'
                },
                {
                  name: 'Shobhit Mishra',
                  image: 'https://xlzwfkgurrrspcdyqele.supabase.co/storage/v1/object/public/buck/shobhitmishra.jpeg',
                  description: t('about.team.shobhit'),
                  objectPosition: 'center top',
                  linkedin: 'https://www.linkedin.com/in/shobhit-mishra-8716961bb/'
                },

                {

                  name: 'Krishang Sharma',
                  image: 'https://xlzwfkgurrrspcdyqele.supabase.co/storage/v1/object/public/buck/krishangfinal.JPG',
                  description: t('about.team.krishang'),
                  objectPosition: '55% 5%',
                  scale: '1.7',
                  hoverScale: '1.87',
                  linkedin: 'https://www.linkedin.com/in/krishangsharma118/'
                },
                {

                  name: 'Sinem Koc',
                  image: 'https://xlzwfkgurrrspcdyqele.supabase.co/storage/v1/object/public/buck/KOC.jpeg',
                  description: t('about.team.sinem'),
                  objectPosition: 'center top',
                  linkedin: 'https://www.linkedin.com/in/sinem-koc-450174337?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=android_app'
                },
                {
                  name: 'Urja Shrestha',
                  image: 'https://xlzwfkgurrrspcdyqele.supabase.co/storage/v1/object/public/buck/Urja%20Shrestha.jpeg',
                  description: t('about.team.urja'),
                  linkedin: 'https://www.linkedin.com/in/urja-shrestha-a4ba5324a/'
                },
                {
                  name: 'Katharina Krüger',
                  image: 'https://xlzwfkgurrrspcdyqele.supabase.co/storage/v1/object/public/buck/Katharina.jpeg',
                  description: t('about.team.katharina'),
                  objectPosition: 'center top',
                  linkedin: 'https://www.linkedin.com/in/katharina-krüger-42220a392/'
                },
              ].map((member, index) => (
                <div
                  key={index}
                  className="group relative w-full sm:w-[calc(50%-2rem)] lg:w-[calc(33.33%-2rem)] xl:w-[calc(30%-2rem)] min-w-[320px] max-w-md grow rounded-3xl bg-white/5 border border-white/10 hover:border-[#FF8A5B]/30 transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_0_30px_-5px_rgba(255,138,91,0.15)] overflow-hidden flex flex-col"
                >
                  <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#FF8A5B]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                  {/* LinkedIn Icon - Top Right */}
                  {member.linkedin && (
                    <a
                      href={member.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="absolute top-4 right-4 z-20 p-2.5 rounded-full bg-black/40 backdrop-blur-md border border-white/10 text-white/70 hover:text-white hover:bg-[#0077b5] hover:border-[#0077b5] transition-all duration-300 shadow-lg"
                      aria-label={`${member.name}'s LinkedIn`}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                        className="w-5 h-5"
                      >
                        <path d="M20.5 2h-17A1.5 1.5 0 002 3.5v17A1.5 1.5 0 003.5 22h17a1.5 1.5 0 001.5-1.5v-17A1.5 1.5 0 0020.5 2zM8 19H5v-9h3zM6.5 8.25A1.75 1.75 0 118.3 6.5a1.78 1.78 0 01-1.8 1.75zM19 19h-3v-4.74c0-1.42-.6-1.93-1.38-1.93A1.74 1.74 0 0013 14.19a.66.66 0 000 .14V19h-3v-9h2.9v1.3a3.11 3.11 0 012.7-1.4c1.55 0 3.36.86 3.36 3.66z"></path>
                      </svg>
                    </a>
                  )}

                  <div className="p-6 flex flex-col items-center h-full relative z-10">
                    <div className="w-28 h-28 mb-6 rounded-full p-[2px] bg-gradient-to-br from-white/10 to-white/5 group-hover:from-[#FF8A5B]/50 group-hover:to-orange-400/50 transition-all duration-500">
                      <div className="w-full h-full rounded-full overflow-hidden bg-black/50">
                        <img
                          src={member.image}
                          alt={member.name}
                          crossOrigin="anonymous"
                          className="w-full h-full object-cover transition-transform duration-700 scale-[var(--base-scale)] group-hover:scale-[var(--hover-scale)]"
                          style={{
                            objectPosition: member.objectPosition || 'center',
                            '--base-scale': member.scale || '1',
                            '--hover-scale': member.hoverScale || '1.1'
                          } as React.CSSProperties}
                        />
                      </div>
                    </div>

                    <h3 className="text-lg font-bold text-white mb-3 text-center tracking-tight group-hover:text-[#FF8A5B] transition-colors">
                      {member.name}
                    </h3>

                    <div className="flex-grow flex items-start justify-center">
                      {member.description ? (
                        <p className="text-sm text-white/80 text-center leading-relaxed font-medium transition-colors">
                          {member.description}
                        </p>
                      ) : (
                        <div className="w-full h-20 bg-white/5 rounded-lg border border-white/5 animate-pulse"></div>
                      )}
                    </div>

                  </div>
                </div>
              ))}
            </div>
          </div>



          {/* CTA */}
          <div className="text-center py-16 rounded-2xl border border-[#FF8A5B]/20 bg-gradient-to-br from-[#FF8A5B]/5 to-orange-500/5 backdrop-blur-sm">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 bg-gradient-to-r from-[#FF8A5B] to-orange-400 text-transparent bg-clip-text">
              {t('about.joinTitle')}
            </h2>
            <p className="text-white/60 mb-8 max-w-2xl mx-auto">
              {t('about.joinDesc')}
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <button
                onClick={() => navigate('/contact')}
                className="px-8 py-4 rounded-xl bg-[#E5E5E5] hover:bg-white text-black font-semibold transition-all duration-300"
              >
                {t('about.getInTouch')}
              </button>
              <button
                onClick={() => navigate('/careers')}
                className="px-8 py-4 rounded-xl bg-white/5 border-2 border-white/10 text-white font-semibold hover:bg-white/10 hover:border-white/20 transition-all duration-300"
              >
                {t('about.joinTeam')}
              </button>
            </div>
          </div>

          {/* Location Info */}
          <div className="mt-16 text-center">
            <h3 className="text-xl font-semibold text-white/80 mb-2">Our Office</h3>
            <p className="text-white/50">
              Industriestraße 2, 94315 Straubing, Germany
            </p>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
