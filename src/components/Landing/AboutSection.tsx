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

          <div className="relative z-10 mx-auto max-w-5xl text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#FF8A5B] sm:text-sm">
              {t('about.future')}
            </p>
            <h2 className="mt-6 text-balance text-4xl font-semibold tracking-[-0.04em] text-white sm:text-6xl md:text-7xl lg:text-[5.25rem] lg:leading-[0.98]">
              {t('about.opsIntel')}
            </h2>
          </div>
        </div>
      </div>
    </div>
  );
}
