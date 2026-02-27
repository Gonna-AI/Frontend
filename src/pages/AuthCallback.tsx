import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../config/supabase";

export default function AuthCallback() {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Extract the auth code from the URL (used by PKCE flow and email confirmation)
        const url = new URL(window.location.href);
        const code = url.searchParams.get("code");
        const errorParam = url.searchParams.get("error");
        const errorDescription = url.searchParams.get("error_description");

        // Handle explicit error from Supabase redirect
        if (errorParam) {
          console.error("Auth callback error:", errorParam, errorDescription);
          navigate(
            `/login?message=${encodeURIComponent(errorDescription || "Authentication failed")}`,
            { replace: true },
          );
          return;
        }

        // If there's a code parameter, exchange it for a session (PKCE flow)
        if (code) {
          const { error } = await supabase.auth.exchangeCodeForSession(code);
          if (error) {
            console.error("Code exchange error:", error);
            navigate(`/login?message=${encodeURIComponent(error.message)}`, {
              replace: true,
            });
            return;
          }
          // Successfully exchanged code for session
          navigate("/dashboard", { replace: true });
          return;
        }

        // Fallback: check if there's a hash fragment (implicit flow / legacy)
        // The supabase client with detectSessionInUrl: true handles this automatically
        const hashParams = new URLSearchParams(
          window.location.hash.substring(1),
        );
        const accessToken = hashParams.get("access_token");
        const refreshToken = hashParams.get("refresh_token");

        if (accessToken && refreshToken) {
          const { error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });
          if (error) {
            console.error("Session set error:", error);
            navigate(`/login?message=${encodeURIComponent(error.message)}`, {
              replace: true,
            });
            return;
          }
          navigate("/dashboard", { replace: true });
          return;
        }

        // No code or tokens found — try getting existing session
        const {
          data: { session },
          error: sessionError,
        } = await supabase.auth.getSession();
        if (sessionError) {
          console.error("Session check error:", sessionError);
          navigate("/login", { replace: true });
          return;
        }

        if (session) {
          navigate("/dashboard", { replace: true });
        } else {
          // No session found, redirect to login with a message
          navigate("/login?view=signin&message=Please sign in to continue", {
            replace: true,
          });
        }
      } catch (err) {
        console.error("Auth callback unexpected error:", err);
        setError("An unexpected error occurred. Please try signing in again.");
        // Auto-redirect after 3 seconds
        setTimeout(() => navigate("/login", { replace: true }), 3000);
      }
    };

    handleCallback();
  }, [navigate]);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0A0A0A]">
        <div className="flex flex-col items-center gap-4 max-w-md px-6 text-center">
          <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center">
            <svg
              className="w-6 h-6 text-red-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
          </div>
          <p className="text-red-400 text-sm">{error}</p>
          <p className="text-white/40 text-xs">Redirecting to sign in...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0A0A0A]">
      <div className="flex flex-col items-center gap-4">
        <div className="w-10 h-10 border-2 border-white/20 border-t-white rounded-full animate-spin" />
        <p className="text-white/60 text-sm">Completing sign in...</p>
      </div>
    </div>
  );
}
