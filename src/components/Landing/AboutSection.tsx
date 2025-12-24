import { Globe } from '../ui/globe';

import { useLanguage } from '../../contexts/LanguageContext';

export default function AboutSection() {
  const { t } = useLanguage();

  return (
    <div className="relative pt-48 pb-20 px-4 sm:px-6 bg-[rgb(10,10,10)]" style={{ overflow: 'visible' }}>
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-20 relative min-h-[500px] md:min-h-[600px] pt-16" style={{ overflow: 'visible' }}>
          {/* Globe behind text */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none" style={{ overflow: 'visible', top: '50px' }}>
            <div className="relative w-full h-full max-w-4xl mx-auto min-h-[500px] md:min-h-[600px]">
              <div
                className="absolute inset-0 opacity-20"
                style={{
                  transform: 'scale(1.5) translateY(-10%)',
                  transformOrigin: 'center center',
                  maskImage: 'linear-gradient(to bottom, rgba(0,0,0,1) 0%, rgba(0,0,0,1) 45%, rgba(0,0,0,0.7) 52%, rgba(0,0,0,0.3) 62%, rgba(0,0,0,0) 72%)',
                  WebkitMaskImage: 'linear-gradient(to bottom, rgba(0,0,0,1) 0%, rgba(0,0,0,1) 45%, rgba(0,0,0,0.7) 52%, rgba(0,0,0,0.3) 62%, rgba(0,0,0,0) 72%)'
                }}
              >
                <Globe className="w-full h-full" />
              </div>
            </div>
          </div>

          <div className="relative z-10">
            <h2 className="text-5xl md:text-7xl font-bold tracking-tight mb-6">
              <span className="bg-gradient-to-r from-white via-white/95 to-white/90 text-transparent bg-clip-text">
                {t('about.future')}
              </span>
              <br />
              <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-indigo-600 text-transparent bg-clip-text">
                {t('about.opsIntel')}
              </span>
            </h2>
          </div>
        </div>
      </div>
    </div>
  );
}

