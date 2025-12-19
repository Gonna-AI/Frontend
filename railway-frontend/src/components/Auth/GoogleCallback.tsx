import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function GoogleCallback() {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get('code');
        const error = urlParams.get('error');

        if (error) {
          throw new Error(`Google auth error: ${error}`);
        }

        if (!code) {
          throw new Error('No authorization code received');
        }

        const response = await axios.get(
          `https://backend-sq0u.onrender.com/api/auth/google/callback`,
          { 
            params: { code },
            withCredentials: true 
          }
        );

        if (response.data.isAuthenticated) {
          // Update app state to reflect logged in status
          window.dispatchEvent(new CustomEvent('auth-state-changed', { 
            detail: { isAuthenticated: true } 
          }));
          
          // Get the stored redirect URL or default to dashboard
          const redirectUrl = sessionStorage.getItem('redirectUrl') || '/dashboard';
          sessionStorage.removeItem('redirectUrl'); // Clean up
          navigate(redirectUrl);
        } else {
          throw new Error('Authentication failed');
        }
      } catch (err: any) {
        console.error('Google auth error:', err);
        const errorMessage = err.response?.data?.error || err.message || 'Authentication failed';
        setError(errorMessage);
        // Redirect to login page after a delay if there's an error
        setTimeout(() => navigate('/auth'), 3000);
      }
    };

    handleCallback();
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a]">
      <div className="text-center">
        {error ? (
          <div className="text-red-400">
            <p>Authentication Error</p>
            <p className="text-sm mt-2">{error}</p>
            <p className="text-sm mt-4">Redirecting to login page...</p>
          </div>
        ) : (
          <div className="text-white">Completing authentication...</div>
        )}
      </div>
    </div>
  );
} 