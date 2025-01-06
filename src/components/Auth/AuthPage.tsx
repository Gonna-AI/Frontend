import React, { useState, useEffect } from 'react';
import { GalleryVerticalEnd } from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import { auth, LoginData, SignupData } from '../../services/auth';

interface AuthFormProps extends React.ComponentPropsWithoutRef<"div"> {
  className?: string;
  onGuestLogin: () => void;
  onSuccess?: () => void;
}

function AuthForm({ className, onGuestLogin, onSuccess, ...props }: AuthFormProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      let response;
      if (isLogin) {
        response = await auth.login({
          email: formData.email,
          password: formData.password
        });
      } else {
        if (formData.password !== formData.confirmPassword) {
          setError('Passwords do not match');
          return;
        }
        response = await auth.signup({
          email: formData.email,
          password: formData.password,
          name: formData.name
        });
      }
      
      // Store auth state
      localStorage.setItem('isAuthenticated', 'true');
      localStorage.setItem('user', JSON.stringify(response.data));
      
      onSuccess?.();
    } catch (error: any) {
      setError(error.response?.data?.error || 'An error occurred');
    }
  };

  const handleGoogleLogin = async () => {
    try {
      const { auth_url } = await auth.googleLogin();
      sessionStorage.setItem('redirectUrl', window.location.pathname);
      window.location.href = auth_url;
    } catch (error) {
      setError('Google login failed');
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.id]: e.target.value
    });
  };

  return (
    <div className="flex flex-col gap-6" {...props}>
      {error && (
        <div className="bg-red-500/10 border border-red-500/50 text-red-400 p-3 rounded-lg text-sm">
          {error}
        </div>
      )}
      <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-xl overflow-hidden">
        <div className="p-6 text-center">
          <h2 className="text-xl font-semibold text-white">
            {isLogin ? 'Welcome back' : 'Create an account'}
          </h2>
          <p className="text-sm text-gray-400 mt-1">
            {isLogin 
              ? 'Login with your Apple or Google account' 
              : 'Sign up to get started with ClerkTree'
            }
          </p>
        </div>
        <div className="p-6">
          <form onSubmit={handleSubmit}>
            <div className="grid gap-6">
              {!isLogin && (
                <div className="grid gap-2">
                  <label htmlFor="name" className="text-sm font-medium text-gray-300">
                    Name
                  </label>
                  <input
                    id="name"
                    type="text"
                    placeholder="John Doe"
                    required
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 bg-gray-800/50 border border-gray-700/50 rounded-lg text-white placeholder-gray-500 focus:ring-2 focus:ring-purple-500/30 focus:border-transparent"
                  />
                </div>
              )}

              <div className="grid gap-2">
                <label htmlFor="email" className="text-sm font-medium text-gray-300">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  placeholder="m@example.com"
                  required
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 bg-gray-800/50 border border-gray-700/50 rounded-lg text-white placeholder-gray-500 focus:ring-2 focus:ring-purple-500/30 focus:border-transparent"
                />
              </div>

              <div className="grid gap-2">
                <div className="flex items-center">
                  <label htmlFor="password" className="text-sm font-medium text-gray-300">
                    Password
                  </label>
                  {isLogin && (
                    <a href="#" className="ml-auto text-sm text-purple-400 hover:text-purple-300">
                      Forgot password?
                    </a>
                  )}
                </div>
                <input
                  id="password"
                  type="password"
                  required
                  value={formData.password}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 bg-gray-800/50 border border-gray-700/50 rounded-lg text-white placeholder-gray-500 focus:ring-2 focus:ring-purple-500/30 focus:border-transparent"
                />
              </div>

              {!isLogin && (
                <div className="grid gap-2">
                  <label htmlFor="confirmPassword" className="text-sm font-medium text-gray-300">
                    Confirm Password
                  </label>
                  <input
                    id="confirmPassword"
                    type="password"
                    required
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 bg-gray-800/50 border border-gray-700/50 rounded-lg text-white placeholder-gray-500 focus:ring-2 focus:ring-purple-500/30 focus:border-transparent"
                  />
                </div>
              )}

              {isLogin && (
                <>
                  <div className="flex flex-col gap-4">
                    <button className="w-full py-2 px-4 bg-gray-800/50 text-white border border-gray-700/50 rounded-lg hover:bg-gray-700/50 transition-colors flex items-center justify-center gap-2">
                      <svg className="w-5 h-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                        <path d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09zM15.53 3.83c.843-1.012 1.4-2.427 1.245-3.83-1.207.052-2.662.805-3.532 1.818-.78.896-1.454 2.338-1.273 3.714 1.338.104 2.715-.688 3.559-1.701" fill="currentColor"/>
                      </svg>
                      Login with Apple
                    </button>
                    <button
                      type="button"
                      onClick={handleGoogleLogin}
                      className="w-full py-2 px-4 bg-gray-800/50 text-white border border-gray-700/50 rounded-lg hover:bg-gray-700/50 transition-colors flex items-center justify-center gap-2"
                    >
                      <svg className="w-5 h-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                        <path d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z" fill="currentColor"/>
                      </svg>
                      Login with Google
                    </button>

                  </div>

                  <div className="relative text-center text-sm">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-gray-700"></div>
                    </div>
                    <span className="relative z-10 bg-[#0a0a0a] px-2 text-gray-400">
                      Or continue with
                    </span>
                  </div>
                </>
              )}

              <button
                type="submit"
                className="w-full py-2 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition-colors"
              >
                {isLogin ? 'Login' : 'Sign Up'}
              </button>
            </div>
          </form>
        </div>
      </div>

      <div className="text-center text-sm text-gray-400">
        {isLogin ? (
          <>
            Don't have an account?{" "}
            <button 
              onClick={() => setIsLogin(false)}
              className="text-purple-400 hover:text-purple-300"
            >
              Sign up
            </button>
          </>
        ) : (
          <>
            Already have an account?{" "}
            <button 
              onClick={() => setIsLogin(true)}
              className="text-purple-400 hover:text-purple-300"
            >
              Login
            </button>
          </>
        )}
      </div>

      <div className="text-center text-xs text-gray-400">
        By clicking continue, you agree to our{" "}
        <Link to="/terms-of-service" className="text-purple-400 hover:text-purple-300">Terms of Service</Link>{" "}
        and{" "}
        <Link to="/privacy-policy" className="text-purple-400 hover:text-purple-300">Privacy Policy</Link>.
      </div>
    </div>
  );
}

