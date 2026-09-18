import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ShieldCheck,
  UserCheck,
  LogIn,
  LogOut,
  Mail,
  Lock,
  Leaf,
  CheckCircle2,
  ArrowRight,
  Shield,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { sendPasswordReset } from '../services/firebaseAuth';

export const LoginPage: React.FC = () => {
  const { authMode, authReady, authConfigured, authenticate, logout, userEmail, ecoScore, history } = useApp();
  const [emailInput, setEmailInput] = useState(userEmail);
  const [passwordInput, setPasswordInput] = useState('');
  const [createAccount, setCreateAccount] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [loginSuccessNotice, setLoginSuccessNotice] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setLoginSuccessNotice(null);
    setIsSubmitting(true);
    try {
      await authenticate(emailInput.trim(), passwordInput, createAccount);
      setLoginSuccessNotice(createAccount ? 'Account created securely with Firebase.' : 'Successfully authenticated with Firebase.');
      setTimeout(() => navigate('/classify'), 800);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Authentication failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSwitchToGuest = () => {
    logout();
    setLoginSuccessNotice('Switched to Guest Mode. Zero data storage is now active.');
    setTimeout(() => {
      navigate('/classify');
    }, 1000);
  };

  const handlePasswordReset = async () => {
    setErrorMessage(null);
    if (!emailInput.trim()) {
      setErrorMessage('Enter your email address first.');
      return;
    }
    try {
      await sendPasswordReset(emailInput.trim());
      setLoginSuccessNotice('Password reset instructions sent. Check your email.');
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Could not send password reset email.');
    }
  };

  return (
    <div className="flex-1 bg-[#F8FAF8] text-neutral-800 py-10 px-4 sm:px-6 flex items-center justify-center">
      <div className="max-w-md w-full space-y-6">
        {!authReady ? (
          <div className="bg-white rounded-3xl border border-neutral-200/90 p-7 text-center text-sm text-neutral-500">
            Checking secure session...
          </div>
        ) : !authConfigured ? (
          <div className="bg-amber-50 rounded-2xl border border-amber-200 p-4 text-sm text-amber-900">
            Firebase Authentication is not configured. Add the Firebase web API settings to your `.env` file before signing in.
          </div>
        ) : null}

        {errorMessage && (
          <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold">
            {errorMessage}
          </div>
        )}
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-emerald-100 border border-emerald-300 flex items-center justify-center mx-auto text-emerald-800 shadow-2xs">
            {authMode === 'login' ? <UserCheck className="w-7 h-7" /> : <ShieldCheck className="w-7 h-7" />}
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-neutral-900 tracking-tight">
            {authMode === 'login' ? 'Account Profile' : 'Eco Scan Authentication'}
          </h1>
          <p className="text-xs sm:text-sm text-neutral-500">
            {authMode === 'login'
              ? 'Manage your segregation profile and environmental footprint tracking'
              : 'Choose between consent-based persistence or zero-storage Guest Mode'}
          </p>
        </div>

        {/* Success Notice */}
        {loginSuccessNotice && (
          <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs font-semibold flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{loginSuccessNotice}</span>
          </div>
        )}

        {/* If Logged In: Show Profile Card */}
        {authMode === 'login' ? (
          <div className="bg-white rounded-3xl border border-neutral-200/90 p-6 sm:p-7 shadow-sm space-y-6">
            {/* User Profile Info */}
            <div className="flex items-center gap-4 pb-5 border-b border-neutral-100">
              <div className="w-14 h-14 rounded-2xl bg-[#10B981] text-white font-extrabold text-xl flex items-center justify-center shadow-xs">
                {userEmail ? userEmail[0].toUpperCase() : 'M'}
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                    Active Member
                  </span>
                  <span className="text-[11px] text-neutral-400">• Level 4</span>
                </div>
                <h3 className="text-base font-bold text-neutral-900 truncate mt-0.5">
                  {userEmail}
                </h3>
                <p className="text-[11px] text-neutral-400">
                  Swachh Bharat Citizen Volunteer
                </p>
              </div>
            </div>

            {/* Impact Metric Stats */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3.5 rounded-2xl bg-emerald-50/70 border border-emerald-200/80">
                <div className="flex items-center justify-between text-xs text-emerald-800 font-bold mb-1">
                  <span>EcoScore</span>
                  <Leaf className="w-3.5 h-3.5 text-emerald-600" />
                </div>
                <div className="text-2xl font-black text-emerald-950">
                  {ecoScore}<span className="text-xs font-medium text-emerald-700">/100</span>
                </div>
                <div className="text-[10px] text-emerald-700 mt-0.5">Eco-Champion Grade</div>
              </div>

              <div className="p-3.5 rounded-2xl bg-neutral-50 border border-neutral-200">
                <div className="flex items-center justify-between text-xs text-neutral-700 font-bold mb-1">
                  <span>History</span>
                  <CheckCircle2 className="w-3.5 h-3.5 text-neutral-500" />
                </div>
                <div className="text-2xl font-black text-neutral-900">
                  {history.length}
                </div>
                <div className="text-[10px] text-neutral-500 mt-0.5">Items Segregated</div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-2.5 pt-2">
              <button
                type="button"
                onClick={() => navigate('/classify')}
                className="w-full py-3 rounded-xl bg-[#10B981] hover:bg-emerald-600 text-white font-bold text-sm shadow-md shadow-emerald-600/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Go to Classify Chat</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={handleSwitchToGuest}
                className="w-full py-2.5 rounded-xl border border-neutral-200 hover:bg-neutral-50 text-neutral-700 font-semibold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5 text-neutral-500" />
                <span>Sign Out and Switch to Guest Mode</span>
              </button>
            </div>
          </div>
        ) : (
          /* If in Guest Mode: Show Login Form */
          <div className="bg-white rounded-3xl border border-neutral-200/90 p-6 sm:p-7 shadow-sm space-y-6">
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="email"
                    required
                    value={emailInput}
                    onChange={(e) => setEmailInput(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-neutral-200 bg-neutral-50/50 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1.5">
                  Access Key / Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="password"
                    required
                    value={passwordInput}
                    onChange={(e) => setPasswordInput(e.target.value)}
                    minLength={6}
                    autoComplete={createAccount ? 'new-password' : 'current-password'}
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-neutral-200 bg-neutral-50/50 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                  />
                </div>
              </div>

              <div className="p-3 rounded-xl bg-emerald-50/60 border border-emerald-200/70 text-[11px] text-emerald-950 flex items-start gap-2">
                <Shield className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                <span>
                  Logging in enables persistent classification history and your EcoScore progress indicator.
                </span>
              </div>

              <button
                type="submit"
                disabled={isSubmitting || !authReady || !authConfigured}
                className="w-full py-3 rounded-xl bg-[#10B981] hover:bg-emerald-600 text-white font-bold text-sm shadow-md shadow-emerald-600/25 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <LogIn className="w-4 h-4" />
                <span>{isSubmitting ? 'Authenticating...' : createAccount ? 'Create Secure Account' : 'Sign In to Save History'}</span>
              </button>
            </form>

            {!createAccount && (
              <button type="button" onClick={handlePasswordReset} className="w-full text-xs font-semibold text-emerald-700 hover:text-emerald-900 cursor-pointer">
                Forgot password?
              </button>
            )}

            <button
              type="button"
              onClick={() => { setCreateAccount((current) => !current); setErrorMessage(null); }}
              className="w-full text-xs font-semibold text-neutral-600 hover:text-neutral-900 cursor-pointer"
            >
              {createAccount ? 'Already have an account? Sign in' : 'New to Eco Scan? Create an account'}
            </button>

            <div className="relative flex py-1 items-center">
              <div className="flex-grow border-t border-neutral-200"></div>
              <span className="flex-shrink mx-3 text-[11px] text-neutral-400 uppercase font-medium">Or</span>
              <div className="flex-grow border-t border-neutral-200"></div>
            </div>

            <button
              type="button"
              onClick={() => navigate('/classify')}
              className="w-full py-2.5 rounded-xl border border-neutral-200 hover:bg-neutral-50 text-neutral-700 font-semibold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Continue in Guest Mode (Zero Storage)</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
