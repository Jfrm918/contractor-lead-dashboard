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
} from 'lucide-react';

export type AppMode = 'client' | 'admin';
export type ClientPage = 'overview' | 'leads' | 'alerts' | 'scorecard';
export type AdminPage = 'admin-overview' | 'admin-operations' | 'admin-addons' | 'admin-docs' | 'admin-sales-playbook';

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
];

const adminNavItems: { id: AdminPage; label: string; icon: typeof LayoutDashboard }[] = [
  { id: 'admin-overview', label: 'Overview', icon: Building2 },
  { id: 'admin-operations', label: 'Operations', icon: Settings },
  { id: 'admin-addons', label: 'Add-Ons', icon: PackagePlus },
  { id: 'admin-sales-playbook', label: 'Sales Playbook', icon: BookOpen },
  { id: 'admin-docs', label: 'Build Log', icon: FileText },
];

export default function DashboardShell({ mode, onModeChange, activePage, onNavigate, children }: DashboardShellProps) {
  const { userName, isDemo, signOut } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isAdmin = mode === 'admin';
  const navItems = isAdmin ? adminNavItems : clientNavItems;

  return (
    <div className={`min-h-dvh flex flex-col ${isAdmin ? 'admin-shell' : ''}`}>
      {/* Tulsa background */}
      <div className={`tulsa-bg ${isAdmin ? 'tulsa-bg-admin' : ''}`}>
        <div className="tulsa-bg-image" />
        <div className="tulsa-bg-overlay" />
        <div className="tulsa-bg-grain" />
      </div>
      <div className={`ambient-glow ${isAdmin ? 'admin-accent-glow' : ''}`} />

      {/* Top Nav */}
      <header className="glass-nav sticky top-0 z-50 px-4 md:px-6">
        <div className="h-16 flex items-center justify-between max-w-[1400px] mx-auto w-full">
          <div className="flex items-center gap-4">
            {/* Logo */}
            <div className="flex items-center gap-2.5">
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                isAdmin
                  ? 'bg-gradient-to-br from-purple-500 to-blue-500'
                  : 'bg-gradient-to-br from-blue-500 to-cyan-400'
              }`}>
                {isAdmin ? <Shield className="w-4 h-4 text-white" /> : <Zap className="w-4 h-4 text-white" />}
              </div>
              <div className="hidden sm:block">
                <span className="text-base font-semibold tracking-tight">LeadRecovery Pro</span>
                {isAdmin && <span className="text-[10px] text-purple-400 font-medium ml-1.5 uppercase tracking-wider">Admin</span>}
              </div>
            </div>

            {/* Mode toggle */}
            <div className="mode-toggle hidden sm:flex">
              <button
                onClick={() => onModeChange('client')}
                className={`mode-toggle-option ${!isAdmin ? 'mode-toggle-active' : ''}`}
              >
                Client
              </button>
              <button
                onClick={() => onModeChange('admin')}
                className={`mode-toggle-option ${isAdmin ? 'mode-toggle-active mode-admin' : ''}`}
              >
                Admin
              </button>
            </div>
          </div>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = activePage === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onNavigate(item.id)}
                  className={`
                    relative px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200
                    flex items-center gap-2
                    focus-visible:outline-2 focus-visible:outline-blue-500 focus-visible:outline-offset-2
                    ${active
                      ? isAdmin
                        ? 'text-white bg-purple-500/[0.12] border border-purple-500/[0.2]'
                        : 'text-white bg-white/[0.08] border border-white/[0.1]'
                      : 'text-[#94a3b8] hover:text-white hover:bg-white/[0.04] border border-transparent'
                    }
                  `}
                >
                  <Icon className="w-4 h-4" />
                  {item.label}
                  {active && (
                    <motion.div
                      layoutId="nav-indicator"
                      className={`absolute inset-0 rounded-xl border ${
                        isAdmin
                          ? 'bg-purple-500/[0.08] border-purple-500/[0.15]'
                          : 'bg-white/[0.06] border-white/[0.08]'
                      }`}
                      style={{ zIndex: -1 }}
                      transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                    />
                  )}
                </button>
              );
            })}
          </nav>

          <div className="flex items-center gap-3">
            {isDemo && (
              <span className="hidden sm:inline-flex rounded-full border border-cyan-400/20 bg-cyan-400/10 px-2.5 py-1 text-[10px] font-medium uppercase tracking-wider text-cyan-300">
                Read-only
              </span>
            )}
            <span className="text-sm text-[#94a3b8] hidden sm:block">{userName}</span>
            <button
              onClick={signOut}
              className="glass-button p-2 hidden md:flex items-center justify-center"
              title="Sign out"
            >
              <LogOut className="w-4 h-4 text-[#94a3b8]" />
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="glass-button p-2 md:hidden flex items-center justify-center"
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
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.15 }}
            className="md:hidden glass-nav fixed top-16 left-0 right-0 z-40 p-4 border-b border-white/[0.06]"
          >
            <nav className="flex flex-col gap-1">
              {/* Mobile mode toggle */}
              <div className="mode-toggle mb-3">
                <button
                  onClick={() => { onModeChange('client'); }}
                  className={`mode-toggle-option flex-1 text-center ${!isAdmin ? 'mode-toggle-active' : ''}`}
                >
                  Client
                </button>
                <button
                  onClick={() => { onModeChange('admin'); }}
                  className={`mode-toggle-option flex-1 text-center ${isAdmin ? 'mode-toggle-active mode-admin' : ''}`}
                >
                  Admin
                </button>
              </div>

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
                      px-4 py-3 rounded-xl text-sm font-medium transition-all duration-150
                      flex items-center gap-3 text-left
                      ${active
                        ? 'text-white bg-white/[0.08]'
                        : 'text-[#94a3b8] hover:text-white hover:bg-white/[0.04]'
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
                className="px-4 py-3 rounded-xl text-sm font-medium text-[#94a3b8] hover:text-white hover:bg-white/[0.04] flex items-center gap-3 mt-2 border-t border-white/[0.06] pt-4"
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
