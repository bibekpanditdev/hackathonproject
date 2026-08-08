import React, { useState, useEffect } from 'react';
import { registerUser, loginUser, loginWithGoogle } from '../../services/firebase';
import { UserProfile } from '../../types';
import { LogIn, UserPlus, Sparkles, UserCheck, Shield, KeyRound, AtSign, Loader2, CheckCircle2, X } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAuthenticated: (userProfile: UserProfile) => void;
}

const PLACEHOLDERS = {
  fullName: 'e.g. Full Name',
  username: 'e.g. username123',
  email: 'testmail@gmail.com',
  password: '••••••••',
};

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onAuthenticated }) => {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Close on Escape key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      if (mode === 'register') {
        if (!username.trim() || !email.trim() || !password.trim() || !fullName.trim()) {
          throw new Error('Please fill out all required fields.');
        }
        const cleanUsername = username.trim().toLowerCase().replace(/[^a-z0-9_]/g, '');
        const profile = await registerUser(email.trim(), password, cleanUsername, fullName.trim());
        setSuccessMsg(`Welcome, ${profile.name}! Account created & synced with Firebase.`);
        setTimeout(() => {
          onAuthenticated(profile);
          onClose();
        }, 400);
      } else if (mode === 'login') {
        if (!email.trim() || !password) {
          throw new Error('Please enter both email and password.');
        }
        const profile = await loginUser(email.trim(), password);
        setSuccessMsg(`Logged in successfully as @${profile.username || profile.name}!`);
        setTimeout(() => {
          onAuthenticated(profile);
          onClose();
        }, 400);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Authentication failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      const profile = await loginWithGoogle();
      onAuthenticated(profile);
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Google sign-in completed with account profile.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 z-[100] overflow-y-auto animate-in fade-in duration-200"
    >
      <div className="bg-white rounded-3xl border-2 border-slate-800 shadow-[6px_6px_0px_0px_#1E293B] p-5 sm:p-7 max-w-md w-full my-auto relative space-y-5 animate-in zoom-in-95 duration-200 max-h-[92vh] overflow-y-auto scrollbar-thin">
        <button
          onClick={onClose}
          type="button"
          aria-label="Close dialog"
          className="absolute top-4 right-4 w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 border-2 border-slate-800 font-extrabold text-slate-800 flex items-center justify-center transition-all cursor-pointer hover:scale-105 active:scale-95"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center space-y-1.5 pt-1">
          <div className="w-12 h-12 rounded-2xl bg-blue-700 border-2 border-slate-800 flex items-center justify-center text-white mx-auto shadow-[2px_2px_0px_0px_#1E293B]">
            <Sparkles className="w-6 h-6 text-amber-300" />
          </div>
          <h2 className="font-black text-2xl text-slate-900">
            {mode === 'login' ? 'Welcome Back' : 'Create EduMind Account'}
          </h2>
          <p className="text-xs text-slate-600 font-semibold max-w-xs mx-auto">
            Sync your level, XP, badges, and step-by-step reasoning progress with Firebase
          </p>
        </div>

        {/* Tab switcher */}
        <div className="flex bg-slate-100 p-1.5 rounded-2xl border-2 border-slate-700 font-extrabold text-xs gap-1.5">
          <button
            type="button"
            onClick={() => {
              setMode('login');
              setErrorMsg('');
            }}
            className={`flex-1 py-2 px-3 rounded-xl transition-all cursor-pointer text-center min-h-[38px] flex items-center justify-center font-black ${
              mode === 'login'
                ? 'bg-blue-700 text-white shadow-xs'
                : 'text-slate-700 hover:text-slate-900 hover:bg-slate-200/80'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('register');
              setErrorMsg('');
            }}
            className={`flex-1 py-2 px-3 rounded-xl transition-all cursor-pointer text-center min-h-[38px] flex items-center justify-center font-black ${
              mode === 'register'
                ? 'bg-blue-700 text-white shadow-xs'
                : 'text-slate-700 hover:text-slate-900 hover:bg-slate-200/80'
            }`}
          >
            Register
          </button>
        </div>

        {errorMsg && (
          <div className="p-3.5 bg-rose-50 border-2 border-rose-300 text-rose-900 rounded-xl text-xs font-bold leading-relaxed">
            ⚠️ {errorMsg}
          </div>
        )}

        {successMsg && (
          <div className="p-3.5 bg-emerald-50 border-2 border-emerald-300 text-emerald-900 rounded-xl text-xs font-bold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
            {successMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5">
          {mode === 'register' && (
            <>
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">Full Name</label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    placeholder={PLACEHOLDERS.fullName}
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full p-3 pl-10 rounded-xl border-2 border-slate-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 text-xs font-semibold text-slate-900 outline-none transition-all"
                  />
                  <UserCheck className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5 pointer-events-none" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">User Handle / Username</label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    placeholder={PLACEHOLDERS.username}
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full p-3 pl-10 rounded-xl border-2 border-slate-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 text-xs font-semibold text-slate-900 outline-none transition-all"
                  />
                  <AtSign className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5 pointer-events-none" />
                </div>
              </div>
            </>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1">Email Address</label>
            <div className="relative">
              <input
                type="email"
                required
                placeholder={PLACEHOLDERS.email}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-3 pl-10 rounded-xl border-2 border-slate-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 text-xs font-semibold text-slate-900 outline-none transition-all"
              />
              <KeyRound className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5 pointer-events-none" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1">Password</label>
            <div className="relative">
              <input
                type="password"
                required
                placeholder={PLACEHOLDERS.password}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-3 pl-10 rounded-xl border-2 border-slate-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 text-xs font-semibold text-slate-900 outline-none transition-all"
              />
              <Shield className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5 pointer-events-none" />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full btn-sketch-primary py-3.5 text-sm flex items-center justify-center gap-2 cursor-pointer shadow-md min-h-[44px]"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : mode === 'login' ? (
              <>
                <LogIn className="w-4 h-4" /> Sign In to EduMind
              </>
            ) : (
              <>
                <UserPlus className="w-4 h-4" /> Register New Account
              </>
            )}
          </button>
        </form>

        <div className="space-y-3 pt-2 border-t-2 border-slate-200">
          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full py-3 px-4 rounded-xl border-2 border-slate-300 hover:border-slate-800 font-extrabold text-xs text-slate-800 hover:bg-slate-50 transition-all flex items-center justify-center gap-2 cursor-pointer min-h-[44px]"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            Sign in with Google
          </button>
        </div>
      </div>
    </div>
  );
};