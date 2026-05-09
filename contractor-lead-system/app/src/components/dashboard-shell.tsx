'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/lib/auth-context';
import {
  LayoutDashboard,
  Inbox,
  Bell,
  BarChart3,
  Menu,
  X,
  LogOut,
  Zap,
  Building2,
  Settings,
  Shield,
  FileText,
  BookOpen,
  PackagePlus,
  BriefcaseBusiness,
  Send,
  CreditCard,
  Rocket,
} from 'lucide-react';

export type AppMode = 'client' | 'admin' | 'outreach';
export type ClientPage = 'overview' | 'leads' | 'alerts' | 'scorecard' | 'billing';
export type AdminPage = 'admin-overview' | 'admin-operations' | 'admin-addons' | 'admin-prospects' | 'admin-sales-playbook' | 'admin-docs' | 'admin-billing' | 'admin-roadmap';
export type OutreachPage = 'outreach-desk';

interface DashboardShellProps {
  mode: AppMode;
  onModeChange: (mode: AppMode) => void;
  activePage: string;
  onNavigate: (page: string) => void;
  children: React.ReactNode;
}

const clientNavItems: { id: ClientPage; label: string; icon: typeof LayoutDashboard }[] = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'leads', label: 'Leads', icon: Inbox },
  { id: 'alerts', label: 'Alerts', icon: Bell },
  { id: 'scorecard', label: 'Scorecard', icon: BarChart3 },
  { id: 'billing', label: 'Billing', icon: CreditCard },
];

const adminNavItems: { id: AdminPage; label: string; icon: typeof LayoutDashboard }[] = [
  { id: 'admin-overview', label: 'Overview', icon: Building2 },
  { id: 'admin-operations', label: 'Operations', icon: Settings },
  { id: 'admin-addons', label: 'Add-Ons', icon: PackagePlus },
  { id: 'admin-prospects', label: 'Prospects', icon: BriefcaseBusiness },
  { id: 'admin-sales-playbook', label: 'Playbook', icon: BookOpen },
  { id: 'admin-billing', label: 'Billing', icon: CreditCard },
  { id: 'admin-docs', label: 'Build Log', icon: FileText },
  { id: 'admin-roadmap', label: 'Roadmap', icon: Rocket },
];

const outreachNavItems: { id: OutreachPage; label: string; icon: typeof LayoutDashboard }[] = [
  { id: 'outreach-desk', label: 'Outreach Desk', icon: Send },
];

