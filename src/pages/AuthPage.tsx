// src/pages/AuthPage.tsx
import React, { useState } from 'react';
import { api } from '../services/api';
import { User } from '../types';
import { Button } from '../components/common/Button';
import { Sparkles, Lock, Mail, User as UserIcon, ArrowRight, ShieldCheck, Zap } from 'lucide-react';

interface AuthPageProps {
  onSuccess: (user: User) => void;
}

export const AuthPage: React.FC<AuthPageProps> = ({ onSuccess }) => {
  const [mode, setMode] = useState<'login' | 'register' | 'forgot'>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('alex@taskora.io');
  const [password, setPassword] = useState('password123');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [resetSent, setResetSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (mode === 'login') {
        const res = await api.login(email, password);
        onSuccess(res.user);
      } else if (mode === 'register') {
        if (!name.trim()) throw new Error('Please enter your full name');
        if (password !== confirmPassword) throw new Error('Passwords do not match');
        const res = await api.register(name, email);
        onSuccess(res.user);
      } else if (mode === 'forgot') {
        setResetSent(true);
      }
    } catch (err: any) {
      setError(err.message || 'Authentication failed. Please verify credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemo = async () => {
    setLoading(true);
    try {
      const res = await api.login('alex@taskora.io', 'password123');
      onSuccess(res.user);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#06070a] text-slate-200 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background radial glows */}
      <div className="absolute top-1/4 -left-20 w-96 h-96 bg-[#e5c07b]/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-[#9d7cd8]/5 rounded-full blur-3xl pointer-events-none" />

      {/* Main Auth Card */}
      <div className="relative w-full max-w-md bg-[#0d0f18] border border-[#23283e] rounded-3xl p-8 shadow-2xl shadow-black/90 space-y-6">
        {/* Top glowing accent line */}
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#e5c07b]/70 to-transparent" />

        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex w-12 h-12 rounded-2xl bg-[#151829] border border-[#e5c07b]/30 items-center justify-center text-[#e5c07b] shadow-xl mb-1">
            <Sparkles className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-black tracking-tight text-white">Taskora</h2>
          <p className="text-xs text-slate-400">
            {mode === 'login'
              ? 'Enter your credentials or test with Demo Access'
              : mode === 'register'
              ? 'Create your high-performance workspace account'
              : 'Reset your workspace password'}
          </p>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-rose-950/60 border border-rose-500/30 text-rose-300 text-xs text-center">
            {error}
          </div>
        )}

        {resetSent ? (
          <div className="text-center space-y-4 py-4">
            <div className="w-12 h-12 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center mx-auto">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h4 className="text-base font-semibold text-white">Reset instructions sent</h4>
            <p className="text-xs text-slate-400">
              We've dispatched a password recovery token to <strong>{email}</strong>.
            </p>
            <Button variant="secondary" className="w-full" onClick={() => setMode('login')}>
              Back to Sign In
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'register' && (
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Full Name
                </label>
                <div className="relative">
                  <UserIcon className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                  <input
                    type="text"
                    required
                    placeholder="Alex Vance"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    className="w-full bg-[#121422] border border-[#21263c] focus:border-[#e5c07b] rounded-xl pl-9 pr-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Work Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                <input
                  type="email"
                  required
                  placeholder="alex@taskora.io"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full bg-[#121422] border border-[#21263c] focus:border-[#e5c07b] rounded-xl pl-9 pr-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none"
                />
              </div>
            </div>

            {mode !== 'forgot' && (
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                    Password
                  </label>
                  {mode === 'login' && (
                    <button
                      type="button"
                      onClick={() => setMode('forgot')}
                      className="text-[11px] text-[#e5c07b] hover:underline"
                    >
                      Forgot?
                    </button>
                  )}
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                  <input
                    type="password"
                    required
                    placeholder="••••••••••••"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    className="w-full bg-[#121422] border border-[#21263c] focus:border-[#e5c07b] rounded-xl pl-9 pr-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none"
                  />
                </div>
              </div>
            )}

            {mode === 'register' && (
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                  <input
                    type="password"
                    required
                    placeholder="••••••••••••"
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    className="w-full bg-[#121422] border border-[#21263c] focus:border-[#e5c07b] rounded-xl pl-9 pr-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none"
                  />
                </div>
              </div>
            )}

            {mode === 'login' && (
              <div className="flex items-center justify-between text-xs">
                <label className="flex items-center gap-2 text-slate-400 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={e => setRememberMe(e.target.checked)}
                    className="w-3.5 h-3.5 accent-[#e5c07b] rounded"
                  />
                  <span>Remember session</span>
                </label>
              </div>
            )}

            <Button
              type="submit"
              variant="primary"
              className="w-full py-2.5"
              loading={loading}
              icon={<ArrowRight className="w-4 h-4" />}
            >
              {mode === 'login' ? 'Sign In' : mode === 'register' ? 'Create Account' : 'Send Reset Link'}
            </Button>

            {/* Quick Demo Login Option */}
            {mode === 'login' && (
              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleQuickDemo}
                  disabled={loading}
                  className="w-full py-2.5 px-4 rounded-xl bg-[#161a29] hover:bg-[#1f243a] text-slate-200 border border-[#262c45] text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  <Zap className="w-3.5 h-3.5 text-[#e5c07b]" />
                  <span>One-Click Demo Access (Lead Architect)</span>
                </button>
              </div>
            )}
          </form>
        )}

        {/* Footer switcher */}
        <div className="text-center pt-2 border-t border-white/5 text-xs text-slate-400">
          {mode === 'login' ? (
            <span>
              Don't have an account?{' '}
              <button
                type="button"
                onClick={() => setMode('register')}
                className="text-[#e5c07b] font-semibold hover:underline"
              >
                Sign Up
              </button>
            </span>
          ) : (
            <span>
              Already registered?{' '}
              <button
                type="button"
                onClick={() => setMode('login')}
                className="text-[#e5c07b] font-semibold hover:underline"
              >
                Sign In
              </button>
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
