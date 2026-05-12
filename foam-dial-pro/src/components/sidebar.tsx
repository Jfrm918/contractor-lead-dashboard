"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/lib/auth-context";
import {
  Building2,
  Ruler,
  Calculator,
  Database,
  MessageCircle,
  Wrench,
  Shield,
  Menu,
  X,
  FileText,
  Lightbulb,
  ClipboardCheck,
  ChevronDown,
  User,
  LogOut,
} from "lucide-react";

interface SidebarProps {
  activePage: string;
  onNavigate: (page: string) => void;
}

const navItems = [
  { id: "job-sites-list", label: "Job Sites", icon: Building2 },
  // "Log Job" removed from sidebar nav 2026-05-10 — every job belongs to a
  // site now. The job-logger route + component remain so site-detail
  // "Log work" still routes through it.
  { id: "bf-calculator", label: "BF Calc", icon: Ruler },
  { id: "calculator", label: "Dial-In", icon: Calculator },
  { id: "foam-db", label: "Foam Guides", icon: Database },
  { id: "diagnostics", label: "FoamTech", icon: MessageCircle },
  { id: "gun-reference", label: "Gun Ref", icon: Wrench },
  { id: "eod-report", label: "EOD Report", icon: FileText },
  { id: "patterns", label: "Patterns", icon: Lightbulb },
  { id: "qc-report", label: "QC Report", icon: ClipboardCheck },
];

const adminItems = [
  { id: "admin", label: "Admin", icon: Shield },
];

