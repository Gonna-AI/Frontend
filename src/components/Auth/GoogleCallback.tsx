import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function GoogleCallback() {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Get the code from URL parameters
        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get('code');

        if (!code) {
          throw new Error('No code provided');
        }

        // Call the backend callback endpoint with the code
        const response = await axios.get(
          `http://localhost:5000/api/auth/google/callback`,
          { 
            params: { code },
            withCredentials: true 
          }
        );

        if (response.data.message === 'Logged in successfully') {
          // Get the stored redirect URL or default to dashboard
          const redirectUrl = sessionStorage.getItem('redirectUrl') || '/dashboard';
          sessionStorage.removeItem('redirectUrl'); // Clean up
          
          // Update app state to reflect logged in status
          window.dispatchEvent(new CustomEvent('auth-state-changed', { 
            detail: { isAuthenticated: true } 
          }));
          
          navigate(redirectUrl);
        } else {
          throw new Error('Login failed');
        }
      } catch (err) {
        console.error('Google auth error:', err);
        setError('Failed to complete Google authentication');
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
          <div className="text-red-400">{error}</div>
        ) : (
          <div className="text-white">Completing authentication...</div>
        )}
      </div>
    </div>
  );
} 