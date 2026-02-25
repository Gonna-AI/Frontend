import React, { useMemo } from 'react';
import { ArrowLeft } from 'lucide-react';
import { sanitizeTrustedHtml } from '../../utils/sanitizeHtml';
import termsHtml from '../../terms&conditions/t&c.html?raw';

const TermsOfService = () => {
  const sanitizedTermsHtml = useMemo(() => sanitizeTrustedHtml(termsHtml), []);

  const cn = (...classes: (string | undefined | null | false)[]) => {
    return classes.filter(Boolean).join(' ');
  };

  const GlassContainer = ({ children, className }: { children: React.ReactNode, className?: string }) => (
    <div className={cn(
      "relative overflow-hidden",
      "rounded-xl p-6",
      "bg-white/60 border border-black/5",
      "transition-all duration-200",
      className
    )}>
      {children}
    </div>
  );

  return (
    <div className="min-h-screen w-full overflow-hidden bg-gradient-to-br from-white to-purple-50">
      {/* Background Gradients */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 bg-purple-400/40 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-pink-400/40 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-400/40 rounded-full blur-3xl" />
      </div>

      {/* Main Content */}
      <div className={cn(
        "relative min-h-screen p-4 md:p-6 backdrop-blur-sm transition-colors duration-300",
        "bg-white/50"
      )}>
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Header Controls */}
          <div className="flex items-center justify-between">
            <button
              onClick={() => window.history.back()}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-xl transition-all duration-200",
                "bg-white/60 hover:bg-white/70 text-black border border-black/5"
              )}
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </button>
          </div>

          {/* Main Card */}
          <GlassContainer>
            <div
              className={cn(
                "prose max-w-none",
              )}
              dangerouslySetInnerHTML={{ __html: sanitizedTermsHtml }}
            />
          </GlassContainer>
        </div>
      </div>
    </div>
  );
};

export default TermsOfService;
