import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

export default function AuthGoogleCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // The google-oauth-callback edge function handles the token exchange
    // and redirects the browser to /dashboard?tab=settings&google_connected=1
    // or /dashboard?tab=settings&google_error=<reason>.
    // This page is the registered redirect_uri: /auth/google/callback.
    // It will briefly flash before the edge function redirect lands here.

    const googleConnected = searchParams.get('google_connected');
    const googleError = searchParams.get('google_error');

    if (googleConnected) {
      navigate('/dashboard?tab=settings&google_connected=1', { replace: true });
      return;
    }
    if (googleError) {
      setError(decodeURIComponent(googleError));
      setTimeout(
        () => navigate('/dashboard?tab=settings', { replace: true }),
        3000,
      );
      return;
    }

    // No recognised params — redirect to settings anyway
    navigate('/dashboard?tab=settings', { replace: true });
  }, [navigate, searchParams]);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0A0A0A]">
        <div className="flex flex-col items-center gap-3 text-center px-6 max-w-sm">
          <div className="w-10 h-10 rounded-full bg-red-500/10 flex items-center justify-center">
            <svg className="w-5 h-5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className="text-red-400 text-sm">Google connection failed: {error}</p>
          <p className="text-white/40 text-xs">Redirecting back to settings…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0A0A0A]">
      <div className="flex flex-col items-center gap-4">
        <div className="w-10 h-10 border-2 border-white/20 border-t-white rounded-full animate-spin" />
        <p className="text-white/60 text-sm">Connecting Google Workspace…</p>
      </div>
    </div>
  );
}
