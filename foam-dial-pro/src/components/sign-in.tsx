"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useAuth } from "@/lib/auth-context";

export default function SignIn() {
  const { signIn } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [demoLoading, setDemoLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const err = await signIn(email, password);
    if (err) setError(err);
    setLoading(false);
  }

  async function handleDemo() {
    setError(null);
    setDemoLoading(true);
    const err = await signIn("hadrava.business@gmail.com", "foamdial2026");
    if (err) setError(err);
    setDemoLoading(false);
  }

  return (
    <div className="min-h-screen min-h-dvh flex items-center justify-center relative overflow-hidden px-4">
      {/* Background layers */}
      <div className="fd-bg-base" />
      <div className="fd-bg-grain" />
      <div className="fd-bg-mesh" />
      <div className="fd-bg-foam" />
      <div className="fd-bg-glow" />
      <div className="fd-bg-glow-warm" />
      <div className="fd-bg-vignette" />

      <motion.div
        initial={{ opacity: 0, y: 18, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="glass-frosted shimmer-edge p-8 sm:p-10 w-full max-w-[420px] relative z-10"
      >
        {/* Logo */}
        <div className="text-center mb-8 sm:mb-10">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.15, duration: 0.4, ease: [0.34, 1.56, 0.64, 1] }}
            className="inline-flex items-center justify-center w-16 h-16 sm:w-[72px] sm:h-[72px] rounded-2xl mb-4 sm:mb-5"
            style={{
              background: "linear-gradient(135deg, rgba(249,115,22,0.20) 0%, rgba(245,158,11,0.12) 100%)",
              border: "1px solid rgba(249,115,22,0.20)",
              boxShadow: "inset 0 1px 0 rgba(255,255,255,0.08), 0 4px 16px rgba(249,115,22,0.15), 0 0 40px rgba(249,115,22,0.06)",
            }}
          >
            <span className="text-2xl sm:text-[28px] font-bold text-orange tracking-tight">FD</span>
          </motion.div>
          <h1 className="text-2xl sm:text-[28px] font-semibold tracking-wide">
            <span className="bg-gradient-to-r from-white via-white to-orange-light/80 bg-clip-text text-transparent">
              FoamDial
            </span>{" "}
            <span className="text-orange">Pro</span>
          </h1>
          <p className="text-[13px] text-white/30 mt-2 tracking-wide">
            Spray foam intelligence platform
          </p>
        </div>

        {/* Demo button — premium CTA */}
        <button
          onClick={handleDemo}
          disabled={demoLoading || loading}
          className="btn-primary w-full py-4 rounded-2xl text-[15px] font-semibold mb-7 disabled:opacity-50"
        >
          {demoLoading ? (
            <span className="flex items-center justify-center gap-2">
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Loading demo...
            </span>
          ) : (
            "Try Demo"
          )}
        </button>

        {/* Divider */}
        <div className="flex items-center gap-4 mb-6">
          <div className="flex-1 glass-divider" />
          <span className="label-caps text-[10px]">or sign in</span>
          <div className="flex-1 glass-divider" />
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label-caps block mb-2">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input-field"
              placeholder="you@company.com"
              required
            />
          </div>

          <div>
            <label className="label-caps block mb-2">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input-field"
              placeholder="Enter password"
              required
            />
          </div>

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-[13px] text-danger bg-danger-subtle px-4 py-2.5 rounded-xl border border-danger/20"
              style={{ boxShadow: "inset 0 0 12px rgba(248,113,113,0.06)" }}
            >
              {error}
            </motion.div>
          )}

          <button
            type="submit"
            disabled={loading || demoLoading}
            className="btn-glass w-full py-3 rounded-2xl text-[13px] font-medium disabled:opacity-50"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-3.5 h-3.5 border-2 border-white/20 border-t-white/60 rounded-full animate-spin" />
                Signing in...
              </span>
            ) : (
              "Sign In"
            )}
          </button>
        </form>
      </motion.div>
    </div>
  );
}