export default function Sidebar({ activePage, onNavigate }: SidebarProps) {
  const { user, signOut, viewMode, setViewMode, canSwitchView } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const accountRef = useRef<HTMLDivElement>(null);
  // Admin is shown separately on the left — don't include in center nav
  const items = navItems;

  // Close account dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (accountRef.current && !accountRef.current.contains(e.target as Node)) {
        setAccountOpen(false);
      }
    }
    if (accountOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [accountOpen]);

  return (
    <header className="sticky top-0 z-50 glass-nav">
      <div className="max-w-[1400px] mx-auto flex items-center h-14 px-4 lg:px-6">
        {/* ── Left: Admin + Account Dropdown + Logo ── */}
        <div className="flex items-center gap-4 shrink-0" ref={accountRef}>
          {/* Admin button + view toggle — pushed to far left */}
          {user?.role === "admin" && (
            <button
              onClick={() => onNavigate("admin")}
              className={activePage === "admin" ? "nav-tab-active hidden md:flex mr-1" : "nav-tab hidden md:flex mr-1"}
            >
              <Shield className="w-3.5 h-3.5" strokeWidth={activePage === "admin" ? 2 : 1.5} />
              <span className="text-[12px]">Admin</span>
            </button>
          )}
          {canSwitchView && (
            <div
              className="hidden md:inline-flex items-center rounded-lg border border-white/10 bg-white/[0.03] p-0.5"
              title="Switch between owner view (sees cost / margin) and installer view (field crew)"
            >
              <button
                type="button"
                onClick={() => setViewMode("owner")}
                className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors ${
                  viewMode === "owner"
                    ? "bg-orange/15 text-orange-light"
                    : "text-white/50 hover:text-white"
                }`}
              >
                Owner
              </button>
              <button
                type="button"
                onClick={() => setViewMode("installer")}
                className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors ${
                  viewMode === "installer"
                    ? "bg-orange/15 text-orange-light"
                    : "text-white/50 hover:text-white"
                }`}
              >
                Installer
              </button>
            </div>
          )}

          {/* Logo — tap to go to dashboard */}
          <button
            onClick={() => onNavigate("dashboard")}
            className="flex items-center gap-2.5 group"
            title="Dashboard"
          >
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center transition-shadow"
              style={{
                background: "linear-gradient(135deg, #f97316 0%, #fb923c 100%)",
                boxShadow: activePage === "dashboard"
                  ? "0 0 24px rgba(249,115,22,0.45), inset 0 1px 0 rgba(255,255,255,0.15)"
                  : "0 0 16px rgba(249,115,22,0.25), inset 0 1px 0 rgba(255,255,255,0.15)",
              }}
            >
              <span className="text-[13px] font-bold text-white tracking-tight">FD</span>
            </div>
            <span className="text-[15px] font-semibold text-white/90 tracking-wide hidden sm:block">
              FoamDial <span className="text-orange">Pro</span>
            </span>
          </button>

          {/* Account dropdown trigger */}
          <button
            onClick={() => setAccountOpen(!accountOpen)}
            className={`flex items-center justify-center w-7 h-7 rounded-lg border transition-all duration-200 ${
              accountOpen
                ? "bg-orange/10 border-orange/20"
                : "bg-white/[0.03] border-white/[0.06] hover:bg-white/[0.06]"
            }`}
          >
            <ChevronDown
              className={`w-3.5 h-3.5 transition-transform duration-200 ${accountOpen ? "rotate-180 text-orange" : "text-white/35"}`}
              strokeWidth={2}
            />
          </button>

          {/* Account dropdown */}
          <AnimatePresence>
            {accountOpen && (
              <motion.div
                initial={{ opacity: 0, y: -4, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -4, scale: 0.97 }}
                transition={{ duration: 0.15, ease: [0.25, 0.46, 0.45, 0.94] }}
                className="absolute top-[calc(100%+6px)] left-4 w-64 rounded-2xl overflow-hidden border border-white/[0.08] z-50"
                style={{
                  background: "rgba(12, 16, 24, 0.95)",
                  backdropFilter: "blur(40px) saturate(160%)",
                  boxShadow: "0 12px 48px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.04), inset 0 1px 0 rgba(255,255,255,0.06)",
                }}
              >
                {/* User info */}
                <div className="p-4 border-b border-white/[0.06]">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-orange/15 flex items-center justify-center border border-orange/20">
                      <User className="w-5 h-5 text-orange" strokeWidth={1.5} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold text-white truncate">{user?.name}</div>
                      <div className="text-[11px] text-white/30 truncate">{user?.email}</div>
                    </div>
                  </div>
                  {user?.role && (
                    <div className="mt-3 flex items-center gap-2">
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-orange/10 text-orange/80 border border-orange/15 uppercase tracking-wider font-semibold">
                        {user.role}
                      </span>
                    </div>
                  )}
                </div>

                {/* Sign out */}
                <div className="p-2">
                  <button
                    onClick={() => {
                      setAccountOpen(false);
                      signOut();
                    }}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-white/50 hover:text-red-400 hover:bg-red-500/[0.08] transition-all duration-150"
                  >
                    <LogOut className="w-4 h-4" strokeWidth={1.5} />
                    Sign out
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ── Center: Desktop Nav ── */}
        <nav className="hidden md:flex items-center gap-0.5 mx-auto">
          {items.map((item) => {
            const active = activePage === item.id;
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={active ? "nav-tab-active" : "nav-tab"}
              >
                <Icon className="w-4 h-4" strokeWidth={active ? 2 : 1.5} />
                <span className="hidden lg:inline">{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* ── Right: Mobile hamburger ── */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="md:hidden ml-auto p-2 text-white/40 hover:text-white/70 transition-colors"
        >
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* ── Mobile dropdown ── */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="md:hidden glass-nav border-t border-white/[0.04] overflow-hidden"
          >
            <div className="max-w-[1400px] mx-auto px-4 py-3 space-y-1">
              {[...items, ...(user?.role === "admin" ? adminItems : [])].map((item) => {
                const active = activePage === item.id;
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      onNavigate(item.id);
                      setMobileOpen(false);
                    }}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-[14px] font-medium transition-all duration-150 ${
                      active
                        ? "bg-orange/[0.10] text-orange border border-orange/[0.14]"
                        : "text-white/40 hover:text-white/60 hover:bg-white/[0.03]"
                    }`}
                  >
                    <Icon className="w-[18px] h-[18px]" strokeWidth={1.5} />
                    <span>{item.label}</span>
                  </button>
                );
              })}
              <div className="glass-divider my-2" />
              <div className="flex items-center justify-between px-4 py-2">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-white/25" strokeWidth={1.5} />
                  <span className="text-xs text-white/30 truncate">{user?.name}</span>
                </div>
                <button
                  onClick={() => {
                    signOut();
                    setMobileOpen(false);
                  }}
                  className="flex items-center gap-1.5 text-[11px] text-white/25 hover:text-red-400 transition-colors"
                >
                  <LogOut className="w-3.5 h-3.5" strokeWidth={1.5} />
                  Sign out
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
