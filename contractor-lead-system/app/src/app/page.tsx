'use client';

import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '@/lib/auth-context';
import SignIn from '@/components/sign-in';
import DashboardShell, { type AppMode } from '@/components/dashboard-shell';
import OverviewPage from '@/components/overview-page';
import LeadsPage from '@/components/leads-page';
import LeadDetail from '@/components/lead-detail';
import AlertsPage from '@/components/alerts-page';
import ScorecardPage from '@/components/scorecard-page';
import AdminOverview from '@/components/admin-overview';
import AdminClientDetail from '@/components/admin-client-detail';
import AdminOperations from '@/components/admin-operations';
import AdminDocs from '@/components/admin-docs';
import AdminSalesPlaybook from '@/components/admin-sales-playbook';

export default function Home() {
  const { isAuthenticated, isLoading, user } = useAuth();
  const [mode, setMode] = useState<AppMode>('client');
  const [activePage, setActivePage] = useState<string>('overview');
  const [selectedLeadId, setSelectedLeadId] = useState<string | null>(null);
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (isAuthenticated && params.get('demo') === 'admin') {
      setMode('admin');
      setActivePage('admin-overview');
      setSelectedLeadId(null);
      setSelectedClientId(null);
    }
  }, [isAuthenticated]);

  // Show nothing while checking for an existing session cookie
  if (isLoading) {
    return (
      <div className="min-h-dvh flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <SignIn />;
  }

  // Only admins can access admin mode
  const isAdmin = user?.role === 'admin';

  const handleModeChange = (newMode: AppMode) => {
    setMode(newMode);
    setSelectedLeadId(null);
    setSelectedClientId(null);
    if (newMode === 'admin') {
      setActivePage('admin-overview');
    } else {
      setActivePage('overview');
    }
  };

  const handleViewLead = (id: string) => {
    setSelectedLeadId(id);
    setActivePage('leads');
  };

  const handleBackFromLead = () => {
    setSelectedLeadId(null);
  };

  const handleViewClient = (id: string) => {
    setSelectedClientId(id);
  };

  const handleBackFromClient = () => {
    setSelectedClientId(null);
  };

  const handleNavigate = (page: string) => {
    setActivePage(page);
    setSelectedLeadId(null);
    setSelectedClientId(null);
  };

  const renderContent = () => {
    // Admin mode
    if (mode === 'admin') {
      if (selectedClientId) {
        return <AdminClientDetail clientId={selectedClientId} onBack={handleBackFromClient} />;
      }
      if (activePage === 'admin-operations') {
        return <AdminOperations />;
      }
      if (activePage === 'admin-sales-playbook') {
        return <AdminSalesPlaybook />;
      }
      if (activePage === 'admin-docs') {
        return <AdminDocs />;
      }
      return <AdminOverview onViewClient={handleViewClient} />;
    }

    // Client mode
    if (activePage === 'leads' && selectedLeadId) {
      return <LeadDetail leadId={selectedLeadId} onBack={handleBackFromLead} />;
    }
    if (activePage === 'leads') return <LeadsPage onViewLead={handleViewLead} />;
    if (activePage === 'alerts') return <AlertsPage onViewLead={handleViewLead} />;
    if (activePage === 'scorecard') return <ScorecardPage />;
    return <OverviewPage onViewLead={handleViewLead} />;
  };

  return (
    <DashboardShell
      mode={mode}
      onModeChange={handleModeChange}
      activePage={activePage}
      onNavigate={handleNavigate}
    >
      {renderContent()}
    </DashboardShell>
  );
}