interface AuthPageProps {
  setIsSignedIn: (value: boolean) => void;
}

export default function AuthPage({ setIsSignedIn }: AuthPageProps) {
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await auth.checkAuth();
        if (response.isAuthenticated) {
          navigate('/dashboard');
        }
      } catch (error) {
        console.error('Error checking authentication:', error);
      }
    };

    checkAuth();
  }, [navigate]);

  const handleGuestLogin = () => {
    setIsSignedIn(true);
    navigate('/dashboard');
  };

  const handleSuccess = () => {
    setIsSignedIn(true);
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 md:p-10 relative bg-[#0a0a0a]">
      <div 
        className="absolute inset-0 opacity-30"
        style={{
          background: 'radial-gradient(circle at center, rgba(147,51,234,0.5) 0%, rgba(147,51,234,0.2) 40%, transparent 100%)',
          filter: 'blur(40px)',
        }}
      />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="w-full max-w-sm flex flex-col gap-6 relative z-10"
      >
        <a href="/" className="flex items-center gap-2 self-center font-medium text-white">
          <div className="flex h-6 w-6 items-center justify-center rounded-md bg-purple-600">
            <GalleryVerticalEnd className="h-4 w-4" />
          </div>
          ClerkTree
        </a>
        <AuthForm onSuccess={handleSuccess} onGuestLogin={handleGuestLogin} />
      </motion.div>
    </div>
  );
}