import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button, Input } from '../components/ui/Base';
import { ArrowRight, AlertCircle } from 'lucide-react';

export const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { signInWithEmail, signUpWithEmail, signInWithGoogle } = useAuth();
  const navigate = useNavigate();

  // Map Firebase error codes to user-friendly messages
  const getErrorMessage = (errorCode: string): string => {
    switch (errorCode) {
      case 'auth/user-not-found':
        return 'No account found with this email.';
      case 'auth/wrong-password':
        return 'Incorrect password. Please try again.';
      case 'auth/invalid-credential':
        return 'Invalid email or password.';
      case 'auth/email-already-in-use':
        return 'An account already exists with this email.';
      case 'auth/weak-password':
        return 'Password should be at least 6 characters.';
      case 'auth/invalid-email':
        return 'Please enter a valid email address.';
      case 'auth/too-many-requests':
        return 'Too many failed attempts. Please try again later.';
      case 'auth/popup-closed-by-user':
        return 'Sign-in popup was closed. Please try again.';
      case 'auth/network-request-failed':
        return 'Network error. Please check your connection.';
      default:
        return 'An error occurred. Please try again.';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    if (!isLogin && !name) return;

    setIsLoading(true);
    setError(null);

    try {
      if (isLogin) {
        await signInWithEmail(email, password);
      } else {
        await signUpWithEmail(email, password, name);
      }
      navigate('/');
    } catch (err: unknown) {
      const firebaseError = err as { code?: string };
      setError(getErrorMessage(firebaseError.code || ''));
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    setError(null);

    try {
      await signInWithGoogle();
      navigate('/');
    } catch (err: unknown) {
      const firebaseError = err as { code?: string };
      setError(getErrorMessage(firebaseError.code || ''));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full grid lg:grid-cols-2">
      {/* Left Column - Zen Aesthetic */}
      <div className="relative hidden lg:flex flex-col justify-between p-12 bg-stone-900 text-stone-50 overflow-hidden">
        {/* Abstract pattern */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 opacity-10">
          <svg width="400" height="400" viewBox="0 0 200 200">
            <circle cx="100" cy="100" r="80" stroke="currentColor" strokeWidth="1" fill="none" />
            <circle cx="100" cy="100" r="60" stroke="currentColor" strokeWidth="1" fill="none" />
            <circle cx="100" cy="100" r="40" stroke="currentColor" strokeWidth="1" fill="none" />
          </svg>
        </div>

        <div className="relative z-10">
          <div className="h-10 w-10 bg-white rounded-full flex items-center justify-center mb-6">
            <span className="text-stone-900 text-lg font-bold">Z</span>
          </div>
          <h1 className="text-4xl font-light tracking-tight">ZenFinance</h1>
        </div>

        <div className="relative z-10 max-w-md">
          <blockquote className="text-xl font-light italic opacity-80 mb-4">
            "The art of being wise is the art of knowing what to overlook."
          </blockquote>
          <cite className="not-italic text-sm font-medium tracking-wider uppercase opacity-60">— William James</cite>
        </div>
      </div>

      {/* Right Column - Form */}
      <div className="flex items-center justify-center p-8 bg-stone-50 dark:bg-black text-stone-900 dark:text-stone-100 transition-colors">
        <div className="w-full max-w-sm space-y-8">
          <div className="text-center lg:text-left">
            <div className="h-10 w-10 bg-stone-900 dark:bg-white rounded-full flex items-center justify-center mb-6 lg:hidden mx-auto">
              <span className="text-white dark:text-stone-900 text-lg font-bold">Z</span>
            </div>
            <h2 className="text-2xl font-semibold tracking-tight">
              {isLogin ? 'Welcome back' : 'Create an account'}
            </h2>
            <p className="text-sm text-stone-500 mt-2">
              {isLogin ? 'Enter your credentials to access your dashboard' : 'Start your journey to financial peace'}
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-400 text-sm">
              <AlertCircle size={16} className="flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <Input
                label="Username"
                type="text"
                placeholder="Your Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            )}
            <Input
              label="Email"
              type="email"
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <Input
              label="Password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            <Button type="submit" className="w-full h-12 text-base mt-2" isLoading={isLoading}>
              {isLogin ? 'Sign In' : 'Create Account'}
              {!isLoading && <ArrowRight size={18} className="ml-2" />}
            </Button>
          </form>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-stone-200 dark:border-stone-800" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-stone-50 dark:bg-black px-2 text-stone-500">Or continue with</span>
            </div>
          </div>

          <Button
            type="button"
            variant="outline"
            className="w-full h-12 relative"
            onClick={handleGoogleLogin}
            disabled={isLoading}
          >
            <svg className="mr-2 h-5 w-5" viewBox="0 0 24 24">
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.26z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />
            </svg>
            Google
          </Button>

          <div className="text-center text-sm">
            <span className="text-stone-500">
              {isLogin ? "Don't have an account? " : "Already have an account? "}
            </span>
            <button
              onClick={() => {
                setIsLogin(!isLogin);
                setError(null);
              }}
              className="font-medium underline hover:text-stone-900 dark:hover:text-white transition-colors"
            >
              {isLogin ? 'Sign up' : 'Sign in'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};