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
} from 'lucide-react';

type Page = 'overview' | 'leads' | 'alerts' | 'scorecard';

interface DashboardShellProps {
  activePage: Page;
  onNavigate: (page: Page) => void;
  children: React.ReactNode;
}

const navItems: { id: Page; label: string; icon: typeof LayoutDashboard }[] = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'leads', label: 'Leads', icon: Inbox },
  { id: 'alerts', label: 'Alerts', icon: Bell },
  { id: 'scorecard', label: 'Scorecard', icon: BarChart3 },
];

export default function DashboardShell({ activePage, onNavigate, children }: DashboardShellProps) {
  const { userName, signOut } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-dvh flex flex-col">
      <div className="ambient-glow" />

      {/* Top Nav */}
      <header className="glass-nav sticky top-0 z-50 px-4 md:px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center">
              <Zap className="w-4 h-4 text-white" />
            </div>
            <span className="text-base font-semibold tracking-tight hidden sm:block">LeadRecovery Pro</span>
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
                  relative px-4 py-2 rounded-xl text-sm font-medium transition-all duration-150
                  flex items-center gap-2
                  focus-visible:outline-2 focus-visible:outline-blue-500 focus-visible:outline-offset-2
                  ${active
                    ? 'text-white bg-white/[0.08] border border-white/[0.1]'
                    : 'text-[#94a3b8] hover:text-white hover:bg-white/[0.04]'
                  }
                `}
              >
                <Icon className="w-4 h-4" />
                {item.label}
                {active && (
                  <motion.div
                    layoutId="nav-indicator"
                    className="absolute inset-0 rounded-xl bg-white/[0.06] border border-white/[0.08]"
                    style={{ zIndex: -1 }}
                    transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                  />
                )}
              </button>
            );
          })}
        </nav>

        <div className="flex items-center gap-3">
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
