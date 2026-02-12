import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Loader2, Eye, EyeOff, MapPin } from 'lucide-react';
import { toast } from 'sonner';

// Dark runner background image
const RUNNER_BG = 'https://customer-assets.emergentagent.com/job_area-claim/artifacts/d510rufc_WhatsApp%20Image%202026-02-12%20at%2010.24.33%20PM.jpeg';

const LoginPage = () => {
  const navigate = useNavigate();
  const { login, signup } = useAuth();
  
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [activeTab, setActiveTab] = useState('signin'); // 'signin' or 'signup'
  
  // Login form state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  
  // Signup form state
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const result = await login(loginEmail, loginPassword);
      toast.success('Welcome back!');
      
      if (result.hasCompletedSetup) {
        navigate('/map');
      } else {
        navigate('/setup');
      }
    } catch (error) {
      toast.error(error.message || 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    
    if (signupPassword !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    
    setIsLoading(true);
    
    try {
      await signup(signupEmail, signupPassword);
      toast.success('Account created successfully!');
      navigate('/setup');
    } catch (error) {
      toast.error(error.message || 'Signup failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Full-screen Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ 
          backgroundImage: `url(${RUNNER_BG})`,
        }}
      />
      
      {/* Dark overlay gradient */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/60 to-black/40" />
      
      {/* Content */}
      <div className="relative z-10 min-h-screen flex flex-col">
        {/* Top Section - Branding */}
        <div className="flex-1 flex flex-col items-center justify-center px-6 pt-16 pb-8">
          <div className="text-center animate-fade-in">
            <h1 className="text-5xl sm:text-6xl font-heading font-black text-white tracking-tight italic uppercase">
              CAPTURE
            </h1>
            <p className="text-white/80 mt-3 flex items-center justify-center gap-2 text-lg">
              <MapPin className="w-5 h-5" />
              Claim Your Territory
            </p>
          </div>
        </div>

        {/* Bottom Section - Auth Form */}
        <div className="bg-black/40 backdrop-blur-xl rounded-t-[2.5rem] px-6 pt-8 pb-10 animate-slide-up">
          {/* Title */}
          <h2 className="text-3xl sm:text-4xl font-heading font-black text-white text-center mb-8 italic uppercase tracking-wide">
            {activeTab === 'signin' ? 'Sign In' : 'Sign Up'}
          </h2>

          {activeTab === 'signin' ? (
            /* Sign In Form */
            <form onSubmit={handleLogin} className="space-y-4 max-w-md mx-auto">
              <div>
                <Input
                  id="login-email"
                  type="email"
                  placeholder="you@example.com"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  required
                  className="h-14 bg-white border-0 text-black placeholder:text-gray-500 rounded-xl text-base font-medium"
                />
              </div>
              
              <div className="relative">
                <Input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Password"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  required
                  className="h-14 bg-white border-0 text-black placeholder:text-gray-500 rounded-xl text-base font-medium pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full h-14 bg-black text-white hover:bg-gray-900 font-bold text-lg rounded-xl uppercase tracking-wide"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  'Sign In'
                )}
              </Button>

              <p className="text-center text-white/80 mt-6">
                Don't have an account?{' '}
                <button
                  type="button"
                  onClick={() => setActiveTab('signup')}
                  className="text-white font-semibold underline underline-offset-2 hover:text-white/90"
                >
                  Sign up
                </button>
              </p>
            </form>
          ) : (
            /* Sign Up Form */
            <form onSubmit={handleSignup} className="space-y-4 max-w-md mx-auto">
              <div>
                <Input
                  id="signup-email"
                  type="email"
                  placeholder="you@example.com"
                  value={signupEmail}
                  onChange={(e) => setSignupEmail(e.target.value)}
                  required
                  className="h-14 bg-white border-0 text-black placeholder:text-gray-500 rounded-xl text-base font-medium"
                />
              </div>
              
              <div className="relative">
                <Input
                  id="signup-password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Password"
                  value={signupPassword}
                  onChange={(e) => setSignupPassword(e.target.value)}
                  required
                  minLength={6}
                  className="h-14 bg-white border-0 text-black placeholder:text-gray-500 rounded-xl text-base font-medium pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              
              <div>
                <Input
                  id="confirm-password"
                  type="password"
                  placeholder="Confirm Password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className="h-14 bg-white border-0 text-black placeholder:text-gray-500 rounded-xl text-base font-medium"
                />
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full h-14 bg-white text-black hover:bg-gray-100 font-bold text-lg rounded-xl uppercase tracking-wide"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin text-black" />
                    Creating account...
                  </>
                ) : (
                  'Sign Up'
                )}
              </Button>

              <p className="text-center text-white/80 mt-6">
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={() => setActiveTab('signin')}
                  className="text-white font-semibold underline underline-offset-2 hover:text-white/90"
                >
                  Sign in
                </button>
              </p>
            </form>
          )}

          {/* Footer */}
          <p className="text-sm text-white/60 mt-8 text-center">
            By continuing, you agree to our Terms of Service
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
