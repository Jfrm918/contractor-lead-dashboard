'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/lib/auth-context';
import { Zap, Eye, EyeOff, Loader2 } from 'lucide-react';

export default function SignIn() {
  const { signIn, signInDemo } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;

    setError(null);
    setLoading(true);
    try {
      const err = await signIn(email, password);
      if (err) {
        setError(err);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-dvh flex items-center justify-center px-4 relative overflow-hidden">
      {/* Background */}
      <div className="tulsa-bg">
        <div className="tulsa-bg-image" />
        <div className="tulsa-bg-overlay" />
        <div className="tulsa-bg-grain" />
      </div>
      <div className="ambient-glow" />

      <motion.div
        initial={{ opacity: 0, y: 18, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="glass-frosted shimmer-edge w-full max-w-sm p-7 md:p-9 relative z-10"
      >
        {/* Brand */}
        <div className="flex flex-col items-center mb-7">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.15, duration: 0.4, ease: [0.34, 1.56, 0.64, 1] }}
            className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 via-blue-600 to-cyan-400 flex items-center justify-center mb-4 shadow-lg shadow-blue-500/25 border border-blue-400/20 border-t-blue-300/30"
            style={{ boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.2), 0 4px 16px rgba(59,130,246,0.3), 0 0 40px rgba(59,130,246,0.1)' }}
          >
            <Zap className="w-7 h-7 text-white drop-shadow-sm" />
          </motion.div>
          <h1 className="text-xl font-semibold tracking-tight">Vantage</h1>
          <p className="text-[13px] text-[var(--text-tertiary)] mt-1">Contractor Lead Dashboard</p>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-4 px-3.5 py-2.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div>
            <label htmlFor="email" className="label-caps block mb-1.5 ml-0.5">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white text-sm placeholder:text-[var(--text-faint)] focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/25 transition-all"
              placeholder="you@company.com"
              disabled={loading}
            />
          </div>
          <div>
            <label htmlFor="password" className="label-caps block mb-1.5 ml-0.5">
              Password
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white text-sm placeholder:text-[var(--text-faint)] focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/25 transition-all pr-10"
                placeholder="Enter password"
                disabled={loading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-faint)] hover:text-[var(--text-secondary)] transition-colors"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={!email || !password || loading}
            className="btn-primary w-full py-2.5 text-sm font-medium mt-1 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Signing in...
              </>
            ) : (
              'Sign In'
            )}
          </button>
        </form>

        <div className="relative my-5">
          <div className="glass-divider" />
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="px-3 text-[11px] text-[var(--text-faint)] bg-transparent backdrop-blur-sm">or</span>
          </div>
        </div>

        <button
          onClick={signInDemo}
          disabled={loading}
          className="glass-button w-full py-2.5 text-sm font-medium text-[var(--text-secondary)] hover:text-white"
        >
          Use Demo Account
        </button>
      </motion.div>
    </div>
  );
}
