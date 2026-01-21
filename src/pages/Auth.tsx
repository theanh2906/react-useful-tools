import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, User, Eye, EyeOff, Sparkles, ArrowRight } from 'lucide-react';
import { Button, Input, Card } from '@/components/ui';
import { useAuthStore } from '@/stores/authStore';
import { signInWithEmail, signInWithGoogle, signUpWithEmail } from '@/services/authService';
import { toast } from '@/components/ui/Toast';

export function AuthPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirect = searchParams.get('redirect') || '/';
  
  const { setLoading, isLoading } = useAuthStore();
  
  const [isSignUp, setIsSignUp] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.email || !formData.password) {
      toast.error('Please fill in all fields');
      return;
    }

    setLoading(true);
    
    try {
      if (isSignUp) {
        await signUpWithEmail(formData.email, formData.password);
        toast.success('Account created successfully!');
      } else {
        await signInWithEmail(formData.email, formData.password);
        toast.success('Welcome back!');
      }
      navigate(redirect);
    } catch (error) {
      toast.error((error as Error).message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    setLoading(true);
    signInWithGoogle()
      .then(() => {
        toast.success('Welcome!');
        navigate(redirect);
      })
      .catch((error) => {
        toast.error(error.message || 'Google sign-in failed');
      })
      .finally(() => setLoading(false));
  };

  const handleAzureLogin = () => {
    toast.error('Azure AD is not configured yet.');
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4">
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary-500/20 rounded-full blur-3xl animate-pulse-slow" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-accent-500/15 rounded-full blur-3xl animate-pulse-slow animate-delay-500" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md relative z-10"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-500 to-accent-500 mb-4">
            <Sparkles className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-display font-bold text-white">
            {isSignUp ? 'Create Account' : 'Welcome Back'}
          </h1>
          <p className="text-slate-400 mt-2">
            {isSignUp 
              ? 'Join Useful Tools today' 
              : 'Sign in to access your account'
            }
          </p>
        </div>

        <Card className="p-6 lg:p-8">
          {/* Social Login Buttons */}
          <div className="space-y-3 mb-6">
            <Button 
              variant="secondary" 
              className="w-full justify-center"
              onClick={handleGoogleLogin}
            >
              <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Continue with Google
            </Button>
            
            <Button 
              variant="secondary" 
              className="w-full justify-center"
              onClick={handleAzureLogin}
            >
              <svg className="w-5 h-5 mr-2" viewBox="0 0 23 23">
                <path fill="#f35325" d="M0 0h10.931v10.931H0z"/>
                <path fill="#81bc06" d="M12.069 0H23v10.931H12.069z"/>
                <path fill="#05a6f0" d="M0 12.069h10.931V23H0z"/>
                <path fill="#ffba08" d="M12.069 12.069H23V23H12.069z"/>
              </svg>
              Continue with Microsoft
            </Button>
          </div>

          {/* Divider */}
          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/10" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-slate-900 text-slate-500">or continue with email</span>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {isSignUp && (
              <Input
                label="Full Name"
                placeholder="Enter your name"
                leftIcon={<User className="w-4 h-4" />}
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            )}
            
            <Input
              label="Email"
              type="email"
              placeholder="you@example.com"
              leftIcon={<Mail className="w-4 h-4" />}
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
            
            <Input
              label="Password"
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••••"
              leftIcon={<Lock className="w-4 h-4" />}
              rightIcon={
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              }
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            />

            {!isSignUp && (
              <div className="flex justify-end">
                <button type="button" className="text-sm text-primary-400 hover:text-primary-300">
                  Forgot password?
                </button>
              </div>
            )}

            <Button type="submit" className="w-full" isLoading={isLoading}>
              {isSignUp ? 'Create Account' : 'Sign In'}
              <ArrowRight className="w-4 h-4" />
            </Button>
          </form>

          {/* Toggle Sign Up / Sign In */}
          <p className="text-center text-slate-400 mt-6">
            {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
            <button
              onClick={() => setIsSignUp(!isSignUp)}
              className="text-primary-400 hover:text-primary-300 font-medium"
            >
              {isSignUp ? 'Sign In' : 'Sign Up'}
            </button>
          </p>
        </Card>

        {/* Terms */}
        <p className="text-center text-xs text-slate-500 mt-6">
          By continuing, you agree to our{' '}
          <a href="#" className="text-slate-400 hover:text-white">Terms of Service</a>
          {' '}and{' '}
          <a href="#" className="text-slate-400 hover:text-white">Privacy Policy</a>
        </p>
      </motion.div>
    </div>
  );
}

export default AuthPage;