export default function DashboardShell({ mode, onModeChange, activePage, onNavigate, children }: DashboardShellProps) {
  const { userName, isDemo, user, signOut } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isAdmin = mode === 'admin';
  const isOutreach = mode === 'outreach';
  const canToggleModes = isDemo || user?.role === 'admin';
  const navItems = isOutreach ? outreachNavItems : isAdmin ? adminNavItems : clientNavItems;

  return (
    <div className={`min-h-dvh flex flex-col ${isAdmin || isOutreach ? 'admin-shell' : ''}`}>
      {/* Background layers */}
      <div className={`tulsa-bg ${isAdmin || isOutreach ? 'tulsa-bg-admin' : ''}`}>
        <div className="tulsa-bg-image" />
        <div className="tulsa-bg-overlay" />
        <div className="tulsa-bg-grain" />
        <div className="tulsa-bg-mesh" />
        <div className="tulsa-bg-vignette" />
      </div>
      <div className={`ambient-glow ${isAdmin || isOutreach ? 'admin-accent-glow' : ''}`} />

      {/* Top navigation */}
      <header className="glass-nav sticky top-0 z-50 px-4 md:px-6">
        <div className="h-14 flex items-center justify-between max-w-[1400px] mx-auto w-full">

          {/* Left: logo + mode toggle */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <div className={`w-7 h-7 rounded-lg flex items-center justify-center border border-white/10 border-t-white/20 ${
                isAdmin
                  ? 'bg-gradient-to-br from-purple-500 via-purple-600 to-blue-500'
                  : isOutreach
                    ? 'bg-gradient-to-br from-cyan-500 via-cyan-600 to-emerald-500'
                    : 'bg-gradient-to-br from-blue-500 via-blue-600 to-cyan-400'
              }`} style={{ boxShadow: `inset 0 1px 0 rgba(255,255,255,0.2), 0 2px 8px ${isAdmin ? 'rgba(139,92,246,0.3)' : isOutreach ? 'rgba(34,211,238,0.3)' : 'rgba(59,130,246,0.3)'}` }}>
                {isAdmin ? <Shield className="w-3.5 h-3.5 text-white drop-shadow-sm" /> : isOutreach ? <Send className="w-3.5 h-3.5 text-white drop-shadow-sm" /> : <Zap className="w-3.5 h-3.5 text-white drop-shadow-sm" />}
              </div>
              <span className="hidden sm:block text-sm font-semibold tracking-tight">
                Vantage
                {isAdmin && <span className="text-purple-400 text-[10px] font-medium ml-1 uppercase tracking-wider">Admin</span>}
                {isOutreach && <span className="text-cyan-300 text-[10px] font-medium ml-1 uppercase tracking-wider">Madison</span>}
              </span>
            </div>

            {canToggleModes && (
              <div className="mode-toggle hidden sm:flex">
                <button
                  onClick={() => onModeChange('client')}
                  className={`mode-toggle-option ${mode === 'client' ? 'mode-toggle-active' : ''}`}
                >
                  Client
                </button>
                <button
                  onClick={() => onModeChange('admin')}
                  className={`mode-toggle-option ${mode === 'admin' ? 'mode-toggle-active mode-admin' : ''}`}
                >
                  Admin
                </button>
                <button
                  onClick={() => onModeChange('outreach')}
                  className={`mode-toggle-option ${mode === 'outreach' ? 'mode-toggle-active mode-admin' : ''}`}
                >
                  Madison
                </button>
              </div>
            )}
          </div>

          {/* Center: page navigation */}
          <nav className="hidden md:flex items-center gap-0.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = activePage === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onNavigate(item.id)}
                  className={`
                    relative px-3.5 py-1.5 rounded-xl text-[13px] font-medium
                    flex items-center gap-1.5 transition-colors duration-150
                    focus-visible:outline-2 focus-visible:outline-blue-500 focus-visible:outline-offset-2
                    ${active
                      ? 'text-white'
                      : 'text-[var(--text-tertiary)] hover:text-[var(--text-secondary)]'
                    }
                  `}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {item.label}
                  {active && (
                    <motion.div
                      layoutId="nav-pill"
                      className={`absolute inset-0 rounded-xl ${
                        isAdmin || isOutreach
                          ? 'bg-purple-500/[0.12] border border-purple-500/[0.18]'
                          : 'bg-white/[0.07] border border-white/[0.09]'
                      }`}
                      style={{ zIndex: -1 }}
                      transition={{ type: 'spring', stiffness: 450, damping: 30 }}
                    />
                  )}
                </button>
              );
            })}
          </nav>

          {/* Right: user info + actions */}
          <div className="flex items-center gap-2.5">
            {isDemo && (
              <span className="hidden sm:inline-flex rounded-full border border-cyan-400/20 bg-cyan-400/10 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-cyan-300">
                Demo
              </span>
            )}
            <span className="text-[13px] text-[var(--text-tertiary)] hidden sm:block">{userName}</span>
            <button
              onClick={signOut}
              className="glass-button p-1.5 hidden md:flex items-center justify-center"
              title="Sign out"
            >
              <LogOut className="w-3.5 h-3.5 text-[var(--text-tertiary)]" />
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="glass-button p-1.5 md:hidden flex items-center justify-center"
            >
              {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.12 }}
            className="md:hidden glass-nav fixed top-14 left-0 right-0 z-40 p-3 border-b border-white/[0.06]"
          >
            <nav className="flex flex-col gap-0.5">
              {canToggleModes && (
                <div className="mode-toggle mb-2">
                  <button
                    onClick={() => onModeChange('client')}
                    className={`mode-toggle-option flex-1 text-center ${mode === 'client' ? 'mode-toggle-active' : ''}`}
                  >
                    Client
                  </button>
                  <button
                    onClick={() => onModeChange('admin')}
                    className={`mode-toggle-option flex-1 text-center ${mode === 'admin' ? 'mode-toggle-active mode-admin' : ''}`}
                  >
                    Admin
                  </button>
                  <button
                    onClick={() => onModeChange('outreach')}
                    className={`mode-toggle-option flex-1 text-center ${mode === 'outreach' ? 'mode-toggle-active mode-admin' : ''}`}
                  >
                    Madison
                  </button>
                </div>
              )}

              {navItems.map((item) => {
                const Icon = item.icon;
                const active = activePage === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      onNavigate(item.id);
                      setMobileMenuOpen(false);
                    }}
                    className={`
                      px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors duration-150
                      flex items-center gap-2.5 text-left
                      ${active
                        ? 'text-white bg-white/[0.07]'
                        : 'text-[var(--text-tertiary)] hover:text-white hover:bg-white/[0.04]'
                      }
                    `}
                  >
                    <Icon className="w-4 h-4" />
                    {item.label}
                  </button>
                );
              })}
              <button
                onClick={signOut}
                className="px-3.5 py-2.5 rounded-xl text-sm font-medium text-[var(--text-tertiary)] hover:text-white hover:bg-white/[0.04] flex items-center gap-2.5 mt-1.5 border-t border-white/[0.06] pt-3"
              >
                <LogOut className="w-4 h-4" />
                Sign out
              </button>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main content */}
      <main className="flex-1 relative z-10 px-4 md:px-6 lg:px-8 py-6 max-w-[1400px] mx-auto w-full">
        {children}
      </main>
    </div>
  );
}
