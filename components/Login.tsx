
import React, { useState } from 'react';
import { Brain, User, Eye, EyeOff } from 'lucide-react';
import { auth } from '../firebase';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';

interface LoginProps {
  onSignIn: () => void;
}

const Login: React.FC<LoginProps> = ({ onSignIn }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);

  // 🔥 Password visibility toggle
  const [showPassword, setShowPassword] = useState(false);

  const handleAuth = async () => {
    setError('');
    
    if (!email) {
      setError('Please enter a valid email address.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    
    setLoading(true);
    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        await createUserWithEmailAndPassword(auth, email, password);
      }
      onSignIn();
    } catch (err: any) {
      let message = err.message;
      if (err.code === 'auth/invalid-credential' || err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password') {
        message = 'Invalid email or password.';
      } else if (err.code === 'auth/email-already-in-use') {
        message = 'Email is already in use.';
      } else if (err.code === 'auth/invalid-email') {
        message = 'Invalid email address.';
      }
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-page">
      <div className="bg-card w-full max-w-sm rounded-[24px] shadow-sm p-8 flex flex-col items-center animate-in fade-in zoom-in-95 duration-300">
        
        {/* Logo Icon */}
        <div className="w-16 h-16 bg-brand rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-brand/20">
          <Brain className="text-white w-8 h-8" />
        </div>

        <h1 className="text-2xl font-bold text-primary mb-2 transition-all duration-300">
          {isLogin ? 'Welcome Back' : 'Create Account'}
        </h1>
        <p className="text-secondary text-center mb-8 transition-all duration-300">
          {isLogin ? 'Enter your details to sign in.' : 'Enter your details to sign up.'}
        </p>

        <div className="w-full space-y-4">

          {/* Email Input */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <User className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="email"
              placeholder="Email address"
              className="w-full pl-10 pr-4 py-3 rounded-xl border border-border bg-surface text-primary focus:outline-none focus:ring-2 focus:ring-brand/20 transition-all placeholder:text-gray-400"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAuth()}
            />
          </div>

          {/* Password Input */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <div className="h-5 w-5 text-gray-400 font-bold text-xs flex items-center justify-center border-2 border-gray-400 rounded-md">***</div>
            </div>

            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="Password"
              className="w-full pl-10 pr-10 py-3 rounded-xl border border-border bg-surface text-primary focus:outline-none focus:ring-2 focus:ring-brand/20 transition-all placeholder:text-gray-400"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAuth()}
            />

            {/* Clickable toggle button */}
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setShowPassword(prev => !prev);
              }}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-secondary hover:text-brand transition-colors z-20 cursor-pointer"
              tabIndex={-1}
            >
              {showPassword ? (
                <EyeOff className="h-5 w-5" />
              ) : (
                <Eye className="h-5 w-5" />
              )}
            </button>
          </div>

          {/* Error Message */}
          {error && (
            <p className="text-red-500 text-sm text-center animate-pulse">
              {error}
            </p>
          )}

          {isLogin && (
            <div className="flex justify-end w-full">
              <button 
                onClick={() => alert('Reset password flow not implemented.')}
                className="text-sm text-secondary hover:text-brand transition-colors"
              >
                Forgot password?
              </button>
            </div>
          )}

          {/* Action Button */}
          <button
            onClick={handleAuth}
            disabled={loading}
            className="w-full bg-brand text-white font-medium py-3.5 rounded-full shadow-md shadow-brand/20 hover:bg-orange-800 transition-all mt-4 ios-hover-wiggle disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Processing...' : (isLogin ? 'Sign In' : 'Sign Up')} →
          </button>

          {/* Toggle Login/Signup */}
          <div className="mt-6 text-center">
            <p className="text-sm text-secondary">
              {isLogin ? "Don't have an account? " : "Already have an account? "}
              <button 
                onClick={() => {
                  setIsLogin(!isLogin);
                  setError('');
                }}
                className="text-brand font-bold hover:underline transition-all"
              >
                {isLogin ? 'Sign Up' : 'Sign In'}
              </button>
            </p>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Login;
