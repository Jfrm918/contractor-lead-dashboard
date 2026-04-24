'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/lib/auth-context';
import { Zap, Eye, EyeOff } from 'lucide-react';

export default function SignIn() {
  const { signIn, signInDemo } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email && password) signIn(email, password);
  };

  return (
    <div className="min-h-dvh flex items-center justify-center px-4 relative overflow-hidden">
      {/* Tulsa background — sign-in variant */}
      <div className="tulsa-bg" />
      <div className="ambient-glow" />

      {/* Extra ambient elements */}
      <div className="absolute top-1/4 left-1/3 w-96 h-96 bg-blue-500/[0.03] rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 right-1/3 w-80 h-80 bg-cyan-500/[0.03] rounded-full blur-3xl" />

      <motion.div
        initial={{ opacity: 0, y: 16, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
        className="glass-elevated w-full max-w-md p-8 md:p-10 relative z-10"
      >
        {/* Logo / Brand */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center mb-4 shadow-lg shadow-blue-500/20">
            <Zap className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-2xl font-semibold tracking-tight">LeadRecovery Pro</h1>
          <p className="text-sm text-[#94a3b8] mt-1">Contractor Lead Conversion Dashboard</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-xs font-medium text-[#94a3b8] mb-1.5 ml-1">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white text-sm placeholder:text-[#64748b] focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/25 transition-all"
              placeholder="you@company.com"
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-xs font-medium text-[#94a3b8] mb-1.5 ml-1">
              Password
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white text-sm placeholder:text-[#64748b] focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/25 transition-all pr-11"
                placeholder="Enter password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#64748b] hover:text-[#94a3b8] transition-colors"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={!email || !password}
            className="btn-primary w-full py-3 text-sm font-medium mt-2"
          >
            Sign In
          </button>
        </form>

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-white/[0.06]" />
          </div>
          <div className="relative flex justify-center">
            <span className="px-3 text-xs text-[#64748b] bg-[#0a0d14]/80">or</span>
          </div>
        </div>

        <button
          onClick={signInDemo}
          className="glass-button w-full py-3 text-sm font-medium text-[#94a3b8] hover:text-white"
        >
          Use Demo Account
        </button>
      </motion.div>
    </div>
  );
}
